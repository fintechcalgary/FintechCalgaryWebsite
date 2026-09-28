"use client";

import { useMemo, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";
import CommunityPostCard from "@/features/community/CommunityPostCard";
import { filterCommunityPosts } from "@/lib/communityPosts";

export default function CommunityPageClient({ initialPosts = [] }) {
  const [filter, setFilter] = useState("upcoming");
  const filteredPosts = useMemo(
    () => filterCommunityPosts(initialPosts, filter),
    [initialPosts, filter],
  );

  return (
    <PublicPageShell title="Community | FinTech Calgary">
      <div className="container relative z-10 mx-auto flex-grow px-6 pb-24 pt-36 sm:px-8 lg:px-12">
        <div className="mb-16 animate-fadeIn text-center">
          <PageTitle sizeClass="text-3xl sm:text-4xl md:text-5xl mb-6">
            Community Board
          </PageTitle>
          <p className="fc-lede mx-auto max-w-3xl">
            Discover events and community updates from FinTech Calgary and our
            partner organizations.
          </p>
        </div>

        <div className="mb-8 flex" style={{ animationDelay: "200ms" }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-64 rounded-xl border border-gray-600 bg-gray-800/50 px-6 py-3 pl-6 pr-12 text-white shadow-lg backdrop-blur-sm hover:bg-gray-700/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="all">All Posts</option>
          </select>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="mt-12 flex min-h-[400px] animate-fadeIn flex-col items-center justify-center rounded-xl bg-gray-800/50 py-12 text-center">
            <FiCalendar className="mx-auto mb-4 text-4xl text-primary" />
            <p className="fc-muted">
              No community events available for the selected filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <div
                key={post._id}
                className="h-full animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CommunityPostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicPageShell>
  );
}
