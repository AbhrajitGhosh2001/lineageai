import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { getMe } from '../lib/auth';
import type { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

export default function AuthCallbackPage({ onLogin }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    // Token is passed in the URL fragment: /auth/callback#token=xxx
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const token = params.get('token');

    if (!token) {
      navigate('/login?error=oauth');
      return;
    }

    localStorage.setItem('token', token);

    getMe()
      .then((user) => {
        onLogin(user);
        navigate('/dashboard');
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login?error=oauth');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Activity className="w-7 h-7 text-white" />
        </div>
        <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-gray-500 dark:text-slate-400 text-sm">Completing sign-in…</p>
      </div>
    </div>
  );
}
