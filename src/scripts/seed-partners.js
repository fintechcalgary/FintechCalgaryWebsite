/**
 * Seed the partners collection (display list) with the existing hardcoded partner data.
 * Run from project root: node src/scripts/seed-partners.js
 * Then run upload-partner-logos.js to upload logos to Cloudinary.
 */
const { connectToDatabase } = require("./db");
require("dotenv").config();

const PARTNERS_COLLECTION = "partners";

const SPONSORS_DATA = [
  {
    name: "University of Calgary",
    logo: "/partners/ucalgary.png",
    description:
      "Our foundational partner and home institution. The University of Calgary provides the academic foundation and support that enables FinTech Calgary to thrive as a leading student organization in financial technology innovation.",
    website:
      "https://suuofc.campuslabs.ca/engage/organization/fintechcalgary",
    color: "#dc2626",
    order: 0,
  },
  {
    name: "Dubai FinTech Summit",
    logo: "/partners/dubai-fintech-summit.png",
    description:
      "A premier global event bringing together FinTech innovators, investors, and industry leaders to shape the future of financial technology.",
    website: "https://dubaifintechsummit.com/get-involved/#buy-tickets",
    color: "#14b8a6",
    order: 1,
  },
  {
    name: "National Payments",
    logo: "/partners/national-payments.png",
    description:
      "A leading payment solutions provider offering innovative financial technology services to businesses and institutions.",
    website: "https://nationalpayments.ca/",
    color: "#22c55e",
    order: 2,
  },
  {
    name: "Trescon",
    logo: "/partners/trescon.png",
    description:
      "A global business events and consulting firm that specializes in producing high-quality B2B events focusing on tech innovation and digital transformation.",
    website: "https://www.tresconglobal.com/",
    color: "#14b8a6",
    order: 3,
  },
  {
    name: "Helcim",
    logo: "/partners/helcim.png",
    description:
      "An innovative fintech company offering integrated payment solutions and business tools built for modern commerce.",
    website:
      "https://www.helcim.com/partners/fintechcalgary/?af=3a785c9580a52b",
    color: "#eab308",
    order: 4,
  },
  {
    name: "Legal Bridge",
    logo: "/partners/legal-bridge.png",
    description:
      "Legal Bridge is a student-run organization at the University of Calgary aiming to support aspiring law students navigate the journey from undergraduate studies to law school as well as explore new advancements in the legal field.",
    website: "https://www.linkedin.com/company/legal-bridgeuofc/",
    color: "#104ee6",
    order: 5,
  },
  {
    name: "UCFSA",
    logo: "/partners/ucfsa.png",
    description:
      "The University of Calgary Filipino Students' Association (UCFSA) is a student-run organization dedicated to celebrating and promoting Filipino culture within the University of Calgary community.",
    website: "https://www.facebook.com/UCFSA/",
    color: "#E8CB47",
    order: 6,
  },
  {
    name: "Date with Tech",
    logo: "/partners/date-with-tech.png",
    description:
      "A platform dedicated to exploring emerging technologies and future innovations across industries. It brings together visionaries, business leaders, and technology experts to engage in discussions, showcase advancements, and connect with key players shaping the next wave of technological evolution.",
    website: "https://datewithtech.com/dubai/",
    color: "#00bfff",
    order: 7,
  },
  {
    name: "Beyond the Lab",
    logo: "/partners/beyond-the-lab.png",
    description:
      "A student-led club that empowers science and health students to solve real-world healthcare challenges. Our mission is to give students the tools, networks, and experiences they need to become not just future researchers or clinicians, but problem solvers, innovators, and leaders in the health space and beyond!",
    website: "https://beyondthelabclub.wixsite.com/beyond-the-lab",
    color: "#228b22",
    order: 8,
  },
  {
    name: "Pakistani Students' Society",
    logo: "/partners/pakistani-students-society.png",
    description:
      "The Pakistani Students' Society is a home away from home. We are a charity organization designed to help out with different non-profits in Pakistan. We pride ourselves on culture, respect and a love for Pakistan.",
    website: "https://www.facebook.com/PakistaniStudentsSocietyUofC/",
    color: "#228b22",
    order: 9,
  },
  {
    name: "CeresAI",
    logo: "/partners/ceresai-xyz.png",
    description:
      "An AI companions platform that turns creator expertise into always-on, personalized conversations. CeresAI builds authentic, safe AI companions for creators and brands.",
    website: "https://ceresai.xyz/",
    color: "#4169e1",
    order: 10,
  },
  {
    name: "MaxHR",
    logo: "/partners/max-hr.png",
    description:
      "Max is a wholesome work management solution for startups and enterprises seeking to simplify People, Sales, and Finance processes. Our comprehensive, all-in-one work management software simplifies human capital management, supply chain management and accounting all in one place.",
    website: "https://maxhr.io/fintech/",
    color: "#a855f7",
    order: 11,
  },
  {
    name: "APIX",
    logo: "/partners/apix.webp",
    description:
      "A Singapore-based cross-border innovation platform that accelerates digital transformation in the financial sector. APIX enables global collaboration between financial institutions, fintechs, and developers through innovation challenges, a digital sandbox, and a marketplace with open API endpoints.",
    website: "https://apixplatform.com/",
    color: "#ec4899",
    order: 12,
  },
  {
    name: "Cowboys Dance Hall",
    logo: "/partners/cowboys.png",
    description:
      "Cowboys Dance Hall is one of Calgary's most iconic entertainment destinations, known for bringing together live music and large-scale events in the heart of the city. As an official partner of Fintech, Cowboys leverages innovative payment and financial technology to enhance the guest experience, streamline transactions, and support high-volume event operations.",
    website: "https://www.cowboysnightclub.com/",
    color: "#6d1371",
    order: 13,
  },
  {
    name: "SASE",
    logo: "/partners/sase.png",
    description:
      "Famous for our unique, innovative approach, we host an extraordinary range of events designed to encompass every facet of student success—professional development, personal skill-building, wellness, empowerment, and community service. With 30+ industry and retail sponsors & partners, and a network of 1700+ students from 11+ faculties and all levels of study, we're certain that, with us, you can do ANYTHING.",
    website: "https://www.saseucalgary.ca/",
    color: "#2563eb",
    order: 14,
  },
  {
    name: "Canada FinTech Symposium",
    logo: "/partners/cfts.png",
    description:
      "Our partnership with Canada FinTech Symposium 2026 will bring together financial institutions, fintech innovators, regulators, investors, and enterprise technology leaders to shape the future of financial services in Canada.",
    website: "https://canadafintechsymposium.com/",
    color: "#dc2626",
    order: 15,
  },
];

async function seedSponsors() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection(PARTNERS_COLLECTION);

    const existingNames = await collection
      .find({}, { projection: { name: 1 } })
      .toArray()
      .then((docs) => new Set(docs.map((d) => d.name)));

    const toInsert = SPONSORS_DATA.filter((s) => !existingNames.has(s.name));

    if (toInsert.length === 0) {
      console.log(
        `All ${SPONSORS_DATA.length} partners already exist in the collection. Nothing to add.`
      );
      process.exit(0);
      return;
    }

    const docs = toInsert.map((s) => ({
      ...s,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await collection.insertMany(docs);
    console.log(`Inserted ${result.insertedCount} new partner(s).`);
    if (existingNames.size > 0) {
      console.log(`Skipped ${existingNames.size} existing partner(s).`);
    }
    if (toInsert.length < SPONSORS_DATA.length) {
      console.log(
        "Run again to verify; next: npm run upload-partner-logos to upload any new logos to Cloudinary."
      );
    } else {
      console.log(
        "Next: run npm run upload-partner-logos to upload logos to Cloudinary."
      );
    }
  } catch (error) {
    console.error("Error seeding partners:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedSponsors();
