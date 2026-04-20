import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-surface px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elegant">
          <span className="font-serif text-2xl font-bold">UP</span>
        </div>
        <h1 className="font-serif text-5xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist in the UPOU Helpdesk admin portal.
        </p>
        <Button asChild className="mt-6 bg-gradient-primary text-primary-foreground hover:opacity-95">
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
