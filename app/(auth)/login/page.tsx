import { Navbar } from '@/components/Navbar';
import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params       = await searchParams;
  const redirectPath = params.redirect ?? '';

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
              Enter your membership number and email address to access your account.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem', maxWidth: '480px' }}>
          <LoginForm redirectPath={redirectPath} />
        </div>
      </main>
    </>
  );
}
