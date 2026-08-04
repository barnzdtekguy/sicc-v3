// src/components/auth/LoginPage.jsx
import { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { C, Spinner, Modal } from '../shared/UI';
import { Mail, Lock, Eye, EyeOff, AlertCircle, UserRound, ArrowRight, Shield, MessageSquare } from 'lucide-react';

const tabs = [
  { key: 'email', label: 'Email', placeholder: 'Enter your email address' },
  { key: 'username', label: 'Username', placeholder: 'Enter your username' },
];

export default function LoginPage({ onBack }) {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [identifierType, setIdentifierType] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: '', email: '', reason: '' });
  const [requestMessage, setRequestMessage] = useState('');

  const activeTab = useMemo(() => tabs.find(tab => tab.key === identifierType) || tabs[0], [identifierType]);
  const identifierReady = identifierType === 'email'
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())
    : identifier.trim().length >= 3;

  const getLoginError = (rawError) => {
    const message = String(rawError || '').toLowerCase();

    if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
      return 'Incorrect username/email or password. Please check your credentials and try again.';
    }

    if (message.includes('user not found') || message.includes('not found')) {
      return 'We could not find this account. Please request access from Admin.';
    }

    return rawError || 'Login failed. Please try again.';
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(`Please enter your ${activeTab.label.toLowerCase()}.`);
      return;
    }

    if (!identifierReady) {
      setError(identifierType === 'email' ? 'Enter a valid email address.' : 'Username must be at least 3 characters.');
      return;
    }

    setError('');
    setStep(2);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const result = await login(identifier.trim(), password, identifierType);
      if (!result.success) {
        setError(getLoginError(result.error));
      }
    } catch (err) {
      setError(getLoginError(err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStepOne = () => {
    setError('');
    setPassword('');
    setStep(1);
  };

  const handlePasswordResetRequest = () => {
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      setError('Enter your email or username before requesting a password reset.');
      return;
    }

    const subject = encodeURIComponent('Password Reset Notification');
    const body = encodeURIComponent(
      `A user has requested a password reset for the SICC Admin portal.\n\nIdentifier: ${trimmedIdentifier}\nRequested via: ${identifierType === 'email' ? 'Email' : 'Username'}\n\nPlease assist with account recovery.`
    );

    window.location.href = `mailto:admin@sicc.org?subject=${subject}&body=${body}`;
    setRequestMessage('The admin team has been notified about your password reset request.');
    setError('');
  };

  const handleRequestAccess = (e) => {
    e.preventDefault();
    if (!requestForm.name.trim() || !requestForm.email.trim() || !requestForm.reason.trim()) {
      setRequestMessage('Please complete all fields before requesting access.');
      return;
    }

    const subject = encodeURIComponent('Admin Access Request');
    const body = encodeURIComponent(
      `Name: ${requestForm.name}\nEmail: ${requestForm.email}\nReason: ${requestForm.reason}`
    );

    window.location.href = `mailto:admin@sicc.org?subject=${subject}&body=${body}`;
    setRequestMessage('Your access request has been prepared. Please send the email to the admin team.');
    setRequestForm({ name: '', email: '', reason: '' });
  };

  return (
    <div style={s.page}>
      <div style={s.bgPattern} />
      <div style={s.cardWrap}>
        <div style={s.card}>
          <div style={s.logoWrap}>
            <img src="/salem-logo.png" alt="Salem Logo" style={s.logo} />
          </div>

          <h1 style={s.heading}>{step === 1 ? 'Log In to SICC Admin' : 'Enter your Password'}</h1>
          <div style={s.goldBar} />
          <p style={s.tagline}>Internal Administrative Portal</p>

          {step === 1 ? (
            <form onSubmit={handleNext} style={s.form}>
              <div style={s.tabRow}>
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setIdentifierType(tab.key);
                      setIdentifier('');
                      setError('');
                    }}
                    style={{
                      ...s.tabBtn,
                      color: identifierType === tab.key ? C.navy : C.textMuted,
                      borderBottom: identifierType === tab.key ? `2px solid ${C.gold}` : `2px solid transparent`,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={s.fieldWrap}>
                <div style={s.inputRow}>
                  <UserRound size={16} color={C.textMuted} style={s.iconLeft} />
                  <input
                    type={identifierType === 'email' ? 'email' : 'text'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={activeTab.placeholder}
                    style={{ ...s.input, paddingLeft: 38 }}
                    autoComplete={identifierType === 'email' ? 'email' : 'username'}
                    minLength={identifierType === 'username' ? 3 : undefined}
                    aria-label={activeTab.label}
                  />
                </div>
                {error && <div style={s.inlineError}><AlertCircle size={14} />{error}</div>}
              </div>

              <button type="submit" style={{ ...s.primaryBtn, ...(identifierReady ? {} : s.primaryBtnDisabled) }} disabled={!identifierReady || loading}>
                {loading ? <span style={s.inlineSpinner}><Spinner size={15} color="#fff" /> Please wait...</span> : <span style={s.inlineSpinner}><span>Next</span><ArrowRight size={16} /></span>}
              </button>

              <div style={s.secondaryLinks}>
                <button type="button" onClick={handlePasswordResetRequest} style={s.textAction}><Shield size={14} /> Forget Password?</button>
                <span style={s.linkDivider} />
                <button type="button" onClick={() => setShowRequestModal(true)} style={s.textAction}><MessageSquare size={14} /> Contact Admin</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} style={s.form}>
              <div style={s.recallBox}>
                <div style={s.recallLabel}>Signed in as</div>
                <div style={s.recallValueRow}>
                  <span style={s.recallValue}>{identifier}</span>
                  <button type="button" onClick={handleBackToStepOne} style={s.changeLink}>Edit</button>
                </div>
              </div>

              <div style={s.fieldWrap}>
                <div style={s.inputRow}>
                  <Lock size={16} color={C.textMuted} style={s.iconLeft} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ ...s.input, paddingLeft: 38, paddingRight: 40 }}
                    autoComplete="current-password"
                    aria-label="Password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={s.eyeBtn}>
                    {showPass ? <EyeOff size={16} color={C.textMuted} /> : <Eye size={16} color={C.textMuted} />}
                  </button>
                </div>
                <div style={s.inlineRow}>
                  <label style={s.checkboxWrap}>
                    <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                    <span>Remember me</span>
                  </label>
                  <button type="button" onClick={handlePasswordResetRequest} style={s.forgotLink}>Forgot Password?</button>
                </div>
                {error && <div style={s.inlineError}><AlertCircle size={14} />{error}</div>}
              </div>

              <button type="submit" style={{ ...s.primaryBtn, ...(password.trim() ? {} : s.primaryBtnDisabled) }} disabled={!password.trim() || loading}>
                {loading ? <span style={s.inlineSpinner}><Spinner size={15} color="#fff" /> Signing in...</span> : 'Log In'}
              </button>
            </form>
          )}

          <div style={s.footerBar}>
            <span style={s.footerText}>New here? <button type="button" onClick={() => setShowRequestModal(true)} style={s.footerLink}>Request Access from Admin</button></span>
          </div>

          {requestMessage && <div style={s.requestNote}>{requestMessage}</div>}
        </div>
      </div>

      {showRequestModal && (
        <Modal title="Request Access" onClose={() => setShowRequestModal(false)} width={480}>
          <form onSubmit={handleRequestAccess} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={s.label}>Full name</label>
              <input type="text" value={requestForm.name} onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })} placeholder="Your full name" style={s.modalInput} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={s.label}>Email</label>
              <input type="email" value={requestForm.email} onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })} placeholder="name@example.com" style={s.modalInput} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={s.label}>Reason for access</label>
              <textarea rows={4} value={requestForm.reason} onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })} placeholder="Briefly explain why you need internal access." style={s.modalTextarea} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 4 }}>
              <button type="button" onClick={() => setShowRequestModal(false)} style={s.modalCancelBtn}>Cancel</button>
              <button type="submit" style={s.primaryBtn}>Send Request</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #F5F7FB 0%, #EEF2F7 100%)',
    padding: 20,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  bgPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at top left, rgba(12,27,58,0.1), transparent 28%), radial-gradient(circle at bottom right, rgba(201,168,76,0.12), transparent 28%)',
    pointerEvents: 'none',
  },
  cardWrap: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 430,
  },
  card: {
    background: '#ffffff',
    borderRadius: 24,
    boxShadow: '0 20px 60px rgba(12, 27, 58, 0.14)',
    padding: '28px 24px 18px',
    border: `1px solid ${C.border}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  logoWrap: {
    width: 82,
    height: 82,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    background: `${C.navy}08`,
    marginBottom: 12,
  },
  logo: {
    width: 62,
    height: 62,
    objectFit: 'contain',
  },
  heading: {
    margin: '0 0 6px',
    fontSize: 24,
    lineHeight: 1.25,
    textAlign: 'center',
    color: C.navy,
    fontWeight: 700,
  },
  goldBar: {
    width: 42,
    height: 4,
    borderRadius: 999,
    background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
    marginBottom: 10,
  },
  tagline: {
    margin: '0 0 24px',
    color: C.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  tabRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    background: C.pageBg,
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    minHeight: 44,
    border: 'none',
    background: 'transparent',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  inputRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  iconLeft: {
    position: 'absolute',
    left: 12,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    minHeight: 46,
    padding: '11px 12px 11px 38px',
    background: C.inputBg,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    color: C.textPrimary,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    width: '100%',
    minHeight: 46,
    border: 'none',
    borderRadius: 12,
    background: C.navy,
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 10px 22px rgba(12, 27, 58, 0.16)',
    transition: 'transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease',
  },
  primaryBtnDisabled: {
    background: '#D6DCE3',
    color: '#688093',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  inlineSpinner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  secondaryLinks: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  textAction: {
    background: 'transparent',
    border: 'none',
    color: C.navy,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 0',
  },
  linkDivider: {
    width: 1,
    height: 12,
    background: C.border,
  },
  inlineRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  checkboxWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: C.textSecondary,
  },
  forgotLink: {
    background: 'transparent',
    border: 'none',
    color: C.navy,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  inlineError: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: C.danger,
    fontSize: 12,
    lineHeight: 1.4,
    padding: '9px 12px',
    background: C.dangerBg,
    borderRadius: 10,
    border: `1px solid ${C.danger}28`,
  },
  recallBox: {
    width: '100%',
    background: '#F7F9FC',
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  recallLabel: {
    color: C.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  recallValueRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  recallValue: {
    color: C.navy,
    fontSize: 14,
    fontWeight: 600,
    wordBreak: 'break-word',
  },
  changeLink: {
    background: 'transparent',
    border: 'none',
    color: C.navy,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  footerBar: {
    width: '100%',
    marginTop: 18,
    background: '#F6F8FB',
    borderRadius: 12,
    padding: '12px 14px',
    border: `1px solid ${C.border}`,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 13,
    color: C.textSecondary,
  },
  footerLink: {
    background: 'transparent',
    border: 'none',
    color: C.navy,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  requestNote: {
    marginTop: 10,
    width: '100%',
    fontSize: 12,
    color: C.success,
    background: C.successBg,
    border: `1px solid ${C.success}28`,
    borderRadius: 10,
    padding: '10px 12px',
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: C.textSecondary,
  },
  modalInput: {
    width: '100%',
    minHeight: 44,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    background: C.inputBg,
    padding: '10px 12px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
  },
  modalTextarea: {
    width: '100%',
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    background: C.inputBg,
    padding: '10px 12px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
  },
  modalCancelBtn: {
    minWidth: 104,
    minHeight: 44,
    borderRadius: 10,
    background: 'transparent',
    border: `1px solid ${C.border}`,
    color: C.textSecondary,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 600,
  },
};
