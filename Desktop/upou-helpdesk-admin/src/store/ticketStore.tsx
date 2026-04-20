import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { seedTickets, STATUS_ORDER, Ticket, TicketStatus } from "@/data/tickets";

interface TicketContextValue {
  tickets: Ticket[];
  getTicket: (id: string) => Ticket | undefined;
  updateStatus: (id: string, status: TicketStatus, note?: string) => void;
  advanceStatus: (id: string) => void;
}

const TicketContext = createContext<TicketContextValue | null>(null);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => seedTickets());

  const getTicket = useCallback((id: string) => tickets.find((t) => t.id === id), [tickets]);

  const updateStatus = useCallback((id: string, status: TicketStatus, note?: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === status) return t;
        const newEntry = { status, at: new Date().toISOString(), note };
        return { ...t, status, timeline: [...t.timeline, newEntry] };
      }),
    );
  }, []);

  const advanceStatus = useCallback((id: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const idx = STATUS_ORDER.indexOf(t.status);
        if (idx >= STATUS_ORDER.length - 1) return t;
        const next = STATUS_ORDER[idx + 1];
        const newEntry = { status: next, at: new Date().toISOString(), note: `Advanced to ${next}.` };
        return { ...t, status: next, timeline: [...t.timeline, newEntry] };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({ tickets, getTicket, updateStatus, advanceStatus }),
    [tickets, getTicket, updateStatus, advanceStatus],
  );

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
};

export const useTickets = () => {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used within TicketProvider");
  return ctx;
};
