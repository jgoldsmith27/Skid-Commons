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
        <section className="glass p-5 sm:p-6">
          <p className="label mb-2">Onboard</p>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Create account</h2>
          <div className="grid gap-3">
            <input className="field" placeholder="accountId" value={accountId} onChange={(event) => setAccountId(event.target.value)} />
            <input
              className="field"
              placeholder="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
            <button type="button" onClick={handleRegister} className="btn-primary">
              Create account
            </button>
          </div>
        </section>

        <section className="glass p-5 sm:p-6">
          <p className="label mb-2">Welcome Back</p>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Login</h2>
          <div className="grid gap-3">
            <input className="field" placeholder="accountId" value={accountId} onChange={(event) => setAccountId(event.target.value)} />
            <button type="button" onClick={handleLogin} className="btn-soft">
              Continue
            </button>
          </div>
        </section>
      </div>

      {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
    </AuthLayout>
  );
}
