import Image from "next/image";

// Pre-defined mock activity to populate the feed
const MOCK_ACTIVITIES = [
  {
    id: "act_1",
    user: {
      name: "Sarah M.",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBK6tf2CSlaONDq-6yHqo08r8aqYZe2sgtaxFnKkLZkbKjsBQkAJJatIsj1RWrdlDEwixyC0qIp2JDbKazKUak2tRzQgdjrw35NAWHaxz_J1oaaE-c9U0nhmPUv12ubY7JQOf4g-YRV9vENtHtAZoTmJnmmZXo9GPdJJoq45RytBL4mSGGyPrmxHtRRHUf70iBNR0Ki1-ye4IF99411WwngSPt-bqv4jiPddUmwXKFdnGiDI_zgmRb6MJ3DXKHstI_BDGdweqM4maY8",
    },
    action: "uploaded 4 photos",
    timeAgo: "2 minutes ago",
  },
  {
    id: "act_2",
    user: {
      name: "David L.",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAmOzJObw64X-YIr4JJsmUT34kvR1frO6mdtGY29pLShh4pB22UOZpWybLInV70tsvHFSdpUAM9scRoBVFrsWb4n1A_dRSLLOI_91f-PfcviKwMhMF1DpAR2rpG0_k0a4eF3SUvxjk7VSy6PuXMeWSTFaS-B1IjN9pQO26kHgC8vyGNroAK0Ml1z9cAYLZ_1vrXE_CxNkIHGjjgxpg-cRsNvjx2JZsXyXhVncEEUSbE30VEF_TS_Qw7GxBjFiOcRHddzT1dx6zLYtLx",
    },
    action: "joined the event",
    timeAgo: "15 minutes ago",
  },
  {
    id: "act_3",
    user: {
      name: "Emma W.",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAqSFeWYgQ5I3wT5UswuMifuxHihDsaRkgOX2g_x7W5R2VzbZueX2oa5asEQJWG_HrAffr4oqKH84hGjPWvvtdhxrfLB46wvUK12WJ1Ok-EpC08iS46KgzOw6rtKMoL0xuK0vGEYlGlwfDmbuWy0YyY4uh42rdBJQvk5Lq-1eqfOUr4N8Fzt-9gYiQ5PZIcZyRae9SoCfgEIL4QIQmPAvJk7UZWtC3FuH3jeIYTqSCt7X4OtXP6K9kClTrzHij727gNCuAwHFGGbwOl",
    },
    action: "uploaded 8 photos",
    timeAgo: "1 hour ago",
  },
];

export function LiveActivityFeed() {
  return (
    <div className="glass-card rounded-[2rem] p-8 border border-white/5">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="font-headline font-black text-lg text-white">
            Live Activity
          </h4>
          <p className="text-on-surface-variant text-xs font-medium">
            Happening now
          </p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          LIVE
        </span>
      </div>

      <div className="space-y-8">
        {MOCK_ACTIVITIES.map((activity) => (
          <div key={activity.id} className="flex gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-surface-container overflow-hidden shrink-0 border border-white/5 transition-transform group-hover:scale-105">
              <Image
                src={activity.user.avatar}
                alt={activity.user.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm leading-snug">
                <span className="font-black text-white">
                  {activity.user.name}
                </span>{" "}
                <span className="text-on-surface-variant font-medium">
                  {activity.action}
                </span>
              </p>
              <p className="text-[10px] text-primary/60 font-black mt-1 uppercase tracking-wider">
                {activity.timeAgo}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-10 py-3 rounded-2xl border border-primary/20 text-xs text-primary font-black hover:bg-primary hover:text-white transition-all duration-300">
        View all activity
      </button>
    </div>
  );
}
