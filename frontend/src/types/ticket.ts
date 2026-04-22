export interface Ticket {
  id: string;
  user: string;
  subject: string;
  status: 'New' | 'Answered';  // ← only 2
  date: string;
  details?: string;
}

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'New':      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Answered': return 'bg-green-100 text-green-700 border-green-200';
    default:         return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};