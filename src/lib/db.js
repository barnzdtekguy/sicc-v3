// src/lib/db.js
import { supabase } from './supabase';

export async function addLog(userId, userName, action, detail) {
  await supabase.from('activity_logs').insert({ user_id: userId, user_name: userName, action, detail });
}
export async function getLogs(limit = 50) {
  const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  return data || [];
}
export async function getProfiles() {
  const { data } = await supabase.from('profiles').select('*').order('name');
  return data || [];
}
export async function createProfile(profile) {
  const { data, error } = await supabase.from('profiles').insert(profile).select().single();
  return { data, error };
}
export async function deleteProfile(id) {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  return { error };
}
export async function getMembers(filters = {}) {
  let query = supabase.from('members').select('*').order('created_at', { ascending: false });
  if (filters.registeredBy) query = query.eq('registered_by', filters.registeredBy);
  if (filters.kdfArea) query = query.eq('kdf_area', filters.kdfArea);
  if (filters.department) query = query.eq('department', filters.department);
  const { data } = await query;
  return data || [];
}
export async function createMember(member) {
  const { data, error } = await supabase.from('members').insert(member).select().single();
  return { data, error };
}
export async function getFollowUps(filters = {}) {
  let query = supabase.from('follow_ups').select('*').order('created_at', { ascending: false });
  if (filters.pastorId) query = query.eq('pastor_id', filters.pastorId);
  if (filters.kdfArea) query = query.eq('kdf_area', filters.kdfArea);
  const { data } = await query;
  return data || [];
}
export async function createFollowUp(f) {
  const { data, error } = await supabase.from('follow_ups').insert(f).select().single();
  return { data, error };
}
export async function getAttendance() {
  const { data } = await supabase.from('attendance').select('*').order('date', { ascending: false });
  return data || [];
}
export async function createAttendance(record) {
  const { data, error } = await supabase.from('attendance').insert(record).select().single();
  return { data, error };
}
export async function getAssignments() {
  const { data } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
  return data || [];
}
export async function createAssignment(a) {
  const { data, error } = await supabase.from('assignments').insert(a).select().single();
  return { data, error };
}
export async function updateAssignment(id, updates) {
  const { data, error } = await supabase.from('assignments').update(updates).eq('id', id).select().single();
  return { data, error };
}
export async function deleteAssignment(id) {
  await supabase.from('assignments').delete().eq('id', id);
}
export async function getSMSConfig() {
  const { data } = await supabase.from('sms_config').select('*').eq('id', 1).maybeSingle();
  return data || { api_key: '', sender_id: 'SICC' };
}
export async function saveSMSConfig(config) {
  const { error } = await supabase.from('sms_config').upsert({ id: 1, ...config });
  return { error };
}
