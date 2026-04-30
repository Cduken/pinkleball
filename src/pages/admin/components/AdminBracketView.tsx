// components/admin/AdminBracketView.tsx
import { Crown, Check } from "lucide-react";

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
  player1: Participant | null;
  player2: Participant | null;
  winner_id: string | null;
  round: number;
  position: number;
  score?: string;
  status: "pending" | "completed";
}

interface AdminBracketViewProps {
  matches: Match[];
  participants: Participant[];
  onWinnerSelect: (matchId: string, winnerId: string) => Promise<void>;
  onUpdateScore: (matchId: string, score: string) => Promise<void>;
}

const P = {
  pink: "#f472b6",
  pinkDim: "rgba(244,114,182,0.45)",
  border: "rgba(244,114,182,0.10)",
};

export function AdminBracketView({
  matches,
  onWinnerSelect,
  onUpdateScore,
}: AdminBracketViewProps) {
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort();
  const roundLabels: Record<number, string> = {
    1: "Quarterfinals",
    2: "Semifinals",
    3: "Finals",
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 min-w-max">
        {rounds.map((round) => {
          const roundMatches = matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.position - b.position);

          return (
            <div key={round} className="flex-1 min-w-[200px]">
              <div className="text-center mb-4">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(244,114,182,0.1)",
                    color: P.pinkDim,
                    border: `1px solid ${P.border}`,
                  }}
                >
                  {roundLabels[round] || `Round ${round}`}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {roundMatches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-xl p-3"
                    style={{
                      background:
                        match.status === "completed"
                          ? "rgba(74,222,128,0.05)"
                          : "rgba(244,114,182,0.03)",
                      border: `1px solid ${P.border}`,
                    }}
                  >
                    {/* Player 1 */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-medium"
                        style={{
                          background:
                            match.winner_id === match.player1?.id
                              ? "linear-gradient(135deg,rgba(251,191,36,0.2),rgba(245,158,11,0.1))"
                              : "transparent",
                          color: match.player1
                            ? "#fff"
                            : "rgba(255,255,255,0.2)",
                        }}
                      >
                        {match.player1 ? (
                          <div className="flex items-center justify-between">
                            <span>{match.player1.name}</span>
                            <div className="flex items-center gap-2">
                              {match.status === "pending" && match.player2 && (
                                <button
                                  onClick={() =>
                                    onWinnerSelect(match.id, match.player1!.id)
                                  }
                                  className="p-1 rounded bg-green-500/10 hover:bg-green-500/20 transition"
                                  title="Select as winner"
                                >
                                  <Check size={12} className="text-green-400" />
                                </button>
                              )}
                              {match.winner_id === match.player1?.id && (
                                <Crown size={12} className="text-yellow-400" />
                              )}
                            </div>
                          </div>
                        ) : (
                          "TBD"
                        )}
                      </div>
                    </div>

                    {/* VS */}
                    <div className="flex items-center gap-2 px-2 mb-2">
                      <div
                        className="flex-1 h-px"
                        style={{ background: P.border }}
                      />
                      <span
                        className="text-[9px] font-bold"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                      >
                        VS
                      </span>
                      <div
                        className="flex-1 h-px"
                        style={{ background: P.border }}
                      />
                    </div>

                    {/* Player 2 */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-medium"
                        style={{
                          background:
                            match.winner_id === match.player2?.id
                              ? "linear-gradient(135deg,rgba(251,191,36,0.2),rgba(245,158,11,0.1))"
                              : "transparent",
                          color: match.player2
                            ? "#fff"
                            : "rgba(255,255,255,0.2)",
                        }}
                      >
                        {match.player2 ? (
                          <div className="flex items-center justify-between">
                            <span>{match.player2.name}</span>
                            <div className="flex items-center gap-2">
                              {match.status === "pending" && match.player1 && (
                                <button
                                  onClick={() =>
                                    onWinnerSelect(match.id, match.player2!.id)
                                  }
                                  className="p-1 rounded bg-green-500/10 hover:bg-green-500/20 transition"
                                  title="Select as winner"
                                >
                                  <Check size={12} className="text-green-400" />
                                </button>
                              )}
                              {match.winner_id === match.player2?.id && (
                                <Crown size={12} className="text-yellow-400" />
                              )}
                            </div>
                          </div>
                        ) : (
                          "TBD"
                        )}
                      </div>
                    </div>

                    {/* Score Input */}
                    {match.status === "completed" && (
                      <input
                        type="text"
                        placeholder="Score (e.g., 11-7, 11-4)"
                        value={match.score || ""}
                        onChange={(e) =>
                          onUpdateScore(match.id, e.target.value)
                        }
                        className="w-full px-3 py-1.5 rounded-lg text-xs"
                        style={{
                          background: "rgba(0,0,0,0.3)",
                          border: `1px solid ${P.border}`,
                          color: "rgba(255,255,255,0.7)",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}