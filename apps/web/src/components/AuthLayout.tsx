import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps): JSX.Element {
  return (
    <main className="mx-auto w-[min(94vw,48rem)] px-3 py-8 sm:py-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-[clamp(1.4rem,2.3vw,1.9rem)] font-semibold tracking-tight">Skid Commons</h1>
        <span className="text-sm text-slate-500">MVP chat workspace</span>
      </div>
      {children}
    </main>
  );
}
