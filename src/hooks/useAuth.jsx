// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest('/auth/me')
      .then(({ user: sessionUser, profile: sessionProfile }) => {
        if (active) {
          setUser(sessionUser);
          setProfile(sessionProfile);
        }
      })
      .catch(error => {
        if (error.message !== 'Please sign in to continue.' && error.message !== 'Your session has expired. Please sign in again.') {
          console.error('Unable to restore the SICC Admin session:', error);
        }
        if (active) {
          setUser(null);
          setProfile(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const login = async (identifier, password, identifierType = 'email', rememberMe = true) => {
    try {
      const normalizedIdentifier = String(identifier || '').trim();
      if (!normalizedIdentifier) {
        return { success: false, error: 'Please enter your identifier.' };
      }

      const session = await apiRequest('/auth/login', {
        method: 'POST',
        body: { identifier: normalizedIdentifier, password, identifierType, rememberMe },
      });
      setUser(session.user);
      setProfile(session.profile);
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message || 'Unable to sign in. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, isAuthenticated: !!user && !!profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
