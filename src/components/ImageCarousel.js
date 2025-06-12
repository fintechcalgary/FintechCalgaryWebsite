"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageCarousel({ images, title }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Memoize the slide variants configuration
  const slideVariants = useMemo(
    () => ({
      enter: (direction) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
      }),
      center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
      },
      exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
      }),
    }),
    []
  );

  // Memoize constants
  const swipeConfidenceThreshold = useMemo(() => 10000, []);

  const swipePower = useCallback((offset, velocity) => {
    return Math.abs(offset) * velocity;
  }, []);

  const paginate = useCallback(
    (newDirection) => {
      setDirection(newDirection);
      setCurrentImageIndex(
        (prev) => (prev + newDirection + images.length) % images.length
      );
    },
    [images.length]
  );

  const nextImage = useCallback(
    (e) => {
      e.stopPropagation();
      paginate(1);
    },
    [paginate]
  );

  const prevImage = useCallback(
    (e) => {
      e.stopPropagation();
      paginate(-1);
    },
    [paginate]
  );

  // Memoize drag end handler
  const handleDragEnd = useCallback(
    (e, { offset, velocity }) => {
      const swipe = swipePower(offset.x, velocity.x);

      if (swipe < -swipeConfidenceThreshold) {
        paginate(1);
      } else if (swipe > swipeConfidenceThreshold) {
        paginate(-1);
      }
    },
    [swipePower, swipeConfidenceThreshold, paginate]
  );

  // Memoize indicator click handler
  const handleIndicatorClick = useCallback(
    (e, idx) => {
      e.stopPropagation();
      const newDirection = idx > currentImageIndex ? 1 : -1;
      setDirection(newDirection);
      setCurrentImageIndex(idx);
    },
    [currentImageIndex]
  );

  // Memoize whether to show navigation controls
  const showNavigation = useMemo(() => images.length > 1, [images.length]);

  return (
    <div className="relative w-full h-full group overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentImageIndex}
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
          <Image
            src={images[currentImageIndex]}
            alt={`${title} - Image ${currentImageIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {showNavigation && (
        <>
          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          >
            <FiChevronLeft size={20} />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          >
            <FiChevronRight size={20} />
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => handleIndicatorClick(e, idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex
                    ? "bg-white w-3"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
