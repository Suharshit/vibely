import { APP_CONFIG } from "@repo/shared/constants";
import { formatFileSize } from "@repo/shared/utils";

export default function HomePage() {
  const maxFileSize = formatFileSize(APP_CONFIG.PHOTO.MAX_FILE_SIZE);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900">
          Events Image Manager
        </h1>
        <p className="text-xl text-gray-600">
          Event-centric photo sharing platform
        </p>
        <div className="flex gap-4 justify-center">
          <div className="px-6 py-3 border-2 border-brand-500 text-brand-500 bg-brand-500 text-black rounded-lg font-medium">
            Create Event
          </div>
          <div className="px-6 py-3 border-2 border-brand-500 text-brand-500 rounded-lg font-medium">
            Join Event
          </div>
        </div>
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">
            ✅ Phase 4: Shared package integration complete
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Using shared constants: Max file size is {maxFileSize}
          </p>
        </div>
      </div>
    </div>
  );
}
