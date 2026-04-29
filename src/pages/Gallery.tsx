/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Gallery.tsx (Public facing - updated to fetch from Supabase)
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase";

// ── Types ───────────────────────────────────────────────────────────────────
interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string;
  caption: string;
  order_index: number;
  created_at: string;
}

// ── BrowserChrome ─────────────────────────────────────────────────────────────
const BrowserChrome = ({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption?: string;
}) => (
  <div
    className="flex flex-col rounded-2xl overflow-hidden w-full h-full"
    style={{
      background: "#fdf0f6",
      border: "2px solid #e4a0c0",
      boxShadow: "3px 5px 0px #d490b0, 0 8px 24px rgba(192,100,160,0.15)",
    }}
  >
    {/* Title bar */}
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 flex-shrink-0"
      style={{ background: "#f9c8de", borderBottom: "2px solid #e4a0c0" }}
    >
      {["#e57fa0", "#d4a0c0", "#c084a0"].map((c, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: 10,
            height: 10,
            background: c,
            border: "1.5px solid rgba(0,0,0,0.1)",
          }}
        />
      ))}
      <div
        className="flex-1 mx-2 rounded-full text-center truncate"
        style={{
          background: "rgba(255,255,255,0.55)",
          border: "1.5px solid rgba(192,100,160,0.35)",
          padding: "2px 10px",
          fontSize: 9,
          color: "#b06090",
          fontFamily: "'Courier New', monospace",
          letterSpacing: "0.02em",
          maxWidth: 140,
        }}
      >
        {caption || "pinkleball/gallery"}
      </div>
    </div>
    {/* Content */}
    <div className="relative overflow-hidden flex-1">{children}</div>
  </div>
);

// ── Lightbox ──────────────────────────────────────────────────────────────────
const Lightbox = ({
  img,
  onClose,
  onPrev,
  onNext,
}: {
  img: GalleryImage | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) => (
  <AnimatePresence>
    {img && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{
          background: "rgba(236,72,153,0.2)",
          backdropFilter: "blur(12px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Prev */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 sm:left-8 z-10 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <motion.div
          className="max-w-4xl w-full"
          style={{ maxHeight: "80vh" }}
          initial={{ scale: 0.88, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          <BrowserChrome caption={img.caption}>
            <img
              src={img.image_url}
              alt={img.alt_text}
              className="w-full object-contain"
              style={{ maxHeight: "65vh" }}
            />
          </BrowserChrome>
        </motion.div>

        {/* Next */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 sm:right-8 z-10 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Floating deco ─────────────────────────────────────────────────────────────
const Deco = () => (
  <>
    {/* Soft blobs */}
    <div
      className="absolute -top-16 -right-16 rounded-full pointer-events-none"
      style={{
        width: 340,
        height: 340,
        background:
          "radial-gradient(circle, rgba(249,168,212,0.35) 0%, transparent 70%)",
        filter: "blur(50px)",
      }}
    />
    <div
      className="absolute -bottom-16 -left-16 rounded-full pointer-events-none"
      style={{
        width: 280,
        height: 280,
        background:
          "radial-gradient(circle, rgba(251,207,232,0.4) 0%, transparent 70%)",
        filter: "blur(40px)",
      }}
    />

    {/* Floating dots */}
    {[
      { top: "10%", left: "4%", size: 6, color: "#f9a8d4", dur: 5 },
      { top: "80%", left: "3%", size: 4, color: "#fbcfe8", dur: 6.5 },
      { top: "20%", right: "5%", size: 8, color: "#f472b6", dur: 4.5 },
      { top: "70%", right: "4%", size: 5, color: "#fce7f3", dur: 7 },
      { top: "45%", left: "2%", size: 3, color: "#ec4899", dur: 5.5 },
    ].map((d, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full pointer-events-none"
        style={{
          ...d,
          width: d.size,
          height: d.size,
          background: d.color,
          opacity: 0.5,
        }}
        animate={{ y: [0, -14, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{
          duration: d.dur,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.6,
        }}
      />
    ))}
  </>
);

// ── Gallery ───────────────────────────────────────────────────────────────────
const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [activeImg, setActiveImg] = useState<GalleryImage | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Fetch images from Supabase
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("gallery_images")
        .select("*")
        .order("order_index", { ascending: true });

      if (supabaseError) throw supabaseError;

      setImages(data || []);
    } catch (err) {
      console.error("Error fetching gallery images:", err);
      setError("Failed to load gallery images. Please try again later.");
    } 
  };

  // Group into pages of 4
  const pages = Array.from({ length: Math.ceil(images.length / 4) }, (_, i) =>
    images.slice(i * 4, i * 4 + 4),
  );

  // Slight random rotations per card position (stable, not random on render)
  const ROTATIONS = [-2.5, 1.8, -1.2, 2.1];
  const OFFSETS = [
    { x: -3, y: -4 },
    { x: 4, y: 2 },
    { x: -2, y: 3 },
    { x: 3, y: -3 },
  ];

  const goTo = useCallback((nextPage: number, dir: number) => {
    setDirection(dir);
    setPage(nextPage);
  }, []);

  const openImg = (img: GalleryImage, idx: number) => {
    setActiveImg(img);
    setActiveIdx(idx);
  };

  const closeLightbox = () => setActiveImg(null);

  const lightboxPrev = () => {
    const prevIdx = (activeIdx - 1 + images.length) % images.length;
    setActiveIdx(prevIdx);
    setActiveImg(images[prevIdx]);
  };

  const lightboxNext = () => {
    const nextIdx = (activeIdx + 1) % images.length;
    setActiveIdx(nextIdx);
    setActiveImg(images[nextIdx]);
  };

  const pageVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 260, damping: 28 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.97,
      transition: { duration: 0.25 },
    }),
  };

  const currentPage = pages[page];

  // Error state
  if (error) {
    return (
      <section
        className="relative py-20 sm:py-28 overflow-hidden min-h-screen flex flex-col justify-center"
        style={{
          background:
            "linear-gradient(145deg, #fff5f8 0%, #ffe4f0 55%, #ffd9e8 100%)",
        }}
      >
        <Deco />
        <div className="relative z-10 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchImages}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (images.length === 0) {
    return (
      <section
        className="relative py-20 sm:py-28 overflow-hidden min-h-screen flex flex-col justify-center"
        style={{
          background:
            "linear-gradient(145deg, #fff5f8 0%, #ffe4f0 55%, #ffd9e8 100%)",
        }}
      >
        <Deco />
        <div className="relative z-10 text-center px-4">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1.5px solid rgba(236,72,153,0.3)",
              color: "#ec4899",
              backdropFilter: "blur(8px)",
            }}
          >
            <span>✿</span> Our Space <span>✿</span>
          </div>

          <h2
            className="font-extrabold text-gray-900 leading-tight mb-4"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
            }}
          >
            A peek inside{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #ec4899, #f472b6, #fb7185)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              PinkleBall
            </span>
          </h2>

          <p className="text-gray-500 max-w-md mx-auto">
            No images yet. Check back soon for amazing moments!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative py-20 sm:py-28 overflow-hidden min-h-screen flex flex-col justify-center"
      style={{
        background:
          "linear-gradient(145deg, #fff5f8 0%, #ffe4f0 55%, #ffd9e8 100%)",
      }}
    >
      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
          opacity: 0.035,
        }}
      />

      <Deco />

      {/* Header */}
      <motion.div
        className="relative z-10 text-center mb-12 sm:mb-16 px-4"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
          style={{
            background: "rgba(255,255,255,0.8)",
            border: "1.5px solid rgba(236,72,153,0.3)",
            color: "#ec4899",
            backdropFilter: "blur(8px)",
          }}
        >
          <span>✿</span> Our Space <span>✿</span>
        </div>

        <h2
          className="font-extrabold text-gray-900 leading-tight"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
          }}
        >
          A peek inside{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #ec4899, #f472b6, #fb7185)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            PinkleBall
          </span>
        </h2>
        <p
          className="mt-3 text-gray-500 max-w-md mx-auto"
          style={{ fontSize: "clamp(0.88rem, 2vw, 1rem)", lineHeight: 1.7 }}
        >
          All the pink-tastic moments that make us one of a kind.
        </p>
      </motion.div>

      {/* Carousel */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 w-full">
        <div className="relative flex items-center justify-center">
          {/* Left nav - only show if more than one page */}
          {pages.length > 1 && (
            <button
              onClick={() => goTo((page - 1 + pages.length) % pages.length, -1)}
              className="absolute -left-2 sm:-left-10 z-20 p-2.5 rounded-full text-pink-400 hover:text-pink-600 transition-all"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                border: "1.5px solid rgba(236,72,153,0.2)",
                boxShadow: "0 4px 16px rgba(236,72,153,0.12)",
              }}
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 cursor-pointer" />
            </button>
          )}

          {/* Grid slide */}
          <div className="w-full overflow-visible">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="grid grid-cols-2 gap-4 sm:gap-5"
              >
                {currentPage.map((img, idx) => {
                  const rot = ROTATIONS[idx % ROTATIONS.length];
                  const off = OFFSETS[idx % OFFSETS.length];
                  const globalIdx = images.findIndex((i) => i.id === img.id);
                  return (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, y: 20, rotate: rot * 0.5 }}
                      animate={{ opacity: 1, y: 0, rotate: rot }}
                      transition={{
                        delay: idx * 0.07,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{
                        transform: `rotate(${rot}deg) translate(${off.x}px, ${off.y}px)`,
                      }}
                    >
                      <motion.div
                        className="cursor-pointer group"
                        style={{ aspectRatio: "4/3" }}
                        whileHover={{
                          scale: 1.04,
                          rotate: 0,
                          zIndex: 10,
                          translateX: -off.x,
                          translateY: -off.y,
                          transition: {
                            type: "spring",
                            stiffness: 320,
                            damping: 22,
                          },
                        }}
                        onClick={() => openImg(img, globalIdx)}
                      >
                        <BrowserChrome caption={img.caption || img.alt_text}>
                          <div className="relative w-full h-full overflow-hidden">
                            <img
                              src={img.image_url}
                              alt={img.alt_text}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            {/* Hover overlay */}
                            <div
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{ background: "rgba(236,72,153,0.18)" }}
                            >
                              <div
                                className="rounded-full p-2"
                                style={{ background: "rgba(255,255,255,0.92)" }}
                              >
                                <Maximize2 className="w-4 h-4 text-pink-500" />
                              </div>
                            </div>
                          </div>
                        </BrowserChrome>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right nav - only show if more than one page */}
          {pages.length > 1 && (
            <button
              onClick={() => goTo((page + 1) % pages.length, 1)}
              className="absolute -right-2 sm:-right-10 z-20 p-2.5 rounded-full text-pink-400 hover:text-pink-600 transition-all"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                border: "1.5px solid rgba(236,72,153,0.2)",
                boxShadow: "0 4px 16px rgba(236,72,153,0.12)",
              }}
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 cursor-pointer" />
            </button>
          )}
        </div>

        {/* Page dots - only show if more than one page */}
        {pages.length > 1 && (
          <>
            <div className="flex justify-center items-center gap-2.5 mt-8">
              {pages.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => goTo(i, i > page ? 1 : -1)}
                  animate={{
                    width: i === page ? 28 : 10,
                    background: i === page ? "#ec4899" : "#f9a8d4",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="rounded-full"
                  style={{ height: 10 }}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>

            {/* Page counter */}
            <div className="text-center mt-3">
              <span
                className="text-xs font-medium text-pink-400"
                style={{
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: "0.08em",
                }}
              >
                {page + 1} / {pages.length}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        img={activeImg}
        onClose={closeLightbox}
        onPrev={lightboxPrev}
        onNext={lightboxNext}
      />
    </section>
  );
};

export default Gallery;
