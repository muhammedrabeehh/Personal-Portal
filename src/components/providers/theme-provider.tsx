'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => { },
})

export function useTheme() {
    return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('discipline-theme') as Theme | null
        const initial = stored || 'dark'
        setTheme(initial)
        document.documentElement.classList.toggle('dark', initial === 'dark')
        setMounted(true)
    }, [])

    function toggleTheme() {
        const next: Theme = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        localStorage.setItem('discipline-theme', next)
        document.documentElement.classList.toggle('dark', next === 'dark')
    }

    // Prevent flash
    if (!mounted) {
        return (
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            var t = localStorage.getItem('discipline-theme') || 'dark';
                            if (t === 'dark') document.documentElement.classList.add('dark');
                        })();
                    `,
                }}
            />
        )
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
