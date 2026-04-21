// frontend/src/App.tsx
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar";
import { UpouSidebar } from "./components/upou/UpouSidebar";
import { useChatbot } from "./hooks/useChatbot";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";
import { Ticket } from "./types/ticket";

const queryClient = new QueryClient();

const INITIAL_TICKETS: Ticket[] = [
  { id: 'TKT-1023', user: 'juan.delacruz@upou.edu.ph', subject: 'FICS info is not available.', status: 'New', date: '2026-04-08', details: 'I forgot my password...' },
  { id: 'TKT-1022', user: 'maria.clara@upou.edu.ph', subject: 'Nursing Related Degree', status: 'Answered', date: '2026-04-07', details: 'Getting a 500 error...' },
];

// Separate layout component so hooks work inside BrowserRouter
const AppLayout = () => {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const handleAddTicket = (newTicket: Ticket) => setTickets((prev) => [newTicket, ...prev]);
  const chatState = useChatbot(handleAddTicket);

  return (
   <>
   <Toaster position="top-center" richColors />
    <Routes>
      {/* Admin — full screen, own sidebar */}
      <Route
        path="/admin"
        element={<AdminDashboard tickets={tickets} setTickets={setTickets} />}
      />

      {/* Chat — with UpouSidebar */}
      <Route
        path="/*"
        element={
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <UpouSidebar
                conversations={chatState.conversations}
                activeId={chatState.activeId}
                onNewChat={chatState.handleNewChat}
                onSelect={chatState.handleSelectConversation}
                onDelete={chatState.handleDeleteConversation}
              />
              <div className="flex-1 flex flex-col h-screen min-w-0">
                <main className="flex-1 flex flex-col overflow-hidden">
                  <Routes>
                    <Route path="/" element={<ChatPage chatState={chatState} />} />
                    <Route path="*" element={<div className="text-center mt-20 text-gray-500">Page Not Found</div>} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        }
      />
    </Routes>
   </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;