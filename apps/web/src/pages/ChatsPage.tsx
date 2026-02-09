import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ChatSummary, UserView } from '@skid/shared/types';
import { apiClient } from '../api/client';

interface ChatsPageProps {
  token: string;
  user: UserView;
  onLogout: () => void;
}

function ChatList({ title, chats }: { title: string; chats: ChatSummary[] }): JSX.Element {
  const toLabel = (chat: ChatSummary): string => chat.title ?? `Chat ${chat.id.slice(0, 8)}`;

  return (
    <section className="glass p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-600">
          {chats.length}
        </span>
      </div>
      <ul className="grid gap-2.5">
        {chats.map((chat) => (
          <li key={chat.id}>
            <Link to={`/chats/${chat.id}`} className="group chat-link">
              <span className="font-medium text-slate-800">{toLabel(chat)}</span>
              <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-sky-600">Open</span>
            </Link>
          </li>
        ))}
        {chats.length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-300/90 px-3 py-5 text-center text-sm text-slate-500">
            No chats yet.
          </li>
        ) : null}
      </ul>
    </section>
  );
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

  return (
    <main className="shell">
      <section className="glass mb-4 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label mb-2">Workspace</p>
            <h1 className="text-[clamp(1.45rem,2.7vw,2.2rem)] font-semibold tracking-tight">Skid Commons</h1>
            <p className="mt-1 text-sm text-slate-600">Signed in as {user.displayName}</p>
          </div>
          <button type="button" className="btn-soft" onClick={onLogout}>
            Logout
          </button>
        </div>
      </section>

      <section className="glass mb-4 p-4 sm:p-5">
        <p className="label mb-2">New Chat</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="field"
            placeholder="Optional chat title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <button type="button" onClick={createChat} className="btn-primary whitespace-nowrap">
            Create chat
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <ChatList title="Owned Chats" chats={owned} />
        <ChatList title="Shared With Me" chats={shared} />
      </div>

      {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
    </main>
  );
}
