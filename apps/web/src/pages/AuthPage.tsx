import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { AuthLayout } from '../components/AuthLayout';
import type { UserView } from '@skid/shared/types';

interface AuthPageProps {
  onAuthenticated: (token: string, user: UserView) => void;
}

export function AuthPage({ onAuthenticated }: AuthPageProps): JSX.Element {
  const navigate = useNavigate();
  const [accountId, setAccountId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const completeAuth = (token: string, user: UserView): void => {
    onAuthenticated(token, user);
    navigate('/chats');
  };

  const handleRegister = async (): Promise<void> => {
    setError(null);
    try {
      const result = await apiClient.register({ accountId, displayName });
      completeAuth(result.token, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const handleLogin = async (): Promise<void> => {
    setError(null);
    try {
      const result = await apiClient.login({ accountId });
      completeAuth(result.token, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <AuthLayout>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-line/90 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
          <h2 className="mb-3 text-lg font-medium">Create account</h2>
          <div className="grid gap-2.5">
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300/60"
              placeholder="accountId"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
            />
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300/60"
              placeholder="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
            <button
              type="button"
              onClick={handleRegister}
              className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white"
            >
              Register
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-line/90 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
          <h2 className="mb-3 text-lg font-medium">Login</h2>
          <div className="grid gap-2.5">
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300/60"
              placeholder="accountId"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
            />
            <button
              type="button"
              onClick={handleLogin}
              className="rounded-xl border border-line bg-mist px-4 py-2.5 text-sm font-semibold text-ink"
            >
              Login
            </button>
          </div>
        </section>
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </AuthLayout>
  );
}
