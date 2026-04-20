// frontend\src\components\admin\TicketTable.tsx
// frontend/src/components/admin/TicketTable.tsx
import { FC, useState } from 'react';
import { Ticket, getStatusBadge } from '../../types/ticket';

interface TicketTableProps {
  tickets: Ticket[];
  onViewTicket: (ticket: Ticket) => void;
}

const TicketTable: FC<TicketTableProps> = ({ tickets, onViewTicket }) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredTickets = tickets.filter(ticket => 
    statusFilter === 'All' ? true : ticket.status === statusFilter
  );

  return (
    <div className="flex-1 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
          <tr>
            <th className="px-6 py-4 font-semibold w-24">Ticket ID</th>
            <th className="px-6 py-4 font-semibold w-1/3">Subject</th>
            <th className="px-6 py-4 font-semibold">User Email</th>
            <th className="px-6 py-4 font-semibold">Date</th>
            <th className="px-6 py-4 font-semibold">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none p-0 uppercase text-xs font-semibold text-gray-500 focus:ring-0 cursor-pointer hover:text-[#7b1113]"
              >
                <option value="All">STATUS (ALL)</option>
                <option value="New">NEW</option>
                <option value="Answered">ANSWERED</option>
                <option value="Replied">REPLIED</option>
                <option value="Resolved">RESOLVED</option>
              </select>
            </th>
            <th className="px-6 py-4 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
          {filteredTickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{ticket.id}</td>
              <td className="px-6 py-4">{ticket.subject}</td>
              <td className="px-6 py-4 text-gray-500">{ticket.user}</td>
              <td className="px-6 py-4 text-gray-500">{ticket.date}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold border ${getStatusBadge(ticket.status)}`}>
                  {ticket.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onViewTicket(ticket)}
                  className="text-[#7b1113] hover:text-red-900 font-bold text-xs uppercase tracking-wide px-3 py-2 rounded hover:bg-red-50 transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
          {filteredTickets.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">No tickets found for this status.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;