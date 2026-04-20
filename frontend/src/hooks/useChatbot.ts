// frontend/src/hooks/useChatbot.ts
import { useState } from "react";
import { Message } from "../types/chat";
import { Ticket } from "../types/ticket";

interface ChatResponse { answer: string; }

export const MENUS = {
  LEVEL_0: ["Browse by Academic Level", "Browse by Faculty Division", "Browse by Academic Calendar"],
  LEVEL_1_LEVELS: ["Undergraduate", "Graduate Certificates", "Diplomas", "Master's Programs", "Doctorate"],
  LEVEL_1_FACULTY: ["Faculty of Education (FEd)", "Information and Communication Studies (FICS)", "Management and Development Studies (FMDS)"],
  LEVEL_1_CALENDAR: ["Trimester Programs", "Semester Programs"],
  LEVEL_3_TRAPPER: ["Yes, back to Main Menu", "No, open an IT Helpdesk Ticket"],
};

export const useChatbot = (onTicketCreate: (ticket: Ticket) => void) => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Welcome to UPOU! 🎓 I am your Degree Programs Advisor. I can help you navigate our offerings. Please select how you would like to browse:\n* [Browse by Academic Level](#action)\n* [Browse by Faculty Division](#action)\n* [Browse by Academic Calendar](#action)", sender: "bot" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<string[]>(MENUS.LEVEL_0);

  // --- STATE ---
  const [ticketStep, setTicketStep] = useState<'idle' | 'subject' | 'description' | 'email'>('idle');
  const [draftTicket, setDraftTicket] = useState<{subject?: string; details?: string}>({});

  // ==========================================
  // PHASE 1: THE TICKETING FLOW
  // ==========================================
  const handleTicketing = (text: string, lower: string): boolean => {
    if (lower === "cancel ticket creation") {
      setTicketStep('idle');
      setDraftTicket({});
      setCurrentMenu(MENUS.LEVEL_0);
      setMessages(prev => [...prev, { text, sender: "user" }, { text: "Ticket creation cancelled. What would you like to explore?", sender: "bot" }]);
      return true; 
    }

    if (ticketStep !== 'idle') {
      setMessages((prev) => [...prev, { text, sender: "user" }]);
      
      if (ticketStep === 'subject') {
        setDraftTicket((prev) => ({ ...prev, subject: text }));
        setTicketStep('description');
        setTimeout(() => setMessages((prev) => [...prev, { text: "Please provide a detailed description of your issue:", sender: "bot" }]), 400);
      } 
      else if (ticketStep === 'description') {
        setDraftTicket((prev) => ({ ...prev, details: text }));
        setTicketStep('email');
        setTimeout(() => setMessages((prev) => [...prev, { text: "Finally, please provide your email address so our IT staff can contact you:", sender: "bot" }]), 400);
      } 
      else if (ticketStep === 'email') {
        const finalTicket: Ticket = {
          id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
          user: text,
          subject: draftTicket.subject || 'No Subject',
          status: 'New',
          date: new Date().toISOString().split('T')[0],
          details: draftTicket.details
        };
        
        onTicketCreate(finalTicket);
        setTicketStep('idle');
        setDraftTicket({});
        setCurrentMenu(MENUS.LEVEL_0);
        setTimeout(() => setMessages((prev) => [...prev, { text: "Thank you! Your ticket has been submitted successfully. We will reply and inform you soon about your case.", sender: "bot" }]), 400);
      }
      return true; 
    }
    return false; 
  };

  // ==========================================
  // PHASE 2: LOCAL UI ROUTING
  // ==========================================
  const handleLocalRouting = (text: string, lower: string): boolean => {
    // 1. Intercept Main Menu return
    if (lower.includes("back to main menu") || lower === "yes, back to main menu") {
      setMessages((prev) => [...prev, { text, sender: "user" }]);
      setCurrentMenu(MENUS.LEVEL_0);
      setTimeout(() => setMessages((prev) => [...prev, { text: "Returning to the main menu. What would you like to explore?", sender: "bot" }]), 500);
      return true; 
    }

    // 2. Intercept Helpdesk Trigger
    if (lower.includes("open an it helpdesk ticket") || lower.includes("open an it ticket")) {
      setMessages((prev) => [...prev, { text, sender: "user" }]);
      setTicketStep('subject');
      setCurrentMenu(["Cancel Ticket Creation"]); 
      setTimeout(() => setMessages((prev) => [...prev, { text: "I can help you create an IT Helpdesk ticket right here. First, what is the subject or short title of your issue?", sender: "bot" }]), 500);
      return true;
    }

    // 3. Update Sidebar Menus visually 
    if (lower === "browse by academic level") setCurrentMenu(MENUS.LEVEL_1_LEVELS);
    else if (lower === "browse by faculty division") setCurrentMenu(MENUS.LEVEL_1_FACULTY);
    else if (lower === "browse by academic calendar") setCurrentMenu(MENUS.LEVEL_1_CALENDAR);
    else if (
      MENUS.LEVEL_1_LEVELS.map(m => m.toLowerCase()).includes(lower) ||
      MENUS.LEVEL_1_FACULTY.map(m => m.toLowerCase()).includes(lower) ||
      MENUS.LEVEL_1_CALENDAR.map(m => m.toLowerCase()).includes(lower)
    ) {
      setCurrentMenu(MENUS.LEVEL_3_TRAPPER);
    }

    return false; 
  };

  // ==========================================
  // PHASE 3: THE MAIN EXECUTOR
  // ==========================================
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const lower = text.toLowerCase();

    if (handleTicketing(text, lower)) return;
    if (handleLocalRouting(text, lower)) return;

    setMessages((prev) => [...prev, { text, sender: "user" }]);
    setIsTyping(true);
    
    // SAFE AUDIO: Instantiated inside the click handler!
    const typingSound = new Audio('/typing-sound.mp3');
    typingSound.loop = true;
    try { await typingSound.play(); } catch (e) { console.warn("Audio requires click."); }

    // SAFE HISTORY: Markdown is preserved!
    const historyPayload = messages.slice(-4).map((msg) => ({
      role: msg.sender === "bot" ? "assistant" : "user",
      content: msg.text,
    }));

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history: historyPayload }),
      });

      const data: ChatResponse = await response.json();
      setMessages((prev) => [...prev, { text: data.answer, sender: "bot" }]);
      
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Connection error. Please try again.", sender: "bot" }]);
    } finally {
      setIsTyping(false);
      typingSound.pause();
      typingSound.currentTime = 0; 
    }
  };

  return { messages, isTyping, currentMenu, sendMessage };
};