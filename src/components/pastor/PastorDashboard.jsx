// src/components/pastor/PastorDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { StatCard, Panel, Badge, DataTable, Btn, Modal, Input, Select, Textarea, SearchInput, C, Alert, Grid, StatusBadge, FilterSelect, EmptyState } from '../shared/UI';
import { getMembers, createMember, getFollowUps, createFollowUp, addLog } from '../../lib/db';
import ProgrammeAttendance from './ProgrammeAttendance';
import { DEPARTMENTS, KDF_AREAS, AFFINITY_GROUPS, MEMBER_STATUSES, SPIRITUAL_STATUSES, FOLLOWUP_METHODS, FOLLOWUP_STATUSES, matchKDFArea } from '../../data/constants';
import { Users, Star, CheckSquare, Phone, ClipboardList, Activity, MapPin, Building2, UserPlus, TrendingUp } from 'lucide-react';

export default function PastorDashboard({ activeTab }) {
  const map = { overview: Overview, register: RegisterMember, myMembers: MyMembers, attendance: ProgrammeAttendance, followup: FollowUp, reports: Reports };
  const Comp = map[activeTab] || Overview;
  return <Comp />;
}

function Overview() {
  const { profile } = useAuth();
  const [members, setMembers] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  useEffect(() => {
    Promise.all([
      getMembers({ registeredBy: profile.id }),
      getFollowUps({ pastorId: profile.id }),
    ]).then(([m, f]) => { setMembers(m); setFollowUps(f); });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.success}15, ${C.success}05)`, border: `1px solid ${C.success}30`, borderRadius: 14, padding: '18px 22px' }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: C.textPrimary, marginBottom: 4 }}>Welcome, {profile?.name}</div>
        <div style={{ fontSize: 13, color: C.textSecondary }}>Your activities are visible to Bishop Enobong Etteh and Admin for accountability.</div>
      </div>
      <Grid cols="repeat(auto-fit, minmax(160px, 1fr))">
        <StatCard label="Members Registered" value={members.length} icon={<ClipboardList size={18} />} color={C.success} />
        <StatCard label="New Converts" value={members.filter(m => m.status === 'New Convert').length} icon={<Star size={18} />} color={C.gold} />
        <StatCard label="Follow-Up Reports" value={followUps.length} icon={<Phone size={18} />} color={C.blue} />
        <StatCard label="Completed" value={followUps.filter(f => f.status === 'Completed').length} icon={<CheckSquare size={18} />} color={C.success} />
      </Grid>
      <Panel title="Recently Registered">
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: (_, r) => <strong style={{ color: C.textPrimary }}>{r.first_name} {r.last_name}</strong> },
            { key: 'kdf_area', label: 'KDF Area', render: v => <Badge label={v} color={C.purple} /> },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            { key: 'date_registered', label: 'Date' },
          ]}
          rows={members.slice(0, 6)}
          emptyText="You have not registered any members yet."
        />
      </Panel>
    </div>
  );
}

function RegisterMember() {
  const { profile } = useAuth();
  const empty = { firstName: '', lastName: '', phone: '', address: '', dateOfBirth: '', department: '', affinityGroup: '', status: 'New Convert', spiritualStatus: 'Salvation', notes: '' };
  const [form, setForm] = useState(empty);
  const [kdfMatch, setKdfMatch] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const f = key => val => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (key === 'address') setKdfMatch(val.length > 2 ? matchKDFArea(val) : null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.phone) { setError('First name, last name and phone are required.'); return; }
    setLoading(true); setError('');
    const matched = matchKDFArea(form.address) || { name: 'General Area', coordinator: 'Unassigned' };
    const { data, error: err } = await createMember({
      first_name: form.firstName, last_name: form.lastName,
      phone: form.phone, address: form.address,
      date_of_birth: form.dateOfBirth || null,
      kdf_area: matched.name, kdf_coordinator: matched.coordinator,
      department: form.department || null,
      affinity_group: form.affinityGroup || null,
      status: form.status, spiritual_status: form.spiritualStatus,
      notes: form.notes,
      registered_by: profile.id, registered_by_name: profile.name,
      date_registered: new Date().toISOString().slice(0, 10),
    });
    if (err) { setError(err.message); setLoading(false); return; }
    await addLog(profile.id, profile.name, 'Registered member', `${form.firstName} ${form.lastName} → KDF: ${matched.name}`);
    setSuccess({ name: `${form.firstName} ${form.lastName}`, kdf: matched.name, coordinator: matched.coordinator });
    setForm(empty); setKdfMatch(null); setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {success && (
        <div style={{ background: C.successBg, border: `1px solid ${C.success}40`, borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: C.success, marginBottom: 8 }}>Member Registered Successfully!</div>
          <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 10 }}>
            <strong style={{ color: C.textPrimary }}>{success.name}</strong> has been registered and assigned:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge label={`KDF: ${success.kdf}`} color={C.purple} />
            <Badge label={`Coordinator: ${success.coordinator}`} color={C.gold} />
          </div>
          <button style={{ marginTop: 12, background: 'none', border: 'none', color: C.success, cursor: 'pointer', fontSize: 13, textDecoration: 'underline', padding: 0 }} onClick={() => setSuccess(null)}>
            + Register another member
          </button>
        </div>
      )}

      <Panel title="Register New Member / Evangelism Contact">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="First Name" value={form.firstName} onChange={f('firstName')} placeholder="First name" required />
            <Input label="Last Name" value={form.lastName} onChange={f('lastName')} placeholder="Last name" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="Phone Number" value={form.phone} onChange={f('phone')} placeholder="08XXXXXXXXX" required />
            <Input label="Date of Birth" value={form.dateOfBirth} onChange={f('dateOfBirth')} type="date" hint="Used for birthday reminders" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary }}>Home Address <span style={{ color: C.danger }}>*</span></label>
            <input
              value={form.address}
              onChange={e => f('address')(e.target.value)}
              placeholder="Street / Estate / Area — used for auto KDF assignment"
              style={{ padding: '10px 12px', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPrimary, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {kdfMatch && (
            <div style={{ background: '#F3E5F5', border: `1px solid ${C.purple}30`, borderRadius: 10, padding: '11px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.purple, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={13} /> Auto KDF Assignment Detected
              </div>
              <div style={{ fontSize: 13, color: C.textSecondary }}>
                Area: <strong style={{ color: C.purple }}>{kdfMatch.name}</strong> · Coordinator: <strong style={{ color: C.gold }}>{kdfMatch.coordinator}</strong>
              </div>
            </div>
          )}
          {form.address.length > 2 && !kdfMatch && (
            <Alert type="warning" message="No KDF area matched this address. Member will be placed in General Area." />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <Select label="Department" value={form.department} onChange={f('department')} options={DEPARTMENTS.map(d => ({ value: d.name, label: d.name }))} />
            <Select label="Affinity Group" value={form.affinityGroup} onChange={f('affinityGroup')} options={AFFINITY_GROUPS.map(g => ({ value: g, label: g }))} />
            <Select label="Member Status" value={form.status} onChange={f('status')} options={MEMBER_STATUSES.map(s => ({ value: s, label: s }))} required />
          </div>
          <Select label="Spiritual Status" value={form.spiritualStatus} onChange={f('spiritualStatus')} options={SPIRITUAL_STATUSES.map(s => ({ value: s, label: s }))} />
          <Textarea label="Notes (Optional)" value={form.notes} onChange={f('notes')} placeholder="Any additional notes about this person..." rows={2} />

          {error && <Alert type="danger" message={error} onDismiss={() => setError('')} />}

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn type="submit" color={C.success} size="lg" disabled={loading}>
              <UserPlus size={16} /> {loading ? 'Registering...' : 'Register Member'}
            </Btn>
            <Btn variant="outline" color={C.textSecondary} onClick={() => { setForm(empty); setKdfMatch(null); }}>Clear</Btn>
          </div>
        </form>
      </Panel>
    </div>
  );
}

function MyMembers() {
  const { profile } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  useEffect(() => { getMembers({ registeredBy: profile.id }).then(setMembers); }, []);
  const filtered = members.filter(m =>
    `${m.first_name} ${m.last_name} ${m.phone} ${m.address}`.toLowerCase().includes(search.toLowerCase())
    && (!filter || m.status === filter)
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}><SearchInput value={search} onChange={setSearch} placeholder="Search your members..." /></div>
        <FilterSelect value={filter} onChange={setFilter} options={MEMBER_STATUSES.map(s => ({ value: s, label: s }))} placeholder="All Statuses" />
        <Badge label={`${filtered.length} members`} color={C.success} />
      </div>
      <Panel>
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: (_, r) => <strong style={{ color: C.textPrimary }}>{r.first_name} {r.last_name}</strong> },
            { key: 'phone', label: 'Phone' },
            { key: 'address', label: 'Address' },
            { key: 'kdf_area', label: 'KDF Area', render: v => <Badge label={v} color={C.purple} /> },
            { key: 'department', label: 'Dept', render: v => v || '—' },
            { key: 'affinity_group', label: 'Affinity', render: v => v ? <Badge label={v} color={C.blue} /> : '—' },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            { key: 'date_of_birth', label: 'DOB', render: v => v || '—' },
            { key: 'spiritual_status', label: 'Spiritual' },
          ]}
          rows={filtered}
          emptyText="No members found."
        />
      </Panel>
    </div>
  );
}

function FollowUp() {
  const { profile } = useAuth();
  const [followUps, setFollowUps] = useState([]);
  const [myMembers, setMyMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ memberId: '', notes: '', method: 'Visit', outcome: '', status: 'In Progress' });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    Promise.all([
      getFollowUps({ pastorId: profile.id }),
      getMembers({ registeredBy: profile.id }),
    ]).then(([f, m]) => { setFollowUps(f); setMyMembers(m); });
  }, []);

  const handleSubmit = async () => {
    if (!form.memberId || !form.notes) return;
    setLoading(true);
    const member = myMembers.find(m => m.id === form.memberId);
    const { data } = await createFollowUp({
      member_id: form.memberId,
      member_name: `${member?.first_name} ${member?.last_name}`,
      pastor_id: profile.id, pastor_name: profile.name,
      method: form.method, notes: form.notes,
      outcome: form.outcome, status: form.status,
      date: new Date().toISOString().slice(0, 10),
    });
    if (data) {
      await addLog(profile.id, profile.name, 'Submitted follow-up', `Follow-up on ${member?.first_name} ${member?.last_name}`);
      setFollowUps([data, ...followUps]);
    }
    setShowModal(false);
    setForm({ memberId: '', notes: '', method: 'Visit', outcome: '', status: 'In Progress' });
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <Grid cols="repeat(3, 1fr)" gap={12}>
          <StatCard label="Total" value={followUps.length} icon={<Phone size={18} />} color={C.blue} />
          <StatCard label="Completed" value={followUps.filter(f => f.status === 'Completed').length} icon={<CheckSquare size={18} />} color={C.success} />
          <StatCard label="In Progress" value={followUps.filter(f => f.status === 'In Progress').length} icon={<Activity size={18} />} color={C.warning} />
        </Grid>
        <Btn onClick={() => setShowModal(true)} color={C.navy}><Phone size={14} /> Submit Follow-Up</Btn>
      </div>

      <Panel title="My Follow-Up Reports">
        <DataTable
          columns={[
            { key: 'member_name', label: 'Member' },
            { key: 'date', label: 'Date' },
            { key: 'method', label: 'Method', render: v => <Badge label={v} color={C.blue} /> },
            { key: 'notes', label: 'Notes', render: v => <span style={{ color: C.textSecondary, fontSize: 12, maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span> },
            { key: 'outcome', label: 'Outcome', render: v => v || '—' },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
          ]}
          rows={followUps}
          emptyText="No follow-up reports yet."
        />
      </Panel>

      {showModal && (
        <Modal title="Submit Follow-Up Report" onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select label="Member *" value={form.memberId} onChange={v => setForm({ ...form, memberId: v })}
              options={myMembers.map(m => ({ value: m.id, label: `${m.first_name} ${m.last_name}` }))} required />
            <Select label="Method" value={form.method} onChange={v => setForm({ ...form, method: v })} options={FOLLOWUP_METHODS} />
            <Textarea label="Notes *" value={form.notes} onChange={v => setForm({ ...form, notes: v })} placeholder="What happened? Prayer, visit, call..." rows={3} required />
            <Input label="Outcome" value={form.outcome} onChange={v => setForm({ ...form, outcome: v })} placeholder="e.g. Will attend Sunday service..." />
            <Select label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={FOLLOWUP_STATUSES} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="outline" color={C.textSecondary} onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn onClick={handleSubmit} color={C.navy} disabled={loading || !form.memberId || !form.notes}>
                {loading ? 'Submitting...' : 'Submit Report'}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Reports() {
  const { profile } = useAuth();
  const [members, setMembers] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  useEffect(() => {
    Promise.all([
      getMembers({ registeredBy: profile.id }),
      getFollowUps({ pastorId: profile.id }),
    ]).then(([m, f]) => { setMembers(m); setFollowUps(f); });
  }, []);
  const kdfBreakdown = Object.entries(members.reduce((acc, m) => { acc[m.kdf_area] = (acc[m.kdf_area] || 0) + 1; return acc; }, {})).map(([kdf_area, count]) => ({ kdf_area, count }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `${C.success}0D`, border: `1px solid ${C.success}25`, borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.success, marginBottom: 10 }}>My Activity — Visible to Bishop and Admin</div>
        <Grid cols="repeat(4, 1fr)" gap={12}>
          {[
            { v: members.length, l: 'Registered' },
            { v: members.filter(m => m.status === 'New Convert').length, l: 'New Converts' },
            { v: followUps.length, l: 'Follow-Ups' },
            { v: followUps.filter(f => f.status === 'Completed').length, l: 'Completed' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 22, fontWeight: 500, color: C.textPrimary }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{s.l}</div>
            </div>
          ))}
        </Grid>
      </div>
      <Panel title="My Members by KDF Area">
        <DataTable
          columns={[
            { key: 'kdf_area', label: 'KDF Area' },
            { key: 'count', label: 'Members', render: v => <Badge label={v} color={C.purple} /> },
          ]}
          rows={kdfBreakdown}
          emptyText="No members yet."
        />
      </Panel>
    </div>
  );
}
