"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Settings, Cloud, SunMoon, LogOut } from "lucide-react";

export default function ProfileButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("users")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setUserName(data.name || "User");
            setAvatarUrl(data.avatar_url);
          }
        });
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleThemeToggle = () => {
    // Placeholder implementation for theme toggle logic
    // Add real implementation when global theme context exists
    console.log("Theme toggled");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-transparent hover:border-indigo-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 overflow-hidden bg-white shadow-sm"
        aria-label="User profile"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={userName}
            className="w-full h-full object-cover"
            width={40}
            height={40}
          />
        ) : (
          <span className="text-sm font-semibold text-gray-700">
            {userName[0]?.toUpperCase() || "U"}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 z-50 overflow-hidden transform transition-all origin-top-right">
          {/* Header */}
          <div className="p-4 border-b border-gray-50 flex flex-col gap-1.5 bg-gray-50/50">
            <span className="font-semibold text-gray-900 truncate">
              {userName}
            </span>
          </div>

          {/* Links Core */}
          <div className="p-2 space-y-0.5">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors font-medium"
            >
              <User size={16} />
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors font-medium"
            >
              <Settings size={16} />
              Settings
            </Link>
            <Link
              href="/vault"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors font-medium"
            >
              <Cloud size={16} />
              Personal Vault
            </Link>
          </div>

          <div className="p-2 border-t border-gray-50 space-y-0.5">
            <button
              onClick={() => {
                handleThemeToggle();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              <span className="flex items-center gap-3">
                <SunMoon size={16} />
                Theme
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                Light
              </span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 mt-1 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors font-medium"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
