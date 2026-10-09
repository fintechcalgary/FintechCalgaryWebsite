import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Link from "next/link";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiArrowLeft,
  FiUsers,
} from "react-icons/fi";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/spotlight-card";
import ImageCarousel from "@/features/events/ImageCarousel";
import Image from "next/image";
import { normalizeDate, startOfToday } from "@/lib/dates";
import StatusBadge from "@/components/ui/StatusBadge";

// Generate metadata for the event
export async function generateMetadata({ params }) {
  try {
    const { eventId } = await params;

    // Validate ObjectId format
    if (!ObjectId.isValid(eventId)) {
      return {
        title: "Event Not Found | FinTech Calgary",
        description: "The requested event could not be found.",
      };
    }

    const db = await connectToDatabase();
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(eventId) });

    if (!event) {
      return {
        title: "Event Not Found | FinTech Calgary",
        description: "The requested event could not be found.",
      };
    }

    return {
      title: `${event.title} | FinTech Calgary`,
      description:
        event.description?.substring(0, 160) ||
        "Join us for this exciting FinTech event in Calgary.",
      openGraph: {
        title: event.title,
        description:
          event.description?.substring(0, 160) ||
          "Join us for this exciting FinTech event in Calgary.",
        images: event.imageUrl ? [event.imageUrl] : [],
      },
    };
  } catch {
    return {
      title: "Event | FinTech Calgary",
      description: "FinTech Calgary Event",
    };
  }
}

function DetailRow({ icon: Icon, children }) {
  return (
    <div className="fc-body-lg flex items-center">
      <Icon className="mr-4 h-6 w-6 flex-shrink-0 text-primary" />
      <span className="text-lg">{children}</span>
    </div>
  );
}

function EventMedia({ event }) {
  const src = event.imageUrl || "/bg-image.jpg";
  const hasCarousel = event.images?.length > 0;

  return (
    <div className="relative bg-gray-950/80 sm:p-5">
      <div className="relative mx-auto h-[min(70vh,520px)] min-h-[240px] w-full overflow-hidden bg-gray-950 sm:rounded-xl">
        {hasCarousel ? (
          <ImageCarousel
            images={event.images}
            title={event.title}
            recordingUrl={event.recordingUrl}
            fit="contain"
          />
        ) : (
          <>
            <Image
              src={src}
              alt=""
              fill
              sizes="100vw"
              aria-hidden
              className="object-cover opacity-40 blur-md scale-110"
              priority
            />
            <Image
              src={src}
              alt={event.title}
              fill
              sizes="(max-width: 1024px) 100vw, 960px"
              className="object-contain"
              priority
            />
          </>
        )}
      </div>
    </div>
  );
}

// Server Component
export default async function EventPage({ params }) {
  try {
    const { eventId } = await params;

    // Validate ObjectId format
    if (!ObjectId.isValid(eventId)) {
      return (
        <PublicPageShell>
          <div className="flex flex-grow items-center justify-center">
            <div className="text-center">
              <PageTitle sizeClass="text-3xl sm:text-4xl md:text-5xl mb-4">
                Invalid Event ID
              </PageTitle>
              <p className="fc-muted mb-8">The event ID format is invalid.</p>
              <Link
                href="/events"
                className="fc-btn-primary !px-6 !py-3 !text-base"
              >
                <FiArrowLeft className="mr-2" />
                Back to Events
              </Link>
            </div>
          </div>
        </PublicPageShell>
      );
    }

    const db = await connectToDatabase();
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(eventId) });

    if (!event) {
      return (
        <PublicPageShell>
          <div className="flex flex-grow items-center justify-center">
            <div className="text-center">
              <PageTitle sizeClass="text-3xl sm:text-4xl md:text-5xl mb-4">
                Event Not Found
              </PageTitle>
              <p className="fc-muted mb-8">
                The requested event could not be found.
              </p>
              <Link
                href="/events"
                className="fc-btn-primary !px-6 !py-3 !text-base"
              >
                <FiArrowLeft className="mr-2" />
                Back to Events
              </Link>
            </div>
          </div>
        </PublicPageShell>
      );
    }

    const normalizedCurrentDate = startOfToday();
    const isUpcoming = normalizeDate(event.date) >= normalizedCurrentDate;

    return (
      <PublicPageShell>
        <div className="relative flex-grow">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
          </div>

          <div className="container relative z-10 mx-auto px-4 pb-20 pt-36">
            <div className="mb-8">
              <Link
                href="/events"
                className="fc-link group inline-flex items-center px-4 py-2 transition-colors duration-200"
              >
                <FiArrowLeft className="mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
                Back to Events
              </Link>
            </div>

            <GlowCard
              customSize
              glowColor="purple"
              className="w-full animate-fadeIn !gap-0 !overflow-hidden !p-0"
            >
              {/* Full-width media — contain so photos aren't edge-cropped */}
              <div className="relative">
                <EventMedia event={event} />
                <div className="absolute right-4 top-4 z-20 sm:right-8 sm:top-8">
                  <StatusBadge
                    tone={isUpcoming ? "primary" : "muted"}
                    size="sm"
                    className="backdrop-blur-md"
                  >
                    {isUpcoming ? "Upcoming Event" : "Past Event"}
                  </StatusBadge>
                </div>
              </div>

              <div className="relative z-10 flex flex-col justify-between p-6 md:p-8 lg:p-12">
                <div>
                  <PageTitle sizeClass="text-3xl sm:text-4xl md:text-5xl mb-6">
                    {event.title}
                  </PageTitle>

                  <div className="mb-8 grid gap-4 sm:grid-cols-2">
                    <DetailRow icon={FiCalendar}>
                      {new Date(event.date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </DetailRow>

                    {event.time ? (
                      <DetailRow icon={FiClock}>{event.time}</DetailRow>
                    ) : null}

                    {event.location ? (
                      <DetailRow icon={FiMapPin}>{event.location}</DetailRow>
                    ) : null}

                    {event.registrations?.length > 0 ? (
                      <DetailRow icon={FiUsers}>
                        {event.registrations.length} registered
                      </DetailRow>
                    ) : null}
                  </div>

                  <div className="prose prose-invert mb-8 max-w-none">
                    <div className="fc-body-lg whitespace-pre-wrap">
                      {event.description}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  {isUpcoming ? (
                    <Link
                      href={`/events/register/${event._id}`}
                      className="fc-btn-gradient-primary !px-6 !py-3"
                    >
                      {event.eventType === "webinar"
                        ? "Register for Webinar"
                        : "Register Now"}
                    </Link>
                  ) : (
                    <div className="w-full py-4 text-center">
                      <span className="fc-muted text-lg">
                        This event has already taken place
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </GlowCard>

            {event.additionalInfo ? (
              <GlowCard
                customSize
                glowColor="purple"
                className="mt-8 w-full !gap-0 !p-6"
              >
                <h3 className="fc-title-accent relative z-10 mb-4 text-xl">
                  Additional Information
                </h3>
                <div className="fc-body-lg relative z-10">
                  {event.additionalInfo}
                </div>
              </GlowCard>
            ) : null}
          </div>
        </div>
      </PublicPageShell>
    );
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return (
      <PublicPageShell>
        <div className="flex flex-grow items-center justify-center">
          <div className="text-center">
            <PageTitle sizeClass="text-3xl sm:text-4xl md:text-5xl mb-4">
              Error Loading Event
            </PageTitle>
            <p className="fc-muted mb-8">
              There was an error loading the event details.
            </p>
            <Link
              href="/events"
              className="fc-btn-primary !px-6 !py-3 !text-base"
            >
              <FiArrowLeft className="mr-2" />
              Back to Events
            </Link>
          </div>
        </div>
      </PublicPageShell>
    );
  }
}
