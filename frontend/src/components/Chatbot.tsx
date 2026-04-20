// frontend/src/components/Chatbot.tsx
import { FC, useEffect, useRef } from 'react';
import { Message } from '../types/chat';
import { ChatInput } from './ChatInput';
import ChatMessage from './ChatMessage';

interface ChatBotProps {
  messages: Message[];
  isTyping: boolean;
  currentMenu: string[];
  sendMessage: (text: string) => void;
}

const ChatBot: FC<ChatBotProps> = ({ messages, isTyping, currentMenu, sendMessage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    // FIX: Removed h-[85vh] and max-w-5xl. Added h-full and w-full for full-screen feel.
    <div className="flex flex-col h-full w-full bg-white md:border md:border-gray-200 md:rounded-2xl md:shadow-xl overflow-hidden">
      
      {/* ================= UNIFIED TOP HEADER ================= */}
      <div className="bg-[#7b1113] text-white p-4 font-bold text-lg shadow-md z-20 flex justify-between items-center px-6 flex-shrink-0">
        <span>🎓 UPOU Degree Programs AI Helpdesk</span>
        <span className="hidden md:block text-xs font-medium uppercase tracking-widest opacity-70">
           Helpdesk
        </span>
      </div>

      {/* ================= SPLIT CONTENT WRAPPER ================= */}
      <div className="flex flex-1 flex-row min-h-0 bg-gray-50 relative">
        
        {/* ================= LEFT PANEL: CHAT AREA ================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} onQuickReply={sendMessage} />
            ))}
            {isTyping && <div className="text-xs text-gray-400 animate-pulse mt-2">Advisor is typing...</div>}
            <div ref={scrollRef} />
          </div>

          {/* MOBILE MENU: Floating Action Sheet style for better mobile UX */}
          {currentMenu.length > 0 && (
            <div className="md:hidden p-4 flex flex-col gap-2 bg-gray-50 border-t border-gray-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Options</p>
              <div className="flex flex-wrap gap-2">
                {currentMenu.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    disabled={isTyping}
                    className={`text-xs font-bold border px-4 py-2 rounded-full transition-all ${
                      isTyping 
                        ? "border-gray-200 text-gray-300 bg-gray-50" 
                        : "border-[#7b1113] text-[#7b1113] bg-white active:bg-[#7b1113] active:text-white" 
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

        {/* ================= RIGHT PANEL: SIDEBAR (Desktop Only) ================= */}
        <div className="hidden md:flex flex-col w-64 lg:w-80 bg-gray-50 border-l border-gray-200 p-6 z-10">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
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
                      ? "border-gray-200 text-gray-400 bg-gray-100 shadow-none" 
                      : "border-[#7b1113] text-[#7b1113] bg-white shadow-sm hover:bg-[#7b1113] hover:text-white hover:shadow-md" 
                  }`}
                >
                  {reply}
                </button>
              ))
            ) : (
              <div className="text-xs text-gray-400 text-center mt-10 italic">Awaiting instructions...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;