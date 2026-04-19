import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Ticket } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UpouSidebar } from "@/components/upou/UpouSidebar";
import { SuggestionCards } from "@/components/upou/SuggestionCards";
import { ChatMessage } from "@/components/upou/ChatMessage";
import { TicketDialog } from "@/components/upou/TicketDialog";
import {
  deriveTitle,
  loadConversations,
  saveConversations,
  type ChatMessage as ChatMessageType,
  type Conversation,
} from "@/lib/chat-storage";
import { getScriptedReply } from "@/lib/upou-knowledge";

export const Route = createFileRoute("/")({
  component: HelpdeskPage,
});

function uid() {
  return crypto.randomUUID();
}

function HelpdeskPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [ticketOpen, setTicketOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Hydrate from localStorage (client-only)
  useEffect(() => {
    const list = loadConversations();
    setConversations(list);
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (hydrated) saveConversations(conversations);
  }, [conversations, hydrated]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const messages: ChatMessageType[] = active?.messages ?? [];
  const hasBotReply = messages.some((m) => m.role === "bot");

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleNewChat = () => {
    setActiveId(null);
    setInput("");
  };

  const handleDelete = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessageType = {
      id: uid(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };
    const botMsg: ChatMessageType = {
      id: uid(),
      role: "bot",
      content: getScriptedReply(trimmed),
      createdAt: Date.now() + 1,
    };

    if (active) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? {
                ...c,
                messages: [...c.messages, userMsg, botMsg],
                updatedAt: Date.now(),
              }
            : c,
        ),
      );
    } else {
      const newConvo: Conversation = {
        id: uid(),
        title: deriveTitle(trimmed),
        messages: [userMsg, botMsg],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations((prev) => [newConvo, ...prev]);
      setActiveId(newConvo.id);
    }
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <UpouSidebar
          conversations={conversations}
          activeId={activeId}
          onNewChat={handleNewChat}
          onSelect={setActiveId}
          onDelete={handleDelete}
        />

        <div className="flex flex-1 flex-col">
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
            {messages.length === 0 ? (
              <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  How can I help you today?
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Ask me anything about UPOU degree programs, the enrollment process, tuition &
                  fees, or technical support. Choose a suggestion or type your own question.
                </p>
                <div className="mt-8 w-full">
                  <SuggestionCards onSelect={sendMessage} />
                </div>
              </div>
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={m} />
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
                    onClick={() => setTicketOpen(true)}
                    className="gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Ticket className="h-4 w-4" />
                    Convert to Ticket
                  </Button>
                </div>
              )}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 shadow-sm focus-within:border-primary/50 focus-within:shadow-[var(--shadow-elegant)]"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  maxLength={1000}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="h-9 w-9 rounded-full"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Responses are generated from a UPOU knowledge base. For complex concerns, convert
                to a ticket.
              </p>
            </div>
          </div>
        </div>

        <TicketDialog
          open={ticketOpen}
          onOpenChange={setTicketOpen}
          transcript={messages}
        />
      </div>
    </SidebarProvider>
  );
}
