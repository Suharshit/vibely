import Link from "next/link";
import { isEventExpired } from "@shared/utils/invite";
import EventMemberStack from "./EventMemberStack";

interface EventCardProps {
  id: string;
  title: string;
  event_date: string;
  description?: string | null;
  cover_image_url?: string | null;
  status: string;
  expires_at?: string | null;
}

export default function EventCard({
  id,
  title,
  event_date,
  // description,
  cover_image_url,
  status,
  expires_at,
}: EventCardProps) {
  const expired = isEventExpired(expires_at || "") || status !== "active";
  const coverImg =
    cover_image_url ||
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop";

  return (
    <Link
      href={`/events/${id}`}
      className="group relative h-96 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/20 border border-white/5"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        alt={title}
        src={coverImg}
      />

      {/* Glassy Overlay Container */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/20">
          {expired ? "Archived" : "Live"}
        </div>

        {/* Event Details - Glassmorphic Card Style */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <h4 className="text-xl font-bold font-headline text-white mb-1 truncate">
            {title}
          </h4>
          <div className="flex items-center gap-2 text-white/60 mb-4">
            <span className="material-symbols-outlined text-sm">
              calendar_today
            </span>
            <p className="text-[10px] font-label uppercase tracking-widest truncate">
              {new Date(event_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
            <EventMemberStack eventId={id} />
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary-container shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
