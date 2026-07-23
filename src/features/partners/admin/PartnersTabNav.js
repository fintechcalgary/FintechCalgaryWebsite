"use client";

export default function PartnersTabNav({
  tabs,
  activeTab,
  onTabChange,
  badges = {},
}) {
  return (
    <div className="mb-6 sm:mb-8">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
        Choose a section
      </p>
      <div
        role="tablist"
        aria-label="Partners sections"
        className="flex flex-col sm:flex-row gap-1 p-1.5 rounded-2xl bg-gray-900/80 border border-white/10"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badgeCount = badges[tab.id] || 0;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`partners-panel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 text-left rounded-xl px-4 py-3.5 sm:py-4 transition-all duration-200 border ${
                isActive
                  ? "border-primary/50 bg-transparent text-white"
                  : "border-transparent text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-800/80">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-primary" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base truncate">
                      {tab.label}
                    </span>
                    {badgeCount > 0 ? (
                      <span
                        className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold tabular-nums bg-yellow-500 text-gray-950"
                        aria-label={`${badgeCount} pending`}
                      >
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs sm:text-sm mt-0.5 truncate text-gray-500">
                    {tab.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
