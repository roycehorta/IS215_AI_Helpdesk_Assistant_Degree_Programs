// frontend/src/components/admin/AdminSidebar.tsx
import { LayoutDashboard, LogOut, Menu, Ticket } from "lucide-react";
import { FC, useState } from "react";

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
  const [collapsed, setCollapsed] = useState(false);

  const navItem = (view: "dashboard" | "tickets", label: string, Icon: any) => (
    <button
      onClick={() => onNavigate(view)}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        collapsed ? "justify-center" : ""
      } ${
        activeView === view
          ? "bg-white/15 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </button>
  );

  return (
    <div
      className={`${
        collapsed ? "w-16" : "w-52"
      } bg-primary flex flex-col h-full shrink-0 transition-all duration-200`}
    >
      {/* Logo + collapse toggle */}
      <div className="px-3 py-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <img
              src="/oblation.png"
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
        )}
        {collapsed && (
          <img
            src="/oblation.png"
            alt="UP"
            className="h-8 w-8 object-contain rounded-lg mx-auto"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="hidden md:block text-white/60 hover:text-white transition-colors ml-auto shrink-0"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItem("dashboard", "Dashboard", LayoutDashboard)}
        {navItem("tickets", "Tickets", Ticket)}
      </nav>

      {/* User + Sign out */}
      <div className="px-2 py-4 border-t border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs shrink-0">
              DR
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold leading-tight truncate">
                Helpdesk Admin
              </p>
              <p className="text-white/50 text-[10px] truncate">
                admin@upou.edu.ph
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onSignOut}
          title={collapsed ? "Sign out" : undefined}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
