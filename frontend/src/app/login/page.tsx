"use client";

import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth, loginRedirect } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      setAuth(response.data.user, response.data.token);
      loginRedirect(response.data.user.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-zinc-950 -z-10"></div>
      <div className="max-w-md w-full p-8 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">AtomQuest</h1>
          <p className="text-zinc-400">Sign in to the Goal Tracking Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all text-white placeholder-zinc-500"
              placeholder="name@atomberg.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all text-white placeholder-zinc-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-semibold rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500">
          <p>Demo Credentials:</p>
          <div className="flex justify-center gap-4 mt-2">
            <span className="bg-zinc-800 px-2 py-1 rounded">admin@atomberg.com</span>
            <span className="bg-zinc-800 px-2 py-1 rounded">manager@atomberg.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
