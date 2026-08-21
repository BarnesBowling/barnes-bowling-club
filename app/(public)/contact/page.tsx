import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ContactForm } from './ContactForm';
import { supabaseAdmin } from '@/lib/supabase/admin';

const THINKING_DEFAULT = 'If you\'ve been wondering whether bowls might be for you, the best thing to do is come along and try. We\'re a warm, welcoming Club and there\'s nothing better than seeing the green for yourself.\n\nWednesday Club Nights are the perfect introduction. From 6pm every Wednesday, it\'s a relaxed, free social evening — no booking, no fee, no experience needed. Just turn up. You\'ll meet Members and Committee Members, have a roll-up on the green, and get a real feel for the Club.\n\nThere\'s always someone happy to lend a hand and show you the ropes. Bowls is one of the few sports where women and men play together as equals — it\'s social, surprisingly competitive when you want it to be, and good fun whatever the weather.\n\nA little about us — Barnes Bowling Club is home to London\'s oldest bowling green, the original Elizabethan green where the game has been played since 1725. We have over 100 Members, and we\'re always delighted to welcome newcomers aged 18 and over.\n\nA note on formal applications: Before any application can be accepted, we ask that you have visited the Club and played with at least two Committee Members. Wednesday Club Nights are the easiest way to do this — and the best way for us to get to know each other.';

function paras(text: string): string[] {
  return text.split('\n\n').map(p => p.trim()).filter(Boolean);
}

export default async function Contact() {
  const { data } = await supabaseAdmin
    .from('page_content')
    .select('section_key, body')
    .eq('page', 'contact')
    .order('sort_order');

  const thinkingBody = data?.find(r => r.section_key === 'thinking_of_joining')?.body ?? THINKING_DEFAULT;

  const pStyle: React.CSSProperties = {
    fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: '17px',
    lineHeight: 1.8,
    color: 'var(--green-deep)',
    marginBottom: '0.9rem',
  };

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>Get in Touch</div>
            <h1 className="section-h2" style={{ color: '#ffffff', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Get In <em style={{ color: '#c9a84c' }}>Touch</em>
            </h1>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '4rem 2rem' }}>
          <div className="contact-grid">
            <div style={{ background: 'var(--cream-warm)', padding: '2.5rem' }}>
              <Link href="/apply" className="section-tag" style={{ textDecoration: 'none' }}>Membership enquiry</Link>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 500, color: 'var(--green-deep)', marginBottom: '1rem' }}>
                Thinking of Joining?
              </h2>
              {paras(thinkingBody).map((p, i, arr) => (
                <p key={i} style={{ ...pStyle, marginBottom: i < arr.length - 1 ? '0.9rem' : '2rem' }}>{p}</p>
              ))}
              <Link href="/apply" className="btn-gold" style={{ display: 'inline-block', color: '#ffffff' }}>
                Submit a membership enquiry →
              </Link>
            </div>

            <div style={{ background: 'var(--cream-warm)', padding: '2.5rem' }}>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
