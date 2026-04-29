// Hero.tsx
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, CalendarDays, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import HeroImage from "../assets/HeroImage.jpg";
import CourtImage from "../assets/Court1.jpg";
import EventImage from "../assets/Court2.jpg";

// Browser frame component matching gallery style
// PhotoFrame — fixed: hover only raises THIS frame, not a shared z-index
const PhotoFrame = ({
  children,
  rotation = 0,
  zIndex = 0,
  style = {},
}: {
  children: React.ReactNode;
  rotation?: number;
  zIndex?: number;
  style?: React.CSSProperties;
}) => (
  <motion.div
    className="absolute rounded-2xl overflow-hidden"
    style={{
      background: "#f9c8de",
      border: "2.5px solid #c084a0",
      boxShadow: "4px 6px 0px #c084a0, 0 12px 30px rgba(192,100,160,0.18)",
      rotate: rotation,
      zIndex,
      width: "350px", // slightly bigger
      ...style,
    }}
    whileHover={{ scale: 1.04, rotate: rotation * 0.8, zIndex: 10 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <div
      className="flex items-center justify-between px-3 py-2 flex-shrink-0"
      style={{ background: "#f9c8de", borderBottom: "2px solid #c084a0" }}
    >
      <div className="flex items-center gap-1.5">
        {["#e57fa0", "#d4a0c0", "#c084a0"].map((c, i) => (
          <div
            key={i}
            className="rounded-full flex items-center justify-center text-[8px] font-bold"
            style={{
              width: 13,
              height: 13,
              background: c,
              border: "1.5px solid rgba(0,0,0,0.12)",
              color: "rgba(0,0,0,0.3)",
            }}
          >
            {["✕", "□", "−"][i]}
          </div>
        ))}
      </div>
      <div
        className="flex-1 mx-3 rounded-full text-center"
        style={{
          background: "rgba(255,255,255,0.55)",
          border: "1.5px solid rgba(192,100,160,0.35)",
          padding: "2px 10px",
          fontSize: 8,
          color: "#b06090",
          fontFamily: "'Courier New', monospace",
          maxWidth: 140,
        }}
      >
        pinkleball.ph
      </div>
      <div className="flex gap-1.5 text-[#b06090] font-bold text-xs">
        <span className="opacity-50">&lt;</span>
        <span>&gt;</span>
      </div>
    </div>
    <div className="relative overflow-hidden">{children}</div>
  </motion.div>
);

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const bubble1Ref = useRef<HTMLDivElement>(null);
  const bubble2Ref = useRef<HTMLDivElement>(null);
  const bubble3Ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);

  useEffect(() => {
    if (bubble1Ref.current) {
      gsap.to(bubble1Ref.current, {
        x: 40,
        y: -25,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
    if (bubble2Ref.current) {
      gsap.to(bubble2Ref.current, {
        x: -30,
        y: 18,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5,
      });
    }
    if (bubble3Ref.current) {
      gsap.to(bubble3Ref.current, {
        x: 20,
        y: 30,
        duration: 11,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5,
      });
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const floatingDots = [
    {
      top: "15%",
      left: "8%",
      size: 5,
      delay: 0,
      duration: 4.5,
      color: "#f9a8d4",
    },
    {
      top: "25%",
      right: "6%",
      size: 8,
      delay: 1,
      duration: 5.5,
      color: "#fbcfe8",
    },
    {
      top: "70%",
      left: "5%",
      size: 6,
      delay: 2,
      duration: 6,
      color: "#f472b6",
    },
    {
      bottom: "20%",
      right: "8%",
      size: 10,
      delay: 0.5,
      duration: 4,
      color: "#fce7f3",
    },
    {
      top: "45%",
      left: "3%",
      size: 4,
      delay: 1.5,
      duration: 5,
      color: "#ec4899",
    },
    {
      top: "80%",
      right: "12%",
      size: 5,
      delay: 2.5,
      duration: 7,
      color: "#f9a8d4",
    },
  ];

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #fff5f8 0%, #ffe4f0 50%, #ffd9e8 100%)",
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      {/* Gradient orbs */}
      <div
        ref={bubble1Ref}
        className="absolute -top-20 -right-20 rounded-full pointer-events-none"
        style={{
          width: "clamp(260px, 45vw, 520px)",
          height: "clamp(260px, 45vw, 520px)",
          background:
            "radial-gradient(circle, rgba(249,168,212,0.55) 0%, rgba(236,72,153,0.1) 70%, transparent 100%)",
          filter: "blur(40px)",
        }}
      />
      <div
        ref={bubble2Ref}
        className="absolute -bottom-10 -left-10 rounded-full pointer-events-none"
        style={{
          width: "clamp(200px, 35vw, 400px)",
          height: "clamp(200px, 35vw, 400px)",
          background:
            "radial-gradient(circle, rgba(251,207,232,0.6) 0%, rgba(244,114,182,0.1) 70%, transparent 100%)",
          filter: "blur(40px)",
        }}
      />
      <div
        ref={bubble3Ref}
        className="absolute top-1/2 left-1/4 rounded-full pointer-events-none"
        style={{
          width: "clamp(120px, 20vw, 220px)",
          height: "clamp(120px, 20vw, 220px)",
          background:
            "radial-gradient(circle, rgba(252,231,243,0.7) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* Floating dots */}
      {floatingDots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none hidden sm:block"
          style={{
            ...dot,
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
            opacity: 0.5,
          }}
          animate={{ y: [0, -16, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot.delay,
          }}
        />
      ))}

      {/* Main Content - Split Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full min-h-screen flex items-center">
        {/* Left Side - Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 max-w-xl"
          style={{ y: yParallax }}
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-200 mb-6"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
              }}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500" />
              </motion.div>
              <span className="text-xs sm:text-sm text-pink-500 font-semibold tracking-wide">
                Pickleball reservations made delightful
              </span>
            </motion.div>
          </motion.div>

          {/* Headline */}
          <motion.div variants={itemVariants} className="space-y-2">
            <h1
              className="font-extrabold text-gray-900 leading-[1.1] tracking-tight"
              style={{
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Book your court.
            </h1>
            <h1
              className="font-extrabold leading-[1.1] tracking-tight"
              style={{
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                fontFamily: "'Playfair Display', Georgia, serif",
                background:
                  "linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fb7185 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Win the day.
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-gray-500 leading-relaxed mt-4"
            style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}
          >
            PinkleBall is the cutest way to reserve pickleball courts. Pick a
            date, grab a slot, and play.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-8"
          >
            <motion.button
              onClick={() => navigate("/book")}
              className="flex items-center justify-center gap-2 text-white font-semibold rounded-2xl cursor-pointer w-full sm:w-auto"
              style={{
                background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
                padding: "0.875rem 1.75rem",
                fontSize: "0.95rem",
                boxShadow:
                  "0 4px 20px rgba(236,72,153,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 12px 30px rgba(236,72,153,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <CalendarDays className="w-4 h-4" />
              Book a court
            </motion.button>

            <motion.button
              onClick={() => navigate("/availability")}
              className="flex items-center justify-center gap-2 text-gray-700 font-semibold rounded-2xl cursor-pointer w-full sm:w-auto"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1.5px solid rgba(209,213,219,0.6)",
                padding: "0.875rem 1.75rem",
                fontSize: "0.95rem",
                backdropFilter: "blur(8px)",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              Check availability
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Side - Stumbled / Stacked Polaroid-style Images */}
        {/* Right Side — Fixed stacked collage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex flex-1 justify-center items-center relative"
          style={{ minHeight: 520 }}
        >
          <div className="relative" style={{ width: 380, height: 480 }}>
            {/* Image 1 — back-left, rotated -38deg */}
            <PhotoFrame rotation={-20} zIndex={1} style={{ top: 20, left: -80 }}>
              <img
                src={EventImage}
                alt="PinkleBall Event"
                className="w-full object-cover"
                style={{ height: 200 }}
              />
            </PhotoFrame>

            {/* Image 2 — back-right, rotated 42deg */}
            <PhotoFrame rotation={42} zIndex={2} style={{ top: 10, right: 0 }}>
              <img
                src={CourtImage}
                alt="PinkleBall Court"
                className="w-full object-cover"
                style={{ height: 220 }}
              />
            </PhotoFrame>

            {/* Image 3 — front-center, slightly rotated -8deg */}
            <PhotoFrame
              rotation={-8}
              zIndex={3}
              style={{ bottom: 0, left: "50%", x: "-50%" }}
            >
              <img
                src={HeroImage}
                alt="PinkleBall Main"
                className="w-full object-cover"
                style={{ height: 200 }}
              />
            </PhotoFrame>

           
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2 }}
      >
        <span className="text-[10px] text-gray-400 tracking-widest uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
