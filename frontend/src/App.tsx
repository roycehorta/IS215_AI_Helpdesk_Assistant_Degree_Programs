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
import UpdateLogPage from "./pages/UpdateLogsPage";
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
                      <Route path="/updates" element={<UpdateLogPage />} />
                      <Route
                        path="*"
                        element={
                          <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <div className="text-8xl mb-4">🎓</div>
                            <h1 className="text-6xl font-bold text-primary mb-2">
                              404
                            </h1>
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">
                              Page Not Found
                            </h2>
                            <p className="text-gray-500 text-sm max-w-xs mb-6">
                              Looks like this page took an online course and
                              never came back. Even UPOU couldn't find it.
                            </p>
                            <button
                              onClick={() => (window.location.href = "/")}
                              className="px-5 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
                            >
                              Back to AI Chat
                            </button>
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
