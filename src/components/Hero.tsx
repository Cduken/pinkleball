import { Sparkles, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-pink-50">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-300 rounded-full opacity-40 blur-3xl translate-x-1/3 -translate-y-1/4" />
      <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] bg-pink-200 rounded-full opacity-30 blur-2xl" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 gap-6">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-pink-200 rounded-full shadow-sm">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span className="text-sm text-pink-500 font-medium">
            Pickleball reservations made delightful
          </span>
        </div>

        <div>
          <h1 className="text-6xl font-extrabold text-gray-900 leading-tight">
            Book your court.
          </h1>
          <h1 className="text-6xl font-extrabold text-pink-500 leading-tight">
            Win the day.
          </h1>
        </div>

        <p className="text-gray-500 text-lg max-w-md leading-relaxed">
          PinkleBall is the cutest way to reserve pickleball courts and join
          tournaments. Pick a date, grab a slot, and play.
        </p>

        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => navigate("/book")}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            Book a court
          </button>
          <button onClick={() => navigate('/availability')} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer shadow-sm">
            <Sparkles className="w-4 h-4" />
            Check availability
          </button>
        </div>

        <p className="text-sm text-gray-400">
          No account needed — just fill the form ❤️
        </p>
      </div>
    </div>
  );
};

export default Hero;
