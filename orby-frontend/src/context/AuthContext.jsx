import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const API_BASE = 'http://localhost:8080';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState(null);

  // On mount, check if we have a valid session via the HttpOnly cookie
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const profile = await res.json();
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password) => {
    setLoginError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // IMPORTANT: send/receive cookies
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data);
        return { success: true };
      } else {
        const msg = data.error || 'Erro ao fazer login.';
        const retryAfter = data.retryAfterSeconds || null;
        setLoginError(msg);
        return { success: false, error: msg, retryAfter };
      }
    } catch (err) {
      const msg = 'Não foi possível conectar ao servidor.';
      setLoginError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      // Even if the request fails, clear the user locally
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginError,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      login,
      logout,
      checkSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
