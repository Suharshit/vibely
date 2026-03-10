// ============================================================
// components/landing/StepsSection.tsx
// ============================================================
// "Magic in 3 steps" section with neumorphic cards
// ============================================================
import { PlusCircle, QrCode, Image as ImageIcon } from "lucide-react";

const STEPS = [
  {
    icon: <PlusCircle size={24} className="text-violet-600" />,
    title: "Create Your Event",
    description: "Set up in seconds and get a unique QR code for your gallery.",
  },
  {
    icon: <QrCode size={24} className="text-violet-600" />,
    title: "Share QR Code",
    description:
      "Display the code at your venue. Guests scan to join instantly.",
  },
  {
    icon: <ImageIcon size={24} className="text-violet-600" />,
    title: "Instant Gallery",
    description: "Every photo taken syncs to one shared space for everyone.",
  },
];

export function StepsSection() {
  return (
    <section id="how-it-works" className="py-24 bg-neumorphic">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Magic in 3 steps
          </h2>
          <p className="mt-4 text-gray-500">
            Simple for you, seamless for your guests.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-8"
            >
              {/* Neumorphic Icon Button container */}
              <div className="w-16 h-16 bg-neumorphic rounded-2xl shadow-neumorphic flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs align-center mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
