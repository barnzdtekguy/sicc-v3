// src/components/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { StatCard, Panel, Badge, DataTable, Btn, Modal, Input, Select, Textarea, SearchInput, C, Alert, Avatar, InfoRow, StatusBadge, SectionTitle, Grid, FilterSelect, EmptyState } from '../shared/UI';
import { getMembers, getProfiles, createProfile, deleteProfile, getFollowUps, getAttendance, createAttendance, getLogs, getSMSConfig, saveSMSConfig, addLog } from '../../lib/db';
import { supabase } from '../../lib/supabase';
import { DEPARTMENTS, KDF_AREAS, ROLES, ROLE_COLORS, ROLE_LABELS, SERVICE_TYPES } from '../../data/constants';
import { Users, UserCheck, MapPin, Building2, CheckSquare, TrendingUp, Phone, ClipboardList, BarChart2, Calendar, Activity, Briefcase, MessageSquare, Map, Settings, UserPlus } from 'lucide-react';

import GreatnessDashboard from '../pastor/GreatnessDashboard';

export default function AdminDashboard({ activeTab }) {
  const map = { overview: Overview, users: UserManagement, staff: StaffManagement, members: AllMembers, departments: DeptMgmt, kdf: KDFMgmt, attendance: Attendance, followups: FollowUps, greatness: GreatnessDashboard, reports: Reports, settings: Settings_ };
  const Comp = map[activeTab] || Overview;
  return <Comp />;
}

function Overview() {
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [logs, setLogs] = useState([]);
  useEffect(() => { Promise.all([getMembers(), getProfiles(), getLogs(10)]).then(([m, p, l]) => { setMembers(m); setProfiles(p); setLogs(l); }); }, []);
  const pastors = profiles.filter(p => p.role === ROLES.PASTOR);
  const deptLeaders = profiles.filter(p => p.role === ROLES.DEPARTMENT_LEADER);
  const kdfCoords = profiles.filter(p => p.role === ROLES.KDF_COORDINATOR);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Grid cols="repeat(auto-fit, minmax(150px, 1fr))">
        <StatCard label="Total Members" value={members.length} icon={<Users size={18} />} color={C.gold} />
        <StatCard label="Pastors" value={pastors.length} icon={<UserCheck size={18} />} color={C.success} />
        <StatCard label="Dept Leaders" value={deptLeaders.length} icon={<Building2 size={18} />} color={C.purple} />
        <StatCard label="KDF Coords" value={kdfCoords.length} icon={<MapPin size={18} />} color={C.danger} />
        <StatCard label="Departments" value={DEPARTMENTS.length} icon={<ClipboardList size={18} />} color={C.gold} />
        <StatCard label="KDF Areas" value={KDF_AREAS.length} icon={<Map size={18} />} color={C.blue} />
      </Grid>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="System Activity">
          {logs.length === 0 ? <EmptyState icon={<Activity size={28} color={C.textMuted} />} title="No activity yet" /> :
            logs.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: `0.5px solid ${C.border}` }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.gold, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, color: C.textPrimary }}><strong style={{ fontWeight: 500 }}>{item.user_name}</strong><span style={{ color: C.textSecondary }}> — {item.action}</span></div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{item.detail} · {new Date(item.created_at).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))
          }
        </Panel>
        <Panel title="Staff at a Glance">
          {[...pastors, ...deptLeaders, ...kdfCoords].slice(0, 8).map(u => {
            const color = ROLE_COLORS[u.role] || C.blue;
            return (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `0.5px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar initials={u.avatar} color={color} size={30} />
                  <div>
                    <div style={{ fontSize: 13, color: C.textPrimary, fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{u.email}</div>
                  </div>
                </div>
                <Badge label={ROLE_LABELS[u.role]} color={color} />
              </div>
            );
          })}
          {[...pastors, ...deptLeaders, ...kdfCoords].length === 0 && <EmptyState icon={<Users size={28} color={C.textMuted} />} title="No staff yet" description="Create staff in User Management." />}
        </Panel>
      </div>
    </div>
  );
}

function UserManagement() {
  const { profile: currentProfile } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: '', department: '', kdfArea: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { getProfiles().then(setProfiles); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.role || !form.email || !form.password) {
      setMsg({ type: 'warning', text: 'Name, email, password and role are all required.' });
      return;
    }
    setLoading(true);
    // Step 1 — Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, role: form.role } }
    });
    if (authError) {
      setMsg({ type: 'danger', text: authError.message });
      setLoading(false);
      return;
    }
    // Step 2 — Create profile
    const avatar = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const { data, error } = await createProfile({
      name: form.name, email: form.email, phone: form.phone || null,
      role: form.role,
      department: form.role === ROLES.DEPARTMENT_LEADER ? form.department : null,
      kdf_area: form.role === ROLES.KDF_COORDINATOR ? form.kdfArea : null,
      avatar,
    });
    if (error) { setMsg({ type: 'danger', text: error.message }); setLoading(false); return; }
    await addLog(currentProfile.id, currentProfile.name, 'Created user', `${form.name} (${ROLE_LABELS[form.role]})`);
    setProfiles([...profiles, data]);
    setShowModal(false);
    setForm({ name: '', email: '', phone: '', password: '', role: '', department: '', kdfArea: '' });
    setMsg({ type: 'success', text: `${form.name} created! They can now log in with their email and password.` });
    setTimeout(() => setMsg(null), 5000);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this user? They will no longer be able to log in.')) return;
    await deleteProfile(id);
    setProfiles(profiles.filter(p => p.id !== id));
  };

  const displayProfiles = profiles.filter(p => p.role !== ROLES.BISHOP);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        {msg && <div style={{ flex: 1 }}><Alert type={msg.type} message={msg.text} onDismiss={() => setMsg(null)} /></div>}
        <div style={{ marginLeft: 'auto' }}><Btn onClick={() => setShowModal(true)} color={C.navy}><UserPlus size={15} /> Create New User</Btn></div>
      </div>
      <Panel>
        <DataTable
          columns={[
            { key: 'avatar', label: '', render: (v, r) => <Avatar initials={v} color={ROLE_COLORS[r.role] || C.blue} size={34} /> },
            { key: 'name', label: 'Full Name', render: v => <strong style={{ color: C.textPrimary }}>{v}</strong> },
            { key: 'role', label: 'Role', render: v => <Badge label={ROLE_LABELS[v] || v} color={ROLE_COLORS[v] || C.blue} /> },
            { key: 'email', label: 'Email', render: v => v || '—' },
            { key: 'phone', label: 'Phone', render: v => v || '—' },
            { key: 'department', label: 'Dept / Area', render: (v, r) => v || r.kdf_area || '—' },
            { key: 'actions', label: '', render: (_, r) => r.id !== currentProfile?.id ? <Btn size="sm" variant="ghost" color={C.danger} onClick={() => handleDelete(r.id)}>Remove</Btn> : <span style={{ fontSize: 11, color: C.textMuted }}>You</span> },
          ]}
          rows={displayProfiles} emptyText="No staff created yet."
        />
      </Panel>
      {showModal && (
        <Modal title="Create Staff Account" onClose={() => { setShowModal(false); setMsg(null); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Full Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Pastor John Adeyemi" required />
            <Input label="Email Address *" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" placeholder="pastor@sicc.org" required />
            <Input label="Phone Number" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="08XXXXXXXXX" />
            <Input label="Password *" value={form.password} onChange={v => setForm({ ...form, password: v })} type="password" placeholder="Set a login password" hint="Share this privately with the staff member." required />
            <Select label="Role *" value={form.role} onChange={v => setForm({ ...form, role: v, department: '', kdfArea: '' })}
              options={[{ value: ROLES.PASTOR, label: 'Pastor' }, { value: ROLES.DEPARTMENT_LEADER, label: 'Department Leader' }, { value: ROLES.KDF_COORDINATOR, label: 'KDF Coordinator' }, { value: ROLES.ADMIN, label: 'Admin (Full Access)' }]} required />
            {form.role === ROLES.DEPARTMENT_LEADER && <Select label="Assign Department" value={form.department} onChange={v => setForm({ ...form, department: v })} options={DEPARTMENTS.map(d => ({ value: d.name, label: d.name }))} />}
            {form.role === ROLES.KDF_COORDINATOR && <Select label="Assign KDF Area" value={form.kdfArea} onChange={v => setForm({ ...form, kdfArea: v })} options={KDF_AREAS.map(k => ({ value: k.name, label: k.name }))} />}
            {msg && <Alert type={msg.type} message={msg.text} />}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <Btn variant="outline" color={C.textSecondary} onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn onClick={handleCreate} color={C.navy} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StaffManagement() {
  const [profiles, setProfiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [members, setMembers] = useState([]);
  useEffect(() => { Promise.all([getProfiles(), getLogs(100), getMembers()]).then(([p, l, m]) => { setProfiles(p); setLogs(l); setMembers(m); }); }, []);
  const staff = profiles.filter(p => p.role !== ROLES.BISHOP);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
      {staff.length === 0 && <EmptyState icon={<Users size={32} color={C.textMuted} />} title="No staff yet" description="Create users in User Management." />}
      {staff.map(s => {
        const color = ROLE_COLORS[s.role] || C.blue;
        const staffLogs = logs.filter(l => l.user_id === s.id);
        const regCount = members.filter(m => m.registered_by === s.id).length;
        return (
          <Panel key={s.id} style={{ borderLeft: `3px solid ${color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Avatar initials={s.avatar} color={color} size={42} />
              <div><div style={{ fontWeight: 500, fontSize: 14, color: C.textPrimary }}>{s.name}</div><Badge label={ROLE_LABELS[s.role]} color={color} /></div>
            </div>
            <InfoRow icon={<span style={{ fontSize: 12 }}>@</span>} label="Email" value={s.email} />
            <InfoRow icon={<Phone size={13} />} label="Phone" value={s.phone} />
            {s.department && <InfoRow icon={<Building2 size={13} />} label="Department" value={s.department} />}
            {s.kdf_area && <InfoRow icon={<MapPin size={13} />} label="KDF Area" value={s.kdf_area} />}
            {s.role === ROLES.PASTOR && <InfoRow icon={<ClipboardList size={13} />} label="Members Registered" value={regCount} color={C.gold} />}
            <div style={{ borderTop: `0.5px solid ${C.border}`, paddingTop: 10, marginTop: 8 }}>
              <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Activity Log</div>
              {staffLogs.length === 0 ? <div style={{ fontSize: 12, color: C.textMuted }}>No activity yet.</div>
                : staffLogs.slice(0, 3).map((l, i) => <div key={i} style={{ fontSize: 12, color: C.textSecondary, padding: '2px 0' }}>• {l.action}: {l.detail}</div>)}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

function AllMembers() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKDF, setFilterKDF] = useState('');
  useEffect(() => { getMembers().then(setMembers); }, []);
  const filtered = members.filter(m =>
    `${m.first_name} ${m.last_name} ${m.phone} ${m.address} ${m.kdf_area} ${m.department}`.toLowerCase().includes(search.toLowerCase())
    && (!filterStatus || m.status === filterStatus)
    && (!filterKDF || m.kdf_area === filterKDF)
  );
  const kdfOptions = [...new Set(members.map(m => m.kdf_area))].filter(Boolean).map(k => ({ value: k, label: k }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}><SearchInput value={search} onChange={setSearch} placeholder="Search name, phone, address, KDF..." /></div>
        <FilterSelect value={filterStatus} onChange={setFilterStatus} options={['New Convert', 'Active Member', 'Worker', 'Evangelism Contact'].map(s => ({ value: s, label: s }))} placeholder="All Statuses" />
        <FilterSelect value={filterKDF} onChange={setFilterKDF} options={kdfOptions} placeholder="All KDF Areas" />
        <Badge label={`${filtered.length} of ${members.length}`} color={C.gold} />
      </div>
      <Panel>
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: (_, r) => <strong style={{ color: C.textPrimary }}>{r.first_name} {r.last_name}</strong> },
            { key: 'phone', label: 'Phone' },
            { key: 'address', label: 'Address' },
            { key: 'kdf_area', label: 'KDF Area', render: v => <Badge label={v} color={C.purple} /> },
            { key: 'department', label: 'Department', render: v => v || '—' },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            { key: 'date_of_birth', label: 'DOB', render: v => v || '—' },
            { key: 'spiritual_status', label: 'Spiritual' },
            { key: 'registered_by_name', label: 'Registered By' },
          ]}
          rows={filtered} emptyText="No members registered yet."
        />
      </Panel>
    </div>
  );
}

function DeptMgmt() {
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  useEffect(() => { Promise.all([getMembers(), getProfiles()]).then(([m, p]) => { setMembers(m); setProfiles(p); }); }, []);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
      {DEPARTMENTS.map(d => {
        const count = members.filter(m => m.department === d.name).length;
        const leader = profiles.find(p => p.role === ROLES.DEPARTMENT_LEADER && p.department === d.name);
        return (
          <Panel key={d.id} style={{ borderTop: `3px solid ${d.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Building2 size={16} color={d.color} /><div style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{d.name}</div></div>
            <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 10 }}>Leader: <strong style={{ color: leader ? C.navy : C.danger }}>{leader?.name || 'Not Assigned'}</strong></div>
            <Badge label={`${count} members`} color={d.color} />
          </Panel>
        );
      })}
    </div>
  );
}

function KDFMgmt() {
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => { Promise.all([getMembers(), getProfiles()]).then(([m, p]) => { setMembers(m); setProfiles(p); }); }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Alert type="info" message={`All ${KDF_AREAS.length} KDF areas loaded from the 2026 official document. Auto-KDF assignment is active.`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12 }}>
        {KDF_AREAS.map(k => {
          const count = members.filter(m => m.kdf_area === k.name).length;
          const appCoord = profiles.find(p => p.role === ROLES.KDF_COORDINATOR && p.kdf_area === k.name);
          return (
            <div key={k.id} onClick={() => setSelected(k)} style={{ background: C.cardBg, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', borderTop: `3px solid ${C.purple}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} color={C.purple} />{k.name}</div>
                <Badge label={count} color={C.purple} />
              </div>
              <div style={{ fontSize: 12, color: C.textSecondary }}><strong style={{ color: k.coordinator ? C.navy : C.danger }}>{k.coordinator || 'No Coordinator'}</strong></div>
              {k.assistantCoordinator && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Asst: {k.assistantCoordinator}</div>}
              {appCoord && <div style={{ fontSize: 11, color: C.success, marginTop: 4 }}>App login: {appCoord.name}</div>}
            </div>
          );
        })}
      </div>
      {selected && (
        <Modal title={`KDF: ${selected.name}`} onClose={() => setSelected(null)}>
          <InfoRow icon={<MapPin size={14} />} label="Area" value={selected.name} />
          <InfoRow icon={<UserCheck size={14} />} label="Coordinator" value={selected.coordinator} color={C.gold} />
          <InfoRow icon={<Phone size={14} />} label="Phone" value={selected.coordinatorPhone} />
          <InfoRow icon={<Users size={14} />} label="Asst. Coordinator" value={selected.assistantCoordinator} />
          <InfoRow icon={<Phone size={14} />} label="Asst. Phone" value={selected.assistantPhone} />
        </Modal>
      )}
    </div>
  );
}

function Attendance() {
  const { profile } = useAuth();
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), service: 'Sunday Service', count: '' });
  useEffect(() => { getAttendance().then(setRecords); }, []);
  const handleAdd = async () => {
    if (!form.date || !form.count) return;
    const { data } = await createAttendance({ ...form, count: Number(form.count), recorded_by: profile.id, recorded_by_name: profile.name });
    if (data) { setRecords([data, ...records]); await addLog(profile.id, profile.name, 'Recorded attendance', `${form.service}: ${form.count}`); }
    setShowModal(false); setForm({ date: new Date().toISOString().slice(0, 10), service: 'Sunday Service', count: '' });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <Grid cols="repeat(3, 1fr)" gap={12}>
          <StatCard label="Last Service" value={records[0]?.count ?? '—'} icon={<CheckSquare size={18} />} color={C.blue} sub={records[0]?.service} />
          <StatCard label="Services Logged" value={records.length} icon={<Calendar size={18} />} color={C.gold} />
          <StatCard label="Average" value={records.length ? Math.round(records.reduce((a, b) => a + b.count, 0) / records.length) : '—'} icon={<Activity size={18} />} color={C.success} />
        </Grid>
        <Btn onClick={() => setShowModal(true)} color={C.navy}><CheckSquare size={14} /> Record Attendance</Btn>
      </div>
      <Panel title="Attendance History">
        <DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'service', label: 'Service Type' }, { key: 'count', label: 'Total Count', render: v => <strong style={{ color: C.navy, fontSize: 16 }}>{v}</strong> }, { key: 'recorded_by_name', label: 'Recorded By' }]} rows={records} emptyText="No records yet." />
      </Panel>
      {showModal && (
        <Modal title="Record Attendance" onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Date" value={form.date} onChange={v => setForm({ ...form, date: v })} type="date" required />
            <Select label="Service Type" value={form.service} onChange={v => setForm({ ...form, service: v })} options={SERVICE_TYPES} />
            <Input label="Total Count" value={form.count} onChange={v => setForm({ ...form, count: v })} type="number" placeholder="Total people present" required />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="outline" color={C.textSecondary} onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn onClick={handleAdd} color={C.navy} disabled={!form.count}>Save</Btn>
            </div>
          </div>
        </Modal>
      )}
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
  const filtered = followUps.filter(f => `${f.member_name} ${f.pastor_name} ${f.notes}`.toLowerCase().includes(search.toLowerCase()) && (!filterPastor || f.pastor_name === filterPastor) && (!filterStatus || f.status === filterStatus));
  const byPastor = pastors.map(p => ({ name: p.name, total: followUps.filter(f => f.pastor_id === p.id).length, completed: followUps.filter(f => f.pastor_id === p.id && f.status === 'Completed').length, inProgress: followUps.filter(f => f.pastor_id === p.id && f.status === 'In Progress').length }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Grid cols="repeat(auto-fit, minmax(150px, 1fr))">
        <StatCard label="Total Reports" value={followUps.length} icon={<Phone size={18} />} color={C.blue} />
        <StatCard label="Completed" value={followUps.filter(f => f.status === 'Completed').length} icon={<CheckSquare size={18} />} color={C.success} />
        <StatCard label="In Progress" value={followUps.filter(f => f.status === 'In Progress').length} icon={<Activity size={18} />} color={C.warning} />
        <StatCard label="No Response" value={followUps.filter(f => f.status === 'No Response').length} icon={<MessageSquare size={18} />} color={C.danger} />
      </Grid>
      {byPastor.length > 0 && <Panel title="Pastor Accountability"><DataTable columns={[{ key: 'name', label: 'Pastor' }, { key: 'total', label: 'Total', render: v => <Badge label={v} color={C.blue} /> }, { key: 'completed', label: 'Completed', render: v => <Badge label={v} color={C.success} /> }, { key: 'inProgress', label: 'In Progress', render: v => <Badge label={v} color={C.warning} /> }]} rows={byPastor} emptyText="No pastors yet." /></Panel>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}><SearchInput value={search} onChange={setSearch} placeholder="Search member, pastor, notes..." /></div>
        <FilterSelect value={filterPastor} onChange={setFilterPastor} options={pastors.map(p => ({ value: p.name, label: p.name }))} placeholder="All Pastors" />
        <FilterSelect value={filterStatus} onChange={setFilterStatus} options={['In Progress', 'Completed', 'No Response'].map(s => ({ value: s, label: s }))} placeholder="All Statuses" />
        <Badge label={`${filtered.length}`} color={C.gold} />
      </div>
      <Panel title="All Follow-Up Reports">
        <DataTable columns={[
          { key: 'member_name', label: 'Member', render: v => <strong style={{ color: C.textPrimary }}>{v}</strong> },
          { key: 'pastor_name', label: 'Pastor' },
          { key: 'date', label: 'Date' },
          { key: 'method', label: 'Method', render: v => v ? <Badge label={v} color={C.blue} /> : '—' },
          { key: 'notes', label: 'Notes', render: v => <span style={{ color: C.textSecondary, fontSize: 12, maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span> },
          { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
          { key: 'view', label: '', render: (_, r) => <Btn size="sm" variant="ghost" color={C.gold} onClick={() => setSelected(r)}>View</Btn> },
        ]} rows={filtered} emptyText="No reports yet." />
      </Panel>
      {selected && (
        <Modal title="Follow-Up Detail" onClose={() => setSelected(null)}>
          <InfoRow icon={<Users size={14} />} label="Member" value={selected.member_name} color={C.gold} />
          <InfoRow icon={<UserCheck size={14} />} label="Submitted By" value={selected.pastor_name} />
          <InfoRow icon={<Calendar size={14} />} label="Date" value={selected.date} />
          <InfoRow icon={<Phone size={14} />} label="Method" value={selected.method} />
          <InfoRow icon={<Activity size={14} />} label="Status" value={selected.status} />
          <div style={{ marginTop: 14 }}><div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Notes</div><div style={{ fontSize: 13, background: C.pageBg, borderRadius: 8, padding: 12, lineHeight: 1.7 }}>{selected.notes}</div></div>
          {selected.outcome && <div style={{ marginTop: 12 }}><div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Outcome</div><div style={{ fontSize: 13, background: C.pageBg, borderRadius: 8, padding: 12, lineHeight: 1.7 }}>{selected.outcome}</div></div>}
        </Modal>
      )}
    </div>
  );
}

function Reports() {
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  useEffect(() => { Promise.all([getMembers(), getProfiles(), getFollowUps()]).then(([m, p, f]) => { setMembers(m); setProfiles(p); setFollowUps(f); }); }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Grid cols="repeat(auto-fit, minmax(150px, 1fr))">
        <StatCard label="Total Members" value={members.length} icon={<ClipboardList size={18} />} color={C.gold} />
        <StatCard label="New Converts" value={members.filter(m => m.status === 'New Convert').length} icon={<TrendingUp size={18} />} color={C.blue} />
        <StatCard label="Active Members" value={members.filter(m => m.status === 'Active Member').length} icon={<CheckSquare size={18} />} color={C.success} />
        <StatCard label="Workers" value={members.filter(m => m.status === 'Worker').length} icon={<Briefcase size={18} />} color={C.gold} />
        <StatCard label="Follow-Ups" value={followUps.length} icon={<Phone size={18} />} color={C.purple} />
      </Grid>
      <Panel title="Registrations by Pastor">
        <DataTable columns={[{ key: 'name', label: 'Pastor' }, { key: 'count', label: 'Members Registered', render: v => <Badge label={v} color={C.success} /> }, { key: 'converts', label: 'New Converts', render: v => <Badge label={v} color={C.gold} /> }]} rows={profiles.filter(p => p.role === ROLES.PASTOR).map(p => ({ name: p.name, count: members.filter(m => m.registered_by === p.id).length, converts: members.filter(m => m.registered_by === p.id && m.status === 'New Convert').length }))} emptyText="No pastors yet." />
      </Panel>
      <Panel title="KDF Area Breakdown">
        <DataTable columns={[{ key: 'name', label: 'Area' }, { key: 'coordinator', label: 'Coordinator' }, { key: 'count', label: 'Members', render: v => <Badge label={v} color={C.purple} /> }]} rows={KDF_AREAS.map(k => ({ ...k, count: members.filter(m => m.kdf_area === k.name).length }))} />
      </Panel>
    </div>
  );
}

function Settings_() {
  const [config, setConfig] = useState({ api_key: '', sender_id: 'SICC' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { getSMSConfig().then(setConfig); }, []);
  const handleSave = async () => {
    setLoading(true);
    const { error } = await saveSMSConfig(config);
    setMsg(error ? { type: 'danger', text: error.message } : { type: 'success', text: 'SMS settings saved!' });
    setTimeout(() => setMsg(null), 3000);
    setLoading(false);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
      <Panel title="BulkSMSNigeria Configuration">
        <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 16, lineHeight: 1.6 }}>Configure your BulkSMSNigeria.com account. Get your API key from BulkSMSNigeria dashboard under API Settings.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="API Token / Key" value={config.api_key || ''} onChange={v => setConfig({ ...config, api_key: v })} placeholder="Your BulkSMSNigeria API token" hint="Found in BulkSMSNigeria → API Settings" />
          <Input label="Sender ID" value={config.sender_id || ''} onChange={v => setConfig({ ...config, sender_id: v })} placeholder="e.g. SICC or Salem" hint="Max 11 characters. Must be registered with BulkSMSNigeria." />
          {msg && <Alert type={msg.type} message={msg.text} onDismiss={() => setMsg(null)} />}
          <Btn onClick={handleSave} color={C.navy} disabled={loading}><Settings size={14} /> {loading ? 'Saving...' : 'Save Settings'}</Btn>
        </div>
      </Panel>
      <Panel title="System Information">
        <InfoRow icon={<Building2 size={14} />} label="Church Name" value="Salem International Christian Centre" />
        <InfoRow icon={<ClipboardList size={14} />} label="App Name" value="SICC Admin v3.0" />
        <InfoRow icon={<MapPin size={14} />} label="KDF Areas" value={`${KDF_AREAS.length} areas loaded`} color={C.gold} />
        <InfoRow icon={<Building2 size={14} />} label="Departments" value={`${DEPARTMENTS.length} departments`} color={C.gold} />
        <InfoRow icon={<Phone size={14} />} label="SMS Provider" value="BulkSMSNigeria.com" />
        <InfoRow icon={<CheckSquare size={14} />} label="Database" value="Supabase (Cloud — Real-time)" color={C.success} />
      </Panel>
    </div>
  );
}
