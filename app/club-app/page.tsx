import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  CalendarDays,
  Trophy,
  Megaphone,
  CircleDot,
  Images,
  Users,
  Home,
  Menu,
  Landmark,
  Newspaper,
  UserPlus,
  UserRound,
} from 'lucide-react';
import { BbcCrest } from '@/components/BbcCrest';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getHeroImages } from '@/lib/images';
import { SESSION_COOKIE, verifyMemberSession } from '@/lib/memberSession';

export const metadata = {
  title: 'Club App — Barnes Bowling Club',
  description: 'Barnes Bowling Club mobile app for competitions, calendar, notices, match booking and member services.',
};

function dateParts(value?: string | null) {
  if (!value) return { day: '', month: '', full: '' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: '', month: '', full: '' };
  return {
    day: new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date).toUpperCase(),
    full: new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(date),
  };
}

export default async function ClubAppPage() {
  const supabase = await createClient();
  const heroImages = await getHeroImages();

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  const session = sessionCookie ? await verifyMemberSession(sessionCookie.value) : null;

  const [{ data: events }, { data: galleryRows }] = await Promise.all([
    supabase
      .from('events')
      .select('id,title,event_date')
      .eq('visibility', 'public')
      .gte('event_date', new Date().toISOString())
      .order('event_date')
      .limit(3),
    supabaseAdmin
      .from('site_images')
      .select('public_url,sort_order')
      .eq('context', 'gallery')
      .order('sort_order', { ascending: true })
      .limit(3),
  ]);

  let firstName: string | null = null;
  if (session?.email) {
    const [{ data: profile }, { data: member }] = await Promise.all([
      supabaseAdmin
        .from('member_profiles')
        .select('first_name')
        .eq('member_email', session.email)
        .maybeSingle(),
      supabaseAdmin
        .from('club_members')
        .select('full_name')
        .eq('email', session.email)
        .maybeSingle(),
    ]);
    firstName = profile?.first_name ?? member?.full_name?.split(' ')[0] ?? null;
  }

  const gallery = galleryRows ?? [];

  // Phone app images use their own admin slots. Existing site images remain as
  // fallbacks until a phone-specific image has been uploaded for each slot.
  const hero = heroImages['club-app-hero']
    ?? gallery[0]?.public_url
    ?? heroImages['whats-happening-3']
    ?? '/images/gallery2.JPG';

  const cardImages = [
    heroImages['club-app-card-1'] ?? heroImages['whats-happening-1'] ?? '/images/gallery1.JPG',
    heroImages['club-app-card-2'] ?? gallery[1]?.public_url ?? heroImages['whats-happening-2'] ?? '/images/gallery5.JPG',
    heroImages['club-app-card-3'] ?? gallery[2]?.public_url ?? heroImages['whats-happening-3'] ?? '/images/gallery2.JPG',
  ];

  const shortcuts = [
    { label: 'Competitions', href: '/members/competitions', icon: Trophy },
    { label: 'Calendar', href: '/members/calendar', icon: CalendarDays },
    { label: 'Club Notices', href: '/notices', icon: Megaphone },
    { label: 'Book a Match', href: '/members/book-a-game', icon: CircleDot },
    { label: 'Gallery', href: '/gallery', icon: Images },
    { label: 'Members Area', href: '/members/dashboard', icon: Users },
  ];

  const fallbackEvents = [
    { title: 'Competition fixtures' },
    { title: 'Season calendar' },
    { title: 'Club social events' },
  ];

  return (
    <main className="app-stage">
      <style>{`
        :root {
          --app-green:#123f2a;
          --app-green-2:#1c583a;
          --app-cream:#f7f4ee;
          --app-gold:#c9a84c;
          --app-ink:#18231c;
          --app-muted:#667068;
          --app-line:#e7e1d7;
        }
        * { box-sizing:border-box; }
        html, body { margin:0; background:#eae7e0; }
        .app-stage { min-height:100vh; padding:0 0 82px; color:var(--app-ink); font-family:'DM Sans','Helvetica Neue',Arial,sans-serif; }
        .app-phone { width:min(100%,560px); min-height:100vh; margin:0 auto; background:var(--app-cream); box-shadow:0 0 34px rgba(20,35,25,.12); overflow:hidden; }

        .app-header { height:82px; background:var(--app-green); color:white; padding:max(12px,env(safe-area-inset-top)) 18px 12px; display:flex; align-items:center; gap:12px; }
        .brand-copy { flex:1; min-width:0; }
        .brand-title { font-family:'Playfair Display',Georgia,serif; font-size:21px; line-height:1.05; font-weight:600; letter-spacing:.005em; }
        .brand-sub { margin-top:5px; color:rgba(255,255,255,.67); font-size:10px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; }
        .profile-button { width:44px; height:44px; border:1px solid rgba(255,255,255,.68); border-radius:50%; color:white; display:flex; align-items:center; justify-content:center; text-decoration:none; flex:none; }

        .hero { position:relative; height:224px; background-size:cover; background-position:center 43%; }
        .hero:after { content:''; position:absolute; inset:0; background:linear-gradient(to top,rgba(10,24,16,.72) 0%,rgba(10,24,16,.08) 70%); }
        .hero-copy { position:absolute; left:22px; right:22px; bottom:27px; z-index:1; color:white; }
        .hero-title { margin:0; max-width:370px; font-family:'Playfair Display',Georgia,serif; font-size:25px; line-height:1.06; font-weight:500; text-shadow:0 2px 12px rgba(0,0,0,.22); }
        .hero-sub { margin:7px 0 0; font-family:'Libre Baskerville',Georgia,serif; font-size:12px; color:rgba(255,255,255,.92); }
        .hero-dots { position:absolute; z-index:2; left:50%; bottom:10px; transform:translateX(-50%); display:flex; gap:7px; }
        .hero-dot { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,.55); }
        .hero-dot.active { background:#e2bd61; }

        .app-content { padding:12px 14px 28px; }
        .quick-grid { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:7px; }
        .quick-card { min-height:88px; background:#fff; border:1px solid var(--app-line); border-radius:12px; color:var(--app-green); text-decoration:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:9px 5px; text-align:center; box-shadow:0 3px 12px rgba(26,48,34,.055); }
        .quick-card svg { width:25px; height:25px; stroke-width:1.55; }
        .quick-card span { color:#222a25; font-size:10px; font-weight:650; line-height:1.12; }

        .section-head { margin:22px 3px 11px; display:flex; align-items:end; justify-content:space-between; gap:10px; }
        .section-head h2 { margin:0; color:var(--app-green); font-family:'Playfair Display',Georgia,serif; font-size:24px; line-height:1; font-weight:600; }
        .section-head a { color:#b2872c; text-decoration:none; font-family:'Libre Baskerville',Georgia,serif; font-size:11px; white-space:nowrap; }

        .happening-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
        .event-card { min-width:0; overflow:hidden; background:#fff; border:1px solid var(--app-line); border-radius:10px; color:inherit; text-decoration:none; box-shadow:0 3px 10px rgba(26,48,34,.055); }
        .event-photo { position:relative; height:104px; background-size:cover; background-position:center; }
        .date-chip { position:absolute; left:8px; bottom:0; min-width:42px; padding:5px 5px 4px; background:var(--app-green); color:#fff; text-align:center; }
        .date-chip strong { display:block; font-size:14px; line-height:1; }
        .date-chip span { display:block; margin-top:2px; font-size:8px; letter-spacing:.08em; }
        .event-body { min-height:86px; padding:9px 10px 11px; }
        .event-title { color:#202721; font-family:'Playfair Display',Georgia,serif; font-size:14px; line-height:1.16; font-weight:600; }
        .event-meta { margin-top:6px; color:var(--app-muted); font-size:9px; line-height:1.35; }
        .event-more { margin-top:7px; color:var(--app-green-2); font-size:9px; font-weight:650; text-decoration:underline; text-underline-offset:2px; }

        .feature-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-top:11px; }
        .feature-card { min-height:150px; padding:14px; border-radius:10px; border:1px solid var(--app-line); text-decoration:none; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden; }
        .feature-card.dark { background:linear-gradient(145deg,#0d3c27,#075531); color:#fff; border-color:transparent; }
        .feature-card.light { position:relative; background:#fbf7ef; color:#222a25; }
        .feature-card.light:after { content:'✤'; position:absolute; right:-8px; bottom:-22px; font-size:70px; color:rgba(24,63,42,.08); }
        .feature-icon { color:var(--app-gold); }
        .feature-card h3 { margin:8px 0 6px; font-family:'Playfair Display',Georgia,serif; font-size:18px; font-weight:500; }
        .feature-card p { margin:0; font-family:'Libre Baskerville',Georgia,serif; font-size:10px; line-height:1.55; opacity:.84; }
        .feature-more { position:relative; z-index:1; margin-top:11px; color:var(--app-gold); font-size:9px; font-weight:700; }
        .feature-card.light .feature-more { color:var(--app-green-2); }

        .bottom-nav { position:fixed; z-index:20; left:50%; bottom:0; transform:translateX(-50%); width:min(100%,560px); height:calc(66px + env(safe-area-inset-bottom)); padding-bottom:env(safe-area-inset-bottom); background:rgba(255,255,255,.97); border-top:1px solid var(--app-line); backdrop-filter:blur(14px); }
        .bottom-grid { height:66px; display:grid; grid-template-columns:repeat(5,1fr); }
        .bottom-link { color:#69716b; text-decoration:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; font-size:9px; }
        .bottom-link.active { color:var(--app-green); font-weight:700; }

        @media (min-width:700px) {
          .app-stage { padding-top:18px; }
          .app-phone { border-radius:22px 22px 0 0; }
        }
        @media (max-width:470px) {
          .app-header { height:76px; padding-left:14px; padding-right:14px; }
          .app-header svg:first-child { width:48px; height:48px; }
          .brand-title { font-size:19px; }
          .hero { height:205px; }
          .hero-title { font-size:23px; }
          .app-content { padding-left:10px; padding-right:10px; }
          .quick-grid { grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; }
          .quick-card { min-height:82px; }
          .quick-card span { font-size:10.5px; }
          .happening-grid { display:flex; overflow-x:auto; gap:8px; scroll-snap-type:x mandatory; padding-bottom:2px; scrollbar-width:none; }
          .happening-grid::-webkit-scrollbar { display:none; }
          .event-card { flex:0 0 72%; scroll-snap-align:start; }
          .event-photo { height:132px; }
          .event-title { font-size:16px; }
          .event-meta,.event-more { font-size:10px; }
          .feature-grid { grid-template-columns:1fr; }
          .feature-card { min-height:128px; }
          .feature-card h3 { font-size:20px; }
          .feature-card p { font-size:11px; }
        }
      `}</style>

      <div className="app-phone">
        <header className="app-header">
          <BbcCrest size={54} light />
          <div className="brand-copy">
            <div className="brand-title">Barnes Bowling Club</div>
            <div className="brand-sub">Members App</div>
          </div>
          <Link href="/members/dashboard" className="profile-button" aria-label="Open members area">
            <UserRound size={23} strokeWidth={1.65} />
          </Link>
        </header>

        <section className="hero" style={{ backgroundImage: `url('${hero}')` }}>
          <div className="hero-copy">
            <h1 className="hero-title">
              {firstName ? <>Welcome back, {firstName}</> : <>Welcome to<br />Barnes Bowling Club</>}
            </h1>
            <p className="hero-sub">A historic club with a warm welcome.</p>
          </div>
          <div className="hero-dots" aria-hidden="true">
            <span className="hero-dot active" />
            <span className="hero-dot" />
            <span className="hero-dot" />
            <span className="hero-dot" />
          </div>
        </section>

        <div className="app-content">
          <nav className="quick-grid" aria-label="Club app shortcuts">
            {shortcuts.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} className="quick-card">
                <Icon />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="section-head">
            <h2>What’s Happening at Barnes</h2>
            <Link href="/members/calendar">View all</Link>
          </div>

          <section className="happening-grid" aria-label="Upcoming club activity">
            {[0, 1, 2].map((index) => {
              const event = events?.[index];
              const fallback = fallbackEvents[index];
              const parts = dateParts(event?.event_date);
              const href = index === 0 ? '/members/competitions' : index === 1 ? '/members/calendar' : '/notices';
              return (
                <Link href={href} className="event-card" key={event?.id ?? fallback.title}>
                  <div className="event-photo" style={{ backgroundImage: `url('${cardImages[index]}')` }}>
                    {event && (
                      <div className="date-chip">
                        <strong>{parts.day}</strong>
                        <span>{parts.month}</span>
                      </div>
                    )}
                  </div>
                  <div className="event-body">
                    <div className="event-title">{event?.title ?? fallback.title}</div>
                    <div className="event-meta">{event ? parts.full : 'See what is coming up at the club.'}</div>
                    <div className="event-more">View details ›</div>
                  </div>
                </Link>
              );
            })}
          </section>

          <section className="feature-grid" aria-label="Explore Barnes Bowling Club">
            <Link href="/history" className="feature-card dark">
              <div>
                <Landmark className="feature-icon" size={24} strokeWidth={1.4} />
                <h3>Our History</h3>
                <p>Join a living piece of London history.</p>
              </div>
              <div className="feature-more">Discover more ›</div>
            </Link>

            <Link href="/news" className="feature-card light">
              <div>
                <Newspaper className="feature-icon" size={24} strokeWidth={1.4} />
                <h3>Club News</h3>
                <p>The latest news, notices and updates.</p>
              </div>
              <div className="feature-more">Read more ›</div>
            </Link>

            <Link href="/membership" className="feature-card dark">
              <div>
                <UserPlus className="feature-icon" size={24} strokeWidth={1.4} />
                <h3>Membership</h3>
                <p>Become part of our friendly club community.</p>
              </div>
              <div className="feature-more">Find out more ›</div>
            </Link>
          </section>
        </div>
      </div>

      <nav className="bottom-nav" aria-label="App navigation">
        <div className="bottom-grid">
          <Link href="/club-app" className="bottom-link active"><Home size={20} /><span>Home</span></Link>
          <Link href="/members/calendar" className="bottom-link"><CalendarDays size={20} /><span>Calendar</span></Link>
          <Link href="/members/competitions" className="bottom-link"><Trophy size={20} /><span>Competitions</span></Link>
          <Link href="/gallery" className="bottom-link"><Images size={20} /><span>Gallery</span></Link>
          <Link href="/members/dashboard" className="bottom-link"><Menu size={20} /><span>More</span></Link>
        </div>
      </nav>
    </main>
  );
}
