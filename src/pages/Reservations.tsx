import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  CalendarDays,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Hourglass,
  Search,
  Filter,
  X,
  CalendarSearch,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import gsap from "gsap";
import MainLogo from "../components/MainLogo/MainLogo";
import { useReservations, type Status } from "../hooks/useReservations";

// ── Status config ─────────────────────────────────────────────────────────────
const statusConfig = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-400",
  },
  pending: {
    label: "Pending",
    icon: Hourglass,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-500",
    badge: "bg-red-100 text-red-600",
    dot: "bg-red-400",
  },
};

const ALL_STATUSES: Status[] = ["approved", "pending", "cancelled"];

// ── Skeleton card with animation ─────────────────────────────────────────────
const SkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4"
  >
    <div className="hidden sm:flex w-1 self-stretch rounded-full bg-gray-100 animate-pulse" />
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-100 animate-pulse" />
          <div className="flex flex-col gap-1">
            <div className="h-3 w-28 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-2 w-16 bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3 w-36 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-3 w-24 bg-gray-100 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3 w-20 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-3 w-28 bg-gray-100 rounded-full animate-pulse" />
      </div>
    </div>
    <div className="h-7 w-24 bg-gray-100 rounded-full animate-pulse self-center" />
  </motion.div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const ReservationsPage = () => {
  const navigate = useNavigate();
  const { data: reservations, loading, error, refetch } = useReservations();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "back.out(0.6)", delay: 0.1 }
      );
      gsap.fromTo(
        statsRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(0.5)", delay: 0.2 }
      );
      gsap.fromTo(
        filtersRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3 }
      );
    });

    return () => ctx.revert();
  }, []);

  const filtered = useMemo(() =>
    reservations.filter(r => {
      const q = search.toLowerCase();
      return (
        (r.name.toLowerCase().includes(q) || r.contact.includes(q) || r.id.toLowerCase().includes(q)) &&
        (statusFilter === "all" || r.status === statusFilter) &&
        (!dateFrom || r.date >= dateFrom) &&
        (!dateTo || r.date <= dateTo)
      );
    }),
    [reservations, search, statusFilter, dateFrom, dateTo]
  );

  const counts = useMemo(() => ({
    all: reservations.length,
    approved: reservations.filter(r => r.status === "approved").length,
    pending: reservations.filter(r => r.status === "pending").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
  }), [reservations]);

  // Animate when filtered results change
  useEffect(() => {
    if (!loading && listRef.current) {
      gsap.fromTo(
        ".reservation-card",
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(0.6)" }
      );
    }
  }, [filtered, loading]);

  // Animate stat cards when counts change
  useEffect(() => {
    if (statsRef.current && !loading) {
      gsap.fromTo(
        ".stat-card",
        { scale: 1 },
        { scale: 1.02, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.inOut" }
      );
    }
  }, [counts, loading]);

  const hasFilters = Boolean(search || statusFilter !== "all" || dateFrom || dateTo);

  const clearFilters = () => {
    // Animate clear button
    gsap.to(".clear-filters", {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        setSearch("");
        setStatusFilter("all");
        setDateFrom("");
        setDateTo("");
      }
    });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });

  const formatBookedAt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });

  // Floating decorative elements animation
  useEffect(() => {
    const floatingElements = document.querySelectorAll(".floating-deco-res");
    floatingElements.forEach((el, i) => {
      gsap.to(el, {
        y: "random(-15, 15)",
        x: "random(-10, 10)",
        duration: "random(3, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.3,
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-50 to-pink-100/50">
     

      {/* Header */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-md border-b border-pink-100 px-4 py-4 sticky top-0 z-20"
      >
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-pink-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
          <MainLogo />
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={refetch}
            title="Refresh"
            className="ml-auto p-2 rounded-xl hover:bg-pink-50 transition cursor-pointer text-gray-400 hover:text-pink-500"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Title */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-gray-900">
            All <span className="text-pink-500">Reservations</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">View and filter all court bookings.</p>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-6"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refetch}
                className="ml-auto text-xs text-red-500 hover:underline cursor-pointer"
              >
                Retry
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stat cards */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {(
            [
              { key: "all", label: "Total", color: "text-gray-700", bg: "bg-white", border: "border-gray-100" },
              { key: "approved", label: "Approved", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
              { key: "pending", label: "Pending", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
              { key: "cancelled", label: "Cancelled", color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
            ] as const
          ).map(({ key, label, color, bg, border }, idx) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStatusFilter(key as Status | "all")}
              className={`stat-card ${bg} border ${border} rounded-2xl p-4 text-left transition hover:shadow-md cursor-pointer
                ${statusFilter === key ? "ring-2 ring-pink-400 ring-offset-1" : ""}
              `}
            >
              <p className={`text-2xl font-extrabold ${color}`}>
                {loading ? (
                  <span className="inline-block w-8 h-7 bg-gray-100 rounded animate-pulse" />
                ) : (
                  counts[key as keyof typeof counts]
                )}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          ref={filtersRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl border border-pink-100 shadow-sm p-4 mb-6 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <motion.input
                whileFocus={{ scale: 1.01, borderColor: "#ec4899" }}
                type="text"
                placeholder="Search name, contact, or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition placeholder:text-gray-300"
              />
            </div>

            {/* Status pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </div>
              {(["all", ...ALL_STATUSES] as const).map((s, idx) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer
                    ${statusFilter === s
                      ? s === "all"
                        ? "bg-pink-500 text-white border-transparent"
                        : `${statusConfig[s as Status].badge} border-transparent`
                      : "border-gray-200 text-gray-400 hover:border-pink-300 hover:text-pink-500"
                    }
                  `}
                >
                  {s === "all" ? "All" : statusConfig[s as Status].label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="flex flex-col sm:flex-row gap-3 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
              <CalendarSearch className="w-3.5 h-3.5" />
              <span>Date range:</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition text-gray-600"
              />
              <span className="text-gray-300 text-xs">to</span>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition text-gray-600"
              />
              {hasFilters && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="clear-filters flex items-center gap-1 px-3 py-2 text-xs text-gray-400 hover:text-pink-500 border border-gray-200 rounded-xl hover:border-pink-300 transition cursor-pointer shrink-0"
                >
                  <X className="w-3 h-3" />
                  Clear
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between mb-3"
        >
          <p className="text-xs text-gray-400">
            Showing{" "}
            <motion.span
              key={filtered.length}
              initial={{ scale: 1.2, color: "#ec4899" }}
              animate={{ scale: 1, color: "#4b5563" }}
              transition={{ type: "spring", stiffness: 400 }}
              className="font-semibold text-gray-600 inline-block"
            >
              {filtered.length}
            </motion.span>{" "}
            reservation{filtered.length !== 1 ? "s" : ""}
            {hasFilters && " (filtered)"}
          </p>
        </motion.div>

        {/* List */}
        <div ref={listRef}>
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-pink-100 p-16 flex flex-col items-center gap-3 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CalendarDays className="w-10 h-10 text-pink-200" />
              </motion.div>
              <p className="font-bold text-gray-700">No reservations found</p>
              <p className="text-xs text-gray-400">Try adjusting your filters or search query.</p>
              {hasFilters && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="mt-2 px-4 py-2 bg-pink-500 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition cursor-pointer"
                >
                  Clear Filters
                </motion.button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="flex flex-col gap-3">
                {filtered.map((r, idx) => {
                  const config = statusConfig[r.status];
                  const StatusIcon = config.icon;

                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.95 }}
                      transition={{ delay: idx * 0.05, duration: 0.4, ease: "backOut" }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className={`reservation-card bg-white rounded-2xl border ${config.border} shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition hover:shadow-md`}
                    >
                      {/* Status stripe */}
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: idx * 0.05 + 0.2 }}
                        className={`hidden sm:flex w-1 self-stretch rounded-full ${config.dot}`}
                      />

                      {/* Info */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Name & ID */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: idx * 0.05 + 0.15, type: "spring", stiffness: 400 }}
                              className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center"
                            >
                              <User className="w-3.5 h-3.5 text-pink-500" />
                            </motion.div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{r.name}</p>
                              <p className="text-xs text-gray-400">{r.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-1 ml-9">
                            <Phone className="w-3 h-3 text-gray-300" />
                            <span className="text-xs text-gray-400">{r.contact}</span>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-pink-400" />
                            <span className="text-xs font-semibold text-gray-700">{formatDate(r.date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-pink-400" />
                            <span className="text-xs text-gray-500">
                              {r.start_time} · {r.hours}hr{r.hours > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400">Total:</span>
                            <motion.span
                              key={r.total}
                              initial={{ scale: 1.2, color: "#ec4899" }}
                              animate={{ scale: 1, color: "#ec4899" }}
                              transition={{ type: "spring", stiffness: 400 }}
                              className="text-xs font-bold text-pink-500"
                            >
                              ₱{r.total.toLocaleString()}
                            </motion.span>
                          </div>
                        </div>

                        {/* Booked at */}
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-gray-400">Booked on</p>
                          <p className="text-xs text-gray-600 font-medium">{formatBookedAt(r.booked_at)}</p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2">
                        <motion.span
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: idx * 0.05 + 0.25, type: "spring", stiffness: 400 }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.badge}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </motion.span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationsPage;