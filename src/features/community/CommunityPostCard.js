"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FiCalendar,
  FiEdit2,
  FiExternalLink,
  FiTrash2,
} from "react-icons/fi";
import { GlowCard } from "@/components/ui/spotlight-card";
import { normalizeDate, startOfToday } from "@/lib/dates";
import { isAllowedBannerUrl } from "@/lib/communityPosts";

export default function CommunityPostCard({
  post,
  canManage = false,
  onEdit,
  onDelete,
}) {
  const href = `/community/${post._id}`;
  const isUpcoming = post.eventDate
    ? normalizeDate(post.eventDate) >= startOfToday()
    : true;
  const showBanner =
    Boolean(post.bannerUrl) && isAllowedBannerUrl(post.bannerUrl);

  const dateLabel = post.eventDate
    ? new Date(
        String(post.eventDate).includes("T")
          ? post.eventDate
          : `${post.eventDate}T00:00:00`,
      ).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <GlowCard
      customSize
      glowColor="purple"
      className="group flex h-full w-full flex-col !gap-0 !p-0"
    >
      <Link href={href} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/40 via-purple-900/50 to-gray-900">
          {showBanner ? (
            <Image
              src={post.bannerUrl}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="object-cover"
            />
          ) : null}

          <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
            <span
              className={`flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-md ${
                isUpcoming
                  ? "border border-purple-500 bg-purple-600/60 text-purple-100"
                  : "border border-gray-700 bg-gray-800/60 text-gray-300"
              }`}
            >
              {isUpcoming ? "Upcoming" : "Past"}
            </span>
            {post.organizationName ? (
              <span className="flex items-center justify-center rounded-full border border-purple-500 bg-purple-600/60 px-3 py-1.5 text-xs font-semibold text-purple-100 backdrop-blur-md">
                {post.organizationName}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col p-6">
          <h4 className="fc-title mb-2 line-clamp-2 text-xl transition-colors duration-300 group-hover:text-primary sm:text-2xl">
            {post.title}
          </h4>

          <p className="fc-body mb-4 line-clamp-2">{post.description}</p>

          {dateLabel ? (
            <div className="mt-auto flex items-center space-x-2 fc-body">
              <FiCalendar className="h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm font-medium">
                {dateLabel}
                {post.eventTime ? (
                  <span className="ml-1 font-semibold text-primary">
                    {` at ${post.eventTime}`}
                  </span>
                ) : null}
              </p>
            </div>
          ) : (
            <div className="mt-auto" />
          )}
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-3 px-6 pb-6">
        <Link
          href={href}
          className="inline-flex items-center rounded-xl bg-primary/90 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/15"
        >
          View Details
        </Link>

        {post.registrationUrl ? (
          <a
            href={post.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/20 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-primary/30"
          >
            Register
            <FiExternalLink className="h-4 w-4" />
          </a>
        ) : null}

        {canManage ? (
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(post)}
              className="rounded-xl border border-gray-600/50 bg-gray-800/50 p-2.5 text-gray-300 transition-colors hover:border-primary/40 hover:text-primary"
              aria-label="Edit post"
            >
              <FiEdit2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(post)}
              className="rounded-xl border border-gray-600/50 bg-gray-800/50 p-2.5 text-gray-300 transition-colors hover:border-red-400/40 hover:text-red-300"
              aria-label="Delete post"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </GlowCard>
  );
}
