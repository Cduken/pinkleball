// components/admin/TournamentDetailDrawer.tsx
import { Users, X, Trash2, Swords, Play, Loader2 } from "lucide-react";
import { AdminBracketView } from "./AdminBracketView";

interface Tournament {
  id: string;
  title: string;
  status: "upcoming" | "ongoing" | "completed";
  max_participants: number;
}

interface Participant {
  id: string;
  name: string;
  seed: number;
  status: "active" | "eliminated";
}

interface Match {
  id: string;
  tournament_id: string;
  player1_id: string | null;
  player2_id: string | null;
  round: number;
  position: number;
  status: "pending" | "completed";
  player1: Participant | null;
  player2: Participant | null;
  winner_id: string | null;
  score?: string;
}

interface TournamentDetailDrawerProps {
  tournament: Tournament | null;
  participants: Participant[];
  matches: Match[];
  actionLoading: string | null;
  onClose: () => void;
  onStatusChange: (id: string, status: Tournament["status"]) => Promise<void>;
  onGenerateBracket: (id: string) => Promise<void>;
  onWinnerSelect: (matchId: string, winnerId: string) => Promise<void>;
  onUpdateScore: (matchId: string, score: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const P = {
  pink: "#f472b6",
  pinkDim: "rgba(244,114,182,0.45)",
  border: "rgba(244,114,182,0.10)",
};

const statusCfg = {
  upcoming: {
    label: "Upcoming",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.10)",
    border: "rgba(96,165,250,0.20)",
  },
  ongoing: {
    label: "Ongoing",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.10)",
    border: "rgba(74,222,128,0.20)",
  },
  completed: {
    label: "Completed",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.10)",
    border: "rgba(148,163,184,0.20)",
  },
};

export function TournamentDetailDrawer({
  tournament,
  participants,
  matches,
  actionLoading,
  onClose,
  onStatusChange,
  onGenerateBracket,
  onWinnerSelect,
  onUpdateScore,
  onDelete,
}: TournamentDetailDrawerProps) {
  if (!tournament) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-2xl h-full flex flex-col overflow-y-auto"
        style={{
          background: "linear-gradient(160deg,#110d16,#0a0610)",
          borderLeft: `1px solid ${P.border}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: `1px solid ${P.border}` }}
        >
          <div>
            <p
              className="text-white font-black text-lg"
              style={{ letterSpacing: "-0.03em" }}
            >
              {tournament.title}
            </p>
            <p
              className="text-xs font-mono mt-0.5"
              style={{ color: P.pinkDim }}
            >
              {tournament.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ color: P.pinkDim }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = P.pinkDim)}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 flex flex-col gap-6">
          {/* Status Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Status:
            </span>
            {(["upcoming", "ongoing", "completed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(tournament.id, s)}
                disabled={actionLoading === tournament.id}
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all
                  ${tournament.status === s ? "ring-2 ring-offset-1 ring-offset-black" : ""}
                `}
                style={{
                  background:
                    tournament.status === s ? statusCfg[s].bg : "transparent",
                  border: `1px solid ${statusCfg[s].border}`,
                  color: statusCfg[s].color,
                }}
              >
                {actionLoading === tournament.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  s
                )}
              </button>
            ))}
          </div>

          {/* Generate Bracket Button */}
          {tournament.status === "upcoming" && (
            <button
              onClick={() => onGenerateBracket(tournament.id)}
              disabled={
                actionLoading === tournament.id ||
                participants.length < tournament.max_participants
              }
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all"
              style={{
                background:
                  participants.length >= tournament.max_participants
                    ? "linear-gradient(135deg,#f59e0b,#d97706)"
                    : "rgba(255,255,255,0.05)",
                color:
                  participants.length >= tournament.max_participants
                    ? "#fff"
                    : "rgba(255,255,255,0.2)",
                border: `1px solid ${P.border}`,
              }}
            >
              {actionLoading === tournament.id ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Play size={14} /> Generate Bracket & Start Tournament
                </>
              )}
            </button>
          )}

          {/* Participants Section */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Users size={14} style={{ color: P.pink }} />
              Participants ({participants.length}/{tournament.max_participants})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background:
                      p.status === "eliminated"
                        ? "rgba(251,113,133,0.05)"
                        : "rgba(244,114,182,0.07)",
                    border: `1px solid ${P.border}`,
                    color:
                      p.status === "eliminated"
                        ? "rgba(255,255,255,0.3)"
                        : "#fff",
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: P.pink }}
                  >
                    #{p.seed}
                  </span>
                  <span
                    className={p.status === "eliminated" ? "line-through" : ""}
                  >
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bracket Section */}
          {matches.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Swords size={14} style={{ color: P.pink }} />
                Tournament Bracket
              </h3>
              <AdminBracketView
                matches={matches}
                participants={participants}
                onWinnerSelect={onWinnerSelect}
                onUpdateScore={onUpdateScore}
              />
            </div>
          )}

          {/* Delete Button */}
          <button
            onClick={() => onDelete(tournament.id)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all mt-auto"
            style={{
              background: "rgba(251,113,133,0.08)",
              border: "1px solid rgba(251,113,133,0.18)",
              color: "#fb7185",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(251,113,133,0.16)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(251,113,133,0.08)")
            }
          >
            <Trash2 size={13} /> Delete Tournament
          </button>
        </div>
      </div>
    </div>
  );
}