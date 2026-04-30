/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Admin/Tournaments.tsx
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trophy, Plus, RefreshCw, Loader2 } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { supabase } from "../../lib/supabase";
import { CreateTournamentDialog } from "../admin/components/CreateTournamentDialog";
import { TournamentDetailDrawer } from "../admin/components/TournamentDetailDrawer";
import { TournamentStats } from "../admin/components/TournamentStats";
import { TournamentCard } from "../admin/components/TournamentCard";

type TStatus = "upcoming" | "ongoing" | "completed";

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

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Tournament | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
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
      const { error } = await supabase.rpc("generate_tournament_bracket", {
        p_tournament_id: tournamentId,
      });

      if (error) throw error;

      toast.success("🏆 Bracket generated!");
      fetchTournamentDetails(tournamentId);
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

      const { error: matchError } = await supabase
        .from("tournament_matches")
        .update({ winner_id: winnerId, status: "completed" })
        .eq("id", matchId);

      if (matchError) throw matchError;

      const loserId =
        match.player1?.id === winnerId ? match.player2?.id : match.player1?.id;
      if (loserId) {
        await supabase
          .from("tournament_participants")
          .update({ status: "eliminated" })
          .eq("id", loserId);
      }

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
      {/* Create Tournament Dialog */}
      <CreateTournamentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTournamentCreated={fetchTournaments}
      />

      {/* Tournament Detail Drawer */}
      <TournamentDetailDrawer
        tournament={selected}
        participants={participants}
        matches={matches}
        actionLoading={actionLoading}
        onClose={() => {
          setSelected(null);
          setParticipants([]);
          setMatches([]);
        }}
        onStatusChange={handleStatusChange}
        onGenerateBracket={generateBracket}
        onWinnerSelect={handleWinnerSelect}
        onUpdateScore={handleUpdateScore}
        onDelete={handleDelete}
      />

      {/* Stats */}
      <TournamentStats tournaments={tournaments} />

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
            onClick={() => setShowCreateDialog(true)}
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
            onClick={() => setShowCreateDialog(true)}
            className="mt-2 px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer"
            style={{ background: "linear-gradient(135deg,#be185d,#ec4899)" }}
          >
            Create one
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournaments.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              onClick={() => {
                setSelected(t);
                fetchTournamentDetails(t.id);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}