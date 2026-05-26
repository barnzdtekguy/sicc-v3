// src/components/shared/UI.jsx
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export const C = {
  gold: '#C9A84C', goldLight: '#E8C96A', goldDark: '#A07828',
  navy: '#0C1B3A', navyLight: '#162847', blue: '#185FA5',
  blueLight: '#E6F1FB', pageBg: '#F0F2F5', cardBg: '#FFFFFF',
  sidebarBg: '#0C1B3A', headerBg: '#FFFFFF', inputBg: '#F8F9FA',
  textPrimary: '#0D1B2A', textSecondary: '#546E7A', textMuted: '#90A4AE',
  border: '#E0E4E8', borderStrong: '#B0BEC5',
  success: '#2E7D32', successBg: '#EAF3DE',
  warning: '#E65100', warningBg: '#FFF3E0',
  danger: '#C62828', dangerBg: '#FFEBEE',
  info: '#185FA5', infoBg: '#E6F1FB',
  purple: '#6A1B9A', purpleBg: '#F3E5F5',
};

export function StatCard({ label, value, sub, icon, color = C.blue, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C.cardBg, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', cursor: onClick ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '12px 12px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 4 }}>
        <div>
          <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 500, color: C.textPrimary, lineHeight: 1 }}>{value ?? '—'}</div>
          {sub && <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color }}>{icon}</div>
      </div>
    </div>
  );
}

export function Panel({ children, title, action, style: s }) {
  return (
    <div style={{ background: C.cardBg, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '18px 20px', ...s }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: `0.5px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 14, background: C.gold, borderRadius: 2 }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 14, background: C.gold, borderRadius: 2 }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{children}</span>
      </div>
      {action}
    </div>
  );
}

export function Badge({ label, color = C.blue, bg }) {
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: bg || `${color}18`, color, fontSize: 11, fontWeight: 500, border: `0.5px solid ${color}30`, whiteSpace: 'nowrap' }}>{label}</span>;
}

export function StatusBadge({ status }) {
  const map = {
    'New Convert': { color: C.blue, bg: C.blueLight },
    'Active Member': { color: C.success, bg: C.successBg },
    'Worker': { color: C.gold, bg: '#FDF6E7' },
    'Evangelism Contact': { color: C.danger, bg: C.dangerBg },
    'Completed': { color: C.success, bg: C.successBg },
    'In Progress': { color: C.warning, bg: C.warningBg },
    'No Response': { color: C.danger, bg: C.dangerBg },
    'Active': { color: C.success, bg: C.successBg },
  };
  const s = map[status] || { color: C.textSecondary, bg: C.pageBg };
  return <Badge label={status} color={s.color} bg={s.bg} />;
}

export function Btn({ children, onClick, color = C.blue, variant = 'solid', size = 'md', disabled, type = 'button' }) {
  const pad = size === 'sm' ? '6px 12px' : size === 'lg' ? '13px 28px' : '9px 18px';
  const fs = size === 'sm' ? 12 : size === 'lg' ? 14 : 13;
  const base = { padding: pad, borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: fs, fontWeight: 500, fontFamily: 'inherit', opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', border: `1px solid ${color}` };
  const variants = {
    solid: { ...base, background: color, color: color === C.gold ? C.navy : '#fff' },
    outline: { ...base, background: 'transparent', color },
    ghost: { ...base, background: `${color}12`, color, border: `1px solid ${color}20` },
  };
  return <button type={type} style={variants[variant] || variants.solid} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function Input({ label, value, onChange, type = 'text', placeholder, required, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary }}>{label}{required && <span style={{ color: C.danger, marginLeft: 2 }}>*</span>}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} style={{ width: '100%', padding: '10px 12px', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPrimary, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      {hint && <span style={{ fontSize: 11, color: C.textMuted }}>{hint}</span>}
    </div>
  );
}

export function Select({ label, value, onChange, options, required, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary }}>{label}{required && <span style={{ color: C.danger, marginLeft: 2 }}>*</span>}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} required={required} style={{ padding: '10px 12px', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, color: value ? C.textPrimary : C.textMuted, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
        <option value="">— Select —</option>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
      {hint && <span style={{ fontSize: 11, color: C.textMuted }}>{hint}</span>}
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 4, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary }}>{label}{required && <span style={{ color: C.danger, marginLeft: 2 }}>*</span>}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} required={required} style={{ padding: '10px 12px', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPrimary, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }} />
    </div>
  );
}

export function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,27,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, backdropFilter: 'blur(4px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.cardBg, border: `0.5px solid ${C.border}`, borderRadius: 14, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `0.5px solid ${C.border}`, position: 'sticky', top: 0, background: C.cardBg, zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 16, background: C.gold, borderRadius: 2 }} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: C.textPrimary }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ background: C.pageBg, border: `0.5px solid ${C.border}`, color: C.textSecondary, borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}

export function DataTable({ columns, rows, emptyText = 'No records found', onRowClick }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: C.pageBg }}>
            {columns.map(c => <th key={c.key} style={{ padding: '9px 12px', textAlign: 'left', color: C.textMuted, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap', borderBottom: `1px solid ${C.border}` }}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: C.textMuted }}>{emptyText}</td></tr>
            : rows.map((row, i) => (
              <tr key={i} onClick={() => onRowClick && onRowClick(row)} style={{ borderBottom: `0.5px solid ${C.border}`, cursor: onRowClick ? 'pointer' : 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = C.pageBg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {columns.map(c => <td key={c.key} style={{ padding: '11px 12px', color: C.textPrimary, verticalAlign: 'middle' }}>{c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}</td>)}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export function Avatar({ initials, color = C.blue, size = 38 }) {
  return <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.26), background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 500, color, flexShrink: 0 }}>{initials}</div>;
}

export function InfoRow({ icon, label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: `0.5px solid ${C.border}` }}>
      <span style={{ color: C.textMuted, marginTop: 1, flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: color || C.textPrimary, fontWeight: 500 }}>{value || '—'}</div>
      </div>
    </div>
  );
}

export function ActivityFeed({ items, limit = 10 }) {
  if (!items?.length) return <div style={{ color: C.textMuted, fontSize: 13, padding: '16px 0', textAlign: 'center' }}>No recent activity.</div>;
  return (
    <div>
      {items.slice(0, limit).map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: `0.5px solid ${C.border}` }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.gold, marginTop: 5, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: C.textPrimary }}><strong style={{ fontWeight: 500 }}>{item.user_name}</strong><span style={{ color: C.textSecondary }}> — {item.action}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 12, color: C.textMuted }}>{item.detail}</span>
              <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 12 }}>{new Date(item.created_at).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, display: 'flex' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '9px 12px 9px 34px', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPrimary, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
    </div>
  );
}

export function FilterSelect({ value, onChange, options, placeholder = 'Filter...' }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: '9px 12px', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPrimary, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  );
}

export function Grid({ children, cols = 'repeat(auto-fit, minmax(200px, 1fr))', gap = 14 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: cols, gap }}>{children}</div>;
}

export function Alert({ type = 'info', message, onDismiss }) {
  const map = {
    info:    { bg: C.infoBg,    color: C.info,    border: '#B5D4F4', Icon: Info },
    success: { bg: C.successBg, color: C.success, border: '#C0DD97', Icon: CheckCircle },
    warning: { bg: C.warningBg, color: C.warning, border: '#FAC775', Icon: AlertCircle },
    danger:  { bg: C.dangerBg,  color: C.danger,  border: '#F7C1C1', Icon: XCircle },
  };
  const s = map[type] || map.info;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 9, color: s.color, fontSize: 13 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><s.Icon size={15} /> {message}</span>
      {onDismiss && <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: s.color, cursor: 'pointer', display: 'flex' }}><X size={14} /></button>}
    </div>
  );
}

export function Spinner({ size = 20, color = C.blue }) {
  return <div style={{ width: size, height: size, border: `2px solid ${color}30`, borderTop: `2px solid ${color}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />;
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 10, textAlign: 'center' }}>
      <div style={{ color: C.textMuted, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: C.textPrimary }}>{title}</div>
      {description && <div style={{ fontSize: 13, color: C.textSecondary, maxWidth: 300 }}>{description}</div>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
