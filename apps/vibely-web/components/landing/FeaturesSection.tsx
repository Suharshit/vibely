export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Feature */}
        <div className="md:col-span-2 glass-card rounded-2xl p-10 flex flex-col justify-between min-h-[400px] hover:bg-surface-container-highest hover:-translate-y-0.5 transition-all border border-outline-variant/10">
          <div>
            <span className="material-symbols-outlined text-primary text-4xl mb-6">
              qr_code_2
            </span>
            <h3 className="text-3xl font-headline font-bold mb-4">
              QR Upload (no app needed)
            </h3>
            <p className="text-on-surface-variant text-lg max-w-md">
              Guests simply scan a code and start sharing. No downloads, no
              passwords, no friction. Just instant memories.
            </p>
          </div>
          <div className="mt-8 flex gap-4 overflow-hidden py-2">
            <div className="bg-surface-container-high p-4 rounded-xl flex-shrink-0 w-32 h-32 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl opacity-50">
                add_a_photo
              </span>
            </div>
            <div className="bg-surface-container-high p-4 rounded-xl flex-shrink-0 w-32 h-32 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl opacity-50">
                cloud_upload
              </span>
            </div>
            <div className="bg-primary/10 p-4 rounded-xl flex-shrink-0 w-32 h-32 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary">
                check_circle
              </span>
            </div>
          </div>
        </div>

        {/* Vertical Feature */}
        <div className="bg-surface-container rounded-2xl p-10 hover:bg-surface-container-highest hover:-translate-y-0.5 outline-2 outline-primary shadow-lg shadow-primary/80 hover:outline-primary/50 transition-all border border-outline-variant/10">
          <span className="material-symbols-outlined text-primary text-4xl mb-6">
            dynamic_feed
          </span>
          <h3 className="text-2xl font-headline font-bold mb-4">
            Real-time Gallery
          </h3>
          <p className="text-on-surface-variant leading-relaxed">
            Photos appear on the live stream as they happen. Perfect for display
            on screens during the event.
          </p>
          <div className="mt-12 h-32 bg-surface-container-lowest rounded-xl flex items-center justify-center overflow-hidden">
            <div className="animate-pulse bg-surface-container-high w-full h-full"></div>
          </div>
        </div>

        {/* Small Features */}
        <div className="bg-surface-container-low rounded-2xl p-8 hover:bg-surface-container-highest hover:-translate-y-0.5 transition-all">
          <span className="material-symbols-outlined text-secondary text-3xl mb-4">
            security
          </span>
          <h3 className="text-xl font-headline font-bold mb-2">Photo Vault</h3>
          <p className="text-on-surface-variant text-sm">
            Military-grade encryption for all your high-res originals. Permanent
            and secure storage.
          </p>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-8 hover:bg-surface-container-highest hover:-translate-y-0.5 transition-all">
          <span className="material-symbols-outlined text-primary text-3xl mb-4">
            person_off
          </span>
          <h3 className="text-xl font-headline font-bold mb-2">
            Zero Sign-up for Guests
          </h3>
          <p className="text-on-surface-variant text-sm">
            Privacy-first approach. Guests stay anonymous unless they choose to
            share their name.
          </p>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-8 hover:bg-surface-container-highest hover:-translate-y-0.5 transition-all">
          <span className="material-symbols-outlined text-tertiary text-3xl mb-4">
            auto_awesome
          </span>
          <h3 className="text-xl font-headline font-bold mb-2">
            AI Highlights
          </h3>
          <p className="text-on-surface-variant text-sm">
            Our AI automatically detects the best shots and groups them by
            moments.
          </p>
        </div>
      </div>
    </section>
  );
}
