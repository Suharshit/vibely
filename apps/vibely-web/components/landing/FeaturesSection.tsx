// ============================================================
// components/landing/FeaturesSection.tsx
// ============================================================
// "Features for the perfect host" section.
// Grid of 6 neumorphic cards displaying app benefits.
// ============================================================
import {
  Zap,
  ImageIcon,
  ShieldCheck,
  Play,
  Download,
  Printer,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Zap size={20} className="text-violet-600" />,
    title: "Zero App Install",
    description:
      "Guests just scan and snap. No downloads or accounts required for them.",
  },
  {
    icon: <ImageIcon size={20} className="text-violet-600" />,
    title: "High-Res Original",
    description:
      "No more blurry social media compressed photos. Keep the quality.",
  },
  {
    icon: <ShieldCheck size={20} className="text-violet-600" />,
    title: "Private & Secure",
    description:
      "You control the access. Only your guests can see and upload photos.",
  },
  {
    icon: <Play size={20} className="text-violet-600" />,
    title: "Live Slideshow",
    description:
      "Cast a live stream of event photos to any screen during the party.",
  },
  {
    icon: <Download size={20} className="text-violet-600" />,
    title: "Bulk Download",
    description:
      "Download all memories with one click at the end of the night.",
  },
  {
    icon: <Printer size={20} className="text-violet-600" />,
    title: "Physical Prints",
    description:
      "Easily order a professional photo book directly from your gallery.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-neumorphic">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex flex-col w-fit">
            Features for the perfect host
            <div className="h-1.5 w-16 bg-violet-600 mt-2 rounded-full"></div>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="bg-neumorphic rounded-[2rem] p-8 shadow-neumorphic border border-white/40 hover:shadow-neumorphic-sm transition-shadow flex flex-col gap-4"
            >
              <div className="w-12 h-12 bg-neumorphic rounded-xl shadow-neumorphic-sm flex items-center justify-center border border-white/50">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
