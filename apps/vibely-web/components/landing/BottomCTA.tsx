// ============================================================
// components/landing/BottomCTA.tsx
// ============================================================
// Final call to action section with a large neumorphic card
// ============================================================
import Link from "next/link";

export function BottomCTA() {
  return (
    <section className="py-24 bg-neumorphic px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-neumorphic rounded-[3rem] p-12 sm:p-20 shadow-neumorphic border border-white/50 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Ready to capture the vibe?
          </h2>
          <p className="text-gray-500 mb-10 max-w-lg mx-auto">
            Join thousands of hosts making their events unforgettable.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-10 py-4 bg-neumorphic-purple text-white text-base font-semibold rounded-full shadow-neumorphic hover:shadow-neumorphic-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Start My Free Event
          </Link>
        </div>
      </div>
    </section>
  );
}
