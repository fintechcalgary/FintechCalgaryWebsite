import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Partners() {
  const [hoveredPartner, setHoveredPartner] = useState(null);

  const partners = [
    {
      name: "Dubai FinTech Summit",
      logo: "/partners/dubai-fintech-summit.png",
      color: "#6d28d9",
    },
    {
      name: "National Payments",
      logo: "/partners/national-payments.png",
      color: "#8b5cf6",
    },
    {
      name: "Trescon",
      logo: "/partners/trescon.png",
      color: "#a78bfa",
    },
  ];

  return (
    <section id="partners" className="py-24 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')] bg-center pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[128px] translate-x-1/2 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[96px] -translate-x-1/2 opacity-20"></div>

      <div className="container mx-auto px-6 relative">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-6xl font-bold mb-20 text-center"
        >
          <Link href="/partners" className="group inline-block relative">
            <div className="flex items-center justify-center gap-4 hover:gap-6 transition-all duration-300">
              <div className="relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary">
                  Our Partners
                </span>
                <motion.div
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-primary to-purple-500 rounded-full"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                ></motion.div>
              </div>
            </div>
          </Link>
        </motion.h2>

        {/* Partners Showcase - Modernized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div
            className="bg-gradient-to-br from-gray-800/60 to-gray-900/80 rounded-3xl p-10 lg:p-12 
            shadow-xl border border-gray-700/50 backdrop-blur-xl"
          >
            <p className="text-lg text-gray-300 leading-relaxed mb-12 text-center max-w-3xl mx-auto">
              We&apos;re proud to collaborate with industry leaders who share
              our vision for innovation in financial technology.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onHoverStart={() => setHoveredPartner(partner.name)}
                  onHoverEnd={() => setHoveredPartner(null)}
                  className="group relative"
                >
                  <div
                    className="bg-[#12121a]/80 backdrop-blur-xl rounded-2xl p-6 w-full h-48 flex flex-col items-center justify-center
                    border border-gray-700/50 hover:border-primary/50 transition-all duration-300
                    hover:shadow-lg hover:shadow-primary/20 overflow-hidden"
                  >
                    {/* Dynamic background gradient on hover */}
                    <motion.div
                      className="absolute inset-0 opacity-0 rounded-2xl z-0"
                      style={{
                        background: `radial-gradient(circle at center, ${partner.color}20 0%, transparent 70%)`,
                      }}
                      animate={{
                        opacity: hoveredPartner === partner.name ? 0.8 : 0,
                        scale: hoveredPartner === partner.name ? 1.2 : 1,
                      }}
                      transition={{ duration: 0.5 }}
                    />

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative w-full h-28 flex items-center justify-center z-10"
                    >
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={180}
                        height={90}
                        className="object-contain max-h-28"
                      />
                    </motion.div>

                    <motion.p
                      className="mt-6 text-gray-300 text-center font-medium z-10"
                      animate={{
                        color:
                          hoveredPartner === partner.name
                            ? "#ffffff"
                            : "#d1d5db",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {partner.name}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link
                  href="/partners"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary/90 to-purple-500/90 
                    text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 group"
                >
                  <span>View All Partners</span>
                  <FiArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
