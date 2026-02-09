import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { MessageView, UserView } from '@skid/shared/types';
import { apiClient } from '../api/client';
import { createSocket } from '../realtime/socket';

interface ChatPageProps {
  token: string;
  user: UserView;
}

function MessageBubble({ message, me }: { message: MessageView; me: UserView }): JSX.Element {
  const isAssistant = message.authorType === 'ASSISTANT';
  const isMe = !isAssistant && message.authorUserId === me.id;

  return (
    <article className={`max-w-[88%] rounded-2xl border px-3 py-2.5 ${isMe ? 'ml-auto border-sky-200 bg-sky-50/85' : 'border-slate-200 bg-white/90'}`}>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {isAssistant ? 'Skid Commons' : isMe ? `${message.authorDisplayName} (you)` : message.authorDisplayName}
      </div>
      <p className="text-[0.95rem] leading-relaxed text-slate-800">{message.content}</p>
    </article>
  );
}

export function ChatPage({ token, user }: ChatPageProps): JSX.Element {
  const { chatId = '' } = useParams();
  const [participants, setParticipants] = useState<UserView[]>([]);
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [content, setContent] = useState('');
  const [shareAccountId, setShareAccountId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (participants.length <= 1) {
      return `Chat ${chatId.slice(0, 8)}`;
    }
    return participants.map((participant) => participant.displayName).join(', ');
  }, [participants, chatId]);

  useEffect(() => {
    const socket = createSocket(token);

    const bootstrap = async (): Promise<void> => {
      try {
        const [initialMessages, initialParticipants] = await Promise.all([
          apiClient.listMessages(token, chatId),
          apiClient.getParticipants(token, chatId)
        ]);

        setMessages(initialMessages);
        setParticipants(initialParticipants);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat');
      }
    };

    void bootstrap();

    socket.on('connect', () => {
      socket.emit('chat:join', { chatId });
    });

    socket.on('chat:messageCreated', (payload) => {
      if (payload.chatId !== chatId) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((message) => message.id === payload.message.id)) {
          return prev;
        }
        return [...prev, payload.message];
      });
    });

    socket.on('chat:participantAdded', (payload) => {
      if (payload.chatId !== chatId) {
        return;
      }

      setParticipants((prev) => {
        if (prev.some((participant) => participant.id === payload.user.id)) {
          return prev;
        }
        return [...prev, payload.user];
      });
    });

    socket.on('error', (payload) => {
      setError(payload.message);
    });

    return () => {
      socket.emit('chat:leave', { chatId });
      socket.disconnect();
    };
  }, [chatId, token]);

  const handleSend = async (): Promise<void> => {
    if (!content.trim()) {
      return;
    }

    try {
      await apiClient.sendMessage(token, chatId, { content: content.trim() });
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleShare = async (): Promise<void> => {
    if (!shareAccountId.trim()) {
      return;
    }

    try {
      await apiClient.shareChat(token, chatId, { targetAccountId: shareAccountId.trim() });
      setShareAccountId('');
      const refreshed = await apiClient.getParticipants(token, chatId);
      setParticipants(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share chat');
    }
  };

  return (
    <main className="shell">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Link
          className="rounded-lg border border-slate-200 bg-white/75 px-2.5 py-1.5 text-sm text-slate-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
          to="/chats"
        >
          Back to chats
        </Link>
        <span className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600">
          {participants.length} participant{participants.length === 1 ? '' : 's'}
        </span>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <section className="glass flex min-h-[65vh] flex-col overflow-hidden">
          <div className="border-b border-slate-200/90 px-4 py-4 sm:px-5">
            <h1 className="text-[clamp(1.2rem,2.1vw,1.75rem)] font-semibold tracking-tight">{title}</h1>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3 sm:px-4">
            {messages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300/90 px-3 py-8 text-center text-sm text-slate-500">
                No messages yet. Start the conversation.
              </div>
            ) : null}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} me={user} />
            ))}
          </div>

          <div className="border-t border-slate-200/90 px-3 py-3 sm:px-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="field"
                placeholder="Type a message"
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
              <button type="button" onClick={handleSend} className="btn-primary whitespace-nowrap">
                Send
              </button>
            </div>
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="glass p-4">
            <p className="label mb-2">Participants</p>
            <ul className="space-y-2">
              {participants.map((participant) => (
                <li key={participant.id} className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700">
                  {participant.displayName}
                  {participant.id === user.id ? ' (you)' : ''}
                </li>
              ))}
            </ul>
          </section>

          <section className="glass p-4">
            <p className="label mb-2">Share Chat</p>
            <div className="grid gap-2.5">
              <input
                className="field"
                placeholder="Target accountId"
                value={shareAccountId}
                onChange={(event) => setShareAccountId(event.target.value)}
              />
              <button type="button" onClick={handleShare} className="btn-soft">
                Add participant
              </button>
            </div>
          </section>
        </aside>
      </div>

      {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
    </main>
  );
}
