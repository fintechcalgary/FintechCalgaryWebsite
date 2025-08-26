import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Link from "next/link";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiArrowLeft,
  FiUsers,
  FiExternalLink,
} from "react-icons/fi";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import ImageCarousel from "@/components/ImageCarousel";
import Image from "next/image";

// Helper function to normalize dates to start of day for consistent comparison
const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// Generate metadata for the event
export async function generateMetadata({ params }) {
  try {
    const db = await connectToDatabase();
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(params.eventId) });

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
  } catch (error) {
    return {
      title: "Event | FinTech Calgary",
      description: "FinTech Calgary Event",
    };
  }
}

// Server Component
export default async function EventPage({ params }) {
  try {
    const db = await connectToDatabase();
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(params.eventId) });

    if (!event) {
      return (
        <main className="flex flex-col min-h-screen">
          <PublicNavbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Event Not Found
              </h1>
              <p className="text-gray-400 mb-8">
                The requested event could not be found.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-300"
              >
                <FiArrowLeft className="mr-2" />
                Back to Events
              </Link>
            </div>
          </div>
          <Footer />
        </main>
      );
    }

    // Convert ObjectId to string for client-side use
    const eventData = {
      ...event,
      _id: event._id.toString(),
    };

    const currentDate = new Date();
    const normalizedCurrentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const isUpcoming = normalizeDate(event.date) >= normalizedCurrentDate;

    return (
      <main className="flex flex-col min-h-screen">
        <PublicNavbar />

        <div className="relative flex-grow">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
            {/* Back Button */}
            <div className="mb-8">
              <Link
                href="/events"
                className="inline-flex items-center px-4 py-2 text-gray-300 hover:text-white group transition-colors duration-200"
              >
                <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Back to Events
              </Link>
            </div>

            {/* Main Event Card */}
            <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-800/50 shadow-xl animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
                {/* Image Section */}
                <div className="relative bg-gray-950 overflow-hidden">
                  {event.images?.length > 0 ? (
                    <div className="w-full h-full min-h-[400px]">
                      <ImageCarousel
                        images={event.images}
                        title={event.title}
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
                      {/* Blurred background version of the image */}
                      <div className="absolute inset-0 overflow-hidden">
                        <Image
                          src={event.imageUrl || "/bg-image.jpg"}
                          alt=""
                          fill
                          className="object-cover blur-md scale-110 opacity-50"
                          priority
                        />
                      </div>

                      {/* Main image with proper dimensions */}
                      <Image
                        src={event.imageUrl || "/bg-image.jpg"}
                        alt={event.title}
                        width={800}
                        height={600}
                        className="relative z-10 max-w-full max-h-[600px] object-contain"
                        priority
                      />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md ${
                        isUpcoming
                          ? "bg-purple-600/60 text-purple-100 border border-purple-500"
                          : "bg-gray-800/60 text-gray-300 border border-gray-700"
                      }`}
                    >
                      {isUpcoming ? "Upcoming Event" : "Past Event"}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-between">
                  <div>
                    {/* Event Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
                      {event.title}
                    </h1>

                    {/* Event Details */}
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-300">
                        <FiCalendar className="w-6 h-6 mr-4 text-primary flex-shrink-0" />
                        <span className="text-lg">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {event.time && (
                        <div className="flex items-center text-gray-300">
                          <FiClock className="w-6 h-6 mr-4 text-primary flex-shrink-0" />
                          <span className="text-lg">{event.time}</span>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center text-gray-300">
                          <FiMapPin className="w-6 h-6 mr-4 text-primary flex-shrink-0" />
                          <span className="text-lg">{event.location}</span>
                        </div>
                      )}

                      {event.registrations &&
                        event.registrations.length > 0 && (
                          <div className="flex items-center text-gray-300">
                            <FiUsers className="w-6 h-6 mr-4 text-primary flex-shrink-0" />
                            <span className="text-lg">
                              {event.registrations.length} registered
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="prose prose-invert max-w-none mb-8">
                      <div className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {isUpcoming ? (
                      <Link
                        href={`/events/register/${event._id}`}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/25"
                      >
                        Register Now
                      </Link>
                    ) : (
                      <div className="w-full text-center py-4">
                        <span className="text-gray-400 text-lg">
                          This event has already taken place
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            {event.additionalInfo && (
              <div className="mt-8 bg-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Additional Information
                </h3>
                <div className="text-gray-300 leading-relaxed">
                  {event.additionalInfo}
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>
    );
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return (
      <main className="flex flex-col min-h-screen">
        <PublicNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Error Loading Event
            </h1>
            <p className="text-gray-400 mb-8">
              There was an error loading the event details.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-300"
            >
              <FiArrowLeft className="mr-2" />
              Back to Events
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }
}
