import { connectToDatabase } from "@/lib/mongodb";
import { getCommunityPosts } from "@/lib/models/communityPost";
import {
  serializeCommunityPost,
  toCommunityBoardEvent,
} from "@/lib/communityPosts";
import CommunityPageClient from "./CommunityPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Community Board | FinTech Calgary",
  description:
    "Discover upcoming and past community events promoted by FinTech Calgary and partner organizations.",
  openGraph: {
    title: "Community Board | FinTech Calgary",
    description:
      "Discover upcoming and past community events promoted by FinTech Calgary and partner organizations.",
  },
};

async function loadPosts() {
  try {
    const db = await connectToDatabase();
    const posts = await getCommunityPosts(db);
    return posts.map(serializeCommunityPost);
  } catch (error) {
    console.error("Failed to fetch community posts:", error);
    return [];
  }
}

async function loadClubEvents() {
  try {
    const db = await connectToDatabase();
    const events = await db
      .collection("events")
      .find(
        { isPartner: { $ne: true } },
        {
          projection: {
            title: 1,
            description: 1,
            date: 1,
            time: 1,
            location: 1,
            imageUrl: 1,
            images: 1,
          },
        },
      )
      .toArray();
    return events.map(toCommunityBoardEvent).filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch club events for the community board:", error);
    return [];
  }
}

export default async function CommunityPage() {
  const [posts, events] = await Promise.all([loadPosts(), loadClubEvents()]);
  return <CommunityPageClient initialPosts={posts} initialEvents={events} />;
}
