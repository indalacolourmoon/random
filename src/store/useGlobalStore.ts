import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GlobalState {
    // UI State
    isSidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
    
    // User State (Client-side cache)
    lastRoute: string | null;
    setLastRoute: (route: string) => void;
    
    // Notification State
    unreadNotifications: number;
    setUnreadNotifications: (count: number) => void;
    
    // Settings Cache
    journalName: string;
    setJournalName: (name: string) => void;
}

export const useGlobalStore = create<GlobalState>()(
    persist(
        (set) => ({
            isSidebarOpen: false,
            setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
            
            lastRoute: null,
            setLastRoute: (route) => set({ lastRoute: route }),
            
            unreadNotifications: 0,
            setUnreadNotifications: (count) => set({ unreadNotifications: count }),
            
            journalName: "IJITEST",
            setJournalName: (name) => set({ journalName: name }),
        }),
        {
            name: 'ijitest-global-store', // name of the item in the storage (must be unique)
        }
    )
);
