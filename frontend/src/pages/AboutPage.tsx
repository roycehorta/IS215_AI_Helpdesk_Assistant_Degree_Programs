// frontend/src/pages/AboutPage.tsx
import {
  BookOpen,
  ChevronRight,
  Clock,
  GitBranch,
  Layers,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const TEAM = [
  { name: "Aquino, Jade",          role: "Backend, Lambda, AWS Integration"         },
  { name: "Ayes, Mari Cris",       role: "Frontend, UI Components"                  },
  { name: "Adel, Deo Rico",        role: "Data Scraping, S3 Knowledge Base"         },
  { name: "Bautista, Katrina Mae", role: "S3 Setup, Data Preparation"               },
  { name: "Evidor, Darvin",        role: "EC2, Deployment"                          },
  { name: "Hortaleza, Royce",      role: "Frontend, Chat UI"                        },
  { name: "Joaquin, John Rainer",  role: "EC2, Lambda Triggers"                     },
  { name: "Llenado, Daryljade",    role: "Backend, RAG Pipeline, Ticketing"         },
  { name: "Molina, Yolanda",       role: "Documentation, Testing"                   },
];

const TECH_STACK = [
  { layer: "Frontend",  tech: "React 18, TypeScript, Vite, Tailwind CSS"              },
  { layer: "Backend",   tech: "Node.js ESM, AWS Lambda"                               },
  { layer: "AI",        tech: "OpenAI GPT-4o mini"                                    },
  { layer: "Storage",   tech: "Amazon S3 — knowledge base & diploma uploads"          },
  { layer: "Database",  tech: "Amazon DynamoDB — support tickets"                     },
  { layer: "OCR",       tech: "Amazon Textract — diploma text extraction"             },
  { layer: "API",       tech: "Amazon API Gateway (HTTP API)"                         },
];

const UPOU_DOMAINS = [
  { name: "Admission",                     desc: "Requirements, deadlines, and application processes.",                             active: false },
  { name: "Registration and Enrollment",   desc: "AIMS-Student Portal, payment of fees, and matriculation.",                       active: false },
  { name: "Degree Programs",               desc: "Course catalogs, Faculty of Study details, and program offerings.",              active: true  },
  { name: "About UPOU",                    desc: "History, mission, vision, and the distance education model.",                    active: false },
  { name: "Academic Policies",             desc: "Grading systems, honors, maximum residency, and transfer credits.",              active: false },
  { name: "UPOU MOOCs and MODeL",          desc: "Free online courses and technical support for the MODeL platform.",             active: false },
  { name: "Student Support Services",      desc: "Counseling, library services, and student organizations.",                      active: false },
  { name: "UPOU Research and Public Service", desc: "Information on research centers and community extension.",                   active: false },
  { name: "Academic Procedures",           desc: "ID application, change of matriculation, and graduation application.",          active: false },
];

const PROGRESS = [
  {
    week: "Week 1", dates: "April 6–13, 2026",
    title: "Requirements Analysis, Planning and Design",
    items: [
      "Kickstart project planning and stand-up meetings",
      "Set up individual Git accounts and repository",
      "Discussed Git workflow — main, develop, feature branches",
      "Assigned tasks: data scraping, S3, EC2, Lambda, UI",
      "Data scraping complete — markdown files generated",
      "S3 bucket folder structure finalized",
      "POC for RAG chatbot started by Daryljade",
      "POC for chat UI started by Royce and Daryljade",
      "Lambda trigger scenarios and workflow outlined",
    ],
  },
  {
    week: "Week 2", dates: "April 13–20, 2026",
    title: "Requirements Implementation",
    items: [
      "S3 bucket configured with knowledge base files uploaded",
      "Lambda handler built with full RAG pipeline",
      "OpenAI system prompt engineered for UPOU domain",
      "Local testers created for pipeline and connections",
      "EC2 instance configured with security groups",
      "Frontend chat UI developed with chat history",
      "DynamoDB ticket table created and wired to Lambda",
      "Admin dashboard built with ticket management",
    ],
  },
  {
    week: "Week 3", dates: "April 20–27, 2026",
    title: "Integration and Testing",
    items: [
      "Frontend connected to Lambda via API Gateway",
      "Ticket submission flow tested end-to-end",
      "Admin dashboard fetching tickets live from DynamoDB",
      "README and architecture documentation written",
      "Stress-test questions prepared for demo video",
      "Textract bonus feature planned for diploma upload",
    ],
  },
];

const SIDEBAR_ITEMS = [
  { id: "overview",  label: "Overview",            icon: BookOpen   },
  { id: "team",      label: "Team Members",         icon: Users      },
  { id: "stack",     label: "Tech Stack",           icon: Layers     },
  { id: "pipeline",  label: "System Pipeline",      icon: GitBranch  },
  { id: "domains",   label: "UPOU Domain Coverage", icon: BookOpen   },
  { id: "progress",  label: "Progress Report",      icon: Clock      },
];

export default function AboutPage() {
  const [active, setActive]           = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollTo = (id: string) => {
    setActive(id);
    setSidebarOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const SidebarNav = () => (
    <nav className="p-2">
      {SIDEBAR_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => scrollTo(item.id)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
            active === item.id
              ? "bg-[#7b1113] text-white font-medium"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <item.icon className="h-3.5 w-3.5 shrink-0" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex h-full overflow-hidden relative">

      {/* ── Mobile sidebar drawer overlay ─────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile drawer ──────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 h-full z-50 w-56 bg-gray-50 border-r border-gray-100 flex flex-col transform transition-transform duration-200 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Wiki</p>
            <p className="text-sm font-semibold text-gray-800">IS 215 Project</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <SidebarNav />
        </div>
      </div>

      {/* ── Desktop sidebar ────────────────────────────────── */}
      <aside className="hidden md:flex md:flex-col w-52 shrink-0 border-r border-gray-100 bg-gray-50 overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Wiki</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">IS 215 Project</p>
        </div>
        <SidebarNav />
      </aside>

      {/* ── Main content ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Mobile top bar with hamburger */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 md:hidden sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-gray-800">IS 215 Project — Wiki</span>
        </div>

        <div className="p-4 md:p-8 space-y-12">

          {/* Overview */}
          <section id="overview">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Overview</h2>
            <p className="text-xs text-gray-400 mb-4">IS 215 Project | 2nd Semester SY 2025-2026</p>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              An AI-powered helpdesk chatbot for UP Open University that answers questions about UPOU Degree Programs.
              It uses a RAG (Retrieval-Augmented Generation) pipeline — when a user asks a question, the system fetches
              relevant documents from S3 and sends them to OpenAI to generate an accurate, context-aware answer.
              If the bot cannot answer, it automatically creates a support ticket in DynamoDB.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Knowledge Base", value: "S3 Markdown Files" },
                { label: "AI Model",       value: "GPT-4o mini"       },
                { label: "Domain",         value: "Degree Programs"   },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section id="team">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Team Members</h2>
            <div className="grid grid-cols-1 gap-2">
              {TEAM.map((member, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors gap-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#7b1113] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {member.name.split(",")[0][0]}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-11 sm:ml-0">{member.role}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Tech Stack */}
          <section id="stack">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tech Stack</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm min-w-[360px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Layer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Technology</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {TECH_STACK.map((row, i) => (
                    <tr key={i} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#7b1113]">{row.layer}</td>
                      <td className="px-4 py-3 text-gray-700">{row.tech}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pipeline */}
          <section id="pipeline">
            <h2 className="text-xl font-bold text-gray-900 mb-2">System Pipeline</h2>
            <p className="text-sm text-gray-500 mb-5">Each user question goes through this pipeline before an answer is returned.</p>
            <div className="flex flex-col gap-2">
              {[
                { step: "1", label: "Get User Question",    desc: "Extract question and chat history from the request"              },
                { step: "2", label: "Merge Memory",         desc: "Combine last 6 messages with current question for context"       },
                { step: "3", label: "Extract Keywords",     desc: "Remove stop words and identify faculty/level keywords"           },
                { step: "4", label: "Fetch S3 Context",     desc: "Retrieve matching .md documents from S3 knowledge base"         },
                { step: "5", label: "Generate Answer",      desc: "Send documents + question to OpenAI GPT-4o mini"                },
                { step: "6", label: "Return / Auto-Ticket", desc: "Return answer — if unanswerable, suggest a support ticket"      },
              ].map((s, i, arr) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-[#7b1113] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {s.step}
                    </div>
                    {i < arr.length - 1 && <div className="w-0.5 h-4 bg-gray-200 mt-1" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* UPOU Domain Coverage */}
          <section id="domains">
            <h2 className="text-xl font-bold text-gray-900 mb-1">UPOU Domain Coverage</h2>
            <p className="text-xs text-gray-400 mb-4">Our group is assigned to the highlighted domain.</p>
            <div className="flex flex-col gap-2">
              {UPOU_DOMAINS.map((domain, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    domain.active
                      ? "bg-[#7b1113] border-[#7b1113] text-white"
                      : "bg-white border-gray-100 text-gray-700 hover:border-gray-200"
                  }`}
                >
                  <ChevronRight className={`h-4 w-4 mt-0.5 shrink-0 ${domain.active ? "text-white" : "text-gray-300"}`} />
                  <div>
                    <p className={`text-sm font-semibold ${domain.active ? "text-white" : "text-gray-900"}`}>
                      {domain.name}
                      {domain.active && (
                        <span className="ml-2 text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">
                          Our Group
                        </span>
                      )}
                    </p>
                    <p className={`text-xs mt-0.5 ${domain.active ? "text-white/80" : "text-gray-500"}`}>
                      {domain.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Progress Report */}
          <section id="progress">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Progress Report</h2>
            <div className="flex flex-col gap-6">
              {PROGRESS.map((week, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 bg-gray-50 border-b border-gray-100 gap-1">
                    <div>
                      <span className="text-xs font-bold text-[#7b1113] uppercase tracking-wide">{week.week}</span>
                      <h3 className="text-sm font-semibold text-gray-900 mt-0.5">{week.title}</h3>
                    </div>
                    <span className="text-xs text-gray-400">{week.dates}</span>
                  </div>
                  <ul className="p-5 space-y-2">
                    {week.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#7b1113] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}