//Admin/Tournaments.tsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Trophy,
  Plus,
  Users,
  CalendarDays,
  MapPin,
  X,
  Check,
  Trash2,
  Edit3,
  Crown,
  Medal,
  Swords,
  RefreshCw,
  Play,
  Loader2,
  ArrowUp,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { supabase } from "../../lib/supabase";

type TStatus = "upcoming" | "ongoing" | "completed";

interface Tournament {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  prize_pool: string;
  entry_fee: number;
  status: TStatus;
  max_participants: number;
  created_at: string;
}

interface Participant {
  id: string;
  tournament_id: string;
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

const P = {
  pink: "#f472b6",
  pinkDim: "rgba(244,114,182,0.45)",
  pinkGhost: "rgba(244,114,182,0.07)",
  border: "rgba(244,114,182,0.10)",
  card: "rgba(17,13,22,0.7)",
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

const emptyForm = {
  title: "",
  description: "",
  date: "",
  time: "5:00 PM",
  location: "Cahayag Court, Tubigon, Bohol",
  prize_pool: "",
  entry_fee: 200,
  max_participants: 8,
};

const inputStyle = {
  background: "rgba(10,5,14,0.9)",
  border: "1px solid rgba(244,114,182,0.12)",
  color: "#fff",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 13,
  outline: "none",
  width: "100%",
};

// Bracket Component for Admin
const AdminBracketView = ({
  matches,
  participants,
  onWinnerSelect,
  onUpdateScore,
}: {
  matches: Match[];
  participants: Participant[];
  onWinnerSelect: (matchId: string, winnerId: string) => Promise<void>;
  onUpdateScore: (matchId: string, score: string) => Promise<void>;
}) => {
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
};

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Tournament | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch tournaments
  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setTournaments(data || []);
    } catch (err) {
      console.error("Error fetching tournaments:", err);
      toast.error("Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  const fetchTournamentDetails = async (tournamentId: string) => {
    try {
      const { data: pData } = await supabase
        .from("tournament_participants")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("seed", { ascending: true });

      const { data: mData } = await supabase
        .from("tournament_matches")
        .select(
          `
          *,
          player1:tournament_participants!player1_id(*),
          player2:tournament_participants!player2_id(*)
        `,
        )
        .eq("tournament_id", tournamentId)
        .order("round")
        .order("position");

      setParticipants(pData || []);
      setMatches(mData || []);
    } catch (err) {
      console.error("Error fetching details:", err);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.date) {
      toast.error("Title and date are required.");
      return;
    }

    setActionLoading("create");
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .insert({
          ...form,
          status: "upcoming",
        })
        .select()
        .single();

      if (error) throw error;

      setTournaments((prev) => [data, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
      toast.success("🏆 Tournament created!");
    } catch (err) {
      toast.error("Failed to create tournament");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("tournaments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTournaments((prev) => prev.filter((t) => t.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Tournament deleted.");
    } catch (err) {
      toast.error("Failed to delete tournament");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id: string, status: TStatus) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setTournaments((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t)),
      );
      setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
      toast.success(`Status updated to ${status}!`);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

 const generateBracket = async (tournamentId: string) => {
  setActionLoading(tournamentId);
  try {
    // FIXED: Use p_tournament_id to match the function parameter
    const { error } = await supabase.rpc("generate_tournament_bracket", {
      p_tournament_id: tournamentId, // Changed from tournament_id to p_tournament_id
    });

    if (error) throw error;

    toast.success("🏆 Bracket generated!");
    fetchTournamentDetails(tournamentId);

    // Auto-start tournament
    await handleStatusChange(tournamentId, "ongoing");
  } catch (err) {
    console.error("Bracket generation error:", err);
    toast.error("Failed to generate bracket");
  } finally {
    setActionLoading(null);
  }
};

  const handleWinnerSelect = async (matchId: string, winnerId: string) => {
    try {
      const match = matches.find((m) => m.id === matchId);
      if (!match) return;

      // Update match
      const { error: matchError } = await supabase
        .from("tournament_matches")
        .update({ winner_id: winnerId, status: "completed" })
        .eq("id", matchId);

      if (matchError) throw matchError;

      // Eliminate loser
      const loserId =
        match.player1?.id === winnerId ? match.player2?.id : match.player1?.id;
      if (loserId) {
        await supabase
          .from("tournament_participants")
          .update({ status: "eliminated" })
          .eq("id", loserId);
      }

      // Advance winner to next round
      const nextRound = match.round + 1;
      const nextPosition = Math.ceil(match.position / 2);

      const { data: nextMatch } = await supabase
        .from("tournament_matches")
        .select("*")
        .eq("tournament_id", match.tournament_id)
        .eq("round", nextRound)
        .eq("position", nextPosition)
        .single();

      if (nextMatch) {
        const updateField =
          match.position % 2 === 1 ? "player1_id" : "player2_id";
        await supabase
          .from("tournament_matches")
          .update({ [updateField]: winnerId })
          .eq("id", nextMatch.id);
      }

      toast.success("✅ Winner recorded!");
      fetchTournamentDetails(match.tournament_id);
    } catch (err) {
      toast.error("Failed to update winner");
    }
  };

  const handleUpdateScore = async (matchId: string, score: string) => {
    try {
      const { error } = await supabase
        .from("tournament_matches")
        .update({ score })
        .eq("id", matchId);

      if (error) throw error;

      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, score } : m)),
      );
    } catch (err) {
      toast.error("Failed to update score");
    }
  };

  return (
    <AdminLayout title="Tournaments" subtitle="Manage and create tournaments">
      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setSelected(null);
              setParticipants([]);
              setMatches([]);
            }}
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
                  {selected.title}
                </p>
                <p
                  className="text-xs font-mono mt-0.5"
                  style={{ color: P.pinkDim }}
                >
                  {selected.id}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelected(null);
                  setParticipants([]);
                  setMatches([]);
                }}
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
                {(["upcoming", "ongoing", "completed"] as TStatus[]).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selected.id, s)}
                      disabled={actionLoading === selected.id}
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all
                      ${selected.status === s ? "ring-2 ring-offset-1 ring-offset-black" : ""}
                    `}
                      style={{
                        background:
                          selected.status === s
                            ? statusCfg[s].bg
                            : "transparent",
                        border: `1px solid ${statusCfg[s].border}`,
                        color: statusCfg[s].color,
                      }}
                    >
                      {actionLoading === selected.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        s
                      )}
                    </button>
                  ),
                )}
              </div>

              {/* Generate Bracket Button */}
              {selected.status === "upcoming" && (
                <button
                  onClick={() => generateBracket(selected.id)}
                  disabled={
                    actionLoading === selected.id ||
                    participants.length < selected.max_participants
                  }
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all"
                  style={{
                    background:
                      participants.length >= selected.max_participants
                        ? "linear-gradient(135deg,#f59e0b,#d97706)"
                        : "rgba(255,255,255,0.05)",
                    color:
                      participants.length >= selected.max_participants
                        ? "#fff"
                        : "rgba(255,255,255,0.2)",
                    border: `1px solid ${P.border}`,
                  }}
                >
                  {actionLoading === selected.id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />{" "}
                      Generating...
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
                  Participants ({participants.length}/
                  {selected.max_participants})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {participants.map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                      style={{
                        background:
                          p.status === "eliminated"
                            ? "rgba(251,113,133,0.05)"
                            : P.pinkGhost,
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
                        className={
                          p.status === "eliminated" ? "line-through" : ""
                        }
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
                    onWinnerSelect={handleWinnerSelect}
                    onUpdateScore={handleUpdateScore}
                  />
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(selected.id)}
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
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div
            className="relative w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg,#110d16,#0a0610)",
              border: `1px solid ${P.border}`,
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: `1px solid ${P.border}` }}
            >
              <p
                className="text-white font-black"
                style={{ letterSpacing: "-0.03em" }}
              >
                New Tournament
              </p>
              <button
                onClick={() => setShowForm(false)}
                style={{ color: P.pinkDim }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {[
                {
                  label: "Title *",
                  key: "title",
                  type: "text",
                  placeholder: "e.g. PinkleBall Open 2026",
                },
                {
                  label: "Description",
                  key: "description",
                  type: "text",
                  placeholder: "Brief description…",
                },
                { label: "Date *", key: "date", type: "date", placeholder: "" },
                {
                  label: "Time",
                  key: "time",
                  type: "text",
                  placeholder: "5:00 PM",
                },
                {
                  label: "Location",
                  key: "location",
                  type: "text",
                  placeholder: "Court address",
                },
                {
                  label: "Prize Pool",
                  key: "prize_pool",
                  type: "text",
                  placeholder: "₱10,000",
                },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label
                    className="block text-[10px] uppercase tracking-widest font-bold mb-1.5"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(form as any)[key] as string}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.border =
                        "1px solid rgba(244,114,182,0.5)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(244,114,182,0.08)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border =
                        "1px solid rgba(244,114,182,0.12)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-[10px] uppercase tracking-widest font-bold mb-1.5"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    Entry Fee (₱)
                  </label>
                  <input
                    type="number"
                    value={form.entry_fee}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        entry_fee: Number(e.target.value),
                      }))
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    className="block text-[10px] uppercase tracking-widest font-bold mb-1.5"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    Max Players
                  </label>
                  <input
                    type="number"
                    value={form.max_participants}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        max_participants: Number(e.target.value),
                      }))
                    }
                    style={inputStyle}
                  />
                </div>
              </div>
              <button
                onClick={handleCreate}
                disabled={actionLoading === "create"}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all mt-2 text-white"
                style={{
                  background: "linear-gradient(135deg,#be185d,#ec4899)",
                  boxShadow: "0 4px 20px rgba(236,72,153,0.3)",
                }}
              >
                {actionLoading === "create" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Trophy size={14} /> Create Tournament
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: tournaments.length, color: P.pink },
          {
            label: "Upcoming",
            value: tournaments.filter((t) => t.status === "upcoming").length,
            color: "#60a5fa",
          },
          {
            label: "Ongoing",
            value: tournaments.filter((t) => t.status === "ongoing").length,
            color: "#4ade80",
          },
          {
            label: "Completed",
            value: tournaments.filter((t) => t.status === "completed").length,
            color: "#94a3b8",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl p-5"
            style={{ background: `${color}0d`, border: `1px solid ${color}25` }}
          >
            <p
              className="text-2xl font-black text-white mb-0.5"
              style={{ letterSpacing: "-0.05em" }}
            >
              {value}
            </p>
            <p
              className="text-[11px] font-semibold"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          {loading
            ? "Loading..."
            : `${tournaments.length} tournament${tournaments.length !== 1 ? "s" : ""}`}
        </p>
        <div className="flex gap-2">
          <button
            onClick={fetchTournaments}
            className="p-2 rounded-xl transition-colors cursor-pointer"
            style={{ color: P.pinkDim, background: P.pinkGhost }}
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white cursor-pointer transition-all"
            style={{
              background: "linear-gradient(135deg,#be185d,#ec4899)",
              boxShadow: "0 4px 20px rgba(236,72,153,0.25)",
            }}
          >
            <Plus size={15} /> New Tournament
          </button>
        </div>
      </div>

      {/* Tournament Cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: P.pinkDim }}
          />
        </div>
      ) : tournaments.length === 0 ? (
        <div
          className="rounded-2xl p-16 flex flex-col items-center gap-3 text-center"
          style={{ border: `1px solid ${P.border}`, background: P.card }}
        >
          <Trophy size={28} style={{ color: "rgba(244,114,182,0.15)" }} />
          <p
            className="text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            No tournaments yet
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer"
            style={{ background: "linear-gradient(135deg,#be185d,#ec4899)" }}
          >
            Create one
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournaments.map((t) => {
            const cfg = statusCfg[t.status];
            return (
              <div
                key={t.id}
                className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02] cursor-pointer"
                style={{ background: P.card, border: `1px solid ${P.border}` }}
                onClick={() => {
                  setSelected(t);
                  fetchTournamentDetails(t.id);
                }}
              >
                <div className="h-1" style={{ background: cfg.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p
                        className="text-white font-black text-lg"
                        style={{ letterSpacing: "-0.03em" }}
                      >
                        {t.title}
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
                          handleDelete(t.id);
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
                    {new Date(t.date + "T00:00:00").toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}{" "}
                    • {t.time}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: "rgba(255,255,255,0.2)" }}>
                      {t.participants?.length || 0}/{t.max_participants} players
                    </span>
                    <span style={{ color: P.pinkDim }}>₱{t.entry_fee}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
