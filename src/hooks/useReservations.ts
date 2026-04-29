/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export type Status = "pending" | "approved" | "cancelled";

export interface Reservation {
  id: string;          // e.g. "PB-001"  (text primary key)
  name: string;
  contact: string;
  date: string;        // YYYY-MM-DD
  start_time: string;  // e.g. "5:00 PM"
  hours: number;
  status: Status;
  booked_at: string;   // ISO timestamp
  total: number;
}

interface UseReservationsOptions {
  /** Subscribe to realtime changes so the table stays live */
  realtime?: boolean;
}

export function useReservations(opts: UseReservationsOptions = {}) {
  const [data, setData]       = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Fetch all rows ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from("reservations")
      .select("*")
      .order("date", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setData(rows as Reservation[]);
    }
    setLoading(false);
  }, []);

  // ── Update status ───────────────────────────────────────────────────────────
  const updateStatus = useCallback(async (id: string, status: Status) => {
    const { error: err } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);

    if (err) throw new Error(err.message);

    // Optimistic local update (realtime will also fire if enabled)
    setData(prev =>
      prev.map(r => (r.id === id ? { ...r, status } : r))
    );
  }, []);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Optional realtime subscription ─────────────────────────────────────────
  useEffect(() => {
    if (!opts.realtime) return;

    const channel = supabase
      .channel("reservations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        payload => {
          if (payload.eventType === "INSERT") {
            setData(prev => [payload.new as Reservation, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setData(prev =>
              prev.map(r =>
                r.id === (payload.new as Reservation).id
                  ? (payload.new as Reservation)
                  : r
              )
            );
          } else if (payload.eventType === "DELETE") {
            setData(prev =>
              prev.filter(r => r.id !== (payload.old as Reservation).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [opts.realtime]);

  return { data, loading, error, refetch: fetchAll, updateStatus };
}