/* eslint-disable @typescript-eslint/no-unused-vars */
//Features.tsx
import { motion } from "framer-motion";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
    },
  },
};

const Features = () => {
  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-extrabold text-gray-900">
            Everything you need to{" "}
            <span className="text-pink-500">play more</span>
          </h2>
          <p className="text-gray-400 mt-3 text-base max-w-md mx-auto">
            PinkleBall makes court reservations and tournaments effortless.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }}
              className="flex flex-col items-start gap-3 p-6 rounded-2xl border border-pink-100 bg-pink-50 hover:shadow-md transition cursor-default"
            >
              <motion.div
                className="p-2 bg-pink-100 rounded-xl"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Icon className="w-5 h-5 text-pink-500" />
              </motion.div>
              <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;