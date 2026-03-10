// ============================================================
// components/landing/PhoneMockup.tsx
// ============================================================
// Code-based phone mockup using CSS neumorphism.
// Replaces the static image.
// ============================================================
import { QrCode } from "lucide-react";

export function PhoneMockup() {
  return (
    <div className="relative w-64 h-[500px] sm:w-72 sm:h-[560px] bg-neumorphic rounded-[3rem] p-3 shadow-neumorphic border-4 border-white/40 flex flex-col mx-auto">
      {/* Phone Screen Area */}
      <div className="relative flex-1 bg-[#f4f6f9] rounded-[2.5rem] shadow-neumorphic-inner overflow-hidden border border-white/60">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 inset-x-0 w-full flex justify-center z-20">
          <div className="w-24 h-6 bg-[#d1d5db] rounded-b-xl shadow-inner mt-2 opacity-50"></div>
        </div>

        {/* Content Inside Screen */}
        <div className="pt-14 px-5 pb-6 h-full flex flex-col">
          {/* Header Card (The QR Code display area) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center mb-6">
            <div className="p-3 bg-violet-50 rounded-xl text-violet-600 mb-2">
              <QrCode size={32} strokeWidth={1.5} />
            </div>
            <div className="h-2 w-16 bg-gray-100 rounded-full"></div>
          </div>

          {/* Skeletons for UI Elements */}
          <div className="space-y-3 mb-6">
            <div className="h-3 w-3/4 bg-gray-200 rounded-full"></div>
            <div className="h-3 w-1/2 bg-gray-200 rounded-full"></div>
          </div>

          {/* Photo Grid Placeholder */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <div className="aspect-square bg-gray-200 rounded-2xl"></div>
            <div className="aspect-square bg-gray-200 rounded-2xl"></div>
            <div className="aspect-square bg-gray-200 rounded-2xl"></div>
            <div className="aspect-square bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
