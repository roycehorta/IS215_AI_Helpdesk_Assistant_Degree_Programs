import { cn } from "@/lib/utils";
import { TicketStatus } from "@/data/tickets";

const styles: Record<TicketStatus, string> = {
  Submitted: "bg-muted text-muted-foreground border-border",
  "In Process": "bg-info/10 text-info border-info/30",
  "In Progress": "bg-warning/15 text-warning-foreground border-warning/40",
  Completed: "bg-success/15 text-success border-success/30",
};

export const StatusBadge = ({ status, className }: { status: TicketStatus; className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
      styles[status],
      className,
    )}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>
);
