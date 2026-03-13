import Image from "next/image";
import Link from "next/link";

// interface EventTag {
//   label: string;
// }

interface EventCardProps {
  id: string;
  title: string;
  dateStr: string;
  description: string;
  imageUrl: string;
  status: "ACTIVE" | "EXPIRED";
  tags: string[]; // Simplest format as string array
}

export default function EventCard({
  id,
  title,
  dateStr,
  description,
  imageUrl,
  status,
  // tags,
}: EventCardProps) {
  const isExpired = status === "EXPIRED";

  return (
    <Link
      href={`/events/${id}`}
      className="group relative block w-full aspect-[1/2] sm:aspect-auto sm:h-[480px] rounded-[32px] overflow-hidden bg-gray-900 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Background Image */}
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient Overlay for Text Visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />

      {/* Content Container */}
      <div className="absolute inset-0 p-6 flex flex-col pointer-events-none">
        {/* Top: Status Badges & Basic Info could go here, but design has it lower */}

        {/* Bottom portion */}
        <div className="mt-auto flex flex-col gap-2">
          {/* Header Row: Title & Status Badge */}
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-[28px] font-bold text-white tracking-tight drop-shadow-sm line-clamp-2 leading-tight">
              {title}
            </h2>
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex-shrink-0 backdrop-blur-md border border-white/20 shadow-sm
                ${isExpired ? "bg-white/10 text-white/80" : "bg-white/20 text-white"}
              `}
            >
              {status}
            </div>
          </div>

          <p className="text-white/90 text-sm font-medium">{dateStr}</p>

          <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed font-light mt-1">
            {description}
          </p>

          {/* TODO Add Tags logics */}
          {/* Tags
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div> */}

          {/* Action Button */}
          <div className="mt-6 pointer-events-auto">
            {isExpired ? (
              <span className="w-full py-4 px-6 rounded-full font-bold text-sm bg-[#222222] hover:bg-[#1a1a1a] text-white border border-white/10 transition-colors shadow-lg flex items-center justify-center cursor-pointer">
                View Archive
              </span>
            ) : (
              <span className="w-full py-4 px-6 rounded-full font-bold text-sm bg-white hover:bg-gray-50 text-gray-900 border border-transparent hover:border-gray-200 transition-colors shadow-xl flex items-center justify-center gap-2 group-hover:scale-[1.02] cursor-pointer">
                View Vault
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
