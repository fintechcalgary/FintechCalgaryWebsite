"use client";

export default function PartnersStatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
}) {
  const accents = {
    primary: {
      hover: "hover:border-primary/30",
      iconWrap: "bg-primary/20 border-primary/30",
      icon: "text-primary",
    },
    yellow: {
      hover: "hover:border-yellow-500/30",
      iconWrap: "bg-yellow-500/20 border-yellow-500/30",
      icon: "text-yellow-500",
    },
    green: {
      hover: "hover:border-green-500/30",
      iconWrap: "bg-green-500/20 border-green-500/30",
      icon: "text-green-500",
    },
  };
  const styles = accents[accent] || accents.primary;

  return (
    <div
      className={`bg-gray-900/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 transition-all duration-300 ${styles.hover}`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1 min-w-0">
          <p className="text-gray-400 text-xs sm:text-sm font-medium">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
        </div>
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center border flex-shrink-0 ${styles.iconWrap}`}
        >
          <Icon className={`text-lg sm:text-xl ${styles.icon}`} />
        </div>
      </div>
    </div>
  );
}
