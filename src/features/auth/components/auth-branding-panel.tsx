import { appConfig } from "@/config/app.config";

export function AuthBrandingPanel() {
  return (
    <div className="relative flex min-h-[200px] flex-col justify-between overflow-hidden bg-[#1c2b2a] px-8 py-10 text-stone-100 sm:min-h-[260px] sm:px-10 sm:py-12 lg:min-h-0 lg:px-14 lg:py-16 dark:bg-[#141f1e]">
      {/* Single soft wash — no grids, no glow orbs */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#243836]/40 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-12 h-64 w-64 rounded-full bg-teal-800/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10">
        <p className="font-serif text-2xl tracking-tight text-stone-50 sm:text-[1.65rem]">
          {appConfig.name}
        </p>
        <p className="mt-1 text-sm text-stone-400">for practicing clinicians</p>
      </div>

      <div className="relative z-10 mt-10 max-w-md space-y-8 lg:mt-0">
        <blockquote className="space-y-4">
          <p className="font-serif text-[1.75rem] leading-snug text-stone-50 sm:text-3xl lg:text-[2rem] lg:leading-tight">
            &ldquo;Less charting at midnight. More presence in the exam room.&rdquo;
          </p>
          <footer className="text-sm leading-relaxed text-stone-400">
            Notes, visits, and prescriptions — in one place you can actually use between
            patients.
          </footer>
        </blockquote>

        <p className="hidden border-l-2 border-teal-700/60 pl-4 text-sm italic leading-relaxed text-stone-400 sm:block">
          We built this because we got tired of tools that feel like they were made for
          engineers, not doctors.
        </p>
      </div>

      <p className="relative z-10 mt-10 text-xs text-stone-500 lg:mt-0">
        {new Date().getFullYear()} {appConfig.name}
      </p>
    </div>
  );
}
