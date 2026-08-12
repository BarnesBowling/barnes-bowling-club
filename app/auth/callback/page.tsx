'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function CallbackHandler() {
  const router      = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    async function handle() {
      const code      = searchParams.get('code');
      const tokenHash = searchParams.get('token_hash');
      const type      = searchParams.get('type') as 'invite' | 'recovery' | 'email' | null;

      // PKCE code flow
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        router.replace(error ? '/login' : '/auth/set-password');
        return;
      }

      // Token-hash flow (token_hash + type as query params)
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        router.replace(error ? '/login' : '/auth/set-password');
        return;
      }

      // Implicit flow — tokens arrive in the URL hash fragment, which the server
      // never sees. We read them client-side and establish the session manually.
      const hash = window.location.hash.slice(1);
      if (hash) {
        const p            = new URLSearchParams(hash);
        const accessToken  = p.get('access_token');
        const refreshToken = p.get('refresh_token');
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          router.replace(error ? '/login' : '/auth/set-password');
          return;
        }
      }

      router.replace('/login');
    }

    handle();
  }, [router, searchParams]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f0e8',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ fontSize: 14, color: '#1b3b26', letterSpacing: '.04em' }}>Verifying…</p>
      <Suspense fallback={null}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
