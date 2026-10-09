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
import StatusBadge from "@/components/ui/StatusBadge";
import IconButton from "@/components/ui/IconButton";
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
            <StatusBadge
              tone={isUpcoming ? "primary" : "muted"}
              size="sm"
              className="backdrop-blur-md justify-center"
            >
              {isUpcoming ? "Upcoming" : "Past"}
            </StatusBadge>
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
          className="fc-btn-gradient-primary px-4 py-2"
        >
          View Details
        </Link>

        {post.registrationUrl ? (
          <a
            href={post.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fc-btn-soft-chip px-4 py-2"
          >
            Register
            <FiExternalLink className="h-4 w-4" />
          </a>
        ) : null}

        {canManage ? (
          <div className="ml-auto flex items-center gap-2">
            <IconButton
              variant="soft"
              label="Edit post"
              onClick={() => onEdit?.(post)}
            >
              <FiEdit2 className="h-4 w-4" />
            </IconButton>
            <IconButton
              variant="soft-danger"
              label="Delete post"
              onClick={() => onDelete?.(post)}
            >
              <FiTrash2 className="h-4 w-4" />
            </IconButton>
          </div>
        ) : null}
      </div>
    </GlowCard>
  );
}
