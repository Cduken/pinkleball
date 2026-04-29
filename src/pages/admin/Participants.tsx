import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Search, Users, Trophy, CalendarDays, Phone, MoreHorizontal, UserX, UserCheck, X, Crown } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";

type PlayerStatus = "active" | "banned";
interface Participant {
  id: string; name: string; contact: string; joinedAt: string;
  totalBookings: number; totalSpent: number; status: PlayerStatus; tournaments: number;
}

const mockParticipants: Participant[] = [
  { id: "USR-001", name: "Juan dela Cruz",  contact: "09171234567", joinedAt: "2026-03-10", totalBookings: 8,  totalSpent: 3500, status: "active", tournaments: 2 },
  { id: "USR-002", name: "Maria Santos",    contact: "09281234567", joinedAt: "2026-03-15", totalBookings: 5,  totalSpent: 1750, status: "active", tournaments: 1 },
  { id: "USR-003", name: "Carlo Reyes",     contact: "09191234567", joinedAt: "2026-03-20", totalBookings: 12, totalSpent: 5250, status: "active", tournaments: 3 },
  { id: "USR-004", name: "Ana Lim",         contact: "09261234567", joinedAt: "2026-03-22", totalBookings: 3,  totalSpent: 1000, status: "banned", tournaments: 0 },
  { id: "USR-005", name: "Rico Manalo",     contact: "09351234567", joinedAt: "2026-04-01", totalBookings: 7,  totalSpent: 3000, status: "active", tournaments: 2 },
  { id: "USR-006", name: "Lea Fernandez",   contact: "09171239999", joinedAt: "2026-04-05", totalBookings: 4,  totalSpent: 1500, status: "active", tournaments: 1 },
  { id: "USR-007", name: "Mark Villanueva", contact: "09281239999", joinedAt: "2026-04-10", totalBookings: 2,  totalSpent: 750,  status: "banned", tournaments: 0 },
  { id: "USR-008", name: "Tina Ocampo",     contact: "09191239999", joinedAt: "2026-04-12", totalBookings: 9,  totalSpent: 4000, status: "active", tournaments: 2 },
  { id: "USR-009", name: "Ben Aquino",      contact: "09261239999", joinedAt: "2026-04-15", totalBookings: 6,  totalSpent: 2500, status: "active", tournaments: 1 },
  { id: "USR-010", name: "Sofia Cruz",      contact: "09351239999", joinedAt: "2026-04-18", totalBookings: 11, totalSpent: 4750, status: "active", tournaments: 3 },
];

const P = {
  pink: "#f472b6", pinkDim: "rgba(244,114,182,0.45)",
  pinkGhost: "rgba(244,114,182,0.07)", border: "rgba(244,114,182,0.10)",
  card: "rgba(17,13,22,0.7)", muted: "rgba(255,255,255,0.28)",
};

const avatarColors = [
  "linear-gradient(135deg,#be185d,#ec4899)",
  "linear-gradient(135deg,#7c3aed,#a855f7)",
  "linear-gradient(135deg,#0891b2,#06b6d4)",
  "linear-gradient(135deg,#047857,#10b981)",
  "linear-gradient(135deg,#b45309,#f59e0b)",
];

const DetailDrawer = ({ p, onClose, onStatusChange }: {
  p: Participant; onClose: () => void; onStatusChange: (id: string, s: PlayerStatus) => void;
}) => (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-sm h-full flex flex-col overflow-y-auto"
      style={{ background: "linear-gradient(160deg,#110d16,#0a0610)", borderLeft: `1px solid ${P.border}` }}>
      <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${P.border}` }}>
        <div>
          <p className="text-white font-black" style={{ letterSpacing: "-0.03em" }}>Participant</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: P.pinkDim }}>{p.id}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl transition-colors" style={{ color: P.muted }}
          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = P.muted}>
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
            style={{ background: avatarColors[parseInt(p.id.split("-")[1]) % avatarColors.length] }}>
            {p.name.charAt(0)}
          </div>
          <div className="text-center">
            <p className="text-white font-black text-lg" style={{ letterSpacing: "-0.03em" }}>{p.name}</p>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.status === "active" ? "text-emerald-400" : "text-red-400"}`}
              style={{ background: p.status === "active" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)" }}>
              {p.status === "active" ? "● Active" : "● Banned"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Bookings", value: p.totalBookings, color: P.pink },
            { label: "Spent",    value: `₱${p.totalSpent.toLocaleString()}`, color: "#fbbf24" },
            { label: "Tournaments", value: p.tournaments, color: "#4ade80" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ background: P.pinkGhost, border: `1px solid ${P.border}` }}>
              <p className="text-base font-black text-white" style={{ letterSpacing: "-0.04em" }}>{value}</p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${P.border}` }}>
          {[
            { label: "Contact", value: p.contact, icon: Phone },
            { label: "Member Since", value: new Date(p.joinedAt + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), icon: CalendarDays },
          ].map(({ label, value, icon: Icon }, idx) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: idx === 0 ? `1px solid rgba(244,114,182,0.05)` : "none" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: P.pinkGhost }}>
                <Icon size={13} style={{ color: P.pink }} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: "rgba(255,255,255,0.22)" }}>{label}</p>
                <p className="text-sm text-white font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {p.status === "active" ? (
            <button onClick={() => onStatusChange(p.id, "banned")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all"
              style={{ background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.18)", color: "#fb7185" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(251,113,133,0.16)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(251,113,133,0.08)"}>
              <UserX size={14} /> Ban Participant
            </button>
          ) : (
            <button onClick={() => onStatusChange(p.id, "active")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all"
              style={{ background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.20)", color: "#4ade80" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(74,222,128,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(74,222,128,0.10)"}>
              <UserCheck size={14} /> Unban Participant
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function AdminParticipants() {
  const [data, setData] = useState<Participant[]>(mockParticipants);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlayerStatus | "all">("all");
  const [selected, setSelected] = useState<Participant | null>(null);

  const handleStatusChange = (id: string, status: PlayerStatus) => {
    setData(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
    toast.success(status === "banned" ? "🚫 Participant banned." : "✅ Participant unbanned!", {
      style: { background: "#1a0d1f", color: "#fff", border: "1px solid rgba(244,114,182,0.2)" },
    });
  };

  const filtered = useMemo(() => data.filter(p => {
    const q = search.toLowerCase();
    return (p.name.toLowerCase().includes(q) || p.contact.includes(q) || p.id.toLowerCase().includes(q))
      && (statusFilter === "all" || p.status === statusFilter);
  }).sort((a, b) => b.totalBookings - a.totalBookings), [data, search, statusFilter]);

  const topPlayer = [...data].sort((a, b) => b.totalBookings - a.totalBookings)[0];

  return (
    <AdminLayout title="Participants" subtitle="All registered players">
      {selected && <DetailDrawer p={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />}

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Players", value: data.length, color: P.pink, icon: Users },
          { label: "Active",  value: data.filter(p => p.status === "active").length,  color: "#4ade80", icon: UserCheck },
          { label: "Banned",  value: data.filter(p => p.status === "banned").length,  color: "#fb7185", icon: UserX    },
          { label: "In Tournaments", value: data.filter(p => p.tournaments > 0).length, color: "#fbbf24", icon: Trophy },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
            <Icon size={15} style={{ color }} className="mb-3" />
            <p className="text-2xl font-black text-white mb-0.5" style={{ letterSpacing: "-0.05em" }}>{value}</p>
            <p className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Top player highlight */}
      {topPlayer && (
        <div className="rounded-2xl p-5 mb-6 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg,rgba(190,24,93,0.12),rgba(244,114,182,0.06))", border: "1px solid rgba(244,114,182,0.18)" }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#be185d,#ec4899)" }}>
            <Crown size={18} color="#fff" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: P.pinkDim }}>Top Player</p>
            <p className="text-white font-black" style={{ letterSpacing: "-0.03em" }}>{topPlayer.name}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{topPlayer.totalBookings} bookings · ₱{topPlayer.totalSpent.toLocaleString()} spent</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: P.pinkDim }} />
          <input type="text" placeholder="Search name, contact, ID…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "rgba(10,5,14,0.9)", border: "1px solid rgba(244,114,182,0.12)", color: "#fff" }}
            onFocus={e => { e.currentTarget.style.border = "1px solid rgba(244,114,182,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(244,114,182,0.07)"; }}
            onBlur={e => { e.currentTarget.style.border = "1px solid rgba(244,114,182,0.12)"; e.currentTarget.style.boxShadow = "none"; }} />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "banned"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize"
              style={{
                background: statusFilter === s ? P.pinkGhost : "rgba(255,255,255,0.03)",
                border: statusFilter === s ? `1px solid ${P.border}` : "1px solid rgba(255,255,255,0.06)",
                color: statusFilter === s ? P.pink : "rgba(255,255,255,0.3)",
              }}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${P.border}`, background: P.card }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(244,114,182,0.06)" }}>
                {["#","Player","Contact","Since","Bookings","Spent","Tournaments","Status",""].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.18)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center">
                  <Users size={26} className="mx-auto mb-3" style={{ color: "rgba(244,114,182,0.15)" }} />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>No participants found</p>
                </td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id} onClick={() => setSelected(p)} style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(244,114,182,0.04)" : "none",
                  cursor: "pointer",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(244,114,182,0.03)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td className="px-5 py-3.5 text-xs font-mono font-bold" style={{ color: P.pinkDim }}>{i + 1}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                        style={{ background: avatarColors[parseInt(p.id.split("-")[1]) % avatarColors.length] }}>
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white whitespace-nowrap">{p.name}</p>
                        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{p.contact}</td>
                  <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {new Date(p.joinedAt + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-black" style={{ color: P.pink }}>{p.totalBookings}</td>
                  <td className="px-5 py-3.5 text-xs font-bold" style={{ color: "#fbbf24" }}>₱{p.totalSpent.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-xs font-bold" style={{ color: "#4ade80" }}>{p.tournaments}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                      style={p.status === "active"
                        ? { background: "rgba(74,222,128,0.10)", color: "#4ade80" }
                        : { background: "rgba(251,113,133,0.10)", color: "#fb7185" }}>
                      {p.status === "active" ? "Active" : "Banned"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="p-1.5 rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.18)" }}
                      onMouseEnter={e => e.currentTarget.style.color = P.pink}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.18)"}>
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}