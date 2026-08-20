"use client";

export default function PartnersTabNav({
  tabs,
  activeTab,
  onTabChange,
  badges = {},
}) {
  return (
    <div className="mb-6 sm:mb-8">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/45">
        Choose a section
      </p>
      <div
        role="tablist"
        aria-label="Partners sections"
        className="flex flex-col gap-1 rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/40 to-gray-800/20 p-1.5 backdrop-blur-sm sm:flex-row"
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
              className={`relative flex-1 rounded-xl border px-4 py-3.5 text-left transition-all duration-300 sm:py-4 ${
                isActive
                  ? "border-primary/40 bg-gradient-to-r from-primary/20 via-purple-600/15 to-violet-400/10 text-white shadow-lg shadow-primary/10"
                  : "border-transparent text-gray-300 hover:border-primary/25 hover:bg-primary/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
                    isActive
                      ? "border-primary/30 bg-gradient-to-br from-primary/20 to-primary/30 shadow-md shadow-primary/15"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors duration-300 ${
                      isActive ? "text-primary" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold tracking-wide sm:text-base">
                      {tab.label}
                    </span>
                    {badgeCount > 0 ? (
                      <span
                        className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border border-yellow-400/40 bg-yellow-500/90 px-1.5 text-xs font-bold tabular-nums text-gray-950 shadow-sm shadow-yellow-500/20"
                        aria-label={`${badgeCount} pending`}
                      >
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={`mt-0.5 truncate text-xs sm:text-sm ${
                      isActive ? "text-white/55" : "text-white/40"
                    }`}
                  >
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
