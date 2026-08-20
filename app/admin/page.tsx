import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AdminLinkCard } from './AdminLinkCard';
import { TickerAdmin } from './TickerAdmin';
import { EventsAdmin } from './EventsAdmin';
import { AccountsOverview } from './AccountsOverview';

async function updateGreen(formData: FormData) {
  'use server';
  await requireAdminSession();
  await supabaseAdmin.from('green_status').insert({
    status: String(formData.get('status')),
    message: String(formData.get('message')),
  });
  revalidatePath('/members/dashboard');
  redirect('/admin#green');
}

async function addNotice(formData: FormData) {
  'use server';
  await requireAdminSession();
  await supabaseAdmin.from('notices').insert({
    title: String(formData.get('title')),
    body: String(formData.get('body')),
    author: String(formData.get('author')),
  });
}

async function updateHistory(formData: FormData) {
  'use server';
  await requireAdminSession();
  await supabaseAdmin.from('history_sections').update({
    title: String(formData.get('title')),
    body: String(formData.get('body')),
  }).eq('id', String(formData.get('id')));
}

async function updateHowToPlay(formData: FormData) {
  'use server';
  await requireAdminSession();
  const id = String(formData.get('id'));
  await supabaseAdmin.from('how_to_play').update({
    title: String(formData.get('title')),
    body: String(formData.get('body')),
  }).eq('id', id);
}

async function updateTimelineEntry(formData: FormData) {
  'use server';
  await requireAdminSession();
  await supabaseAdmin.from('history_timeline').update({
    title: String(formData.get('title')),
    description: String(formData.get('description')),
    updated_at: new Date().toISOString(),
  }).eq('id', String(formData.get('id')));
}

async function deleteNotice(formData: FormData) {
  'use server';
  await requireAdminSession();
  await supabaseAdmin.from('notices').delete().eq('id', String(formData.get('id')));
  redirect('/admin');
}

async function addTickerMessage(formData: FormData) {
  'use server';
  await requireAdminSession();
  const message = String(formData.get('message')).trim();
  if (!message) return;
  const { data: last } = await supabaseAdmin
    .from('ticker_messages')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();
  await supabaseAdmin.from('ticker_messages').insert({ message, sort_order: (last?.sort_order ?? 0) + 1 });
  revalidatePath('/admin');
  revalidatePath('/');
}

async function saveTickerMessage(formData: FormData) {
  'use server';
  await requireAdminSession();
  const id = String(formData.get('id'));
  const message = String(formData.get('message')).trim();
  if (!message) return;
  await supabaseAdmin.from('ticker_messages').update({ message }).eq('id', id);
  revalidatePath('/admin');
  revalidatePath('/');
}

async function deleteTickerMessage(formData: FormData) {
  'use server';
  await requireAdminSession();
  await supabaseAdmin.from('ticker_messages').delete().eq('id', String(formData.get('id')));
  revalidatePath('/admin');
  revalidatePath('/');
}

async function toggleTickerMessage(formData: FormData) {
  'use server';
  await requireAdminSession();
  const active = formData.get('active') === 'true';
  await supabaseAdmin.from('ticker_messages').update({ active }).eq('id', String(formData.get('id')));
  revalidatePath('/admin');
  revalidatePath('/');
}

async function moveTickerMessage(formData: FormData) {
  'use server';
  await requireAdminSession();
  const id = String(formData.get('id'));
  const neighbourId = String(formData.get('neighbour_id'));
  const myOrder = Number(formData.get('my_order'));
  const neighbourOrder = Number(formData.get('neighbour_order'));
  await Promise.all([
    supabaseAdmin.from('ticker_messages').update({ sort_order: neighbourOrder }).eq('id', id),
    supabaseAdmin.from('ticker_messages').update({ sort_order: myOrder }).eq('id', neighbourId),
  ]);
  revalidatePath('/admin');
  revalidatePath('/');
}

async function addEvent(formData: FormData) {
  'use server';
  await requireAdminSession();
  const title = String(formData.get('title')).trim();
  const rawDate = String(formData.get('event_date') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const category = String(formData.get('category') ?? '').trim() || null;
  const dayLabel = String(formData.get('day_label') ?? '').trim() || null;
  const location = String(formData.get('location') ?? '').trim() || null;
  const isTbc = Boolean(formData.get('is_tbc'));
  await supabaseAdmin.from('events').insert({
    title,
    event_date: rawDate ? new Date(rawDate).toISOString() : null,
    description,
    category,
    day_label: dayLabel,
    location,
    is_tbc: isTbc,
    visibility: 'members',
  });
  revalidatePath('/admin');
  revalidatePath('/members/dashboard');
  revalidatePath('/members/competitions');
}

async function updateEvent(formData: FormData) {
  'use server';
  await requireAdminSession();
  const id = String(formData.get('id'));
  const title = String(formData.get('title')).trim();
  const rawDate = String(formData.get('event_date') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const category = String(formData.get('category') ?? '').trim() || null;
  const dayLabel = String(formData.get('day_label') ?? '').trim() || null;
  const location = String(formData.get('location') ?? '').trim() || null;
  const isTbc = Boolean(formData.get('is_tbc'));
  await supabaseAdmin.from('events').update({
    title,
    event_date: rawDate ? new Date(rawDate).toISOString() : null,
    description,
    category,
    day_label: dayLabel,
    location,
    is_tbc: isTbc,
  }).eq('id', id);
  revalidatePath('/admin');
  revalidatePath('/members/dashboard');
  revalidatePath('/members/competitions');
}

async function deleteEvent(formData: FormData) {
  'use server';
  await requireAdminSession();
  await supabaseAdmin.from('events').delete().eq('id', String(formData.get('id')));
  revalidatePath('/admin');
  revalidatePath('/members/dashboard');
  revalidatePath('/members/competitions');
}

async function updateMembershipAppClubUse(formData: FormData) {
  'use server';
  await requireAdminSession();
  const id = String(formData.get('id'));
  const receivedDate  = String(formData.get('received_date'))  || null;
  const approvedDate  = String(formData.get('approved_date'))  || null;
  const membershipNum = String(formData.get('membership_number')) || null;
  const signedBy      = String(formData.get('signed_by'))      || null;
  const status        = String(formData.get('status'))         || 'pending';
  await supabaseAdmin.from('membership_applications').update({
    received_date:     receivedDate  || null,
    approved_date:     approvedDate  || null,
    membership_number: membershipNum || null,
    signed_by:         signedBy      || null,
    status,
  }).eq('id', id);
  redirect('/admin#membership-applications');
}

export default async function Admin() {
  try { await requireAdminSession(); } catch { redirect('/login?redirect=/admin'); }

  const [{ data: apps }, { data: membershipApps }, { data: notices }, { data: sections }, { data: historySections }, { data: timelineEntries }, { data: tickerMessages }, { data: adminEvents }, { data: ledgerRows }, { data: stripePayments }, { data: currentGreen }] = await Promise.all([
    supabaseAdmin.from('applications').select('*').order('created_at', { ascending: false }).limit(20),
    supabaseAdmin.from('membership_applications').select('*').order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('notices').select('*').order('published_at', { ascending: false }),
    supabaseAdmin.from('how_to_play').select('*').order('sort_order'),
    supabaseAdmin.from('history_sections').select('*').order('sort_order'),
    supabaseAdmin.from('history_timeline').select('*').order('year'),
    supabaseAdmin.from('ticker_messages').select('id, message, sort_order, active').order('sort_order'),
    supabaseAdmin.from('events').select('id, title, event_date, description, category, is_tbc, bank_holiday, day_label, location, visibility').order('event_date', { nullsFirst: false }),
    supabaseAdmin.from('member_ledger').select('member_id, amount, type, club_members(full_name, membership_number)'),
    supabaseAdmin.from('member_transactions').select('id, member_email, date, description, amount, created_at').lt('amount', 0).order('date', { ascending: false }).limit(20),
    supabaseAdmin.from('green_status').select('status, message').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  // Compute per-member ledger balances (positive = owes, negative = in credit)
  const balanceMap = new Map<string, { full_name: string; membership_number: string | null; balance: number }>();
  for (const row of ledgerRows ?? []) {
    const cmRaw = row.club_members;
    const cm = Array.isArray(cmRaw) ? cmRaw[0] as { full_name: string; membership_number: string | null } | undefined : cmRaw as { full_name: string; membership_number: string | null } | null;
    if (!cm) continue;
    const signed = row.type === 'credit' ? -Number(row.amount) : Number(row.amount);
    const existing = balanceMap.get(row.member_id);
    if (existing) {
      existing.balance += signed;
    } else {
      balanceMap.set(row.member_id, { full_name: cm.full_name, membership_number: cm.membership_number ?? null, balance: signed });
    }
  }
  const ledgerBalances = Array.from(balanceMap.entries())
    .filter(([, v]) => Math.abs(v.balance) > 0.005)
    .map(([member_id, v]) => ({ member_id, ...v }));

  const inputStyle = { padding: '.7rem', border: '1px solid rgba(45,90,61,.2)', fontFamily: 'inherit', fontSize: '14px', width: '100%' };
  const labelStyle = { fontSize: '10px', fontWeight: 600 as const, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--gold)', display: 'block' as const, marginBottom: '6px' };

  return (
    <>
      <Navbar />
      <main style={{ padding: '3rem 0', background: 'var(--cream)' }}>
        <div className="section-inner" style={{ padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          <div>
            <span className="section-tag">Admin</span>
            <h1 className="section-h2">Club admin panel</h1>
          </div>

          {/* ── Quick links ── */}
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>Admin pages</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <AdminLinkCard
                href="/admin/club-members"
                title="Club Roster"
                description="Add members, update handicaps and membership numbers — single source of truth"
              />
              <AdminLinkCard
                href="/admin/members"
                title="Member Management"
                description="Invite members, resend invitations, remove login accounts"
              />
              <AdminLinkCard
                href="/admin/results"
                title="Results & Leaderboard"
                description="Enter match results and manage the Manser leaderboard"
              />
              <AdminLinkCard
                href="/admin/hero-images"
                title="Home Page Images"
                description="Replace hero, What's Happening, Come and Play, and Get Involved photos"
              />
              <AdminLinkCard
                href="/admin/gallery"
                title="Gallery"
                description="Upload and manage public gallery photos"
              />
              <AdminLinkCard
                href="/admin/photo-books"
                title="Photo Books"
                description="Manage years-in-photos flipbooks — upload, reorder and caption photos"
              />
              <AdminLinkCard
                href="/admin/accounts"
                title="Member Accounts"
                description="Post charges and payments to member account statements"
              />
              <AdminLinkCard
                href="/admin/book-a-game"
                title="Book a Match"
                description="Book a fixture on behalf of any member"
              />
              <AdminLinkCard
                href="/admin/newsletters"
                title="Newsletters"
                description="Upload new editions and manage the newsletter archive"
              />
              <AdminLinkCard
                href="/admin/committee"
                title="Committee Photos"
                description="Upload and manage photos for General Committee and Handicap Committee members"
              />
              <AdminLinkCard
                href="/admin/archive"
                title="Archive Season"
                description="Archive the current season, reset competition sheets, and edit past presidents and captains"
              />
            </div>
          </section>

          {/* ACCOUNTS OVERVIEW */}
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '1.5rem' }}>Accounts overview</h2>
            <AccountsOverview
              balances={ledgerBalances}
              recentPayments={stripePayments ?? []}
            />
          </section>

          {/* GREEN STATUS */}
          <section id="green">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '0.5rem' }}>Green condition banner</h2>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              The banner text is displayed exactly as written on the members dashboard. The status controls the colour of the dot.
            </p>
            <form action={updateGreen} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '560px', background: 'white', padding: '2rem', border: '1px solid rgba(45,90,61,.12)' }}>
              <div><label style={labelStyle}>Status (dot colour)</label>
                <select name="status" defaultValue={currentGreen?.status ?? 'open_good'} style={inputStyle}>
                  <option value="open_good">Open — Good conditions (green dot)</option>
                  <option value="open_fair">Open — Fair conditions (amber dot)</option>
                  <option value="closed">Closed (red dot)</option>
                </select>
              </div>
              <div><label style={labelStyle}>Banner text (shown on members dashboard)</label>
                <input name="message" required style={inputStyle} defaultValue={currentGreen?.message ?? ''} placeholder="e.g. Green condition: Good — firm and true" />
              </div>
              <button className="btn" style={{ alignSelf: 'flex-start' }}>Update banner</button>
            </form>
          </section>

          {/* SCROLLING BANNER */}
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '.5rem' }}>Scrolling banner</h2>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              Messages scroll across the bottom of the landing page. Click any message to edit it inline. Changes appear on the next page load.
            </p>
            {(!tickerMessages || tickerMessages.length === 0) && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px', marginBottom: '1rem' }}>
                No ticker messages found — run the <code>ticker_messages</code> migration in the Supabase dashboard first.
              </p>
            )}
            <TickerAdmin
              initialMessages={tickerMessages ?? []}
              addMessage={addTickerMessage}
              saveMessage={saveTickerMessage}
              deleteMessage={deleteTickerMessage}
              toggleMessage={toggleTickerMessage}
              moveMessage={moveTickerMessage}
            />
          </section>

          {/* COMMITTEE PHOTOS */}
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '.5rem' }}>Committee photos</h2>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.25rem' }}>
              Photos are now managed via the dedicated Committee Photos admin page.
            </p>
            <a href="/admin/committee" className="btn" style={{ display: 'inline-block' }}>Manage committee photos</a>
          </section>

          {/* SEASON EVENTS */}
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '.5rem' }}>Season events</h2>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              Manage the season calendar shown on the members dashboard and competition dates page.
            </p>
            <EventsAdmin
              initialEvents={adminEvents ?? []}
              addEvent={addEvent}
              updateEvent={updateEvent}
              deleteEvent={deleteEvent}
            />
          </section>

          {/* NOTICES */}
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '1.5rem' }}>News &amp; notices</h2>
            <form action={addNotice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '560px', background: 'white', padding: '2rem', border: '1px solid rgba(45,90,61,.12)', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--green-mid)' }}>Add new notice</h3>
              <div><label style={labelStyle}>Title</label><input name="title" required style={inputStyle} /></div>
              <div><label style={labelStyle}>Body</label><textarea name="body" required style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} /></div>
              <div><label style={labelStyle}>Author</label><input name="author" required style={inputStyle} placeholder="e.g. Club Secretary" /></div>
              <button className="btn" style={{ alignSelf: 'flex-start' }}>Publish notice</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {notices?.map((n) => (
                <div key={n.id} style={{ background: 'white', padding: '1.25rem', border: '1px solid rgba(45,90,61,.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--green-deep)', marginBottom: '2px' }}>{n.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{n.author} · {new Date(n.published_at).toLocaleDateString('en-GB')}</div>
                  </div>
                  <form action={deleteNotice}>
                    <input type="hidden" name="id" value={n.id} />
                    <button style={{ background: 'none', border: '1px solid rgba(180,0,0,.2)', color: '#a00', fontSize: '11px', padding: '4px 10px', cursor: 'pointer', letterSpacing: '.05em' }}>Delete</button>
                  </form>
                </div>
              ))}
            </div>
          </section>

          {/* HOW TO PLAY */}
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '1.5rem' }}>How to Play — edit sections</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sections?.map((s) => (
                <details key={s.id} style={{ background: 'white', border: '1px solid rgba(45,90,61,.12)' }}>
                  <summary style={{ padding: '1rem 1.25rem', cursor: 'pointer', fontWeight: 600, color: 'var(--green-deep)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{String(s.sort_order).padStart(2, '0')} — {s.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 400 }}>click to edit</span>
                  </summary>
                  <form action={updateHowToPlay} style={{ padding: '1.25rem', borderTop: '1px solid rgba(45,90,61,.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="hidden" name="id" value={s.id} />
                    <div><label style={labelStyle}>Title</label><input name="title" defaultValue={s.title} required style={inputStyle} /></div>
                    <div><label style={labelStyle}>Body text</label><textarea name="body" defaultValue={s.body} required style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }} /></div>
                    <button className="btn" style={{ alignSelf: 'flex-start' }}>Save section</button>
                  </form>
                </details>
              ))}
            </div>
          </section>

          {/* HISTORY */}
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '1.5rem' }}>Club History — edit sections</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {historySections?.map((s) => (
                <details key={s.id} style={{ background: 'white', border: '1px solid rgba(45,90,61,.12)' }}>
                  <summary style={{ padding: '1rem 1.25rem', cursor: 'pointer', fontWeight: 600, color: 'var(--green-deep)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{String(s.sort_order).padStart(2, '0')} — {s.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 400 }}>click to edit</span>
                  </summary>
                  <form action={updateHistory} style={{ padding: '1.25rem', borderTop: '1px solid rgba(45,90,61,.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="hidden" name="id" value={s.id} />
                    <div><label style={labelStyle}>Title</label><input name="title" defaultValue={s.title} required style={inputStyle} /></div>
                    <div><label style={labelStyle}>Body text</label><textarea name="body" defaultValue={s.body} required style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }} /></div>
                    <button className="btn" style={{ alignSelf: 'flex-start' }}>Save section</button>
                  </form>
                </details>
              ))}
            </div>
          </section>

          {/* HISTORY TIMELINE */}
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '.5rem' }}>History Timeline — edit milestones</h2>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              Years cannot be changed. Edit title and description, then save each row individually.
            </p>
            {(!timelineEntries || timelineEntries.length === 0) && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px' }}>
                No timeline entries found — run the <code>20260521_history_timeline.sql</code> migration in the Supabase dashboard first.
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {timelineEntries?.map((entry) => (
                <details key={entry.id} style={{ background: 'white', border: '1px solid rgba(45,90,61,.12)' }}>
                  <summary style={{ padding: '1rem 1.25rem', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <span style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)', fontWeight: 500, marginRight: '.75rem' }}>{entry.year}</span>
                      <span style={{ fontWeight: 600, color: 'var(--green-deep)' }}>{entry.title}</span>
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 400, flexShrink: 0 }}>click to edit</span>
                  </summary>
                  <form action={updateTimelineEntry} style={{ padding: '1.25rem', borderTop: '1px solid rgba(45,90,61,.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="hidden" name="id" value={entry.id} />
                    <div>
                      <label style={labelStyle}>Year (read-only)</label>
                      <input value={entry.year} readOnly style={{ ...inputStyle, background: 'rgba(45,90,61,.04)', color: 'var(--text-muted)', cursor: 'default' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Title</label>
                      <input name="title" defaultValue={entry.title} required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Description</label>
                      <textarea name="description" defaultValue={entry.description} required style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} />
                    </div>
                    <button className="btn" style={{ alignSelf: 'flex-start' }}>Save milestone</button>
                  </form>
                </details>
              ))}
            </div>
          </section>

          {/* MEMBERSHIP APPLICATIONS */}
          <section id="membership-applications">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '1.5rem' }}>Membership applications</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(!membershipApps || membershipApps.length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px' }}>No membership applications yet.</p>
              )}
              {membershipApps?.map((a) => (
                <details key={a.id} style={{ background: 'white', border: '1px solid rgba(45,90,61,.12)' }}>
                  <summary style={{ padding: '1rem 1.25rem', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--green-deep)' }}>{a.full_name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {a.email}
                        {a.phone ? ` · ${a.phone}` : ''}
                        {' · '}
                        <span style={{
                          color: a.status === 'approved' ? '#2d7a3a' : a.status === 'rejected' ? '#c0392b' : 'var(--gold)',
                          fontWeight: 600,
                        }}>
                          {a.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Proposer: {a.proposer_name || '—'} · Seconder: {a.seconder_name || '—'}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <span style={{ fontSize: '11px', color: 'var(--gold)', display: 'block', textAlign: 'right', marginTop: '2px' }}>click to view</span>
                    </div>
                  </summary>
                  <div style={{ borderTop: '1px solid rgba(45,90,61,.08)', padding: '1.25rem' }}>
                    {/* Applicant details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem 1.5rem', fontSize: '13px', color: 'var(--text-mid)', marginBottom: '1.5rem' }}>
                      {[
                        ['Date of Birth', a.dob],
                        ['Address', a.address],
                        ['Rejoining', a.rejoining === 'yes' ? `Yes (last: ${a.last_membership_date || '—'})` : 'No'],
                        ['Committee Members Met', a.committee_members],
                        ['Visit Date', a.visit_date],
                      ].map(([label, value]) => value ? (
                        <div key={String(label)}>
                          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
                          <div style={{ marginTop: '2px', whiteSpace: 'pre-wrap' }}>{String(value)}</div>
                        </div>
                      ) : null)}
                    </div>

                    {/* For Club Use Only */}
                    <div style={{ background: 'rgba(45,90,61,0.03)', border: '1px solid rgba(45,90,61,.12)', borderTop: '3px solid rgba(45,90,61,.2)', padding: '1.25rem' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(45,90,61,0.5)', marginBottom: '1rem' }}>For Club Use Only</div>
                      <form action={updateMembershipAppClubUse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="hidden" name="id" value={a.id} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={labelStyle}>Received Date</label>
                            <input name="received_date" type="date" defaultValue={a.received_date ?? ''} style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Approved Date</label>
                            <input name="approved_date" type="date" defaultValue={a.approved_date ?? ''} style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Membership Number</label>
                            <input name="membership_number" type="text" defaultValue={a.membership_number ?? ''} style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Signed By</label>
                            <input name="signed_by" type="text" defaultValue={a.signed_by ?? ''} style={inputStyle} />
                          </div>
                        </div>
                        <div>
                          <label style={labelStyle}>Status</label>
                          <select name="status" defaultValue={a.status ?? 'pending'} style={inputStyle}>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <button className="btn" style={{ alignSelf: 'flex-start' }}>Save club use details</button>
                      </form>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* ENQUIRIES */}
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '1.5rem' }}>Recent enquiries</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {apps?.length === 0 && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px' }}>No enquiries yet.</p>}
              {apps?.map((a) => (
                <div key={a.id} style={{ background: 'white', padding: '1.25rem', border: '1px solid rgba(45,90,61,.1)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--green-deep)' }}>{a.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{a.email} · {a.membership_type} · <span style={{ color: a.status === 'new' ? 'var(--green-mid)' : 'var(--text-muted)' }}>{a.status}</span></div>
                  {a.message && <div style={{ fontSize: '13px', color: 'var(--text-mid)', marginTop: '8px', fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic' }}>{a.message}</div>}
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
