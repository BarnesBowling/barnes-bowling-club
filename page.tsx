import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Social Media Policy — Barnes Bowling Club',
};

export default function SocialMediaPolicyPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>Club Policies</div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Social Media Policy
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Guidelines for the use of social media by Barnes Bowling Club members and officials.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="section-inner" style={{ padding: '3.5rem 2rem 5rem', maxWidth: '760px' }}>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '15px', lineHeight: 1.85, color: 'var(--text-mid)' }}>

            <Section title="1. Introduction">
              Barnes Bowling Club (BBC) recognises that social media is an important means of communication
              and a valuable tool for promoting the club, engaging with members, and sharing news and events.
              This policy sets out the standards we expect when members and officials use social media in
              connection with the club.
            </Section>

            <Section title="2. Scope">
              This policy applies to all members, officers, and volunteers of Barnes Bowling Club when
              representing the club or when their social media activity could reasonably be associated with
              the club. It covers all social media platforms including, but not limited to, Facebook,
              Instagram, X (formerly Twitter), LinkedIn, YouTube, and WhatsApp groups.
            </Section>

            <Section title="3. Responsible Use">
              Members are encouraged to share positive news, results, and club activities. When doing so,
              please ensure that:
            </Section>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                'You have the consent of any individuals who appear in photographs or videos before posting.',
                'Content is accurate, respectful, and upholds the reputation of the club.',
                'You do not disclose confidential club information.',
                'You comply with all applicable laws, including copyright and data protection legislation.',
              ].map(item => (
                <li key={item} style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '15px', lineHeight: 1.75, color: 'var(--text-mid)' }}>
                  {item}
                </li>
              ))}
            </ul>

            <Section title="4. Prohibited Conduct">
              Members must not use social media to post content that is defamatory, discriminatory,
              harassing, or offensive towards other members, opponents, officials, or the general public.
              Posts that bring the club into disrepute may result in disciplinary action in accordance
              with the club constitution.
            </Section>

            <Section title="5. Official Club Channels">
              Only authorised officers may post on behalf of the club on official BBC social media accounts.
              If you wish to share club news or events, please contact the Secretary or the Communications
              Officer who will be happy to assist.
            </Section>

            <Section title="6. Complaints">
              If you believe that content posted by a member or official breaches this policy, please raise
              the matter with the Club Secretary in writing. All complaints will be treated sensitively and
              in accordance with the club&rsquo;s disciplinary procedures.
            </Section>

            <Section title="7. Review">
              This policy will be reviewed annually by the Committee. Any updates will be communicated to
              members via the club newsletter and the members&rsquo; area of the website.
            </Section>

            <p style={{ marginTop: '2.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '.04em' }}>
              Last reviewed: May 2026 &nbsp;·&nbsp; Barnes Bowling Club, The Sun Inn, Church Road, Barnes, London SW13 9HE
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 style={{
        fontFamily:   "'Playfair Display', serif",
        fontSize:     '19px',
        fontWeight:   500,
        color:        'var(--green-deep)',
        margin:       '0 0 0.75rem',
        marginTop:    '2rem',
        letterSpacing: '.01em',
      }}>
        {title}
      </h2>
      <p style={{ margin: '0 0 1.75rem' }}>{children}</p>
    </>
  );
}
