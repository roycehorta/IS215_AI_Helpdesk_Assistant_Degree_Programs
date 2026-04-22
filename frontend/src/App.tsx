// frontend/src/App.tsx
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar";
import { UpouSidebar } from "./components/upou/UpouSidebar";
import { useChatbot } from "./hooks/useChatbot";
import AboutPage from "./pages/AboutPage";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";
import ChecklistPage from "./pages/ChecklistPage";
import { Ticket } from "./types/ticket";

const queryClient = new QueryClient();


// Separate layout component so hooks work inside BrowserRouter
const AppLayout = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const handleAddTicket = (newTicket: Ticket) =>
    setTickets((prev) => [newTicket, ...prev]);
  const chatState = useChatbot(handleAddTicket);
  const location = useLocation(); //

  //hide sidebar on about page since it only contains static info and doesn't need navigation
  const hideMainSidebar = location.pathname === "/about";

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
                {/* ← Hide sidebar on /about */}
                {!hideMainSidebar && (
                  <UpouSidebar
                    conversations={chatState.conversations}
                    activeId={chatState.activeId}
                    onNewChat={chatState.handleNewChat}
                    onSelect={chatState.handleSelectConversation}
                    onDelete={chatState.handleDeleteConversation}
                  />
                )}
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
                          <div className="h-screen overflow-y-auto">
                            <ChecklistPage />
                          </div>
                        }
                      />
                      <Route
                        path="/about"
                        element={
                          <div className="h-screen overflow-hidden">
                            <AboutPage />
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
