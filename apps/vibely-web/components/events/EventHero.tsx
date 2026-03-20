import Image from "next/image";
import Link from "next/link";
import { formatEventDate, isEventExpired } from "@shared/utils/invite";

interface EventHeroProps {
  id: string;
  title: string;
  date: string;
  location?: string | null;
  guestCount: number;
  coverImageUrl?: string | null;
  status: string;
  expiresAt?: string | null;
  isHost: boolean;
}

export function EventHero({
  title,
  date,
  location,
  guestCount,
  coverImageUrl,
  status,
  expiresAt,
}: EventHeroProps) {
  const expired = expiresAt ? isEventExpired(expiresAt) : false;
  const isActive = status === "active" && !expired;

  return (
    <header className="relative h-[480px] w-full overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 z-0">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            fill
            sizes="100vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-violet-200 via-purple-100 to-pink-100" />
        )}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      </div>

      <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 z-10 box-content"></div>

      {/* Back Button & Host Actions */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/dashboard"
          className="w-12 h-12 flex items-center justify-center bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-black/40 hover:scale-105 transition-all shadow-xl"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>
      </div>

      {/* Glass Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>

      <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            {isActive ? (
              <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/40">
                Active Event
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant border border-outline-variant/20 text-[10px] font-bold uppercase tracking-widest">
                {expired ? "Ended" : "Inactive"}
              </span>
            )}

            <span className="glass-card px-3 py-1 rounded-full text-white text-xs flex items-center gap-1 font-medium bg-surface-container/60 backdrop-blur-md border border-white/5">
              <span className="material-symbols-outlined text-base">
                calendar_today
              </span>
              {formatEventDate(date)}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-black tracking-tighter text-white mb-6 drop-shadow-2xl max-w-4xl line-clamp-2">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-on-surface font-semibold bg-black/20 backdrop-blur-md px-6 py-3 rounded-2xl w-fit border border-white/10 shadow-2xl">
            {location ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    location_on
                  </span>
                  <span>{location}</span>
                </div>
                <div className="h-4 w-px bg-white/20"></div>
              </>
            ) : null}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                group
              </span>
              <span>{guestCount} guests</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
