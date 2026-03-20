"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Member {
  user: {
    avatar_url: string | null;
    name: string | null;
  } | null;
}

interface EventMemberStackProps {
  eventId: string;
}

export default function EventMemberStack({ eventId }: EventMemberStackProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const supabase = createClient();

      const { data, count, error } = await supabase
        .from("event_members")
        .select(
          `
          user:users (
            name,
            avatar_url
          )
        `,
          { count: "exact" }
        )
        .eq("event_id", eventId)
        .order("joined_at", { ascending: true })
        .limit(2);

      if (!error && data) {
        setMembers(data as unknown as Member[]);
        setTotalCount(count || 0);
      }
      setLoading(false);
    };

    fetchMembers();
  }, [eventId]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex -space-x-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/5"
          />
        ))}
      </div>
    );
  }

  const avatarsToShow = members.slice(0, 2);
  const remainingCount = totalCount - avatarsToShow.length;

  return (
    <div className="flex -space-x-2">
      {avatarsToShow.map((member, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden bg-surface-container relative"
          title={member.user?.name || "Member"}
        >
          {member.user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="w-full h-full object-cover"
              alt={member.user.name || "Member"}
              src={member.user.avatar_url}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-[10px] font-bold">
              {getInitials(member.user?.name || null)}
            </div>
          )}
        </div>
      ))}

      {remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-lg border-2 border-white/20 flex items-center justify-center text-[10px] text-white font-bold">
          +{remainingCount}
        </div>
      )}

      {totalCount === 0 && (
        <div className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-lg border-2 border-white/5 flex items-center justify-center text-[8px] text-white/40 font-bold italic">
          0
        </div>
      )}
    </div>
  );
}
