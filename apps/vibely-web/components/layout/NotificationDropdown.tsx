"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Connect to the new hook
  const { notifications, unreadCount, markAllAsRead, isLoading } =
    useNotifications();

  // Close dropdown when clicking outside
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

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Optional: Auto-mark read on open if preferred, or rely on the "Mark all as read" button
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <IconButton
          aria-label="Notifications"
          onClick={handleToggle}
          active={isOpen}
        >
          <Bell size={20} className="stroke-[2.5]" />
        </IconButton>

        {/* Red Dot Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 z-50 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-sm text-gray-400 animate-pulse">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-2">
                <Bell size={24} className="text-gray-300" />
                <span className="text-sm text-gray-500 font-medium">
                  No new notifications
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className={`p-3 pt-[3px] border-b last:border-0 border-gray-50 hover:bg-zinc-100 transition-colors flex gap-1 text-left ${!notif.is_read ? "bg-indigo-50/20" : ""}`}
                  >
                    {!notif.is_read && (
                      <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                    )}
                    <div className="flex flex-col gap-1 w-full">
                      <p className="text-sm text-gray-800 font-medium leading-tight">
                        {notif.message}
                      </p>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {formatDistanceToNow(new Date(notif.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
