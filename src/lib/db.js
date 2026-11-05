import { apiRequest, mutationResult } from './api';

function queryString(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const serialized = search.toString();
  return serialized ? `?${serialized}` : '';
}

export async function addLog(_userId, _userName, action, detail) {
  return apiRequest('/activity-logs', { method: 'POST', body: { action, detail } });
}

export async function getLogs(limit = 50) {
  return apiRequest(`/activity-logs${queryString({ limit })}`);
}

export async function getProfiles() {
  return apiRequest('/profiles');
}

export async function createProfile(profile, password) {
  return mutationResult('/profiles', { method: 'POST', body: { ...profile, password } });
}

export async function deleteProfile(id) {
  const { error } = await mutationResult(`/profiles/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return { error };
}

export async function getMembers(filters = {}) {
  return apiRequest(`/members${queryString({
    registeredBy: filters.registeredBy,
    kdfArea: filters.kdfArea,
    department: filters.department,
  })}`);
}

export async function createMember(member) {
  return mutationResult('/members', { method: 'POST', body: member });
}

export async function getFollowUps(filters = {}) {
  return apiRequest(`/follow-ups${queryString({
    pastorId: filters.pastorId,
    kdfArea: filters.kdfArea,
  })}`);
}

export async function createFollowUp(followUp) {
  return mutationResult('/follow-ups', { method: 'POST', body: followUp });
}

export async function getAttendance() {
  return apiRequest('/attendance');
}

export async function createAttendance(record) {
  return mutationResult('/attendance', { method: 'POST', body: record });
}

export async function getAssignments() {
  return apiRequest('/assignments');
}

export async function createAssignment(assignment) {
  return mutationResult('/assignments', { method: 'POST', body: assignment });
}

export async function updateAssignment(id, updates) {
  return mutationResult(`/assignments/${encodeURIComponent(id)}`, { method: 'PATCH', body: updates });
}

export async function deleteAssignment(id) {
  const { error } = await mutationResult(`/assignments/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return { error };
}

export async function getSMSConfig() {
  return apiRequest('/sms-config');
}

export async function saveSMSConfig(config) {
  const { error } = await mutationResult('/sms-config', { method: 'PUT', body: config });
  return { error };
}

export async function getGreatnessAttendees() {
  return apiRequest('/greatness/attendees');
}

export async function getGreatnessAttendance(day) {
  return apiRequest(`/greatness/attendance${queryString({ day })}`);
}

export async function createGreatnessAttendee(attendee) {
  return mutationResult('/greatness/attendees', { method: 'POST', body: attendee });
}

export async function saveGreatnessAttendance(record) {
  return mutationResult('/greatness/attendance', { method: 'POST', body: record });
}

export async function getProgrammes(publicCheckIn = false) {
  return apiRequest(`/programmes${queryString({ public: publicCheckIn ? '1' : '' })}`);
}

export async function createProgramme(programme) {
  return mutationResult('/programmes', { method: 'POST', body: programme });
}

export async function getProgrammeRecords(filters = {}) {
  return apiRequest(`/programme-attendance-records${queryString({
    programmeId: filters.programmeId,
    date: filters.date,
  })}`);
}

export async function saveProgrammeRecord(record) {
  return mutationResult('/programme-attendance-records', { method: 'POST', body: record });
}

export async function findExistingPerson(person) {
  return apiRequest('/public/attendance/match', { method: 'POST', body: person });
}

export async function savePublicCheckIn(record) {
  return mutationResult('/public/attendance/check-in', { method: 'POST', body: record });
}
