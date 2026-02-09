import type { AuthResponse, ChatSummary, ChatsResponse, MessageView, UserView } from '@skid/shared/types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface ApiError {
  message: string;
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const error = (await response.json()) as ApiError;
      message = error.message ?? message;
    } catch {
      // noop
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const apiClient = {
  register: (payload: { accountId: string; displayName: string }) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { accountId: string }) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  listChats: (token: string) => request<ChatsResponse>('/api/chats', {}, token),

  createChat: (token: string, payload: { title?: string }) =>
    request<ChatSummary>(
      '/api/chats',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      token
    ),

  shareChat: (token: string, chatId: string, payload: { targetAccountId: string }) =>
    request<{ ok: true }>(
      `/api/chats/${chatId}/share`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      token
    ),

  getParticipants: (token: string, chatId: string) => request<UserView[]>(`/api/chats/${chatId}/participants`, {}, token),

  listMessages: (token: string, chatId: string) => request<MessageView[]>(`/api/chats/${chatId}/messages`, {}, token),

  sendMessage: (token: string, chatId: string, payload: { content: string }) =>
    request<MessageView>(
      `/api/chats/${chatId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      token
    )
};
