// frontend/src/components/admin/TicketModal.tsx
import { FC, useState } from "react";
import { Ticket, getStatusBadge } from "../../types/ticket";

interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
  onStatusChange: (newStatus: Ticket["status"]) => void;
  onSendReply: (replyText: string, newStatus: Ticket["status"]) => void;
}

const TicketModal: FC<TicketModalProps> = ({
  ticket,
  onClose,
  onSendReply,
}) => {
  const [replyText, setReplyText]   = useState("");
  const [localStatus, setLocalStatus] = useState<Ticket["status"]>(ticket.status); // ← local only
  const [sending, setSending]       = useState(false);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _route:      "send-reply",
          ticketId:    ticket.id,
          toEmail:     ticket.user,
          studentName: ticket.user.split("@")[0].replace(/[._]/g, " "),
          replyText,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to send");

      // ✅ Only update parent state AFTER successful send
      onSendReply(replyText, localStatus);

    } catch (err) {
      console.error("Send reply error:", err);
      alert("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800 capitalize">{ticket.subject}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Ticket ID: <span className="font-mono font-bold text-primary">{ticket.id}</span> · Opened: {ticket.date}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-2">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Meta */}
          <div className="flex flex-wrap gap-4 justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Reported By</p>
              <p className="text-sm font-medium text-primary">{ticket.user}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Category</p>
              <p className="text-sm font-medium text-gray-700 capitalize">{ticket.subject}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Current Status</p>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Mark as</p>
              <select
                value={localStatus}
                onChange={(e) => setLocalStatus(e.target.value as Ticket["status"])}
                className={`text-sm font-bold rounded-lg border outline-none cursor-pointer py-1.5 px-3 ${getStatusBadge(localStatus)}`}
              >
                <option value="New">New</option>
                <option value="Answered">Answered</option>
              </select>
            </div>
          </div>

          {/* Original concern */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">Original Inquiry</h4>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-800 leading-relaxed">
              {ticket.details || "No further details provided."}
            </div>
          </div>

          {/* Reply box */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">Admin Reply</h4>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your official response here..."
              className="w-full h-36 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none transition-all text-sm resize-none"
            />
          </div>

          {/* Signature */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600">Helpdesk Admin — UPOU Helpdesk Team</p>
            <p>🌐 <a href="https://upou.edu.ph" className="text-primary hover:underline">upou.edu.ph</a></p>
            <p>📧 <a href="mailto:info@upou.edu.ph" className="text-primary hover:underline">info@upou.edu.ph</a></p>
            <p>📘 <a href="https://facebook.com/upouofficial" className="text-primary hover:underline">facebook.com/upouofficial</a></p>
            <p className="text-gray-400 text-[10px] pt-1">University of the Philippines Open University · Los Baños, Laguna 4031</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!replyText.trim() || sending}
            className={`px-5 py-2 text-sm font-bold rounded-xl shadow-md transition-all ${
              replyText.trim() && !sending
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
            }`}
          >
            {sending ? "Sending..." : "Send Reply & Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;