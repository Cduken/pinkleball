/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/CreateTournamentDialog.tsx
import { useState } from "react";
import { toast } from "sonner";
import { Trophy, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "../../../lib/supabase";

interface CreateTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTournamentCreated: () => void;
}

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

export function CreateTournamentDialog({
  open,
  onOpenChange,
  onTournamentCreated,
}: CreateTournamentDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.title || !form.date) {
      toast.error("Title and date are required.");
      return;
    }

    setLoading(true);
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

      setForm(emptyForm);
      onOpenChange(false);
      onTournamentCreated();
      toast.success("Tournament created successfully!");
    } catch (err) {
      toast.error("Failed to create tournament");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g. PinkleBall Open 2026"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description…"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="text"
              placeholder="5:00 PM"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              placeholder="Court address"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="prize_pool">Prize Pool</Label>
            <Input
              id="prize_pool"
              type="text"
              placeholder="₱10,000"
              value={form.prize_pool}
              onChange={(e) =>
                setForm((f) => ({ ...f, prize_pool: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entry_fee">Entry Fee (₱)</Label>
              <Input
                id="entry_fee"
                type="number"
                value={form.entry_fee}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    entry_fee: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="max_players">Max Players</Label>
              <Input
                id="max_players"
                type="number"
                value={form.max_participants}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    max_participants: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <Button onClick={handleCreate} disabled={loading} className="mt-2">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4" />
                Create Tournament
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
