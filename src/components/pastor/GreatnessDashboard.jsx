// src/components/pastor/GreatnessDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { DEPARTMENTS, SERVICE_TYPES } from '../../data/constants';
import { StatCard, Panel, Badge, DataTable, Btn, Modal, Input, Select, C, Alert, Grid, SearchInput, EmptyState } from '../shared/UI';
import { Users, CheckSquare, Calendar, BarChart2, UserPlus, X, QrCode, Copy, PlusCircle, Smartphone, ClipboardCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

const PROGRAMME = '32 Days of Greatness';
const GREATNESS_PROGRAMME_ID = 'greatness-32-days';
const TOTAL_DAYS = 32;
const TODAY = new Date().toISOString().slice(0, 10);

const EXTRA_DEPARTMENT_OPTIONS = [
  'Dedication',
  'Missions',
  'Transport',
  'Facility Management/Projects',
  'Security',
  'Welfare',
  'Finance',
  'Medical',
  'Education/Scholarship',
  'Baptism Ministry',
  'Legal Council',
  'Bookshop/Reading Culture',
  'Healing & Deliverance Crack Team',
  'Counselling/Call Centre',
  'Marriage/Couples',
  'Singles Connect',
  'Visitation',
  'Publicity/Branding',
  "Salem Elder's Ministry",
  'Communion',
  'Children',
  'Announcement',
  'Salem Theatre',
  'Conflict Resolution Team',
  '(NONE)',
];
const DEPT_OPTIONS = [...new Set([...DEPARTMENTS.map(d => d.name), ...EXTRA_DEPARTMENT_OPTIONS])];
const POSITION_OPTIONS = ['Pastor', 'Bishop', 'Invitee', 'Dept. Leader', 'Member', 'Covenant Friend', 'Other'];
const SALEM_FAMILY_OPTIONS = [
  'SALEM FAMILY, PENTECOST CITY',
  'Salem Family, Ahoyaya District Headquarter',
  'SALEM FAMILY, BADORE HEADQUARTER',
  'SALEM FAMILY, VICTORIA ISLAND Headquarter',
  'SALEM FAMILY, Jesutedo',
  'Salem Family, Jesutedo Area Headquarter',
  'Salem Family, Ajah Area Headquarter',
  'SALEM FAMILY, EPE',
  'SALEM FAMILY, MARYLAND',
  'SALEM FAMILY, OWODE',
  'SALEM FAMILY, ONOSA',
  'SALEM FAMILY, GBAGADA HEADQUARTER',
  'SALEM FAMILY, OWORONSHOKI',
  'SALEM FAMILY, ILUPEJU',
  'SALEM FAMILY, BARIGA',
  'SALEM FAMILY, SHOMOLU',
  'SALEM FAMILY, FESTAC HEADQUARTER',
  'SALEM FAMILY, OJO',
  'SALEM Family, Ahoyaya 2',
  'SALEM FAMILY, OKUN AJAH',
  'SALEM FAMILY, AJAH 2',
  'Salem Family, Ketu Area Headquarter',
  'SALEM FAMILY, IKORODU',
  'OJODU AREA Headquarter',
  'NOT A MEMBER',
];
const DEFAULT_PROGRAMMES = [
  { id: GREATNESS_PROGRAMME_ID, name: PROGRAMME, programme_type: '32_days', start_date: TODAY, end_date: '', total_days: TOTAL_DAYS, is_active: true },
  ...SERVICE_TYPES.map(service => ({ id: slugify(service), name: service, programme_type: 'service', start_date: '', end_date: '', total_days: null, is_active: true })),
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function fullName(member) {
  return `${member.first_name || ''} ${member.last_name || ''}`.trim();
}

function clean(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function getCheckInBaseUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

function getProgrammeDay(programme, date, fallbackDay = 1) {
  if (programme?.programme_type !== '32_days') return null;
  if (!programme.start_date || !date) return Number(fallbackDay) || 1;
  const start = new Date(`${programme.start_date}T00:00:00`);
  const selected = new Date(`${date}T00:00:00`);
  const diff = Math.floor((selected - start) / 86400000) + 1;
  return Math.min(TOTAL_DAYS, Math.max(1, diff || fallbackDay || 1));
}

async function getAttendees() {
  const { data } = await supabase.from('greatness_attendees').select('*').order('name');
  return data || [];
}

async function getAttendanceRecords(day) {
  const { data } = await supabase.from('greatness_attendance').select('*').eq('day_number', day);
  return data || [];
}

async function getAllAttendance() {
  const { data } = await supabase.from('greatness_attendance').select('*');
  return data || [];
}

async function addAttendee(attendee) {
  const { data, error } = await supabase.from('greatness_attendees').insert(attendee).select().single();
  return { data, error };
}

async function markAttendance(attendeeId, dayNumber, status, markedBy) {
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

async function getProgrammes() {
  const { data, error } = await supabase.from('attendance_programmes').select('*').order('created_at', { ascending: false });
  if (error) return { data: DEFAULT_PROGRAMMES, error };
  const merged = [...DEFAULT_PROGRAMMES];
  (data || []).forEach(programme => {
    const existing = merged.findIndex(item => item.id === programme.id);
    if (existing >= 0) merged[existing] = { ...merged[existing], ...programme };
    else merged.push(programme);
  });
  return { data: merged.filter(p => p.is_active !== false), error: null };
}

async function createProgramme(programme) {
  const { data, error } = await supabase.from('attendance_programmes').insert(programme).select().single();
  return { data, error };
}

async function getProgrammeRecords(filters = {}) {
  let query = supabase.from('programme_attendance_records').select('*').order('created_at', { ascending: false });
  if (filters.programmeId) query = query.eq('programme_id', filters.programmeId);
  if (filters.date) query = query.eq('attendance_date', filters.date);
  const { data, error } = await query;
  return { data: data || [], error };
}

async function saveProgrammeRecord(record) {
  const phone = normalizePhone(record.phone);
  let existingQuery = supabase.from('programme_attendance_records')
    .select('id')
    .eq('programme_id', record.programme_id)
    .eq('attendance_date', record.attendance_date)
    .limit(1);

  existingQuery = phone
    ? existingQuery.eq('phone_normalized', phone)
    : existingQuery.ilike('attendee_name', record.attendee_name);

  const { data: existing } = await existingQuery;
  const payload = { ...record, phone_normalized: phone, updated_at: new Date().toISOString() };

  if (existing?.[0]?.id) {
    const { data, error } = await supabase.from('programme_attendance_records')
      .update(payload)
      .eq('id', existing[0].id)
      .select()
      .single();
    return { data, error };
  }

  const { data, error } = await supabase.from('programme_attendance_records').insert(payload).select().single();
  return { data, error };
}

async function findExistingPerson({ name, phone }) {
  const phoneDigits = normalizePhone(phone);
  const targetName = clean(name);
  const [membersResult, greatnessResult, recordsResult] = await Promise.all([
    supabase.from('members').select('id, first_name, last_name, phone, department, status, date_of_birth').limit(5000),
    supabase.from('greatness_attendees').select('id, name, phone, department, email').limit(5000),
    supabase.from('programme_attendance_records').select('id, attendee_name, phone, department, church_position, salem_family, date_of_birth, email').limit(5000),
  ]);

  const people = [
    ...(membersResult.data || []).map(member => ({
      source: 'members',
      id: member.id,
      name: fullName(member),
      phone: member.phone,
      department: member.department,
      church_position: member.status === 'Worker' ? 'Member' : member.status || 'Member',
      date_of_birth: member.date_of_birth,
    })),
    ...(greatnessResult.data || []).map(attendee => ({
      source: 'greatness_attendees',
      id: attendee.id,
      name: attendee.name,
      phone: attendee.phone,
      department: attendee.department,
      church_position: 'Member',
      email: attendee.email,
    })),
    ...(recordsResult.data || []).map(record => ({
      source: 'programme_attendance_records',
      id: record.id,
      name: record.attendee_name,
      phone: record.phone,
      department: record.department,
      church_position: record.church_position,
      salem_family: record.salem_family,
      date_of_birth: record.date_of_birth,
      email: record.email,
    })),
  ];

  return people.find(person => {
    const personPhone = normalizePhone(person.phone);
    if (phoneDigits && personPhone && (personPhone.endsWith(phoneDigits.slice(-10)) || phoneDigits.endsWith(personPhone.slice(-10)))) return true;
    return targetName && clean(person.name) === targetName;
  }) || null;
}

async function ensureGreatnessAttendee(person) {
  const existing = await findExistingPerson({ name: person.name, phone: person.phone });
  if (existing?.source === 'greatness_attendees') return { data: existing, error: null };

  const { data: byPhone } = await supabase.from('greatness_attendees')
    .select('*')
    .eq('phone', person.phone || '')
    .maybeSingle();
  if (byPhone) return { data: byPhone, error: null };

  return addAttendee({
    name: person.name,
    phone: person.phone || null,
    email: person.email || null,
    department: person.department || null,
  });
}

async function saveSelfCheckIn({ programme, date, day, person, markedBy = 'QR Self Check-in' }) {
  const dayNumber = getProgrammeDay(programme, date, day);
  const record = {
    programme_id: programme.id,
    programme_name: programme.name,
    programme_type: programme.programme_type || 'custom',
    attendance_date: date,
    day_number: dayNumber,
    attendee_source: person.source || 'self_registered',
    attendee_source_id: person.id || null,
    attendee_name: person.name,
    phone: person.phone || null,
    department: person.department || null,
    church_position: person.church_position || 'Member',
    salem_family: person.salem_family || null,
    date_of_birth: person.date_of_birth || null,
    email: person.email || null,
    status: 'Present',
    marked_by: markedBy,
    marked_at: new Date().toISOString(),
  };

  const saved = await saveProgrammeRecord(record);
  if (saved.error) return saved;

  if (programme.id === GREATNESS_PROGRAMME_ID && dayNumber) {
    const attendee = await ensureGreatnessAttendee(person);
    if (!attendee.error && attendee.data?.id) {
      await markAttendance(attendee.data.id, dayNumber, 'Present', markedBy);
    }
  }

  return saved;
}

export default function GreatnessDashboard() {
  const [tab, setTab] = useState('mark');
  const tabs = [
    { key: 'mark', label: 'Mark Attendance', icon: <CheckSquare size={15} /> },
    { key: 'qr', label: 'QR Check-in', icon: <QrCode size={15} /> },
    { key: 'records', label: 'View Records', icon: <Calendar size={15} /> },
    { key: 'chart', label: 'Charts', icon: <BarChart2 size={15} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.gold}20, ${C.gold}05)`, border: `1px solid ${C.gold}30`, borderRadius: 14, padding: '18px 22px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.gold, marginBottom: 4 }}>32 Days of Greatness</div>
        <div style={{ fontSize: 13, color: C.textSecondary }}>Programme attendance tracker with manual marking and QR self check-in.</div>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 4, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', background: 'transparent', border: 'none',
            borderBottom: tab === t.key ? `2px solid ${C.gold}` : '2px solid transparent',
            color: tab === t.key ? C.gold : C.textSecondary,
            fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
            cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1,
            whiteSpace: 'nowrap',
          }}>{t.icon}{t.label}</button>
        ))}
      </div>

      {tab === 'mark' && <MarkAttendance />}
      {tab === 'qr' && <QrAttendance />}
      {tab === 'records' && <ViewRecords />}
      {tab === 'chart' && <Charts />}
    </div>
  );
}

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

  useEffect(() => { load(); }, [day]);

  const load = async () => {
    const [a, r] = await Promise.all([getAttendees(), getAttendanceRecords(day)]);
    setAttendees(a);
    setRecords(r);
  };

  const getStatus = attendeeId => records.find(r => r.attendee_id === attendeeId)?.status || null;

  const mark = async (attendeeId, status) => {
    setSaving(prev => ({ ...prev, [attendeeId]: true }));
    await markAttendance(attendeeId, day, status, profile?.name || 'Staff');
    await load();
    setSaving(prev => ({ ...prev, [attendeeId]: false }));
  };

  const filtered = attendees.filter(a => `${a.name} ${a.phone} ${a.department}`.toLowerCase().includes(search.toLowerCase()));
  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  const unmarkedCount = attendees.length - records.length;

  const handleAdd = async () => {
    if (!newForm.name || !newForm.phone) {
      setAddMsg({ type: 'warning', text: 'Name and phone are required.' });
      return;
    }
    setAddLoading(true);
    const exists = attendees.find(a => normalizePhone(a.phone) === normalizePhone(newForm.phone));
    if (exists) {
      setAddMsg({ type: 'warning', text: 'An attendee with this phone number already exists.' });
      setAddLoading(false);
      return;
    }
    const { data, error } = await addAttendee({
      name: newForm.name,
      phone: newForm.phone,
      email: newForm.email || null,
      department: newForm.department || null,
    });
    if (error) {
      setAddMsg({ type: 'danger', text: error.message });
      setAddLoading(false);
      return;
    }
    setAttendees([...attendees, data].sort((a, b) => a.name.localeCompare(b.name)));
    setShowAddModal(false);
    setNewForm({ name: '', phone: '', email: '', department: '' });
    setAddMsg(null);
    setSuccessMsg(`${newForm.name} added successfully.`);
    setTimeout(() => setSuccessMsg(''), 3000);
    setAddLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
      <SearchInput value={search} onChange={setSearch} placeholder="Type a name to search existing attendees..." />

      <Panel title={`Day ${day} - Attendance (${attendees.length} registered)`}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={32} color={C.textMuted} />}
            title={search ? 'No attendee found' : 'No attendees registered yet'}
            description={search ? `"${search}" was not found. Add the attendee or let them scan the QR check-in.` : 'Click Add Attendee to register the first person.'}
            action={<Btn onClick={() => setShowAddModal(true)} color={C.navy}><UserPlus size={14} /> Add Attendee</Btn>}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 140px', gap: 8, padding: '8px 12px', background: C.pageBg, borderRadius: 8, marginBottom: 4, minWidth: 620 }}>
              {['Name', 'Phone', 'Department', 'Status'].map(label => <span key={label} style={headerCell}>{label}</span>)}
            </div>
            {filtered.map(a => {
              const status = getStatus(a.id);
              const isSaving = saving[a.id];
              return (
                <div key={a.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 120px 140px',
                  gap: 8, padding: '10px 12px', minWidth: 620,
                  borderBottom: `0.5px solid ${C.border}`,
                  alignItems: 'center',
                  background: status === 'Present' ? `${C.success}08` : status === 'Absent' ? `${C.danger}05` : 'transparent',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{a.name}</div>
                    {a.email && <div style={{ fontSize: 11, color: C.textMuted }}>{a.email}</div>}
                  </div>
                  <div style={{ fontSize: 12, color: C.textSecondary }}>{a.phone}</div>
                  <div style={{ fontSize: 12, color: C.textSecondary }}>{a.department || '-'}</div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {isSaving ? <span style={{ fontSize: 12, color: C.textMuted }}>Saving...</span> : (
                      <>
                        <StatusButton active={status === 'Present'} color={C.success} onClick={() => mark(a.id, 'Present')}>Present</StatusButton>
                        <StatusButton active={status === 'Absent'} color={C.danger} onClick={() => mark(a.id, 'Absent')}>Absent</StatusButton>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {showAddModal && (
        <Modal title="Add New Attendee" onClose={() => { setShowAddModal(false); setAddMsg(null); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: C.textSecondary, background: C.infoBg, borderRadius: 8, padding: '10px 14px', border: `1px solid ${C.blue}20` }}>
              Once added, this person appears in the 32 Days attendance list. QR check-in also searches this list automatically.
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

function QrAttendance() {
  const { profile } = useAuth();
  const [programmes, setProgrammes] = useState(DEFAULT_PROGRAMMES);
  const [programmeId, setProgrammeId] = useState(GREATNESS_PROGRAMME_ID);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [day, setDay] = useState(1);
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState(null);
  const [showProgrammeModal, setShowProgrammeModal] = useState(false);
  const [newProgramme, setNewProgramme] = useState({ name: '', programme_type: 'custom', start_date: TODAY, end_date: '', total_days: '' });

  const selectedProgramme = programmes.find(p => p.id === programmeId) || programmes[0];
  const checkInUrl = useMemo(() => {
    const params = new URLSearchParams({ checkin: '1', programme: selectedProgramme.id, date: selectedDate });
    if (selectedProgramme.id === GREATNESS_PROGRAMME_ID) params.set('day', String(day));
    return `${getCheckInBaseUrl()}?${params.toString()}`;
  }, [selectedProgramme, selectedDate, day]);
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(checkInUrl)}`;

  useEffect(() => {
    getProgrammes().then(result => {
      setProgrammes(result.data);
      if (result.error) setMessage({ type: 'warning', text: 'Programme tables are not ready yet. Run the Supabase SQL in README to save QR attendance records.' });
    });
  }, []);

  useEffect(() => { loadRecords(); }, [programmeId, selectedDate]);

  const loadRecords = async () => {
    const result = await getProgrammeRecords({ programmeId, date: selectedDate });
    if (!result.error) setRecords(result.data);
  };

  const copyLink = async () => {
    await navigator.clipboard?.writeText(checkInUrl);
    setMessage({ type: 'success', text: 'Check-in link copied.' });
  };

  const handleCreateProgramme = async () => {
    if (!newProgramme.name) {
      setMessage({ type: 'warning', text: 'Programme name is required.' });
      return;
    }
    const payload = {
      id: `custom-${slugify(newProgramme.name)}-${Date.now()}`,
      name: newProgramme.name,
      programme_type: newProgramme.programme_type || 'custom',
      start_date: newProgramme.start_date || null,
      end_date: newProgramme.end_date || null,
      total_days: newProgramme.total_days ? Number(newProgramme.total_days) : null,
      is_active: true,
      created_by: profile?.id || null,
      created_by_name: profile?.name || null,
    };
    const { data, error } = await createProgramme(payload);
    if (error) {
      setMessage({ type: 'danger', text: error.message });
      return;
    }
    setProgrammes([data, ...programmes]);
    setProgrammeId(data.id);
    setShowProgrammeModal(false);
    setNewProgramme({ name: '', programme_type: 'custom', start_date: TODAY, end_date: '', total_days: '' });
    setMessage({ type: 'success', text: 'Programme created.' });
  };

  const presentCount = records.filter(r => r.status === 'Present').length;
  const uniquePhones = new Set(records.map(r => normalizePhone(r.phone)).filter(Boolean)).size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {message && <Alert type={message.type} message={message.text} onDismiss={() => setMessage(null)} />}

      <Grid cols="minmax(280px, 380px) 1fr" gap={16}>
        <Panel title="Daily QR Code">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select
              label="Programme"
              value={programmeId}
              onChange={setProgrammeId}
              options={programmes.map(p => ({ value: p.id, label: p.name }))}
            />
            <div style={{ display: 'grid', gridTemplateColumns: selectedProgramme.id === GREATNESS_PROGRAMME_ID ? '1fr 110px' : '1fr', gap: 10 }}>
              <Input label="Attendance Date" type="date" value={selectedDate} onChange={setSelectedDate} />
              {selectedProgramme.id === GREATNESS_PROGRAMME_ID && (
                <Input label="Day" type="number" value={day} onChange={v => setDay(Math.min(TOTAL_DAYS, Math.max(1, Number(v) || 1)))} />
              )}
            </div>

            <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, background: C.pageBg, display: 'flex', justifyContent: 'center' }}>
              <img src={qrImage} alt="Attendance QR code" style={{ width: '100%', maxWidth: 280, aspectRatio: '1 / 1', objectFit: 'contain', background: '#fff', borderRadius: 8 }} />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn onClick={copyLink} color={C.navy}><Copy size={14} /> Copy Link</Btn>
              <Btn variant="outline" color={C.gold} onClick={() => window.open(checkInUrl, '_blank', 'noopener,noreferrer')}><Smartphone size={14} /> Open Form</Btn>
              <Btn variant="ghost" color={C.success} onClick={() => setShowProgrammeModal(true)}><PlusCircle size={14} /> Custom</Btn>
            </div>

            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5, wordBreak: 'break-all' }}>{checkInUrl}</div>
          </div>
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Grid cols="repeat(3, 1fr)" gap={10}>
            <StatCard label="Programme" value={selectedProgramme.name.split(' ')[0]} icon={<Calendar size={16} />} color={C.gold} />
            <StatCard label="Present Today" value={presentCount} icon={<ClipboardCheck size={16} />} color={C.success} />
            <StatCard label="Unique Phones" value={uniquePhones} icon={<Users size={16} />} color={C.blue} />
          </Grid>

          <Panel title={`${selectedProgramme.name} - ${selectedDate}`}>
            <DataTable
              columns={[
                { key: 'attendee_name', label: 'Name', render: v => <strong style={{ color: C.textPrimary }}>{v}</strong> },
                { key: 'phone', label: 'Phone' },
                { key: 'salem_family', label: 'Salem Family', render: v => v || '-' },
                { key: 'department', label: 'Department', render: v => v || '-' },
                { key: 'church_position', label: 'Position', render: v => <Badge label={v || 'Member'} color={C.purple} /> },
                { key: 'marked_at', label: 'Time', render: v => v ? new Date(v).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '-' },
              ]}
              rows={records}
              emptyText="No QR check-ins for this date yet."
            />
          </Panel>
        </div>
      </Grid>

      {showProgrammeModal && (
        <Modal title="Create Custom Programme" onClose={() => setShowProgrammeModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Programme Name *" value={newProgramme.name} onChange={v => setNewProgramme({ ...newProgramme, name: v })} placeholder="e.g. Leaders Retreat" required />
            <Select label="Programme Type" value={newProgramme.programme_type} onChange={v => setNewProgramme({ ...newProgramme, programme_type: v })} options={[
              { value: 'service', label: 'Service' },
              { value: 'custom', label: 'Custom Programme' },
              { value: 'department', label: 'Department Programme' },
            ]} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 10 }}>
              <Input label="Start Date" type="date" value={newProgramme.start_date} onChange={v => setNewProgramme({ ...newProgramme, start_date: v })} />
              <Input label="End Date" type="date" value={newProgramme.end_date} onChange={v => setNewProgramme({ ...newProgramme, end_date: v })} />
              <Input label="Days" type="number" value={newProgramme.total_days} onChange={v => setNewProgramme({ ...newProgramme, total_days: v })} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="outline" color={C.textSecondary} onClick={() => setShowProgrammeModal(false)}>Cancel</Btn>
              <Btn onClick={handleCreateProgramme} color={C.navy}>Create Programme</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ViewRecords() {
  const [attendees, setAttendees] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([getAttendees(), getAllAttendance()]).then(([a, r]) => {
      setAttendees(a);
      setAllRecords(r);
    });
  }, []);

  const summary = attendees.map(a => {
    const personRecords = allRecords.filter(r => r.attendee_id === a.id);
    const present = personRecords.filter(r => r.status === 'Present').length;
    const absent = personRecords.filter(r => r.status === 'Absent').length;
    const marked = personRecords.length;
    const pct = marked > 0 ? Math.round((present / marked) * 100) : 0;
    return { ...a, present, absent, marked, pct, records: personRecords };
  }).filter(a => `${a.name} ${a.phone} ${a.department}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search attendee name..." />
        </div>
        <Badge label={`${attendees.length} registered`} color={C.gold} />
      </div>

      <Panel title="Attendance Summary - All Attendees">
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: v => <strong style={{ color: C.textPrimary }}>{v}</strong> },
            { key: 'phone', label: 'Phone' },
            { key: 'department', label: 'Department', render: v => v || '-' },
            { key: 'present', label: 'Days Present', render: v => <Badge label={v} color={C.success} /> },
            { key: 'absent', label: 'Days Absent', render: v => <Badge label={v} color={C.danger} /> },
            { key: 'marked', label: 'Days Marked', render: v => <Badge label={`${v}/${TOTAL_DAYS}`} color={C.blue} /> },
            { key: 'pct', label: 'Attendance %', render: v => <Progress value={v} /> },
            { key: 'view', label: '', render: (_, r) => <Btn size="sm" variant="ghost" color={C.gold} onClick={() => setSelected(r)}>View</Btn> },
          ]}
          rows={summary}
          emptyText="No attendees registered yet."
        />
      </Panel>

      {selected && (
        <Modal title={`Attendance Record - ${selected.name}`} onClose={() => setSelected(null)} width={560}>
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
                  aspectRatio: '1 / 1', borderRadius: 8, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 2,
                  background: status === 'Present' ? `${C.success}20` : status === 'Absent' ? `${C.danger}15` : C.pageBg,
                  border: `1px solid ${status === 'Present' ? C.success : status === 'Absent' ? C.danger : C.border}`,
                  padding: '6px 4px',
                }}>
                  <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>D{dayNum}</div>
                  <div style={{ fontSize: 14 }}>{status === 'Present' ? '✓' : status === 'Absent' ? '×' : '.'}</div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Charts() {
  const [allRecords, setAllRecords] = useState([]);
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    Promise.all([getAllAttendance(), getAttendees()]).then(([r, a]) => {
      setAllRecords(r);
      setAttendees(a);
    });
  }, []);

  const dailyData = Array.from({ length: TOTAL_DAYS }, (_, i) => {
    const day = i + 1;
    const dayRecs = allRecords.filter(r => r.day_number === day);
    const present = dayRecs.filter(r => r.status === 'Present').length;
    const absent = dayRecs.filter(r => r.status === 'Absent').length;
    return { day: `D${day}`, present, absent };
  });

  const topAttendees = attendees.map(a => ({
    name: a.name.split(' ')[0],
    present: allRecords.filter(r => r.attendee_id === a.id && r.status === 'Present').length,
  })).sort((a, b) => b.present - a.present).slice(0, 10);

  const totalPresent = allRecords.filter(r => r.status === 'Present').length;
  const totalAbsent = allRecords.filter(r => r.status === 'Absent').length;
  const activeDays = dailyData.filter(d => d.present > 0).length;
  const avgPerDay = activeDays > 0 ? Math.round(totalPresent / activeDays) : 0;
  const bestDay = dailyData.reduce((best, d) => d.present > (best?.present || 0) ? d : best, null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Grid cols="repeat(auto-fit, minmax(160px, 1fr))">
        <StatCard label="Total Registered" value={attendees.length} icon={<Users size={18} />} color={C.gold} />
        <StatCard label="Total Present Marks" value={totalPresent} icon={<CheckSquare size={18} />} color={C.success} />
        <StatCard label="Total Absent Marks" value={totalAbsent} icon={<X size={18} />} color={C.danger} />
        <StatCard label="Avg Per Day" value={avgPerDay} icon={<Calendar size={18} />} color={C.blue} />
        <StatCard label="Best Day" value={bestDay?.day || '-'} icon={<BarChart2 size={18} />} color={C.purple} sub={bestDay ? `${bestDay.present} present` : ''} />
      </Grid>

      <Panel title="Daily Attendance - 32 Days of Greatness">
        {allRecords.length === 0 ? (
          <EmptyState icon={<BarChart2 size={32} color={C.textMuted} />} title="No attendance data yet" description="Start marking attendance or let members scan the QR code." />
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
              ) },
            ]}
            rows={topAttendees}
          />
        </Panel>
      )}
    </div>
  );
}

export function PublicAttendanceCheckIn() {
  const params = new URLSearchParams(window.location.search);
  const programmeId = params.get('programme') || GREATNESS_PROGRAMME_ID;
  const qrDate = params.get('date') || TODAY;
  const qrDay = Number(params.get('day') || 1);
  const [programme, setProgramme] = useState(DEFAULT_PROGRAMMES.find(p => p.id === programmeId) || DEFAULT_PROGRAMMES[0]);
  const [date, setDate] = useState(qrDate);
  const [lookup, setLookup] = useState({ name: '', phone: '' });
  const [details, setDetails] = useState({ salem_family: '', date_of_birth: '', email: '', department: '', church_position: 'Member', other_position: '' });
  const [match, setMatch] = useState(null);
  const [checked, setChecked] = useState(false);
  const [stage, setStage] = useState('lookup');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    getProgrammes().then(result => {
      const found = result.data.find(p => p.id === programmeId);
      if (found) setProgramme(found);
    });
  }, [programmeId]);

  const handleLookup = async e => {
    e.preventDefault();
    if (!lookup.name && !lookup.phone) {
      setAlert({ type: 'warning', text: 'Enter your name or phone number first.' });
      return;
    }
    setLoading(true);
    setAlert(null);
    const found = await findExistingPerson(lookup);
    setMatch(found);
    if (found) {
      setDetails({
        salem_family: found.salem_family || '',
        date_of_birth: found.date_of_birth || '',
        email: found.email || '',
        department: found.department || '',
        church_position: found.church_position || 'Member',
        other_position: '',
      });
    }
    setStage(found ? 'confirm' : 'details');
    setLoading(false);
  };

  const submit = async e => {
    e.preventDefault();
    if (!checked) {
      setAlert({ type: 'warning', text: 'Tick the attendance confirmation box before submitting.' });
      return;
    }
    const position = details.church_position === 'Other' ? details.other_position : details.church_position;
    if (!details.salem_family || !details.date_of_birth) {
      setAlert({ type: 'warning', text: 'Salem Family and Date of Birth are required.' });
      return;
    }
    if (!match && (!lookup.name || !lookup.phone || !details.department || !position)) {
      setAlert({ type: 'warning', text: 'Name, phone, department and position are required.' });
      return;
    }
    setLoading(true);
    const person = {
      ...(match || {}),
      name: match?.name || lookup.name,
      phone: match?.phone || lookup.phone,
      department: details.department || match?.department || null,
      church_position: position || match?.church_position || 'Member',
      salem_family: details.salem_family,
      date_of_birth: details.date_of_birth,
      email: details.email || null,
    };
    const result = await saveSelfCheckIn({ programme, date, day: qrDay, person });
    if (result.error) {
      setAlert({ type: 'danger', text: result.error.message });
      setLoading(false);
      return;
    }
    setStage('done');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '24px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <img src="/salem-logo.png" alt="Salem" style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 10 }} />
          <div style={{ fontSize: 21, fontWeight: 700, color: C.navy }}>{programme?.name || PROGRAMME}</div>
          <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>Attendance Check-in</div>
        </div>

        <Panel>
          {alert && <div style={{ marginBottom: 14 }}><Alert type={alert.type} message={alert.text} onDismiss={() => setAlert(null)} /></div>}

          {stage === 'lookup' && (
            <form onSubmit={handleLookup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Full Name" value={lookup.name} onChange={v => setLookup({ ...lookup, name: v })} placeholder="Enter your name" />
              <Input label="Phone Number" value={lookup.phone} onChange={v => setLookup({ ...lookup, phone: v })} placeholder="08XXXXXXXXX" />
              <Btn type="submit" color={C.navy} size="lg" disabled={loading}><SearchIcon /> {loading ? 'Checking...' : 'Continue'}</Btn>
            </form>
          )}

          {(stage === 'confirm' || stage === 'details') && (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {match ? (
                <div style={{ background: C.successBg, border: `1px solid ${C.success}35`, borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 12, color: C.success, fontWeight: 600, marginBottom: 4 }}>Record found</div>
                  <div style={{ fontSize: 15, color: C.textPrimary, fontWeight: 600 }}>{match.name}</div>
                  <div style={{ fontSize: 12, color: C.textSecondary }}>{match.phone || 'No phone'} {match.department ? `- ${match.department}` : ''}</div>
                </div>
              ) : (
                <div style={{ background: C.infoBg, border: `1px solid ${C.info}25`, borderRadius: 10, padding: 12, fontSize: 13, color: C.textSecondary }}>
                  We could not find an existing record, so please complete your details once.
                </div>
              )}

              <Input label="Attendance Date" type="date" value={date} onChange={setDate} />
              <Select
                label="Salem Family *"
                value={details.salem_family}
                onChange={v => setDetails({ ...details, salem_family: v })}
                options={SALEM_FAMILY_OPTIONS.map(family => ({ value: family, label: family }))}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Input label="Date of Birth *" type="date" value={details.date_of_birth} onChange={v => setDetails({ ...details, date_of_birth: v })} required />
                <Input label="Email Address" type="email" value={details.email} onChange={v => setDetails({ ...details, email: v })} placeholder="name@email.com" />
              </div>

              {!match && (
                <>
                  <Select label="Department *" value={details.department} onChange={v => setDetails({ ...details, department: v })} options={DEPT_OPTIONS.map(d => ({ value: d, label: d }))} required />
                  <Select label="Position in Church *" value={details.church_position} onChange={v => setDetails({ ...details, church_position: v })} options={POSITION_OPTIONS.map(p => ({ value: p, label: p }))} required />
                  {details.church_position === 'Other' && <Input label="Other Position *" value={details.other_position} onChange={v => setDetails({ ...details, other_position: v })} placeholder="Enter position" required />}
                </>
              )}

              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, border: `1px solid ${C.border}`, borderRadius: 10, background: C.inputBg, cursor: 'pointer' }}>
                <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ marginTop: 2 }} />
                <span style={{ fontSize: 13, color: C.textPrimary, lineHeight: 1.45 }}>I confirm that I attended {programme?.name || 'this programme'} on {date}.</span>
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <Btn type="submit" color={C.success} size="lg" disabled={loading}>{loading ? 'Submitting...' : 'Submit Attendance'}</Btn>
                <Btn variant="outline" color={C.textSecondary} onClick={() => { setStage('lookup'); setMatch(null); setChecked(false); }}>Back</Btn>
              </div>
            </form>
          )}

          {stage === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px 6px' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 12px', background: C.successBg, color: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare size={26} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, marginBottom: 6 }}>Attendance recorded</div>
              <div style={{ fontSize: 13, color: C.textSecondary }}>Thank you. Your check-in for {date} has been saved.</div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatusButton({ active, color, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 6, border: `1px solid ${color}`,
      background: active ? color : 'transparent',
      color: active ? '#fff' : color,
      fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    }}>{children}</button>
  );
}

function Progress({ value }) {
  const color = value >= 75 ? C.success : value >= 50 ? C.warning : C.danger;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 60, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, color: C.textSecondary }}>{value}%</span>
    </div>
  );
}

function SearchIcon() {
  return <Users size={16} />;
}

const dayBtn = {
  background: C.pageBg,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  width: 28,
  height: 28,
  cursor: 'pointer',
  fontSize: 16,
  color: C.textPrimary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'inherit',
  padding: 0,
};

const headerCell = {
  fontSize: 11,
  color: C.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  fontWeight: 500,
};
