import { LayoutDashboard, LogOut, Ticket as TicketIcon, Menu } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import upLogo from "@/img/up.png";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tickets", label: "Tickets", icon: TicketIcon },
];

const SidebarInner = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      
      <div className="px-6 pb-6 pt-7">
        <div className="flex items-center gap-3">
          <img
            src={upLogo}
            alt="UP Logo"
            className="h-12 w-12 object-contain"
          />

          <div className="leading-tight">
            <div className="font-serif text-base font-bold">UPOU Helpdesk</div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
            <span className="text-xs font-bold">
              {user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </span>
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold">{user?.name}</div>
            <div className="truncate text-[11px] text-sidebar-foreground/60">
              {user?.email}
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
};

export const AdminLayout = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-gradient-surface">
      
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="fixed h-screen w-64">
          <SidebarInner />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
          
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarInner onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-xl font-bold text-foreground md:text-2xl">
              {title}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-PH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="hidden items-center gap-2 text-right sm:flex">
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground">
                {user?.name}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Administrator
              </div>
            </div>
          </div>
        </header>

        <main
          key={location.pathname}
          className="animate-fade-in flex-1 px-4 py-6 md:px-8 md:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
};