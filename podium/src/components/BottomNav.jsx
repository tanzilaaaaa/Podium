import { useNavigate, useLocation } from 'react-router-dom'
import { Home, BarChart2, Award, User } from 'lucide-react'
import { useTheme, tokens } from '../context/ThemeContext'

const TABS = [
  { path: '/home',     icon: Home,     label: 'Home'     },
  { path: '/progress', icon: BarChart2, label: 'Progress' },
  { path: '/badges',   icon: Award,    label: 'Badges'   },
  { path: '/profile',  icon: User,     label: 'Profile'  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { theme } = useTheme()
  const t = tokens(theme)

  const hide = ['/', '/auth', '/record', '/results', '/onboarding', '/paywall', '/seed']
    .some(p => pathname === p || pathname.startsWith('/auth'))
  if (hide) return null

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: t.navBg,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: `1px solid ${t.border}`,
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 0', maxWidth: 480, margin: '0 auto',
      }}>
        {TABS.map(({ path, icon: Icon, label }) => {
          const active = pathname === path
          return (
            <button key={path} onClick={() => navigate(path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 20px', background: 'none', border: 'none', cursor: 'pointer',
                minWidth: 60,
              }}
            >
              <Icon
                size={21}
                color={active ? t.accent : t.textTer}
                strokeWidth={active ? 2.5 : 1.8}
              />
              {active && (
                <div style={{
                  width: 3, height: 3, borderRadius: '50%',
                  background: t.accent, marginTop: -1,
                }} />
              )}
              <span style={{
                color: active ? t.accent : t.textTer,
                fontSize: 10, fontWeight: active ? 600 : 400,
              }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
