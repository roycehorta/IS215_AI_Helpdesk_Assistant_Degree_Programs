// frontend/src/components/admin/DashboardOverview.tsx
import { CheckCircle2, Clock, InboxIcon, Menu } from "lucide-react";
import { FC } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Ticket } from "../../types/ticket";

interface Props {
  tickets: Ticket[];
  onNavigate: (view: "dashboard" | "tickets") => void;
  onMenuOpen?: () => void;
}

const DashboardOverview: FC<Props> = ({ tickets, onNavigate, onMenuOpen }) => {
  const total          = tickets.length;
  const newTickets     = tickets.filter((t) => t.status === "New").length;
  const answeredTickets = tickets.filter((t) => t.status === "Answered").length;

  const statCards = [
    { label: "Total Tickets", value: total,          sub: "Across all statuses",                                                    icon: InboxIcon,    color: "text-primary"    },
    { label: "New",           value: newTickets,      sub: `${total ? Math.round((newTickets / total) * 100) : 0}% pending`,        icon: Clock,        color: "text-blue-500"   },
    { label: "Answered",      value: answeredTickets, sub: `${total ? Math.round((answeredTickets / total) * 100) : 0}% done`,     icon: CheckCircle2, color: "text-green-500"  },
  ];

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const label   = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { label, count: tickets.filter((t) => t.date === dateStr).length };
  });

  const CATEGORY_STYLES: Record<string, string> = {
    enrollment: "bg-purple-50 text-purple-700",
    programs:   "bg-blue-50 text-blue-700",
    tuition:    "bg-green-50 text-green-700",
    technical:  "bg-orange-50 text-orange-700",
    academic:   "bg-rose-50 text-rose-700",
    general:    "bg-gray-50 text-gray-600",
    other:      "bg-gray-50 text-gray-600",
  };

  const pieData = [
    { name: "New",      value: newTickets,      color: "#2563eb" },
    { name: "Answered", value: answeredTickets, color: "#16a34a" },
  ].filter((d) => d.value > 0);

  const recent = [...tickets].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">

      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuOpen}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-xs text-gray-500 mt-0.5">{today}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
            ADM
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">Helpdesk Admin</p>
            <p className="text-[11px] text-gray-400">Administrator</p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {statCards.map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{sub}</p>
                </div>
                <div className={`${color} opacity-60`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Status Distribution</h3>
            <p className="text-xs text-gray-400 mb-4">Current breakdown of all tickets</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="40%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Tickets over time</h3>
            <p className="text-xs text-gray-400 mb-4">Submissions in the last 7 days</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="count" fill="hsl(0 72% 28%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Recent Activity</h3>
              <p className="text-xs text-gray-400">Latest updates across tickets</p>
            </div>
            <button
              onClick={() => onNavigate("tickets")}
              className="text-xs text-primary font-medium hover:underline shrink-0"
            >
              View all →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recent.map((t) => (
              <div key={t.id} className="flex items-start sm:items-center justify-between py-3 gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-primary font-mono">{t.id}</span>
                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${CATEGORY_STYLES[t.subject] ?? CATEGORY_STYLES["general"]}`}>
                      {t.subject}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{t.user} · {t.date}</p>
                </div>
                <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  t.status === "Answered"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
            {recent.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No tickets yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;