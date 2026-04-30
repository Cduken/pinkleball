/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/TournamentStats.tsx
interface TournamentStatsProps {
  tournaments: any[];
}

const P = {
  pink: "#f472b6",
};

export function TournamentStats({ tournaments }: TournamentStatsProps) {
  const stats = [
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
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map(({ label, value, color }) => (
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
  );
}