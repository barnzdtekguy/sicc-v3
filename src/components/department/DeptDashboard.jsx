// src/components/department/DeptDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { StatCard, Panel, Badge, DataTable, Btn, Modal, Input, Select, Textarea, SearchInput, C, Alert, Grid, StatusBadge, FilterSelect, EmptyState } from '../shared/UI';
import { getMembers, getAttendance, createAttendance, addLog } from '../../lib/db';
import { DEPARTMENTS, SERVICE_TYPES, MEMBER_STATUSES } from '../../data/constants';
import { Users, CheckSquare, Star, Briefcase, Calendar, Activity, MapPin, Building2 } from 'lucide-react';

export default function DeptDashboard({ activeTab }) {
  const map = { overview: Overview, deptMembers: DeptMembers, attendance: DeptAttendance, reports: Reports };
  const Comp = map[activeTab] || Overview;
  return <Comp />;
}

function Overview() {
  const { profile } = useAuth();
  const myDept = profile?.department;
  const dept = DEPARTMENTS.find(d => d.name === myDept);
  const [members, setMembers] = useState([]);
  useEffect(() => { getMembers({ department: myDept }).then(setMembers); }, [myDept]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${dept?.color || C.purple}12, ${dept?.color || C.purple}04)`, border: `1px solid ${dept?.color || C.purple}25`, borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Building2 size={36} color={dept?.color || C.purple} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: C.textPrimary }}>{myDept}</div>
          <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>Welcome, {profile?.name} · Department Leader</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Your activities are visible to Bishop and Admin.</div>
        </div>
      </div>
      <Grid cols="repeat(auto-fit, minmax(160px, 1fr))">
        <StatCard label="Dept Members" value={members.length} icon={<Users size={18} />} color={dept?.color || C.purple} />
        <StatCard label="Workers" value={members.filter(m => m.status === 'Worker').length} icon={<Briefcase size={18} />} color={C.gold} />
        <StatCard label="Active Members" value={members.filter(m => m.status === 'Active Member').length} icon={<CheckSquare size={18} />} color={C.success} />
        <StatCard label="New Converts" value={members.filter(m => m.status === 'New Convert').length} icon={<Star size={18} />} color={C.blue} />
      </Grid>
      <Panel title={`${myDept} — Member List`}>
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: (_, r) => <strong style={{ color: C.textPrimary }}>{r.first_name} {r.last_name}</strong> },
            { key: 'phone', label: 'Phone' },
            { key: 'kdf_area', label: 'KDF Area', render: v => <Badge label={v} color={C.purple} /> },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            { key: 'spiritual_status', label: 'Spiritual Status' },
          ]}
          rows={members}
          emptyText="No members in this department yet."
        />
      </Panel>
    </div>
  );
}

function DeptMembers() {
  const { profile } = useAuth();
  const myDept = profile?.department;
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  useEffect(() => { getMembers({ department: myDept }).then(setMembers); }, [myDept]);
  const filtered = members.filter(m =>
    `${m.first_name} ${m.last_name} ${m.phone} ${m.address}`.toLowerCase().includes(search.toLowerCase())
    && (!filter || m.status === filter)
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}><SearchInput value={search} onChange={setSearch} placeholder={`Search ${myDept} members...`} /></div>
        <FilterSelect value={filter} onChange={setFilter} options={MEMBER_STATUSES.map(s => ({ value: s, label: s }))} placeholder="All Statuses" />
        <Badge label={`${filtered.length} members`} color={C.purple} />
      </div>
      <Panel>
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: (_, r) => <strong style={{ color: C.textPrimary }}>{r.first_name} {r.last_name}</strong> },
            { key: 'phone', label: 'Phone' },
            { key: 'address', label: 'Address' },
            { key: 'kdf_area', label: 'KDF Area', render: v => <Badge label={v} color={C.purple} /> },
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

function DeptAttendance() {
  const { profile } = useAuth();
  const myDept = profile?.department;
  const dept = DEPARTMENTS.find(d => d.name === myDept);
  const deptColor = dept?.color || C.purple;
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), service: 'Sunday Service', dept_count: '' });
  const [loading, setLoading] = useState(false);
  useEffect(() => { getAttendance().then(all => setRecords(all.filter(a => a.dept_name === myDept))); }, [myDept]);

  const handleAdd = async () => {
    if (!form.date || !form.dept_count) return;
    setLoading(true);
    const { data } = await createAttendance({
      date: form.date, service: form.service,
      count: Number(form.dept_count), dept_name: myDept,
      dept_count: Number(form.dept_count),
      recorded_by: profile.id, recorded_by_name: profile.name,
    });
    if (data) {
      await addLog(profile.id, profile.name, 'Marked attendance', `${myDept}: ${form.dept_count} present on ${form.date}`);
      setRecords([data, ...records]);
    }
    setShowModal(false);
    setForm({ date: new Date().toISOString().slice(0, 10), service: 'Sunday Service', dept_count: '' });
    setLoading(false);
  };

  const avg = records.length ? Math.round(records.reduce((a, b) => a + (b.dept_count || b.count), 0) / records.length) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <Grid cols="repeat(3, 1fr)" gap={12}>
          <StatCard label="Last Service" value={records[0]?.dept_count ?? '—'} icon={<CheckSquare size={18} />} color={deptColor} sub={records[0]?.service} />
          <StatCard label="Sessions Logged" value={records.length} icon={<Calendar size={18} />} color={C.gold} />
          <StatCard label="Average" value={avg || '—'} icon={<Activity size={18} />} color={C.success} />
        </Grid>
        <Btn onClick={() => setShowModal(true)} color={C.navy}><CheckSquare size={14} /> Mark Attendance</Btn>
      </div>
      <Panel title={`${myDept} — Attendance Records`}>
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'service', label: 'Service Type' },
            { key: 'dept_count', label: 'Members Present', render: (v, r) => <strong style={{ color: deptColor, fontSize: 16 }}>{v || r.count}</strong> },
            { key: 'recorded_by_name', label: 'Recorded By' },
          ]}
          rows={records}
          emptyText="No attendance records yet."
        />
      </Panel>
      {showModal && (
        <Modal title="Mark Department Attendance" onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Date" value={form.date} onChange={v => setForm({ ...form, date: v })} type="date" required />
            <Select label="Service Type" value={form.service} onChange={v => setForm({ ...form, service: v })} options={SERVICE_TYPES} />
            <Input label={`${myDept} Members Present`} value={form.dept_count} onChange={v => setForm({ ...form, dept_count: v })} type="number" placeholder="Number present" required />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="outline" color={C.textSecondary} onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn onClick={handleAdd} color={C.navy} disabled={loading || !form.dept_count}>{loading ? 'Saving...' : 'Save'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Reports() {
  const { profile } = useAuth();
  const myDept = profile?.department;
  const dept = DEPARTMENTS.find(d => d.name === myDept);
  const deptColor = dept?.color || C.purple;
  const [members, setMembers] = useState([]);
  const [reportText, setReportText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { getMembers({ department: myDept }).then(setMembers); }, [myDept]);

  const handleSubmit = async () => {
    if (!reportText.trim()) return;
    await addLog(profile.id, profile.name, 'Submitted dept report', `${myDept} department report submitted`);
    setSubmitted(true); setReportText('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `${deptColor}0D`, border: `1px solid ${deptColor}25`, borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: deptColor, marginBottom: 10 }}>{myDept} — Summary (Visible to Bishop and Admin)</div>
        <Grid cols="repeat(4, 1fr)" gap={12}>
          {[{ v: members.length, l: 'Total' }, { v: members.filter(m => m.status === 'Worker').length, l: 'Workers' }, { v: members.filter(m => m.status === 'Active Member').length, l: 'Active' }, { v: members.filter(m => m.status === 'New Convert').length, l: 'New Converts' }].map((s, i) => (
            <div key={i}><div style={{ fontSize: 22, fontWeight: 500, color: C.textPrimary }}>{s.v}</div><div style={{ fontSize: 11, color: C.textMuted }}>{s.l}</div></div>
          ))}
        </Grid>
      </div>
      <Panel title="Submit Department Report">
        <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 14, lineHeight: 1.6 }}>This report will be visible to Bishop Enobong Etteh and Admin.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Textarea value={reportText} onChange={setReportText} placeholder={`Write your ${myDept} report here...\n\nInclude: activities, prayer requests, challenges, member updates...`} rows={6} />
          {submitted && <Alert type="success" message="Report submitted! Bishop and Admin have been notified." />}
          <Btn onClick={handleSubmit} color={C.navy} disabled={!reportText.trim()}>Submit Report</Btn>
        </div>
      </Panel>
    </div>
  );
}
