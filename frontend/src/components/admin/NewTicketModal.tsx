// frontend/src/components/admin/NewTicketModal.tsx
import { FC, useState } from 'react';
import { Ticket } from '../../types/ticket';

interface NewTicketModalProps {
  onClose: () => void;
  onAddTicket: (ticket: Ticket) => void;
}

const NewTicketModal: FC<NewTicketModalProps> = ({ onClose, onAddTicket }) => {
  const [user, setUser] = useState('');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !subject.trim()) return;

    // Generate a random ID and today's date
    const newTicket: Ticket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`, // e.g. TKT-4592
      user,
      subject,
      status: 'New',
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      details
    };

    onAddTicket(newTicket);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Add Manual Ticket</h3>
            <p className="text-sm text-gray-500 mt-1">Create a ticket on behalf of a student.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#7b1113] text-3xl font-light leading-none p-2 transition-colors">&times;</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Student Email</label>
            <input 
              type="email" 
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="e.g. student@upou.edu.ph"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] outline-none transition-all"
              required 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Ticket Subject</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] outline-none transition-all"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Detailed Description</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Type the full issue details here..."
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] outline-none transition-all text-sm resize-none shadow-inner"
              required
            />
          </div>

          {/* Footer (Inside Form to trigger submit) */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-sm font-bold bg-[#7b1113] text-white rounded-xl shadow-md hover:bg-[#5a0d0e] transition-all">
              Create Manual Ticket
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default NewTicketModal;