// src/components/auth/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { C, Spinner } from '../shared/UI';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password);
    if (!result.success) setError(result.error || 'Login failed. Please try again.');
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.bgCircle1} />
      <div style={s.bgCircle2} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <img src="/salem-logo.png" alt="Salem Logo" style={s.logo} />
        </div>

        {/* Church name */}
        <h1 style={s.churchName}>Salem International<br />Christian Centre</h1>
        <div style={s.goldBar} />
        <p style={s.portalTag}>Internal Administrative Portal</p>

        {/* Form */}
        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.fieldWrap}>
            <label style={s.label}>Email Address</label>
            <div style={s.inputRow}>
              <Mail size={15} color={C.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@sicc.org"
                style={s.input}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Password</label>
            <div style={s.inputRow}>
              <Lock size={15} color={C.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ ...s.input, paddingRight: 42 }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={s.eyeBtn}
              >
                {showPass ? <EyeOff size={15} color={C.textMuted} /> : <Eye size={15} color={C.textMuted} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={s.errorBox}>{error}</div>
          )}

          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Spinner size={16} color="#fff" /> Signing in...</span>
              : 'Sign In to Dashboard'
            }
          </button>
        </form>

        <p style={s.helpText}>Authorized personnel only · Contact Admin for access issues</p>

        <div style={s.footer}>
          <span>Salem Int'l Christian Centre</span>
          <span>SICC Admin v3.0</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#022a67',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute', top: '-10%', right: '-5%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(12,27,58,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'absolute', bottom: '-10%', left: '-5%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1,
    width: '100%', maxWidth: 400,
    background: '#fff',
    borderRadius: 20,
    padding: '36px 36px 28px',
    border: `0.5px solid ${C.border}`,
    boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoWrap: {
    marginBottom: 16,
  },
  logo: {
    width: 96,
    height: 96,
    objectFit: 'contain',
    borderRadius: 16,
    filter: 'drop-shadow(0 4px 16px rgba(201,168,76,0.2))',
  },
  churchName: {
    margin: '0 0 12px',
    fontSize: 19,
    fontWeight: 600,
    color: C.navy,
    lineHeight: 1.35,
    textAlign: 'center',
  },
  goldBar: {
    width: 36,
    height: 2,
    background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
    borderRadius: 2,
    marginBottom: 10,
  },
  portalTag: {
    margin: '0 0 24px',
    fontSize: 11,
    color: C.textMuted,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    marginBottom: 18,
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: C.textSecondary,
  },
  inputRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '11px 12px 11px 36px',
    background: C.inputBg,
    border: `1px solid ${C.border}`,
    borderRadius: 9,
    color: C.textPrimary,
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 4,
  },
  errorBox: {
    padding: '10px 14px',
    background: '#FFEBEE',
    border: '1px solid #FFCDD2',
    borderRadius: 8,
    color: C.danger,
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box',
  },
  submitBtn: {
    padding: '13px',
    background: C.navy,
    border: 'none',
    borderRadius: 9,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(12,27,58,0.2)',
    transition: 'opacity 0.15s',
    width: '100%',
  },
  helpText: {
    textAlign: 'center',
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 1.5,
    margin: 0,
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: `0.5px solid ${C.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: C.textMuted,
    width: '100%',
  },
};
