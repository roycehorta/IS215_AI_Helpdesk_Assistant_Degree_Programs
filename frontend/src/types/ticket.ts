// frontend/src/types/ticket.ts

export interface Ticket {
  id: string;
  user: string;
  subject: string;
  status: 'New' | 'Answered' | 'Replied' | 'Resolved';
  date: string;
  details?: string;
}

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'New': return 'bg-red-100 text-red-800 border-red-200';
    case 'Answered': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Replied': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};