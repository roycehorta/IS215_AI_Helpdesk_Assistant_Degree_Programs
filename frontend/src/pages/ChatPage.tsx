// frontend/src/pages/ChatPage.tsx
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SuggestionCards } from "@/components/upou/SuggestionCards";
import { TicketDialog } from "@/components/upou/TicketDialog";
import { Send, Sparkles, Ticket } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
import ChatMessage from "../components/ChatMessage";
import { Message } from "../types/chat";
const TypingIndicator: FC = () => {
  useEffect(() => {
    // typing sound — subtle click loop
    const ctx = new AudioContext();
    let stopped = false;

    const playTick = () => {
      if (stopped) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 600 + Math.random() * 200;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
      setTimeout(playTick, 80 + Math.random() * 120);
    };

    playTick();
    return () => {
      stopped = true;
      ctx.close();
    };
  }, []);

  return (
    <div className="flex gap-3 flex-row mb-6">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
        <img src="/oblation.png" alt="UP" className="w-6 h-6 object-contain" />
      </div>

      {/* Bubble */}
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "0.9s" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: "180ms", animationDuration: "0.9s" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: "360ms", animationDuration: "0.9s" }}
        />
      </div>
    </div>
  );
};

interface ChatPageProps {
  chatState: {
    messages: Message[];
    isTyping: boolean;
    currentMenu: string[];
    sendMessage: (text: string) => void;
    ticketDialogOpen: boolean;
    setTicketDialogOpen: (open: boolean) => void;
  };
}

const ChatPage: FC<ChatPageProps> = ({ chatState }) => {
  const {
    messages,
    isTyping,
    sendMessage,
    ticketDialogOpen,
    setTicketDialogOpen,
  } = chatState;
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastBotMessage = [...messages]
    .reverse()
    .find((m) => m.sender === "bot");

  const lastUserMessage =
    [...messages].reverse().find((m) => m.sender === "user")?.text ?? "";

  const hasActionLinks =
    typeof lastBotMessage?.text === "string"
      ? lastBotMessage.text.includes("#action")
      : false;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

const hasBotReply = messages.filter((m) => m.sender === "bot").length > 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Top bar */}
      <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4">
        <SidebarTrigger className="text-foreground" />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none text-foreground">
              UPOU AI Helpdesk
            </h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Degree programs
            </p>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 0%, color-mix(in oklab, var(--primary) 6%, transparent) 0%, transparent 50%)",
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
          {messages.map((msg, i) => (
            <ChatMessage
              key={msg.timestamp ?? i}
              message={msg}
              index={i}
              isNew={
                msg.sender === "bot" && i === messages.length - 1 && !isTyping
              }
              onQuickReply={sendMessage}
            />
          ))}
          {/* Show suggestion cards after welcome message only */}
          {messages.length === 1 && (
            <div className="mt-4">
              <SuggestionCards onSelect={sendMessage} />
            </div>
          )}
          {isTyping && <TypingIndicator />}
        </div>
        {!isTyping &&
          messages.length > 1 &&
          chatState.currentMenu.length > 0 &&
          !hasActionLinks && (
            <div className="flex flex-wrap justify-center gap-3 mt-2 mb-6">
              {chatState.currentMenu.map((option) => (
                <div
                  key={option}
                  onClick={() => sendMessage(option)}
                  className="group cursor-pointer flex items-center gap-2 px-5 py-3 rounded-full border border-primary/40 bg-background text-primary text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:-translate-y-0.5"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
      </main>

      {/* Input bar */}
      <div className="border-t border-border bg-card/60 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          {hasBotReply && (
            <div className="mb-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTicketDialogOpen(true)}
                className="gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Ticket className="h-4 w-4" />
                Convert to Ticket
              </Button>
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 shadow-sm focus-within:border-primary/50"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              disabled={isTyping}
              className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              maxLength={1000}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="h-9 w-9 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Responses are generated from a UPOU knowledge base. For complex
            concerns, convert to a ticket.
          </p>
        </div>
      </div>

      <TicketDialog
        open={ticketDialogOpen}
        onOpenChange={setTicketDialogOpen}
        initialConcern={lastUserMessage} //
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

export default ChatPage;
