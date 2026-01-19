import { connectToDatabase } from "@/lib/mongodb";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import ExecutiveApplicationBanner from "@/components/ExecutiveApplicationBanner";
import { SiLinkedin } from "react-icons/si";
import { FiMail } from "react-icons/fi";
import Image from "next/image";

// Server-side data fetching function
async function getExecutives() {
  try {
    const db = await connectToDatabase();
    const executives = await db
      .collection("executives")
      .find({})
      .sort({ order: 1 })
      .toArray();

    // Convert MongoDB documents to plain objects and handle ObjectId
    const plainExecutives = executives.map((executive) => ({
      ...executive,
      _id: executive._id.toString(),
    }));

    // Group executives by team on the server
    const grouped = plainExecutives.reduce((acc, executive) => {
      if (!acc[executive.team]) acc[executive.team] = [];
      acc[executive.team].push(executive);
      return acc;
    }, {});

    return { executives: plainExecutives, groupedExecutives: grouped };
  } catch (error) {
    console.error("Failed to fetch executives:", error);
    return { executives: [], groupedExecutives: {} };
  }
}

// Generate metadata on the server
export const metadata = {
  title: "Executives | FinTech Calgary",
  description:
    "Meet the dedicated executives and team members of FinTech Calgary - Calgary's Premier FinTech Community",
  openGraph: {
    title: "Executives | FinTech Calgary",
    description: "Meet our dedicated team of executives and leaders",
  },
};

// Server Component
export default async function ExecutivesPage() {
  const { executives, groupedExecutives } = await getExecutives();

  // If no executives are found, show a message instead of loading spinner
  if (executives.length === 0) {
    return (
      <main className="flex flex-col min-h-screen">
        <PublicNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              No Executives Found
            </h1>
            <p className="text-gray-400">Please check back later.</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen">
      <PublicNavbar />

      <div className="relative flex-grow">
        <section className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80 z-0"></div>

          {/* Content Section */}
          <div className="relative z-10 container mx-auto px-6 py-24 sm:px-8 lg:px-12">
            {/* Page Heading */}
            <div className="text-center mb-16 animate-fadeIn">
              <h1 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
                Meet Our Executives
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our dedicated team is here to make a difference.
              </p>
            </div>

            {/* Executives Grid */}
            <div className="space-y-16">
              {Object.keys(groupedExecutives).map((role) => (
                <section key={role} className="space-y-8 animate-fadeIn">
                  {/* Role Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-grow bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    <h2 className="text-3xl font-bold text-white px-4">
                      {role}
                    </h2>
                    <div className="h-px flex-grow bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                  </div>

                  {/* Executives List */}
                  <div className="flex flex-wrap gap-8 justify-center">
                    {groupedExecutives[role].map((executive) => (
                      <div
                        key={executive._id}
                        className="flex flex-col items-center text-center gap-4 w-full max-w-[300px] hover:scale-102 transition-transform duration-300"
                      >
                        <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-primary/50 hover:border-primary transition-colors duration-300 shadow-lg relative">
                          <Image
                            src={executive.imageUrl || "/placeholder.png"}
                            alt={`${executive.name}'s profile`}
                            fill
                            sizes="192px"
                            className="object-cover"
                            priority
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-primary">
                            {executive.position}
                          </p>
                          <h3 className="text-xl font-semibold text-white transition-colors">
                            {executive.name}
                          </h3>
                          <p className="text-base text-gray-300">
                            {executive.major}
                          </p>
                          <div className="flex items-center justify-center gap-3">
                            <a
                              href={`mailto:${executive.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-400 hover:text-primary transition-colors"
                              aria-label={`Email ${executive.name}`}
                            >
                              <FiMail className="w-5 h-5" />
                            </a>
                            {executive.linkedinUrl && (
                              <a
                                href={executive.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#0077b5] transition-colors"
                              >
                                <SiLinkedin className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                          {executive.description && (
                            <p className="text-sm text-gray-400 mt-2">
                              {executive.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </div>

      <ExecutiveApplicationBanner />
      <Footer />
    </main>
  );
}
