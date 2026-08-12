import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySetupToken, SETUP_COOKIE } from '@/lib/memberSession';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SetupPasswordForm } from './SetupPasswordForm';

const GOLD        = '#c9a84c';
const GREEN_DEEP  = '#1b3b26';

export default async function SetupPasswordPage() {
  const cookieStore = await cookies();
  const tokenValue  = cookieStore.get(SETUP_COOKIE)?.value;

  if (!tokenValue) redirect('/auth/first-login');

  const tokenData = await verifySetupToken(tokenValue);
  if (!tokenData) redirect('/auth/first-login');

  const { email } = tokenData;

  // Fetch member details for display
  const [{ data: member }, { data: profile }] = await Promise.all([
    supabaseAdmin.from('club_members').select('membership_number, full_name').eq('email', email).maybeSingle(),
    supabaseAdmin.from('member_profiles').select('first_name').eq('member_email', email).maybeSingle(),
  ]);

  const firstName      = profile?.first_name || member?.full_name?.split(' ')[0] || null;
  const membershipNumber = member?.membership_number ?? null;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>

        {/* Card header — matches transactional email header style */}
        <div style={{ background: GREEN_DEEP, padding: '28px 36px' }}>
          <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: `rgba(201,168,76,.85)` }}>
            Barnes Bowling Club
          </p>
          <h1 style={{ margin: '8px 0 0', fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: '#f5f0e8', letterSpacing: '-.01em' }}>
            Welcome{firstName ? `, ${firstName}` : ' to Barnes Bowling Club'}
          </h1>
        </div>

        {/* Card body */}
        <div style={{ background: '#fff', padding: '36px' }}>

          {membershipNumber && (
            <div style={{
              display: 'inline-block',
              marginBottom: '1.5rem',
              padding: '6px 14px',
              background: 'rgba(201,168,76,.08)',
              border: `1px solid rgba(201,168,76,.3)`,
            }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(27,59,38,.45)' }}>
                Membership No.{' '}
              </span>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: 500, color: GREEN_DEEP, letterSpacing: '.04em' }}>
                {membershipNumber}
              </span>
            </div>
          )}

          <p style={{ margin: '0 0 2rem', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', lineHeight: 1.7, color: 'rgba(27,59,38,.7)' }}>
            For security, please set a password for your account. You&rsquo;ll use this to log in from now on.
          </p>

          <SetupPasswordForm email={email} />
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 36px', background: '#f5f0e8', borderTop: '1px solid #e8e4dc' }}>
          <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#9ca3af' }}>
            Barnes Bowling Club · The Sun Inn, Church Road, Barnes, London SW13&nbsp;9HE
          </p>
        </div>

      </div>
    </div>
  );
}
