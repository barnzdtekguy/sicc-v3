// src/components/bishop/BishopDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { StatCard, Panel, Badge, DataTable, Btn, Modal, Textarea, Input, Select, ActivityFeed, Grid, SearchInput, C, Alert, Avatar, InfoRow, StatusBadge, SectionTitle, FilterSelect, EmptyState } from '../shared/UI';
import { getMembers, getProfiles, getFollowUps, getAttendance, getLogs, getAssignments, createAssignment, updateAssignment, deleteAssignment, getSMSConfig } from '../../lib/db';
import { DEPARTMENTS, KDF_AREAS, ROLES, ROLE_COLORS, ROLE_LABELS, getTodaysBirthdays } from '../../data/constants';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { Users, Star, UserCheck, MapPin, Building2, CheckSquare, TrendingUp, Phone, ClipboardList, BarChart2, Calendar, MessageSquare, Activity, Briefcase, Bell, Clock, Heart, Send, Gift } from 'lucide-react';

import GreatnessDashboard from '../pastor/GreatnessDashboard';

export default function BishopDashboard({ activeTab }) {
  const map = { overview: Overview, growth: Growth, staff: StaffMonitor, members: Members, kdf: KDFView, departments: DeptView, followups: FollowUps, greatness: GreatnessDashboard, communication: Communication, reports: Reports, assignments: Assignments };
  const Comp = map[activeTab] || Overview;
  return <Comp />;
}

function Overview() {
  const { profile } = useAuth();
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [logs, setLogs] = useState([]);
  useEffect(() => { Promise.all([getMembers(), getProfiles(), getAttendance(), getLogs(10)]).then(([m, p, a, l]) => { setMembers(m); setProfiles(p); setAttendance(a); setLogs(l); }); }, []);

  const pastors = profiles.filter(p => p.role === ROLES.PASTOR);
  const newConverts = members.filter(m => m.status === 'New Convert');
  const todayBirthdays = getTodaysBirthdays(members);
  const lastService = attendance[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #185FA5 100%)`, borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src="/salem-logo.png" alt="Salem" style={{ width: 52, height: 52, objectFit: 'contain' }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>Welcome, {profile?.name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>Salem International Christian Centre — Administrative Overview</div>
        </div>
        {todayBirthdays.length > 0 && (
          <div style={{ marginLeft: 'auto', background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
            <Gift size={18} color={C.gold} />
            <div style={{ fontSize: 12, color: C.gold, fontWeight: 500, marginTop: 4 }}>{todayBirthdays.length} Birthday{todayBirthdays.length > 1 ? 's' : ''} Today</div>
          </div>
        )}
      </div>

      <Grid cols="repeat(auto-fit, minmax(160px, 1fr))">
        <StatCard label="Total Members" value={members.length} icon={<Users size={18} />} color={C.gold} />
        <StatCard label="New Converts" value={newConverts.length} icon={<Star size={18} />} color={C.blue} sub="Need follow-up" />
        <StatCard label="Active Pastors" value={pastors.length} icon={<UserCheck size={18} />} color={C.success} />
        <StatCard label="KDF Areas" value={KDF_AREAS.length} icon={<MapPin size={18} />} color={C.purple} />
        <StatCard label="Departments" value={DEPARTMENTS.length} icon={<Building2 size={18} />} color={C.danger} />
        <StatCard label="Last Attendance" value={lastService?.count ?? '—'} icon={<CheckSquare size={18} />} color={C.gold} sub={lastService?.service} />
      </Grid>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Recent Activity"><ActivityFeed items={logs} limit={8} /></Panel>
        <Panel title="Attendance Trend">
          {attendance.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...attendance].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="date" tick={{ fill: C.textMuted, fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} />
                <Tooltip contentStyle={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke={C.navy} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={<BarChart2 size={32} color={C.textMuted} />} title="No attendance data yet" description="Admin records attendance after each service." />}
        </Panel>
      </div>

      {todayBirthdays.length > 0 && (
        <Panel title={`Birthdays Today (${todayBirthdays.length})`}>
          <DataTable
            columns={[
              { key: 'name', label: 'Member', render: (_, r) => <strong>{r.first_name} {r.last_name}</strong> },
              { key: 'phone', label: 'Phone' },
              { key: 'kdf_area', label: 'KDF Area', render: v => <Badge label={v} color={C.purple} /> },
              { key: 'wish', label: '', render: (_, r) => (
                <Btn size="sm" variant="ghost" color={C.gold} onClick={() => window.open(`https://wa.me/234${r.phone?.replace(/^0/, '')}?text=${encodeURIComponent(`Happy Birthday ${r.first_name}! The Lord bless and keep you. — Bishop Enobong Etteh, Salem Int'l Christian Centre`)}`, '_blank')}>
                  <Gift size={13} /> Send Wishes
                </Btn>
              )},
            ]}
            rows={todayBirthdays}
          />
        </Panel>
      )}
    </div>
  );
}

function Growth() {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  useEffect(() => { Promise.all([getMembers(), getAttendance()]).then(([m, a]) => { setMembers(m); setAttendance(a); }); }, []);
  const deptData = DEPARTMENTS.map(d => ({ name: d.name.split(' ')[0], members: members.filter(m => m.department === d.name).length }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Grid cols="repeat(auto-fit, minmax(160px, 1fr))">
        <StatCard label="Total Members" value={members.length} icon={<Users size={18} />} color={C.gold} />
        <StatCard label="New Converts" value={members.filter(m => m.status === 'New Convert').length} icon={<TrendingUp size={18} />} color={C.blue} />
        <StatCard label="Active Members" value={members.filter(m => m.status === 'Active Member').length} icon={<CheckSquare size={18} />} color={C.success} />
        <StatCard label="Workers" value={members.filter(m => m.status === 'Worker').length} icon={<Briefcase size={18} />} color={C.gold} />
        <StatCard label="Services Recorded" value={attendance.length} icon={<Calendar size={18} />} color={C.purple} />
        <StatCard label="Avg Attendance" value={attendance.length ? Math.round(attendance.reduce((a, b) => a + b.count, 0) / attendance.length) : '—'} icon={<Activity size={18} />} color={C.danger} />
      </Grid>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Attendance History">
          {attendance.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[...attendance].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="date" tick={{ fill: C.textMuted, fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} />
                <Tooltip contentStyle={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke={C.navy} strokeWidth={2.5} dot={{ fill: C.navy, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={<BarChart2 size={32} color={C.textMuted} />} title="No data yet" />}
        </Panel>
        <Panel title="Members by Department">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="name" tick={{ fill: C.textMuted, fontSize: 10 }} />
              <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} />
              <Tooltip contentStyle={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="members" fill={C.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

function StaffMonitor() {
  const [profiles, setProfiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [members, setMembers] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  useEffect(() => { Promise.all([getProfiles(), getLogs(100), getMembers(), getFollowUps()]).then(([p, l, m, f]) => { setProfiles(p); setLogs(l); setMembers(m); setFollowUps(f); }); }, []);
  const staff = profiles.filter(p => p.role !== ROLES.BISHOP);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Alert type="info" message="All staff activities are tracked here for full accountability across every level of the church." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {staff.length === 0 && <EmptyState icon={<Users size={32} color={C.textMuted} />} title="No staff yet" description="Admin creates staff accounts in User Management." />}
        {staff.map(s => {
          const color = ROLE_COLORS[s.role] || C.blue;
          const staffLogs = logs.filter(l => l.user_id === s.id).slice(0, 3);
          const regCount = members.filter(m => m.registered_by === s.id).length;
          const fuCount = followUps.filter(f => f.pastor_id === s.id).length;
          return (
            <Panel key={s.id} style={{ borderLeft: `3px solid ${color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <Avatar initials={s.avatar} color={color} size={44} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: C.textPrimary }}>{s.name}</div>
                  <Badge label={ROLE_LABELS[s.role]} color={color} />
                </div>
              </div>
              {s.role === ROLES.PASTOR && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1, background: C.pageBg, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 500, color: C.gold }}>{regCount}</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>Registered</div>
                  </div>
                  <div style={{ flex: 1, background: C.pageBg, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 500, color: C.blue }}>{fuCount}</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>Follow-Ups</div>
                  </div>
                </div>
              )}
              {s.department && <InfoRow icon={<Building2 size={13} />} label="Department" value={s.department} />}
              {s.kdf_area && <InfoRow icon={<MapPin size={13} />} label="KDF Area" value={s.kdf_area} />}
              <div style={{ borderTop: `0.5px solid ${C.border}`, paddingTop: 10, marginTop: 8 }}>
                <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Recent Activity</div>
                {staffLogs.length === 0
                  ? <div style={{ fontSize: 12, color: C.textMuted }}>No activity yet.</div>
                  : staffLogs.map((l, i) => <div key={i} style={{ fontSize: 12, color: C.textSecondary, padding: '2px 0' }}>• {l.action}: {l.detail}</div>)}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(() => { getMembers().then(setMembers); }, []);
  const filtered = members.filter(m => `${m.first_name} ${m.last_name} ${m.phone} ${m.address} ${m.kdf_area} ${m.department}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1 }}><SearchInput value={search} onChange={setSearch} placeholder="Search name, phone, address, KDF area..." /></div>
        <Badge label={`${filtered.length} members`} color={C.gold} />
      </div>
      <Panel>
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: (_, r) => <strong style={{ color: C.textPrimary }}>{r.first_name} {r.last_name}</strong> },
            { key: 'phone', label: 'Phone' },
            { key: 'kdf_area', label: 'KDF Area', render: v => <Badge label={v} color={C.purple} /> },
            { key: 'department', label: 'Department', render: v => v || '—' },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            { key: 'date_of_birth', label: 'DOB', render: v => v || '—' },
            { key: 'registered_by_name', label: 'Registered By' },
          ]}
          rows={filtered} emptyText="No members registered yet."
        />
      </Panel>
    </div>
  );
}

function KDFView() {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => { getMembers().then(setMembers); }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12 }}>
        {KDF_AREAS.map(k => {
          const count = members.filter(m => m.kdf_area === k.name).length;
          return (
            <div key={k.id} onClick={() => setSelected(k)} style={{ background: C.cardBg, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', borderTop: `3px solid ${C.purple}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} color={C.purple} /> {k.name}</div>
                <Badge label={count} color={C.purple} />
              </div>
              <div style={{ fontSize: 12, color: C.textSecondary }}><strong style={{ color: k.coordinator ? C.navy : C.danger }}>{k.coordinator || 'No Coordinator'}</strong></div>
              {k.assistantCoordinator && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>Asst: {k.assistantCoordinator}</div>}
            </div>
          );
        })}
      </div>
      {selected && (
        <Modal title={`KDF Area: ${selected.name}`} onClose={() => setSelected(null)}>
          <InfoRow icon={<MapPin size={14} />} label="Area Name" value={selected.name} />
          <InfoRow icon={<UserCheck size={14} />} label="Coordinator" value={selected.coordinator} color={C.gold} />
          <InfoRow icon={<Phone size={14} />} label="Coordinator Phone" value={selected.coordinatorPhone} />
          <InfoRow icon={<Users size={14} />} label="Assistant Coordinator" value={selected.assistantCoordinator} />
          <InfoRow icon={<Phone size={14} />} label="Assistant Phone" value={selected.assistantPhone} />
          <div style={{ marginTop: 14 }}>
            <SectionTitle>Members in This Area</SectionTitle>
            <DataTable columns={[
              { key: 'name', label: 'Name', render: (_, r) => `${r.first_name} ${r.last_name}` },
              { key: 'phone', label: 'Phone' },
              { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            ]} rows={members.filter(m => m.kdf_area === selected.name)} emptyText="No members in this area yet." />
          </div>
        </Modal>
      )}
    </div>
  );
}

function DeptView() {
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  useEffect(() => { Promise.all([getMembers(), getProfiles()]).then(([m, p]) => { setMembers(m); setProfiles(p); }); }, []);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
      {DEPARTMENTS.map(d => {
        const count = members.filter(m => m.department === d.name).length;
        const leader = profiles.find(p => p.role === ROLES.DEPARTMENT_LEADER && p.department === d.name);
        return (
          <Panel key={d.id} style={{ borderTop: `3px solid ${d.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Building2 size={18} color={d.color} />
              <div style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{d.name}</div>
            </div>
            <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 10 }}>Leader: <strong style={{ color: leader ? C.navy : C.danger }}>{leader?.name || 'Not Assigned'}</strong></div>
            <Badge label={`${count} members`} color={d.color} />
          </Panel>
        );
      })}
    </div>
  );
}

function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState('');
  const [filterPastor, setFilterPastor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  useEffect(() => { Promise.all([getFollowUps(), getMembers(), getProfiles()]).then(([f, m, p]) => { setFollowUps(f); setMembers(m); setProfiles(p); }); }, []);
  const pastors = profiles.filter(p => p.role === ROLES.PASTOR);
  const filtered = followUps.filter(f => `${f.member_name} ${f.pastor_name} ${f.notes} ${f.outcome}`.toLowerCase().includes(search.toLowerCase()) && (!filterPastor || f.pastor_name === filterPastor) && (!filterStatus || f.status === filterStatus));
  const byPastor = pastors.map(p => ({ name: p.name, total: followUps.filter(f => f.pastor_id === p.id).length, completed: followUps.filter(f => f.pastor_id === p.id && f.status === 'Completed').length, inProgress: followUps.filter(f => f.pastor_id === p.id && f.status === 'In Progress').length, noResponse: followUps.filter(f => f.pastor_id === p.id && f.status === 'No Response').length }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Grid cols="repeat(auto-fit, minmax(150px, 1fr))">
        <StatCard label="Total Reports" value={followUps.length} icon={<Phone size={18} />} color={C.blue} />
        <StatCard label="Completed" value={followUps.filter(f => f.status === 'Completed').length} icon={<CheckSquare size={18} />} color={C.success} />
        <StatCard label="In Progress" value={followUps.filter(f => f.status === 'In Progress').length} icon={<Activity size={18} />} color={C.warning} />
        <StatCard label="No Response" value={followUps.filter(f => f.status === 'No Response').length} icon={<MessageSquare size={18} />} color={C.danger} />
      </Grid>
      {byPastor.length > 0 && (
        <Panel title="Pastor Follow-Up Accountability">
          <DataTable columns={[{ key: 'name', label: 'Pastor' }, { key: 'total', label: 'Total', render: v => <Badge label={v} color={C.blue} /> }, { key: 'completed', label: 'Completed', render: v => <Badge label={v} color={C.success} /> }, { key: 'inProgress', label: 'In Progress', render: v => <Badge label={v} color={C.warning} /> }, { key: 'noResponse', label: 'No Response', render: v => <Badge label={v} color={C.danger} /> }]} rows={byPastor} emptyText="No pastors yet." />
        </Panel>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}><SearchInput value={search} onChange={setSearch} placeholder="Search member, pastor, notes..." /></div>
        <FilterSelect value={filterPastor} onChange={setFilterPastor} options={pastors.map(p => ({ value: p.name, label: p.name }))} placeholder="All Pastors" />
        <FilterSelect value={filterStatus} onChange={setFilterStatus} options={['In Progress', 'Completed', 'No Response'].map(s => ({ value: s, label: s }))} placeholder="All Statuses" />
        <Badge label={`${filtered.length} reports`} color={C.gold} />
      </div>
      <Panel title="All Follow-Up Reports">
        <DataTable
          columns={[
            { key: 'member_name', label: 'Member', render: v => <strong style={{ color: C.textPrimary }}>{v}</strong> },
            { key: 'pastor_name', label: 'Pastor' },
            { key: 'date', label: 'Date' },
            { key: 'method', label: 'Method', render: v => v ? <Badge label={v} color={C.blue} /> : '—' },
            { key: 'notes', label: 'Notes', render: v => <span style={{ color: C.textSecondary, fontSize: 12, maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span> },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            { key: 'view', label: '', render: (_, r) => <Btn size="sm" variant="ghost" color={C.gold} onClick={() => setSelected(r)}>View</Btn> },
          ]}
          rows={filtered} emptyText="No follow-up reports submitted yet."
        />
      </Panel>
      {selected && (
        <Modal title="Follow-Up Detail" onClose={() => setSelected(null)}>
          <InfoRow icon={<Users size={14} />} label="Member" value={selected.member_name} color={C.gold} />
          <InfoRow icon={<UserCheck size={14} />} label="Submitted By" value={selected.pastor_name} />
          <InfoRow icon={<Calendar size={14} />} label="Date" value={selected.date} />
          <InfoRow icon={<Phone size={14} />} label="Method" value={selected.method} />
          <InfoRow icon={<Activity size={14} />} label="Status" value={selected.status} />
          <div style={{ marginTop: 14 }}><div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Notes</div><div style={{ fontSize: 13, color: C.textPrimary, background: C.pageBg, borderRadius: 8, padding: 12, lineHeight: 1.7 }}>{selected.notes}</div></div>
          {selected.outcome && <div style={{ marginTop: 12 }}><div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Outcome</div><div style={{ fontSize: 13, color: C.textPrimary, background: C.pageBg, borderRadius: 8, padding: 12, lineHeight: 1.7 }}>{selected.outcome}</div></div>}
          {(() => { const m = members.find(m => m.id === selected.member_id); return m ? (<div style={{ marginTop: 14, borderTop: `0.5px solid ${C.border}`, paddingTop: 14 }}><SectionTitle>Member Profile</SectionTitle><InfoRow icon={<MapPin size={13} />} label="KDF Area" value={m.kdf_area} color={C.purple} /><InfoRow icon={<Building2 size={13} />} label="Department" value={m.department} /><InfoRow icon={<Star size={13} />} label="Spiritual Status" value={m.spiritual_status} /><InfoRow icon={<Phone size={13} />} label="Phone" value={m.phone} /></div>) : null; })()}
        </Modal>
      )}
    </div>
  );
}

function Communication() {
  const [members, setMembers] = useState([]);
  const [smsConfig, setSmsConfig] = useState({ api_key: '', sender_id: 'SICC' });
  const [msg, setMsg] = useState('');
  const [alert, setAlert] = useState(null);
  useEffect(() => { Promise.all([getMembers(), getSMSConfig()]).then(([m, s]) => { setMembers(m); setSmsConfig(s); }); }, []);

  const sendSMS = () => {
    if (!msg.trim()) return;
    if (!smsConfig.api_key) { setAlert({ type: 'warning', msg: 'SMS API key not configured. Ask Admin to go to Settings and add the BulkSMSNigeria API key.' }); return; }
    const phones = members.map(m => m.phone).filter(Boolean).join(',');
    window.open(`https://www.bulksmsnigeria.com/bulk-sms?api_token=${smsConfig.api_key}&from=${smsConfig.sender_id}&to=${phones}&body=${encodeURIComponent(msg)}&dnd=2`, '_blank');
    setAlert({ type: 'success', msg: `SMS sent to ${members.length} members via BulkSMSNigeria!` });
    setTimeout(() => setAlert(null), 4000);
  };

  const quickMsgs = [
    { icon: <Bell size={14} />, label: 'Sunday Service Reminder', text: "Dear Salem Family, Sunday Service holds today. Come and be blessed! — Bishop Enobong Etteh, Salem Int'l Christian Centre." },
    { icon: <Clock size={14} />, label: 'Mid-Week Service', text: "Dear Salem Family, Mid-Week Service holds this Wednesday. Come and be refreshed. — SICC." },
    { icon: <Heart size={14} />, label: 'Prayer Broadcast', text: "Let us pray: The Lord is our strength and shield. Trust in Him always. — Bishop Enobong Etteh, SICC." },
    { icon: <Star size={14} />, label: 'Special Programme', text: "Dear Salem Family, we have a Special Programme coming soon. Stay connected. — SICC." },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {alert && <Alert type={alert.type} message={alert.msg} onDismiss={() => setAlert(null)} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="SMS Broadcast">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: C.textSecondary }}>
              Recipients: <strong style={{ color: C.navy }}>{members.length} members</strong>
              {!smsConfig.api_key && <span style={{ color: C.danger, marginLeft: 8, fontSize: 12 }}>— API key not set</span>}
            </div>
            <Textarea value={msg} onChange={setMsg} placeholder="Type your broadcast message..." rows={5} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn onClick={sendSMS} color={C.success}><Send size={14} /> Send SMS</Btn>
              <Btn onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')} color="#25D366" variant="outline"><MessageSquare size={14} /> WhatsApp</Btn>
            </div>
          </div>
        </Panel>
        <Panel title="Quick Message Templates">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quickMsgs.map((q, i) => (
              <button key={i} onClick={() => setMsg(q.text)} style={{ padding: '11px 14px', background: C.pageBg, border: `1px solid ${C.border}`, borderRadius: 9, color: C.textPrimary, fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = C.blueLight; e.currentTarget.style.borderColor = C.blue; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.pageBg; e.currentTarget.style.borderColor = C.border; }}>
                <span style={{ color: C.blue, flexShrink: 0 }}>{q.icon}</span>
                <span>{q.label}</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Reports() {
  const [members, setMembers] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [attendance, setAttendance] = useState([]);
  useEffect(() => { Promise.all([getMembers(), getFollowUps(), getAttendance()]).then(([m, f, a]) => { setMembers(m); setFollowUps(f); setAttendance(a); }); }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Grid cols="repeat(auto-fit, minmax(150px, 1fr))">
        <StatCard label="Total Members" value={members.length} icon={<ClipboardList size={18} />} color={C.gold} />
        <StatCard label="New Converts" value={members.filter(m => m.status === 'New Convert').length} icon={<TrendingUp size={18} />} color={C.blue} />
        <StatCard label="Active Members" value={members.filter(m => m.status === 'Active Member').length} icon={<CheckSquare size={18} />} color={C.success} />
        <StatCard label="Workers" value={members.filter(m => m.status === 'Worker').length} icon={<Briefcase size={18} />} color={C.gold} />
        <StatCard label="Follow-Ups" value={followUps.length} icon={<Phone size={18} />} color={C.purple} />
      </Grid>
      <Panel title="KDF Area Breakdown">
        <DataTable columns={[{ key: 'name', label: 'Area' }, { key: 'coordinator', label: 'Coordinator' }, { key: 'count', label: 'Members', render: v => <Badge label={v} color={C.purple} /> }]} rows={KDF_AREAS.map(k => ({ ...k, count: members.filter(m => m.kdf_area === k.name).length }))} />
      </Panel>
      <Panel title="Attendance Records">
        <DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'service', label: 'Service' }, { key: 'count', label: 'Count', render: v => <strong style={{ color: C.navy, fontSize: 15 }}>{v}</strong> }]} rows={attendance} emptyText="No attendance records yet." />
      </Panel>
    </div>
  );
}

function Assignments() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState({ task: '', assignee: '', priority: 'Normal', due_date: '' });
  const [loading, setLoading] = useState(false);
  useEffect(() => { Promise.all([getAssignments(), getProfiles()]).then(([a, p]) => { setAssignments(a); setProfiles(p); }); }, []);
  const staff = profiles.filter(p => p.role !== ROLES.BISHOP);

  const add = async () => {
    if (!form.task || !form.assignee) return;
    setLoading(true);
    const { data } = await createAssignment({ ...form, created_by: profile.id });
    if (data) setAssignments([data, ...assignments]);
    setForm({ task: '', assignee: '', priority: 'Normal', due_date: '' });
    setLoading(false);
  };
  const complete = async (id) => { const { data } = await updateAssignment(id, { status: 'Completed' }); if (data) setAssignments(assignments.map(a => a.id === id ? data : a)); };
  const remove = async (id) => { await deleteAssignment(id); setAssignments(assignments.filter(a => a.id !== id)); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Panel title="Create Assignment">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <Input label="Task Description *" value={form.task} onChange={v => setForm({ ...form, task: v })} placeholder="Describe the assignment..." required />
          <Select label="Assign To *" value={form.assignee} onChange={v => setForm({ ...form, assignee: v })} options={staff.map(s => ({ value: s.name, label: s.name }))} required />
          <Select label="Priority" value={form.priority} onChange={v => setForm({ ...form, priority: v })} options={['Normal', 'Urgent', 'High Priority']} />
          <Input label="Due Date" value={form.due_date} onChange={v => setForm({ ...form, due_date: v })} type="date" />
        </div>
        <Btn onClick={add} color={C.navy} disabled={loading || !form.task || !form.assignee}><Pin size={14} /> Create Assignment</Btn>
      </Panel>
      <Panel title="All Assignments">
        <DataTable
          columns={[
            { key: 'task', label: 'Task' },
            { key: 'assignee', label: 'Assigned To' },
            { key: 'priority', label: 'Priority', render: v => <Badge label={v} color={v === 'Urgent' ? C.danger : v === 'High Priority' ? C.gold : C.blue} /> },
            { key: 'due_date', label: 'Due Date', render: v => v || '—' },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            { key: 'actions', label: '', render: (_, r) => (<div style={{ display: 'flex', gap: 6 }}>{r.status !== 'Completed' && <Btn size="sm" variant="ghost" color={C.success} onClick={() => complete(r.id)}><CheckSquare size={12} /></Btn>}<Btn size="sm" variant="ghost" color={C.danger} onClick={() => remove(r.id)}>Remove</Btn></div>) },
          ]}
          rows={assignments} emptyText="No assignments yet."
        />
      </Panel>
    </div>
  );
}
