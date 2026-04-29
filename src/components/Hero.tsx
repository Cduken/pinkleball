//Hero.tsx
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const bubble1Ref = useRef<HTMLDivElement>(null);
  const bubble2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate floating bubbles with GSAP
    if (bubble1Ref.current) {
      gsap.to(bubble1Ref.current, {
        x: 50,
        y: -30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }

    if (bubble2Ref.current) {
      gsap.to(bubble2Ref.current, {
        x: -40,
        y: 20,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: 1,
      });
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-pink-50"
    >
      {/* Animated bubbles */}
      <div
        ref={bubble1Ref}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-300 rounded-full opacity-40 blur-3xl translate-x-1/3 -translate-y-1/4"
      />
      <div
        ref={bubble2Ref}
        className="absolute bottom-0 left-1/2 w-[300px] h-[300px] bg-pink-200 rounded-full opacity-30 blur-2xl"
      />

      {/* Additional floating elements */}
      <motion.div
        className="absolute top-20 left-10 w-4 h-4 bg-pink-400 rounded-full opacity-20"
        animate={{
          y: [0, -20, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-6 h-6 bg-pink-300 rounded-full opacity-20"
        animate={{
          y: [0, 20, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center px-4 gap-6"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 px-4 py-1.5 bg-white border border-pink-200 rounded-full shadow-sm"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
          </motion.div>
          <span className="text-sm text-pink-500 font-medium">
            Pickleball reservations made delightful
          </span>
        </motion.div>

        {/* Headlines */}
        <motion.div variants={itemVariants}>
          <motion.h1
            className="text-6xl font-extrabold text-gray-900 leading-tight"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Book your court.
          </motion.h1>
          <motion.h1
            className="text-6xl font-extrabold text-pink-500 leading-tight"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Win the day.
          </motion.h1>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-gray-500 text-lg max-w-md leading-relaxed"
        >
          PinkleBall is the cutest way to reserve pickleball courts and join
          tournaments. Pick a date, grab a slot, and play.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 mt-2"
        >
          <motion.button
            onClick={() => navigate("/book")}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgba(236, 72, 153, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <CalendarDays className="w-4 h-4" />
            Book a court
          </motion.button>

          <motion.button
            onClick={() => navigate("/availability")}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold shadow-sm cursor-pointer"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Sparkles className="w-4 h-4" />
            Check availability
          </motion.button>
        </motion.div>

        <motion.p variants={itemVariants} className="text-sm text-gray-400">
          No account needed — just fill the form ❤️
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Hero;
