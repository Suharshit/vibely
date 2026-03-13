interface OverviewHeaderProps {
  userName: string;
}

export default function OverviewHeader({ userName }: OverviewHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-4xl font-extrabold text-[#1a1b26] tracking-tight">
        Good evening, {userName}{" "}
        <span className="inline-block animate-wave">&#x1F44B;</span>
      </h1>
      <p className="text-[#64748b] text-sm">
        Capture every moment, curate every memory.
      </p>
    </div>
  );
}
