'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type ThemeConfig = {
    primary: string
    // secondary: string // Optional to expose later
    radius: string
}

type ThemeContextType = {
    config: ThemeConfig
    updateTheme: (newConfig: Partial<ThemeConfig>) => void
    saveTheme: () => Promise<void>
}

const defaultTheme: ThemeConfig = {
    primary: '222.2 47.4% 11.2%', // zinc-900 equivalent
    radius: '0.5rem',
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<ThemeConfig>(defaultTheme)


    // Apply theme to CSS variables
    useEffect(() => {
        const root = document.documentElement
        root.style.setProperty('--primary', config.primary)
        root.style.setProperty('--radius', config.radius)
        // We could calculate other shades here if needed
    }, [config])

    // Load from DB on mount
    useEffect(() => {

        const loadTheme = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const user = session?.user
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('theme_config')
                    .eq('id', user.id)
                    .single()

                if (data?.theme_config) {
                    // Merge with default ensuring types
                    const loaded = data.theme_config as any
                    setConfig(prev => ({ ...prev, ...loaded }))
                }
            }
        }
        loadTheme()
    }, [])

    const updateTheme = (newConfig: Partial<ThemeConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }))
    }

    const saveTheme = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('profiles')
                .update({ theme_config: config })
                .eq('id', user.id)
        }
    }



    return (
        <ThemeContext.Provider value={{ config, updateTheme, saveTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
