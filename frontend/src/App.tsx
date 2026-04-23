// frontend/src/App.tsx
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { UpouSidebar } from "./components/upou/UpouSidebar";
import { useChatbot } from "./hooks/useChatbot";
import AboutPage from "./pages/AboutPage";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";
import ChecklistPage from "./pages/ChecklistPage";
import { Ticket } from "./types/ticket";

const queryClient = new QueryClient();

const AppLayout = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const handleAddTicket = (newTicket: Ticket) =>
    setTickets((prev) => [newTicket, ...prev]);
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

        {/* All other pages — with UpouSidebar */}
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
                <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
                  <main className="flex-1 flex flex-col overflow-hidden">
                    <Routes>
                      <Route
                        path="/"
                        element={<ChatPage chatState={chatState} />}
                      />
                      <Route
                        path="/checklist"
                        element={
                          <div className="h-screen flex flex-col overflow-hidden">
                            {/* Mobile header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white md:hidden shrink-0">
                              <SidebarTrigger />
                              <span className="text-sm font-semibold text-gray-800">
                                Checklist
                              </span>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                              <ChecklistPage />
                            </div>
                          </div>
                        }
                      />
                      <Route
                        path="/about"
                        element={
                          <div className="h-screen overflow-hidden flex flex-col">
                            {/* Mobile header with sidebar trigger */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 md:hidden shrink-0">
                              <SidebarTrigger />
                              <span className="text-sm font-semibold text-gray-800">
                                About
                              </span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <AboutPage />
                            </div>
                          </div>
                        }
                      />
                      <Route
                        path="*"
                        element={
                          <div className="text-center mt-20 text-gray-500">
                            Page Not Found
                          </div>
                        }
                      />
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
