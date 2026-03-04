'use client';

// ============================================================
// apps/web/components/events/QRCodeDisplay.tsx
// ============================================================
// Displays the event's invite QR code and share link.
//
// WHY QR codes?
// At in-person events, people don't want to type a URL. QR codes
// let guests point their camera at a screen and instantly land on
// the guest upload page — zero friction. The QR code encodes the
// full invite URL which includes the token.
//
// WHY qrcode.react?
// It renders QR codes as inline SVGs (no network request, no
// server dependency, works offline). The SVG can also be
// downloaded or printed directly.
// ============================================================

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeDisplayProps {
  inviteToken: string;
  eventTitle: string;
}

export function QRCodeDisplay({ inviteToken, eventTitle }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Build the full invite URL — works in both dev and production
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${inviteToken}`
    : `/join/${inviteToken}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const input = document.createElement('input');
      input.value = inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    // Find the canvas or SVG element inside qrRef and download it
    const svg = qrRef.current?.querySelector('svg');
    const canvas = qrRef.current?.querySelector('canvas');

    if (canvas) {
      // Canvas version: convert to PNG blob
      const link = document.createElement('a');
      link.download = `${eventTitle.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else if (svg) {
      // SVG version: serialize and download
      const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = `${eventTitle.replace(/\s+/g, '-').toLowerCase()}-qr.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code */}
      <div
        ref={qrRef}
        className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
      >
        {/*
          renderAs="canvas" is better for download (PNG export).
          level="M" = medium error correction (15% damage tolerance).
          Higher correction = bigger QR code; M is a good balance.
          includeMargin adds the quiet zone required by QR spec.
        */}
        <QRCodeCanvas
          value={inviteUrl}
          size={200}
          level="M"
          includeMargin
          bgColor="#ffffff"
          fgColor="#111827"
        />
      </div>

      {/* Invite link */}
      <div className="w-full">
        <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl">
          <p className="flex-1 text-xs text-gray-600 truncate font-mono">
            {inviteUrl}
          </p>
          <button
            onClick={copyLink}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              copied
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full">
        <button
          onClick={downloadQR}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download QR
        </button>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={() => navigator.share({ title: eventTitle, url: inviteUrl })}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        )}
      </div>
    </div>
  );
}