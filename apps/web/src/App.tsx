import { Navigate, Route, Routes } from 'react-router-dom';
import { useMemo, useState } from 'react';
import type { UserView } from '@skid/shared/types';
import { AuthPage } from './pages/AuthPage';
import { ChatsPage } from './pages/ChatsPage';
import { ChatPage } from './pages/ChatPage';

const STORAGE_TOKEN = 'skid-commons-token';
const STORAGE_USER = 'skid-commons-user';

function loadInitialAuth(): { token: string | null; user: UserView | null } {
  const token = localStorage.getItem(STORAGE_TOKEN);
  const userRaw = localStorage.getItem(STORAGE_USER);

  if (!token || !userRaw) {
    return { token: null, user: null };
  }

  try {
    return {
      token,
      user: JSON.parse(userRaw) as UserView
    };
  } catch {
    return { token: null, user: null };
  }
}

export default function App(): JSX.Element {
  const initial = useMemo(() => loadInitialAuth(), []);
  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<UserView | null>(initial.user);

  const onAuthenticated = (nextToken: string, nextUser: UserView): void => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(STORAGE_TOKEN, nextToken);
    localStorage.setItem(STORAGE_USER, JSON.stringify(nextUser));
  };

  const onLogout = (): void => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
  };

  if (!token || !user) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage onAuthenticated={onAuthenticated} />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chats" replace />} />
      <Route path="/chats" element={<ChatsPage token={token} user={user} onLogout={onLogout} />} />
      <Route path="/chats/:chatId" element={<ChatPage token={token} user={user} />} />
      <Route path="*" element={<Navigate to="/chats" replace />} />
    </Routes>
  );
}
