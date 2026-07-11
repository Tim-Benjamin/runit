// src/components/BottomPillNav.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const userTabs = [
  {
    label: 'Home', path: '/dashboard',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Orders', path: '/orders',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    label: 'Shops', path: '/shops',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    label: 'Profile', path: '/profile',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const runnerTabs = [
  {
    label: 'Feed', path: '/runner/feed',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    label: 'Active', path: '/runner/active',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    label: 'Earnings', path: '/runner/earnings',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    label: 'Profile', path: '/runner/profile',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const adminTabs = [
  {
    label: 'Overview', path: '/admin',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Orders', path: '/admin/orders',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Runners', path: '/admin/runners',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: 'Settings', path: '/admin/fees',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
  label: 'Feedback', path: '/admin/feedback',
  icon: (active) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
},
{
  label: 'Announce', path: '/admin/announcements',
  icon: (active) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--runit-accent)' : 'var(--runit-muted)'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17H2a3 3 0 000 6h20v-6z" />
      <path d="M18 11V5a2 2 0 00-2-2H2" />
      <line x1="6" y1="11" x2="6" y2="17" />
    </svg>
  ),
},
];

export default function BottomPillNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = user?.role === 'runner' ? runnerTabs
    : user?.role === 'admin' ? adminTabs
      : userTabs;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      width: 'calc(100% - 32px)',
      display: 'flex',
      justifyContent: 'center',
    }}>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'rgba(15,46,41,0.85)',
        border: '0.5px solid rgba(0,201,167,0.2)',
        borderRadius: 50,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '6px 8px',
        maxWidth: 420,
        width: '100%',
        justifyContent: 'space-around',
      }}>
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '8px 16px', borderRadius: 50,
              border: 'none', cursor: 'pointer',
              background: active ? 'rgba(0,201,167,0.15)' : 'transparent',
              transition: 'background 0.2s',
              minWidth: 60,
            }}>
              {tab.icon(active)}
              <span style={{
                fontSize: 10, fontWeight: 500,
                color: active ? 'var(--runit-accent)' : 'var(--runit-muted)',
              }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}