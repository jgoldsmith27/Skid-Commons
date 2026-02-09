import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { MessageView, UserView } from '@skid/shared/types';
import { apiClient } from '../api/client';
import { createSocket } from '../realtime/socket';

interface ChatPageProps {
  token: string;
  user: UserView;
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
    <main className="mx-auto grid w-[min(96vw,64rem)] gap-3 px-3 py-5 sm:py-8">
      <Link className="w-fit text-sm text-slate-500 hover:text-slate-700" to="/chats">
        ← Back to chats
      </Link>

      <section className="rounded-2xl border border-line/90 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
        <h1 className="text-[clamp(1.2rem,2.1vw,1.7rem)] font-semibold tracking-tight">{title}</h1>
        {participants.length > 1 ? (
          <p className="mt-1 text-sm text-slate-500">
            Participants: {participants.map((participant) => participant.displayName).join(', ')}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-line/90 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
        <h2 className="mb-2 text-base font-medium">Share chat</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300/60"
            placeholder="Target accountId"
            value={shareAccountId}
            onChange={(event) => setShareAccountId(event.target.value)}
          />
          <button
            type="button"
            onClick={handleShare}
            className="rounded-xl border border-line bg-mist px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Share
          </button>
        </div>
      </section>

      <section className="max-h-[60vh] min-h-[46vh] overflow-y-auto rounded-2xl border border-line bg-white/90 p-3 shadow-sm">
        {messages.map((message) => (
          <article key={message.id} className="border-b border-slate-100 py-2 last:border-0">
            <div className="text-sm font-semibold">
              {message.authorType === 'ASSISTANT'
                ? 'Skid Commons'
                : message.authorUserId === user.id
                  ? `${message.authorDisplayName} (you)`
                  : message.authorDisplayName}
            </div>
            <div className="mt-0.5 text-[0.94rem] leading-relaxed text-slate-800">{message.content}</div>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-2 sm:flex-row">
        <input
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300/60"
          placeholder="Type a message"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <button type="button" onClick={handleSend} className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">
          Send
        </button>
      </section>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </main>
  );
}
