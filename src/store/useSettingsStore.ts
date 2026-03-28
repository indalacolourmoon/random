import { create } from 'zustand';

interface SettingsState {
    settings: Record<string, string>;
    setSettings: (settings: Record<string, string>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    settings: {},
    setSettings: (settings) => set({ settings }),
}));
