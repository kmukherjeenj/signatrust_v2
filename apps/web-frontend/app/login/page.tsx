'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Spinner } from '@/components/ui';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn('nodemailer', {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        const errorMsg = 'Failed to send magic link. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        setSent(true);
        toast.success('Magic link sent! Check your email.');
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 mb-4">
          <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Check Your Email</h1>
        <p className="text-zinc-400 mb-4">
          We sent a magic link to <span className="text-white font-medium">{email}</span>
        </p>
        <p className="text-sm text-zinc-500">
          Click the link in the email to sign in. The link expires in 24 hours.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-8">
        <h1 className="text-2xl font-semibold mb-2 text-center">Sign In</h1>
        <p className="text-zinc-400 mb-6 text-center">
          Enter your email to receive a magic link
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>

          <Button
            type="submit"
            disabled={!email}
            loading={loading}
            className="w-full"
          >
            Send Magic Link
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-zinc-500">
            No password needed. We&apos;ll send you a secure link to sign in.
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <a href="/" className="text-emerald-400 hover:text-emerald-300">
          Continue without signing in
        </a>
      </p>
    </>
  );
}

function LoginFormFallback() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-8">
      <h1 className="text-2xl font-semibold mb-2 text-center">Sign In</h1>
      <p className="text-zinc-400 mb-6 text-center">
        Enter your email to receive a magic link
      </p>
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <header className="mb-8 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
            <span className="font-semibold tracking-tight text-lg">SignaTrust</span>
          </div>
        </header>

        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
