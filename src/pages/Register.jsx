// src/pages/Register.jsx
import API_BASE from '../api/config';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--runit-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 480, position: 'relative' }}>

        {/* Mobile back to home */}
        <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 50 }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 38, height: 38, borderRadius: '50%',
            background: 'rgba(15,46,41,0.8)',
            border: '0.5px solid rgba(0,201,167,0.18)',
            backdropFilter: 'blur(10px)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--runit-accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 20, color: '#0a1f1c',
            }}>R</div>
            <span style={{ fontWeight: 700, fontSize: 22, color: 'var(--runit-text)' }}>RunIt</span>
          </Link>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
            Create your account
          </h2>
          <p style={{ color: 'var(--runit-muted)', fontSize: 14 }}>
            How do you want to use RunIt?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* User card */}
          <Link to="/register/user" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--runit-surface)', border: '1px solid var(--runit-border)',
              borderRadius: 20, padding: 24,
              display: 'flex', alignItems: 'center', gap: 20,
              cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--runit-accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--runit-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(0,201,167,0.1)', border: '1px solid var(--runit-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0,
              }}>📦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>I want deliveries</div>
                <div style={{ color: 'var(--runit-muted)', fontSize: 13, lineHeight: 1.5 }}>
                  Place orders for food, errands, and shopping. Pay cash on delivery.
                </div>
              </div>
              <div style={{ color: 'var(--runit-accent)', fontSize: 20 }}>→</div>
            </div>
          </Link>

          {/* Runner card */}
          <Link to="/register/runner" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--runit-surface)', border: '1px solid var(--runit-border)',
              borderRadius: 20, padding: 24,
              display: 'flex', alignItems: 'center', gap: 20,
              cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--runit-accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--runit-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(0,201,167,0.1)', border: '1px solid var(--runit-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0,
              }}>🏃‍♂️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>I want to earn</div>
                <div style={{ color: 'var(--runit-muted)', fontSize: 13, lineHeight: 1.5 }}>
                  Become a runner. Accept orders, deliver on campus, keep 80% of every fee.
                </div>
              </div>
              <div style={{ color: 'var(--runit-accent)', fontSize: 20 }}>→</div>
            </div>
          </Link>

        </div>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--runit-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--runit-accent)', fontWeight: 600 }}>Sign in</Link>
        </p>

      </div>
    </div>
  );
}