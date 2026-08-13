import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PaymentEventsClient } from './PaymentEventsClient';

export default async function PaymentEventsPage() {
  await requireAdminSession();

  const { data: events } = await supabaseAdmin
    .from('payment_events')
    .select('id, name, amount, is_tbc, sort_order, active')
    .order('sort_order');

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/admin" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Admin</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Payment <em style={{ color: 'var(--gold-light)' }}>Events</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(245,240,232,.65)', marginTop: '0.75rem' }}>
              Manage the events shown on the member payment page.
            </p>
          </div>
        </div>
        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          <PaymentEventsClient initialEvents={events ?? []} />
        </div>
      </main>
      <Footer />
    </>
  );
}
