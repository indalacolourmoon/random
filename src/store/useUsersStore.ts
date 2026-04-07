import { create } from 'zustand';
import { UserWithProfile } from '@/db/types';

interface UsersState {
    users: UserWithProfile[];
    setUsers: (users: UserWithProfile[]) => void;
    addUser: (user: UserWithProfile) => void;
    updateUser: (id: string, updates: Partial<UserWithProfile>) => void;
    removeUser: (id: string) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
    users: [],
    setUsers: (users) => set({ users }),
    addUser: (user) => set((state) => ({ users: [...state.users, user] })),
    updateUser: (id, updates) => set((state) => ({
        users: state.users.map((u) => u.id === id ? { ...u, ...updates } : u)
    })),
    removeUser: (id) => set((state) => ({
        users: state.users.filter((u) => u.id !== id)
    })),
}));
