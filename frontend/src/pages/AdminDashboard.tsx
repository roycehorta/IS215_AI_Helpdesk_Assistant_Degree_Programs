// frontend/src/pages/AdminDashboard.tsx
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardOverview from "@/components/admin/DashboardOverview";
import TicketsView from "@/components/admin/TicketsView";
import { FC, useEffect, useState } from "react";
import AdminLogin, { clearSession, isSessionValid } from "../components/admin/AdminLogin";
import { Ticket } from "../types/ticket";

interface AdminDashboardProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

const AdminDashboard: FC<AdminDashboardProps> = ({ tickets, setTickets }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isSessionValid());
  const [activeView, setActiveView]           = useState<"dashboard" | "tickets">("dashboard");
  const [loading, setLoading]                 = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]   = useState(false);

  const handleLoginSuccess = () => setIsAuthenticated(true);
  const handleLogout       = () => { clearSession(); setIsAuthenticated(false); };

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const response = await fetch(import.meta.env.VITE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _route: "get-tickets" }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Failed to fetch");

        const statusMap: Record<string, Ticket["status"]> = {
          OPEN: "New", ANSWERED: "Answered", REPLIED: "Answered",
          RESOLVED: "Answered", New: "New", Answered: "Answered",
          Replied: "Answered", Resolved: "Answered",
        };

        const mapped: Ticket[] = data.tickets.map((t: {
          ticketId: string; name: string; email: string;
          category: string; description: string; status: string;
          createdAt: string; question: string;
        }) => ({
          id:      t.ticketId,
          user:    t.email || t.name,
          subject: t.category || "General",
          status:  statusMap[t.status] ?? "New",
          date:    t.createdAt ? t.createdAt.split("T")[0] : "",
          details: t.description || t.question || "",
        }));

        setTickets(mapped);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-200 md:hidden ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <AdminSidebar
          activeView={activeView}
          onNavigate={(view) => { setActiveView(view); setMobileMenuOpen(false); }}
          onSignOut={handleLogout}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <AdminSidebar
          activeView={activeView}
          onNavigate={setActiveView}
          onSignOut={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-[#7B1113] animate-spin" />
              <p className="text-sm text-gray-400">Loading tickets...</p>
            </div>
          </div>
        ) : activeView === "dashboard" ? (
          <DashboardOverview
            tickets={tickets}
            onNavigate={setActiveView}
            onMenuOpen={() => setMobileMenuOpen(true)}
          />
        ) : (
          <TicketsView
            tickets={tickets}
            setTickets={setTickets}
            onMenuOpen={() => setMobileMenuOpen(true)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;