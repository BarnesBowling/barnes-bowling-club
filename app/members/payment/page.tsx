import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';
import { StripePaymentForm } from './StripePaymentForm';

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ amount?: string }>;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  const session = sessionCookie ? await verifyMemberSession(sessionCookie.value) : null;
  if (!session) redirect('/login?redirect=/members/payment');

  const { amount: amountParam } = await searchParams;
  const outstandingAmount = amountParam ? parseFloat(amountParam) : null;
  const hasOutstanding = outstandingAmount !== null && outstandingAmount > 0;

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/members/dashboard" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Members Area</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Make a <em style={{ color: 'var(--gold-light)' }}>Payment</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Pay your annual subscription or guest fee securely online.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem', maxWidth: '680px' }}>

          {/* ── Outstanding balance card (shown when coming from /members/account) ── */}
          {hasOutstanding && (
            <div style={{
              background: '#fff',
              border: '2px solid rgba(192,57,43,.25)',
              borderLeft: '4px solid #c0392b',
              padding: '2rem 2.5rem',
              marginBottom: '2rem',
            }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                color: '#c0392b',
                marginBottom: '8px',
              }}>
                Outstanding Balance
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '2rem',
                    fontWeight: 400,
                    color: '#c0392b',
                    lineHeight: 1,
                    marginBottom: '6px',
                  }}>
                    £{outstandingAmount!.toFixed(2)}
                  </div>
                  <p style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    margin: 0,
                    lineHeight: 1.7,
                  }}>
                    Your current outstanding balance with Barnes Bowling Club.
                  </p>
                </div>
                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                    Use the payment form below to pay this balance.
                  </p>
              </div>
            </div>
          )}

          {/* Payment option cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(45,90,61,.08)', marginBottom: '3rem' }}>

            {/* Annual subscription */}
            <div style={{ background: 'var(--cream)', padding: '2rem 2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: 'var(--gold)', marginBottom: '6px' }}>Annual Fee</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 500, color: 'var(--green-deep)', marginBottom: '4px' }}>Playing Member Subscription</div>
                  <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.7 }}>
                    Full season access, Apr–Oct. Includes all club competitions and social events.
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 600, color: 'var(--green-deep)' }}>£215</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '.05em' }}>per season</div>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                  Use the payment form below.
                </p>
              </div>
            </div>

            {/* Guest fee */}
            <div style={{ background: 'var(--cream)', padding: '2rem 2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: 'var(--gold)', marginBottom: '6px' }}>Per Visit</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 500, color: 'var(--green-deep)', marginBottom: '4px' }}>Guest Fee</div>
                  <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.7 }}>
                    Bring a guest to the green for a single session. Payable once per guest visit.
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 600, color: 'var(--green-deep)' }}>£5</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '.05em' }}>per guest visit</div>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                  Use the payment form below.
                </p>
              </div>
            </div>

          </div>

          {/* ── Stripe payment form ── */}
          <div style={{ background: 'var(--cream)', padding: '2rem 2.5rem', marginBottom: '1px' }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '6px',
            }}>
              Pay by Card
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--green-deep)',
              marginBottom: '1.5rem',
            }}>
              Secure online payment
            </div>
            <StripePaymentForm />
          </div>

          {/* Bank transfer */}
          <div style={{ padding: '1.5rem 2rem', background: 'rgba(45,90,61,.04)', borderLeft: '3px solid rgba(45,90,61,.2)', marginBottom: '3rem' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 500, color: 'var(--green-deep)', marginBottom: '10px' }}>Pay by bank transfer</div>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', lineHeight: 1.8, color: 'var(--text-mid)', margin: '0 0 .75rem' }}>
              Payments can also be made directly by bank transfer. Please contact the Treasurer for account details and use your full name as the payment reference.
            </p>
            <a href="mailto:info@barnesbowling.com" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none', letterSpacing: '.05em' }}>
              Contact the Treasurer →
            </a>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <a href="/members/dashboard" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none', letterSpacing: '.05em' }}>
              ← Back to dashboard
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
