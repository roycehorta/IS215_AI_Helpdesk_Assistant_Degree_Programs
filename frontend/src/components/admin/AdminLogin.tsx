// frontend/src/components/admin/AdminLogin.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("admin@upou.edu.ph");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin@upou.edu.ph" && password === "admin123") {
      onLoginSuccess();
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) navigate("/");
      }}
    >
      <DialogContent
        className="sm:max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center">Admin Sign In</DialogTitle>
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLogin;
