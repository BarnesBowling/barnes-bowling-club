import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';

type Row = { section_key: string; body: string };

function get(rows: Row[], key: string, fallback: string): string {
  return rows.find(r => r.section_key === key)?.body ?? fallback;
}

function paras(text: string): string[] {
  return text.split('\n\n').map(p => p.trim()).filter(Boolean);
}

function fmtPrice(pence: number): string {
  return `£${(pence / 100).toFixed(0)}`;
}

export default async function Membership() {
  const [{ data: contentRows }, { data: priceRows }] = await Promise.all([
    supabaseAdmin
      .from('page_content')
      .select('section_key, body')
      .eq('page', 'membership')
      .order('sort_order'),
    supabaseAdmin
      .from('membership_prices')
      .select('key, label, amount_pence, note')
      .order('amount_pence', { ascending: false }),
  ]);

  const rows   = contentRows ?? [];
  const prices = priceRows   ?? [];

  const priceMap = Object.fromEntries(prices.map(p => [p.key, p]));

  const annualFee    = priceMap['annual_fee']  ?? { label: 'Membership Fee',       amount_pence: 21500, note: 'per season' };
  const joiningFee   = priceMap['joining_fee'] ?? { label: 'One-Time Joining Fee', amount_pence: 10000, note: 'Payable once on first joining the club' };

  const introText      = get(rows, 'intro',                 'We may be a small private club, but we\'re a friendly, sociable one with a wonderfully colourful history. Over the years, our green has welcomed generations of Barnes residents, including musicians, artists and writers.\n\nWhether you\'re an experienced player or completely new to bowls, we encourage you to come down, meet us and give it a go.');
  const featuresText   = get(rows, 'membership_features',   'Unlimited green access, Apr–Oct\nAll club competitions\nEquipment provided for beginners\nCoaching from experienced members\nClub newsletter & social events\nOff-Season social events');
  const joiningDesc    = get(rows, 'joining_fee_description','The one-time joining fee offers lifetime membership to our private club. Applicants are proposed and seconded by two active voting members and join a waitlist; membership and fees are non-transferable.');
  const wedNightsText  = get(rows, 'wednesday_nights',       'Try your arm at one of our Wednesday evening roll-ups — just turn up! No experience is needed and all equipment is provided on the day.\n\nIt\'s a relaxed, friendly evening — a great way to see if bowls is for you before committing to full membership.');

  const features = featuresText.split('\n').map(f => f.trim()).filter(Boolean);

  return (
    <>
      <Navbar />
      <main className="membership-section">
        <div className="section-inner">
          <div className="section-tag">Membership</div>
          <h2 className="section-h2">Join a <em>living piece</em><br />of London history</h2>

          {paras(introText).map((p, i) => (
            <p key={i} className="section-lead">{p}</p>
          ))}

          {/* Pricing cards */}
          <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>

            <div className="membership-card" style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column' }}>
              <div className="membership-card-tag">Member</div>
              <div className="membership-card-name">{annualFee.label}</div>
              <div className="membership-price">{fmtPrice(annualFee.amount_pence)}</div>
              <div className="membership-price-note">{annualFee.note}</div>
              <ul className="membership-features" style={{ flex: 1 }}>
                {features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <div className="joining-fee-box">
                <div className="joining-fee-label">{joiningFee.label}</div>
                <div className="joining-fee-amount">{fmtPrice(joiningFee.amount_pence)}</div>
                <div className="joining-fee-note">{joiningFee.note}</div>
              </div>
              <Link href="/apply" className="pay-btn-gold">Apply for Membership →</Link>
            </div>

            <div className="membership-card" style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column' }}>
              <div className="membership-card-tag">Joining Fee</div>
              <div className="membership-card-name">Joining the Club</div>
              <div className="membership-price">{fmtPrice(joiningFee.amount_pence)}</div>
              <div className="membership-price-note">{joiningFee.note}</div>
              <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '15px', lineHeight: 1.9, color: 'rgba(245,240,232,.75)', margin: 0, flex: 1 }}>
                {joiningDesc}
              </p>
            </div>

          </div>

          {/* Wednesday Club Nights */}
          <div style={{ marginTop: '2rem' }}>
            <div className="membership-card">
              <div className="membership-card-tag">No Experience Needed</div>
              <div className="membership-card-name">Wednesday Club Nights</div>
              <div style={{ marginTop: '1.5rem' }}>
                {paras(wedNightsText).map((p, i, arr) => (
                  <p key={i} style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '15px', lineHeight: 1.9, color: 'rgba(245,240,232,.75)', margin: i < arr.length - 1 ? '0 0 1.25rem' : 0 }}>
                    {p}
                  </p>
                ))}
              </div>
              <div style={{ marginTop: '2.5rem' }}>
                <Link href="/roll-ups" className="pay-btn-gold">Find Out More →</Link>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
