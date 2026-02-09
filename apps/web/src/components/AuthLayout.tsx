import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps): JSX.Element {
  return (
    <main className="shell w-[min(96vw,74rem)]">
      <section className="glass mb-4 overflow-hidden p-5 sm:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label mb-2">Skid Commons</p>
            <h1 className="text-[clamp(1.8rem,3.3vw,2.7rem)] font-semibold leading-[1.05] tracking-tight text-slate-900">
              Real-time shared chats
              <br />
              with AI assistance
            </h1>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-slate-600">
            Lightweight collaboration for teams. Create a user, open chats, share instantly, and message together live.
          </p>
        </div>
      </section>
      {children}
    </main>
  );
}
