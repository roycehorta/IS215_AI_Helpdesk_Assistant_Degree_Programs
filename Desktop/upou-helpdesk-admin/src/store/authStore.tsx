import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface AdminUser {
  email: string;
  name: string;
  role: "admin";
}

interface AuthContextValue {
  user: AdminUser | null;
  login: (email: string, password: string) => { ok: true } | { ok: false; reason: string };
  logout: () => void;
}

// Pre-approved admin accounts (mock)
const APPROVED_ADMINS: Array<{ email: string; password: string; name: string }> = [
  { email: "admin@upou.edu.ph", password: "upou2025", name: "Dr. Ramona Aquino" },
  { email: "helpdesk@upou.edu.ph", password: "helpdesk2025", name: "Prof. Marcus Lim" },
];

const STORAGE_KEY = "upou-helpdesk-admin";

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const login: AuthContextValue["login"] = (email, password) => {
    const e = email.trim().toLowerCase();
    const approved = APPROVED_ADMINS.find((a) => a.email === e);
    if (!approved) {
      return { ok: false, reason: "This account is awaiting admin approval or is not recognized." };
    }
    if (approved.password !== password) {
      return { ok: false, reason: "Incorrect password. Please try again." };
    }
    const u: AdminUser = { email: approved.email, name: approved.name, role: "admin" };
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
