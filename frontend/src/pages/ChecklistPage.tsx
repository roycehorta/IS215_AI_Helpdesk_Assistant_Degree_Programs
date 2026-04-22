// frontend/src/pages/ChecklistPage.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    storage: {
      get: (key: string) => Promise<{ value: string } | null>;
      set: (key: string, value: string) => Promise<void>;
    };
  }
}

const INITIAL_ITEMS = [
  {
    id: 1,
    category: "System Architecture",
    requirement: "Web application accessible via Public IP/DNS",
    points: 5,
    status: false,
  },
  {
    id: 2,
    category: "System Architecture",
    requirement:
      "Server configured correctly (Security Groups, environment variables)",
    points: 5,
    status: false,
  },
  {
    id: 3,
    category: "System Architecture",
    requirement: "Lambda function acts as proper middleware",
    points: 5,
    status: true,
  },
  {
    id: 4,
    category: "System Architecture",
    requirement: "Lambda uses LabRole correctly (no hardcoded credentials)",
    points: 5,
    status: false,
  },
  {
    id: 5,
    category: "System Architecture",
    requirement: "Data organized logically in S3",
    points: 5,
    status: true,
  },
  {
    id: 6,
    category: "System Architecture",
    requirement: "Folder/naming structure makes sense for category",
    points: 5,
    status: true,
  },
  {
    id: 7,
    category: "Data Quality",
    requirement: "At least 10-15 relevant articles from assigned UPOU category",
    points: 15,
    status: true,
  },
  {
    id: 8,
    category: "Data Quality",
    requirement: "All documents in machine-readable format (Markdown/CSV)",
    points: 5,
    status: true,
  },
  {
    id: 9,
    category: "Prompt Engineering",
    requirement: "Bot identifies as a UPOU assistant",
    points: 5,
    status: true,
  },
  {
    id: 10,
    category: "Prompt Engineering",
    requirement: "Bot refuses off-topic questions",
    points: 5,
    status: true,
  },
  {
    id: 11,
    category: "Prompt Engineering",
    requirement: "Bot provides accurate info without hallucination",
    points: 10,
    status: true,
  },
  {
    id: 12,
    category: "Prompt Engineering",
    requirement: "Bot provides professional fallback message",
    points: 5,
    status: true,
  },
  {
    id: 13,
    category: "Technical Implementation",
    requirement:
      "System does not crash on API timeout — has loading/error state",
    points: 5,
    status: true,
  },
  {
    id: 14,
    category: "Technical Implementation",
    requirement: "Code has proper documentation and architecture README",
    points: 5,
    status: false,
  },
  {
    id: 15,
    category: "Technical Implementation",
    requirement: "Clear README on how to deploy the system",
    points: 5,
    status: false,
  },
  {
    id: 16,
    category: "Presentation & Demo",
    requirement: "Chat interface is clean and usable",
    points: 5,
    status: true,
  },
  {
    id: 17,
    category: "Presentation & Demo",
    requirement: "Interface shows chat history and separates User/Bot",
    points: 3,
    status: true,
  },
  {
    id: 18,
    category: "Presentation & Demo",
    requirement: "Demo includes stress-test questions (e.g. specific dates)",
    points: 2,
    status: false,
  },
  {
    id: 19,
    category: "Bonus",
    requirement: "Amazon Textract for scanned documents",
    points: 5,
    status: false,
  },
  {
    id: 20,
    category: "Bonus",
    requirement: "Ticketing integration (DynamoDB or SES)",
    points: "included",
    status: true,
  },
];

const CATEGORY_COLORS: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  "System Architecture": {
    bg: "#EFF6FF",
    border: "#BFDBFE",
    text: "#1D4ED8",
    dot: "#3B82F6",
  },
  "Data Quality": {
    bg: "#F0FDF4",
    border: "#BBF7D0",
    text: "#15803D",
    dot: "#22C55E",
  },
  "Prompt Engineering": {
    bg: "#FFF7ED",
    border: "#FED7AA",
    text: "#C2410C",
    dot: "#F97316",
  },
  "Technical Implementation": {
    bg: "#FAF5FF",
    border: "#E9D5FF",
    text: "#7E22CE",
    dot: "#A855F7",
  },
  "Presentation & Demo": {
    bg: "#FFFBEB",
    border: "#FDE68A",
    text: "#B45309",
    dot: "#F59E0B",
  },
  Bonus: { bg: "#FDF2F8", border: "#F5D0FE", text: "#86198F", dot: "#D946EF" },
};

export default function ChecklistPage() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [loading, setLoading] = useState(true); // ← add this
  const [error, setError] = useState<string | null>(null); // ← add this
  const [filter, setFilter] = useState("All");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Load saved statuses on mount
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
          setItems(
            INITIAL_ITEMS.map((item) => ({
              ...item,
              status: data.statuses[item.id] ?? item.status,
            })),
          );
        }
      } catch {
        setError("Could not connect to database. Showing default values.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Save function that can handle both full and partial updates
  const save = async (updated: typeof INITIAL_ITEMS, changedId?: number) => {
    setSaving(true);
    try {
      if (changedId !== undefined) {
        const item = updated.find((i) => i.id === changedId);
        if (item) {
          await fetch(import.meta.env.VITE_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              _route: "save-checklist",
              itemId: item.id,
              status: item.status,
            }),
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

  // Toggle item status
  const toggle = (id: number) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, status: !item.status } : item,
    );
    setItems(updated);
    save(updated, id); // ← pass id

    const item = updated.find((i) => i.id === id);
    if (item?.status) {
      toast.success("Marked complete", { description: item.requirement });
    } else {
      toast.info("Unmarked", { description: item?.requirement });
    }
  };

  // Reset checklist
  const reset = async () => {
    setLoading(true);
    try {
      for (const item of INITIAL_ITEMS) {
        await fetch(import.meta.env.VITE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _route: "save-checklist",
            itemId: item.id,
            status: item.status,
          }),
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

  // Get unique categories for filter buttons
  const categories = [
    "All",
    ...Array.from(new Set(INITIAL_ITEMS.map((i) => i.category))),
  ];

  // Filter items based on selected category
  const filtered =
    filter === "All" ? items : items.filter((i) => i.category === filter);

  // Calculate progress
  const totalPoints = items.reduce(
    (sum, i) => sum + (typeof i.points === "number" ? i.points : 0),
    0,
  );
  // Earned points only count for completed items
  const earnedPoints = items.reduce(
    (sum, i) =>
      i.status && typeof i.points === "number" ? sum + i.points : sum,
    0,
  );
  const totalItems = items.length;
  const doneItems = items.filter((i) => i.status).length;
  const pct = Math.round((doneItems / totalItems) * 100);

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: "24px",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      {/* Loading state */}
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 300,
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid #E5E7EB",
              borderTop: "3px solid #7B1113",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 13, color: "#6B7280" }}>
            Loading checklist from database...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          style={{
            marginBottom: 16,
            background: "#FFF7ED",
            border: "1px solid #FED7AA",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 13,
            color: "#C2410C",
          }}
        >
          ⚠️ {error}
        </div>
      )}
      {/* Main content — only show when not loading */}
      {!loading && (
        <main>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#111",
                    margin: 0,
                  }}
                >
                  IS 215 Project Checklist
                </h1>
                <p
                  style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}
                >
                  UPOU AI Helpdesk Assistant — 2nd Semester SY 2025-2026
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {lastSaved && (
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                    {saving ? "Saving..." : `Saved ${lastSaved}`}
                  </span>
                )}
                <button
                  onClick={reset}
                  style={{
                    fontSize: 12,
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    background: "#fff",
                    color: "#6B7280",
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                marginTop: 20,
                background: "#F3F4F6",
                borderRadius: 12,
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", gap: 24 }}>
                  <div>
                    <div
                      style={{ fontSize: 24, fontWeight: 700, color: "#111" }}
                    >
                      {doneItems}/{totalItems}
                    </div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>
                      Items done
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#7B1113",
                      }}
                    >
                      {earnedPoints}/{totalPoints}
                    </div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>
                      Points earned
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: pct === 100 ? "#15803D" : "#111",
                      }}
                    >
                      {pct}%
                    </div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>
                      Complete
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    alignSelf: "flex-end",
                  }}
                >
                  {totalItems - doneItems} remaining
                </div>
              </div>
              <div
                style={{
                  height: 8,
                  background: "#E5E7EB",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #7B1113, #B91C1C)",
                    borderRadius: 99,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Category filter */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  fontSize: 12,
                  padding: "5px 12px",
                  borderRadius: 20,
                  border:
                    filter === cat
                      ? "1.5px solid #7B1113"
                      : "1px solid #E5E7EB",
                  background: filter === cat ? "#7B1113" : "#fff",
                  color: filter === cat ? "#fff" : "#374151",
                  cursor: "pointer",
                  fontWeight: filter === cat ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Table */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#F9FAFB",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#6B7280",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      width: 36,
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#6B7280",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Category
                  </th>
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#6B7280",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Requirement
                  </th>
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#6B7280",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      width: 60,
                    }}
                  >
                    Pts
                  </th>
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#6B7280",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      width: 80,
                    }}
                  >
                    Done
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const colors =
                    CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Bonus"];
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom:
                          idx < filtered.length - 1
                            ? "1px solid #F3F4F6"
                            : "none",
                        background: item.status ? "#FAFFF7" : "#fff",
                        transition: "background 0.2s",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#9CA3AF",
                          fontWeight: 500,
                        }}
                      >
                        {item.id}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            color: colors.text,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: colors.dot,
                              flexShrink: 0,
                            }}
                          />
                          {item.category}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: item.status ? "#6B7280" : "#111",
                          textDecoration: item.status ? "line-through" : "none",
                        }}
                      >
                        {item.requirement}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              typeof item.points === "number"
                                ? "#7B1113"
                                : "#9CA3AF",
                            fontSize: 13,
                          }}
                        >
                          {item.points}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <button
                          onClick={() => toggle(item.id)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            border: item.status ? "none" : "2px solid #D1D5DB",
                            background: item.status ? "#15803D" : "#fff",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s",
                            flexShrink: 0,
                          }}
                        >
                          {item.status && (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                            >
                              <path
                                d="M2 7L5.5 10.5L12 3.5"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
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

          {/* Pending items summary */}
          {items.filter((i) => !i.status).length > 0 && (
            <div
              style={{
                marginTop: 20,
                background: "#FFF7ED",
                border: "1px solid #FED7AA",
                borderRadius: 12,
                padding: "14px 18px",
              }}
            >
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#C2410C",
                  margin: "0 0 10px",
                }}
              >
                Still needed before submission:
              </p>
              <ul
                style={{
                  margin: 0,
                  padding: "0 0 0 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                {items
                  .filter((i) => !i.status)
                  .map((i) => (
                    <li key={i.id} style={{ fontSize: 12, color: "#92400E" }}>
                      <strong>#{i.id}</strong> — {i.requirement}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {items.filter((i) => !i.status).length === 0 && (
            <div
              style={{
                marginTop: 20,
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: 12,
                padding: "16px 18px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#15803D",
                  margin: 0,
                }}
              >
                All items complete! Ready for submission. 🎉
              </p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
