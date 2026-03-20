import Image from "next/image";
import type { EventDetail } from "@/hooks/useEvents";

interface EventStatsCardProps {
  members: EventDetail["event_members"];
}

export function EventStatsCard({ members }: EventStatsCardProps) {
  const totalGuests = members?.length || 0;

  // Show up to 3 avatars
  const displayMembers = members?.slice(0, 3) || [];
  const remaining = totalGuests > 3 ? totalGuests - 3 : 0;

  return (
    <div className="soft-neumorph-outset rounded-[2rem] p-8 flex items-center justify-between border border-white/5">
      <div>
        <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-black mb-1">
          Total Guests
        </p>
        <h5 className="text-4xl font-headline font-black text-white">
          {totalGuests}
        </h5>
      </div>

      <div className="flex -space-x-4">
        {displayMembers.map((member, i) => (
          <div
            key={member.id}
            className="w-12 h-12 rounded-full border-4 border-surface bg-surface-variant overflow-hidden shadow-xl"
            style={{ zIndex: 10 - i }}
          >
            {member.user?.avatar_url ? (
              <Image
                src={member.user.avatar_url}
                alt={member.user.name ?? "Guest"}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm bg-primary/10">
                {(member.user?.name ?? "?")[0].toUpperCase()}
              </div>
            )}
          </div>
        ))}

        {remaining > 0 && (
          <div
            className="w-12 h-12 rounded-full border-4 border-surface bg-surface-container-high flex items-center justify-center text-xs font-black text-primary shadow-xl"
            style={{ zIndex: 0 }}
          >
            +{remaining}
          </div>
        )}
      </div>
    </div>
  );
}
