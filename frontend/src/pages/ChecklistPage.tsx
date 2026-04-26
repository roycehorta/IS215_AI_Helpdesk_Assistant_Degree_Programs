// frontend/src/pages/ChecklistPage.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";

const INITIAL_ITEMS = [
  { id: 1,  category: "System Architecture",      requirement: "Web application accessible via Public IP/DNS",                              points: 5,          status: false },
  { id: 2,  category: "System Architecture",      requirement: "Server configured correctly (Security Groups, environment variables)",      points: 5,          status: false },
  { id: 3,  category: "System Architecture",      requirement: "Lambda function acts as proper middleware",                                 points: 5,          status: true  },
  { id: 4,  category: "System Architecture",      requirement: "Lambda uses LabRole correctly (no hardcoded credentials)",                  points: 5,          status: false },
  { id: 5,  category: "System Architecture",      requirement: "Data organized logically in S3",                                            points: 5,          status: true  },
  { id: 6,  category: "System Architecture",      requirement: "Folder/naming structure makes sense for category",                         points: 5,          status: true  },
  { id: 7,  category: "Data Quality",             requirement: "At least 10-15 relevant articles from assigned UPOU category",             points: 15,         status: true  },
  { id: 8,  category: "Data Quality",             requirement: "All documents in machine-readable format (Markdown/CSV)",                   points: 5,          status: true  },
  { id: 9,  category: "Prompt Engineering",       requirement: "Bot identifies as a UPOU assistant",                                       points: 5,          status: true  },
  { id: 10, category: "Prompt Engineering",       requirement: "Bot refuses off-topic questions",                                          points: 5,          status: true  },
  { id: 11, category: "Prompt Engineering",       requirement: "Bot provides accurate info without hallucination",                         points: 10,         status: true  },
  { id: 12, category: "Prompt Engineering",       requirement: "Bot provides professional fallback message",                               points: 5,          status: true  },
  { id: 13, category: "Technical Implementation", requirement: "System does not crash on API timeout — has loading/error state",           points: 5,          status: true  },
  { id: 14, category: "Technical Implementation", requirement: "Code has proper documentation and architecture README",                    points: 5,          status: false },
  { id: 15, category: "Technical Implementation", requirement: "Clear README on how to deploy the system",                                 points: 5,          status: false },
  { id: 16, category: "Presentation & Demo",      requirement: "Chat interface is clean and usable",                                       points: 5,          status: true  },
  { id: 17, category: "Presentation & Demo",      requirement: "Interface shows chat history and separates User/Bot",                      points: 3,          status: true  },
  { id: 18, category: "Presentation & Demo",      requirement: "Demo includes stress-test questions (e.g. specific dates)",               points: 2,          status: false },
  { id: 19, category: "Bonus",                    requirement: "Amazon Textract for scanned documents",                                    points: 5,          status: false },
  { id: 20, category: "Bonus",                    requirement: "Ticketing integration (DynamoDB or SES)",                                  points: "included", status: true  },
];

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "System Architecture":      { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500"   },
  "Data Quality":             { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  dot: "bg-green-500"  },
  "Prompt Engineering":       { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
  "Technical Implementation": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  "Presentation & Demo":      { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500" },
  "Bonus":                    { bg: "bg-pink-50",   border: "border-pink-200",   text: "text-pink-700",   dot: "bg-pink-500"   },
};

export default function ChecklistPage() {
  const [items, setItems]         = useState(INITIAL_ITEMS);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [filter, setFilter]       = useState("All");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(import.meta.env.VITE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _route: "get-checklist" }),
        });
        const data = await response.json();
        if (data.statuses && Object.keys(data.statuses).length > 0) {
          setItems(INITIAL_ITEMS.map((item) => ({
            ...item,
            status: data.statuses[item.id] ?? item.status,
          })));
        }
      } catch {
        setError("Could not connect to database. Showing default values.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async (updated: typeof INITIAL_ITEMS, changedId?: number) => {
    setSaving(true);
    try {
      if (changedId !== undefined) {
        const item = updated.find((i) => i.id === changedId);
        if (item) {
          await fetch(import.meta.env.VITE_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _route: "save-checklist", itemId: item.id, status: item.status }),
          });
        }
      }
      setLastSaved(new Date().toLocaleTimeString());
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (id: number) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, status: !item.status } : item,
    );
    setItems(updated);
    save(updated, id);
    const item = updated.find((i) => i.id === id);
    if (item?.status) toast.success("Marked complete", { description: item.requirement });
    else toast.info("Unmarked", { description: item?.requirement });
  };

  const reset = async () => {
    setLoading(true);
    try {
      for (const item of INITIAL_ITEMS) {
        await fetch(import.meta.env.VITE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _route: "save-checklist", itemId: item.id, status: item.status }),
        });
      }
      setItems(INITIAL_ITEMS);
      setLastSaved(new Date().toLocaleTimeString());
      toast.success("Checklist reset to defaults");
    } catch {
      toast.error("Failed to reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(INITIAL_ITEMS.map((i) => i.category)))];
  const filtered   = filter === "All" ? items : items.filter((i) => i.category === filter);
  const totalPoints  = items.reduce((sum, i) => sum + (typeof i.points === "number" ? i.points : 0), 0);
  const earnedPoints = items.reduce((sum, i) => i.status && typeof i.points === "number" ? sum + i.points : sum, 0);
  const totalItems   = items.length;
  const doneItems    = items.filter((i) => i.status).length;
  const pct          = Math.round((doneItems / totalItems) * 100);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-[#7B1113] animate-spin" />
        <p className="text-sm text-gray-500">Loading checklist from database...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full">

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
          ⚠️ {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">IS 215 Project Checklist</h1>
          <p className="text-xs text-gray-500 mt-0.5">UPOU AI Helpdesk Assistant — 2nd Semester SY 2025-2026</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lastSaved && (
            <span className="text-[11px] text-gray-400">
              {saving ? "Saving..." : `Saved ${lastSaved}`}
            </span>
          )}
          <button
            onClick={reset}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Progress card */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 md:p-5 mb-6">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-3">
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">{doneItems}/{totalItems}</p>
              <p className="text-[11px] text-gray-500">Items done</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#7B1113]">{earnedPoints}/{totalPoints}</p>
              <p className="text-[11px] text-gray-500">Points earned</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${pct === 100 ? "text-green-600" : "text-gray-900"}`}>{pct}%</p>
              <p className="text-[11px] text-gray-500">Complete</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">{totalItems - doneItems} remaining</p>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #7B1113, #B91C1C)" }}
          />
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
              filter === cat
                ? "bg-[#7B1113] border-[#7B1113] text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table — scrollable on mobile */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-10">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-44">Category</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Requirement</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-14">Pts</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-16">Done</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => {
                const c = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES["Bonus"];
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${item.status ? "bg-green-50/40" : "bg-white"} hover:bg-gray-50/60`}
                  >
                    <td className="px-4 py-3 text-xs text-gray-400 font-medium">{item.id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md border ${c.bg} ${c.border} ${c.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                        {item.category}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm ${item.status ? "text-gray-400 line-through" : "text-gray-800"}`}>
                      {item.requirement}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${typeof item.points === "number" ? "text-[#7B1113]" : "text-gray-400"}`}>
                        {item.points}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggle(item.id)}
                        className={`w-7 h-7 rounded-lg border-2 inline-flex items-center justify-center transition-all ${
                          item.status
                            ? "bg-green-600 border-green-600"
                            : "bg-white border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {item.status && (
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending summary */}
      {items.filter((i) => !i.status).length > 0 ? (
        <div className="mt-5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-4">
          <p className="text-xs font-bold text-orange-700 mb-2">Still needed before submission:</p>
          <ul className="space-y-1.5 list-disc list-inside">
            {items.filter((i) => !i.status).map((i) => (
              <li key={i.id} className="text-xs text-orange-800">
                <span className="font-bold">#{i.id}</span> — {i.requirement}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-5 bg-green-50 border border-green-200 rounded-xl px-4 py-4 text-center">
          <p className="text-sm font-bold text-green-700">All items complete! Ready for submission. 🎉</p>
        </div>
      )}

    </div>
  );
}