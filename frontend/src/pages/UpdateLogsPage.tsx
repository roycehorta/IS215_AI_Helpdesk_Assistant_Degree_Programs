import { SidebarTrigger } from "@/components/ui/sidebar";

const UPDATES = [
  {
    version: "v1.4.0",
    date: "2026-04-29",
    items: [
      "Single program detail flow with ACRONYM-prefixed action links",
      "Section view routing — clicking MIS Core Courses shows only that section",
      "Back navigation [ACRONYM Overview] after every section response",
      "Post-processing fix — injects navigation footer for all section responses",
      "Fixed isRelevant: undefined bug — added ?? true fallback",
      "Fixed faculty names — full names in Browse by Faculty Division",
      "Admission requirements always link to https://www.upou.edu.ph/admissions/",
      "Removed overview from broadTerms to fix MIS Overview routing",
      "Added scripts/deploy.mjs — timestamped backup zips",
      "Added package.json scripts for all test runners",
    ],
  },
  {
    version: "v1.3.0",
    date: "2026-04-28",
    items: [
      "Bot messages contribute empty string to history payload",
      "Fixed chat history polluting S3 routing between levels",
      "All 5 menu levels return correct program counts",
      "Fixed diplomas/doctorates keyword detection",
      "Rule 19 added: Never mix program levels in a single response",
      "test-with-history.mjs — 5/5 passing",
      "test-program-levels.mjs — 7/7 passing",
    ],
  },
  {
    version: "v1.2.0",
    date: "2026-04-23",
    items: [
      "Textract integration — TOR/Diploma upload and analysis (Bonus Feature)",
      "TORUploader component with drag-drop, JPG/PNG/PDF validation",
      "S3 temp/ prefix for Textract uploads — auto-deleted after use",
      "Admin Dashboard — collapsible sidebar, mobile drawer",
      "TicketsView — paginated table with search, filter, sort",
      "Ticket ID format TX-A001 with atomic DynamoDB counter",
      "SES email reply wrapped in try-catch — graceful fallback in Learner Lab",
      "test-s3-routing.mjs — 8/8 passing",
    ],
  },
  {
    version: "v1.1.0",
    date: "2026-04-22",
    items: [
      "Typing animation — character-by-character with animatedCache",
      "Typing sound — AudioContext oscillator",
      "Trapper system — fires AFTER animation completes via onAnimationComplete",
      "TicketDialog — initialConcern pre-fills description",
      "Zod v4 migration",
      "AboutPage mobile drawer sidebar",
      "ChecklistPage — overflow-x-auto responsive table",
    ],
  },
  {
    version: "v1.0.0",
    date: "2026-04-21",
    items: [
      "Initial release — RAG pipeline with OpenAI GPT-4o mini",
      "Lambda handler with 6 routes",
      "S3 knowledge base — 39 programs across FICS, FED, FMDS",
      "DynamoDB tickets table",
      "React 18 frontend with shadcn/ui and Tailwind CSS",
      "Chat history persistence via localStorage",
      "Admin dashboard with live DynamoDB ticket fetching",
      "IS 215 grading checklist with DynamoDB sync",
      "EC2 deployment with API Gateway",
    ],
  },
];

const UpdateLogPage = () => {
  return (
    <div className="flex flex-1 flex-col h-full">
      <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4">
        <SidebarTrigger className="text-foreground" />
        <div>
          <h1 className="text-sm font-semibold leading-none text-foreground">Update Log</h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">IS 215 — 2nd Semester SY 2025-2026</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-8">
          {UPDATES.map((update) => (
            <div key={update.version} className="border border-border rounded-xl bg-card p-5 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {update.version}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {update.version === "v1.4.0" ? "Single Program Flow & Faculty Fix" :
                     update.version === "v1.3.0" ? "RAG Pipeline & Level Routing Fix" :
                     update.version === "v1.2.0" ? "Textract Integration & Admin Dashboard" :
                     update.version === "v1.1.0" ? "Chat UI & Responsive Design" :
                     "Initial Release"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{update.date}</span>
              </div>

              {/* Items */}
              <ul className="space-y-2">
                {update.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UpdateLogPage;