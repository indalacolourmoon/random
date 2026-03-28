'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface SettingsInitializerProps {
    settings: Record<string, string>;
}

export default function SettingsInitializer({ settings }: SettingsInitializerProps) {
    const setSettings = useSettingsStore((state) => state.setSettings);

    useEffect(() => {
        setSettings(settings);
    }, [settings, setSettings]);

    return null;
}
