import { create } from 'zustand';

type Role = 'admin' | 'editor' | 'reviewer' | 'author' | null;

// Permission map — what each role can do
const PERMISSIONS: Record<NonNullable<Role>, string[]> = {
    admin: [
        'manage:users',
        'manage:settings',
        'view:submissions',
        'manage:submissions',
        'assign:reviewers',
        'assign:editors',
        'publish:papers',
        'manage:payments',
        'view:payments',
        'view:messages',
        'view:applications',
        'manage:applications',
        'view:reviews',
        'manage:reviews',
    ],
    editor: [
        'view:submissions',
        'manage:submissions',
        'assign:reviewers',
        'view:messages',
        'view:applications',
        'manage:applications',
        'view:reviews',
        'publish:papers',
    ],
    reviewer: [
        'view:reviews',
        'manage:reviews',
    ],
    author: [
        'view:submissions',
        'submit:paper',
        'resubmit:paper',
        'view:payments',
    ],
};

interface RolesState {
    role: Role;
    setRole: (role: Role) => void;
    can: (permission: string) => boolean;
    isAtLeast: (minRole: NonNullable<Role>) => boolean;
}

const ROLE_RANK: Record<NonNullable<Role>, number> = {
    author: 0,
    reviewer: 1,
    editor: 2,
    admin: 3,
};

export const useRolesStore = create<RolesState>((set, get) => ({
    role: null,

    setRole: (role) => set({ role }),

    can: (permission) => {
        const { role } = get();
        if (!role) return false;
        return PERMISSIONS[role]?.includes(permission) ?? false;
    },

    isAtLeast: (minRole) => {
        const { role } = get();
        if (!role) return false;
        return ROLE_RANK[role] >= ROLE_RANK[minRole];
    },
}));
