import { useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { useTickets } from "@/store/ticketStore";
import { STATUS_ORDER, TicketStatus } from "@/data/tickets";
import { CheckCircle2, Clock, Inbox, Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";

const statusColors: Record<TicketStatus, string> = {
  Submitted: "hsl(0 0% 50%)",
  "In Process": "hsl(211 85% 48%)",
  "In Progress": "hsl(38 92% 50%)",
  Completed: "hsl(142 65% 38%)",
};

const Dashboard = () => {
  const { tickets } = useTickets();

  const stats = useMemo(() => {
    const counts: Record<TicketStatus, number> = {
      Submitted: 0, "In Process": 0, "In Progress": 0, Completed: 0,
    };
    tickets.forEach((t) => counts[t.status]++);
    return counts;
  }, [tickets]);

  const pieData = STATUS_ORDER.map((s) => ({ name: s, value: stats[s] }));

  const trendData = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
        count: 0,
      });
    }
    tickets.forEach((t) => {
      const key = t.dateSubmitted.slice(0, 10);
      const day = days.find((x) => x.date === key);
      if (day) day.count++;
    });
    return days;
  }, [tickets]);

  const recent = useMemo(() => {
    return [...tickets]
      .sort((a, b) => {
        const la = a.timeline[a.timeline.length - 1].at;
        const lb = b.timeline[b.timeline.length - 1].at;
        return lb.localeCompare(la);
      })
      .slice(0, 5);
  }, [tickets]);

  const cards = [
    { label: "Total Tickets", value: tickets.length, icon: Inbox, tint: "text-primary bg-primary/10" },
    { label: "In Process", value: stats["In Process"], icon: Clock, tint: "text-info bg-info/10" },
    { label: "In Progress", value: stats["In Progress"], icon: Loader2, tint: "text-warning-foreground bg-warning/20" },
    { label: "Completed", value: stats.Completed, icon: CheckCircle2, tint: "text-success bg-success/10" },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</div>
                <div className="mt-2 font-serif text-3xl font-bold text-foreground">{c.value}</div>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.tint}`}>
                <c.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {c.label === "Total Tickets"
                ? "Across all statuses"
                : `${Math.round((Number(c.value) / Math.max(tickets.length, 1)) * 100)}% of all tickets`}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-5 shadow-card lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-foreground">Status Distribution</h2>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">Current breakdown of all tickets</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={statusColors[d.name as TicketStatus]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-card lg:col-span-3">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-foreground">Tickets over time</h2>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">Submissions in the last 14 days</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6 shadow-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">Recent Activity</h2>
            <p className="text-xs text-muted-foreground">Latest updates across tickets</p>
          </div>
          <Link to="/tickets" className="text-xs font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {recent.map((t) => {
            const last = t.timeline[t.timeline.length - 1];
            return (
              <li key={t.id}>
                <Link to={`/tickets/${t.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-muted/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">{t.id}</span>
                      <span className="truncate text-sm font-medium text-foreground">{t.subject}</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {t.studentName} · {new Date(last.at).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </AdminLayout>
  );
};

export default Dashboard;
