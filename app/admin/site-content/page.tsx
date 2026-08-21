'use server';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ── Server actions ────────────────────────────────────────────────────────────

async function updateSection(formData: FormData) {
  'use server';
  await requireAdminSession();
  const id    = String(formData.get('id'));
  const page  = String(formData.get('page'));
  const title = String(formData.get('title') ?? '').trim();
  const body  = String(formData.get('body') ?? '');
  const update: Record<string, string> = { body, updated_at: new Date().toISOString() };
  if (title) update.title = title;
  await supabaseAdmin.from('page_content').update(update).eq('id', id);
  revalidatePath(`/${page}`);
  redirect(`/admin/site-content?tab=${page}`);
}

async function updatePrice(formData: FormData) {
  'use server';
  await requireAdminSession();
  const id           = String(formData.get('id'));
  const label        = String(formData.get('label')).trim();
  const amount_pence = Math.round(parseFloat(String(formData.get('amount'))) * 100);
  const note         = String(formData.get('note')).trim();
  await supabaseAdmin
    .from('membership_prices')
    .update({ label, amount_pence, note, updated_at: new Date().toISOString() })
    .eq('id', id);
  revalidatePath('/membership');
  redirect('/admin/site-content?tab=membership');
}

// ── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'opening-hours',  label: 'Opening Hours'  },
  { key: 'membership',     label: 'Membership'     },
  { key: 'contact',        label: 'Contact'        },
  { key: 'corporate-hire', label: 'Corporate Hire' },
] as const;

type TabKey = typeof TABS[number]['key'];

export default async function SiteContentPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  try { await requireAdminSession(); } catch { redirect('/login?redirect=/admin/site-content'); }

  const params    = await searchParams;
  const activeTab = (TABS.some(t => t.key === params.tab) ? params.tab : 'opening-hours') as TabKey;

  const [{ data: sections }, { data: prices }] = await Promise.all([
    supabaseAdmin
      .from('page_content')
      .select('id, page, section_key, title, body, sort_order')
      .eq('page', activeTab)
      .order('sort_order'),
    supabaseAdmin
      .from('membership_prices')
      .select('id, key, label, amount_pence, note')
      .order('amount_pence', { ascending: false }),
  ]);

  const inp: React.CSSProperties = {
    padding: '.7rem',
    border: '1px solid rgba(45,90,61,.2)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
    color: 'var(--green-deep)',
    background: '#fff',
  };

  const lbl: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: 'var(--gold)',
    display: 'block',
    marginBottom: '6px',
  };

  return (
    <>
      <Navbar />
      <main style={{ padding: '3rem 0', background: 'var(--cream)' }}>
        <div className="section-inner" style={{ padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          {/* Header */}
          <div>
            <a href="/admin" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none' }}>
              ← Back to Admin
            </a>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: 'var(--green-deep)', margin: '0.5rem 0 0.25rem' }}>
              Site Content
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              Edit the text on public-facing pages. Changes go live immediately after saving.
            </p>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '2px solid rgba(45,90,61,.12)', flexWrap: 'wrap' }}>
            {TABS.map(tab => (
              <a
                key={tab.key}
                href={`/admin/site-content?tab=${tab.key}`}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  color: activeTab === tab.key ? 'var(--green-deep)' : 'var(--text-muted)',
                  padding: '0.65rem 1.25rem',
                  textDecoration: 'none',
                  borderBottom: activeTab === tab.key ? '2px solid var(--green-deep)' : '2px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                {tab.label}
              </a>
            ))}
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px' }}>

            {/* Prices block — membership tab only */}
            {activeTab === 'membership' && (prices ?? []).length > 0 && (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', margin: '0 0 0.25rem' }}>
                  Prices
                </h2>
                {(prices ?? []).map(p => (
                  <details key={p.id} style={{ background: 'white', border: '1px solid rgba(45,90,61,.12)' }}>
                    <summary style={{ padding: '1rem 1.25rem', cursor: 'pointer', fontWeight: 600, color: 'var(--green-deep)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{p.label} — £{(p.amount_pence / 100).toFixed(2)}</span>
                      <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 400 }}>click to edit</span>
                    </summary>
                    <form action={updatePrice} style={{ padding: '1.25rem', borderTop: '1px solid rgba(45,90,61,.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <input type="hidden" name="id" value={p.id} />
                      <div>
                        <label style={lbl}>Label</label>
                        <input name="label" defaultValue={p.label} required style={inp} />
                      </div>
                      <div>
                        <label style={lbl}>Amount (£)</label>
                        <input
                          name="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={(p.amount_pence / 100).toFixed(2)}
                          required
                          style={{ ...inp, maxWidth: '160px' }}
                        />
                      </div>
                      <div>
                        <label style={lbl}>Note (e.g. "per season")</label>
                        <input name="note" defaultValue={p.note ?? ''} style={inp} />
                      </div>
                      <button className="btn" style={{ alignSelf: 'flex-start' }}>Save price</button>
                    </form>
                  </details>
                ))}

                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', margin: '1rem 0 0.25rem' }}>
                  Page Text
                </h2>
              </>
            )}

            {/* Text sections */}
            {(sections ?? []).length > 0 ? (
              (sections ?? []).map((s, i) => (
                <details key={s.id} style={{ background: 'white', border: '1px solid rgba(45,90,61,.12)' }}>
                  <summary style={{ padding: '1rem 1.25rem', cursor: 'pointer', fontWeight: 600, color: 'var(--green-deep)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{String(i + 1).padStart(2, '0')} — {s.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 400 }}>click to edit</span>
                  </summary>
                  <form action={updateSection} style={{ padding: '1.25rem', borderTop: '1px solid rgba(45,90,61,.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="hidden" name="id"   value={s.id} />
                    <input type="hidden" name="page" value={s.page} />

                    {/* Editable heading — Opening Hours only, since those titles appear as <h2> on the page */}
                    {activeTab === 'opening-hours' && (
                      <div>
                        <label style={lbl}>Section heading (shown on the page)</label>
                        <input name="title" defaultValue={s.title} required style={inp} />
                      </div>
                    )}

                    <div>
                      <label style={lbl}>
                        {s.section_key === 'membership_features'
                          ? 'Items — one per line'
                          : 'Body text — blank line between paragraphs'}
                      </label>
                      <textarea
                        name="body"
                        defaultValue={s.body}
                        style={{
                          ...inp,
                          minHeight: s.body.length > 400 ? '260px' : s.body.length > 150 ? '160px' : '100px',
                          resize: 'vertical',
                          lineHeight: 1.65,
                        }}
                      />
                    </div>
                    <button className="btn" style={{ alignSelf: 'flex-start' }}>Save</button>
                  </form>
                </details>
              ))
            ) : (
              <div style={{
                padding: '2rem',
                background: 'white',
                border: '1px solid rgba(45,90,61,.12)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}>
                No content found for this page. Run the SQL migration in the Supabase dashboard first.
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
