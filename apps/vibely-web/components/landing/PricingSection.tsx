export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-headline font-bold mb-4">
          Transparent Pricing
        </h2>
        <p className="text-on-surface-variant">
          Choose the perfect plan for your special occasion.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className="glass-card rounded-2xl p-8 flex flex-col h-full border border-outline-variant/10 hover:bg-surface-container-highest transition-all">
          <h3 className="text-on-surface-variant text-sm font-label uppercase tracking-widest mb-2">
            Personal
          </h3>
          <p className="text-3xl font-headline font-bold mb-6">Free</p>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-center gap-3 text-sm text-on-surface/80">
              <span className="material-symbols-outlined text-primary text-lg">
                check
              </span>
              Up to 50 Guests
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface/80">
              <span className="material-symbols-outlined text-primary text-lg">
                check
              </span>
              48h Gallery Life
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface/80">
              <span className="material-symbols-outlined text-primary text-lg">
                check
              </span>
              Standard Resolution
            </li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-surface-container-high font-bold hover:bg-surface-container transition-all">
            Start Free
          </button>
        </div>

        {/* Pro Plan */}
        <div className="relative glass-card rounded-2xl p-8 flex flex-col h-full border-2 border-primary shadow-lg shadow-primary/80 hover:shadow-lg hover:shadow-primary/20 hover:outline-primary/60 outline-2 outline-primary/90 transform hover:-translate-y-1 transition-all">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-[10px] font-black text-on-primary-container uppercase tracking-widest">
            Most Popular
          </div>
          <h3 className="text-primary text-sm font-label uppercase tracking-widest mb-2">
            Professional
          </h3>
          <p className="text-3xl font-headline font-bold mb-6">
            $49
            <span className="text-sm font-normal text-on-surface-variant">
              /event
            </span>
          </p>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-center gap-3 text-sm text-on-surface">
              <span
                className="material-symbols-outlined text-primary text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
              Unlimited Guests
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface">
              <span
                className="material-symbols-outlined text-primary text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
              Permanent Photo Vault
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface">
              <span
                className="material-symbols-outlined text-primary text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
              Original Resolution Raw Files
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface">
              <span
                className="material-symbols-outlined text-primary text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
              Custom QR Branding
            </li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dim text-on-primary-container font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
            Go Pro
          </button>
        </div>

        {/* Team Plan */}
        <div className="glass-card rounded-2xl p-8 flex flex-col h-full border border-outline-variant/10 hover:bg-surface-container-highest transition-all">
          <h3 className="text-on-surface-variant text-sm font-label uppercase tracking-widest mb-2">
            Agency
          </h3>
          <p className="text-3xl font-headline font-bold mb-6">
            $199
            <span className="text-sm font-normal text-on-surface-variant">
              /mo
            </span>
          </p>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-center gap-3 text-sm text-on-surface/80">
              <span className="material-symbols-outlined text-primary text-lg">
                check
              </span>
              Up to 10 Concurrent Events
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface/80">
              <span className="material-symbols-outlined text-primary text-lg">
                check
              </span>
              White-label Platform
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface/80">
              <span className="material-symbols-outlined text-primary text-lg">
                check
              </span>
              Analytics &amp; Export Tools
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface/80">
              <span className="material-symbols-outlined text-primary text-lg">
                check
              </span>
              Priority Support
            </li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-surface-container-high font-bold hover:bg-surface-container transition-all">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}
