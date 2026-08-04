"use client"

import { ConfigProvider, theme } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { themeTokens, darkThemeTokens } from "@/theme/tokens";
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeModeContext = createContext<{
    mode:"light" | "dark";
    toggle: () => void;
} | null>(null);

export function useThemeModeContext() {
    const context = useContext(ThemeModeContext);
    if (!context) {
        throw new Error("useThemeMode must be used within a ThemeProvider");
    }
    return context;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setmode] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', mode === 'dark');
    }, [mode]);

    return (
        <ThemeModeContext.Provider value={{ mode, toggle: () => setmode(mode === 'light' ? 'dark' : 'light') }}>
            <AntdRegistry>
                <ConfigProvider theme={{ 
                    algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    token: mode === 'dark' ? darkThemeTokens : themeTokens,
                    components: { Menu: { itemMarginBlock: 15 } }
                }}>
                    {children}
                </ConfigProvider>
            </AntdRegistry>
        </ThemeModeContext.Provider>
    )
}