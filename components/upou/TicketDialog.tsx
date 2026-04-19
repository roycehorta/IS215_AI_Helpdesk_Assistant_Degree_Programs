import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  generateTicketReference,
  saveTicket,
  type ChatMessage,
} from "@/lib/chat-storage";

const ticketSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  studentId: z.string().trim().max(50).optional().or(z.literal("")),
  category: z.string().min(1, "Please select a category"),
  description: z
    .string()
    .trim()
    .min(10, "Please describe your concern (at least 10 characters)")
    .max(2000),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcript: ChatMessage[];
};

export function TicketDialog({ open, onOpenChange, transcript }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentId: "",
    category: "",
    description: "",
  });

  const reset = () =>
    setForm({ name: "", email: "", studentId: "", category: "", description: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ticketSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message ?? "Please check the form");
      return;
    }

    setSubmitting(true);
    try {
      const reference = generateTicketReference();
      saveTicket({
        id: crypto.randomUUID(),
        reference,
        name: parsed.data.name,
        email: parsed.data.email,
        studentId: parsed.data.studentId || undefined,
        category: parsed.data.category,
        description: parsed.data.description,
        transcript,
        createdAt: Date.now(),
      });
      toast.success("Ticket submitted!", {
        description: `Reference: ${reference}. The UPOU helpdesk will reach out via email.`,
      });
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Could not save ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert to Support Ticket</DialogTitle>
          <DialogDescription>
            Send your conversation to the UPOU helpdesk team for personal follow-up.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="t-name">Full name *</Label>
            <Input
              id="t-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Juan Dela Cruz"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-email">Email *</Label>
            <Input
              id="t-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              maxLength={255}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-sid">Student ID (optional)</Label>
            <Input
              id="t-sid"
              value={form.studentId}
              onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
              placeholder="2024-12345"
              maxLength={50}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-cat">Category *</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger id="t-cat">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enrollment">Enrollment & Admission</SelectItem>
                <SelectItem value="programs">Degree Programs</SelectItem>
                <SelectItem value="tuition">Tuition & Fees</SelectItem>
                <SelectItem value="technical">Technical Support</SelectItem>
                <SelectItem value="academic">Academic Concern</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-desc">Describe your concern *</Label>
            <Textarea
              id="t-desc"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Tell the helpdesk what you need help with…"
              maxLength={2000}
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Your chat transcript ({transcript.length} messages) will be attached automatically.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
