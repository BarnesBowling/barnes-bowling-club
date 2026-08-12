import { Navbar } from '@/components/Navbar';
import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; reset?: string }>;
}) {
  const params       = await searchParams;
  const redirectPath = params.redirect ?? '';
  const passwordReset = params.reset === '1';

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>Members Area</div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Sign in
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Enter your membership number and password to access your account.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem', maxWidth: '480px' }}>
          {passwordReset && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '0.875rem 1.125rem',
              background: 'rgba(46,125,50,.06)',
              border: '1px solid rgba(46,125,50,.22)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: '#2e7d32',
              lineHeight: 1.5,
            }}>
              Password updated — please log in with your new password.
            </div>
          )}
          <LoginForm redirectPath={redirectPath} />
        </div>
      </main>
    </>
  );
}
