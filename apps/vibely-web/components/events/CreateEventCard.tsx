import { Plus } from "lucide-react";
import Link from "next/link";

export default function CreateEventCard() {
  return (
    <Link
      href="/events/create"
      className="group aspect-[3/4] sm:aspect-auto w-full min-h-[350px] flex flex-col items-center justify-center gap-4 rounded-[32px] border-2 border-dashed border-gray-300 hover:border-indigo-400 bg-gray-50/50 hover:bg-indigo-50/10 transition-all cursor-pointer overflow-hidden shadow-sm"
    >
      <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white text-indigo-500 transition-all duration-300">
        <Plus size={24} strokeWidth={2.5} />
      </div>
      <span className="font-semibold text-gray-700 group-hover:text-indigo-900 transition-colors">
        Create New Event
      </span>
    </Link>
  );
}
