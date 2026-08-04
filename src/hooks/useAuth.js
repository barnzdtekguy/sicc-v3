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

  const login = async (identifier, password, identifierType = 'email') => {
    try {
      const normalizedIdentifier = String(identifier || '').trim();
      if (!normalizedIdentifier) {
        return { success: false, error: 'Please enter your identifier.' };
      }

      let emailToUse = normalizedIdentifier;

      if (identifierType === 'username' || !normalizedIdentifier.includes('@')) {
        const lookupQueries = [
          supabase.from('profiles').select('email').eq('username', normalizedIdentifier).maybeSingle(),
          supabase.from('profiles').select('email').eq('email', normalizedIdentifier).maybeSingle(),
        ];

        const results = await Promise.allSettled(lookupQueries);
        const [usernameResult, emailResult] = results;

        const profile = usernameResult.status === 'fulfilled' && usernameResult.value?.data?.email
          ? usernameResult.value.data
          : emailResult.status === 'fulfilled' && emailResult.value?.data?.email
            ? emailResult.value.data
            : null;

        if (profile?.email) {
          emailToUse = profile.email;
        } else if (identifierType === 'username') {
          return { success: false, error: 'We could not find an account for that username. Please request access from Admin.' };
        }
      }

      const { error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message || 'Unable to sign in. Please try again.' };
    }
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
