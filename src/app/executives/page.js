import { connectToDatabase } from "@/lib/mongodb";
import PublicPageShell from "@/components/layout/PublicPageShell";
import ExecutiveApplicationBanner from "@/features/executives/ExecutiveApplicationBanner";
import { PublicPageFrame, PublicPageHeader } from "@/components/layout/PublicPageFrame";
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
    "Executives and program leads behind FinTech Calgary, a student-run association at the University of Calgary.",
  openGraph: {
    title: "Executives | FinTech Calgary",
    description:
      "Leadership across programs, partnerships, and community initiatives.",
  },
};

// Server Component
export default async function ExecutivesPage() {
  const { executives, groupedExecutives } = await getExecutives();

  // If no executives are found, show a message instead of loading spinner
  if (executives.length === 0) {
    return (
      <PublicPageShell>
        <PublicPageFrame>
          <PublicPageHeader
            title="No Executives Found"
            lede="Please check back later."
          />
        </PublicPageFrame>
    </PublicPageShell>
    );
  }

  return (
    <PublicPageShell>

      <PublicPageFrame>
            <PublicPageHeader
              title="Meet Our Executives"
              lede="Leadership across programs, partnerships, and community initiatives."
            />

            {/* Executives Grid */}
            <div className="space-y-16">
              {Object.keys(groupedExecutives).map((role) => (
                <section key={role} className="space-y-8 animate-fadeIn">
                  {/* Role Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-grow bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    <h2 className="fc-title-accent text-2xl px-4">
                      {role}
                    </h2>
                    <div className="h-px flex-grow bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                  </div>

                  {/* Executives List */}
                  <div className="flex flex-wrap gap-8 justify-center">
                    {groupedExecutives[role].map((executive) => (
                      <div
                        key={executive._id}
                        className="flex w-full max-w-[300px] flex-col items-center gap-4 text-center transition-transform duration-300 hover:scale-105"
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
                          <h3 className="fc-title text-xl transition-colors">
                            {executive.name}
                          </h3>
                          <p className="fc-body">
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
                            <p className="fc-body mt-2">
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
      </PublicPageFrame>

      <ExecutiveApplicationBanner />
    </PublicPageShell>
  );
}
