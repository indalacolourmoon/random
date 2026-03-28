import {
    LayoutDashboard,
    FileStack,
    ShieldAlert,
    BookOpen,
    CreditCard,
    MessageSquare,
    Users,
    Settings,
    UserCog,
    FileText
} from 'lucide-react';
import React from 'react';

interface NavigationItem {
    name: string;
    icon: React.ReactNode;
    href: string; // Relative to role, e.g., 'submissions'
    roles: string[];
    labelOverrides?: Record<string, string>;
}

export const sidebarItems: NavigationItem[] = [
    {
        name: 'Dashboard',
        icon: <LayoutDashboard />,
        href: '', // Base dashboard for the role
        roles: ['admin', 'editor', 'reviewer'],
        labelOverrides: {
            'reviewer': 'My Assignments',
            'editor': 'Editorial Hub',
        }
    },
    { name: 'Submissions', icon: <FileStack />, href: 'submissions', roles: ['admin', 'editor'] },
    { name: 'Publications', icon: <BookOpen />, href: 'publications', roles: ['admin', 'editor'] },
    { name: 'Peer Review', icon: <ShieldAlert />, href: 'reviews', roles: ['admin', 'editor', 'reviewer'] },
    { name: 'Payments', icon: <CreditCard />, href: 'payments', roles: ['admin'] },
    { name: 'Messages', icon: <MessageSquare />, href: 'messages', roles: ['admin', 'editor'] },
    { name: 'Users & Roles', icon: <Users />, href: 'users', roles: ['admin'] },
    { name: 'Manage Applications', icon: <FileText />, href: 'applications', roles: ['admin', 'editor'] },
    { name: 'Account Profile', icon: <UserCog />, href: 'profile', roles: ['admin', 'editor', 'reviewer'] },
    { name: 'System Settings', icon: <Settings />, href: 'settings', roles: ['admin'] },
];

export function getFullHref(item: NavigationItem, role: string) {
    const base = `/${role}`;
    if (!item.href) return base;
    return `${base}/${item.href}`;
}
