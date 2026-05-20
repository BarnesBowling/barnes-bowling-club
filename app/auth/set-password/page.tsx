'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SetPasswordPage() {
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [memberNo,  setMemberNo]  = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string | null>(null);
  const supabase = createClient();
  const router   = useRouter();

  useEffect(() => {
    // Fetch club_members record for the current Supabase auth user
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from('club_members')
        .select('membership_number, full_name')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (data) {
        setMemberNo(data.membership_number);
        setMemberName(data.full_name);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) { setError(updateError.message); setLoading(false); return; }
    // Create custom member session via API route
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      await fetch('/api/auth/member-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
    }
    router.push('/members/dashboard');
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1px solid rgba(45,90,61,.25)',
    fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
    color: '#1a2e1f', background: '#fff', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#fff', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>
          Barnes Bowling Club
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', color: 'var(--green-deep)', margin: '0 0 0.5rem' }}>
          Welcome{memberName ? `, ${memberName.split(' ')[0]}` : ''}
        </h1>
        {memberNo && (
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(27,59,38,.6)', marginBottom: '1.5rem' }}>
            Your membership number is{' '}
            <strong style={{ color: 'var(--green-deep)', fontWeight: 700, letterSpacing: '.04em' }}>{memberNo}</strong>
          </div>
        )}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'rgba(27,59,38,.7)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Please set a password to activate your account.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(27,59,38,.5)', marginBottom: '6px' }}>
              New Password
            </label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inp} placeholder="Minimum 8 characters" />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(27,59,38,.5)', marginBottom: '6px' }}>
              Confirm Password
            </label>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} style={inp} placeholder="Repeat your password" />
          </div>
          {error && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#c0392b', padding: '10px 14px', background: 'rgba(192,57,43,.06)', borderLeft: '3px solid #c0392b' }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '13px', background: 'var(--green-deep)', color: '#fff', border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', cursor: loading ? 'default' : 'pointer', opacity: loading ? .7 : 1 }}
          >
            {loading ? 'Activating…' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
