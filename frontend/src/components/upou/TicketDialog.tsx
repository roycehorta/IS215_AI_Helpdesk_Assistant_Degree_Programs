// frontend/src/components/upou/TicketDialog.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  generateTicketReference,
  saveTicket,
  type ChatMessage,
} from "@/lib/chat-storage";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const ticketSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  studentId: z.string().trim().max(50).optional().or(z.literal("")),
  category: z.string().min(1, "Please select a category"),
  description: z
    .string()
    .trim()
    .min(5, "Please describe your concern (at least 5 characters)")
    .max(2000),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcript: ChatMessage[];
};

export function TicketDialog({ open, onOpenChange, transcript }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    studentId: "",
    category: "",
    description: "",
  });

  const reset = () =>
    setForm({
      name: "",
      email: "",
      studentId: "",
      category: "",
      description: "",
    });

  const handleSubmit = () => {
    console.log("Submit clicked, form:", form);
    const parsed = ticketSchema.safeParse(form);
    console.log("Parsed result:", parsed);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message ?? "Please check the form");
      return;
    }

    try {
      setSubmitting(true);
      const ref = generateTicketReference();
      saveTicket({
        id: crypto.randomUUID(),
        reference: ref,
        name: parsed.data.name,
        email: parsed.data.email,
        studentId: parsed.data.studentId || undefined,
        category: parsed.data.category,
        description: parsed.data.description,
        transcript,
        createdAt: Date.now(),
      });
      setReference(ref);
      reset();
      setSubmitting(false);
      setSubmitted(true); // ← move to very last, after everything else
    } catch (err) {
      console.error("Ticket error:", err);
      setSubmitting(false);
      toast.error("Could not save ticket. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert to Support Ticket</DialogTitle>
          <DialogDescription>
            Send your conversation to the UPOU helpdesk team for personal
            follow-up.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Ticket Submitted!
            </h3>
            <p className="text-sm text-gray-500">
              Your ticket has been created successfully.
              <br />
              We will contact you soon via email.
            </p>
            <p className="text-xs font-mono text-primary font-bold">
              {reference}
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                onOpenChange(false);
              }}
              className="mt-2"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-name">Full name *</Label>
              <Input
                id="t-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, studentId: e.target.value }))
                }
                placeholder="2024-12345"
                maxLength={50}
              />
            </div>

            <div className="space-y-1.5 ">
              <Label htmlFor="t-cat">Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger id="t-cat">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="enrollment">
                    Enrollment & Admission
                  </SelectItem>
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Tell the helpdesk what you need help with…"
                maxLength={2000}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Your chat transcript ({transcript.length} messages) will be
                attached automatically.
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
              <Button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting…" : "Submit Ticket"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
