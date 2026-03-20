interface EventActionBarProps {
  onBulkSelect: () => void;
  onDownloadAll: () => void;
  onUpload: () => void;
  title?: string;
  subtitle?: string;
}

export function EventActionBar({
  onBulkSelect,
  onDownloadAll,
  onUpload,
  title = "Recent Uploads",
  subtitle = "Photos showing the latest moments",
}: EventActionBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h3 className="text-2xl font-headline font-black tracking-tight text-on-surface">
          {title}
        </h3>
        <p className="text-on-surface-variant text-sm">{subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-3 w-full sm:w-auto">
        <button
          onClick={onBulkSelect}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-all text-sm font-bold border border-white/5 shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">
            check_circle
          </span>
          Bulk Select
        </button>

        <button
          onClick={onUpload}
          className="flex-1 sm:flex-none bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30 flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-black transition-all text-sm shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">upload</span>
          Upload
        </button>

        <button
          onClick={onDownloadAll}
          className="flex-1 sm:flex-none bg-primary hover:bg-primary-dim text-white shadow-md shadow-primary/10 flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-black transition-all text-sm active:scale-95 border border-white/10"
        >
          <span className="material-symbols-outlined text-xl">download</span>
          Download All
        </button>
      </div>
    </div>
  );
}
