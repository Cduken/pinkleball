/* eslint-disable react-hooks/immutability */
//Tournaments.tsx public
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  Trophy,
  Users,
  CalendarDays,
  Clock,
  MapPin,
  ChevronRight,
  Medal,
  Crown,
  Swords,
  RefreshCw,
  ArrowRight,
  Check,
  X,
  Loader2,
} from "lucide-react";
import MainLogo from "../components/MainLogo/MainLogo";
import { supabase } from "../lib/supabase";

// --- Types ---
interface Participant {
  id: string;
  name: string;
  seed: number;
  status: "active" | "eliminated";
}

interface Match {
  id: string;
  tournament_id: string;
  player1: Participant | null;
  player2: Participant | null;
  winner_id: string | null;
  round: number;
  position: number;
  score?: string;
  status: "pending" | "completed";
}

interface Tournament {
  participants: any;
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  prize_pool: string;
  entry_fee: number;
  status: "upcoming" | "ongoing" | "completed";
  max_participants: number;
  created_at: string;
}

// --- Status Config ---
const statusConfig = {
  upcoming: {
    label: "Upcoming",
    badge: "bg-blue-100 text-blue-600",
    dot: "bg-blue-400",
  },
  ongoing: {
    label: "Ongoing",
    badge: "bg-emerald-100 text-emerald-600",
    dot: "bg-emerald-400",
  },
  completed: {
    label: "Completed",
    badge: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
  },
};

// --- Bracket Component ---
const roundLabels: Record<number, string> = {
  1: "Quarterfinals",
  2: "Semifinals",
  3: "Finals",
};

const MatchCard = ({
  match,
  onWinnerSelect,
  isAdmin,
}: {
  match: Match;
  onWinnerSelect?: (matchId: string, winnerId: string) => void;
  isAdmin?: boolean;
}) => {
  const getPlayerStyle = (
    player: Participant | null,
    isWinner: boolean,
    isLoser: boolean,
  ) => {
    if (!player)
      return "bg-gray-50 border-dashed border-gray-200 text-gray-300";
    if (isWinner)
      return "bg-gradient-to-r from-yellow-400 to-amber-400 text-white border-yellow-500 shadow-md";
    if (isLoser) return "bg-gray-50 text-gray-400 border-gray-100 opacity-60";
    return "bg-white text-gray-700 border-gray-200 hover:border-pink-300";
  };

  return (
    <div className="flex flex-col gap-0.5 w-48">
      {/* Player 1 */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-t-xl border text-xs font-semibold transition-all relative
        ${getPlayerStyle(match.player1, match.winner_id === match.player1?.id, match.status === "completed" && match.winner_id !== match.player1?.id)}`}
      >
        {match.player1 ? (
          <>
            <span className="text-[10px] opacity-60 w-4 shrink-0">
              #{match.player1.seed}
            </span>
            <span className="truncate flex-1">{match.player1.name}</span>
            {match.winner_id === match.player1?.id && (
              <Crown className="w-3.5 h-3.5 ml-auto shrink-0 text-white" />
            )}
            {isAdmin &&
              match.status === "pending" &&
              match.player1 &&
              match.player2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWinnerSelect?.(match.id, match.player1!.id);
                  }}
                  className="ml-1 p-1 rounded-full bg-green-100 hover:bg-green-200 transition"
                  title="Select as winner"
                >
                  <Check className="w-3 h-3 text-green-600" />
                </button>
              )}
          </>
        ) : (
          <span className="text-[10px] italic">TBD</span>
        )}
        {match.player1?.status === "eliminated" && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border border-white" />
        )}
      </div>

      {/* VS Divider */}
      <div className="flex items-center gap-2 px-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[9px] font-bold text-gray-400">VS</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Player 2 */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-b-xl border text-xs font-semibold transition-all relative
        ${getPlayerStyle(match.player2, match.winner_id === match.player2?.id, match.status === "completed" && match.winner_id !== match.player2?.id)}`}
      >
        {match.player2 ? (
          <>
            <span className="text-[10px] opacity-60 w-4 shrink-0">
              #{match.player2.seed}
            </span>
            <span className="truncate flex-1">{match.player2.name}</span>
            {match.winner_id === match.player2?.id && (
              <Crown className="w-3.5 h-3.5 ml-auto shrink-0 text-white" />
            )}
            {isAdmin &&
              match.status === "pending" &&
              match.player1 &&
              match.player2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWinnerSelect?.(match.id, match.player2!.id);
                  }}
                  className="ml-1 p-1 rounded-full bg-green-100 hover:bg-green-200 transition"
                  title="Select as winner"
                >
                  <Check className="w-3 h-3 text-green-600" />
                </button>
              )}
          </>
        ) : (
          <span className="text-[10px] italic">TBD</span>
        )}
        {match.player2?.status === "eliminated" && (
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-400 rounded-full border border-white" />
        )}
      </div>

      {/* Score display */}
      {match.score && (
        <div className="text-center mt-1">
          <span className="text-[9px] font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">
            {match.score}
          </span>
        </div>
      )}
    </div>
  );
};

const BracketView = ({
  matches,
  onWinnerSelect,
  isAdmin,
}: {
  matches: Match[];
  onWinnerSelect?: (matchId: string, winnerId: string) => void;
  isAdmin?: boolean;
}) => {
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort();

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-12 min-w-max justify-center">
        {rounds.map((round) => {
          const roundMatches = matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.position - b.position);
          const label = roundLabels[round] ?? `Round ${round}`;

          return (
            <div key={round} className="flex flex-col gap-2">
              {/* Round label */}
              <div className="text-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                  {label}
                </span>
              </div>

              {/* Matches stacked with calculated spacing */}
              <div
                className="flex flex-col"
                style={{
                  gap:
                    round === 1
                      ? "16px"
                      : round === 2
                        ? "80px"
                        : round === 3
                          ? "176px"
                          : "32px",
                }}
              >
                {roundMatches.map((match) => (
                  <div key={match.id} className="flex items-center gap-4">
                    <MatchCard
                      match={match}
                      onWinnerSelect={onWinnerSelect}
                      isAdmin={isAdmin}
                    />
                    {/* Connector lines */}
                    {round < rounds[rounds.length - 1] && (
                      <div className="flex flex-col items-center">
                        <div className="h-0.5 w-8 bg-gradient-to-r from-pink-200 to-pink-300" />
                        {round === 1 && (
                          <div className="w-0.5 h-20 bg-pink-200" />
                        )}
                      </div>
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

// --- Main Page ---
const TournamentsPage = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState<"participants" | "bracket">(
    "participants",
  );
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

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
      // toast.error("Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  // Fetch tournament details
  const fetchTournamentDetails = async (tournamentId: string) => {
    try {
      // Fetch participants
      const { data: participantData, error: participantError } = await supabase
        .from("tournament_participants")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("seed", { ascending: true });

      if (participantError) throw participantError;

      // Fetch matches
      const { data: matchData, error: matchError } = await supabase
        .from("tournament_matches")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("round", { ascending: true })
        .order("position", { ascending: true });

      if (matchError) throw matchError;

      setParticipants(participantData || []);
      setMatches(matchData || []);
    } catch (err) {
      console.error("Error fetching tournament details:", err);
      toast.error("Failed to load tournament details");
    }
  };

  // Handle joining tournament
  const handleJoinTournament = async (tournament: Tournament) => {
    setJoining(true);
    try {
      // Here you would typically collect user info or check authentication
      const playerName = prompt("Enter your name to join:");
      if (!playerName) {
        setJoining(false);
        return;
      }

      const { error } = await supabase.from("tournament_participants").insert({
        tournament_id: tournament.id,
        name: playerName,
        seed: participants.length + 1,
        status: "active",
      });

      if (error) throw error;

      toast.success(`🎉 ${playerName} joined the tournament!`);
      fetchTournamentDetails(tournament.id);
    } catch (err) {
      console.error("Error joining tournament:", err);
      toast.error("Failed to join tournament. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  // Handle winner selection
  const handleWinnerSelect = async (matchId: string, winnerId: string) => {
    try {
      // Update match winner
      const { error: matchError } = await supabase
        .from("tournament_matches")
        .update({ winner_id: winnerId, status: "completed" })
        .eq("id", matchId);

      if (matchError) throw matchError;

      // Update participant status (eliminate loser)
      const match = matches.find((m) => m.id === matchId);
      if (match) {
        const loserId =
          match.player1?.id === winnerId
            ? match.player2?.id
            : match.player1?.id;
        if (loserId) {
          await supabase
            .from("tournament_participants")
            .update({ status: "eliminated" })
            .eq("id", loserId);
        }
      }

      toast.success("✅ Winner recorded!");
      fetchTournamentDetails(selectedTournament!.id);
    } catch (err) {
      console.error("Error updating winner:", err);
      toast.error("Failed to update winner");
    }
  };

  // Generate bracket
  const generateBracket = async (tournamentId: string) => {
    try {
      const { error } = await supabase.rpc("generate_tournament_bracket", {
        tournament_id: tournamentId,
      });

      if (error) throw error;

      toast.success("🏆 Bracket generated!");
      fetchTournamentDetails(tournamentId);
    } catch (err) {
      console.error("Error generating bracket:", err);
      toast.error("Failed to generate bracket");
    }
  };

  if (selectedTournament) {
    const statusCfg = statusConfig[selectedTournament.status];
    const spotsLeft = selectedTournament.max_participants - participants.length;
    const isAdmin = false; // Change this based on your auth logic

    return (
      <div className="min-h-screen bg-pink-50">
        {/* Header */}
        <div className="bg-white border-b border-pink-100 px-4 py-4 sticky top-0 z-20">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedTournament(null);
                setParticipants([]);
                setMatches([]);
              }}
              className="p-2 rounded-xl hover:bg-pink-50 transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <MainLogo />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-10">
          {/* Tournament Hero */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-400 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -translate-x-1/4 translate-y-1/4" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 text-white`}
                >
                  {statusCfg.label}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold mb-2">
                {selectedTournament.title}
              </h1>
              <p className="text-pink-100 text-sm leading-relaxed mb-6 max-w-xl">
                {selectedTournament.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/15 rounded-2xl p-3">
                  <CalendarDays className="w-4 h-4 text-pink-200 mb-1" />
                  <p className="text-[10px] text-pink-200 uppercase tracking-wide">
                    Date
                  </p>
                  <p className="text-sm font-bold">
                    {new Date(
                      selectedTournament.date + "T00:00:00",
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="bg-white/15 rounded-2xl p-3">
                  <Clock className="w-4 h-4 text-pink-200 mb-1" />
                  <p className="text-[10px] text-pink-200 uppercase tracking-wide">
                    Time
                  </p>
                  <p className="text-sm font-bold">{selectedTournament.time}</p>
                </div>
                <div className="bg-white/15 rounded-2xl p-3">
                  <Medal className="w-4 h-4 text-pink-200 mb-1" />
                  <p className="text-[10px] text-pink-200 uppercase tracking-wide">
                    Prize Pool
                  </p>
                  <p className="text-sm font-bold">
                    {selectedTournament.prize_pool}
                  </p>
                </div>
                <div className="bg-white/15 rounded-2xl p-3">
                  <Users className="w-4 h-4 text-pink-200 mb-1" />
                  <p className="text-[10px] text-pink-200 uppercase tracking-wide">
                    Slots Left
                  </p>
                  <p className="text-sm font-bold">
                    {spotsLeft} / {selectedTournament.max_participants}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <MapPin className="w-3.5 h-3.5 text-pink-200" />
                <span className="text-xs text-pink-200">
                  {selectedTournament.location}
                </span>
              </div>
            </div>
          </div>

          {/* Entry Fee + Join */}
          <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400">Entry Fee</p>
              <p className="text-2xl font-extrabold text-gray-900">
                ₱{selectedTournament.entry_fee}
                <span className="text-sm text-gray-400 font-normal ml-1">
                  per player
                </span>
              </p>
            </div>
            <button
              onClick={() => handleJoinTournament(selectedTournament)}
              disabled={spotsLeft === 0 || joining}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition cursor-pointer
                ${
                  spotsLeft === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-500 to-pink-400 text-white hover:opacity-90"
                }
              `}
            >
              {joining ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Joining...
                </span>
              ) : spotsLeft === 0 ? (
                "Tournament Full"
              ) : (
                "Join Tournament"
              )}
            </button>
          </div>

          {/* Admin Controls */}
          {isAdmin &&
            selectedTournament.status === "upcoming" &&
            participants.length === selectedTournament.max_participants &&
            matches.length === 0 && (
              <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-4 mb-6 text-center">
                <p className="text-sm font-bold text-yellow-700 mb-2">
                  All slots filled! Generate the bracket to start the
                  tournament.
                </p>
                <button
                  onClick={() => generateBracket(selectedTournament.id)}
                  className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-bold text-sm transition"
                >
                  Generate Bracket
                </button>
              </div>
            )}

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-pink-100 rounded-2xl p-1 mb-6 shadow-sm w-fit">
            {(["participants", "bracket"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer capitalize
                  ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-sm"
                      : "text-gray-400 hover:text-pink-500"
                  }
                `}
              >
                {tab === "participants" ? (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Participants
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5" /> Bracket
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Participants Tab */}
          {activeTab === "participants" && (
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-pink-50">
                <h2 className="font-extrabold text-gray-800">
                  Participants
                  <span className="ml-2 text-sm text-pink-400 font-semibold">
                    {participants.length}/{selectedTournament.max_participants}
                  </span>
                </h2>
              </div>

              {participants.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Users className="w-8 h-8 text-pink-200 mx-auto mb-3" />
                  <p className="text-sm">
                    No participants yet. Be the first to join!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-pink-50">
                  {participants.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-pink-50/50 transition"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold
                        ${
                          idx === 0
                            ? "bg-yellow-100 text-yellow-600"
                            : idx === 1
                              ? "bg-gray-100 text-gray-500"
                              : idx === 2
                                ? "bg-orange-100 text-orange-500"
                                : "bg-pink-50 text-pink-400"
                        }
                      `}
                      >
                        {idx === 0 ? (
                          <Crown className="w-4 h-4" />
                        ) : (
                          `#${p.seed}`
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-bold ${p.status === "eliminated" ? "text-gray-400 line-through" : "text-gray-800"}`}
                        >
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Seed #{p.seed}
                          {p.status === "eliminated" && " • Eliminated"}
                        </p>
                      </div>
                      {idx < 3 && p.status !== "eliminated" && (
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full
                          ${
                            idx === 0
                              ? "bg-yellow-100 text-yellow-600"
                              : idx === 1
                                ? "bg-gray-100 text-gray-500"
                                : "bg-orange-100 text-orange-500"
                          }
                        `}
                        >
                          {idx === 0
                            ? "🥇 Top Seed"
                            : idx === 1
                              ? "🥈 2nd"
                              : "🥉 3rd"}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Empty slots */}
                  {Array.from({ length: spotsLeft }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="flex items-center gap-4 px-5 py-3.5 opacity-40"
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-300">
                        ?
                      </div>
                      <p className="text-sm text-gray-300 italic">Open slot</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bracket Tab */}
          {activeTab === "bracket" && (
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Swords className="w-4 h-4 text-pink-500" />
                <h2 className="font-extrabold text-gray-800">
                  Tournament Bracket
                </h2>
                {selectedTournament.status === "ongoing" && (
                  <span className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Swords className="w-8 h-8 text-pink-200 mx-auto mb-3" />
                  <p className="text-sm">
                    {participants.length === selectedTournament.max_participants
                      ? "Bracket will be generated once tournament starts."
                      : "Bracket will be generated once all slots are filled."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Legend */}
                  <div className="flex items-center gap-4 mb-6 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <div className="w-3 h-3 rounded bg-gradient-to-r from-yellow-400 to-amber-400" />
                      <span>Winner</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
                      <span>Eliminated</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <div className="w-3 h-3 rounded bg-white border border-gray-200" />
                      <span>Upcoming</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <div className="w-3 h-3 rounded border-2 border-dashed border-gray-200" />
                      <span>TBD</span>
                    </div>
                  </div>

                  <BracketView
                    matches={matches}
                    onWinnerSelect={handleWinnerSelect}
                    isAdmin={isAdmin}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Tournament List View ---
  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-100 px-4 py-4 sticky top-0 z-20">
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
            <span className="text-pink-500">Tournaments</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Join a tournament, compete, and win prizes!
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="w-8 h-8 text-pink-400 animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Loading tournaments...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-pink-100 p-16 flex flex-col items-center gap-3 text-center">
            <Trophy className="w-10 h-10 text-pink-200" />
            <p className="font-bold text-gray-700">No tournaments yet</p>
            <p className="text-xs text-gray-400">
              Check back soon — new tournaments will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {tournaments.map((t) => {
              const cfg = statusConfig[t.status];
              const spotsLeft =
                t.max_participants - (t.participants?.length || 0);
              const fillPercent = Math.round(
                ((t.participants?.length || 0) / t.max_participants) * 100,
              );

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden hover:shadow-md transition group cursor-pointer"
                  onClick={() => {
                    setSelectedTournament(t);
                    fetchTournamentDetails(t.id);
                  }}
                >
                  {/* Top accent bar */}
                  <div className="h-1.5 bg-gradient-to-r from-pink-500 to-pink-300" />

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-pink-50 rounded-xl">
                          <Trophy className="w-5 h-5 text-pink-500" />
                        </div>
                        <div>
                          <h2 className="font-extrabold text-gray-900 text-lg group-hover:text-pink-500 transition-colors">
                            {t.title}
                          </h2>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                            />
                            <span
                              className={`text-[10px] font-bold ${cfg.badge.split(" ")[1]}`}
                            >
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-pink-400 transition-colors mt-1 shrink-0" />
                    </div>

                    <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">
                      {t.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span className="text-xs text-gray-600 font-medium">
                          {new Date(t.date + "T00:00:00").toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span className="text-xs text-gray-600 font-medium">
                          {t.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Medal className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span className="text-xs text-gray-600 font-medium">
                          {t.prize_pool}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span className="text-xs text-gray-600 font-medium truncate">
                          Tubigon, Bohol
                        </span>
                      </div>
                    </div>

                    {/* Participants progress */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span>{t.participants?.length || 0} joined</span>
                          <span>{spotsLeft} spots left</span>
                        </div>
                        <div className="h-1.5 bg-pink-50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-500 to-pink-300 rounded-full transition-all"
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-pink-500 shrink-0">
                        ₱{t.entry_fee} entry
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsPage;
