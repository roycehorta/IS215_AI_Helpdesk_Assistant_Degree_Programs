// frontend\src\components\admin\TicketModal.tsx
// frontend/src/components/admin/TicketModal.tsx
import { FC, useState } from "react";
import { Ticket, getStatusBadge } from "../../types/ticket";

interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
  onStatusChange: (newStatus: Ticket["status"]) => void;
  onSendReply: (replyText: string) => void;
}

const TicketModal: FC<TicketModalProps> = ({
  ticket,
  onClose,
  onStatusChange,
  onSendReply,
}) => {
  const [replyText, setReplyText] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {ticket.subject}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Ticket ID: {ticket.id} | Opened: {ticket.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-2"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-wrap gap-4 justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Reported By
              </p>
              <p className="text-sm font-medium text-[#7b1113]">
                {ticket.user}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Current Status
              </p>
              <select
                value={ticket.status}
                onChange={(e) =>
                  onStatusChange(e.target.value as Ticket["status"])
                }
                className={`text-sm font-bold rounded-lg border outline-none cursor-pointer py-1.5 px-3 ${getStatusBadge(ticket.status)}`}
              >
                <option value="New">New</option>
                <option value="Answered">Answered</option>
                <option value="Replied">Replied</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">
              Original Inquiry:
            </h4>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-800 leading-relaxed shadow-sm">
              {ticket.details || "No further details provided."}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">
              Admin Reply (Sent via Email):
            </h4>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your official response here..."
              className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] outline-none transition-all text-sm resize-none shadow-inner"
            />
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
            onClick={() => onSendReply(replyText)}
            disabled={!replyText.trim()}
            className={`px-5 py-2 text-sm font-bold rounded-xl shadow-md transition-all ${
              replyText.trim()
                ? "bg-[#7b1113] text-white hover:bg-[#5a0d0e]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
            }`}
          >
            Send Reply & Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
