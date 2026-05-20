import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

const PAYMENT_LABELS: Record<string, string> = {
  full: 'Playing Member Subscription',
  social: 'Social Member Subscription',
  junior: 'Junior Member Subscription',
  guest_fee: 'Guest Fee',
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let details: {
    paymentLabel: string;
    amount: string;
    date: string;
    reference: string;
    email: string | null;
  } | null = null;

  if (session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const { stripe } = await import('@/lib/stripe');
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const paymentType = session.metadata?.payment_type ?? session.metadata?.membership ?? '';
      details = {
        paymentLabel: PAYMENT_LABELS[paymentType] ?? 'Payment',
        amount: session.amount_total
          ? `£${(session.amount_total / 100).toFixed(2)}`
          : '—',
        date: new Date(session.created * 1000).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        reference: session.id,
        email: session.customer_details?.email ?? session.customer_email ?? null,
      };
    } catch {
      // stripe lookup failed — show generic confirmation
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a
              href="/members/dashboard"
              className="section-tag"
              style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}
            >
              Members Area
            </a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Payment <em style={{ color: 'var(--gold-light)' }}>confirmed</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Thank you — your payment has been received.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem', maxWidth: '640px' }}>

          {/* Receipt block */}
          <div style={{ background: 'var(--cream)', padding: '2.5rem', marginBottom: '2rem', border: '1px solid rgba(45,90,61,.12)' }}>

            {/* Tick icon */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(45,90,61,.1)',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--green-deep)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            {details ? (
              <>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '.2em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  marginBottom: '12px',
                }}>
                  Payment Receipt
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Libre Baskerville', serif", fontSize: '14px' }}>
                  <tbody>
                    {[
                      { label: 'Description', value: details.paymentLabel },
                      { label: 'Amount paid', value: details.amount },
                      { label: 'Date', value: details.date },
                      { label: 'Transaction ref', value: details.reference, mono: true },
                      ...(details.email ? [{ label: 'Confirmation sent to', value: details.email }] : []),
                    ].map(({ label, value, mono }) => (
                      <tr key={label} style={{ borderBottom: '1px solid rgba(45,90,61,.1)' }}>
                        <td style={{ padding: '10px 0', color: 'var(--text-muted)', width: '40%' }}>{label}</td>
                        <td style={{
                          padding: '10px 0',
                          color: 'var(--green-deep)',
                          fontFamily: mono ? "'DM Sans', monospace" : undefined,
                          fontSize: mono ? '12px' : undefined,
                          wordBreak: 'break-all',
                        }}>
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {details.email && (
                  <p style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    margin: '1.25rem 0 0',
                    lineHeight: 1.7,
                  }}>
                    A confirmation email has been sent to {details.email}.
                  </p>
                )}
              </>
            ) : (
              <>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '18px',
                  fontWeight: 500,
                  color: 'var(--green-deep)',
                  marginBottom: '10px',
                }}>
                  Payment received
                </div>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '14px',
                  lineHeight: 1.8,
                  color: 'var(--text-muted)',
                  margin: 0,
                }}>
                  Your payment has been processed successfully. A confirmation email will be sent to your registered email address shortly.
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link
              href="/members/dashboard"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: 'var(--green-mid)',
                textDecoration: 'none',
                letterSpacing: '.05em',
              }}
            >
              ← Back to dashboard
            </Link>
            <Link
              href="/members/payment"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                letterSpacing: '.05em',
              }}
            >
              Make another payment
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
