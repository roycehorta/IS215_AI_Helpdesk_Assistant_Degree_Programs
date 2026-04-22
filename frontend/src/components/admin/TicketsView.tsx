// frontend/src/components/admin/TicketsView.tsx
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { Ticket } from "../../types/ticket";
import NewTicketModal from "./NewTicketModal";
import TicketModal from "./TicketModal";

interface Props {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

const STATUS_STYLES: Record<string, string> = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Answered: "bg-green-50 text-green-700 border-green-200",
};

const CATEGORY_STYLES: Record<string, string> = {
  enrollment: "bg-purple-50 text-purple-700",
  programs: "bg-blue-50 text-blue-700",
  tuition: "bg-green-50 text-green-700",
  technical: "bg-orange-50 text-orange-700",
  academic: "bg-rose-50 text-rose-700",
  general: "bg-gray-50 text-gray-600",
  other: "bg-gray-50 text-gray-600",
};

const TicketsView: FC<Props> = ({ tickets, setTickets }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _route: "get-tickets" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to fetch");

      const statusMap: Record<string, Ticket["status"]> = {
        OPEN: "New",
        ANSWERED: "Answered",
        REPLIED: "Answered",
        RESOLVED: "Answered",
        New: "New",
        Answered: "Answered",
        Replied: "Answered",
        Resolved: "Answered",
      };

      const mapped: Ticket[] = data.tickets.map(
        (t: {
          ticketId: string;
          name: string;
          email: string;
          category: string;
          description: string;
          status: string;
          createdAt: string;
          question: string;
        }) => ({
          id: t.ticketId,
          user: t.email,
          name: t.name ?? "",
          subject: t.category || "general",
          status: statusMap[t.status] ?? "New",
          date: t.createdAt ? t.createdAt.split("T")[0] : "",
          details: t.description || t.question || "",
        }),
      );

      setTickets(mapped);
      setPage(1);
    } catch (err) {
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // ── Filter + sort ──────────────────────────────────────
  const filtered = tickets
    .filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        t.id.toLowerCase().includes(q) ||
        t.user.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        // ✅ After
        (t.details ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) =>
      sort === "newest"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date),
    );

  // ── Pagination ─────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, filtered.length);

  const handleStatusChange = (newStatus: Ticket["status"]) => {
    if (!selectedTicket) return;
    setSelectedTicket({ ...selectedTicket, status: newStatus });
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id ? { ...t, status: newStatus } : t,
      ),
    );
  };

  // ✅ Match the new TicketModal interface
  const handleSendReply = (replyText: string, newStatus: Ticket["status"]) => {
    if (!selectedTicket) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id ? { ...t, status: newStatus } : t,
      ),
    );
    setSelectedTicket(null);
  };
  const handleAddTicket = (ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]); // ← adds to top
    setIsAdding(false);
    setSort("newest"); // ← force newest first
    setPage(1); // ← go back to page 1
  };

  // Status counts for filter pills
  const counts = {
    All: tickets.length,
    New: tickets.filter((t) => t.status === "New").length,
    Answered: tickets.filter((t) => t.status === "Answered").length,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ticket Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            + Add Ticket
          </button>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
              DR
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                Dr. Ramona Aquino
              </p>
              <p className="text-[10px] text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 px-8 py-3 bg-white border-b border-gray-100">
        {(["All", "New", "Answered"] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              statusFilter === s
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                statusFilter === s
                  ? "bg-white/20 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + sort + page size */}
      <div className="flex items-center gap-3 px-8 py-3 bg-white border-b border-gray-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by ID, email, or concern..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <div className="flex items-center gap-2 ml-auto text-sm text-gray-500">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-200 rounded-lg px-2 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span>per page</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
            <p className="text-sm text-gray-400">Loading tickets...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-36">
                      Ticket ID
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Concern
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-28">
                      Date
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-28">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-primary font-mono">
                          {t.id.length > 12 ? t.id.slice(0, 12) + "…" : t.id}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                          {t.name ||
                            t.user
                              .split("@")[0]
                              .replace(/[._]/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {t.user}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${CATEGORY_STYLES[t.subject] ?? CATEGORY_STYLES["general"]}`}
                        >
                          {t.subject}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-sm text-gray-700 truncate">
                          {t.details ?? "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[t.status] ?? STATUS_STYLES["New"]}`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-16 text-center text-sm text-gray-400"
                      >
                        No tickets found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-1">
                <p className="text-xs text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {startIndex}–{endIndex}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {filtered.length}
                  </span>{" "}
                  tickets
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                    )
                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                      if (
                        idx > 0 &&
                        typeof arr[idx - 1] === "number" &&
                        (p as number) - (arr[idx - 1] as number) > 1
                      )
                        acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === "..." ? (
                        <span
                          key={`dots-${idx}`}
                          className="px-2 text-gray-400 text-sm"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                            page === p
                              ? "bg-primary text-white"
                              : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onSendReply={handleSendReply}
        />
      )}
      {isAdding && (
        <NewTicketModal
          onClose={() => setIsAdding(false)}
          onAddTicket={handleAddTicket}
        />
      )}
    </div>
  );
};

export default TicketsView;
