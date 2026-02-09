import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ChatSummary, UserView } from '@skid/shared/types';
import { apiClient } from '../api/client';

interface ChatsPageProps {
  token: string;
  user: UserView;
  onLogout: () => void;
}

export function ChatsPage({ token, user, onLogout }: ChatsPageProps): JSX.Element {
  const [owned, setOwned] = useState<ChatSummary[]>([]);
  const [shared, setShared] = useState<ChatSummary[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    try {
      const chats = await apiClient.listChats(token);
      setOwned(chats.owned);
      setShared(chats.shared);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createChat = async (): Promise<void> => {
    try {
      await apiClient.createChat(token, title ? { title } : {});
      setTitle('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat');
    }
  };

  const toLabel = (chat: ChatSummary): string => chat.title ?? `Chat ${chat.id.slice(0, 8)}`;

  return (
    <main className="mx-auto w-[min(96vw,62rem)] px-3 py-6 sm:py-8">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[clamp(1.45rem,2.4vw,2rem)] font-semibold tracking-tight">Skid Commons</h1>
          <p className="text-sm text-slate-500">Signed in as {user.displayName}</p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-line bg-mist px-4 py-2 text-sm font-semibold text-ink"
          onClick={onLogout}
        >
          Logout
        </button>
      </header>

      <section className="mb-4 rounded-2xl border border-line/90 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
        <h2 className="mb-3 text-base font-medium">Create chat</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300/60"
            placeholder="Optional chat title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <button type="button" onClick={createChat} className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">
            New chat
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-line/90 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
          <h2 className="mb-3 text-base font-medium">Owned chats</h2>
          <ul className="grid gap-2">
            {owned.map((chat) => (
              <li key={chat.id} className="rounded-xl border border-line bg-white px-3 py-2 text-sm">
                <Link to={`/chats/${chat.id}`}>{toLabel(chat)}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-line/90 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
          <h2 className="mb-3 text-base font-medium">Shared with me</h2>
          <ul className="grid gap-2">
            {shared.map((chat) => (
              <li key={chat.id} className="rounded-xl border border-line bg-white px-3 py-2 text-sm">
                <Link to={`/chats/${chat.id}`}>{toLabel(chat)}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </main>
  );
}
