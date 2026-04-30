/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/TournamentCard.tsx
import { Trash2 } from "lucide-react";

interface Tournament {
  id: string;
  title: string;
  date: string;
  time: string;
  status: "upcoming" | "ongoing" | "completed";
  entry_fee: number;
  max_participants: number;
  participants?: any[];
}

interface TournamentCardProps {
  tournament: Tournament;
  onClick: () => void;
  onDelete: (id: string) => void;
}

const statusCfg = {
  upcoming: {
    label: "Upcoming",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.10)",
  },
  ongoing: {
    label: "Ongoing",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.10)",
  },
  completed: {
    label: "Completed",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.10)",
  },
};

const P = {
  pinkDim: "rgba(244,114,182,0.45)",
  border: "rgba(244,114,182,0.10)",
  card: "rgba(17,13,22,0.7)",
};

export function TournamentCard({ tournament, onClick, onDelete }: TournamentCardProps) {
  const cfg = statusCfg[tournament.status];

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02] cursor-pointer"
      style={{ background: P.card, border: `1px solid ${P.border}` }}
      onClick={onClick}
    >
      <div className="h-1" style={{ background: cfg.color }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p
              className="text-white font-black text-lg"
              style={{ letterSpacing: "-0.03em" }}
            >
              {tournament.title}
            </p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(tournament.id);
              }}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: "rgba(251,113,133,0.4)",
                background: "rgba(251,113,133,0.06)",
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <p
          className="text-xs mb-4"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {new Date(tournament.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          • {tournament.time}
        </p>

        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "rgba(255,255,255,0.2)" }}>
            {tournament.participants?.length || 0}/{tournament.max_participants} players
          </span>
          <span style={{ color: P.pinkDim }}>₱{tournament.entry_fee}</span>
        </div>
      </div>
    </div>
  );
}