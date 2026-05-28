// src/components/auth/LoginPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { C, Spinner } from '../shared/UI';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

// ── Animated Canvas Background ──────────────────────────────
function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', resize);

    // Nodes — look like data points on a network
    const NODE_COUNT = 55;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2.5 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Floating data labels
    const labels = [
      'Members', 'KDF Areas', 'Follow-Up', 'Reports',
      'Attendance', 'Departments', 'Coordinators', 'Pastors',
      'Dashboard', 'Analytics', 'Communication', 'Activity',
    ];
    const floaters = Array.from({ length: 10 }, (_, i) => ({
      label: labels[i % labels.length],
      x: Math.random() * W,
      y: Math.random() * H,
      vy: -(Math.random() * 0.3 + 0.1),
      alpha: Math.random() * 0.3 + 0.1,
      size: Math.random() * 4 + 10,
    }));

    let t = 0;

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#060D1F');
      grad.addColorStop(0.5, '#0C1B3A');
      grad.addColorStop(1, '#0D2657');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(201,168,76,0.04)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Move and draw nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.04;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        const pulseR = n.r + Math.sin(n.pulse) * 1.2;

        // Outer glow
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pulseR * 6);
        glow.addColorStop(0, 'rgba(201,168,76,0.15)');
        glow.addColorStop(1, 'rgba(201,168,76,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseR * 6, 0, Math.PI * 2);
        ctx.fill();

        // Node dot
        ctx.fillStyle = 'rgba(201,168,76,0.7)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between nearby nodes
      const MAX_DIST = 130;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.25;
            ctx.strokeStyle = `rgba(24,95,165,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Floating data labels
      floaters.forEach(f => {
        f.y += f.vy;
        if (f.y < -30) { f.y = H + 20; f.x = Math.random() * W; }
        ctx.font = `${f.size}px 'Segoe UI', system-ui`;
        ctx.fillStyle = `rgba(201,168,76,${f.alpha})`;
        ctx.fillText(f.label, f.x, f.y);
      });

      // Slow moving blue orb
      const orbX = W * 0.75 + Math.sin(t * 0.4) * 120;
      const orbY = H * 0.3 + Math.cos(t * 0.3) * 80;
      const orb = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, 200);
      orb.addColorStop(0, 'rgba(24,95,165,0.12)');
      orb.addColorStop(1, 'rgba(24,95,165,0)');
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 200, 0, Math.PI * 2);
      ctx.fill();

      // Gold orb bottom left
      const orb2X = W * 0.15 + Math.cos(t * 0.35) * 80;
      const orb2Y = H * 0.75 + Math.sin(t * 0.4) * 60;
      const orb2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 160);
      orb2.addColorStop(0, 'rgba(201,168,76,0.1)');
      orb2.addColorStop(1, 'rgba(201,168,76,0)');
      ctx.fillStyle = orb2;
      ctx.beginPath();
      ctx.arc(orb2X, orb2Y, 160, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, display: 'block' }}
    />
  );
}

// ── Login Page ───────────────────────────────────────────────
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
      <AnimatedBackground />

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
              <Mail size={15} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
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
              <Lock size={15} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ ...s.input, paddingRight: 42 }}
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={s.eyeBtn}>
                {showPass ? <EyeOff size={15} color="rgba(255,255,255,0.4)" /> : <Eye size={15} color="rgba(255,255,255,0.4)" />}
              </button>
            </div>
          </div>

          {error && (
            <div style={s.errorBox}>{error}</div>
          )}

          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Spinner size={16} color="#0C1B3A" /> Signing in...
                </span>
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
    background: '#060D1F',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 400,
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: 20,
    padding: '36px 36px 28px',
    border: '1px solid rgba(201,168,76,0.2)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoWrap: { marginBottom: 16 },
  logo: {
    width: 96, height: 96, objectFit: 'contain', borderRadius: 16,
    filter: 'drop-shadow(0 4px 20px rgba(201,168,76,0.4))',
  },
  churchName: {
    margin: '0 0 12px', fontSize: 19, fontWeight: 600,
    color: '#FFFFFF', lineHeight: 1.35, textAlign: 'center',
  },
  goldBar: {
    width: 36, height: 2,
    background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
    borderRadius: 2, marginBottom: 10,
  },
  portalTag: {
    margin: '0 0 24px', fontSize: 11,
    color: 'rgba(201,168,76,0.7)',
    letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  form: {
    display: 'flex', flexDirection: 'column',
    gap: 16, width: '100%', marginBottom: 18,
  },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6, width: '100%' },
  label: { fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)' },
  inputRow: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' },
  input: {
    width: '100%', padding: '12px 12px 12px 36px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(201,168,76,0.25)',
    borderRadius: 9, color: '#FFFFFF',
    fontSize: 13, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  eyeBtn: {
    position: 'absolute', right: 10,
    background: 'transparent', border: 'none',
    cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4,
  },
  errorBox: {
    padding: '10px 14px',
    background: 'rgba(198,40,40,0.2)',
    border: '1px solid rgba(198,40,40,0.4)',
    borderRadius: 8, color: '#FF8A80',
    fontSize: 13, width: '100%', boxSizing: 'border-box',
  },
  submitBtn: {
    padding: '13px', width: '100%',
    background: 'linear-gradient(135deg, #C9A84C, #A07828)',
    border: 'none', borderRadius: 9,
    color: '#0C1B3A', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
    transition: 'opacity 0.15s',
    letterSpacing: '0.02em',
  },
  helpText: {
    textAlign: 'center', fontSize: 12,
    color: 'rgba(255,255,255,0.3)', lineHeight: 1.5, margin: 0,
  },
  footer: {
    marginTop: 20, paddingTop: 16,
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', justifyContent: 'space-between',
    fontSize: 11, color: 'rgba(255,255,255,0.25)', width: '100%',
  },
};

