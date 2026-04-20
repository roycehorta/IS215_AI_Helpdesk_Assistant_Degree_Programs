import { Check } from "lucide-react";
import { STATUS_ORDER, TicketStatus } from "@/data/tickets";
import { cn } from "@/lib/utils";

export const StatusTracker = ({ current }: { current: TicketStatus }) => {
  const currentIdx = STATUS_ORDER.indexOf(current);

  return (
    <div className="w-full">
      <div className="flex items-center">
        {STATUS_ORDER.map((s, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                    active && "ring-4 ring-primary/15",
                  )}
                >
                  {done && i < currentIdx ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "mt-2 whitespace-nowrap text-xs font-medium",
                    done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s}
                </span>
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 transition-colors",
                    i < currentIdx ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
