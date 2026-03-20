"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface EventQRPanelProps {
  inviteToken: string;
}

export function EventQRPanel({ inviteToken }: EventQRPanelProps) {
  const [copied, setCopied] = useState(false);

  // Build the full invite URL
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${inviteToken}`
      : `/join/${inviteToken}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-10 neumorphic-glow text-center border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
      <h3 className="font-headline font-black text-2xl mb-2 text-white drop-shadow-md">
        Scan to Join
      </h3>
      <p className="text-on-surface-variant text-sm mb-8 font-medium opacity-80">
        Instant photo sharing for your guests.
      </p>

      {/* QR Code Container */}
      <div className="bg-white p-6 rounded-3xl inline-block mb-8 shadow-[0_0_50px_rgba(124,58,237,0.4)] transform transition-all duration-500 hover:scale-105 hover:rotate-1 relative">
        <div className="w-48 h-48 bg-white flex items-center justify-center relative">
          <QRCodeCanvas
            value={inviteUrl}
            size={192} // 48 * 4
            level="M"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#000000"
          />

          {/* Center Logo/Icon on QR */}
          <div className="absolute inset-0 m-auto w-12 h-12 bg-white p-2 rounded-xl shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-primary rounded-lg flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Link Action */}
      <button
        onClick={copyLink}
        className="w-full py-4 soft-neumorph-outset text-white font-black rounded-2xl transition-all border border-white/5 flex items-center justify-center gap-2 mb-6 hover:text-primary active:scale-[0.98]"
      >
        <span className="material-symbols-outlined">
          {copied ? "check" : "content_copy"}
        </span>
        {copied ? "Copied!" : "Copy Invite Link"}
      </button>
    </div>
  );
}
