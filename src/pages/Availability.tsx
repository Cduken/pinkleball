/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Circle,
  Loader2,
} from "lucide-react";
import MainLogo from "../components/MainLogo/MainLogo";
import { supabase } from "../lib/supabase";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ── Business logic ────────────────────────────────────────────────────────────
// Court is open 5 PM → 5 AM = 12 bookable hours per night.
// Each booking occupies `hours` slots.
// almost-full  = booked hours >= 8  (≥ 67% filled)
// fully-booked = booked hours >= 12 (all slots gone)
const TOTAL_HOURS = 12;
const ALMOST_FULL_THRESHOLD = 8;

type AvailabilityStatus = "available" | "almost-full" | "fully-booked";

const statusConfig = {
  available: {
    label: "Available",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
    hover: "hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer",
    badge: "bg-emerald-100 text-emerald-600",
  },
  "almost-full": {
    label: "Almost Full",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
    hover: "hover:bg-amber-100 hover:border-amber-300 cursor-pointer",
    badge: "bg-amber-100 text-amber-600",
  },
  "fully-booked": {
    label: "Fully Booked",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-400",
    dot: "bg-red-400",
    hover: "cursor-not-allowed opacity-60",
    badge: "bg-red-100 text-red-500",
  },
};

// ── Supabase hook ─────────────────────────────────────────────────────────────
// Returns a map of { "YYYY-MM-DD": totalBookedHours } for approved+pending bookings
function useBookedHours(year: number, month: number) {
  const [bookedHours, setBookedHours] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);

    // Query the whole month — first day to last day
    const firstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0);
    const lastDayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("reservations")
      .select("date, hours")
      .gte("date", firstDay)
      .lte("date", lastDayStr)
      .in("status", ["approved", "pending"]); // cancelled bookings free up the slot

    if (!error && data) {
      const map: Record<string, number> = {};
      for (const row of data) {
        map[row.date] = (map[row.date] ?? 0) + row.hours;
      }
      setBookedHours(map);
    }

    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Realtime: re-fetch when any reservation changes
  useEffect(() => {
    const channel = supabase
      .channel("availability-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        () => {
          fetch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch]);

  return { bookedHours, loading, refetch: fetch };
}

// ── Derive status from booked hours ──────────────────────────────────────────
function deriveStatus(hoursBooked: number): AvailabilityStatus {
  if (hoursBooked >= TOTAL_HOURS) return "fully-booked";
  if (hoursBooked >= ALMOST_FULL_THRESHOLD) return "almost-full";
  return "available";
}

// ── Page ──────────────────────────────────────────────────────────────────────
const AvailabilityPage = () => {
  const navigate = useNavigate();
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { bookedHours, loading } = useBookedHours(currentYear, currentMonth);

  const getDaysInMonth = (m: number, y: number) =>
    new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m: number, y: number) =>
    new Date(y, m, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
    setSelectedDate(null);
  };

  const isPast = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const getDateKey = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getStatus = (day: number): AvailabilityStatus | null => {
    if (isPast(day)) return null;
    const hours = bookedHours[getDateKey(day)] ?? 0;
    return deriveStatus(hours);
  };

  const getRemainingHours = (day: number): number => {
    const hours = bookedHours[getDateKey(day)] ?? 0;
    return Math.max(0, TOTAL_HOURS - hours);
  };

  const isSelected = (day: number) =>
    selectedDate?.getDate() === day &&
    selectedDate?.getMonth() === currentMonth &&
    selectedDate?.getFullYear() === currentYear;

  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === currentMonth &&
    today.getFullYear() === currentYear;

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const handleDayClick = (day: number) => {
    const status = getStatus(day);
    if (!status || status === "fully-booked" || isPast(day)) return;
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };

  const handleBookThisDay = () => {
    if (!selectedDate) return;
    const iso = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    navigate(`/book?date=${iso}`);
  };

  const selectedStatus = selectedDate
    ? getStatus(selectedDate.getDate())
    : null;
  const selectedRemainingHours = selectedDate
    ? getRemainingHours(selectedDate.getDate())
    : 0;

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-100 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-pink-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <MainLogo />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Court <span className="text-pink-500">Availability</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Pick a date to see availability and book your slot.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Calendar ── */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-pink-100 p-6">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl hover:bg-pink-50 transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-gray-800">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                {loading && (
                  <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                )}
              </div>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl hover:bg-pink-50 transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-3">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-bold text-gray-400 py-2"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const past = isPast(day);
                const status = getStatus(day);
                const selected = isSelected(day);
                const tod = isToday(day);
                const config = status ? statusConfig[status] : null;

                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`
                      relative flex flex-col items-center justify-center rounded-2xl
                      aspect-square border transition-all text-sm font-bold
                      ${past ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed" : ""}
                      ${loading && !past ? "animate-pulse bg-gray-50 border-gray-100" : ""}
                      ${!past && !loading && config ? `${config.bg} ${config.border} ${config.text} ${config.hover}` : ""}
                      ${selected ? "ring-2 ring-pink-500 ring-offset-2 scale-105 shadow-md" : ""}
                      ${tod && !selected ? "ring-2 ring-pink-300 ring-offset-1" : ""}
                    `}
                  >
                    <span>{day}</span>
                    {!past && !loading && config && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-0.5 ${config.dot}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="flex flex-col gap-4">
            {/* Legend */}
            <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-4">Legend</h3>
              <div className="flex flex-col gap-3">
                {(Object.keys(statusConfig) as AvailabilityStatus[]).map(
                  (status) => {
                    const config = statusConfig[status];
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center ${config.bg} ${config.border}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${config.dot}`}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">
                            {config.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            {status === "available" && "Slots open — book now!"}
                            {status === "almost-full" &&
                              "Only a few slots left"}
                            {status === "fully-booked" && "No slots available"}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              {/* Capacity note */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Capacity:{" "}
                  <span className="font-semibold text-gray-600">
                    {TOTAL_HOURS} hours/night
                  </span>
                  . Almost Full when ≥ {ALMOST_FULL_THRESHOLD} hrs booked.
                </p>
              </div>
            </div>

            {/* Selected date info */}
            {selectedDate && selectedStatus ? (
              <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-pink-500" />
                  <h3 className="font-bold text-gray-800 text-sm">
                    Selected Date
                  </h3>
                </div>

                <div>
                  <p className="text-xl font-extrabold text-gray-900">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {selectedDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <span
                  className={`self-start text-xs font-semibold px-3 py-1 rounded-full ${statusConfig[selectedStatus].badge}`}
                >
                  {statusConfig[selectedStatus].label}
                </span>

                {/* Hours remaining bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Hours remaining</span>
                    <span className="font-bold text-gray-700">
                      {selectedRemainingHours} / {TOTAL_HOURS} hrs
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selectedStatus === "available"
                          ? "bg-emerald-400"
                          : selectedStatus === "almost-full"
                            ? "bg-amber-400"
                            : "bg-red-400"
                      }`}
                      style={{
                        width: `${(selectedRemainingHours / TOTAL_HOURS) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-pink-50 rounded-xl p-3 text-xs text-gray-500 leading-relaxed">
                  ⏰ Court hours:{" "}
                  <span className="font-semibold text-gray-700">
                    5:00 PM – 5:00 AM
                  </span>
                </div>

                <button
                  onClick={handleBookThisDay}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-400 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition cursor-pointer"
                >
                  Book This Day
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5 flex flex-col items-center justify-center gap-3 text-center min-h-[180px]">
                <Circle className="w-8 h-8 text-pink-200" />
                <p className="text-sm text-gray-400">
                  Click an available date on the calendar to book it.
                </p>
              </div>
            )}

            {/* Court hours card */}
            <div className="bg-gradient-to-br from-pink-500 to-pink-400 rounded-2xl p-5 text-white">
              <p className="font-bold text-sm mb-1">Court Hours</p>
              <p className="text-2xl font-extrabold">5 PM – 5 AM</p>
              <p className="text-pink-100 text-xs mt-1">
                Open daily · ₱250/hour
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
