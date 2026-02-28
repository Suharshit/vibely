export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900">
          Vibely - Event Photo Sharing
        </h1>
        <p className="text-xl text-gray-600">
          Event-centric photo sharing platform
        </p>
        <div className="flex gap-4 justify-center">
          <div className="px-6 py-3 bg-brand-500 text-white rounded-lg font-medium">
            Create Event
          </div>
          <div className="px-6 py-3 border-2 border-brand-500 text-brand-500 rounded-lg font-medium">
            Join Event
          </div>
        </div>
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">
            ✅ Phase 2: Web app setup complete
          </p>
        </div>
      </div>
    </div>
  );
}