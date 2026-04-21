// frontend/src/components/admin/AdminDashboard.tsx
import { FC, useState } from 'react';

import { Ticket } from '@/types/ticket';
import AdminLogin from './AdminLogin';
import AdminSidebar from './AdminSidebar';
import DashboardOverview from './DashboardOverview';
import TicketsView from './TicketsView';

interface AdminDashboardProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

const AdminDashboard: FC<AdminDashboardProps> = ({ tickets, setTickets }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'tickets'>('dashboard');

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <AdminSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onSignOut={() => setIsAuthenticated(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'dashboard' ? (
          <DashboardOverview tickets={tickets} onNavigate={setActiveView} />
        ) : (
          <TicketsView tickets={tickets} setTickets={setTickets} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;