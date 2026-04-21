// frontend/src/components/admin/DashboardOverview.tsx
// frontend/src/components/admin/DashboardOverview.tsx
import { CheckCircle2, Clock, InboxIcon, Loader2 } from 'lucide-react';
import { FC } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Ticket } from '../../types/ticket';

interface Props {
  tickets: Ticket[];
  onNavigate: (view: 'dashboard' | 'tickets') => void;
}

const DashboardOverview: FC<Props> = ({ tickets, onNavigate }) => {
  const total = tickets.length;
  const inProcess = tickets.filter(t => t.status === 'New').length;
  const inProgress = tickets.filter(t => t.status === 'Replied').length;
  const completed = tickets.filter(t => t.status === 'Resolved' || t.status === 'Answered').length;

  // Last 7 days bar chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { label, count: tickets.filter(t => t.date === dateStr).length };
  });

  // Pie chart
  const pieData = [
    { name: 'Completed', value: completed, color: '#16a34a' },
    { name: 'In Process', value: inProcess, color: '#2563eb' },
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Submitted', value: tickets.filter(t => t.status === 'New').length, color: '#6b7280' },
  ].filter(d => d.value > 0);

  const recent = [...tickets].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const statCards = [
    { label: 'Total Tickets', value: total, sub: 'Across all statuses', icon: InboxIcon, color: 'text-primary' },
    { label: 'In Process', value: inProcess, sub: `${total ? Math.round(inProcess/total*100) : 0}% of all tickets`, icon: Clock, color: 'text-blue-500' },
    { label: 'In Progress', value: inProgress, sub: `${total ? Math.round(inProgress/total*100) : 0}% of all tickets`, icon: Loader2, color: 'text-amber-500' },
    { label: 'Completed', value: completed, sub: `${total ? Math.round(completed/total*100) : 0}% of all tickets`, icon: CheckCircle2, color: 'text-green-500' },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-xs text-gray-500 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">DR</div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">Dr. Ramona Aquino</p>
            <p className="text-[11px] text-gray-400">Administrator</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          {statCards.map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
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
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Status Distribution</h3>
            <p className="text-xs text-gray-400 mb-4">Current breakdown of all tickets</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="40%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-gray-600">{value}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Tickets over time</h3>
            <p className="text-xs text-gray-400 mb-4">Submissions in the last 7 days</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="count" fill="hsl(0 72% 28%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Recent Activity</h3>
              <p className="text-xs text-gray-400">Latest updates across tickets</p>
            </div>
            <button onClick={() => onNavigate('tickets')} className="text-xs text-primary font-medium hover:underline">
              View all →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recent.map(t => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="text-xs font-bold text-primary mr-2">{t.id}</span>
                  <span className="text-sm font-medium text-gray-800">{t.subject}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{t.user} · {t.date}</p>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  t.status === 'Resolved' || t.status === 'Answered' ? 'bg-green-50 text-green-700 border-green-200' :
                  t.status === 'Replied' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>{t.status}</span>
              </div>
            ))}
            {recent.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No tickets yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;