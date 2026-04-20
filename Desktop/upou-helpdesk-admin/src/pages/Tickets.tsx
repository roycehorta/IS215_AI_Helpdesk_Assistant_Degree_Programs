import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTickets } from "@/store/ticketStore";
import { STATUS_ORDER, TicketStatus } from "@/data/tickets";

const Tickets = () => {
  const { tickets } = useTickets();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TicketStatus | "All">("All");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = tickets.filter((t) => {
      const matchQ =
        !needle ||
        t.id.toLowerCase().includes(needle) ||
        t.studentName.toLowerCase().includes(needle) ||
        t.subject.toLowerCase().includes(needle);
      const matchS = status === "All" || t.status === status;
      return matchQ && matchS;
    });
    rows.sort((a, b) =>
      sort === "newest"
        ? b.dateSubmitted.localeCompare(a.dateSubmitted)
        : a.dateSubmitted.localeCompare(b.dateSubmitted),
    );
    return rows;
  }, [tickets, q, status, sort]);

  return (
    <AdminLayout title="Ticket Management">
      <Card className="shadow-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ID, student, or subject…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus | "All")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as "newest" | "oldest")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[130px]">Ticket ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead className="hidden md:table-cell">Concern</TableHead>
              <TableHead className="w-[160px]">Date Submitted</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No tickets match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id} className="cursor-pointer">
                  <TableCell className="p-0">
                    <Link to={`/tickets/${t.id}`} className="block px-4 py-4 font-mono text-xs font-semibold text-primary">
                      {t.id}
                    </Link>
                  </TableCell>
                  <TableCell className="p-0">
                    <Link to={`/tickets/${t.id}`} className="block px-4 py-4">
                      <div className="font-medium text-foreground">{t.studentName}</div>
                      <div className="text-xs text-muted-foreground">{t.studentNumber}</div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden p-0 md:table-cell">
                    <Link to={`/tickets/${t.id}`} className="block px-4 py-4">
                      <div className="line-clamp-1 max-w-md text-sm text-foreground">{t.subject}</div>
                      <div className="line-clamp-1 max-w-md text-xs text-muted-foreground">{t.concern}</div>
                    </Link>
                  </TableCell>
                  <TableCell className="p-0">
                    <Link to={`/tickets/${t.id}`} className="block px-4 py-4 text-sm text-muted-foreground">
                      {new Date(t.dateSubmitted).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </Link>
                  </TableCell>
                  <TableCell className="p-0">
                    <Link to={`/tickets/${t.id}`} className="block px-4 py-4">
                      <StatusBadge status={t.status} />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Showing {filtered.length} of {tickets.length} tickets
        </div>
      </Card>
    </AdminLayout>
  );
};

export default Tickets;
