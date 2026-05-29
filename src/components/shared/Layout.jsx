// src/components/shared/Layout.jsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../../data/constants';
import { C } from './UI';
import {
  LayoutDashboard, TrendingUp, UserCog, ClipboardList, MapPin,
  Building2, Phone, Radio, BarChart2, Pin, Users, CheckSquare,
  Settings, PlusCircle, LogOut, ChevronLeft, ChevronRight, UserPlus, Star,
} from 'lucide-react';

const ICON = {
  overview:      <LayoutDashboard size={16} />,
  growth:        <TrendingUp size={16} />,
  staff:         <UserCog size={16} />,
  members:       <ClipboardList size={16} />,
  kdf:           <MapPin size={16} />,
  departments:   <Building2 size={16} />,
  followups:     <Phone size={16} />,
  communication: <Radio size={16} />,
  reports:       <BarChart2 size={16} />,
  assignments:   <Pin size={16} />,
  users:         <Users size={16} />,
  attendance:    <CheckSquare size={16} />,
  settings:      <Settings size={16} />,
  register:      <PlusCircle size={16} />,
  myMembers:     <ClipboardList size={16} />,
  followup:      <Phone size={16} />,
  deptMembers:   <Users size={16} />,
  greatness:     <Star size={16} />,
};

const NAV = {
  [ROLES.BISHOP]: [
    { key: 'overview',      label: 'Overview' },
    { key: 'growth',        label: 'Church Growth' },
    { key: 'staff',         label: 'Staff Monitor' },
    { key: 'members',       label: 'All Members' },
    { key: 'kdf',           label: 'KDF Areas' },
    { key: 'departments',   label: 'Departments' },
    { key: 'followups',     label: 'Follow-Up Reports' },
    { key: 'greatness',     label: '32 Days of Greatness' },
    { key: 'communication', label: 'Communication' },
    { key: 'reports',       label: 'Reports' },
    { key: 'assignments',   label: 'Assignments' },
  ],
  [ROLES.ADMIN]: [
    { key: 'overview',    label: 'Dashboard' },
    { key: 'users',       label: 'User Management' },
    { key: 'staff',       label: 'Staff Management' },
    { key: 'members',     label: 'All Members' },
    { key: 'departments', label: 'Departments' },
    { key: 'kdf',         label: 'KDF Management' },
    { key: 'attendance',  label: 'Attendance' },
    { key: 'followups',   label: 'Follow-Up Reports' },
    { key: 'greatness',   label: '32 Days of Greatness' },
    { key: 'reports',     label: 'Reports' },
    { key: 'settings',    label: 'Settings' },
  ],
  [ROLES.PASTOR]: [
    { key: 'overview',   label: 'My Dashboard' },
    { key: 'register',   label: 'Register Member' },
    { key: 'myMembers',  label: 'My Members' },
    { key: 'followup',   label: 'Follow-Up' },
    { key: 'greatness',  label: '32 Days of Greatness' },
    { key: 'reports',    label: 'My Reports' },
  ],
  [ROLES.DEPARTMENT_LEADER]: [
    { key: 'overview',    label: 'My Dashboard' },
    { key: 'register',    label: 'Register Member' },
    { key: 'deptMembers', label: 'Dept Members' },
    { key: 'attendance',  label: 'Attendance' },
    { key: 'reports',     label: 'Reports' },
  ],
  [ROLES.KDF_COORDINATOR]: [
    { key: 'overview',   label: 'My Dashboard' },
    { key: 'kdfMembers', label: 'Area Members' },
    { key: 'followup',   label: 'Follow-Up' },
    { key: 'reports',    label: 'Area Reports' },
  ],
};

export default function Layout({ activeTab, setActiveTab, children }) {
  const { profile, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const nav = NAV[profile?.role] || [];
  const roleColor = ROLE_COLORS[profile?.role] || C.gold;
  const pageName = nav.find(n => n.key === activeTab)?.label || 'Dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.pageBg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.textPrimary }}>

      {/* Sidebar */}
      <aside style={{ width: collapsed ? 60 : 220, background: C.sidebarBg, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', transition: 'width 0.2s ease', overflow: 'hidden', boxShadow: '2px 0 12px rgba(0,0,0,0.15)' }}>

        {/* Brand */}
        <div style={{ padding: collapsed ? '16px 10px' : '16px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', minHeight: 64 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
              <img src="/salem-logo.png" alt="SICC" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.gold, whiteSpace: 'nowrap' }}>SICC Admin</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>Salem Int'l Christian Centre</div>
              </div>
            </div>
          )}
          {collapsed && <img src="/salem-logo.png" alt="SICC" style={{ width: 30, height: 30, objectFit: 'contain' }} />}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={colBtn}><ChevronLeft size={14} /></button>
          )}
        </div>

        {collapsed && (
          <div style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => setCollapsed(false)} style={colBtn}><ChevronRight size={14} /></button>
          </div>
        )}

        {/* User card */}
        {!collapsed && (
          <div style={{ margin: '12px 10px', background: `${roleColor}15`, border: `0.5px solid ${roleColor}30`, borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: roleColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: roleColor === C.gold ? C.navy : '#fff', flexShrink: 0 }}>
                {profile?.avatar}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.name}</div>
                <div style={{ fontSize: 10, color: roleColor, marginTop: 1 }}>{ROLE_LABELS[profile?.role]}</div>
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: roleColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: roleColor === C.gold ? C.navy : '#fff' }}>{profile?.avatar}</div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '6px 8px', overflowY: 'auto' }}>
          {nav.map(item => {
            const active = activeTab === item.key;
            return (
              <button key={item.key} onClick={() => setActiveTab(item.key)} title={collapsed ? item.label : ''}
                style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, justifyContent: collapsed ? 'center' : 'flex-start', width: '100%', padding: collapsed ? '11px' : '10px 12px', marginBottom: 2, background: active ? `${C.gold}18` : 'transparent', border: 'none', borderLeft: active ? `3px solid ${C.gold}` : '3px solid transparent', borderRadius: active ? '0 8px 8px 0' : 8, color: active ? C.gold : 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: active ? 500 : 400, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.12s', whiteSpace: 'nowrap' }}>
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{ICON[item.key]}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '8px', borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
          <button onClick={logout} title={collapsed ? 'Sign Out' : ''} style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 8, justifyContent: collapsed ? 'center' : 'flex-start', width: '100%', padding: collapsed ? '11px' : '10px 12px', background: 'rgba(198,40,40,0.08)', border: '0.5px solid rgba(198,40,40,0.2)', borderRadius: 8, color: 'rgba(255,120,100,0.8)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
            <LogOut size={15} />
            {!collapsed && <span style={{ marginLeft: 4 }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={{ background: C.headerBg, borderBottom: `0.5px solid ${C.border}`, padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.textPrimary }}>{pageName}</h2>
            <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ padding: '5px 14px', borderRadius: 20, background: `${roleColor}15`, border: `0.5px solid ${roleColor}30`, fontSize: 12, fontWeight: 500, color: roleColor }}>
            {ROLE_LABELS[profile?.role]}
          </div>
        </header>
        <main style={{ flex: 1, padding: '22px 24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

const colBtn = { background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 };
