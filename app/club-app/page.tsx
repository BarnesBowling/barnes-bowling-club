import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  CalendarDays,
  Trophy,
  Bell,
  CircleDot,
  CreditCard,
  Users,
  Home,
  Menu,
  Newspaper,
  ChevronRight,
  UserRound,
  BookOpenText,
} from 'lucide-react';
import { BbcCrest } from '@/components/BbcCrest';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getHeroImages } from '@/lib/images';
import { SESSION_COOKIE, verifyMemberSession } from '@/lib/memberSession';

export const metadata = {
  title: 'Club App — Barnes Bowling Club',
  description: 'Barnes Bowling Club mobile dashboard for fixtures, competitions, notices and member services.',
};

function prettyDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export default async function ClubAppPage() {
  const supabase = await createClient();
  const heroImages = await getHeroImages();

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  const session = sessionCookie ? await verifyMemberSession(sessionCookie.value) : null;

  const [{ data: events }, { data: green }, { data: notices }] = await Promise.all([
    supabase
      .from('events')
      .select('id,title,event_date')
      .gte('event_date', new Date().toISOString())
      .order('event_date')
      .limit(2),
    supabase
      .from('green_status')
      .select('status,message,updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from('notices')
      .select('id,title,body,published_at')
      .order('published_at', { ascending: false })
      .limit(1),
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

  const hero = heroImages['hero-carousel'] ?? '/images/Barnes_Bowling_Club_Sep_1_SV_2.JPG';
  const nextEvent = events?.[0] ?? null;
  const secondEvent = events?.[1] ?? null;
  const notice = notices?.[0] ?? null;

  const status = green?.status ?? 'open_good';
  const greenOpen = status === 'open_good' || status === 'open_fair';
  const greenLabel = status === 'open_good'
    ? 'Green Open'
    : status === 'open_fair'
      ? 'Green Open — Fair'
      : 'Green Closed';

  const shortcuts = [
    { label: 'Book a Match', href: '/login?redirect=/members/book-a-game', icon: CircleDot },
    { label: 'Fixtures', href: '/login?redirect=/members/calendar', icon: CalendarDays },
    { label: 'Competitions', href: '/login?redirect=/members/competitions', icon: Trophy },
    { label: 'Results', href: '/login?redirect=/members/results', icon: BookOpenText },
    { label: 'My Account', href: '/login?redirect=/members/account', icon: CreditCard },
    { label: 'Members', href: '/login?redirect=/members/dashboard', icon: Users },
  ];

  return (
    <main className="app-stage">
      <style>{`
        :root {
          --bbc-green:#173c29;
          --bbc-green-2:#24533a;
          --bbc-cream:#f5f0e8;
          --bbc-gold:#c5a24b;
          --bbc-ink:#1d2b22;
          --bbc-muted:#6f756f;
          --bbc-line:#e6dfd4;
        }
        body { margin:0; background:#e9e5dd; }
        * { box-sizing:border-box; }
        .app-stage { min-height:100vh; padding:0 0 88px; color:var(--bbc-ink); font-family:'DM Sans','Helvetica Neue',Arial,sans-serif; }
        .app-phone { width:min(100%,560px); margin:0 auto; min-height:100vh; background:#fbf8f2; box-shadow:0 0 40px rgba(20,35,25,.10); }

        .app-header { background:var(--bbc-green); color:white; padding:max(14px,env(safe-area-inset-top)) 18px 15px; display:flex; align-items:center; gap:12px; }
        .brand-copy { flex:1; min-width:0; }
        .brand-title { font-family:'Playfair Display',Georgia,serif; font-size:19px; line-height:1.05; letter-spacing:.01em; }
        .brand-sub { margin-top:3px; color:rgba(255,255,255,.66); font-size:10px; letter-spacing:.14em; text-transform:uppercase; }
        .profile-button { width:42px; height:42px; border:1px solid rgba(255,255,255,.55); border-radius:50%; color:white; display:flex; align-items:center; justify-content:center; text-decoration:none; }

        .hero { position:relative; height:194px; background-size:cover; background-position:center 55%; overflow:hidden; }
        .hero:after { content:''; position:absolute; inset:0; background:linear-gradient(to top,rgba(12,27,18,.80) 0%,rgba(12,27,18,.18) 68%,rgba(12,27,18,.02) 100%); }
        .hero-copy { position:absolute; left:20px; right:20px; bottom:18px; z-index:1; color:white; }
        .hero-kicker { font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.72); margin-bottom:4px; }
        .hero-title { margin:0; font-family:'Playfair Display',Georgia,serif; font-size:30px; line-height:1.05; font-weight:500; }
        .hero-title em { color:#e2c56f; font-style:italic; }

        .content { padding:16px 14px 30px; }
        .status-card { display:flex; align-items:center; gap:12px; background:white; border:1px solid var(--bbc-line); border-radius:15px; padding:13px 14px; box-shadow:0 4px 16px rgba(29,43,34,.05); }
        .status-dot { width:11px; height:11px; border-radius:50%; flex:none; box-shadow:0 0 0 5px rgba(36,83,58,.08); }
        .status-dot.open { background:#4f8a60; }
        .status-dot.closed { background:#9c3b3f; box-shadow:0 0 0 5px rgba(156,59,63,.08); }
        .status-copy { flex:1; min-width:0; }
        .status-title { font-family:'Playfair Display',Georgia,serif; font-size:18px; color:var(--bbc-green); }
        .status-text { margin-top:2px; font-size:11px; color:var(--bbc-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .status-link { color:var(--bbc-gold); text-decoration:none; }

        .section-label { margin:22px 2px 10px; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#7a715f; }
        .quick-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
        .quick-card { min-height:88px; background:white; border:1px solid var(--bbc-line); border-radius:15px; padding:14px; color:var(--bbc-green); text-decoration:none; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 3px 12px rgba(29,43,34,.045); }
        .quick-icon { color:var(--bbc-gold); }
        .quick-label { display:flex; align-items:center; justify-content:space-between; gap:6px; font-family:'Playfair Display',Georgia,serif; font-size:17px; }

        .feature-card { display:block; background:white; border:1px solid var(--bbc-line); border-radius:16px; overflow:hidden; color:inherit; text-decoration:none; box-shadow:0 4px 16px rgba(29,43,34,.05); }
        .fixture-card { display:grid; grid-template-columns:112px 1fr; min-height:120px; }
        .fixture-photo { min-height:120px; background-size:cover; background-position:center; }
        .fixture-copy { padding:14px 15px; }
        .eyebrow { color:var(--bbc-gold); font-size:10px; font-weight:700; letter-spacing:.11em; text-transform:uppercase; }
        .feature-title { margin:5px 0 4px; color:var(--bbc-green); font-family:'Playfair Display',Georgia,serif; font-size:20px; line-height:1.15; }
        .feature-meta { color:var(--bbc-muted); font-size:12px; line-height:1.45; }
        .feature-link { margin-top:9px; display:flex; align-items:center; gap:3px; color:var(--bbc-green-2); font-size:11px; font-weight:700; }

        .two-up { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .mini-card { min-height:150px; padding:15px; background:white; border:1px solid var(--bbc-line); border-radius:15px; text-decoration:none; color:inherit; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 3px 12px rgba(29,43,34,.045); }
        .mini-card.dark { background:var(--bbc-green); color:white; border-color:var(--bbc-green); }
        .mini-card.dark .mini-title { color:white; }
        .mini-card.dark .mini-text { color:rgba(255,255,255,.70); }
        .mini-card.dark .mini-link { color:#e3c56e; }
        .mini-icon { color:var(--bbc-gold); }
        .mini-title { margin:10px 0 4px; font-family:'Playfair Display',Georgia,serif; font-size:19px; color:var(--bbc-green); }
        .mini-text { font-size:11px; line-height:1.45; color:var(--bbc-muted); }
        .mini-link { margin-top:10px; color:var(--bbc-green-2); font-size:10px; font-weight:700; display:flex; align-items:center; gap:3px; }

        .news-card { padding:15px; }
        .news-head { display:flex; align-items:center; gap:9px; }
        .news-icon { width:36px; height:36px; border-radius:50%; background:#f4ead0; color:#9e7d28; display:flex; align-items:center; justify-content:center; flex:none; }
        .news-body { margin-top:10px; color:#555e58; font-family:'Libre Baskerville',Georgia,serif; font-size:12px; line-height:1.6; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }

        .secondary-event { margin-top:10px; }

        .bottom-nav { position:fixed; left:50%; transform:translateX(-50%); bottom:0; z-index:20; width:min(100%,560px); height:calc(68px + env(safe-area-inset-bottom)); padding-bottom:env(safe-area-inset-bottom); background:rgba(255,255,255,.97); border-top:1px solid var(--bbc-line); backdrop-filter:blur(14px); }
        .bottom-grid { height:68px; display:grid; grid-template-columns:repeat(5,1fr); }
        .bottom-link { color:#69716b; text-decoration:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; font-size:9px; }
        .bottom-link.active { color:var(--bbc-green); font-weight:700; }

        @media (min-width:700px) {
          .app-stage { padding-top:22px; }
          .app-phone { border-radius:24px 24px 0 0; overflow:hidden; }
        }
        @media (max-width:370px) {
          .fixture-card { grid-template-columns:96px 1fr; }
          .feature-title { font-size:18px; }
          .quick-label { font-size:16px; }
        }
      `}</style>

      <div className="app-phone">
        <header className="app-header">
          <BbcCrest size={54} light />
          <div className="brand-copy">
            <div className="brand-title">Barnes Bowling Club</div>
            <div className="brand-sub">Members App</div>
          </div>
          <Link href={session ? '/members/dashboard' : '/login'} className="profile-button" aria-label="Members area">
            <UserRound size={21} strokeWidth={1.7} />
          </Link>
        </header>

        <section className="hero" style={{ backgroundImage: `url('${hero}')` }}>
          <div className="hero-copy">
            <div className="hero-kicker">Welcome</div>
            <h1 className="hero-title">
              {firstName ? <>Good afternoon, <em>{firstName}</em></> : <>Welcome to <em>Barnes</em></>}
            </h1>
          </div>
        </section>

        <div className="content">
          <div className="status-card">
            <div className={`status-dot ${greenOpen ? 'open' : 'closed'}`} />
            <div className="status-copy">
              <div className="status-title">{greenLabel}</div>
              <div className="status-text">{green?.message ?? 'Check conditions before play.'}</div>
            </div>
            <Link href="/home" className="status-link" aria-label="View green information"><ChevronRight size={19} /></Link>
          </div>

          <div className="section-label">Quick access</div>
          <nav className="quick-grid" aria-label="Quick access">
            {shortcuts.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} className="quick-card">
                <Icon className="quick-icon" size={24} strokeWidth={1.5} />
                <div className="quick-label"><span>{label}</span><ChevronRight size={15} /></div>
              </Link>
            ))}
          </nav>

          <div className="section-label">Today at the club</div>
          <Link href="/login?redirect=/members/calendar" className="feature-card fixture-card">
            <div className="fixture-photo" style={{ backgroundImage: `url('${heroImages['whats-happening-2'] ?? '/images/gallery5.JPG'}')` }} />
            <div className="fixture-copy">
              <div className="eyebrow">Next fixture / event</div>
              <div className="feature-title">{nextEvent?.title ?? 'Season calendar'}</div>
              <div className="feature-meta">{nextEvent ? prettyDate(nextEvent.event_date) : 'See everything coming up at the club.'}</div>
              <div className="feature-link">View calendar <ChevronRight size={13} /></div>
            </div>
          </Link>

          <div className="section-label">Club updates</div>
          <div className="two-up">
            <Link href="/login?redirect=/members/results" className="mini-card dark">
              <div>
                <Trophy className="mini-icon" size={25} strokeWidth={1.5} />
                <div className="mini-title">Latest Results</div>
                <div className="mini-text">See match results, leaderboard and competition progress.</div>
              </div>
              <div className="mini-link">View results <ChevronRight size={12} /></div>
            </Link>

            <Link href="/login?redirect=/members/account" className="mini-card">
              <div>
                <CreditCard className="mini-icon" size={25} strokeWidth={1.5} />
                <div className="mini-title">My Account</div>
                <div className="mini-text">Payments, balances and member account details.</div>
              </div>
              <div className="mini-link">Open account <ChevronRight size={12} /></div>
            </Link>
          </div>

          <div className="section-label">Club news</div>
          <Link href="/notices" className="feature-card news-card">
            <div className="news-head">
              <div className="news-icon"><Bell size={18} /></div>
              <div>
                <div className="eyebrow">Latest notice</div>
                <div className="feature-title" style={{ marginTop: 2 }}>{notice?.title ?? 'Club notices'}</div>
              </div>
            </div>
            <div className="news-body">
              {notice?.body ?? 'News, notices and updates from Barnes Bowling Club.'}
            </div>
            <div className="feature-link">Read club news <ChevronRight size={13} /></div>
          </Link>

          <div className="section-label">Competition draws</div>
          <Link href="/login?redirect=/members/competition-sheets" className="feature-card news-card">
            <div className="news-head">
              <div className="news-icon"><Trophy size={18} /></div>
              <div>
                <div className="eyebrow">2026 season</div>
                <div className="feature-title" style={{ marginTop: 2 }}>Draws & competition sheets</div>
              </div>
            </div>
            <div className="feature-link">Open competition sheets <ChevronRight size={13} /></div>
          </Link>

          {secondEvent && (
            <div className="secondary-event">
              <Link href="/login?redirect=/members/calendar" className="feature-card news-card">
                <div className="eyebrow">Also coming up</div>
                <div className="feature-title">{secondEvent.title}</div>
                <div className="feature-meta">{prettyDate(secondEvent.event_date)}</div>
              </Link>
            </div>
          )}
        </div>
      </div>

      <nav className="bottom-nav" aria-label="App navigation">
        <div className="bottom-grid">
          <Link href="/club-app" className="bottom-link active"><Home size={21} /><span>Home</span></Link>
          <Link href="/login?redirect=/members/calendar" className="bottom-link"><CalendarDays size={21} /><span>Fixtures</span></Link>
          <Link href="/login?redirect=/members/competitions" className="bottom-link"><Trophy size={21} /><span>Competitions</span></Link>
          <Link href="/login?redirect=/members/dashboard" className="bottom-link"><Users size={21} /><span>Members</span></Link>
          <Link href="/home" className="bottom-link"><Menu size={21} /><span>More</span></Link>
        </div>
      </nav>
    </main>
  );
}
