// frontend/src/components/admin/AdminSidebar.tsx
// frontend/src/components/admin/AdminSidebar.tsx
import { LayoutDashboard, LogOut, Ticket } from "lucide-react";
import { FC } from "react";

interface AdminSidebarProps {
  activeView: "dashboard" | "tickets";
  onNavigate: (view: "dashboard" | "tickets") => void;
  onSignOut: () => void;
}

const AdminSidebar: FC<AdminSidebarProps> = ({
  activeView,
  onNavigate,
  onSignOut,
}) => {
  const navItem = (view: "dashboard" | "tickets", label: string, Icon: any) => (
    <button
      onClick={() => onNavigate(view)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        activeView === view
          ? "bg-white/15 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="w-52 bg-primary flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <img
            src="/src/img/up.png"
            alt="UP"
            className="h-8 w-8 object-contain rounded-lg"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              UPOU Helpdesk
            </p>
            <p className="text-white/60 text-[10px]">ADMIN PANEL</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItem("dashboard", "Dashboard", LayoutDashboard)}
        {navItem("tickets", "Tickets", Ticket)}
      </nav>

      {/* User + Sign out */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
            DR
          </div>
          <div>
            <p className="text-white text-xs font-semibold leading-tight">
              Dr. Ramona Aquino
            </p>
            <p className="text-white/50 text-[10px]">admin@upou.edu.ph</p>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
