// frontend/src/hooks/useChatbot.ts
import { useEffect, useRef, useState } from "react";
import {
  deriveTitle,
  loadConversations,
  saveConversations,
  type Conversation,
} from "../lib/chat-storage";
import { Message } from "../types/chat";
import { Ticket } from "../types/ticket";

interface ChatResponse {
  answer: string;
  isRelevant?: boolean;
}

export const MENUS = {
  LEVEL_0: ["Browse by Academic Level", "Browse by Faculty Division"],
  LEVEL_1_LEVELS: [
    "Undergraduate",
    "Graduate Certificates",
    "Diplomas",
    "Master's Programs",
    "Doctorate",
  ],
  LEVEL_1_FACULTY: [
    "Faculty of Education (FEd)",
    "Faculty of Information and Communication Studies (FICS)",
    "Faculty of Management and Development Studies (FMDS)",
  ],
  LEVEL_3_TRAPPER: [
    "Yes, back to Main Menu",
    "No, open an IT Helpdesk Ticket",
    "Continue Chat",
  ],
};

const WELCOME: Message = {
  text: "Welcome to UPOU! 🎓 I am your Degree Programs Advisor. I can help you navigate our offerings. How can I help you today?",
  sender: "bot",
  timestamp: Date.now(),
};

function uid() {
  return crypto.randomUUID();
}

export const useChatbot = (onTicketCreate: (ticket: Ticket) => void) => {
  const [apiCallCount, setApiCallCount] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<string[]>(MENUS.LEVEL_0);
  const [ticketStep, setTicketStep] = useState<
    "idle" | "subject" | "description" | "email"
  >("idle");
  const [draftTicket, setDraftTicket] = useState<{
    subject?: string;
    details?: string;
  }>({});
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // trapper flag — set to true when 3rd API call completes
  // actual message fires only after animation completes via onAnimationComplete
  const shouldShowTrapperRef = useRef(false);

  useEffect(() => {
    const stored = loadConversations();
    setConversations(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveConversations(conversations);
  }, [conversations, hydrated]);

  useEffect(() => {
    if (!activeId || messages.length <= 1) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: messages.map((m, i) => ({
                id: String(i),
                role: m.sender === "bot" ? "bot" : "user",
                content: m.text,
                createdAt: Date.now(),
              })),
              updatedAt: Date.now(),
            }
          : c,
      ),
    );
  }, [messages, activeId]);

  const handleNewChat = () => {
    setActiveId(null);
    setMessages([{ ...WELCOME, timestamp: Date.now() }]);
    setCurrentMenu(MENUS.LEVEL_0);
    setTicketStep("idle");
    setDraftTicket({});
    setApiCallCount(0);
    shouldShowTrapperRef.current = false;
  };

  const handleSelectConversation = (id: string) => {
    const convo = conversations.find((c) => c.id === id);
    if (!convo) return;
    setActiveId(id);
    setMessages(
      convo.messages
        .filter((m) => typeof m.content === "string")
        .map((m) => ({
          text: m.content ?? "",
          sender: m.role === "bot" ? "bot" : ("user" as const),
          timestamp: m.createdAt,
        })),
    );
    setCurrentMenu(MENUS.LEVEL_0);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) handleNewChat();
  };

  const ensureConversation = (firstUserMessage: string): string => {
    if (activeId) return activeId;
    const newId = uid();
    const newConvo: Conversation = {
      id: newId,
      title: deriveTitle(firstUserMessage),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConvo, ...prev]);
    setActiveId(newId);
    return newId;
  };

  // Called by ChatPage when the last bot message finishes animating
  const handleAnimationComplete = () => {
    if (shouldShowTrapperRef.current) {
      shouldShowTrapperRef.current = false;
      setMessages((prev) => [
        ...prev,
        {
          text: "Did you get what you're looking for?",
          sender: "bot" as const,
          timestamp: Date.now(),
        },
      ]);
      setCurrentMenu(MENUS.LEVEL_3_TRAPPER);
    }
  };

  // ==========================================
  // PHASE 1: TICKETING FLOW
  // ==========================================
  const handleTicketing = (text: string, lower: string): boolean => {
    if (lower === "cancel ticket creation") {
      setTicketStep("idle");
      setDraftTicket({});
      setCurrentMenu(MENUS.LEVEL_0);
      setMessages((prev) => [
        ...prev,
        { text, sender: "user" },
        {
          text: "Ticket creation cancelled. What would you like to explore?",
          sender: "bot",
          timestamp: Date.now(),
        },
      ]);
      return true;
    }

    if (ticketStep !== "idle") {
      setMessages((prev) => [...prev, { text, sender: "user" }]);

      if (ticketStep === "subject") {
        setDraftTicket((prev) => ({ ...prev, subject: text }));
        setTicketStep("description");
        setTimeout(
          () =>
            setMessages((prev) => [
              ...prev,
              {
                text: "Please provide a detailed description of your issue:",
                sender: "bot",
                timestamp: Date.now(),
              },
            ]),
          400,
        );
      } else if (ticketStep === "description") {
        setDraftTicket((prev) => ({ ...prev, details: text }));
        setTicketStep("email");
        setTimeout(
          () =>
            setMessages((prev) => [
              ...prev,
              {
                text: "Finally, please provide your email address so our IT staff can contact you:",
                sender: "bot",
                timestamp: Date.now(),
              },
            ]),
          400,
        );
      } else if (ticketStep === "email") {
        const finalTicket: Ticket = {
          id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
          user: text,
          name: text,
          subject: draftTicket.subject ?? "No Subject",
          status: "New",
          date: new Date().toISOString().split("T")[0],
          details: draftTicket.details ?? "",
        };
        onTicketCreate(finalTicket);
        setTicketStep("idle");
        setDraftTicket({});
        setCurrentMenu(MENUS.LEVEL_0);
        setTimeout(
          () =>
            setMessages((prev) => [
              ...prev,
              {
                text: "Thank you! Your ticket has been submitted successfully.",
                sender: "bot",
                timestamp: Date.now(),
              },
            ]),
          400,
        );
      }
      return true;
    }
    return false;
  };

  // ==========================================
  // PHASE 2: LOCAL UI ROUTING
  // ==========================================
  const handleLocalRouting = (text: string, lower: string): boolean => {
    if (
      lower.includes("back to main menu") ||
      lower === "yes, back to main menu"
    ) {
      setMessages((prev) => [...prev, { text, sender: "user" }]);
      setCurrentMenu(MENUS.LEVEL_0);
      setTimeout(
        () =>
          setMessages((prev) => [
            ...prev,
            {
              text: "Returning to the main menu. What would you like to explore?",
              sender: "bot",
              timestamp: Date.now(),
            },
          ]),
        500,
      );
      return true;
    }

    if (
      lower.includes("open a support ticket") ||
      lower.includes("open ticket") ||
      lower.includes("open support ticket") ||
      lower.includes("open an it helpdesk ticket") ||
      lower.includes("open an it ticket")
    ) {
      setTicketDialogOpen(true);
      return true;
    }


    if (lower === "continue chat") {
      setMessages((prev) => [...prev, { text, sender: "user" }]);
      setCurrentMenu([]);
      setTimeout(
        () =>
          setMessages((prev) => [
            ...prev,
            {
              text: "Sure! Feel free to ask me anything about UPOU programs.",
              sender: "bot",
              timestamp: Date.now(),
            },
          ]),
        400,
      );
      return true;
    }

    if (lower === "browse by academic level") {
      setMessages((prev) => [...prev, { text, sender: "user" }]);
      setCurrentMenu(MENUS.LEVEL_1_LEVELS);
      setTimeout(
        () =>
          setMessages((prev) => [
            ...prev,
            {
              text: "Please select an academic level:\n* [Undergraduate](#action)\n* [Graduate Certificates](#action)\n* [Diplomas](#action)\n* [Master's Programs](#action)\n* [Doctorate](#action)",
              sender: "bot",
              timestamp: Date.now(),
            },
          ]),
        400,
      );
      return true;
    }

    if (lower === "browse by faculty division") {
      setMessages((prev) => [...prev, { text, sender: "user" }]);
      setCurrentMenu(MENUS.LEVEL_1_FACULTY);
      setTimeout(
        () =>
          setMessages((prev) => [
            ...prev,
            {
              text: "Please select a faculty:\n* [Faculty of Education (FEd)](#action)\n* [Faculty of Information and Communication Studies (FICS)](#action)\n* [Faculty of Management and Development Studies (FMDS)](#action)",
              sender: "bot",
              timestamp: Date.now(),
            },
          ]),
        400,
      );
      return true;
    }

    if (lower === "trimester programs") {
      setMessages((prev) => [...prev, { text, sender: "user" }]);
      setCurrentMenu(MENUS.LEVEL_3_TRAPPER);
      setTimeout(
        () =>
          sendMessage(
            "What UPOU undergraduate programs follow a trimester schedule?",
          ),
        100,
      );
      return true;
    }

    if (lower === "semester programs") {
      setMessages((prev) => [...prev, { text, sender: "user" }]);
      setCurrentMenu(MENUS.LEVEL_3_TRAPPER);
      setTimeout(
        () =>
          sendMessage(
            "What UPOU graduate programs follow a semester schedule?",
          ),
        100,
      );
      return true;
    }

    return false;
  };

  // ==========================================
  // PHASE 3: MAIN EXECUTOR
  // ==========================================
  const sendMessage = async (text: string) => {
    if (text.startsWith("__TOR_RESULT__:")) {
      const recommendation = text.replace("__TOR_RESULT__:", "");
      setMessages((prev) => [
        ...prev,
        { text: recommendation, sender: "bot" as const, timestamp: Date.now() },
      ]);
      return;
    }

    if (!text.trim()) return;
    const lower = text.toLowerCase();
    if (handleTicketing(text, lower)) return;
    if (handleLocalRouting(text, lower)) return;

    ensureConversation(text);
    setMessages((prev) => [...prev, { text, sender: "user" }]);
    setIsTyping(true);

    const typingSound = new Audio("/typing-sound.mp3");
    typingSound.loop = true;
    try {
      await typingSound.play();
    } catch {
      /* noop */
    }

    const historyPayload = messages.slice(-4).map((msg) => ({
      role: msg.sender === "bot" ? "assistant" : "user",
      content: msg.sender === "bot" ? "" : msg.text,
    }));

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history: historyPayload }),
      });
      const data: ChatResponse = await response.json();

      setMessages((prev) => [
        ...prev,
        { text: data.answer, sender: "bot" as const, timestamp: Date.now() },
      ]);

      const newCount = apiCallCount + 1;
      setApiCallCount(newCount);

      const isRelevant = data.isRelevant ?? true;

      if (!isRelevant) {
        // Bot couldn't answer — show trapper immediately after animation
        shouldShowTrapperRef.current = true;
      } else if (newCount % 3 === 0) {
        // Every 3rd API call — show trapper after animation
        shouldShowTrapperRef.current = true;
      } else {
        setCurrentMenu([]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          text: "Connection error. Please try again.",
          sender: "bot" as const,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
      typingSound.pause();
      typingSound.currentTime = 0;
    }
  };

  return {
    messages,
    isTyping,
    currentMenu,
    sendMessage,
    ticketDialogOpen,
    setTicketDialogOpen,
    conversations,
    activeId,
    handleNewChat,
    handleSelectConversation,
    handleDeleteConversation,
    handleAnimationComplete,
  };
};
