// frontend/src/pages/AdminDashboard.tsx
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardOverview from "@/components/admin/DashboardOverview";
import TicketsView from "@/components/admin/TicketsView";
import { FC, useEffect, useState } from "react";
import AdminLogin, {
  clearSession,
  isSessionValid,
} from "../components/admin/AdminLogin";
import { Ticket } from "../types/ticket";

interface AdminDashboardProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

const AdminDashboard: FC<AdminDashboardProps> = ({ tickets, setTickets }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    isSessionValid(),
  );
  const [activeView, setActiveView] = useState<"dashboard" | "tickets">(
    "dashboard",
  );
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = () => setIsAuthenticated(true);

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
  };

  // ── Fetch tickets from DynamoDB on mount ──────────────────
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

        const mapped: Ticket[] = data.tickets.map(
          (t: {
            ticketId: string;
            name: string;
            email: string;
            category: string;
            description: string;
            status: string;
            createdAt: string;
            question: string;
          }) => {
            // ── Map DynamoDB uppercase status → Ticket status ──
            const statusMap: Record<string, Ticket["status"]> = {
              OPEN: "New",
              ANSWERED: "Answered",
              REPLIED: "Answered",
              RESOLVED: "Answered",
              New: "New",
              Answered: "Answered",
              Replied: "Answered",
              Resolved: "Answered",
            };

            return {
              id: t.ticketId,
              user: t.email || t.name,
              subject: t.category || "General",
              status: statusMap[t.status] ?? "New",
              date: t.createdAt ? t.createdAt.split("T")[0] : "",
              details: t.description || t.question || "",
            };
          },
        );

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
      <AdminSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onSignOut={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: "3px solid #E5E7EB",
                  borderTop: "3px solid #7B1113",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p className="text-sm text-gray-400">Loading tickets...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        ) : activeView === "dashboard" ? (
          <DashboardOverview tickets={tickets} onNavigate={setActiveView} />
        ) : (
          <TicketsView tickets={tickets} setTickets={setTickets} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
