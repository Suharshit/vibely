import { ReactNode } from "react";

interface KPIBadgeProps {
  icon: ReactNode;
  value: string | number;
  label: string;
}

export default function KPIBadge({ icon, value, label }: KPIBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm shadow-gray-200/50 border border-gray-100">
      <div className="flex items-center justify-center text-lg">{icon}</div>
      <div className="flex items-center gap-1 font-semibold text-sm">
        <span className="text-zinc-900">{value}</span>
        <span className="text-zinc-500 font-medium">{label}</span>
      </div>
    </div>
  );
}
