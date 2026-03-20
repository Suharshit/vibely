export type EventTabId = "gallery" | "guests" | "settings" | "analytics";

interface EventTabsProps {
  activeTab: EventTabId;
  onTabChange: (tab: EventTabId) => void;
  photoCount: number;
  guestCount: number;
}

export function EventTabs({
  activeTab,
  onTabChange,
  photoCount,
  guestCount,
}: EventTabsProps) {
  const tabs: { id: EventTabId; label: string; count?: number }[] = [
    { id: "gallery", label: "Gallery", count: photoCount },
    { id: "guests", label: "Guests", count: guestCount },
    { id: "settings", label: "Settings" },
  ];

  return (
    <nav className="flex items-center gap-8 border-b border-outline-variant/10 mb-10 sticky top-0 bg-background/80 backdrop-blur-2xl z-30 pt-4 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-4 font-bold flex items-center gap-2 relative transition-all whitespace-nowrap ${
              isActive
                ? "border-b-4 border-primary text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-surface-variant text-on-surface-variant group-hover:bg-surface-container"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
