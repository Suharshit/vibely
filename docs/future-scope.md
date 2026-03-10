# 🗺️ Vibely — Product Roadmap & Future Scope

> This document outlines the post-MVP feature roadmap for Vibely, organized across four quarters. Each quarter builds on the previous, expanding from core UX improvements toward platform growth and monetization.

---

## 📅 Roadmap Overview

| Quarter | Focus Area                          | Key Goal                                                                                                    |
| :------ | :---------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| **Q1**  | **Foundation & Experience Polish**  | Make the existing MVP feel production-grade. Focus on the host's first event and the guest's first upload.  |
| **Q2**  | **Collaboration & Social Features** | Turn Vibely into a social place. Keep users coming back after the event ends.                               |
| **Q3**  | **Platform Expansion**              | Build infrastructure for scale. Attract professional event photographers and corporate teams.               |
| **Q4**  | **Monetisation & Growth**           | Implement the business model and growth loops. Introduce a paid tier without degrading the free experience. |

---

## Q1 — Foundation & Experience Polish

_Goal: Make the existing MVP feel production-grade. Focus on the moments that matter most — the host's first event and the guest's first upload._

| Feature                                 | Description & Enhancements                                                                                          | Target User | Priority | Complexity |
| :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :---------- | :------- | :--------- |
| **🎨 UI/UX Overhaul**                   | Visual refresh, smoother transitions, consistent components, micro-animations. Addition of dark mode support.       | All Users   | High     | High       |
| **🔔 Real-time Notifications**          | Live push notifications via Supabase Realtime & Expo for uploads and interactions.                                  | Host/Guest  | High     | Medium     |
| **🔍 Advanced Gallery Search & Filter** | Search by uploader name/date. Filter by "my photos", "saved", guest, or AI tags.                                    | All Users   | Medium   | Medium     |
| **📥 Granular Bulk Download**           | Download zip of all photos, or filter by specific guest, time range, or favorites. Supabase Edge Function bundling. | Host/Guest  | High     | Medium     |
| **🖼️ Event Cover Image Cropping**       | Inline crop/aspect ratio adjustment tool before saving (`react-image-crop` / `expo-image-manipulator`).             | Host        | Medium   | Low        |
| **🔗 Custom Invite Link Slugs**         | Human-readable slugs (e.g., `vibely.app/sarah-james`). Auto-generation of matching QR Codes for easy printing.      | Host        | High     | Low        |
| **♿ Accessibility Audit & Fixes**      | Full WCAG 2.1 AA compliance (keyboard nav, ARIA, focus, contrast). Screen reader optimizations.                     | All Users   | High     | Medium     |
| **[NEW] 📱 In-App Guest Onboarding**    | Quick 3-step interactive tutorial for first-time guests on how to upload and share.                                 | Guest       | Medium   | Low        |
| **[NEW] 📝 Host Feedback Loop**         | Seamless in-app feedback collection post-event to gather user insights and feature requests.                        | Host        | Low      | Low        |

---

## Q2 — Collaboration & Social Features

_Goal: Turn Vibely from a utility into a place people want to spend time. Add the social layer that keeps users coming back after the event ends._

| Feature                           | Description & Enhancements                                                                            | Target User | Priority | Complexity |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------- | :---------- | :------- | :--------- |
| **💬 Photo Comments & Threads**   | Nested comments on photos with real-time updates. @mentions for event members.                        | All Users   | High     | Medium     |
| **❤️ Rich Photo Reactions**       | One-tap emoji reactions (❤️ 😂 🔥 😍). Custom reaction packs per event theme.                         | All Users   | High     | Low        |
| **👤 Guest Profiles**             | Persistent sessions: identity linking across events without forcing email signup. Personal dashboard. | Guest       | Medium   | Medium     |
| **📋 Event Templates**            | Save configs (cover, permissions, expiry) for 1-click recreation of recurring events.                 | Host        | Medium   | Low        |
| **🎞️ Interactive Slideshow Mode** | Auto-playing fullscreen live slideshow for TVs/projectors. Guests can cast directly to it.            | Host        | High     | Medium     |
| **📊 Basic Event Analytics**      | Host dashboard: upload timelines, top contributors, most-reacted photos.                              | Host        | Medium   | Medium     |
| **🔒 Event Password & Privacy**   | Password protection, geofencing (upload only at venue), and host-approval queues.                     | Host        | Medium   | Medium     |
| **[NEW] 📖 Digital Guestbook**    | A dedicated view where guests can leave long-form messages and video notes for the host.              | All Users   | High     | Medium     |
| **[NEW] 📂 Sub-albums / Albums**  | Categorize photos within an event (e.g., "Ceremony", "Reception", "Photobooth").                      | Host        | Medium   | Medium     |

---

## Q3 — Platform Expansion

_Goal: Expand reach and build the infrastructure needed for scale. Introduce the features that make Vibely the go-to tool for professional event photographers and corporate teams._

| Feature                              | Description & Enhancements                                                               | Target User  | Priority | Complexity |
| :----------------------------------- | :--------------------------------------------------------------------------------------- | :----------- | :------- | :--------- |
| **📸 Photographer Mode**             | Pro role: watermarking, high-res locks, selective visibility, raw file delivery option.  | Photographer | High     | High       |
| **🏢 Teams & Organizations**         | Shared accounts, centralized billing, role-based access control (RBAC) for B2B.          | Admin/Host   | High     | High       |
| **🌐 Web Share Target API**          | Native-feeling upload directly from mobile OS galleries (iOS Safari/Android Chrome).     | Guest        | Medium   | Medium     |
| **🤖 AI Photo Curation & Tagging**   | Edge function-powered auto-generation of "Best Of" albums, blur detection, auto-tagging. | All Users    | High     | High       |
| **🖨️ Directly Integrated Print Hub** | Order physical prints, canvases, and photo books via Printful API.                       | All Users    | Medium   | High       |
| **📱 Native iOS & Android Apps**     | Standalone App Store/Play Store apps unlocking background uploads, widgets, deep links.  | All Users    | High     | High       |
| **🌍 i18n & Localisation**           | Multi-language support (ES, FR, DE, HI, PT) adapting to browser/device locale.           | All Users    | Medium   | Medium     |
| **🔗 Calendar Integrations**         | Auto-create events from Google/Apple Calendar, sync venue details.                       | Host         | Low      | Medium     |
| **[NEW] 🔌 Developer API (Beta)**    | REST / GraphQL API for custom integrations by larger corporate clients.                  | Admin        | Low      | High       |
| **[NEW] 📷 Multi-Camera Sync**       | AI groups photos taken simultaneously from different angles/users into "Moments".        | All Users    | Low      | High       |

---

## Q4 — Monetisation & Growth

_Goal: Build the business model and growth loops that make Vibely self-sustaining. Introduce a paid tier without degrading the free guest experience._

| Feature                                | Description & Enhancements                                                                | Target User | Priority | Complexity |
| :------------------------------------- | :---------------------------------------------------------------------------------------- | :---------- | :------- | :--------- |
| **💳 Vibely Pro (Subscription)**       | Paid tier via Stripe: unlimited events, 50GB storage, 90-day expiry, priority support.    | Host/Pro    | High     | Medium     |
| **🏷️ Custom White-label Branding**     | Remove Vibely logos, use custom colors, fonts, and "Powered by" footers for Pro users.    | Pro Users   | High     | Medium     |
| **🔌 Zapier / Webhook Ecosystem**      | Send WhatsApp updates, sync rows to Sheets, or trigger external systems on photo uploads. | Host/Admin  | Medium   | High       |
| **📤 Direct Social Integrations**      | Web Share API to directly export high-res photos to IG Stories, X, TikTok, WhatsApp.      | All Users   | High     | Low        |
| **🎁 Gift Registry / Affiliate Links** | Link registries (Zola/Amazon) to events. Subtle prompts for guests uploading photos.      | Host/Guest  | Medium   | Low        |
| **📈 SEO & Public Searchable Events**  | Canonical URLs, OpenGraph injection, and SEO-optimized public galleries to drive traffic. | Host/Admin  | Medium   | Medium     |
| **🤝 Venue/Vendor Partner Portal**     | Affiliate dashboard for venues/photographers recommending Vibely. Revenue sharing.        | Partners    | Low      | Medium     |
| **📊 Advanced Pro Analytics**          | Exportable CSVs, detailed per-guest engagement metrics, device platform stats.            | Pro Users   | Medium   | Medium     |
| **[NEW] 🎟️ Pay-per-Event Model**       | One-off microtransactions for hosts who want Pro features for a single event only.        | Host        | High     | Medium     |
| **[NEW] 📺 Sponsored Ads (Optional)**  | Opt-in ads for massive free public events to offset server costs.                         | Admin       | Low      | High       |

---

## 🗂️ Backlog (Unprioritised)

_Exploratory features requiring significant R&D:_

| Feature                        | Description                                                                                | Complexity |
| :----------------------------- | :----------------------------------------------------------------------------------------- | :--------- |
| **📹 Video Support**           | Short clips alongside photos. Requires robust transcoding pipeline and high storage costs. | Very High  |
| **🧑‍🤝‍🧑 AI Face Grouping**        | Auto-group photos by person. High privacy (GDPR/CCPA) and ML infrastructure overhead.      | Very High  |
| **📡 Robust Offline Mode**     | Full offline PWA support. Queue uploads in low-signal venues, auto-flush when online.      | High       |
| **🕶️ AR Photo Booth Filters**  | WebXR based custom overlays (Snapchat-style) for event-specific selfies.                   | High       |
| **🪙 NFT Minting (Web3)**      | Mint memories as NFTs from the vault (dependent on market demand).                         | Medium     |
| **⌚ Wearables App**           | Apple Watch / WearOS companion for quick wrist captures or vibration alerts.               | Medium     |
| **[NEW] 🐦 Drone Integration** | Direct auto-upload from DJI/Drone SDKs over local wifi to the event gallery.               | Very High  |
| **[NEW] 🔴 Live Stream Hub**   | Integrated low-latency live streaming alongside the photo gallery for remote guests.       | Very High  |
