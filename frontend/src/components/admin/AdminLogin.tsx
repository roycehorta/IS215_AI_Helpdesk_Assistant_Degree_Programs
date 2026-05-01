// frontend/src/components/admin/AdminLogin.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "admin@upou.edu.ph";
const ADMIN_PASSWORD = "upou2025";
const SESSION_KEY = "upou_admin_session";
const SESSION_HOURS = 2;

export function createSession() {
  const expiry = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ expiry }));
}

export function isSessionValid(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const savedEmail =
    localStorage.getItem("upou_admin_last_email") ?? ADMIN_EMAIL;
  const [email, setEmail] = useState(savedEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem("upou_admin_last_email", email);
        createSession();
        onLoginSuccess();
      } else {
        setError("Invalid credentials. Please try again.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-sm "
        onInteractOutside={(e) => e.preventDefault()}
         hideClose
      >
       
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <img
              src="/up.png"
              alt="UP Logo"
              className="h-20 w-20 object-contain"
            />
          </div>
          <DialogTitle className="text-center">
            AI Helpdesk Admin Login
          </DialogTitle>
          <DialogDescription className="text-center">
            Authorized IT Personnel Only
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 mt-2">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              required
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Credentials hint */}
          <div className="pt-1 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400 mb-0.5">Demo credentials</p>
            <p className="text-[11px] text-gray-500 font-mono">
              {ADMIN_EMAIL} / {ADMIN_PASSWORD}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Session expires after {SESSION_HOURS} hours
            </p>
          </div>

          
        </form>

         <button
          onClick={() => navigate("/")}
          className="w-full text-xs text-gray-400 hover:text-gray-700 flex text-center gap-1 transition-colors"
        >
          ← Back to Chat
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLogin;
