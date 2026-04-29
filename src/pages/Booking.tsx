//Booking.tsx
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
//Booking.tsx page
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  PhilippinePeso,
  Loader2,
} from "lucide-react";
import MainLogo from "../components/MainLogo/MainLogo";
import { supabase } from "../lib/supabase";

// ── Time slots: 5:00 PM → 4:00 AM (last bookable start, ends by 5 AM) ────────
const timeSlots = [
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM",
  "1:00 AM",
  "2:00 AM",
  "3:00 AM",
  "4:00 AM",
];

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

const HOURLY_RATE = 250;

// ── Time helpers ──────────────────────────────────────────────────────────────
function timeToMinutes(t: string): number {
  const [timePart, meridiem] = t.split(" ");
  let [h, m] = timePart.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const total = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  const meridiem = h < 12 ? "AM" : "PM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, "0")} ${meridiem}`;
}

function getEndTime(startTime: string, durationHours: number): string {
  return minutesToTime(timeToMinutes(startTime) + durationHours * 60);
}

function getMaxHours(startTime: string): number {
  const startMins = timeToMinutes(startTime);
  const endLimit = 5 * 60; // 5:00 AM = 300 mins

  // Calculate available minutes until 5 AM
  let availableMinutes;
  if (startMins >= 17 * 60) {
    // 5 PM or later
    // From start time to midnight, then to 5 AM
    availableMinutes = 24 * 60 - startMins + endLimit;
  } else {
    // Early morning hours (12 AM to 4 AM)
    availableMinutes = endLimit - startMins;
  }

  return Math.min(Math.floor(availableMinutes / 60), 12);
}

// FIXED: Proper overlap detection for time slots, especially across midnight
function isTimeSlotAvailable(
  slotStart: string,
  bookedSlots: Array<{ start_time: string; hours: number }>,
  durationHours: number = 1,
): boolean {
  if (bookedSlots.length === 0) return true;

  const slotStartMins = timeToMinutes(slotStart);
  const slotEndMinsRaw = slotStartMins + durationHours * 60;

  // Normalize end time for comparison (handle wrapping past midnight)
  // We need to consider two cases for ending time:
  // 1. If it ends before midnight (or at midnight)
  // 2. If it wraps past midnight

  for (const booked of bookedSlots) {
    const bookedStartMins = timeToMinutes(booked.start_time);
    const bookedEndMinsRaw = bookedStartMins + booked.hours * 60;

    // Check for overlap considering the booking window (5 PM to 5 AM next day)
    // We need to check if the time ranges overlap within the operating hours

    // Simple direct overlap check (both within same day or before midnight)
    let slotStart = slotStartMins;
    let slotEnd = slotEndMinsRaw;
    let bookedStart = bookedStartMins;
    let bookedEnd = bookedEndMinsRaw;

    // Check if there's an overlap
    // An overlap exists if: slotStart < bookedEnd AND slotEnd > bookedStart
    if (slotStart < bookedEnd && slotEnd > bookedStart) {
      return false;
    }

    // Also check for the special case where one booking wraps past midnight
    // by checking with adjusted times (add 24 hours to one set for comparison)
    if (slotEndMinsRaw > 24 * 60 || bookedEndMinsRaw > 24 * 60) {
      // Check with slot shifted forward by 24 hours
      if (slotStart + 24 * 60 < bookedEnd && slotEnd + 24 * 60 > bookedStart) {
        return false;
      }

      // Check with booked shifted forward by 24 hours
      if (slotStart < bookedEnd + 24 * 60 && slotEnd > bookedStart + 24 * 60) {
        return false;
      }
    }
  }

  return true;
}

// Check if a specific time slot button should be disabled
function shouldDisableTimeSlot(
  slotStart: string,
  bookedSlots: Array<{ start_time: string; hours: number }>,
): boolean {
  if (bookedSlots.length === 0) return false;

  return !isTimeSlotAvailable(slotStart, bookedSlots, 1);
}

// ── Parse ?date=YYYY-MM-DD from URL ──────────────────────────────────────────
function parseDateParam(param: string | null): Date | null {
  if (!param) return null;
  const [y, m, d] = param.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  // Reject past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return null;
  return date;
}

// ── Generate booking ID ───────────────────────────────────────────────────────
async function generateBookingId(): Promise<string> {
  const { count, error } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  const next = (count ?? 0) + 1;
  return `PB-${String(next).padStart(3, "0")}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────
const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const today = new Date();

  // Pre-fill date from ?date= query param (passed by Availability page)
  const preselectedDate = parseDateParam(searchParams.get("date"));

  const [currentMonth, setCurrentMonth] = useState(
    preselectedDate ? preselectedDate.getMonth() : today.getMonth(),
  );
  const [currentYear, setCurrentYear] = useState(
    preselectedDate ? preselectedDate.getFullYear() : today.getFullYear(),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    preselectedDate,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [hours, setHours] = useState(1);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New state for booked slots
  const [bookedSlots, setBookedSlots] = useState<
    Array<{ start_time: string; hours: number }>
  >([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Fetch existing bookings when selected date changes
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }

    const fetchBookings = async () => {
      setLoadingAvailability(true);
      const pad = (n: number) => String(n).padStart(2, "0");
      const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;

      try {
        const { data, error } = await supabase
          .from("reservations")
          .select("start_time, hours, status")
          .eq("date", dateStr)
          .eq("status", "pending");

        if (error) throw error;

        const booked = (data || []).map((booking) => ({
          start_time: booking.start_time,
          hours: booking.hours,
        }));

        setBookedSlots(booked);

        // If current selected time is no longer available, clear it
        if (selectedTime && !isTimeSlotAvailable(selectedTime, booked, hours)) {
          setSelectedTime(null);
          toast.error(
            "This time slot is no longer available. Please select another time.",
            {
              duration: 3000,
            },
          );
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookedSlots([]);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchBookings();
  }, [selectedDate]); // Remove selectedTime from dependency array to avoid unnecessary refetches

  // Check if selected time is still valid when hours change
  useEffect(() => {
    if (!selectedTime || bookedSlots.length === 0) return;

    const isStillAvailable = isTimeSlotAvailable(
      selectedTime,
      bookedSlots,
      hours,
    );

    if (!isStillAvailable) {
      toast.error(
        `The selected time slot (${selectedTime} for ${hours} hour${hours > 1 ? "s" : ""}) is no longer available. Please select another time or duration.`,
        { duration: 4000 },
      );
      setSelectedTime(null);
    }
  }, [hours]); // Only depend on hours changes

  // ── Calendar helpers ────────────────────────────────────────────────────────
  const getDaysInMonth = (m: number, y: number) =>
    new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m: number, y: number) =>
    new Date(y, m, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const isPast = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };
  const isSelected = (day: number) =>
    selectedDate?.getDate() === day &&
    selectedDate?.getMonth() === currentMonth &&
    selectedDate?.getFullYear() === currentYear;
  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === currentMonth &&
    today.getFullYear() === currentYear;

  // ── Time selection ──────────────────────────────────────────────────────────
  const handleTimeSelect = (slot: string) => {
    // Check if the slot is available (not fully booked)
    if (shouldDisableTimeSlot(slot, bookedSlots)) {
      toast.error("This time slot is already fully booked.");
      return;
    }

    setSelectedTime(slot);
    const max = getMaxHours(slot);
    if (hours > max) setHours(max);
  };

  const maxHours = selectedTime ? getMaxHours(selectedTime) : 12;
  const endTime = selectedTime ? getEndTime(selectedTime, hours) : null;
  const totalCost = HOURLY_RATE * hours;

  // Check if the selected time with current duration is available
  const isSelectedTimeValid = useCallback(() => {
    if (!selectedTime || !selectedDate) return true;
    return isTimeSlotAvailable(selectedTime, bookedSlots, hours);
  }, [selectedTime, bookedSlots, hours, selectedDate]);

  const canSubmit =
    !submitting &&
    !!selectedDate &&
    !!selectedTime &&
    isSelectedTimeValid() &&
    name.trim() !== "" &&
    contact.trim() !== "";

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit || !selectedDate || !selectedTime) return;

    // Double-check availability before submitting
    if (!isTimeSlotAvailable(selectedTime, bookedSlots, hours)) {
      toast.error(
        "This time slot is no longer available. Please select another time.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const bookingId = await generateBookingId();
      const pad = (n: number) => String(n).padStart(2, "0");
      const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;

      const { error } = await supabase.from("reservations").insert({
        id: bookingId,
        name: name.trim(),
        contact: contact.trim(),
        date: dateStr,
        start_time: selectedTime,
        hours,
        status: "pending",
        total: totalCost,
      });

      if (error) {
        // Check if it's a duplicate error
        if (error.message.includes("duplicate") || error.code === "23505") {
          toast.error(
            "This time slot was just booked by someone else. Please select another time.",
          );
          // Refresh availability
          const pad2 = (n: number) => String(n).padStart(2, "0");
          const dateStr2 = `${selectedDate.getFullYear()}-${pad2(selectedDate.getMonth() + 1)}-${pad2(selectedDate.getDate())}`;
          const { data: freshData } = await supabase
            .from("reservations")
            .select("start_time, hours, status")
            .eq("date", dateStr2)
            .eq("status", "pending");

          const freshBooked = (freshData || []).map((booking) => ({
            start_time: booking.start_time,
            hours: booking.hours,
          }));
          setBookedSlots(freshBooked);
          setSelectedTime(null);
        } else {
          throw new Error(error.message);
        }
        return;
      }

      toast.success(
        `Booking submitted! Your ID is ${bookingId}. We'll confirm your slot on ${selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} at ${selectedTime} ❤️`,
        { duration: 6000 },
      );
      setTimeout(() => navigate("/"), 3000);
    } catch (err: unknown) {
      toast.error(
        (err as Error).message ?? "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Check which time slots are fully booked (no availability at all)


  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-100 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-pink-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <MainLogo />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Book a <span className="text-pink-500">Court</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Fill in the details below to reserve your slot.
          </p>

          {/* Info badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="inline-flex items-center gap-1.5 bg-white border border-pink-100 rounded-full px-3 py-1.5 shadow-sm">
              <PhilippinePeso className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-xs font-semibold text-gray-700">
                ₱250{" "}
                <span className="text-gray-400 font-normal">
                  / hour per court
                </span>
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-pink-100 rounded-full px-3 py-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-xs font-semibold text-gray-700">
                Open <span className="text-pink-500">5:00 PM – 5:00 AM</span>
              </span>
            </div>
          </div>

          {/* Pre-selected date banner — shown when coming from Availability page */}
          {preselectedDate && (
            <div className="mt-4 inline-flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-xl px-4 py-2.5">
              <CalendarDays className="w-4 h-4 text-pink-500" />
              <span className="text-sm text-gray-700">
                Booking for{" "}
                <span className="font-bold text-pink-500">
                  {preselectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Left Column ── */}
          <div className="flex flex-col gap-6">
            {/* Calendar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-4 h-4 text-pink-500" />
                <h2 className="font-bold text-gray-800 text-sm">Select Date</h2>
              </div>

              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded-lg hover:bg-pink-50 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <span className="font-bold text-gray-800 text-sm">
                  {MONTHS[currentMonth]} {currentYear}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 rounded-lg hover:bg-pink-50 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs text-gray-400 font-medium py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const past = isPast(day);
                  const selected = isSelected(day);
                  const tod = isToday(day);
                  return (
                    <button
                      key={day}
                      disabled={past}
                      onClick={() =>
                        setSelectedDate(
                          new Date(currentYear, currentMonth, day),
                        )
                      }
                      className={`
                        aspect-square rounded-xl text-xs font-medium transition cursor-pointer
                        ${past ? "text-gray-300 cursor-not-allowed" : "hover:bg-pink-50"}
                        ${selected ? "bg-gradient-to-br from-pink-500 to-pink-400 text-white shadow-md" : ""}
                        ${tod && !selected ? "border border-pink-300 text-pink-500" : ""}
                        ${!selected && !tod && !past ? "text-gray-700" : ""}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <p className="text-xs text-pink-500 font-medium mt-3 text-center">
                  ✓{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
              <h2 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-pink-500" />
                Your Details
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Juan dela Cruz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Contact Number
                    </span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 09123456789"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="flex flex-col gap-6">
            {/* Time Slots */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-pink-500" />
                <h2 className="font-bold text-gray-800 text-sm">
                  Select Start Time
                </h2>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Available from 5:00 PM to 5:00 AM
              </p>

              {loadingAvailability ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">
                    Checking availability...
                  </span>
                </div>
              ) : (
                <>
                  {bookedSlots.length === timeSlots.length && selectedDate && (
                    <div className="text-center py-8 bg-yellow-50 rounded-xl">
                      <p className="text-sm text-yellow-700">
                        All time slots are fully booked for this date.
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Please select another date.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => {
                      const isFullyBooked = shouldDisableTimeSlot(
                        slot,
                        bookedSlots,
                      );
                      const isSelected = selectedTime === slot;

                      return (
                        <button
                          key={slot}
                          onClick={() =>
                            !isFullyBooked && handleTimeSelect(slot)
                          }
                          disabled={isFullyBooked}
                          className={`
                            py-2.5 px-2 rounded-xl text-xs font-medium transition-all duration-200 relative
                            ${
                              isFullyBooked
                                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60"
                                : isSelected
                                  ? "bg-gradient-to-r from-pink-500 to-pink-400 text-white border-transparent shadow-md scale-105"
                                  : "bg-white border border-gray-200 text-gray-700 hover:border-pink-400 hover:text-pink-600 hover:shadow-md hover:scale-105 cursor-pointer"
                            }
                          `}
                          title={
                            isFullyBooked
                              ? "This time slot is already booked ❌"
                              : "Click to select this time slot ✓"
                          }
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{slot}</span>
                            {isFullyBooked && (
                              <span className="text-[10px] mt-0.5 text-red-400">
                                Booked
                              </span>
                            )}
                          </div>
                          {isFullyBooked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-0.5 bg-red-300 rotate-45 transform origin-center"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-pink-400 rounded-full"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-gray-200 rounded"></div>
                      <span className="line-through">Booked</span>
                    </div>
                  </div>

                  {bookedSlots.length > 0 && (
                    <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <span className="font-medium text-gray-700">
                        Currently Booked Slots:
                      </span>
                      <div className="mt-2 space-y-1">
                        {bookedSlots.map((booking, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            {booking.start_time} →{" "}
                            {getEndTime(booking.start_time, booking.hours)}
                            <span className="text-pink-500 ml-1">
                              ({booking.hours}h)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Duration */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-pink-500" />
                  <h2 className="font-bold text-gray-800 text-sm">Duration</h2>
                </div>
                <span className="text-xs text-gray-400">
                  ₱250 × {hours}hr ={" "}
                  <span className="text-pink-500 font-bold">
                    ₱{totalCost.toLocaleString()}
                  </span>
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                {selectedTime
                  ? `Max ${maxHours} hour${maxHours > 1 ? "s" : ""} from ${selectedTime} (ends by 5:00 AM)`
                  : "How many hours do you need the court?"}
              </p>

              <div className="flex items-center gap-4 justify-center">
                <button
                  onClick={() => setHours((h) => Math.max(1, h - 1))}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-pink-400 hover:text-pink-500 transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <span className="text-4xl font-extrabold text-gray-800">
                    {hours}
                  </span>
                  <p className="text-xs text-gray-400">
                    hour{hours > 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setHours((h) => Math.min(maxHours, h + 1))}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-pink-400 hover:text-pink-500 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 mt-4 justify-center flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                  .filter((h) => h <= maxHours)
                  .map((h) => (
                    <button
                      key={h}
                      onClick={() => setHours(h)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer
                      ${
                        hours === h
                          ? "bg-pink-500 text-white border-transparent"
                          : "border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500"
                      }
                    `}
                    >
                      {h}h
                    </button>
                  ))}
              </div>

              {selectedTime && endTime && (
                <div className="mt-4 flex items-center justify-center gap-2 bg-pink-50 rounded-xl px-4 py-2.5">
                  <Clock className="w-3.5 h-3.5 text-pink-400" />
                  <span className="text-xs text-gray-600">
                    <span className="font-semibold text-pink-500">
                      {selectedTime}
                    </span>
                    {" → "}
                    <span className="font-semibold text-pink-500">
                      {endTime}
                    </span>
                  </span>
                </div>
              )}

              {selectedTime && !isSelectedTimeValid() && (
                <div className="mt-3 text-xs text-red-500 text-center bg-red-50 rounded-lg p-2">
                  ⚠️ This duration conflicts with an existing booking. Please
                  select a different time or shorter duration.
                </div>
              )}
            </div>

            {/* Summary & Submit */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
              <h2 className="font-bold text-gray-800 text-sm mb-4">
                Booking Summary
              </h2>
              <div className="flex flex-col gap-2 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>
                  <span className="font-medium text-gray-700">
                    {selectedDate ? (
                      selectedDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    ) : (
                      <span className="text-gray-300">Not selected</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Time</span>
                  <span className="font-medium text-gray-700">
                    {selectedTime ?? (
                      <span className="text-gray-300">Not selected</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">End Time</span>
                  <span className="font-medium text-gray-700">
                    {endTime ?? <span className="text-gray-300">—</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="font-medium text-gray-700">
                    {hours} hour{hours > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Name</span>
                  <span className="font-medium text-gray-700">
                    {name || <span className="text-gray-300">Not filled</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contact</span>
                  <span className="font-medium text-gray-700">
                    {contact || (
                      <span className="text-gray-300">Not filled</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-pink-100 pt-3 mb-5">
                <span className="text-sm font-bold text-gray-700">Total</span>
                <span className="text-lg font-extrabold text-pink-500">
                  ₱{totalCost.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2
                  ${
                    canSubmit
                      ? "bg-gradient-to-r from-pink-500 to-pink-400 text-white hover:opacity-90 cursor-pointer"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }
                `}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
              <p className="text-xs text-center text-gray-300 mt-3">
                No account needed ❤️
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
