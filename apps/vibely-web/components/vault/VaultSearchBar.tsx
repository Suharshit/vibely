"use client";

export default function VaultSearchBar() {
  return (
    <div className="relative group w-full max-w-sm">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
        search
      </span>
      <input
        className="bg-surface-container-low border border-white/5 rounded-xl py-2 pl-10 pr-4 w-full text-sm focus:ring-1 focus:ring-primary/40 focus:bg-surface-container placeholder:text-on-surface-variant/50 transition-all font-body text-on-surface"
        placeholder="Search memories..."
        type="text"
      />
    </div>
  );
}
