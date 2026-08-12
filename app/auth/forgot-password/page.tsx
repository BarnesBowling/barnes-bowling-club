import { ForgotPasswordForm } from './ForgotPasswordForm';

const GREEN_DEEP = '#1b3b26';

export default function ForgotPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>

        <div style={{ background: GREEN_DEEP, padding: '28px 36px' }}>
          <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(201,168,76,.85)' }}>
            Barnes Bowling Club
          </p>
          <h1 style={{ margin: '8px 0 0', fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: '#f5f0e8', letterSpacing: '-.01em' }}>
            Forgot your password?
          </h1>
        </div>

        <div style={{ background: '#fff', padding: '36px' }}>
          <p style={{ margin: '0 0 2rem', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', lineHeight: 1.7, color: 'rgba(27,59,38,.7)' }}>
            Enter your email address or membership number and we&rsquo;ll send you a link to reset your password.
          </p>
          <ForgotPasswordForm />
        </div>

        <div style={{ padding: '16px 36px', background: '#f5f0e8', borderTop: '1px solid #e8e4dc' }}>
          <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#9ca3af' }}>
            Barnes Bowling Club · The Sun Inn, Church Road, Barnes, London SW13&nbsp;9HE
          </p>
        </div>

      </div>
    </div>
  );
}
