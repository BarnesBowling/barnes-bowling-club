import { createClient } from '@/lib/supabase/server';

const TICKER_ITEMS = [
  'Season 2026 · 25th April to early October',
  'Playing Membership £215 · Joining Fee £100',
  'International Day — 28 June · Guests Welcome',
  'Sun Inn, Church Road, Barnes SW13 · Est. 1725',
  'Wednesday nights 6-8pm open to all',
];

export async function GreenBanner() {
  const supabase = await createClient();
  const { data: green } = await supabase
    .from('green_status')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const status = green?.status ?? 'open_good';
  const condition = green?.message ?? 'Green open — please check conditions before play';

  const statusLabel =
    status === 'open_good' ? 'Green Open' :
    status === 'open_fair' ? 'Open — Fair' : 'Green Closed';

  const allItems = [`Conditions: ${condition}`, ...TICKER_ITEMS];
  const doubled = [...allItems, ...allItems];

  return (
    <div className={`green-banner ${status.replace('_', '-')}`}>
      <div className="banner-status-pill">
        <div className="banner-dot" />
        <span>{statusLabel}</span>
      </div>
      <div className="banner-ticker-wrap">
        <div className="banner-ticker">
          {doubled.map((item, i) => (
            <span key={i}>
              <span className="ticker-item">{item}</span>
              <span className="ticker-sep">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
