// ============================================================
// apps/web/app/events/create/page.tsx
// ============================================================

import { CreateEventForm } from '@/components/events/CreateEventForm';

export const metadata = {
  title: 'Create Event — Vibely',
};

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="mb-8">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1.5 mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </a>

          <h1 className="text-2xl font-bold text-gray-900">Create a new event</h1>
          <p className="mt-2 text-sm text-gray-500">
            Fill in the details below. You&apos;ll get a shareable link and QR code once the event is created.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <CreateEventForm />
        </div>
      </div>
    </div>
  );
}