/* eslint-disable no-case-declarations */
//Admin/Reservations.tsx
import { useState, useMemo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays, Clock, User, Phone, Search, Filter,
  CheckCircle2, XCircle, Hourglass, MoreHorizontal,
  Check, X, ArrowUpDown, RefreshCw,
  TrendingUp, DollarSign, Users, Calendar,
  BarChart3, PieChart, Activity,
  Download, ChevronDown, ChevronUp, AlertCircle,
  Zap, Clock3
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

// ── Time frame type ───────────────────────────────────────────────────────────
type TimeFrame = "today" | "week" | "month" | "all";

// ── Statistics Card Component ─────────────────────────────────────────────────
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  sub, 
  color, 
  trend 
}: { 
  icon: React.ComponentType<any>; 
  label: string; 
  value: string | number; 
  sub?: string; 
  color: string;
  trend?: { value: number; positive: boolean };
}) => (
  <div 
    className="rounded-2xl p-5 transition-all duration-300 hover:scale-105 cursor-default"
    style={{ 
      background: P.card, 
      border: `1px solid ${P.border}`,
      boxShadow: `0 0 30px ${color}10`
    }}
  >
    <div className="flex items-center justify-between mb-3">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      {trend && (
        <div 
          className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
          style={{ 
            background: trend.positive ? "rgba(74,222,128,0.1)" : "rgba(251,113,133,0.1)",
            color: trend.positive ? "#4ade80" : "#fb7185"
          }}
        >
          {trend.positive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {Math.abs(trend.value)}%
        </div>
      )}
    </div>
    <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
      {label}
    </p>
    <p className="text-2xl font-black text-white" style={{ letterSpacing: "-0.02em" }}>
      {value}
    </p>
    {sub && (
      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
        {sub}
      </p>
    )}
  </div>
);

// ── Recent Activity Component ─────────────────────────────────────────────────
const RecentActivity = ({ reservations }: { reservations: Reservation[] }) => {
  const recent = useMemo(() => 
    [...reservations]
      .sort((a, b) => new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime())
      .slice(0, 5),
    [reservations]
  );

  return (
    <div 
      className="rounded-2xl p-5"
      style={{ background: P.card, border: `1px solid ${P.border}` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} style={{ color: P.pink }} />
        <h3 className="text-sm font-bold text-white">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {recent.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.2)" }}>
            No recent activity
          </p>
        ) : (
          recent.map((r) => {
            const cfg = statusCfg[r.status];
            const SIcon = cfg.icon;
            return (
              <div 
                key={r.id} 
                className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                style={{ background: "rgba(244,114,182,0.03)" }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: "linear-gradient(135deg,#be185d,#ec4899)", color: "#fff" }}
                >
                  {r.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{r.name}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {new Date(r.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {r.start_time}
                  </p>
                </div>
                <span
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                >
                  <SIcon size={9} />{cfg.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ── Upcoming Bookings Component ───────────────────────────────────────────────
const UpcomingBookings = ({ reservations }: { reservations: Reservation[] }) => {
  const upcoming = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return [...reservations]
      .filter(r => r.status === "approved" && r.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time))
      .slice(0, 5);
  }, [reservations]);

  return (
    <div 
      className="rounded-2xl p-5"
      style={{ background: P.card, border: `1px solid ${P.border}` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={16} style={{ color: "#4ade80" }} />
        <h3 className="text-sm font-bold text-white">Upcoming Bookings</h3>
      </div>
      <div className="space-y-3">
        {upcoming.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.2)" }}>
            No upcoming bookings
          </p>
        ) : (
          upcoming.map((r, idx) => (
            <div 
              key={r.id} 
              className="flex items-center gap-3 p-3 rounded-xl transition-colors"
              style={{ background: "rgba(74,222,128,0.05)" }}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80" }}
              >
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{r.name}</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {new Date(r.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} • {r.start_time} ({r.hours}h)
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── Detailed Statistics Section ───────────────────────────────────────────────
const DetailedStats = ({ reservations, timeFrame, setTimeFrame }: { 
  reservations: Reservation[];
  timeFrame: TimeFrame;
  setTimeFrame: (tf: TimeFrame) => void;
}) => {
  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const filtered = reservations.filter(r => {
      const bookingDate = new Date(r.date + "T00:00:00");
      const now = new Date();
      
      switch (timeFrame) {
        case "today":
          return r.date === today;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return bookingDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return bookingDate >= monthAgo;
        default:
          return true;
      }
    });

    const revenue = filtered.reduce((sum, r) => sum + (r.status === "approved" ? r.total : 0), 0);
    const totalHours = filtered.reduce((sum, r) => sum + r.hours, 0);
    const approvedCount = filtered.filter(r => r.status === "approved").length;
    const cancellationRate = filtered.length > 0 
      ? ((filtered.filter(r => r.status === "cancelled").length / filtered.length) * 100).toFixed(1)
      : "0";

    return { revenue, totalHours, approvedCount, cancellationRate, total: filtered.length };
  }, [reservations, timeFrame, today]);

  const timeFrames: { key: TimeFrame; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
  ];

  return (
    <div 
      className="rounded-2xl p-5"
      style={{ background: P.card, border: `1px solid ${P.border}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} style={{ color: P.pink }} />
          <h3 className="text-sm font-bold text-white">Detailed Statistics</h3>
        </div>
        <div className="flex gap-1">
          {timeFrames.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeFrame(key)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              style={{
                background: timeFrame === key ? "rgba(244,114,182,0.15)" : "transparent",
                color: timeFrame === key ? P.pink : "rgba(255,255,255,0.3)",
                border: timeFrame === key ? `1px solid ${P.pinkDim}` : "1px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div 
          className="rounded-xl p-3"
          style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.1)" }}
        >
          <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
            Total Revenue
          </p>
          <p className="text-lg font-black" style={{ color: "#4ade80" }}>
            ₱{stats.revenue.toLocaleString()}
          </p>
        </div>

        <div 
          className="rounded-xl p-3"
          style={{ background: "rgba(244,114,182,0.05)", border: "1px solid rgba(244,114,182,0.1)" }}
        >
          <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
            Total Hours
          </p>
          <p className="text-lg font-black" style={{ color: P.pink }}>
            {stats.totalHours}h
          </p>
        </div>

        <div 
          className="rounded-xl p-3"
          style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.1)" }}
        >
          <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
            Bookings
          </p>
          <p className="text-lg font-black" style={{ color: "#fbbf24" }}>
            {stats.total}
          </p>
        </div>

        <div 
          className="rounded-xl p-3"
          style={{ background: "rgba(251,113,133,0.05)", border: "1px solid rgba(251,113,133,0.1)" }}
        >
          <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
            Cancel Rate
          </p>
          <p className="text-lg font-black" style={{ color: "#fb7185" }}>
            {stats.cancellationRate}%
          </p>
        </div>
      </div>
    </div>
  );
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
      });
    } finally {
      setBusy(false);
    }
  };

  // Calculate end time
  const endTime = useMemo(() => {
    const [timePart, meridiem] = r.start_time.split(" ");
    let [h, m] = timePart.split(":").map(Number);
    if (meridiem === "PM" && h !== 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    
    const totalMins = h * 60 + m + r.hours * 60;
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    const endMeridiem = endH < 12 ? "AM" : "PM";
    const displayH = endH % 12 === 0 ? 12 : endH % 12;
    return `${displayH}:${String(endM).padStart(2, "0")} ${endMeridiem}`;
  }, [r.start_time, r.hours]);

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
              { label: "End Time",   value: endTime,      icon: Clock3 },
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
  const [timeFrame, setTimeFrame]     = useState<TimeFrame>("all");
  const [showStats, setShowStats]     = useState(true);
  const [exporting, setExporting]     = useState(false);

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

  // Dynamic statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = data.filter(r => r.date === today);
    const approvedBookings = data.filter(r => r.status === "approved");
    const pendingBookings = data.filter(r => r.status === "pending");
    
    const totalRevenue = approvedBookings.reduce((sum, r) => sum + r.total, 0);
    
    // Calculate trends (comparing with previous period)
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const yesterdayBookings = data.filter(r => r.date === yesterday);
    const bookingTrend = yesterdayBookings.length > 0 
      ? ((todayBookings.length - yesterdayBookings.length) / yesterdayBookings.length * 100).toFixed(0)
      : "0";

    return {
      totalRevenue,
      totalBookings: data.length,
      pendingCount: pendingBookings.length,
      approvedCount: approvedBookings.length,
      bookingTrend: parseInt(bookingTrend),
      todayBookings: todayBookings.length,
    };
  }, [data]);

  // Export functionality
  const handleExport = useCallback(() => {
    setExporting(true);
    try {
      const csvContent = [
        ["ID", "Name", "Contact", "Date", "Start Time", "Hours", "Total", "Status", "Booked At"].join(","),
        ...filtered.map(r => [
          r.id,
          `"${r.name}"`,
          `"${r.contact}"`,
          r.date,
          r.start_time,
          r.hours,
          r.total,
          r.status,
          r.booked_at,
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reservations-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("✅ Data exported successfully!", {
        style: { background: "#1a0d1f", color: "#fff", border: "1px solid rgba(244,114,182,0.2)" },
      });
    } catch (err) {
      toast.error("Failed to export data", {
        style: { background: "#1a0d1f", color: "#fff" },
      });
    } finally {
      setExporting(false);
    }
  }, [filtered]);

  return (
    <AdminLayout title="Reservations" subtitle="Manage all court bookings">
      {selectedLive && (
        <DetailDrawer
          r={selectedLive}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ── Quick Stats Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₱${stats.totalRevenue.toLocaleString()}`}
          sub="From approved bookings"
          color="#4ade80"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          icon={CalendarDays}
          label="Total Bookings"
          value={stats.totalBookings}
          sub="All time"
          color={P.pink}
          trend={{ value: stats.bookingTrend, positive: stats.bookingTrend >= 0 }}
        />
        <StatCard
          icon={Users}
          label="Today's Bookings"
          value={stats.todayBookings}
          sub={new Date().toLocaleDateString("en-US", { weekday: "long" })}
          color="#fbbf24"
        />
        <StatCard
          icon={Hourglass}
          label="Pending"
          value={stats.pendingCount}
          sub="Awaiting approval"
          color="#fb7185"
        />
      </div>

      {/* ── Dynamic Dashboard Sections ──────────────────────────────────────── */}
      {showStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <DetailedStats 
              reservations={data} 
              timeFrame={timeFrame} 
              setTimeFrame={setTimeFrame} 
            />
          </div>
          <div className="space-y-4">
            <RecentActivity reservations={data} />
            <UpcomingBookings reservations={data} />
          </div>
        </div>
      )}

      {/* ── Toggle Stats Button ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: P.pinkGhost, border: `1px solid ${P.border}`, color: P.pinkDim }}
            onMouseEnter={e => (e.currentTarget.style.color = P.pink)}
            onMouseLeave={e => (e.currentTarget.style.color = P.pinkDim)}
          >
            {showStats ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showStats ? "Hide Analytics" : "Show Analytics"}
          </button>

          <button
            onClick={handleExport}
            disabled={exporting || filtered.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.18)", color: "#4ade80" }}
            onMouseEnter={e => !exporting && (e.currentTarget.style.background = "rgba(74,222,128,0.15)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(74,222,128,0.08)")}
          >
            <Download size={13} />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        {/* Active filters indicator */}
        {(search || statusFilter !== "all" || dateFrom || dateTo) && (
          <div className="flex items-center gap-2">
            <AlertCircle size={12} style={{ color: P.pinkDim }} />
            <span className="text-[10px] font-bold" style={{ color: P.pinkDim }}>
              Active filters applied
            </span>
          </div>
        )}
      </div>

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
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer hover:scale-105"
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
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
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
              className="px-3 py-2.5 rounded-xl text-xs outline-none transition-all duration-200"
              style={{ background: "rgba(10,5,14,0.9)", border: "1px solid rgba(244,114,182,0.12)", color: "rgba(255,255,255,0.5)" }}
              onFocus={e  => {
                e.currentTarget.style.border = "1px solid rgba(244,114,182,0.4)";
                e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(244,114,182,0.07)";
              }}
              onBlur={e   => {
                e.currentTarget.style.border = "1px solid rgba(244,114,182,0.12)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          ))}

          {(search || statusFilter !== "all" || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); setDateFrom(""); setDateTo(""); }}
              className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-105"
              style={{ background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.18)", color: "#fb7185" }}
            >
              Clear All
            </button>
          )}

          <button
            onClick={() => setSortDir(d => (d === "asc" ? "desc" : "asc"))}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-105"
            style={{ background: P.pinkGhost, border: `1px solid ${P.border}`, color: P.pinkDim }}
            onMouseEnter={e => (e.currentTarget.style.color = P.pink)}
            onMouseLeave={e => (e.currentTarget.style.color = P.pinkDim)}
            title={`Sort ${sortDir === "asc" ? "Descending" : "Ascending"}`}
          >
            <ArrowUpDown size={12} /> {sortDir === "asc" ? "↑ Oldest" : "↓ Newest"}
          </button>

          <button
            onClick={refetch}
            title="Refresh data"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-105 hover:rotate-180"
            style={{ background: P.pinkGhost, border: `1px solid ${P.border}`, color: P.pinkDim }}
            onMouseEnter={e => (e.currentTarget.style.color = P.pink)}
            onMouseLeave={e => (e.currentTarget.style.color = P.pinkDim)}
          >
            <RefreshCw size={12} className="transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* ── Error banner ────────────────────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold flex items-center gap-2"
          style={{ background: "rgba(251,113,133,0.10)", border: "1px solid rgba(251,113,133,0.25)", color: "#fb7185" }}
        >
          <AlertCircle size={16} />
          ⚠ {error}
        </div>
      )}

      {/* ── Results count with animation ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          Showing{" "}
          <span className="font-bold" style={{ color: P.pinkDim }}>
            {filtered.length}
          </span>{" "}
          reservation{filtered.length !== 1 ? "s" : ""}
          {loading && (
            <span className="inline-block ml-2">
              <RefreshCw size={10} className="animate-spin inline" style={{ color: P.pinkDim }} />
            </span>
          )}
        </p>
        {!loading && filtered.length > 0 && (
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.15)" }}>
            Click on a row to view details
          </p>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div 
        className="rounded-2xl overflow-hidden transition-all duration-300"
        style={{ 
          border: `1px solid ${P.border}`, 
          background: P.card,
          boxShadow: filtered.length > 0 ? `0 0 40px rgba(244,114,182,0.05)` : "none"
        }}
      >
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
                /* Loading skeleton with pulse animation */
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(244,114,182,0.04)" }}>
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div
                          className="h-3 rounded-full animate-pulse"
                          style={{ 
                            background: "rgba(244,114,182,0.07)", 
                            width: j === 1 ? "120px" : j === 2 ? "100px" : "60px",
                            animationDelay: `${i * 0.1 + j * 0.05}s`
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <CalendarDays size={26} className="mx-auto mb-3" style={{ color: "rgba(244,114,182,0.15)" }} />
                    <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.2)" }}>
                      {search || statusFilter !== "all" || dateFrom || dateTo
                        ? "No reservations match your filters"
                        : "No reservations found"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.1)" }}>
                      {search || statusFilter !== "all" || dateFrom || dateTo
                        ? "Try adjusting your search or filters"
                        : "New bookings will appear here"}
                    </p>
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
                      className="transition-all duration-200"
                      style={{
                        borderBottom: i < filtered.length - 1 ? "1px solid rgba(244,114,182,0.04)" : "none",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(244,114,182,0.03)";
                        e.currentTarget.style.transform = "translateX(2px)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
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
                          className="p-1.5 rounded-lg transition-all hover:scale-110"
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

      {/* ── Footer stats ────────────────────────────────────────────────────── */}
      {filtered.length > 0 && !loading && (
        <div 
          className="mt-4 rounded-xl px-4 py-3 flex items-center justify-between text-[10px]"
          style={{ background: "rgba(244,114,182,0.02)", border: `1px solid ${P.border}` }}
        >
          <div className="flex items-center gap-4">
            <span style={{ color: "rgba(255,255,255,0.2)" }}>
              Total revenue: <span className="font-bold" style={{ color: "#4ade80" }}>
                ₱{filtered.reduce((sum, r) => sum + r.total, 0).toLocaleString()}
              </span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>
              Total hours: <span className="font-bold" style={{ color: P.pinkDim }}>
                {filtered.reduce((sum, r) => sum + r.hours, 0)}h
              </span>
            </span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.1)" }}>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}
    </AdminLayout>
  );
}