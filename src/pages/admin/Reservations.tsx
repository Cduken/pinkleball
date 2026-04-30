import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  CalendarDays, Clock, User, Phone, Search, Filter,
  CheckCircle2, XCircle, Hourglass, MoreHorizontal,
  Check, X, ArrowUpDown, RefreshCw,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { useReservations, type Status, type Reservation } from "../../hooks/useReservations";

// ── Design tokens ─────────────────────────────────────────────────────────────
const P = {
  pink: "#f472b6", pinkDim: "rgba(244,114,182,0.45)",
  pinkGhost: "rgba(244,114,182,0.07)", border: "rgba(244,114,182,0.10)",
  card: "rgba(17,13,22,0.7)", muted: "rgba(255,255,255,0.28)",
};

const statusCfg = {
  approved:  { label: "Approved",  color: "#4ade80", bg: "rgba(74,222,128,0.10)",  border: "rgba(74,222,128,0.20)",  icon: CheckCircle2 },
  pending:   { label: "Pending",   color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.20)",  icon: Hourglass    },
  cancelled: { label: "Cancelled", color: "#fb7185", bg: "rgba(251,113,133,0.10)", border: "rgba(251,113,133,0.20)", icon: XCircle      },
};

// ── Detail Drawer ─────────────────────────────────────────────────────────────
const DetailDrawer = ({
  r, onClose, onStatusChange,
}: {
  r: Reservation;
  onClose: () => void;
  onStatusChange: (id: string, s: Status) => Promise<void>;
}) => {
  const [busy, setBusy] = useState(false);
  const cfg = statusCfg[r.status];
  const SIcon = cfg.icon;

  const doChange = async (s: Status) => {
    setBusy(true);
    try {
      await onStatusChange(r.id, s);
      const labels: Record<Status, string> = {
        approved: "✅ Booking approved!",
        cancelled: "❌ Booking cancelled.",
        pending: "⏳ Set back to pending.",
      };
      toast.success(labels[s], {
        style: { background: "#1a0d1f", color: "#fff", border: "1px solid rgba(244,114,182,0.2)" },
      });
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to update status.", {
        style: { background: "#1a0d1f", color: "#fff" },
        duration: 3000,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm h-full flex flex-col overflow-y-auto"
        style={{ background: "linear-gradient(160deg,#110d16,#0a0610)", borderLeft: `1px solid ${P.border}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${P.border}` }}>
          <div>
            <p className="text-white font-black" style={{ letterSpacing: "-0.03em" }}>Booking Detail</p>
            <p className="text-xs font-mono mt-0.5" style={{ color: P.pinkDim }}>{r.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ color: P.muted }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = P.muted)}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 flex flex-col gap-5">
          {/* Status pill */}
          <div className="flex justify-center">
            <span
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
            >
              <SIcon size={13} />{cfg.label}
            </span>
          </div>

          {/* Info grid */}
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${P.border}` }}>
            {[
              { label: "Full Name",  value: r.name,       icon: User        },
              { label: "Contact",    value: r.contact,    icon: Phone       },
              {
                label: "Date",
                value: new Date(r.date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric", year: "numeric",
                }),
                icon: CalendarDays,
              },
              { label: "Start Time", value: r.start_time, icon: Clock },
              { label: "Duration",   value: `${r.hours} hour${r.hours > 1 ? "s" : ""}`, icon: Clock },
            ].map(({ label, value, icon: Icon }, idx, arr) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: idx < arr.length - 1 ? "1px solid rgba(244,114,182,0.05)" : "none" }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: P.pinkGhost }}>
                  <Icon size={13} style={{ color: P.pink }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: "rgba(255,255,255,0.22)" }}>{label}</p>
                  <p className="text-sm text-white font-semibold">{value}</p>
                </div>
              </div>
            ))}
            {/* Total */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: P.pinkGhost }}>
                <span className="text-xs font-black" style={{ color: P.pink }}>₱</span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: "rgba(255,255,255,0.22)" }}>Total</p>
                <p className="text-xl font-black text-white" style={{ letterSpacing: "-0.04em" }}>₱{r.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Booked at */}
          <p className="text-center text-[11px]" style={{ color: "rgba(255,255,255,0.18)" }}>
            Booked{" "}
            {new Date(r.booked_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
              hour: "numeric", minute: "2-digit",
            })}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {r.status !== "approved" && (
              <button
                disabled={busy}
                onClick={() => doChange("approved")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                style={{ background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.20)", color: "#4ade80" }}
                onMouseEnter={e => !busy && (e.currentTarget.style.background = "rgba(74,222,128,0.18)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(74,222,128,0.10)")}
              >
                <Check size={14} /> Approve Booking
              </button>
            )}
            {r.status !== "cancelled" && (
              <button
                disabled={busy}
                onClick={() => doChange("cancelled")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                style={{ background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.18)", color: "#fb7185" }}
                onMouseEnter={e => !busy && (e.currentTarget.style.background = "rgba(251,113,133,0.16)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(251,113,133,0.08)")}
              >
                <X size={14} /> Cancel Booking
              </button>
            )}
            {r.status !== "pending" && (
              <button
                disabled={busy}
                onClick={() => doChange("pending")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.18)", color: "#fbbf24" }}
                onMouseEnter={e => !busy && (e.currentTarget.style.background = "rgba(251,191,36,0.16)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(251,191,36,0.08)")}
              >
                <Hourglass size={14} /> Set to Pending
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminReservations() {
  const { data, loading, error, refetch, updateStatus } = useReservations({ realtime: true });

  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");
  const [sortDir, setSortDir]         = useState<"asc" | "desc">("desc");
  const [selected, setSelected]       = useState<Reservation | null>(null);

  // Keep drawer data fresh when realtime fires
  const selectedLive = useMemo(
    () => (selected ? (data.find(r => r.id === selected.id) ?? selected) : null),
    [selected, data]
  );

  const handleStatusChange = async (id: string, status: Status) => {
    await updateStatus(id, status);
    // Drawer stays open with updated data via selectedLive
  };

  const filtered = useMemo(() =>
    data
      .filter(r => {
        const q = search.toLowerCase();
        return (
          (r.name.toLowerCase().includes(q) || r.contact.includes(q) || r.id.toLowerCase().includes(q)) &&
          (statusFilter === "all" || r.status === statusFilter) &&
          (!dateFrom || r.date >= dateFrom) &&
          (!dateTo   || r.date <= dateTo)
        );
      })
      .sort((a, b) =>
        sortDir === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
      ),
    [data, search, statusFilter, dateFrom, dateTo, sortDir]
  );

  const counts = useMemo(() => ({
    all:       data.length,
    approved:  data.filter(r => r.status === "approved").length,
    pending:   data.filter(r => r.status === "pending").length,
    cancelled: data.filter(r => r.status === "cancelled").length,
  }), [data]);

  return (
    <AdminLayout title="Reservations" subtitle="Manage all court bookings">
      {selectedLive && (
        <DetailDrawer
          r={selectedLive}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ── Status filter pills ─────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-5">
        {(
          [
            ["all",       "All",       counts.all,       "#f472b6"],
            ["approved",  "Approved",  counts.approved,  "#4ade80"],
            ["pending",   "Pending",   counts.pending,   "#fbbf24"],
            ["cancelled", "Cancelled", counts.cancelled, "#fb7185"],
          ] as const
        ).map(([key, label, count, color]) => {
          const active = statusFilter === key;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key as Status | "all")}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer"
              style={{
                background: active ? `${color}14` : "rgba(255,255,255,0.03)",
                border:     active ? `1px solid ${color}35` : "1px solid rgba(255,255,255,0.06)",
                color:      active ? color : "rgba(255,255,255,0.3)",
              }}
            >
              {label}
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search / date filters ───────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3 mb-5"
        style={{ background: P.card, border: `1px solid ${P.border}` }}
      >
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: P.pinkDim }} />
          <input
            type="text"
            placeholder="Search name, contact, ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "rgba(10,5,14,0.9)", border: "1px solid rgba(244,114,182,0.12)", color: "#fff" }}
            onFocus={e => {
              e.currentTarget.style.border     = "1px solid rgba(244,114,182,0.4)";
              e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(244,114,182,0.07)";
            }}
            onBlur={e => {
              e.currentTarget.style.border    = "1px solid rgba(244,114,182,0.12)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} style={{ color: P.pinkDim }} />
          {([["From", dateFrom, setDateFrom], ["To", dateTo, setDateTo]] as const).map(([lbl, val, set]) => (
            <input
              key={lbl}
              type="date"
              value={val}
              onChange={e => set(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-xs outline-none"
              style={{ background: "rgba(10,5,14,0.9)", border: "1px solid rgba(244,114,182,0.12)", color: "rgba(255,255,255,0.5)" }}
              onFocus={e  => (e.currentTarget.style.border = "1px solid rgba(244,114,182,0.4)")}
              onBlur={e   => (e.currentTarget.style.border = "1px solid rgba(244,114,182,0.12)")}
            />
          ))}

          {(search || statusFilter !== "all" || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); setDateFrom(""); setDateTo(""); }}
              className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              style={{ background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.18)", color: "#fb7185" }}
            >
              Clear
            </button>
          )}

          <button
            onClick={() => setSortDir(d => (d === "asc" ? "desc" : "asc"))}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            style={{ background: P.pinkGhost, border: `1px solid ${P.border}`, color: P.pinkDim }}
            onMouseEnter={e => (e.currentTarget.style.color = P.pink)}
            onMouseLeave={e => (e.currentTarget.style.color = P.pinkDim)}
          >
            <ArrowUpDown size={12} /> {sortDir === "asc" ? "↑" : "↓"}
          </button>

          <button
            onClick={refetch}
            title="Refresh"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            style={{ background: P.pinkGhost, border: `1px solid ${P.border}`, color: P.pinkDim }}
            onMouseEnter={e => (e.currentTarget.style.color = P.pink)}
            onMouseLeave={e => (e.currentTarget.style.color = P.pinkDim)}
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* ── Error banner ────────────────────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold"
          style={{ background: "rgba(251,113,133,0.10)", border: "1px solid rgba(251,113,133,0.25)", color: "#fb7185" }}
        >
          ⚠ {error}
        </div>
      )}

      <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.2)" }}>
        Showing{" "}
        <span style={{ color: P.pinkDim }}>{filtered.length}</span>{" "}
        reservation{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${P.border}`, background: P.card }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(244,114,182,0.06)" }}>
                {["ID", "Customer", "Contact", "Date", "Time", "Hrs", "Total", "Status", ""].map(h => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.18)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                /* Loading skeleton */
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(244,114,182,0.04)" }}>
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div
                          className="h-3 rounded-full animate-pulse"
                          style={{ background: "rgba(244,114,182,0.07)", width: j === 1 ? "120px" : "60px" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <CalendarDays size={26} className="mx-auto mb-3" style={{ color: "rgba(244,114,182,0.15)" }} />
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>No reservations found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => {
                  const cfg   = statusCfg[r.status];
                  const SIcon = cfg.icon;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      style={{
                        borderBottom: i < filtered.length - 1 ? "1px solid rgba(244,114,182,0.04)" : "none",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(244,114,182,0.03)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-5 py-3.5 text-xs font-mono font-bold" style={{ color: P.pinkDim }}>{r.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                            style={{ background: "linear-gradient(135deg,#be185d,#ec4899)", color: "#fff" }}
                          >
                            {r.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-white whitespace-nowrap">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{r.contact}</td>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {new Date(r.date + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{r.start_time}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{r.hours}h</td>
                      <td className="px-5 py-3.5 text-xs font-black" style={{ color: P.pink }}>₱{r.total.toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                        >
                          <SIcon size={9} />{cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "rgba(255,255,255,0.18)" }}
                          onMouseEnter={e => (e.currentTarget.style.color = P.pink)}
                          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.18)")}
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}