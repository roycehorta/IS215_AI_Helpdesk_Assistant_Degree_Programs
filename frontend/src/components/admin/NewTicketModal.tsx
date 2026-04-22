// frontend/src/components/admin/NewTicketModal.tsx
import { FC, useState } from "react";
import { z } from "zod";
import { Ticket } from "../../types/ticket";

interface NewTicketModalProps {
  onClose: () => void;
  onAddTicket: (ticket: Ticket) => void;
}

const CATEGORIES = [
  "enrollment",
  "programs",
  "tuition",
  "technical",
  "academic",
  "other",
] as const;

// ── Zod schema ──────────────────────────────────────────────────────────────
const newTicketSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long.")
    .regex(
      /^[a-zA-Z\s'\-\.]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes.",
    ),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .max(254, "Email is too long."),
  subject: z.enum(CATEGORIES, {
    error: "Please select a valid category.",
  }),
  details: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(2000, "Description must be under 2000 characters."),
});

type NewTicketFields = z.infer<typeof newTicketSchema>;
type FieldErrors = Partial<Record<keyof NewTicketFields, string>>;

// ── Helper: field input classes ─────────────────────────────────────────────
const inputClass = (hasError: boolean) =>
  `w-full p-3 border rounded-xl focus:ring-2 outline-none transition-all text-sm ${
    hasError
      ? "border-red-400 focus:ring-red-200 bg-red-50"
      : "border-gray-300 focus:ring-primary/30"
  }`;

const NewTicketModal: FC<NewTicketModalProps> = ({ onClose, onAddTicket }) => {
  const [fields, setFields] = useState<NewTicketFields>({
    name: "",
    email: "",
    subject: "programs",
    details: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  const setField = <K extends keyof NewTicketFields>(
    key: K,
    value: NewTicketFields[K],
  ) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Clear the error for this field on change
    if (fieldErrors[key])
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    // ── Client-side validation ──────────────────────────
    const result = newTicketSchema.safeParse(fields);
    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.issues.forEach((err) => {
        const key = err.path[0] as keyof NewTicketFields;
        if (!errors[key]) errors[key] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      // ── Step 1: Create ticket in DynamoDB ──────────────
      const ticketResponse = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _route: "ticket",
          name: fields.name.trim(),
          email: fields.email,
          studentId: "",
          category: fields.subject,
          description: fields.details,
          transcript: [],
        }),
      });

      const data = await ticketResponse.json();
      if (!ticketResponse.ok)
        throw new Error(data.error ?? "Failed to create ticket");

      // ── Step 2: Send confirmation email via SES ────────
      await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _route: "send-reply",
          ticketId: data.ticketId,
          toEmail: fields.email,
          studentName: fields.name.trim(),
          replyText: `Thank you for contacting the UPOU Helpdesk. Your ticket has been received and our team will respond shortly.\n\nTicket Reference: ${data.ticketId}\nCategory: ${fields.subject}\n\nDetails submitted:\n${fields.details}`,
        }),
      });

      // ── Step 3: Update local state ─────────────────────
      const newTicket: Ticket = {
        id: data.ticketId,
        user: fields.email,
        name: fields.name.trim(), // add this
        subject: fields.subject,
        status: "New",
        date: new Date().toISOString().split("T")[0],
        details: fields.details,
      };

      onAddTicket(newTicket);
      setCreatedTicket(newTicket);
    } catch (err: any) {
      setServerError(
        err.message ?? "Failed to create ticket. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Success screen ─────────────────────────────────────
  if (createdTicket) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center overflow-hidden">
          <div className="w-full bg-green-50 border-b border-green-100 flex flex-col items-center py-8 px-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Ticket Created!</h3>
            <p className="text-sm text-gray-500 mt-1 text-center">
              The ticket has been submitted and a confirmation email was sent.
            </p>
          </div>

          <div className="w-full p-6 space-y-3">
            <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100 text-sm">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-gray-500 font-medium">Ticket ID</span>
                <span className="font-mono font-bold text-primary">
                  {createdTicket.id}
                </span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-gray-500 font-medium">Student Name</span>
                <span className="text-gray-800 font-medium">{fields.name}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="text-gray-800 font-medium">
                  {createdTicket.user}
                </span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-gray-500 font-medium">Category</span>
                <span className="text-gray-800 font-medium capitalize">
                  {createdTicket.subject}
                </span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {createdTicket.status}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-xl shadow-md hover:bg-primary/90 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Add Manual Ticket
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Create a ticket on behalf of a student.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#7b1113] text-3xl font-light leading-none p-2 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5">
          {serverError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {serverError}
            </div>
          )}

          {/* Name + Email side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Student Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={fields.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                className={inputClass(!!fieldErrors.name)}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Student Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={fields.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="e.g. student@upou.edu.ph"
                className={inputClass(!!fieldErrors.email)}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={fields.subject}
              onChange={(e) =>
                setField(
                  "subject",
                  e.target.value as NewTicketFields["subject"],
                )
              }
              className={inputClass(!!fieldErrors.subject) + " capitalize"}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
            {fieldErrors.subject && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.subject}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Detailed Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={fields.details}
              onChange={(e) => setField("details", e.target.value)}
              placeholder="Type the full issue details here..."
              className={
                inputClass(!!fieldErrors.details) + " h-32 resize-none"
              }
            />
            <div className="flex justify-between items-start mt-1">
              {fieldErrors.details ? (
                <p className="text-xs text-red-500">{fieldErrors.details}</p>
              ) : (
                <span />
              )}
              <p
                className={`text-xs ml-auto ${fields.details.length > 1800 ? "text-red-400" : "text-gray-400"}`}
              >
                {fields.details.length}/2000
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl shadow-md hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create Manual Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTicketModal;
