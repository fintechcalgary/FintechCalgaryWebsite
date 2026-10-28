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
        className="fc-card flex flex-col gap-1 p-1.5 sm:flex-row"
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
                <span className={isActive ? "fc-icon" : "text-gray-400"}>
                  <Icon className="h-5 w-5" />
                </span>
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
