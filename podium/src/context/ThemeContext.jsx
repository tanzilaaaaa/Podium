import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('podium-theme') || 'dark'
  })

  useEffect(() => {
    localStorage.setItem('podium-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function toggle() {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

// ─── Token helpers ────────────────────────────────────────────────────────────
// Call t(theme) anywhere to get the right tokens

export function tokens(theme) {
  const dark = theme === 'dark'
  return {
    bg:          dark ? '#0d0d1a'                    : '#f5f5f7',
    bgCard:      dark ? 'rgba(255,255,255,0.05)'     : '#ffffff',
    bgCardHover: dark ? 'rgba(255,255,255,0.08)'     : '#f9f9fb',
    border:      dark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.08)',
    borderHover: dark ? 'rgba(167,139,250,0.4)'      : 'rgba(68,34,204,0.3)',
    text:        dark ? '#ffffff'                    : '#0d0d1a',
    textSec:     dark ? 'rgba(255,255,255,0.45)'     : 'rgba(0,0,0,0.45)',
    textTer:     dark ? 'rgba(255,255,255,0.25)'     : 'rgba(0,0,0,0.25)',
    accent:      '#6644ee',
    accentLight: '#a78bfa',
    accentBg:    dark ? 'rgba(102,68,238,0.15)'      : 'rgba(102,68,238,0.08)',
    accentBorder:dark ? 'rgba(102,68,238,0.3)'       : 'rgba(102,68,238,0.25)',
    navBg:       dark ? 'rgba(13,13,26,0.96)'        : 'rgba(255,255,255,0.96)',
    inputBg:     dark ? 'rgba(255,255,255,0.06)'     : '#ffffff',
    inputBorder: dark ? 'rgba(255,255,255,0.1)'      : 'rgba(0,0,0,0.15)',
    shadow:      dark ? '0 8px 32px rgba(0,0,0,0.4)': '0 8px 32px rgba(0,0,0,0.1)',
  }
}
