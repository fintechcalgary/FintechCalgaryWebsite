"use client";

import { motion } from "framer-motion";
import StatBand from "@/components/ui/StatBand";

export default function DigestSnapshotStrip({ keyInsights, totalArchiveArticles }) {
  const digestCount = keyInsights.totalArticles ?? 0;
  const archiveCount =
    keyInsights.totalArchiveArticles ?? totalArchiveArticles ?? 0;
  const sourcesCount = keyInsights.uniqueSources ?? 0;
  const daysCount = keyInsights.coverage ?? 0;

  const segments = [
    { value: digestCount, phrase: "articles this week" },
    { value: archiveCount, phrase: "in the archive" },
    { value: sourcesCount, phrase: "news sources" },
    { value: daysCount, phrase: "days covered" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="mb-4 md:mb-6"
      aria-label="Digest snapshot statistics"
    >
      <StatBand>
        <div className="relative flex flex-col items-center gap-4 px-2 py-6 md:gap-5 md:px-6 md:py-8">
          <p className="text-muted text-center text-xs md:text-sm">
            This week at a glance
          </p>

          <p className="mx-auto max-w-3xl text-center md:text-lg md:leading-[1.75]">
            {segments.map((seg, i) => (
              <span key={seg.phrase} className="inline">
                {i > 0 && (
                  <span
                    className="mx-2 inline text-white/25 md:mx-3"
                    aria-hidden
                  >
                    ·
                  </span>
                )}
                <span className="font-semibold tabular-nums tracking-tight text-white">
                  {seg.value}
                </span>
                <p className="text-muted inline">
                  {" "}
                  {seg.phrase}
                </p>
              </span>
            ))}
          </p>
        </div>
      </StatBand>
    </motion.div>
  );
}
