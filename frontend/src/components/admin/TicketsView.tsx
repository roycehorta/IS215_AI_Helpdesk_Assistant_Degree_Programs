// frontend/src/components/admin/TicketsView.tsx
// frontend/src/components/admin/TicketsView.tsx
import { Search } from 'lucide-react';
import { FC, useState } from 'react';
import { Ticket } from '../../types/ticket';
import NewTicketModal from './NewTicketModal';
import TicketModal from './TicketModal';

interface Props {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

const TicketsView: FC<Props> = ({ tickets, setTickets }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [sort, setSort] = useState('Newest first');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const filtered = tickets
    .filter(t => {
      const matchSearch = t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.user.toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All statuses' || t.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => sort === 'Newest first' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));

  const handleStatusChange = (newStatus: Ticket['status']) => {
    if (!selectedTicket) return;
    setSelectedTicket({ ...selectedTicket, status: newStatus });
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: newStatus } : t));
  };

  const handleSendReply = (replyText: string) => {
    if (!selectedTicket) return;
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'Replied' } : t));
    alert(`Email sent to ${selectedTicket.user}:\n\n${replyText}`);
    setSelectedTicket(null);
  };

  const handleAddTicket = (ticket: Ticket) => {
    setTickets(prev => [ticket, ...prev]);
    setIsAdding(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ticket Management</h1>
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

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-8 py-4 bg-white border-b border-gray-100">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ID, student, or subject..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {['All statuses', 'New', 'Answered', 'Replied', 'Resolved'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option>Newest first</option>
          <option>Oldest first</option>
        </select>
        <button
          onClick={() => setIsAdding(true)}
          className="ml-auto px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Add Ticket
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ticket ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student Name</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Concern</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Submitted</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 text-xs font-bold text-primary">{t.id}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{t.user.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                    <p className="text-xs text-gray-400">{t.user}</p>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-sm font-medium text-gray-800">{t.subject}</p>
                    <p className="text-xs text-gray-400 truncate">{t.details}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{t.date}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      t.status === 'Resolved' || t.status === 'Answered' ? 'bg-green-50 text-green-700 border-green-200' :
                      t.status === 'Replied' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>{t.status}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">No tickets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onStatusChange={handleStatusChange}
          onSendReply={handleSendReply}
        />
      )}
      {isAdding && (
        <NewTicketModal onClose={() => setIsAdding(false)} onAddTicket={handleAddTicket} />
      )}
    </div>
  );
};

export default TicketsView;