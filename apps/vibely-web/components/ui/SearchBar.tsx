"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export default function SearchBar({
  placeholder = "Search events...",
  className = "",
  onChange,
  value,
}: SearchBarProps) {
  return (
    <div className={`relative w-full max-w-xl ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
        <Search size={18} strokeWidth={2} />
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-4 py-2.5 bg-gray-100/80 border-transparent rounded-full text-sm placeholder-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
        placeholder={placeholder}
        onChange={onChange}
        value={value}
      />
    </div>
  );
}
