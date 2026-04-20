// frontend/src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useChatbot } from "./hooks/useChatbot";
import { Ticket } from "./types/ticket";

import AppSidebar from "./components/layout/AppSidebar";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";

const queryClient = new QueryClient();

// Move initial tickets here so they load globally
const INITIAL_TICKETS: Ticket[] = [
  { id: 'TKT-1023', user: 'juan.delacruz@upou.edu.ph', subject: 'AIMS Portal Password Reset', status: 'New', date: '2026-04-08', details: 'I forgot my password...' },
  { id: 'TKT-1022', user: 'maria.clara@upou.edu.ph', subject: 'Submission Error on MyPortal', status: 'Answered', date: '2026-04-07', details: 'Getting a 500 error...' },
];

const App = () => {
  // 1. GLOBAL STATE: Tickets array
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);

  // 2. The bridge function: Allows the chatbot to push data into the Admin table
  const handleAddTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  // 3. GLOBAL STATE: Chatbot hook (now survives page changes!)
  const chatState = useChatbot(handleAddTicket);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <div className="flex-1 flex flex-col h-screen min-w-0">
            <header className="h-14 flex items-center px-6 border-b border-gray-200 bg-white shadow-sm z-10">
              <span className="text-sm font-medium text-gray-500">UPOU Degree Programs Advisor Platform</span>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
              <Routes>
                {/* Pass the global states down as props */}
                <Route path="/" element={<ChatPage chatState={chatState} />} />
                <Route path="/admin" element={<AdminDashboard tickets={tickets} setTickets={setTickets} />} />
                <Route path="*" element={<div className="text-center mt-20 text-gray-500">Page Not Found</div>} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;