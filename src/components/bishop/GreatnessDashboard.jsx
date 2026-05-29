// src/components/pastor/GreatnessDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { StatCard, Panel, Badge, DataTable, Btn, Modal, Input, Select, C, Alert, Grid, SearchInput, SectionTitle, EmptyState } from '../shared/UI';
import { Users, CheckSquare, Calendar, BarChart2, UserPlus, Search, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

const PROGRAMME = '32 Days of Greatness';
const TOTAL_DAYS = 32;
const DEPT_OPTIONS = [
  'Media', 'Choir (Faith Dynamite Voice)', 'Protocol',
  'Affinity Group – Men', 'Affinity Group – Women',
  'Affinity – Diplomats', 'Affinity – Teenagers',
  'Prayer Department', 'Wisdom Training School (WTS)',
  'Ushering Department', 'Staff', 'Decoration Team',
  'Assimilation', 'Sanctuary Keepers', 'None',
];

// ── Supabase helpers ─────────────────────────────────────────
async function getAttendees() {
  const { data } = await supabase.from('greatness_attendees').select('*').order('name');
  return data || [];
}

async function getAttendanceRecords(day) {
  const { data } = await supabase.from('greatness_attendance')
    .select('*')
    .eq('day_number', day);
  return data || [];
}

async function getAllAttendance() {
  const { data } = await supabase.from('greatness_attendance').select('*');
  return data || [];
}

async function addAttendee(attendee) {
  const { data, error } = await supabase.from('greatness_attendees')
    .insert(attendee).select().single();
  return { data, error };
}

async function markAttendance(attendeeId, dayNumber, status, markedBy) {
  // Upsert — update if exists, insert if not
  const { data, error } = await supabase.from('greatness_attendance')
    .upsert({
      attendee_id: attendeeId,
      day_number: dayNumber,
      status,
      marked_by: markedBy,
      marked_at: new Date().toISOString(),
    }, { onConflict: 'attendee_id,day_number' })
    .select().single();
  return { data, error };
}

// ── Main Component ───────────────────────────────────────────
export default function GreatnessDashboard() {
  const [tab, setTab] = useState('mark');
  const tabs = [
    { key: 'mark',    label: 'Mark Attendance', icon: <CheckSquare size={15} /> },
    { key: 'records', label: 'View Records',     icon: <Calendar size={15} /> },
    { key: 'chart',   label: 'Charts',           icon: <BarChart2 size={15} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.gold}20, ${C.gold}05)`, border: `1px solid ${C.gold}30`, borderRadius: 14, padding: '18px 22px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.gold, marginBottom: 4 }}>32 Days of Greatness</div>
        <div style={{ fontSize: 13, color: C.textSecondary }}>Programme Attendance Tracker — Salem International Christian Centre</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', background: 'transparent', border: 'none',
            borderBottom: tab === t.key ? `2px solid ${C.gold}` : '2px solid transparent',
            color: tab === t.key ? C.gold : C.textSecondary,
            fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
            cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1,
            transition: 'all 0.15s',
          }}>{t.icon}{t.label}</button>
        ))}
      </div>

      {tab === 'mark'    && <MarkAttendance />}
      {tab === 'records' && <ViewRecords />}
      {tab === 'chart'   && <Charts />}
    </div>
  );
}

// ── Mark Attendance Tab ──────────────────────────────────────
function MarkAttendance() {
  const { profile } = useAuth();
  const [day, setDay] = useState(1);
  const [attendees, setAttendees] = useState([]);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', phone: '', email: '', department: '' });
  const [addMsg, setAddMsg] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    load();
  }, [day]);

  const load = async () => {
    const [a, r] = await Promise.all([getAttendees(), getAttendanceRecords(day)]);
    setAttendees(a);
    setRecords(r);
  };

  // Get status for a specific attendee on current day
  const getStatus = (attendeeId) => {
    const rec = records.find(r => r.attendee_id === attendeeId);
    return rec?.status || null;
  };

  // Mark present or absent
  const mark = async (attendeeId, status) => {
    setSaving(prev => ({ ...prev, [attendeeId]: true }));
    await markAttendance(attendeeId, day, status, profile.name);
    await load();
    setSaving(prev => ({ ...prev, [attendeeId]: false }));
  };

  // Search filter — show matching attendees
  const filtered = attendees.filter(a =>
    `${a.name} ${a.phone} ${a.department}`.toLowerCase().includes(search.toLowerCase())
  );

  // Stats for this day
  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  const unmarkedCount = attendees.length - records.length;

  // Add new attendee
  const handleAdd = async () => {
    if (!newForm.name || !newForm.phone) { setAddMsg({ type: 'warning', text: 'Name and phone are required.' }); return; }
    setAddLoading(true);
    // Check if already exists
    const exists = attendees.find(a => a.phone === newForm.phone);
    if (exists) { setAddMsg({ type: 'warning', text: 'An attendee with this phone number already exists.' }); setAddLoading(false); return; }
    const { data, error } = await addAttendee({ name: newForm.name, phone: newForm.phone, email: newForm.email || null, department: newForm.department || null });
    if (error) { setAddMsg({ type: 'danger', text: error.message }); setAddLoading(false); return; }
    setAttendees([...attendees, data].sort((a, b) => a.name.localeCompare(b.name)));
    setShowAddModal(false);
    setNewForm({ name: '', phone: '', email: '', department: '' });
    setAddMsg(null);
    setSuccessMsg(`${newForm.name} added successfully!`);
    setTimeout(() => setSuccessMsg(''), 3000);
    setAddLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Day selector + stats */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px' }}>
          <span style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500 }}>Day</span>
          <button onClick={() => setDay(d => Math.max(1, d - 1))} style={dayBtn}>‹</button>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.gold, minWidth: 32, textAlign: 'center' }}>{day}</span>
          <button onClick={() => setDay(d => Math.min(TOTAL_DAYS, d + 1))} style={dayBtn}>›</button>
          <span style={{ fontSize: 12, color: C.textMuted }}>of {TOTAL_DAYS}</span>
        </div>
        <Grid cols="repeat(3, 1fr)" gap={10}>
          <StatCard label="Present" value={presentCount} icon={<CheckSquare size={16} />} color={C.success} />
          <StatCard label="Absent" value={absentCount} icon={<X size={16} />} color={C.danger} />
          <StatCard label="Not Marked" value={unmarkedCount} icon={<Users size={16} />} color={C.gold} />
        </Grid>
        <Btn onClick={() => setShowAddModal(true)} color={C.navy}><UserPlus size={14} /> Add Attendee</Btn>
      </div>

      {successMsg && <Alert type="success" message={successMsg} onDismiss={() => setSuccessMsg('')} />}

      {/* Search */}
      <SearchInput value={search} onChange={setSearch} placeholder="Type a name to search existing attendees..." />

      {/* Attendee list with mark buttons */}
      <Panel title={`Day ${day} — Attendance (${attendees.length} registered)`}>
        {filtered.length === 0 && (
          <EmptyState
            icon={<Users size={32} color={C.textMuted} />}
            title={search ? 'No attendee found' : 'No attendees registered yet'}
            description={search ? `"${search}" not found. Click Add Attendee to register them.` : 'Click Add Attendee to register the first person.'}
            action={<Btn onClick={() => setShowAddModal(true)} color={C.navy}><UserPlus size={14} /> Add Attendee</Btn>}
          />
        )}
        {filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 140px', gap: 8, padding: '8px 12px', background: C.pageBg, borderRadius: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>Name</span>
              <span style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>Phone</span>
              <span style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>Department</span>
              <span style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500, textAlign: 'center' }}>Status</span>
            </div>
            {filtered.map(a => {
              const status = getStatus(a.id);
              const isSaving = saving[a.id];
              return (
                <div key={a.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 120px 140px',
                  gap: 8, padding: '10px 12px',
                  borderBottom: `0.5px solid ${C.border}`,
                  alignItems: 'center',
                  background: status === 'Present' ? `${C.success}08` : status === 'Absent' ? `${C.danger}05` : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{a.name}</div>
                    {a.email && <div style={{ fontSize: 11, color: C.textMuted }}>{a.email}</div>}
                  </div>
                  <div style={{ fontSize: 12, color: C.textSecondary }}>{a.phone}</div>
                  <div style={{ fontSize: 12, color: C.textSecondary }}>{a.department || '—'}</div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {isSaving ? (
                      <span style={{ fontSize: 12, color: C.textMuted }}>Saving...</span>
                    ) : (
                      <>
                        <button
                          onClick={() => mark(a.id, 'Present')}
                          style={{
                            padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.success}`,
                            background: status === 'Present' ? C.success : 'transparent',
                            color: status === 'Present' ? '#fff' : C.success,
                            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'all 0.15s',
                          }}
                        >Present</button>
                        <button
                          onClick={() => mark(a.id, 'Absent')}
                          style={{
                            padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.danger}`,
                            background: status === 'Absent' ? C.danger : 'transparent',
                            color: status === 'Absent' ? '#fff' : C.danger,
                            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'all 0.15s',
                          }}
                        >Absent</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Add Attendee Modal */}
      {showAddModal && (
        <Modal title="Add New Attendee" onClose={() => { setShowAddModal(false); setAddMsg(null); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: C.textSecondary, background: C.infoBg, borderRadius: 8, padding: '10px 14px', border: `1px solid ${C.blue}20` }}>
              Once added, this person's name will appear in the attendance list for all 32 days. Next time you type their name in the search, their record will come up automatically.
            </div>
            <Input label="Full Name *" value={newForm.name} onChange={v => setNewForm({ ...newForm, name: v })} placeholder="e.g. John Adeyemi" required />
            <Input label="Phone Number *" value={newForm.phone} onChange={v => setNewForm({ ...newForm, phone: v })} placeholder="08XXXXXXXXX" required />
            <Input label="Email Address" value={newForm.email} onChange={v => setNewForm({ ...newForm, email: v })} type="email" placeholder="john@email.com" />
            <Select label="Department" value={newForm.department} onChange={v => setNewForm({ ...newForm, department: v })} options={DEPT_OPTIONS.map(d => ({ value: d, label: d }))} />
            {addMsg && <Alert type={addMsg.type} message={addMsg.text} onDismiss={() => setAddMsg(null)} />}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="outline" color={C.textSecondary} onClick={() => { setShowAddModal(false); setAddMsg(null); }}>Cancel</Btn>
              <Btn onClick={handleAdd} color={C.navy} disabled={addLoading}>{addLoading ? 'Adding...' : 'Add Attendee'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── View Records Tab ─────────────────────────────────────────
function ViewRecords() {
  const [attendees, setAttendees] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [dayFilter, setDayFilter] = useState('');

  useEffect(() => {
    Promise.all([getAttendees(), getAllAttendance()]).then(([a, r]) => {
      setAttendees(a); setAllRecords(r);
    });
  }, []);

  // Per-person attendance summary
  const summary = attendees.map(a => {
    const personRecords = allRecords.filter(r => r.attendee_id === a.id);
    const present = personRecords.filter(r => r.status === 'Present').length;
    const absent = personRecords.filter(r => r.status === 'Absent').length;
    const marked = personRecords.length;
    const pct = marked > 0 ? Math.round((present / marked) * 100) : 0;
    return { ...a, present, absent, marked, pct, records: personRecords };
  }).filter(a =>
    `${a.name} ${a.phone} ${a.department}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search attendee name..." />
        </div>
        <Badge label={`${attendees.length} registered`} color={C.gold} />
      </div>

      <Panel title="Attendance Summary — All Attendees">
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: v => <strong style={{ color: C.textPrimary }}>{v}</strong> },
            { key: 'phone', label: 'Phone' },
            { key: 'department', label: 'Department', render: v => v || '—' },
            { key: 'present', label: 'Days Present', render: v => <Badge label={v} color={C.success} /> },
            { key: 'absent', label: 'Days Absent', render: v => <Badge label={v} color={C.danger} /> },
            { key: 'marked', label: 'Days Marked', render: v => <Badge label={`${v}/${TOTAL_DAYS}`} color={C.blue} /> },
            { key: 'pct', label: 'Attendance %', render: v => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 60, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${v}%`, height: '100%', background: v >= 75 ? C.success : v >= 50 ? C.warning : C.danger, borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: 12, color: C.textSecondary }}>{v}%</span>
              </div>
            )},
            { key: 'view', label: '', render: (_, r) => <Btn size="sm" variant="ghost" color={C.gold} onClick={() => setSelected(r)}>View</Btn> },
          ]}
          rows={summary}
          emptyText="No attendees registered yet."
        />
      </Panel>

      {/* Individual detail modal */}
      {selected && (
        <Modal title={`Attendance Record — ${selected.name}`} onClose={() => setSelected(null)} width={560}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Badge label={`${selected.present} Present`} color={C.success} />
            <Badge label={`${selected.absent} Absent`} color={C.danger} />
            <Badge label={`${selected.pct}% Attendance`} color={selected.pct >= 75 ? C.success : C.warning} />
            <Badge label={selected.phone} color={C.blue} />
            {selected.department && <Badge label={selected.department} color={C.purple} />}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
            {Array.from({ length: TOTAL_DAYS }, (_, i) => {
              const dayNum = i + 1;
              const rec = selected.records.find(r => r.day_number === dayNum);
              const status = rec?.status;
              return (
                <div key={dayNum} style={{
                  aspect: '1/1', borderRadius: 8, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 2,
                  background: status === 'Present' ? `${C.success}20` : status === 'Absent' ? `${C.danger}15` : C.pageBg,
                  border: `1px solid ${status === 'Present' ? C.success : status === 'Absent' ? C.danger : C.border}`,
                  padding: '6px 4px',
                }}>
                  <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>D{dayNum}</div>
                  <div style={{ fontSize: 14 }}>
                    {status === 'Present' ? '✓' : status === 'Absent' ? '✗' : '·'}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 12, color: C.textMuted }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ color: C.success }}>✓</span> Present</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ color: C.danger }}>✗</span> Absent</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>· Not marked yet</span>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Charts Tab ───────────────────────────────────────────────
function Charts() {
  const [allRecords, setAllRecords] = useState([]);
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    Promise.all([getAllAttendance(), getAttendees()]).then(([r, a]) => {
      setAllRecords(r); setAttendees(a);
    });
  }, []);

  // Daily attendance chart data
  const dailyData = Array.from({ length: TOTAL_DAYS }, (_, i) => {
    const day = i + 1;
    const dayRecs = allRecords.filter(r => r.day_number === day);
    const present = dayRecs.filter(r => r.status === 'Present').length;
    const absent = dayRecs.filter(r => r.status === 'Absent').length;
    return { day: `D${day}`, present, absent };
  });

  // Top attendees by presence
  const topAttendees = attendees.map(a => ({
    name: a.name.split(' ')[0],
    present: allRecords.filter(r => r.attendee_id === a.id && r.status === 'Present').length,
  })).sort((a, b) => b.present - a.present).slice(0, 10);

  const totalPresent = allRecords.filter(r => r.status === 'Present').length;
  const totalAbsent = allRecords.filter(r => r.status === 'Absent').length;
  const avgPerDay = dailyData.filter(d => d.present > 0).length > 0
    ? Math.round(totalPresent / dailyData.filter(d => d.present > 0).length)
    : 0;
  const bestDay = dailyData.reduce((best, d) => d.present > (best?.present || 0) ? d : best, null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Grid cols="repeat(auto-fit, minmax(160px, 1fr))">
        <StatCard label="Total Registered" value={attendees.length} icon={<Users size={18} />} color={C.gold} />
        <StatCard label="Total Present Marks" value={totalPresent} icon={<CheckSquare size={18} />} color={C.success} />
        <StatCard label="Avg Per Day" value={avgPerDay} icon={<Calendar size={18} />} color={C.blue} />
        <StatCard label="Best Day" value={bestDay?.day || '—'} icon={<BarChart2 size={18} />} color={C.purple} sub={bestDay ? `${bestDay.present} present` : ''} />
      </Grid>

      <Panel title="Daily Attendance — 32 Days of Greatness">
        {allRecords.length === 0 ? (
          <EmptyState icon={<BarChart2 size={32} color={C.textMuted} />} title="No attendance data yet" description="Start marking attendance to see charts." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fill: C.textMuted, fontSize: 9 }} interval={1} />
              <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} />
              <Tooltip contentStyle={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="present" name="Present" fill={C.success} radius={[3, 3, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill={C.danger} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <Panel title="Attendance Trend">
        {allRecords.length === 0 ? (
          <EmptyState icon={<BarChart2 size={32} color={C.textMuted} />} title="No data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData.filter(d => d.present > 0 || d.absent > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fill: C.textMuted, fontSize: 9 }} />
              <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} />
              <Tooltip contentStyle={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="present" name="Present" stroke={C.success} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Panel>

      {topAttendees.length > 0 && (
        <Panel title="Top Attendees by Presence">
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'present', label: 'Days Present', render: v => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 80, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(v / TOTAL_DAYS) * 100}%`, height: '100%', background: C.success, borderRadius: 3 }} />
                  </div>
                  <Badge label={v} color={C.success} />
                </div>
              )},
            ]}
            rows={topAttendees}
          />
        </Panel>
      )}
    </div>
  );
}

const dayBtn = {
  background: C.pageBg, border: `1px solid ${C.border}`,
  borderRadius: 6, width: 28, height: 28,
  cursor: 'pointer', fontSize: 16, color: C.textPrimary,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'inherit', padding: 0,
};
