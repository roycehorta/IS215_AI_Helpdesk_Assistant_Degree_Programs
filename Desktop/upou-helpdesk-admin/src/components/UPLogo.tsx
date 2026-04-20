import { cn } from "@/lib/utils";

/** Stylized UP seal-inspired mark. Not an official logo. */
export const UPLogo = ({ className, showText = true }: { className?: string; showText?: boolean }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elegant">
      <div className="absolute inset-1 rounded-full border-2 border-primary-foreground/40" />
      <span className="relative font-serif text-lg font-bold tracking-tight">UP</span>
    </div>
    {showText && (
      <div className="flex flex-col leading-tight">
        <span className="font-serif text-base font-bold text-foreground">UPOU Helpdesk</span>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Admin Portal</span>
      </div>
    )}
  </div>
);
