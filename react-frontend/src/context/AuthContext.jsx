import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      /* ignore malformed storage */
    }
    setLoading(false);
  }, [token]);

  const setAuth = useCallback((data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    setAuth(data);
    return data;
  }, [setAuth]);

  const register = useCallback(
    async (name, email, password) => {
      const { data } = await authApi.register({ name, email, password });
      if (data.token) setAuth(data);
      return data;
    },
    [setAuth],
  );

  const googleLogin = useCallback(async (googleToken) => {
    const { data } = await authApi.googleLogin(googleToken);
    setAuth(data);
    return data;
  }, [setAuth]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAdmin: user?.role === "admin", login, register, logout, googleLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
