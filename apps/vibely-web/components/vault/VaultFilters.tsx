"use client";

import VaultSearchBar from "./VaultSearchBar";

export default function VaultFilters() {
  const filters = ["All Media", "Recent Events"];

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-1">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border border-white/5 ${
              filter === "All Media"
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <VaultSearchBar />
        <button className="flex items-center gap-2 text-primary font-semibold text-sm active:scale-95 transition-all shrink-0">
          <div className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 px-4 py-2 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-sm">
              calendar_month
            </span>
            <span>Date Range</span>
          </div>
        </button>
      </div>
    </div>
  );
}
