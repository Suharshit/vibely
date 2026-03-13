import Link from "next/link";
import { Settings } from "lucide-react";
import IconButton from "@/components/ui/IconButton";

export default function SettingsButton() {
  return (
    <Link href="/settings">
      <IconButton aria-label="Settings">
        <Settings size={20} className="stroke-[2.5]" />
      </IconButton>
    </Link>
  );
}
