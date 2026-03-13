import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full flex justify-between items-center px-8 py-6 text-sm text-gray-400 mt-auto bg-transparent">
      <div className="flex items-center gap-1">
        <span>© 2024 Vibely. All rights reserved.</span>
      </div>
      <div className="flex gap-6">
        <Link href="/privacy" className="hover:text-gray-600 transition-colors">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-gray-600 transition-colors">
          Terms of Service
        </Link>
        <Link href="/support" className="hover:text-gray-600 transition-colors">
          Support
        </Link>
      </div>
    </footer>
  );
}
