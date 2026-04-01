import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const AuthContext = createContext({
  user: getStoredUser(),
  setUser: () => {},
  isAuthenticated: Boolean(localStorage.getItem('jwt_token')),
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated: Boolean(localStorage.getItem('jwt_token')),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
