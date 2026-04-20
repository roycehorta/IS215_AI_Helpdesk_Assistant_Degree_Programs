import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Mail, GraduationCap, IdCard, Calendar } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTracker } from "@/components/StatusTracker";
import { useTickets } from "@/store/ticketStore";
import { STATUS_ORDER, TicketStatus } from "@/data/tickets";
import { toast } from "sonner";

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTicket, updateStatus, advanceStatus } = useTickets();
  const ticket = id ? getTicket(id) : undefined;
  const [note, setNote] = useState("");
  const [draftStatus, setDraftStatus] = useState<TicketStatus | undefined>(ticket?.status);

  if (!ticket) return <Navigate to="/tickets" replace />;

  const currentIdx = STATUS_ORDER.indexOf(ticket.status);
  const canAdvance = currentIdx < STATUS_ORDER.length - 1;

  const handleAdvance = () => {
    advanceStatus(ticket.id);
    toast.success(`Advanced to ${STATUS_ORDER[currentIdx + 1]}`);
  };

  const handleApplyStatus = () => {
    if (!draftStatus || draftStatus === ticket.status) return;
    updateStatus(ticket.id, draftStatus, note.trim() || undefined);
    setNote("");
    toast.success(`Status updated to ${draftStatus}`);
  };

  return (
    <AdminLayout title={`Ticket ${ticket.id}`}>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/tickets")} className="-ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Button>
      </div>

      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/tickets" className="hover:text-foreground">Tickets</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{ticket.id}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6 shadow-card">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono text-xs font-semibold text-muted-foreground">{ticket.id}</div>
                <h2 className="mt-1 font-serif text-xl font-bold text-foreground">{ticket.subject}</h2>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Submitted on{" "}
                  {new Date(ticket.dateSubmitted).toLocaleString("en-PH", {
                    month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                  })}
                </div>
              </div>
              <StatusBadge status={ticket.status} />
            </div>

            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Concern
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{ticket.concern}</p>
          </Card>

          <Card className="p-6 shadow-card">
            <h3 className="mb-4 font-serif text-base font-bold text-foreground">Status Tracker</h3>
            <StatusTracker current={ticket.status} />

            <div className="mt-8 border-t border-border pt-5">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Timeline
              </h4>
              <ol className="space-y-3">
                {ticket.timeline.map((e, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{e.status}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(e.at).toLocaleString("en-PH", {
                            month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {e.note && <p className="text-xs text-muted-foreground">{e.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 shadow-card">
            <h3 className="mb-4 font-serif text-base font-bold text-foreground">Student Information</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <IdCard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">Name</dt>
                  <dd className="font-medium text-foreground">{ticket.studentName}</dd>
                  <dd className="text-xs text-muted-foreground">{ticket.studentNumber}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="truncate font-medium text-foreground">{ticket.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">Program</dt>
                  <dd className="font-medium text-foreground">{ticket.program}</dd>
                </div>
              </div>
            </dl>
          </Card>

          <Card className="p-6 shadow-card">
            <h3 className="mb-1 font-serif text-base font-bold text-foreground">Admin Actions</h3>
            <p className="mb-4 text-xs text-muted-foreground">Progress the ticket through the workflow.</p>

            <Button
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-95"
              onClick={handleAdvance}
              disabled={!canAdvance}
            >
              {canAdvance ? `Advance to ${STATUS_ORDER[currentIdx + 1]}` : "Ticket completed"}
            </Button>

            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or set manually
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-3">
              <Select value={draftStatus} onValueChange={(v) => setDraftStatus(v as TicketStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Optional internal note…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={handleApplyStatus}
                disabled={!draftStatus || draftStatus === ticket.status}
              >
                Apply status change
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TicketDetails;
