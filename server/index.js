require('dotenv').config();

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const { pool, query, transaction } = require('./db');
const { authenticate, createAuthRouter, getJwtSecret, publicProfile, requireRoles } = require('./auth');
const { asyncRoute, HttpError, sendData } = require('./http');

const app = express();
const ROLES = ['bishop', 'admin', 'pastor', 'department_leader', 'kdf_coordinator'];
const STAFF_ROLES = ['bishop', 'admin', 'pastor'];
const PRIVILEGED_ROLES = ['bishop', 'admin'];

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(require('cookie-parser')());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
const publicCheckInLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

function requireAuthenticated(req, res, next) {
  return authenticate(req, res, next);
}

function pick(source, keys) {
  return Object.fromEntries(keys
    .filter(key => source[key] !== undefined)
    .map(key => [key, source[key]]));
}

function requireValues(value, fields) {
  const missing = fields.filter(field => value[field] === undefined || value[field] === null || String(value[field]).trim() === '');
  if (missing.length) throw new HttpError(400, `Required fields: ${missing.join(', ')}.`);
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function safeDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

async function createRow(table, values) {
  const record = { id: crypto.randomUUID(), ...values };
  const fields = Object.keys(record);
  const placeholders = fields.map(() => '?').join(', ');
  await query(
    `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`,
    fields.map(field => record[field]),
  );
  const rows = await query(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [record.id]);
  return rows[0];
}

async function saveProgrammeRecord(connection, input) {
  const phone = normalizePhone(input.phone);
  const record = {
    programme_id: input.programme_id,
    programme_name: input.programme_name,
    programme_type: input.programme_type || 'custom',
    attendance_date: input.attendance_date,
    day_number: input.day_number || null,
    attendee_source: input.attendee_source || null,
    attendee_source_id: input.attendee_source_id || null,
    attendee_name: input.attendee_name,
    phone: input.phone || null,
    phone_normalized: phone || null,
    salem_family: input.salem_family || null,
    date_of_birth: input.date_of_birth || null,
    email: input.email || null,
    department: input.department || null,
    church_position: input.church_position || null,
    status: input.status || 'Present',
    marked_by: input.marked_by || null,
    marked_at: new Date(),
  };
  const matchSql = phone
    ? 'SELECT id FROM programme_attendance_records WHERE programme_id = ? AND attendance_date = ? AND phone_normalized = ? LIMIT 1 FOR UPDATE'
    : 'SELECT id FROM programme_attendance_records WHERE programme_id = ? AND attendance_date = ? AND LOWER(TRIM(attendee_name)) = LOWER(TRIM(?)) LIMIT 1 FOR UPDATE';
  const matchValues = phone
    ? [record.programme_id, record.attendance_date, phone]
    : [record.programme_id, record.attendance_date, record.attendee_name];
  const [existing] = await connection.execute(matchSql, matchValues);

  if (existing[0]) {
    const fields = Object.keys(record);
    await connection.execute(
      `UPDATE programme_attendance_records SET ${fields.map(field => `${field} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...fields.map(field => record[field]), existing[0].id],
    );
    const [rows] = await connection.execute('SELECT * FROM programme_attendance_records WHERE id = ?', [existing[0].id]);
    return rows[0];
  }

  const id = crypto.randomUUID();
  const values = { id, ...record };
  const fields = Object.keys(values);
  await connection.execute(
    `INSERT INTO programme_attendance_records (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
    fields.map(field => values[field]),
  );
  const [rows] = await connection.execute('SELECT * FROM programme_attendance_records WHERE id = ?', [id]);
  return rows[0];
}

const api = express.Router();
api.use('/auth/login', loginLimiter);
api.use('/public/attendance', publicCheckInLimiter);
api.use('/auth', createAuthRouter());

api.get('/health', asyncRoute(async (_req, res) => {
  await query('SELECT 1');
  sendData(res, { status: 'ok' });
}));

api.get('/profiles', requireAuthenticated, asyncRoute(async (_req, res) => {
  const profiles = await query('SELECT * FROM profiles ORDER BY name');
  sendData(res, profiles.map(publicProfile));
}));

api.post('/profiles', requireAuthenticated, requireRoles(...PRIVILEGED_ROLES), asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireValues(body, ['name', 'email', 'role', 'password']);
  if (!ROLES.includes(body.role)) throw new HttpError(400, 'Choose a valid user role.');
  if (String(body.password).length < 8) throw new HttpError(400, 'Password must be at least 8 characters.');

  const profile = await createRow('profiles', {
    name: String(body.name).trim(),
    email: String(body.email).trim().toLowerCase(),
    phone: body.phone || null,
    role: body.role,
    department: body.role === 'department_leader' ? body.department || null : null,
    kdf_area: body.role === 'kdf_coordinator' ? body.kdf_area || null : null,
    avatar: body.avatar || null,
    password_hash: await bcrypt.hash(String(body.password), 12),
  });
  sendData(res, publicProfile(profile), 201);
}));

api.delete('/profiles/:id', requireAuthenticated, requireRoles(...PRIVILEGED_ROLES), asyncRoute(async (req, res) => {
  if (req.params.id === req.profile.id) throw new HttpError(400, 'You cannot delete your own account.');
  const result = await query('DELETE FROM profiles WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) throw new HttpError(404, 'User not found.');
  sendData(res, { success: true });
}));

api.get('/members', requireAuthenticated, asyncRoute(async (req, res) => {
  const where = [];
  const values = [];
  const roleFilters = {
    pastor: ['registered_by', req.profile.id],
    department_leader: ['department', req.profile.department],
    kdf_coordinator: ['kdf_area', req.profile.kdf_area],
  };
  const scopedFilter = roleFilters[req.profile.role];
  if (scopedFilter) {
    where.push(`${scopedFilter[0]} = ?`);
    values.push(scopedFilter[1] || '');
  } else {
    for (const [parameter, column] of [['registeredBy', 'registered_by'], ['kdfArea', 'kdf_area'], ['department', 'department']]) {
      if (req.query[parameter]) {
        where.push(`${column} = ?`);
        values.push(req.query[parameter]);
      }
    }
  }
  const rows = await query(
    `SELECT * FROM members${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC`,
    values,
  );
  sendData(res, rows);
}));

api.post('/members', requireAuthenticated, requireRoles(...STAFF_ROLES), asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireValues(body, ['first_name', 'last_name']);
  const member = await createRow('members', {
    ...pick(body, ['first_name', 'last_name', 'phone', 'address', 'date_of_birth', 'kdf_area', 'kdf_coordinator', 'department', 'affinity_group', 'status', 'spiritual_status', 'notes', 'date_registered']),
    registered_by: req.profile.id,
    registered_by_name: req.profile.name,
  });
  sendData(res, member, 201);
}));

api.get('/follow-ups', requireAuthenticated, asyncRoute(async (req, res) => {
  const where = [];
  const values = [];
  if (req.profile.role === 'pastor') {
    where.push('pastor_id = ?');
    values.push(req.profile.id);
  } else if (req.profile.role === 'kdf_coordinator') {
    where.push('kdf_area = ?');
    values.push(req.profile.kdf_area || '');
  } else {
    if (req.query.pastorId) { where.push('pastor_id = ?'); values.push(req.query.pastorId); }
    if (req.query.kdfArea) { where.push('kdf_area = ?'); values.push(req.query.kdfArea); }
  }
  const rows = await query(
    `SELECT * FROM follow_ups${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC`,
    values,
  );
  sendData(res, rows);
}));

api.post('/follow-ups', requireAuthenticated, requireRoles('admin', 'bishop', 'pastor', 'kdf_coordinator'), asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireValues(body, ['member_name']);
  const followUp = await createRow('follow_ups', {
    ...pick(body, ['member_id', 'member_name', 'kdf_area', 'date', 'method', 'notes', 'outcome', 'status']),
    pastor_id: req.profile.id,
    pastor_name: req.profile.name,
    kdf_area: req.profile.role === 'kdf_coordinator' ? req.profile.kdf_area : body.kdf_area || null,
  });
  sendData(res, followUp, 201);
}));

api.get('/attendance', requireAuthenticated, requireRoles(...PRIVILEGED_ROLES, 'department_leader'), asyncRoute(async (req, res) => {
  const rows = req.profile.role === 'department_leader'
    ? await query('SELECT * FROM attendance WHERE dept_name = ? ORDER BY date DESC', [req.profile.department || ''])
    : await query('SELECT * FROM attendance ORDER BY date DESC');
  sendData(res, rows);
}));

api.post('/attendance', requireAuthenticated, requireRoles(...PRIVILEGED_ROLES, 'department_leader'), asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireValues(body, ['date', 'service', 'count']);
  if (!safeDate(body.date) || !Number.isInteger(Number(body.count)) || Number(body.count) < 0) {
    throw new HttpError(400, 'Enter a valid attendance date and non-negative count.');
  }
  const department = req.profile.role === 'department_leader' ? req.profile.department : body.dept_name;
  const attendance = await createRow('attendance', {
    date: body.date,
    service: body.service,
    count: Number(body.count),
    dept_name: department || null,
    dept_count: body.dept_count === undefined ? null : Number(body.dept_count),
    recorded_by: req.profile.id,
    recorded_by_name: req.profile.name,
  });
  sendData(res, attendance, 201);
}));

api.post('/activity-logs', requireAuthenticated, asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireValues(body, ['action']);
  const log = await createRow('activity_logs', {
    user_id: req.profile.id,
    user_name: req.profile.name,
    action: String(body.action).slice(0, 120),
    detail: body.detail || null,
  });
  sendData(res, log, 201);
}));

api.get('/activity-logs', requireAuthenticated, requireRoles(...PRIVILEGED_ROLES), asyncRoute(async (req, res) => {
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 50, 500));
  sendData(res, await query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?', [limit]));
}));

api.get('/assignments', requireAuthenticated, requireRoles(...PRIVILEGED_ROLES), asyncRoute(async (_req, res) => {
  sendData(res, await query('SELECT * FROM assignments ORDER BY created_at DESC'));
}));

api.post('/assignments', requireAuthenticated, requireRoles(...PRIVILEGED_ROLES), asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireValues(body, ['task', 'assignee']);
  const assignment = await createRow('assignments', {
    ...pick(body, ['task', 'assignee', 'priority', 'due_date', 'status']),
    created_by: req.profile.id,
  });
  sendData(res, assignment, 201);
}));

api.patch('/assignments/:id', requireAuthenticated, requireRoles(...PRIVILEGED_ROLES), asyncRoute(async (req, res) => {
  const updates = pick(req.body || {}, ['task', 'assignee', 'priority', 'due_date', 'status']);
  if (!Object.keys(updates).length) throw new HttpError(400, 'Provide at least one assignment field to update.');
  const fields = Object.keys(updates);
  const result = await query(
    `UPDATE assignments SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`,
    [...fields.map(field => updates[field]), req.params.id],
  );
  if (!result.affectedRows) throw new HttpError(404, 'Assignment not found.');
  const rows = await query('SELECT * FROM assignments WHERE id = ?', [req.params.id]);
  sendData(res, rows[0]);
}));

api.delete('/assignments/:id', requireAuthenticated, requireRoles(...PRIVILEGED_ROLES), asyncRoute(async (req, res) => {
  const result = await query('DELETE FROM assignments WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) throw new HttpError(404, 'Assignment not found.');
  sendData(res, { success: true });
}));

api.get('/sms-config', requireAuthenticated, requireRoles(...PRIVILEGED_ROLES), asyncRoute(async (_req, res) => {
  const rows = await query('SELECT * FROM sms_config WHERE id = 1 LIMIT 1');
  sendData(res, rows[0] || { id: 1, api_key: '', sender_id: 'SICC' });
}));

api.put('/sms-config', requireAuthenticated, requireRoles(...PRIVILEGED_ROLES), asyncRoute(async (req, res) => {
  const apiKey = String(req.body?.api_key || '');
  const senderId = String(req.body?.sender_id || 'SICC');
  if (senderId.length > 11) throw new HttpError(400, 'Sender ID cannot exceed 11 characters.');
  await query(
    'INSERT INTO sms_config (id, api_key, sender_id) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE api_key = VALUES(api_key), sender_id = VALUES(sender_id)',
    [apiKey, senderId],
  );
  sendData(res, { id: 1, api_key: apiKey, sender_id: senderId });
}));

api.get('/greatness/attendees', requireAuthenticated, requireRoles(...STAFF_ROLES), asyncRoute(async (_req, res) => {
  sendData(res, await query('SELECT * FROM greatness_attendees ORDER BY name'));
}));

api.post('/greatness/attendees', requireAuthenticated, requireRoles(...STAFF_ROLES), asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireValues(body, ['name']);
  const attendee = await createRow('greatness_attendees', {
    ...pick(body, ['name', 'phone', 'email', 'department']),
    phone_normalized: normalizePhone(body.phone) || null,
  });
  sendData(res, attendee, 201);
}));

api.get('/greatness/attendance', requireAuthenticated, requireRoles(...STAFF_ROLES), asyncRoute(async (req, res) => {
  const rows = req.query.day
    ? await query('SELECT * FROM greatness_attendance WHERE day_number = ?', [Number(req.query.day)])
    : await query('SELECT * FROM greatness_attendance');
  sendData(res, rows);
}));

api.post('/greatness/attendance', requireAuthenticated, requireRoles(...STAFF_ROLES), asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireValues(body, ['attendee_id', 'day_number', 'status']);
  if (!Number.isInteger(Number(body.day_number)) || Number(body.day_number) < 1 || Number(body.day_number) > 32) {
    throw new HttpError(400, 'Attendance day must be between 1 and 32.');
  }
  await query(
    `INSERT INTO greatness_attendance (id, attendee_id, day_number, status, marked_by, marked_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by), marked_at = VALUES(marked_at)`,
    [crypto.randomUUID(), body.attendee_id, Number(body.day_number), body.status, body.marked_by || req.profile.name, new Date()],
  );
  const rows = await query('SELECT * FROM greatness_attendance WHERE attendee_id = ? AND day_number = ?', [body.attendee_id, Number(body.day_number)]);
  sendData(res, rows[0]);
}));

api.get('/programmes', asyncRoute(async (req, res) => {
  if (req.query.public !== '1') await new Promise((resolve, reject) => authenticate(req, res, error => error ? reject(error) : resolve()));
  const rows = await query('SELECT * FROM attendance_programmes WHERE is_active = 1 ORDER BY created_at DESC');
  sendData(res, rows);
}));

api.post('/programmes', requireAuthenticated, requireRoles(...STAFF_ROLES), asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireValues(body, ['id', 'name']);
  const programme = await createRow('attendance_programmes', {
    ...pick(body, ['id', 'name', 'programme_type', 'start_date', 'end_date', 'total_days']),
    is_active: body.is_active === false ? 0 : 1,
    created_by: req.profile.id,
    created_by_name: req.profile.name,
  });
  sendData(res, programme, 201);
}));

api.get('/programme-attendance-records', requireAuthenticated, requireRoles(...STAFF_ROLES), asyncRoute(async (req, res) => {
  const where = [];
  const values = [];
  if (req.query.programmeId) { where.push('programme_id = ?'); values.push(req.query.programmeId); }
  if (req.query.date) { where.push('attendance_date = ?'); values.push(req.query.date); }
  sendData(res, await query(
    `SELECT * FROM programme_attendance_records${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC`,
    values,
  ));
}));

api.post('/programme-attendance-records', requireAuthenticated, requireRoles(...STAFF_ROLES), asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireValues(body, ['programme_id', 'programme_name', 'attendance_date', 'attendee_name']);
  if (!safeDate(body.attendance_date)) throw new HttpError(400, 'Enter a valid attendance date.');
  const record = await transaction(connection => saveProgrammeRecord(connection, body));
  sendData(res, record, 201);
}));

api.post('/public/attendance/match', asyncRoute(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const phoneDigits = normalizePhone(req.body?.phone);
  if (name.length < 2 || phoneDigits.length < 7) {
    throw new HttpError(400, 'Enter both your full name and a valid phone number.');
  }

  const phoneSuffix = `%${phoneDigits.slice(-10)}`;
  const [members, attendees, programmeRecords] = await Promise.all([
    query(
      `SELECT id, first_name, last_name, phone, department, status, date_of_birth
       FROM members WHERE phone LIKE ? ORDER BY created_at DESC LIMIT 100`,
      [phoneSuffix],
    ),
    query(
      'SELECT id, name, phone, department, email FROM greatness_attendees WHERE phone LIKE ? ORDER BY created_at DESC LIMIT 100',
      [phoneSuffix],
    ),
    query(
      `SELECT id, attendee_name, phone, department, church_position, salem_family, date_of_birth, email
       FROM programme_attendance_records WHERE phone LIKE ? ORDER BY created_at DESC LIMIT 100`,
      [phoneSuffix],
    ),
  ]);
  const candidates = [
    ...members.map(member => ({
      source: 'members',
      id: member.id,
      name: `${member.first_name} ${member.last_name}`.trim(),
      phone: member.phone,
      department: member.department,
      church_position: member.status === 'Worker' ? 'Member' : member.status || 'Member',
      date_of_birth: member.date_of_birth,
    })),
    ...attendees.map(attendee => ({
      source: 'greatness_attendees',
      id: attendee.id,
      name: attendee.name,
      phone: attendee.phone,
      department: attendee.department,
      church_position: 'Member',
      email: attendee.email,
    })),
    ...programmeRecords.map(record => ({
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
  const found = candidates.find(person =>
    normalizePhone(person.phone).endsWith(phoneDigits.slice(-10))
    && person.name.toLocaleLowerCase() === name.toLocaleLowerCase()
  );
  sendData(res, found || null);
}));

api.post('/public/attendance/check-in', asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireValues(body, ['programme_id', 'attendance_date', 'attendee_name', 'phone', 'salem_family', 'date_of_birth']);
  if (!safeDate(body.attendance_date) || !safeDate(body.date_of_birth)) {
    throw new HttpError(400, 'Enter valid attendance and date-of-birth dates.');
  }
  if (normalizePhone(body.phone).length < 7) throw new HttpError(400, 'Enter a valid phone number.');

  const programmes = await query('SELECT * FROM attendance_programmes WHERE id = ? AND is_active = 1 LIMIT 1', [body.programme_id]);
  const programme = programmes[0];
  if (!programme) throw new HttpError(404, 'This attendance programme is not available.');

  let dayNumber = body.day_number ? Number(body.day_number) : null;
  if (programme.programme_type === '32_days' && programme.start_date) {
    const start = new Date(`${programme.start_date}T00:00:00Z`);
    const checkInDate = new Date(`${body.attendance_date}T00:00:00Z`);
    dayNumber = Math.floor((checkInDate - start) / 86400000) + 1;
  }
  if (programme.programme_type === '32_days' && (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 32)) {
    throw new HttpError(400, 'This check-in date is outside the 32-day programme.');
  }

  const phoneNormalized = normalizePhone(body.phone);
  const result = await transaction(async connection => {
    const saved = await saveProgrammeRecord(connection, {
      ...pick(body, ['programme_id', 'attendance_date', 'attendee_name', 'phone', 'salem_family', 'date_of_birth', 'email', 'department', 'church_position']),
      programme_name: programme.name,
      programme_type: programme.programme_type,
      day_number: dayNumber,
      phone_normalized: phoneNormalized,
      attendee_source: 'self_checkin',
      attendee_source_id: null,
      status: 'Present',
      marked_by: 'QR Self Check-in',
      marked_at: new Date(),
    });

    if (programme.programme_type === '32_days' && dayNumber) {
      let attendeeRows = await connection.execute(
        'SELECT id FROM greatness_attendees WHERE phone_normalized = ? LIMIT 1 FOR UPDATE',
        [phoneNormalized],
      );
      let attendee = attendeeRows[0][0];
      if (!attendee) {
        const attendeeId = crypto.randomUUID();
        await connection.execute(
          'INSERT INTO greatness_attendees (id, name, phone, phone_normalized, email, department) VALUES (?, ?, ?, ?, ?, ?)',
          [attendeeId, body.attendee_name, body.phone, phoneNormalized, body.email || null, body.department || null],
        );
        attendee = { id: attendeeId };
      }
      await connection.execute(
        `INSERT INTO greatness_attendance (id, attendee_id, day_number, status, marked_by, marked_at)
         VALUES (?, ?, ?, 'Present', 'QR Self Check-in', CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE status = 'Present', marked_by = 'QR Self Check-in', marked_at = CURRENT_TIMESTAMP`,
        [crypto.randomUUID(), attendee.id, dayNumber],
      );
    }
    return saved;
  });
  sendData(res, result, 201);
}));

app.use('/api', api);
app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use(express.static(path.join(__dirname, '..', 'build'), { index: false }));
app.get('*', (_req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'), error => {
    if (error) next(error);
  });
});

app.use((error, _req, res, _next) => {
  console.error('SICC Admin API error:', error);
  if (res.headersSent) return;
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A record with the same unique value already exists.' });
  const status = Number.isInteger(error.status) ? error.status : 500;
  const message = status < 500 ? error.message : 'An unexpected server error occurred.';
  res.status(status).json({ error: message });
});

async function bootstrapInitialAdmin() {
  const { INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD } = process.env;
  if (!INITIAL_ADMIN_EMAIL && !INITIAL_ADMIN_PASSWORD) return;
  if (!INITIAL_ADMIN_EMAIL || !INITIAL_ADMIN_PASSWORD) {
    throw new Error('Set both INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD to bootstrap the first admin.');
  }
  if (INITIAL_ADMIN_PASSWORD.length < 12) {
    throw new Error('INITIAL_ADMIN_PASSWORD must be at least 12 characters.');
  }

  const existing = await query('SELECT id FROM profiles LIMIT 1');
  if (existing.length) return;

  const name = String(process.env.INITIAL_ADMIN_NAME || 'SICC Admin').trim();
  const id = crypto.randomUUID();
  const avatar = name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  await query(
    'INSERT INTO profiles (id, name, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, INITIAL_ADMIN_EMAIL.trim().toLowerCase(), await bcrypt.hash(INITIAL_ADMIN_PASSWORD, 12), 'admin', avatar],
  );
  console.info(`Created initial administrator ${INITIAL_ADMIN_EMAIL.trim().toLowerCase()}.`);
}

async function start() {
  getJwtSecret();
  await query('SELECT 1');
  await bootstrapInitialAdmin();
  const port = Number(process.env.PORT || 3001);
  const server = app.listen(port, () => console.info(`SICC Admin listening on port ${port}.`));

  const shutdown = () => {
    server.close(() => pool.end().then(() => process.exit(0)));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (require.main === module) {
  start().catch(error => {
    console.error('Unable to start SICC Admin:', error);
    process.exitCode = 1;
  });
}

module.exports = { app, start };
