"use client";

import KPIBadge from "@/components/ui/KPIBadge";
import {
  Cloud as CloudIcon,
  EventAvailable as EventIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

interface KPIGroupProps {
  totalEvents: number;
  totalPhotos: number;
  formattedSize: string;
}

export default function KPIGroup({
  totalEvents,
  totalPhotos,
  formattedSize,
}: KPIGroupProps) {
  // Simple number formatting for thousands
  const formatNum = (num: number) => new Intl.NumberFormat("en-US").format(num);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <KPIBadge
        icon={<EventIcon sx={{ color: "#7C3AED" }} />}
        value={formatNum(totalEvents)}
        label="Events"
      />
      <KPIBadge
        icon={<ImageIcon sx={{ color: "#7C3AED" }} />}
        value={formatNum(totalPhotos)}
        label="Photos"
      />
      <KPIBadge
        icon={<CloudIcon sx={{ color: "#7C3AED" }} />}
        value={formattedSize}
        label="Vault"
      />
    </div>
  );
}
