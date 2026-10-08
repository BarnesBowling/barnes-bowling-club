import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 500, color: 'var(--green-deep)', marginBottom: '12px' }}>
      {title}
    </h2>
    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', lineHeight: 1.9, color: 'var(--text-mid)' }}>
      {children}
    </div>
  </section>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ margin: '0 0 1rem' }}>{children}</p>
);

const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 600, color: 'var(--green-deep)', margin: '1.25rem 0 0.5rem' }}>
    {children}
  </h3>
);

const Ul = ({ children }: { children: React.ReactNode }) => (
  <ul style={{ margin: '0 0 1rem', paddingLeft: '1.5rem' }}>{children}</ul>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <li style={{ marginBottom: '6px' }}>{children}</li>
);

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>Legal</div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Privacy <em style={{ color: 'var(--gold-light)' }}>Policy</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Last updated: 8 October 2026
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="section-inner" style={{ padding: '4rem 2rem 5rem', maxWidth: '760px' }}>

          <Section id="about-this-policy" title="1. About this policy">
            <P>
              Barnes Bowling Club (&ldquo;the Club&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) respects your privacy and is committed to protecting your personal information.
            </P>
            <P>This policy explains how we collect, use, store and protect personal information about:</P>
            <Ul>
              <Li>members and prospective members</Li>
              <Li>guests who play or attend as a member&rsquo;s guest</Li>
              <Li>visitors to our website</Li>
              <Li>anyone who contacts the Club or attends Club events</Li>
            </Ul>
            <P>
              Barnes Bowling Club is the data controller for the personal information described in this policy. The Club is run by its elected committee, and questions about personal data should be directed to the Club Secretary at{' '}
              <a href="mailto:info@barnesbowling.club" style={{ color: 'var(--green-mid)' }}>info@barnesbowling.club</a>.
            </P>
          </Section>

          <Section id="personal-data" title="2. Personal data we collect">
            <SubHeading>About members and applicants</SubHeading>
            <Ul>
              <Li>Name, postal address, email address and telephone number</Li>
              <Li>Membership application details, membership number and membership status</Li>
              <Li>Login and account details for the Members Area</Li>
              <Li>A passport-style photograph for your membership card, and the date your card was issued</Li>
              <Li>Records of clubhouse key deposits and whether you hold a key</Li>
              <Li>Subscription, guest fee, event fee and other payment records, including your account balance</Li>
              <Li>Competition entries, results, handicaps, match bookings and attendance records</Li>
              <Li>Messages and enquiries you send us</Li>
            </Ul>
            <SubHeading>About guests</SubHeading>
            <P>
              Your name and the date you played or attended, recorded against the member who invited you, so guest fees can be charged.
            </P>
            <SubHeading>About website visitors</SubHeading>
            <Ul>
              <Li>Technical information such as IP address, browser type, device information, pages visited and access times</Li>
              <Li>Cookie information (see section 9)</Li>
            </Ul>
            <SubHeading>Photographs</SubHeading>
            <Ul>
              <Li>Photographs taken at matches, competitions and social events (see section 7)</Li>
            </Ul>
            <P>
              We collect this information when you apply for membership, use the website, contact us, make a payment, play as a guest, or take part in Club activities.
            </P>
          </Section>

          <Section id="how-we-use" title="3. How we use your data">
            <P>We use personal data to:</P>
            <Ul>
              <Li>process membership applications and administer membership</Li>
              <Li>provide access to the Members Area</Li>
              <Li>issue membership cards and manage clubhouse keys</Li>
              <Li>manage subscriptions, guest fees, event fees, key deposits and member accounts</Li>
              <Li>process payments and issue receipts or statements</Li>
              <Li>run matches, competitions, bookings, leaderboards and social events</Li>
              <Li>communicate with members about fixtures, events, notices and Club business</Li>
              <Li>respond to enquiries</Li>
              <Li>keep accurate Club records, including the Club&rsquo;s historical archive</Li>
              <Li>keep the website secure and working properly</Li>
              <Li>meet our legal, accounting, insurance and safeguarding obligations</Li>
            </Ul>
            <P>We do not sell, rent or share your personal data with anyone for their own marketing.</P>
          </Section>

          <Section id="lawful-basis" title="4. Lawful basis for processing">
            <P>We only use personal data where UK data protection law allows it. We rely on:</P>
            <Ul>
              <Li><strong>Contract</strong> &mdash; to manage your membership, issue your membership card, run your member account and provide member services</Li>
              <Li><strong>Legitimate interests</strong> &mdash; to run the Club properly, including recording guest visits, organising competitions, taking event photographs, sending Club news to members, and keeping a historical archive. We balance these interests against your rights, and you can object at any time</Li>
              <Li><strong>Legal obligation</strong> &mdash; to keep financial and accounting records and meet other legal requirements</Li>
              <Li><strong>Consent</strong> &mdash; for non-essential cookies, if we use them, and for any other purpose where we ask for your consent. You can withdraw consent at any time</Li>
            </Ul>
          </Section>

          <Section id="member-visibility" title="5. What other members can see">
            <P>
              The Members Area is only available to logged-in members. Within it, other members can see your name in match booking lists, competition draws, results and leaderboards.
            </P>
            <P>
              Your contact details, account balance and payment records are not visible to other members. They can only be seen by Club officers and committee members who need them for Club administration.
            </P>
          </Section>

          <Section id="communications" title="6. Club communications">
            <P>
              As a member, you will receive essential messages about your membership, payments, fixtures, events and Club business.
            </P>
            <P>
              We may also send members Club newsletters and news about Club events. Every newsletter includes a way to unsubscribe, and you can opt out at any time by contacting us.
            </P>
            <P>Non-members only receive newsletters if they have signed up to receive them.</P>
          </Section>

          <Section id="photographs" title="7. Photographs">
            <SubHeading>Event photographs</SubHeading>
            <P>
              We take photographs at matches, competitions and social events. We may use them on the website, in the Members Area photo books, in newsletters, on social media and in the Club&rsquo;s historical archive.
            </P>
            <P>
              We will let people know when photography is taking place where practical. If you would prefer not to be photographed, or would like a photograph removed, please contact us and we will do our best to help.
            </P>
            <SubHeading>Membership card photographs</SubHeading>
            <P>
              We ask members for a passport-style photograph for their membership card. You can upload it yourself in the Members Area, or a Club officer can add it for you. These photographs are only used for membership cards and Club records, and are not published.
            </P>
            <SubHeading>Children</SubHeading>
            <P>
              We take particular care with images of children and young people. We will ask for parent or guardian consent before publishing an identifiable image of a child.
            </P>
          </Section>

          <Section id="payments" title="8. Payments">
            <P>
              Online payments are processed securely by Stripe. The Club never sees or stores your full card details. Stripe handles your payment information under its own privacy policy.
            </P>
          </Section>

          <Section id="cookies" title="9. Cookies">
            <P>Cookies are small text files stored on your device when you visit a website.</P>
            <P>
              Our website only uses essential cookies. These are needed to log you in to the Members Area, keep your session secure and make the site work properly. Because they are essential, they do not require your consent.
            </P>
            <P>
              We do not use advertising or analytics cookies. If we introduce them in future, we will ask for your consent first and update this policy.
            </P>
            <P>
              You can block or delete cookies in your browser settings, but the Members Area will not work without essential cookies.
            </P>
          </Section>

          <Section id="data-sharing" title="10. Who we share data with">
            <P>We use the following service providers to run the website and Club administration:</P>
            <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', fontFamily: "'Libre Baskerville', serif" }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(45,90,61,.2)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', fontWeight: 600, color: 'var(--green-deep)', whiteSpace: 'nowrap' }}>Provider</th>
                    <th style={{ textAlign: 'left', padding: '8px 0 8px 12px', fontWeight: 600, color: 'var(--green-deep)' }}>What they do for us</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { provider: 'Supabase', desc: 'Member database and Members Area login' },
                    { provider: 'Netlify', desc: 'Website hosting' },
                    { provider: 'Resend', desc: 'Sending login and invitation emails' },
                    { provider: 'IONOS', desc: 'Club email' },
                    { provider: 'Stripe', desc: 'Online payments' },
                  ].map(({ provider, desc }) => (
                    <tr key={provider} style={{ borderBottom: '1px solid rgba(45,90,61,.1)' }}>
                      <td style={{ padding: '8px 12px 8px 0', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{provider}</td>
                      <td style={{ padding: '8px 0 8px 12px', verticalAlign: 'top' }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <P>
              These providers are required to handle personal data securely and lawfully. Some act as processors for the Club, while others, such as payment providers, may also handle information under their own legal obligations and privacy policies.
            </P>
            <P>
              We may also share personal data with our accountants, insurers or professional advisers where necessary, and with public authorities where the law requires it.
            </P>
          </Section>

          <Section id="international-transfers" title="11. International transfers">
            <P>
              Some of our service providers are based in, or store data in, the United States or other countries outside the UK.
            </P>
            <P>
              Where personal data is transferred outside the UK, we rely on appropriate legal safeguards used by those providers, such as the UK Extension to the EU&ndash;US Data Privacy Framework or the UK International Data Transfer Addendum to standard contractual clauses.
            </P>
          </Section>

          <Section id="data-security" title="12. Data security">
            <P>We take reasonable steps to protect personal data from loss, misuse and unauthorised access.</P>
            <P>
              The Members Area requires a secure login. Access to administrative data is controlled by role, so Club officers and volunteers can only see the information they need for their Club duties.
            </P>
          </Section>

          <Section id="retention" title="13. How long we keep your data">
            <Ul>
              <Li><strong>Membership records</strong> &mdash; for the duration of your membership and up to six years afterwards</Li>
              <Li><strong>Financial and payment records</strong> &mdash; up to six years, as required for accounting and legal purposes</Li>
              <Li><strong>Membership card photographs</strong> &mdash; until your membership ends, then deleted</Li>
              <Li><strong>Guest records</strong> &mdash; up to six years, as part of the Club&rsquo;s financial records</Li>
              <Li><strong>Enquiries</strong> &mdash; for as long as needed to deal with them, normally no more than two years</Li>
              <Li>
                <strong>Event photographs and historical records</strong> &mdash; the Club has a long history, with references to bowling in Barnes dating back to 1693 and the formal Club dating from 1889. We keep a historical archive, and event photographs, competition results and records of officers may be kept indefinitely for this purpose. You can ask us to remove a photograph of you at any time
              </Li>
            </Ul>
            <P>When data is no longer needed, we delete it securely or anonymise it.</P>
          </Section>

          <Section id="your-rights" title="14. Your rights">
            <P>Under UK data protection law, you have the right to:</P>
            <Ul>
              <Li>ask for a copy of the personal data we hold about you</Li>
              <Li>ask us to correct inaccurate or incomplete information</Li>
              <Li>ask us to delete your data in certain circumstances</Li>
              <Li>object to, or ask us to restrict, how we use your data</Li>
              <Li>ask for a copy of your data in a portable format</Li>
              <Li>withdraw your consent where we rely on consent</Li>
            </Ul>
            <P>
              To exercise any of these rights, please email{' '}
              <a href="mailto:info@barnesbowling.club" style={{ color: 'var(--green-mid)' }}>info@barnesbowling.club</a>.
              {' '}There is normally no charge. We will respond within one month, and we may ask you to confirm your identity first.
            </P>
            <P>
              If you are unhappy with how we have handled your data, please contact us first so we can try to put it right. You also have the right to complain to the Information Commissioner&rsquo;s Office at{' '}
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-mid)' }}>ico.org.uk</a>.
            </P>
          </Section>

          <Section id="third-party-links" title="15. Third-party links">
            <P>
              Our website contains links to other websites, such as payment pages, social media and maps. We are not responsible for their privacy practices, and we recommend reading their privacy policies.
            </P>
          </Section>

          <Section id="changes" title="16. Changes to this policy">
            <P>
              We may update this policy from time to time. The latest version will always be on this page, with the date it was last updated at the top.
            </P>
          </Section>

          <Section id="contact" title="17. Contact us">
            <P>For any questions about this policy or your personal data, please contact the Club Secretary:</P>
            <div style={{ background: 'rgba(45,90,61,.05)', padding: '1.25rem 1.5rem', borderLeft: '3px solid rgba(45,90,61,.2)', marginTop: '8px' }}>
              <strong>Barnes Bowling Club</strong><br />
              The Sun Inn<br />
              Church Road<br />
              Barnes<br />
              London SW13 9HE<br />
              <br />
              Email:{' '}
              <a href="mailto:info@barnesbowling.club" style={{ color: 'var(--green-mid)' }}>info@barnesbowling.club</a>
            </div>
          </Section>

        </div>
      </main>
      <Footer />
    </>
  );
}
