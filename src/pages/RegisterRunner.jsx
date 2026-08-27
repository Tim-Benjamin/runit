// src/pages/RegisterRunner.jsx
import API_BASE from '../api/config';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterRunner() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', momoNumber: '',
    deliveryMethod: 'foot', password: '', confirm: '',
  });
  const [idFile, setIdFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // src/pages/RegisterRunner.jsx — replace only handleSubmit
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (!idFile) return setError('Please upload your Ghana Card or Student ID.');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('momoNumber', form.momoNumber);
      formData.append('deliveryMethod', form.deliveryMethod);
      formData.append('password', form.password);
      formData.append('id_document', idFile);

      const res = await fetch('${API_BASE}/api/auth/register_runner.php', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        navigate('/login');
      }
    } catch {
      setError('Cannot connect to server. Make sure XAMPP is running.');
    }

    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    background: 'var(--runit-elevated)', color: 'var(--runit-text)',
    border: '1px solid var(--runit-border)', fontSize: 14, outline: 'none',
  };
  const labelStyle = { fontSize: 13, color: 'var(--runit-muted)', display: 'block', marginBottom: 6 };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--runit-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        
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

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'var(--runit-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 18, color: '#0a1f1c',
            }}>R</div>
            <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--runit-text)' }}>RunIt</span>
          </Link>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Become a Runner</h2>
          <p style={{ color: 'var(--runit-muted)', fontSize: 13 }}>Earn money delivering across UCC campus</p>
        </div>

        {/* Pending approval notice */}
        <div style={{
          background: 'rgba(0,201,167,0.07)', border: '1px solid var(--runit-border)',
          borderRadius: 14, padding: '12px 16px', marginBottom: 20,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18 }}>ℹ️</span>
          <p style={{ fontSize: 13, color: 'var(--runit-muted)', lineHeight: 1.5, margin: 0 }}>
            Your account will be reviewed by an admin before you can start accepting orders.
          </p>
        </div>

        <div style={{
          background: 'var(--runit-surface)', border: '1px solid var(--runit-border)',
          borderRadius: 24, padding: 28,
        }}>
          {error && (
            <div style={{
              background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
              borderRadius: 12, padding: '12px 16px', marginBottom: 20,
              color: '#ff8080', fontSize: 13,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Full name</label>
              <input name="name" required placeholder="Ama Asante"
                value={form.name} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email address</label>
              <input type="email" name="email" required placeholder="you@ucc.edu.gh"
                value={form.email} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Phone number</label>
              <input name="phone" required placeholder="024XXXXXXX"
                value={form.phone} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Mobile Money number (for settlements)</label>
              <input name="momoNumber" required placeholder="024XXXXXXX"
                value={form.momoNumber} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
            </div>

            {/* Delivery method */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Delivery method</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'foot', label: '🚶 On foot' },
                  { value: 'bike', label: '🚲 Bicycle' },
                  { value: 'motorbike', label: '🛵 Motorbike' },
                ].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setForm({ ...form, deliveryMethod: opt.value })}
                    style={{
                      flex: 1, padding: '10px 8px', borderRadius: 12,
                      border: '1px solid',
                      borderColor: form.deliveryMethod === opt.value ? 'var(--runit-accent)' : 'var(--runit-border)',
                      background: form.deliveryMethod === opt.value ? 'rgba(0,201,167,0.12)' : 'var(--runit-elevated)',
                      color: form.deliveryMethod === opt.value ? 'var(--runit-accent)' : 'var(--runit-muted)',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                    }}>{opt.label}</button>
                ))}
              </div>
            </div>

            {/* ID Upload */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Ghana Card or Student ID (photo/scan)</label>
              <div style={{
                border: '1px dashed var(--runit-border-strong)', borderRadius: 12,
                padding: 20, textAlign: 'center', cursor: 'pointer',
                background: 'var(--runit-elevated)',
                transition: 'border-color 0.2s',
              }}
                onClick={() => document.getElementById('id-upload').click()}
              >
                {idFile ? (
                  <div>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>✅</div>
                    <div style={{ fontSize: 13, color: 'var(--runit-accent)' }}>{idFile.name}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>📎</div>
                    <div style={{ fontSize: 13, color: 'var(--runit-muted)' }}>
                      Click to upload ID document
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginTop: 4 }}>
                      JPG, PNG or PDF
                    </div>
                  </div>
                )}
                <input id="id-upload" type="file" accept=".jpg,.jpeg,.png,.pdf"
                  style={{ display: 'none' }}
                  onChange={e => setIdFile(e.target.files[0])} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" name="password" required placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Confirm password</label>
              <input type="password" name="confirm" required placeholder="Repeat your password"
                value={form.confirm} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 50,
              background: loading ? 'var(--runit-accent-dark)' : 'var(--runit-accent)',
              color: '#0a1f1c', fontWeight: 700, fontSize: 15,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--runit-muted)' }}>
          <Link to="/register" style={{ color: 'var(--runit-muted)' }}>← Back</Link>
          {' · '}
          <Link to="/login" style={{ color: 'var(--runit-accent)', fontWeight: 600 }}>Sign in instead</Link>
        </p>

      </div>
    </div>
  );
}