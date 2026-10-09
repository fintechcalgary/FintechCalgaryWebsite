"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/** Convert YouTube URLs to embed URL */
const toYouTubeEmbed = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return url;
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
  } catch {}
  return null;
};

/**
 * @param {"cover" | "contain"} [fit="cover"]
 *   cover — crop to fill (list cards). contain — show full image with blurred fill (detail pages).
 */
export default function ImageCarousel({
  images,
  title,
  recordingUrl,
  fit = "cover",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const contain = fit === "contain";

  // Build mixed media array (video first if present)
  const media = useMemo(() => {
    const list = (images?.length ? images : []).filter(Boolean);
    const videoEmbed = toYouTubeEmbed(recordingUrl);

    /** shape: { type: 'image' | 'youtube', src: string } */
    return [
      ...(videoEmbed ? [{ type: "youtube", src: videoEmbed }] : []),
      ...list.map((src) => ({ type: "image", src })),
    ];
  }, [images, recordingUrl]);

  const count = media.length;

  const slideVariants = useMemo(
    () => ({
      enter: (dir) => ({ x: dir > 0 ? 1000 : -1000, opacity: 0 }),
      center: { zIndex: 1, x: 0, opacity: 1 },
      exit: (dir) => ({ zIndex: 0, x: dir < 0 ? 1000 : -1000, opacity: 0 }),
    }),
    []
  );

  const swipeConfidenceThreshold = 10000;
  const swipePower = useCallback(
    (offset, velocity) => Math.abs(offset) * velocity,
    []
  );

  const paginate = useCallback(
    (newDir) => {
      if (!count) return;
      setDirection(newDir);
      setCurrentIndex((prev) => (prev + newDir + count) % count);
    },
    [count]
  );

  const next = useCallback(
    (e) => {
      e.stopPropagation();
      paginate(1);
    },
    [paginate]
  );

  const prev = useCallback(
    (e) => {
      e.stopPropagation();
      paginate(-1);
    },
    [paginate]
  );

  const handleDragEnd = useCallback(
    (e, { offset, velocity }) => {
      const swipe = swipePower(offset.x, velocity.x);
      if (swipe < -swipeConfidenceThreshold) paginate(1);
      else if (swipe > swipeConfidenceThreshold) paginate(-1);
    },
    [paginate, swipePower]
  );

  const handleIndicatorClick = useCallback(
    (e, idx) => {
      e.stopPropagation();
      const newDir = idx > currentIndex ? 1 : -1;
      setDirection(newDir);
      setCurrentIndex(idx);
    },
    [currentIndex]
  );

  const showNavigation = count > 1;
  const current = media[currentIndex];

  return (
    <div className="relative h-full w-full group overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          className="absolute inset-0"
        >
          {current?.type === "youtube" ? (
            <div className="relative aspect-video h-full min-h-[280px] w-full">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={current.src}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : current?.type === "image" ? (
            <>
              {contain ? (
                <Image
                  src={current.src}
                  alt=""
                  fill
                  sizes="100vw"
                  aria-hidden
                  className="object-cover opacity-40 blur-md scale-110"
                  priority
                />
              ) : null}
              <Image
                src={current.src}
                alt={`${title} - Slide ${currentIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority
                className={contain ? "object-contain" : "object-cover"}
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600" />
          )}
        </motion.div>
      </AnimatePresence>

      {showNavigation && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity duration-300 hover:bg-black/70 group-hover:opacity-100"
            aria-label="Previous"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity duration-300 hover:bg-black/70 group-hover:opacity-100"
            aria-label="Next"
          >
            <FiChevronRight size={20} />
          </button>

          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {media.map((m, idx) => (
              <button
                key={`${m.type}-${idx}`}
                onClick={(e) => handleIndicatorClick(e, idx)}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-3 bg-white"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
