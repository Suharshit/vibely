# 🗺️ Vibely — Product Roadmap & Future Scope

> This document outlines the post-MVP feature roadmap for Vibely, organized across four quarters. Each quarter builds on the previous, expanding from core UX improvements toward platform growth and monetization.

---

## Q1 — Foundation & Experience Polish

_Goal: Make the existing MVP feel production-grade. Focus on the moments that matter most — the host's first event and the guest's first upload._

---

### 🎨 UI/UX Overhaul

A full visual refresh with smoother transitions, consistent component design, and micro-animations across event cards, gallery loading, and upload states. Moves Vibely from functional to delightful.

---

### 🔔 Real-time Notifications (Web & Mobile)

Live push notifications for hosts when a guest uploads a photo, and for members when new photos are added to an event they've joined. Uses Supabase Realtime subscriptions on the `photos` table. Mobile notifications delivered via Expo Push Notifications.

---

### 🔍 Gallery Search & Filter

Search photos within an event gallery by uploader name or upload date. Filter by "my photos", "saved", or by a specific guest. Makes large-event galleries (200+ photos) actually navigable.

---

### 📥 Bulk Download

Let hosts and members download all event photos as a `.zip` file in one click. Uses a Supabase Edge Function to bundle files server-side rather than downloading individually. Critical for event photographers and wedding guests.

---

### 🖼️ Event Cover Image Cropping

Inline crop tool when a host uploads a cover image — lets them reframe and adjust the aspect ratio before saving. Uses `react-image-crop` on web and `expo-image-manipulator` on mobile.

---

### 🔗 Custom Invite Link Slugs

Let hosts set a human-readable slug for their event link (e.g. `vibely.app/join/sarah-and-james`) instead of a random token. Makes QR codes more memorable and shareable in wedding invitations.

---

### ♿ Accessibility Audit

Full WCAG 2.1 AA audit and remediation — keyboard navigation, ARIA labels, focus management, colour contrast ratios. Makes the product usable for everyone at the event.

---

## Q2 — Collaboration & Social Features

_Goal: Turn Vibely from a utility into a place people want to spend time. Add the social layer that keeps users coming back after the event ends._

---

### 💬 Photo Comments

Let event members leave comments on individual photos. Stored in a `photo_comments` table with real-time updates. Shows the conversation thread in the photo detail view, keeping memories contextual.

---

### ❤️ Photo Reactions

One-tap emoji reactions on photos (❤️ 😂 🔥 😍). Aggregated reaction counts shown on thumbnails in the gallery. Gives guests a lightweight way to engage without the overhead of comments.

---

### 👤 Guest Profiles (Persistent Sessions)

Optional: let guests create a lightweight profile linked to their session token — just a name and avatar, no email required. Their photos across multiple events are grouped under one identity. Gives guests a reason to come back.

---

### 📋 Event Templates

Save an event configuration as a template — cover style, upload permissions, expiry duration. One-click to spin up a new event with the same settings. Useful for recurring events like monthly team dinners or weekly sports games.

---

### 🎞️ Slideshow Mode

Auto-playing fullscreen slideshow of event photos, designed for display on a TV or projector at the venue in real time. New uploads appear automatically. Controlled via a host-only link separate from the main event.

---

### 📊 Event Analytics Dashboard

Basic analytics for event hosts — total uploads, uploads over time (hourly chart), top uploaders, most-reacted photos. Gives hosts insight into how engaged their guests were.

---

### 🔒 Event Password Protection

Optional password layer on top of the invite link — guests must enter a password before they can see or upload photos. Useful for corporate events or private family gatherings where the invite link may be forwarded.

---

## Q3 — Platform Expansion

_Goal: Expand reach and build the infrastructure needed for scale. Introduce the features that make Vibely the go-to tool for professional event photographers and corporate teams._

---

### 📸 Photographer Mode

A special role tier above "host" with advanced controls — watermarking, resolution restrictions, selective gallery visibility (host-approved photos only appear in the public gallery). Targets professional photographers who shoot events.

---

### 🏢 Teams & Organizations

Allow a group of users (a company, a photography studio, a wedding planning agency) to share an account with centralized billing, a shared event history, and role-based permissions. Foundation for the B2B offering.

---

### 🌐 Web Share Target API

Register Vibely as a share target in the browser — users can share photos from their native gallery app directly to a Vibely event without opening the app first. Supported in Chrome on Android and Safari on iOS.

---

### 🤖 AI Photo Curation

Automatic "Best Of" album generated by an AI model that scores photos on composition, sharpness, and faces. Hosts see an AI-curated selection alongside the full gallery. Powered by a Supabase Edge Function calling a vision API.

---

### 🖨️ Print Integration

Order prints directly from the vault or event gallery — integration with a print-on-demand API (Printful or similar). Hosts can also order a printed photo book from an entire event.

---

### 📱 Native iOS & Android App (App Store / Play Store)

Graduate from Expo Go to a fully standalone app with proper App Store presence, custom splash screen, deep links, and widget support. Unlocks background upload resumption and home screen quick actions.

---

### 🌍 Localisation (i18n)

Full internationalisation — UI translated into Spanish, French, German, Hindi, and Portuguese. Uses `next-intl` on web and `i18next` on mobile. Vibely is inherently a global product (events happen everywhere).

---

### 🔗 Calendar & Venue Integrations

Connect events to Google Calendar / Apple Calendar entries. Pull in venue details and add them to the event page. Auto-populate event name and date when creating from a calendar invite.

---

## Q4 — Monetisation & Growth

_Goal: Build the business model and growth loops that make Vibely self-sustaining. Introduce a paid tier without degrading the free guest experience._

---

### 💳 Vibely Pro (Subscription)

Paid plan unlocking: unlimited event history (free tier: 3 active events), extended photo expiry (90 days vs 30), 50GB vault storage, custom event branding, and priority support. Implemented via Stripe subscriptions with webhooks updating a `subscriptions` table.

---

### 🏷️ Custom Branding

Pro feature: remove Vibely branding from guest-facing pages and replace with the host's own logo and colour scheme. Guest upload pages show "Powered by [Your Brand]" instead. Targets wedding photographers and event companies.

---

### 🔌 Zapier / Make Integration

Webhook triggers for key events — photo uploaded, event created, member joined. Lets hosts automate workflows: send a WhatsApp message when a photo is uploaded, add a row to a Google Sheet for each guest, etc.

---

### 📤 Direct Social Sharing

Share individual photos or the whole gallery directly to Instagram Stories, WhatsApp, or X from within the app. Uses the Web Share API and native share sheets. Adds a viral growth loop — every share is a Vibely impression.

---

### 🎁 Gift Registry Integration

Link a wedding or birthday event to a gift registry. Guests who upload photos see a gentle "View their wish list" prompt. Affiliate revenue model with platforms like Zola or Amazon.

---

### 📈 SEO & Public Event Pages

Optional: make an event's gallery publicly discoverable on the web with a canonical URL, og:image, and structured data. Lets couples share their wedding gallery as a permanent webpage. Drives organic search traffic to Vibely.

---

### 🤝 Venue & Vendor Partnerships

Partnership programme for venues (hotels, wedding halls) and event vendors (photographers, caterers) who recommend Vibely to their clients. Referral tracking, co-branded event pages, and a vendor directory on the Vibely website.

---

### 📊 Advanced Analytics (Pro)

Per-photo engagement scores, guest return rates, most active time-of-day during the event, export to CSV. Gives professional event hosts data to share with their clients as part of a post-event report.

---

<!--
## 🗂️ Backlog (Unprioritised)

Features that have been identified but not yet scheduled into a quarter:

- **Video support** — short clips alongside photos (requires transcoding pipeline, significantly higher storage costs)
- **Face grouping** — automatically group gallery by person using face recognition (requires ML pipeline, significant privacy considerations)
- **Offline mode** — queue uploads when the event venue has poor connectivity, flush when connection is restored
- **AR photo frames** — custom Snapchat-style filters for event photos using WebXR
- **NFT minting** — mint a photo as an NFT directly from the vault (low priority, market-dependent)
- **Apple Watch / WearOS companion** — quick-capture from wrist during events -->
