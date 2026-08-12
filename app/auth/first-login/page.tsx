import { FirstLoginForm } from './FirstLoginForm';

export default function FirstLoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#fff', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>
          Barnes Bowling Club
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', color: 'var(--green-deep)', margin: '0 0 0.5rem' }}>
          First time here?
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'rgba(27,59,38,.65)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Verify your membership using the number and email address we have on file. We&rsquo;ll then ask you to create a password for future logins.
        </p>
        <FirstLoginForm />
      </div>
    </div>
  );
}
