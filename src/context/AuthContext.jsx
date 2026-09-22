// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import usePushNotifications from '../hooks/usePushNotifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { subscribe } = usePushNotifications();

  useEffect(() => {
    // On app load, check if user is already logged in (token in localStorage)
    const stored = localStorage.getItem('runit_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('runit_token', token);
    localStorage.setItem('runit_user', JSON.stringify(userData));
    setUser(userData);
    // Auto-subscribe to push on login
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setTimeout(subscribe, 2000); // slight delay so UI settles first
    }
  };

  const logout = () => {
    localStorage.removeItem('runit_token');
    localStorage.removeItem('runit_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component: const { user } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}