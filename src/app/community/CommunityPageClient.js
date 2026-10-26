"use client";

import { useMemo, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";
import EmptyState from "@/components/ui/EmptyState";
import CommunityPostCard from "@/features/community/CommunityPostCard";
import { filterCommunityPosts } from "@/lib/communityPosts";

function PostGrid({ posts }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <div
          key={post._id}
          className="h-full animate-fadeIn"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CommunityPostCard post={post} />
        </div>
      ))}
    </div>
  );
}

function EventSection({ title, posts, emptyMessage }) {
  return (
    <section className="mb-16">
      <h2 className="fc-title mb-6 text-2xl sm:text-3xl">{title}</h2>
      {posts.length === 0 ? (
        <EmptyState
          variant="public"
          icon={FiCalendar}
          minHeightClass="min-h-[220px]"
        >
          {emptyMessage}
        </EmptyState>
      ) : (
        <PostGrid posts={posts} />
      )}
    </section>
  );
}

export default function CommunityPageClient({
  initialPosts = [],
  initialEvents = [],
}) {
  const [filter, setFilter] = useState("upcoming");
  const items = useMemo(
    () => [...initialPosts, ...initialEvents],
    [initialPosts, initialEvents],
  );
  const upcomingPosts = useMemo(
    () => filterCommunityPosts(items, "upcoming"),
    [items],
  );
  const pastPosts = useMemo(
    () => filterCommunityPosts(items, "past"),
    [items],
  );
  const allPosts = useMemo(() => filterCommunityPosts(items, "all"), [items]);

  const showPastSection = filter === "upcoming" && pastPosts.length > 0;

  return (
    <PublicPageShell title="Community | FinTech Calgary">
      <div className="container relative z-10 mx-auto flex-grow px-6 pb-24 pt-36 sm:px-8 lg:px-12">
        <div className="mb-16 animate-fadeIn text-center">
          <PageTitle sizeClass="text-3xl sm:text-4xl md:text-5xl mb-6">
            Community Board
          </PageTitle>
          <p className="fc-lede mx-auto max-w-3xl">
            Discover upcoming and past events from FinTech Calgary and our
            partner organizations.
          </p>
        </div>

        <div className="mb-8 flex justify-start" style={{ animationDelay: "200ms" }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter community events"
            className="form-input form-input-auto"
          >
            <option value="upcoming">Upcoming & past</option>
            <option value="past">Past events</option>
            <option value="all">All posts</option>
          </select>
        </div>

        {filter === "past" ? (
          <EventSection
            title="Past events"
            posts={pastPosts}
            emptyMessage="No past community events yet."
          />
        ) : filter === "all" ? (
          allPosts.length === 0 ? (
            <EmptyState
              variant="public"
              icon={FiCalendar}
              minHeightClass="min-h-[400px]"
              className="mt-12 animate-fadeIn"
            >
              No community events available.
            </EmptyState>
          ) : (
            <PostGrid posts={allPosts} />
          )
        ) : upcomingPosts.length === 0 && !showPastSection ? (
          <EmptyState
            variant="public"
            icon={FiCalendar}
            minHeightClass="min-h-[400px]"
            className="mt-12 animate-fadeIn"
          >
            No community events available for the selected filter.
          </EmptyState>
        ) : (
          <>
            {upcomingPosts.length > 0 ? (
              <EventSection title="Upcoming" posts={upcomingPosts} />
            ) : null}
            {showPastSection ? (
              <EventSection title="Past events" posts={pastPosts} />
            ) : null}
          </>
        )}
      </div>
    </PublicPageShell>
  );
}
