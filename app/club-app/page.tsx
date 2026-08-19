import Link from 'next/link';
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
} from 'lucide-react';
import { BbcCrest } from '@/components/BbcCrest';
import { createClient } from '@/lib/supabase/server';
import { getHeroImages } from '@/lib/images';

export const metadata = {
  title: 'Club App — Barnes Bowling Club',
  description: 'Quick access to Barnes Bowling Club fixtures, competitions, notices, gallery and members area.',
};

function dateParts(value?: string | null) {
  if (!value) return { day: '', month: '' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: '', month: '' };
  return {
    day: new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date).toUpperCase(),
  };
}

export default async function ClubAppPage() {
  const supabase = await createClient();
  const heroImages = await getHeroImages();
  const { data: events } = await supabase
    .from('events')
    .select('id,title,event_date')
    .eq('visibility', 'public')
    .gte('event_date', new Date().toISOString())
    .order('event_date')
    .limit(3);

  const hero = heroImages['hero-carousel'] ?? '/images/Barnes_Bowling_Club_Sep_1_SV_2.JPG';
  const cardImages = [
    heroImages['whats-happening-1'] ?? '/images/gallery1.JPG',
    heroImages['whats-happening-2'] ?? '/images/gallery5.JPG',
    heroImages['whats-happening-3'] ?? '/images/gallery2.JPG',
  ];

  const quickLinks = [
    { label: 'Competitions', href: '/login?redirect=/members/results', icon: Trophy },
    { label: 'Calendar', href: '/login?redirect=/members/calendar', icon: CalendarDays },
    { label: 'Club Notices', href: '/notices', icon: Megaphone },
    { label: 'Book a Match', href: '/login?redirect=/members/book-a-game', icon: CircleDot },
    { label: 'Gallery', href: '/gallery', icon: Images },
    { label: 'Members Area', href: '/login', icon: Users },
  ];

  const fallbackCards = [
    { title: 'Competition fixtures', href: '/login?redirect=/members/results' },
    { title: 'Season calendar', href: '/login?redirect=/members/calendar' },
    { title: 'Club notices', href: '/notices' },
  ];

  return (
    <main className="club-app-shell">
      <style>{`
        :root { --app-green:#1b3b2a; --app-green-2:#245039; --app-cream:#f7f3eb; --app-gold:#c9a84c; --app-ink:#20231f; }
        body { background: #ebe8e1; }
        .club-app-shell { min-height:100vh; background:var(--app-cream); color:var(--app-ink); font-family:'DM Sans','Helvetica Neue',Arial,sans-serif; padding-bottom:82px; }
        .app-top { background:linear-gradient(145deg,#123021 0%,var(--app-green) 62%,#245239 100%); color:white; padding:max(18px,env(safe-area-inset-top)) 22px 18px; }
        .app-brand { max-width:1120px; margin:0 auto; display:flex; align-items:center; gap:15px; }
        .app-brand-copy { flex:1; min-width:0; }
        .app-brand-title { font-family:'Playfair Display',Georgia,serif; font-size:clamp(27px,5vw,42px); line-height:.96; font-weight:500; letter-spacing:-.02em; }
        .app-brand-est { margin-top:7px; color:var(--app-gold); font-family:'Libre Baskerville',Georgia,serif; font-size:13px; }
        .app-login { display:flex; width:46px; height:46px; border:1px solid rgba(255,255,255,.65); border-radius:50%; align-items:center; justify-content:center; color:white; text-decoration:none; flex-shrink:0; }
        .app-hero { min-height:355px; position:relative; background-size:cover; background-position:center; display:flex; align-items:flex-end; }
        .app-hero:after { content:''; position:absolute; inset:0; background:linear-gradient(to top,rgba(8,18,12,.74),rgba(8,18,12,.06) 70%); }
        .app-hero-copy { position:relative; z-index:1; width:min(1120px,100%); margin:0 auto; padding:34px 22px; color:white; }
        .app-hero-copy h1 { margin:0; max-width:560px; font-family:'Playfair Display',Georgia,serif; font-size:clamp(35px,7vw,58px); line-height:1.02; font-weight:500; }
        .app-hero-copy p { margin:9px 0 0; font-family:'Libre Baskerville',Georgia,serif; font-size:15px; color:rgba(255,255,255,.88); }
        .app-content { max-width:1120px; margin:0 auto; padding:20px 18px 54px; }
        .quick-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:11px; margin-top:-1px; }
        .quick-card { min-height:118px; border:1px solid rgba(27,59,42,.11); background:#fff; border-radius:13px; box-shadow:0 6px 18px rgba(24,40,29,.07); text-decoration:none; color:#1c2f23; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:10px; padding:12px 7px; transition:transform .18s ease,box-shadow .18s ease; }
        .quick-card:hover { transform:translateY(-2px); box-shadow:0 10px 23px rgba(24,40,29,.12); }
        .quick-card span { font-size:13px; line-height:1.15; font-weight:650; }
        .section-head { margin:34px 2px 16px; display:flex; align-items:end; justify-content:space-between; gap:16px; }
        .section-head h2 { margin:0; color:var(--app-green); font-family:'Playfair Display',Georgia,serif; font-size:clamp(27px,4vw,38px); font-weight:500; }
        .section-head a { color:#a27e24; text-decoration:none; font-family:'Libre Baskerville',Georgia,serif; font-size:13px; }
        .happening-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .event-card { border:1px solid rgba(27,59,42,.11); border-radius:13px; overflow:hidden; background:#fff; text-decoration:none; color:inherit; box-shadow:0 5px 16px rgba(24,40,29,.06); }
        .event-photo { height:176px; position:relative; background-size:cover; background-position:center; }
        .date-chip { position:absolute; bottom:0; left:14px; background:var(--app-green); color:white; min-width:53px; padding:7px 8px; text-align:center; }
        .date-chip strong { display:block; font-size:19px; line-height:1; }
        .date-chip span { font-size:10px; letter-spacing:.08em; }
        .event-body { padding:15px 16px 18px; }
        .event-title { font-family:'Playfair Display',Georgia,serif; font-size:21px; line-height:1.18; color:#18251d; }
        .event-more { margin-top:11px; color:var(--app-green-2); font-size:12px; text-decoration:underline; text-underline-offset:3px; }
        .feature-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:24px; }
        .feature-card { min-height:184px; padding:25px; border-radius:13px; text-decoration:none; display:flex; flex-direction:column; justify-content:space-between; border:1px solid rgba(27,59,42,.12); }
        .feature-card.dark { background:linear-gradient(145deg,#143522,#24553a); color:#fff; }
        .feature-card.light { background:#fffaf0; color:#1c2f23; }
        .feature-icon { color:var(--app-gold); }
        .feature-card h3 { font-family:'Playfair Display',Georgia,serif; margin:12px 0 8px; font-size:25px; font-weight:500; }
        .feature-card p { margin:0; font-family:'Libre Baskerville',Georgia,serif; font-size:13px; line-height:1.6; opacity:.84; }
        .feature-more { margin-top:18px; color:var(--app-gold); font-size:12px; font-weight:700; letter-spacing:.02em; }
        .app-bottom { position:fixed; z-index:30; bottom:0; left:0; right:0; height:calc(66px + env(safe-area-inset-bottom)); padding-bottom:env(safe-area-inset-bottom); background:rgba(255,255,255,.96); border-top:1px solid rgba(27,59,42,.12); backdrop-filter:blur(14px); display:none; }
        .app-bottom-inner { height:66px; max-width:600px; margin:0 auto; display:grid; grid-template-columns:repeat(5,1fr); }
        .bottom-link { color:#4a504b; text-decoration:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; font-size:10px; }
        .bottom-link.active { color:var(--app-green); font-weight:700; }
        @media(max-width:760px){
          .app-top{padding-left:16px;padding-right:16px}.app-brand{gap:10px}.app-brand svg{width:66px;height:66px}.app-login{width:42px;height:42px}
          .app-hero{min-height:330px}.app-hero-copy{padding:28px 18px}.app-content{padding:16px 12px 34px}
          .quick-grid{grid-template-columns:repeat(3,1fr);gap:8px}.quick-card{min-height:103px}.quick-card span{font-size:12px}
          .happening-grid{grid-template-columns:1fr;gap:12px}.event-card{display:grid;grid-template-columns:43% 57%}.event-photo{height:142px}.event-body{padding:16px 14px}.event-title{font-size:18px}
          .feature-grid{grid-template-columns:1fr;gap:11px}.feature-card{min-height:150px}.app-bottom{display:block}.section-head{margin-top:29px}
        }
        @media(max-width:390px){.app-brand-title{font-size:25px}.quick-card{min-height:96px}.quick-card svg{width:22px;height:22px}.event-card{grid-template-columns:40% 60%}}
      `}</style>

      <header className="app-top">
        <div className="app-brand">
          <BbcCrest size={78} light />
          <div className="app-brand-copy">
            <div className="app-brand-title">Barnes<br />Bowling Club</div>
            <div className="app-brand-est">Est. c1725</div>
          </div>
          <Link className="app-login" href="/login" aria-label="Open members area">
            <Users size={23} strokeWidth={1.6} />
          </Link>
        </div>
      </header>

      <section className="app-hero" style={{ backgroundImage: `url('${hero}')` }}>
        <div className="app-hero-copy">
          <h1>Welcome to<br />Barnes Bowling Club</h1>
          <p>A historic club with a warm welcome.</p>
        </div>
      </section>

      <div className="app-content">
        <nav className="quick-grid" aria-label="Club app shortcuts">
          {quickLinks.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className="quick-card">
              <Icon size={29} strokeWidth={1.55} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="section-head">
          <h2>What’s Happening at Barnes</h2>
          <Link href="/home">View all</Link>
        </div>

        <section className="happening-grid" aria-label="Upcoming club activity">
          {[0, 1, 2].map((index) => {
            const event = events?.[index];
            const fallback = fallbackCards[index];
            const parts = dateParts(event?.event_date);
            const href = event ? '/home' : fallback.href;
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
                  <div className="event-more">View details →</div>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="feature-grid" aria-label="Explore Barnes Bowling Club">
          <Link href="/history" className="feature-card dark">
            <div>
              <Landmark className="feature-icon" size={31} strokeWidth={1.5} />
              <h3>Our History</h3>
              <p>Discover the story of our historic Barnes green and the traditional game still played today.</p>
            </div>
            <div className="feature-more">Discover more →</div>
          </Link>
          <Link href="/news" className="feature-card light">
            <div>
              <Newspaper className="feature-icon" size={31} strokeWidth={1.5} />
              <h3>Club News</h3>
              <p>The latest news, notices and updates from around the club.</p>
            </div>
            <div className="feature-more">Read more →</div>
          </Link>
          <Link href="/membership" className="feature-card dark">
            <div>
              <UserPlus className="feature-icon" size={31} strokeWidth={1.5} />
              <h3>Membership</h3>
              <p>Find out how to become part of our friendly, sociable Barnes community.</p>
            </div>
            <div className="feature-more">Find out more →</div>
          </Link>
        </section>
      </div>

      <nav className="app-bottom" aria-label="App navigation">
        <div className="app-bottom-inner">
          <Link href="/club-app" className="bottom-link active"><Home size={22} /><span>Home</span></Link>
          <Link href="/login?redirect=/members/calendar" className="bottom-link"><CalendarDays size={22} /><span>Calendar</span></Link>
          <Link href="/login?redirect=/members/results" className="bottom-link"><Trophy size={22} /><span>Competitions</span></Link>
          <Link href="/gallery" className="bottom-link"><Images size={22} /><span>Gallery</span></Link>
          <Link href="/home" className="bottom-link"><Menu size={22} /><span>More</span></Link>
        </div>
      </nav>
    </main>
  );
}
