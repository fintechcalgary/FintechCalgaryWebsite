import { connectToDatabase } from "@/lib/mongodb";
import { getCommunityPosts } from "@/lib/models/communityPost";
import { serializeCommunityPost } from "@/lib/communityPosts";
import CommunityPageClient from "./CommunityPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Community Board | FinTech Calgary",
  description:
    "Discover community events and updates promoted by FinTech Calgary and partner organizations.",
  openGraph: {
    title: "Community Board | FinTech Calgary",
    description:
      "Discover community events and updates promoted by FinTech Calgary and partner organizations.",
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

export default async function CommunityPage() {
  const posts = await loadPosts();
  return <CommunityPageClient initialPosts={posts} />;
}
