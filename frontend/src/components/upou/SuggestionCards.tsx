// frontend/src/components/upou/SuggestionCards.tsx
import { Card } from "@/components/ui/card";
import { Building2, GraduationCap, Ticket } from "lucide-react";

const SUGGESTIONS = [
  {
    icon: GraduationCap,
    title: "Browse by Academic Level",
    description: "Undergraduate, Masters, Doctorate and more",
    prompt: "Browse by Academic Level",
  },
  {
    icon: Building2,
    title: "Browse by Faculty Division",
    description: "FED, FICS, or FMDS programs",
    prompt: "Browse by Faculty Division",
  },
 
  {
    icon: Ticket,
    title: "Open a Support Ticket",
    description: "Need help? Contact our helpdesk",
    prompt: "No, open an IT Helpdesk Ticket",
  },
];
export function SuggestionCards({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
      {SUGGESTIONS.map(({ icon: Icon, title, description, prompt }) => (
        <Card
          key={title}
          onClick={() => onSelect(prompt)}
          className="group cursor-pointer border-border/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
