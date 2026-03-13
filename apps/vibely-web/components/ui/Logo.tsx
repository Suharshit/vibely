import Link from "next/link";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export default function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      aria-label="Go to dashboard"
      className={`flex items-center gap-2 group ${className}`}
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 transition-colors shadow-sm">
        {/* We use a star icon as a proxy for the custom four-pointed star in the design, until an SVG is provided */}
        <AutoAwesomeIcon sx={{ fontSize: 20 }} />
      </div>
      {!iconOnly && (
        <span className="text-xl font-bold text-gray-900 tracking-tight">
          Vibely
        </span>
      )}
    </Link>
  );
}
