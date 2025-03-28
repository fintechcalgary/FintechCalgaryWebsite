import Link from "next/link";
import { FiArrowRight, FiUsers, FiCode, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";
import { useState } from "react";

const FeatureCard = ({ feature, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Animated circles in background */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <motion.div
          animate={{
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 0.1 : 0,
          }}
          transition={{ duration: 0.6 }}
          className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 0.1 : 0,
          }}
          transition={{ duration: 0.6 }}
          className="absolute -left-10 -top-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl"
        />
      </div>

      <div className="relative">
        <motion.div
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.3 }}
          className="w-12 h-12 mb-6 bg-primary/10 rounded-xl flex items-center justify-center text-2xl text-primary"
        >
          {feature.icon}
        </motion.div>

        <h3 className="text-xl font-semibold text-white mb-3">
          {feature.title}
        </h3>

        <motion.p
          animate={{ opacity: isHovered ? 1 : 0.7 }}
          transition={{ duration: 0.3 }}
          className="text-gray-300"
        >
          {feature.description}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default function MissionStatement() {
  const features = [
    {
      icon: <FiUsers />,
      title: "To Educate",
      description:
        "Learn about the evolving world of Fintech and its transformative impact",
    },
    {
      icon: <FiCode />,
      title: "To Inspire",
      description: "Foster creativity and innovation in discovering new ideas",
    },
    {
      icon: <FiTrendingUp />,
      title: "To Shape",
      description: "Be part of shaping the future of financial technology",
    },
  ];

  return (
    <section id="join" className="py-24 relative">
      <div className="container mx-auto px-6 relative">
        {/* Animated title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-6xl font-bold mb-20 text-center group relative"
        >
          <div className="relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
              Mission Statement
            </span>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"
            />
          </div>
        </motion.h2>

        {/* Features grid with animated cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Animated CTA button */}
        <div className="flex justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/join"
              className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-medium rounded-full 
                       bg-primary hover:bg-primary/90 text-white transition-all duration-300 
                       hover:shadow-xl hover:shadow-primary/25"
            >
              Join Now
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <FiArrowRight className="text-xl" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
