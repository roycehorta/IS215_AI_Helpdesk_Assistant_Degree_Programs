// frontend/src/pages/AdminDashboard.tsx
import { FC, useState } from 'react';
import AdminLogin from '../components/admin/AdminLogin';
import NewTicketModal from '../components/admin/NewTicketModal';
import TicketModal from '../components/admin/TicketModal';
import TicketTable from '../components/admin/TicketTable';
import { Ticket } from '../types/ticket';

// 1. Tell the component to expect these props from App.tsx
interface AdminDashboardProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

const AdminDashboard: FC<AdminDashboardProps> = ({ tickets, setTickets }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('All Tickets');
  

  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isAddingTicket, setIsAddingTicket] = useState(false);

  // --- Handlers ---
  const handleStatusChange = (newStatus: Ticket['status']) => {
    if (selectedTicket) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
      setTickets(prevTickets => prevTickets.map(t => t.id === selectedTicket.id ? { ...t, status: newStatus } : t));
    }
  };

  const handleSendReply = (replyText: string) => {
    if (selectedTicket) {
      setTickets(prevTickets => prevTickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'Replied' } : t));
      alert(`Email sent to ${selectedTicket.user}:\n\n${replyText}`);
      setSelectedTicket(null);
    }
  };

  // 3. NEW HANDLER: Add the newly created ticket to the top of the array
  const handleAddManualTicket = (newTicket: Ticket) => {
    setTickets(prevTickets => [newTicket, ...prevTickets]);
    setIsAddingTicket(false); // Close the modal
  };

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and respond to student inquiries.</p>
        </div>
        
        {/* 4. NEW BUTTON GROUP: Placed the buttons side-by-side */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsAddingTicket(true)} 
            className="px-4 py-2 bg-[#7b1113] hover:bg-[#5a0d0e] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors"
          >
            + Manual Ticket
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)} 
            className="text-sm text-gray-500 hover:text-[#7b1113] font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        {/* Admin Nav Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 flex space-x-6">
          {['All Tickets', 'My Assigned', 'Resolved', 'Settings'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 px-1 text-sm font-medium border-b-2 ${activeTab === tab ? 'border-[#7b1113] text-[#7b1113]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        <TicketTable tickets={tickets} onViewTicket={setSelectedTicket} />
      </div>

      {/* 5. RENDER MODALS CONDITIONALLY */}
      {selectedTicket && (
        <TicketModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          onStatusChange={handleStatusChange} 
          onSendReply={handleSendReply} 
        />
      )}

      {isAddingTicket && (
        <NewTicketModal 
          onClose={() => setIsAddingTicket(false)}
          onAddTicket={handleAddManualTicket}
        />
      )}
    </div>
  );
};

export default AdminDashboard;