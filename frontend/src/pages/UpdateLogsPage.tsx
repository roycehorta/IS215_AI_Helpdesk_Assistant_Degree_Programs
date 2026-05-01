// frontend/src/pages/UpdateLogsPage.tsx
import { SidebarTrigger } from "@/components/ui/sidebar";

const UPDATES = [
  {
    version: "v1.7.0",
    date: "2026-04-29",
    items: [
      "Replaced AWS SES with Brevo transactional email",
      "3 email triggers: ticket confirmation, admin-created ticket, admin reply",
      "Full UPOU-branded HTML email template with maroon header and UP seal",
      "BrevoService.mjs — shared builder functions for header, footer, signature",
      "test-brevo.mjs — 3/3 email triggers tested",
      "TORUploader — restricted to JPG/PNG only (Textract does not support PDF)",
      "TORUploader — added sample TOR download link (Google Drive)",
      "TORUploader — added privacy notice: document read-only, deleted after analysis",
      "index.mjs — added ticket-confirmation and admin-ticket routes",
      "Removed SendReplyService.mjs and SESClient.mjs",
      "deploy.mjs updated — node_modules included in Lambda zip",
      "AboutPage — Brevo added to tech stack table",
      "AboutPage — email notification added as Step 7 in system pipeline",
      "AboutPage — Week 3 progress updated with latest changes",
    ],
  },
  {
    version: "v1.6.0",
    date: "2026-04-29",
    items: [
      "TORUploader — added sample TOR download link (Google Drive)",
      "TORUploader — added privacy notice: document read-only, deleted after analysis",
      "Repeat detection — frontend tracks last 10 questions per session",
      "Repeat detection — repeatCount sent to backend on every API call",
      "1st repeat: gentle recap + mandatory ticket link injected",
      "2nd+ repeat: humorous going-in-circles response + ticket link",
      "Post-processing: ticket link guaranteed for all repeat responses",
      "Trapper logic — skips trapper if bot already offered ticket in answer",
      "Trapper logic — fires trapper if isRelevant false and no ticket in answer",
      "Fixed acronym regex — WHAT no longer matches as program acronym",
      "Rule 22: Faculty browsing shows ALL levels including doctorate",
      "Rule 23: Tuition/credit transfer questions end with ticket suggestion",
      "Rule 24: Out-of-scope redirect includes ticket suggestion",
      "Rule 25: Real-time data questions redirect to UPOU website",
      "Rule 26: Repeat detection humorous deflection with ticket link",
      "System prompt updated to 26 strict rules",
      "test-repeat-detection.mjs — 7 test cases added",
      "test-decision-matrix.mjs — 15 test cases, token tracking per test",
      "Bot Reasoning section added to README",
    ],
  },
  {
    version: "v1.5.0",
    date: "2026-04-29",
    items: [
      "Added Update Log page to sidebar navigation",
      "Sidebar refactored to NAV_ITEMS array — add/remove items in one place",
      "Single program detail flow — ACRONYM-prefixed section action links",
      "Post-processing: navigation footer injected for all section responses",
      "Post-processing: MIS Elective Courses injected if missing from overview",
      "Post-processing: graceful fallback for elective sections with no data",
      "Fixed faculty names — full names in Browse by Faculty Division menu",
      "Rule 20: Admission requirements always link to upou.edu.ph/admissions/",
      "Rule 21: Never fabricate URLs — only use URLs from document",
      "append-urls.mjs script — appended official URLs to all 39 MD files",
      "fix-headings.mjs script — cleaned section headings across S3 files",
      "Added Major Courses to SECTION VIEW rule for MDC and similar programs",
      "test-single-program.mjs — 10/10 passing",
      "test-elective-courses.mjs — 7 test cases added",
      "test-url-validation.mjs — 7 test cases added",
      "404 Not Found page improved with fun message",
    ],
  },
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
      "TORUploader component with drag-drop, JPG/PNG validation",
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
          <h1 className="text-sm font-semibold leading-none text-foreground">
            Update Log
          </h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            IS 215 — 2nd Semester SY 2025-2026
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-8">
          {UPDATES.map((update) => (
            <div
              key={update.version}
              className="border border-border rounded-xl bg-card p-5 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {update.version}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {update.version === "v1.7.0"
                      ? "Brevo Email Integration & TOR Uploader Fix"
                      : update.version === "v1.6.0"
                        ? "Repeat Detection, Trapper Logic & TOR Privacy"
                        : update.version === "v1.5.0"
                          ? "URL Validation, Elective Courses & Test Suite"
                          : update.version === "v1.4.0"
                            ? "Single Program Flow & Faculty Fix"
                            : update.version === "v1.3.0"
                              ? "RAG Pipeline & Level Routing Fix"
                              : update.version === "v1.2.0"
                                ? "Textract Integration & Admin Dashboard"
                                : update.version === "v1.1.0"
                                  ? "Chat UI & Responsive Design"
                                  : "Initial Release"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {update.date}
                </span>
              </div>

              {/* Items */}
              <ul className="space-y-2">
                {update.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
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