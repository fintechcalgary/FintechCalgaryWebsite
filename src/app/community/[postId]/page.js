import Link from "next/link";
import Image from "next/image";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiExternalLink,
  FiMapPin,
} from "react-icons/fi";
import { connectToDatabase } from "@/lib/mongodb";
import {
  getCommunityPostById,
  isValidObjectId,
} from "@/lib/models/communityPost";
import { serializeCommunityPost, isAllowedBannerUrl } from "@/lib/communityPosts";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/spotlight-card";
import { formatEventDate, normalizeDate, startOfToday } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadPost(postId) {
  if (!isValidObjectId(postId)) return null;
  const db = await connectToDatabase();
  return serializeCommunityPost(await getCommunityPostById(db, postId));
}

export async function generateMetadata({ params }) {
  try {
    const post = await loadPost((await params).postId);
    if (!post) {
      return {
        title: "Community Event Not Found | FinTech Calgary",
        description: "The requested community event could not be found.",
      };
    }

    const description =
      post.description?.substring(0, 160) ||
      "Community event shared by FinTech Calgary.";

    return {
      title: `${post.title} | FinTech Calgary`,
      description,
      openGraph: {
        title: post.title,
        description,
        images: post.bannerUrl ? [post.bannerUrl] : [],
      },
    };
  } catch {
    return {
      title: "Community Event | FinTech Calgary",
      description: "Community event shared by FinTech Calgary.",
    };
  }
}

function NotFoundState({ title, message }) {
  return (
    <PublicPageShell>
      <div className="flex flex-grow items-center justify-center px-6 pb-24 pt-36">
        <div className="text-center">
          <PageTitle sizeClass="text-3xl sm:text-4xl md:text-5xl mb-4">
            {title}
          </PageTitle>
          <p className="fc-muted mb-8">{message}</p>
          <Link
            href="/community"
            className="fc-btn-primary inline-flex items-center !px-6 !py-3 !text-base"
          >
            <FiArrowLeft className="mr-2" />
            Back to Community
          </Link>
        </div>
      </div>
    </PublicPageShell>
  );
}

function DetailRow({ icon: Icon, children }) {
  return (
    <div className="fc-body-lg flex items-center">
      <Icon className="mr-4 h-6 w-6 flex-shrink-0 text-primary" />
      <span className="text-lg">{children}</span>
    </div>
  );
}

export default async function CommunityPostPage({ params }) {
  try {
    const post = await loadPost((await params).postId);
    if (!post) {
      return (
        <NotFoundState
          title="Event Not Found"
          message="The requested community event could not be found."
        />
      );
    }

    const isUpcoming = post.eventDate
      ? normalizeDate(post.eventDate) >= startOfToday()
      : true;
    const showBanner =
      Boolean(post.bannerUrl) && isAllowedBannerUrl(post.bannerUrl);

    return (
      <PublicPageShell title={`${post.title} | FinTech Calgary`}>
        <div className="relative flex-grow">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
          </div>

          <div className="container relative z-10 mx-auto px-4 pb-20 pt-36">
            <Link
              href="/community"
              className="fc-link group mb-8 inline-flex items-center px-4 py-2 transition-colors duration-200"
            >
              <FiArrowLeft className="mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
              Back to Community
            </Link>

            <GlowCard
              customSize
              glowColor="purple"
              className="mt-8 w-full animate-fadeIn !gap-0 !overflow-hidden !p-0"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative min-h-[320px] overflow-hidden bg-gradient-to-br from-primary/30 via-purple-900/40 to-gray-950 lg:min-h-[480px]">
                  {showBanner ? (
                    <Image
                      src={post.bannerUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiCalendar className="h-24 w-24 text-primary/40" />
                    </div>
                  )}
                  <span
                    className={`absolute right-4 top-4 rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md ${
                      isUpcoming
                        ? "border border-purple-500 bg-purple-600/60 text-purple-100"
                        : "border border-gray-700 bg-gray-800/60 text-gray-300"
                    }`}
                  >
                    {isUpcoming ? "Upcoming Event" : "Past Event"}
                  </span>
                </div>

                <div className="relative z-10 flex flex-col justify-between p-6 md:p-8 lg:p-12">
                  <div>
                    {post.organizationName ? (
                      <p className="mb-3 text-sm font-medium tracking-wide text-primary">
                        {post.organizationName}
                      </p>
                    ) : null}

                    <PageTitle sizeClass="text-3xl sm:text-4xl md:text-5xl mb-6">
                      {post.title}
                    </PageTitle>

                    <div className="mb-8 space-y-4">
                      {post.eventDate ? (
                        <DetailRow icon={FiCalendar}>
                          {formatEventDate(post.eventDate)}
                        </DetailRow>
                      ) : null}
                      {post.eventTime ? (
                        <DetailRow icon={FiClock}>{post.eventTime}</DetailRow>
                      ) : null}
                      {post.location ? (
                        <DetailRow icon={FiMapPin}>{post.location}</DetailRow>
                      ) : null}
                    </div>

                    <div className="mb-8">
                      <h2 className="fc-title-accent mb-3 text-xl">About</h2>
                      <p className="fc-body-lg whitespace-pre-wrap">
                        {post.description}
                      </p>
                    </div>
                  </div>

                  {post.registrationUrl ? (
                    <a
                      href={post.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fc-btn-gradient-primary inline-flex items-center justify-center gap-2 !px-6 !py-3"
                    >
                      Register
                      <FiExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      </PublicPageShell>
    );
  } catch (error) {
    console.error("Failed to fetch community post:", error);
    return (
      <NotFoundState
        title="Error Loading Event"
        message="There was an error loading the community event details."
      />
    );
  }
}
