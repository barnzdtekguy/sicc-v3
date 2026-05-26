// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUser(session.user); fetchProfile(session.user.email); }
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) { setUser(session.user); fetchProfile(session.user.email); }
      else { setUser(null); setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (email) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle();
      setProfile(data || null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const login = async (email, password) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setLoading(false); return { success: false, error: error.message }; }
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, isAuthenticated: !!user && !!profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
