// src/components/kdf/KDFDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { StatCard, Panel, Badge, DataTable, Btn, Modal, Select, Textarea, SearchInput, C, Alert, Grid, StatusBadge, FilterSelect, InfoRow, SectionTitle, EmptyState } from '../shared/UI';
import { getMembers, getFollowUps, createFollowUp, addLog } from '../../lib/db';
import { KDF_AREAS, FOLLOWUP_METHODS, FOLLOWUP_STATUSES, MEMBER_STATUSES } from '../../data/constants';
import { Users, Star, CheckSquare, Phone, Activity, MessageSquare, MapPin, Building2, Briefcase } from 'lucide-react';

export default function KDFDashboard({ activeTab }) {
  const map = { overview: Overview, kdfMembers: KDFMembers, followup: FollowUp, reports: Reports };
  const Comp = map[activeTab] || Overview;
  return <Comp />;
}

function Overview() {
  const { profile } = useAuth();
  const myArea = profile?.kdf_area;
  const areaData = KDF_AREAS.find(k => k.name === myArea);
  const [members, setMembers] = useState([]);
  useEffect(() => { getMembers({ kdfArea: myArea }).then(setMembers); }, [myArea]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.danger}10, ${C.purple}08)`, border: `1px solid ${C.danger}25`, borderRadius: 14, padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: C.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={18} color={C.danger} /> {myArea}</div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>KDF Area Coordinator — {profile?.name}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Your activities are visible to Bishop and Admin.</div>
          </div>
          <Badge label={`${members.length} members`} color={C.danger} />
        </div>
        {areaData?.assistantCoordinator && (
          <div style={{ marginTop: 12, padding: '9px 13px', background: 'rgba(255,255,255,0.7)', borderRadius: 8, fontSize: 12, color: C.textSecondary, border: `0.5px solid ${C.border}` }}>
            Assistant Coordinator: <strong style={{ color: C.navy }}>{areaData.assistantCoordinator}</strong>
            {areaData.assistantPhone && <span style={{ marginLeft: 8, color: C.textMuted }}>· {areaData.assistantPhone}</span>}
          </div>
        )}
      </div>

      <Grid cols="repeat(auto-fit, minmax(160px, 1fr))">
        <StatCard label="Area Members" value={members.length} icon={<MapPin size={18} />} color={C.danger} />
        <StatCard label="New Converts" value={members.filter(m => m.status === 'New Convert').length} icon={<Star size={18} />} color={C.blue} sub="Need follow-up" />
        <StatCard label="Active Members" value={members.filter(m => m.status === 'Active Member').length} icon={<CheckSquare size={18} />} color={C.success} />
        <StatCard label="Workers" value={members.filter(m => m.status === 'Worker').length} icon={<Briefcase size={18} />} color={C.gold} />
      </Grid>

      <Panel title={`Members in ${myArea}`}>
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: (_, r) => <strong style={{ color: C.textPrimary }}>{r.first_name} {r.last_name}</strong> },
            { key: 'phone', label: 'Phone' },
            { key: 'department', label: 'Department', render: v => v || '—' },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            { key: 'follow_up_count', label: 'Follow-Ups', render: v => <Badge label={v || 0} color={C.gold} /> },
          ]}
          rows={members}
          emptyText="No members assigned to this area yet."
        />
      </Panel>
    </div>
  );
}

function KDFMembers() {
  const { profile } = useAuth();
  const myArea = profile?.kdf_area;
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  useEffect(() => { getMembers({ kdfArea: myArea }).then(setMembers); }, [myArea]);
  const filtered = members.filter(m =>
    `${m.first_name} ${m.last_name} ${m.phone} ${m.address} ${m.department}`.toLowerCase().includes(search.toLowerCase())
    && (!filter || m.status === filter)
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}><SearchInput value={search} onChange={setSearch} placeholder={`Search ${myArea} members...`} /></div>
        <FilterSelect value={filter} onChange={setFilter} options={MEMBER_STATUSES.map(s => ({ value: s, label: s }))} placeholder="All Statuses" />
        <Badge label={`${filtered.length} of ${members.length}`} color={C.danger} />
      </div>
      <Panel>
        <DataTable
          columns={[
            { key: 'name', label: 'Full Name', render: (_, r) => <strong style={{ color: C.textPrimary }}>{r.first_name} {r.last_name}</strong> },
            { key: 'phone', label: 'Phone' },
            { key: 'address', label: 'Address' },
            { key: 'department', label: 'Department', render: v => v || '—' },
            { key: 'affinity_group', label: 'Affinity', render: v => v ? <Badge label={v} color={C.blue} /> : '—' },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            { key: 'date_of_birth', label: 'DOB', render: v => v || '—' },
            { key: 'spiritual_status', label: 'Spiritual' },
            { key: 'registered_by_name', label: 'Registered By' },
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
  const myArea = profile?.kdf_area;
  const [members, setMembers] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ memberId: '', notes: '', method: 'Visit', outcome: '', status: 'In Progress' });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    Promise.all([getMembers({ kdfArea: myArea }), getFollowUps({ kdfArea: myArea })]).then(([m, f]) => { setMembers(m); setFollowUps(f); });
  }, [myArea]);

  const newConverts = members.filter(m => m.status === 'New Convert');

  const handleSubmit = async () => {
    if (!form.memberId || !form.notes) return;
    setLoading(true);
    const member = members.find(m => m.id === form.memberId);
    const { data } = await createFollowUp({
      member_id: form.memberId,
      member_name: `${member?.first_name} ${member?.last_name}`,
      kdf_area: myArea,
      method: form.method, notes: form.notes,
      outcome: form.outcome, status: form.status,
      date: new Date().toISOString().slice(0, 10),
    });
    if (data) {
      await addLog(profile.id, profile.name, 'Logged follow-up', `${member?.first_name} ${member?.last_name} in ${myArea}`);
      setFollowUps([data, ...followUps]);
    }
    setShowModal(false);
    setForm({ memberId: '', notes: '', method: 'Visit', outcome: '', status: 'In Progress' });
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {newConverts.length > 0 && (
        <div style={{ background: C.infoBg, border: `1px solid ${C.blue}30`, borderRadius: 12, padding: '13px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.blue, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={14} /> {newConverts.length} New Convert{newConverts.length > 1 ? 's' : ''} in your area need follow-up
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {newConverts.map(m => <Badge key={m.id} label={`${m.first_name} ${m.last_name}`} color={C.blue} />)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <Grid cols="repeat(3, 1fr)" gap={12}>
          <StatCard label="Total Follow-Ups" value={followUps.length} icon={<Phone size={18} />} color={C.danger} />
          <StatCard label="Completed" value={followUps.filter(f => f.status === 'Completed').length} icon={<CheckSquare size={18} />} color={C.success} />
          <StatCard label="In Progress" value={followUps.filter(f => f.status === 'In Progress').length} icon={<Activity size={18} />} color={C.warning} />
        </Grid>
        <Btn onClick={() => setShowModal(true)} color={C.navy}><Phone size={14} /> Log Follow-Up</Btn>
      </div>

      <Panel title={`Follow-Up Log — ${myArea}`}>
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
          emptyText="No follow-up records yet."
        />
      </Panel>

      {showModal && (
        <Modal title="Log Follow-Up" onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select label="Select Member *" value={form.memberId} onChange={v => setForm({ ...form, memberId: v })}
              options={members.map(m => ({ value: m.id, label: `${m.first_name} ${m.last_name} (${m.status})` }))} required />
            <Select label="Follow-Up Method" value={form.method} onChange={v => setForm({ ...form, method: v })} options={FOLLOWUP_METHODS} />
            <Textarea label="Notes *" value={form.notes} onChange={v => setForm({ ...form, notes: v })} placeholder="What happened? Prayer, visit, call, discussion..." rows={3} required />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary }}>Outcome</label>
              <input value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })} placeholder="e.g. Will attend Sunday service, Needs counselling..." style={{ padding: '10px 12px', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPrimary, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <Select label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={FOLLOWUP_STATUSES} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="outline" color={C.textSecondary} onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn onClick={handleSubmit} color={C.navy} disabled={loading || !form.memberId || !form.notes}>{loading ? 'Submitting...' : 'Submit'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Reports() {
  const { profile } = useAuth();
  const myArea = profile?.kdf_area;
  const [members, setMembers] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [reportText, setReportText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    Promise.all([getMembers({ kdfArea: myArea }), getFollowUps({ kdfArea: myArea })]).then(([m, f]) => { setMembers(m); setFollowUps(f); });
  }, [myArea]);

  const handleSubmit = async () => {
    if (!reportText.trim()) return;
    await addLog(profile.id, profile.name, 'Submitted KDF area report', `${myArea} monthly area report submitted`);
    setSubmitted(true); setReportText('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  const deptBreakdown = Object.entries(members.reduce((acc, m) => { if (m.department) acc[m.department] = (acc[m.department] || 0) + 1; return acc; }, {})).map(([dept, count]) => ({ dept, count }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `${C.danger}0A`, border: `1px solid ${C.danger}20`, borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.danger, marginBottom: 10 }}>{myArea} — Area Report (Visible to Bishop and Admin)</div>
        <Grid cols="repeat(4, 1fr)" gap={12}>
          {[{ v: members.length, l: 'Total Members' }, { v: members.filter(m => m.status === 'New Convert').length, l: 'New Converts' }, { v: followUps.length, l: 'Follow-Ups' }, { v: followUps.filter(f => f.status === 'Completed').length, l: 'Completed' }].map((s, i) => (
            <div key={i}><div style={{ fontSize: 22, fontWeight: 500, color: C.textPrimary }}>{s.v}</div><div style={{ fontSize: 11, color: C.textMuted }}>{s.l}</div></div>
          ))}
        </Grid>
      </div>
      {deptBreakdown.length > 0 && (
        <Panel title="Members by Department">
          <DataTable columns={[{ key: 'dept', label: 'Department' }, { key: 'count', label: 'Count', render: v => <Badge label={v} color={C.purple} /> }]} rows={deptBreakdown} />
        </Panel>
      )}
      <Panel title="Submit Monthly Area Report">
        <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 14, lineHeight: 1.6 }}>Submit your monthly report for {myArea}. Visible to Bishop and Admin.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Textarea value={reportText} onChange={setReportText} placeholder={`Write your ${myArea} monthly area report here...\n\nInclude: member updates, new converts, follow-up progress, challenges, prayer requests...`} rows={6} />
          {submitted && <Alert type="success" message="Area report submitted! Bishop and Admin have been notified." onDismiss={() => setSubmitted(false)} />}
          <Btn onClick={handleSubmit} color={C.navy} disabled={!reportText.trim()}>Submit Area Report</Btn>
        </div>
      </Panel>
    </div>
  );
}
