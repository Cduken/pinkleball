import { CalendarDays, Trophy, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Easy Booking",
    description: "Reserve your court in seconds. Pick a date, choose a slot, and you're set.",
  },
  {
    icon: Trophy,
    title: "Join Tournaments",
    description: "Compete with local players and climb the leaderboard every weekend.",
  },
  {
    icon: Clock,
    title: "Real-time Availability",
    description: "See open slots instantly. No waiting, no back-and-forth calls.",
  },
  {
    icon: Shield,
    title: "No Account Needed",
    description: "Just fill the form and show up. We keep it simple and stress-free.",
  },
];

const Features = () => {
  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Everything you need to{" "}
            <span className="text-pink-500">play more</span>
          </h2>
          <p className="text-gray-400 mt-3 text-base max-w-md mx-auto">
            PinkleBall makes court reservations and tournaments effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-start gap-3 p-6 rounded-2xl border border-pink-100 bg-pink-50 hover:shadow-md transition"
            >
              <div className="p-2 bg-pink-100 rounded-xl">
                <Icon className="w-5 h-5 text-pink-500" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;