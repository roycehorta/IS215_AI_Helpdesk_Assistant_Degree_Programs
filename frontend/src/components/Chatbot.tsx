// frontend/src/components/Chatbot.tsx
import { FC, useEffect, useRef } from "react";
import { Message } from "../types/chat";
import { ChatInput } from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { SuggestionCards } from "./upou/SuggestionCards";
import { TicketDialog } from "./upou/TicketDialog";

interface ChatBotProps {
  messages: Message[];
  isTyping: boolean;
  currentMenu: string[];
  sendMessage: (text: string) => void;
  ticketDialogOpen: boolean;
  setTicketDialogOpen: (open: boolean) => void;
}

const ChatBot: FC<ChatBotProps> = ({
  messages,
  isTyping,
  currentMenu,
  sendMessage,
  ticketDialogOpen,
  setTicketDialogOpen,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full w-full bg-card md:border md:border-border md:rounded-2xl md:shadow-xl overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-primary text-primary-foreground p-4 font-bold text-lg shadow-md z-20 flex justify-between items-center px-6 flex-shrink-0">
        <span>🎓 UPOU Degree Programs AI Helpdesk</span>
        <span className="hidden md:block text-xs font-medium uppercase tracking-widest opacity-70">
          Helpdesk
        </span>
      </div>

      <div className="flex flex-1 flex-row min-h-0 bg-muted/30 relative">
        
        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            
            {/* Suggestion cards on first load */}
            {messages.length === 1 && (
              <div className="flex justify-center my-4">
                <SuggestionCards onSelect={sendMessage} />
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} onQuickReply={sendMessage} />
            ))}

            {isTyping && (
              <div className="text-xs text-muted-foreground animate-pulse mt-2">
                Advisor is typing...
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* MOBILE MENU */}
          {currentMenu.length > 0 && (
            <div className="md:hidden p-4 flex flex-col gap-2 bg-muted border-t border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Options</p>
              <div className="flex flex-wrap gap-2">
                {currentMenu.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    disabled={isTyping}
                    className={`text-xs font-bold border px-4 py-2 rounded-full transition-all ${
                      isTyping
                        ? "border-border text-muted-foreground bg-muted"
                        : "border-primary text-primary bg-background active:bg-primary active:text-primary-foreground"
                    }`}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ChatInput onSend={sendMessage} disabled={isTyping} />
        </div>

        {/* RIGHT PANEL: INTERACTION MENU (Desktop) */}
        <div className="hidden md:flex flex-col w-64 lg:w-80 bg-muted/50 border-l border-border p-6 z-10">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            Interaction Menu
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {currentMenu.length > 0 ? (
              currentMenu.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  disabled={isTyping}
                  className={`w-full text-left text-sm font-medium border px-4 py-4 rounded-xl transition-all duration-200 ${
                    isTyping
                      ? "border-border text-muted-foreground bg-muted shadow-none"
                      : "border-primary text-primary bg-background shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-md"
                  }`}
                >
                  {reply}
                </button>
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center mt-10 italic">
                Awaiting instructions...
              </div>
            )}
          </div>
        </div>
      </div>

      <TicketDialog
        open={ticketDialogOpen}
        onOpenChange={setTicketDialogOpen}
        transcript={messages.map((m, i) => ({
          id: String(i),
          role: m.sender === "bot" ? "bot" : "user",
          content: m.text,
          createdAt: Date.now(),
        }))}
      />
    </div>
  );
};

export default ChatBot;