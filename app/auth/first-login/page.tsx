import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { FirstLoginForm } from './FirstLoginForm';

const GREEN_DEEP = '#1b3b26';
const GOLD = '#A89560';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#fff', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD, marginBottom: '0.75rem' }}>
          Barnes Bowling Club
        </div>
        {children}
      </div>
    </div>
  );
}

export default async function FirstLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // No active session — invite link has expired or was never clicked
  if (!user?.email) {
    return (
      <Wrapper>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', color: GREEN_DEEP, margin: '0 0 1rem' }}>
          This link has expired
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'rgba(27,59,38,.65)', lineHeight: 1.7, margin: 0 }}>
          Your invite link is no longer valid. Please ask the club secretary for a new one at{' '}
          <a href="mailto:info@barnesbowling.club" style={{ color: GREEN_DEEP }}>info@barnesbowling.club</a>.
        </p>
      </Wrapper>
    );
  }

  // Look up club member by session email, case-insensitively
  const { data: member } = await supabaseAdmin
    .from('club_members')
    .select('id, full_name, membership_number, password_set')
    .ilike('email', user.email)
    .maybeSingle();

  // No matching record
  if (!member) {
    return (
      <Wrapper>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', color: GREEN_DEEP, margin: '0 0 1rem' }}>
          Membership not found
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'rgba(27,59,38,.65)', lineHeight: 1.7, margin: 0 }}>
          We couldn&rsquo;t find your membership record for <strong>{user.email}</strong>. Please contact the club secretary at{' '}
          <a href="mailto:info@barnesbowling.club" style={{ color: GREEN_DEEP }}>info@barnesbowling.club</a>.
        </p>
      </Wrapper>
    );
  }

  // Already set up
  if (member.password_set) {
    return (
      <Wrapper>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', color: GREEN_DEEP, margin: '0 0 1rem' }}>
          Account already set up
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'rgba(27,59,38,.65)', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
          Your password is already set. Please sign in with your email and password.
        </p>
        <a href="/login" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: GREEN_DEEP }}>Go to sign in →</a>
      </Wrapper>
    );
  }

  const firstName = member.full_name?.split(' ')[0] ?? null;

  return (
    <Wrapper>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', color: GREEN_DEEP, margin: '0 0 0.5rem' }}>
        Welcome{firstName ? `, ${firstName}` : ' to Barnes Bowling Club'}
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'rgba(27,59,38,.65)', marginBottom: '2rem', lineHeight: 1.6 }}>
        We found your membership record. Click Continue to set your password and access the members area.
      </p>
      {member.membership_number && (
        <div style={{ display: 'inline-block', marginBottom: '1.5rem', padding: '6px 14px', background: 'rgba(168,149,96,.08)', border: '1px solid rgba(168,149,96,.3)' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(27,59,38,.45)' }}>
            Membership No.{' '}
          </span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: 500, color: GREEN_DEEP, letterSpacing: '.04em' }}>
            {member.membership_number}
          </span>
        </div>
      )}
      <FirstLoginForm />
    </Wrapper>
  );
}
