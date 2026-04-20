import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/store/authStore";

import upLogo from "@/img/up.png";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.ok === true) {
        navigate("/dashboard", { replace: true });
      } else {
        setError(res.reason);
      }
    }, 500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-surface px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-primary opacity-[0.08]" />
      <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-24 bottom-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src={upLogo}
            alt="UP Logo"
            className="mb-4 h-20 w-20 object-contain"
          />

          <h1 className="font-serif text-2xl font-bold text-foreground">
            University of the Philippines
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Open University — Helpdesk Admin Portal
          </p>
        </div>

        <Card className="border-border/70 p-7 shadow-elegant">
          <div className="mb-6">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Administrator Sign In
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Access is restricted to approved UPOU helpdesk administrators.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@upou.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-95"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <div className="mb-1 font-semibold text-foreground">
              Demo credentials
            </div>
            <div>admin@upou.edu.ph · upou2025</div>
            <div>helpdesk@upou.edu.ph · helpdesk2025</div>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} University of the Philippines Open University
        </p>
      </div>
    </div>
  );
};

export default Login;