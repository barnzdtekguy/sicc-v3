// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qazbxjdipudfxmzaldke.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhemJ4amRpcHVkZnhtemFsZGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTgzODYsImV4cCI6MjA5NTAzNDM4Nn0.eNlT0Ou_L4P_4L_mAkIYK3mNj208w4VegmkX6qFzy1M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
