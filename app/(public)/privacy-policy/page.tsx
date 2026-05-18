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
              Last updated: January 2026
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="section-inner" style={{ padding: '4rem 2rem 5rem', maxWidth: '760px' }}>

          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', lineHeight: 1.9, color: 'var(--text-mid)', marginBottom: '2.5rem' }}>
            Barnes Bowling Club (&ldquo;the Club&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting and respecting your privacy.
            This policy explains how we collect, use and store personal information when you visit our website or interact with the Club.
          </div>

          <Section id="data-collection" title="1. Data We Collect">
            <P>We may collect and process the following personal data about you:</P>
            <ul style={{ margin: '0 0 1rem', paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '6px' }}>Name, email address, and phone number provided through membership applications or contact forms</li>
              <li style={{ marginBottom: '6px' }}>Payment information processed securely through Stripe (we do not store card details)</li>
              <li style={{ marginBottom: '6px' }}>Usage data collected automatically when you visit our website, including your IP address, browser type, and pages visited</li>
              <li style={{ marginBottom: '6px' }}>Cookies and similar tracking technologies (see section 4)</li>
            </ul>
            <P>We collect this information when you apply for membership, contact us, make a payment, or simply browse our website.</P>
          </Section>

          <Section id="use-of-data" title="2. How We Use Your Data">
            <P>Barnes Bowling Club uses the data we collect for the following purposes:</P>
            <ul style={{ margin: '0 0 1rem', paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '6px' }}>To process and manage membership applications</li>
              <li style={{ marginBottom: '6px' }}>To administer your account and provide Members Area access</li>
              <li style={{ marginBottom: '6px' }}>To process payments and send payment confirmations</li>
              <li style={{ marginBottom: '6px' }}>To send you club news, event information, and newsletters (where you have consented)</li>
              <li style={{ marginBottom: '6px' }}>To respond to enquiries submitted through our contact form or by email</li>
              <li style={{ marginBottom: '6px' }}>To improve our website and services</li>
            </ul>
            <P>We will not sell, share, or rent your personal data to third parties for marketing purposes.</P>
          </Section>

          <Section id="data-retention" title="3. Data Retention">
            <P>
              We retain personal data only for as long as necessary to fulfil the purposes for which it was collected,
              including for the purposes of satisfying any legal, accounting, or reporting requirements.
              Membership records are typically retained for the duration of your membership and for a period of six years thereafter.
            </P>
            <P>
              If you would like your data to be deleted earlier, please contact us at{' '}
              <a href="mailto:info@barnesbowling.com" style={{ color: 'var(--green-mid)' }}>info@barnesbowling.com</a>.
            </P>
          </Section>

          <Section id="cookies" title="4. Cookies">
            <P>
              Our website uses cookies — small text files placed on your device — to improve your browsing experience.
              We use the following types of cookies:
            </P>
            <ul style={{ margin: '0 0 1rem', paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '6px' }}><strong>Essential cookies</strong> — required for the website to function correctly, including session management for the Members Area</li>
              <li style={{ marginBottom: '6px' }}><strong>Preference cookies</strong> — used to remember your choices, such as cookie consent</li>
              <li style={{ marginBottom: '6px' }}><strong>Analytics cookies</strong> — used to understand how visitors interact with our website (anonymised)</li>
            </ul>
            <P>
              You can control cookies through your browser settings. Disabling cookies may affect the functionality of some parts of the website.
              By continuing to use our site, you consent to our use of cookies in accordance with this policy.
            </P>
          </Section>

          <Section id="third-party-links" title="5. Third-Party Links">
            <P>
              Our website may contain links to third-party websites, including our payment provider (Stripe), social media platforms
              (Instagram, Facebook), and mapping services (Google Maps). We are not responsible for the privacy practices of these
              third-party sites and encourage you to read their privacy policies before providing any personal information.
            </P>
          </Section>

          <Section id="your-rights" title="6. Your Rights">
            <P>Under UK data protection law, you have the right to:</P>
            <ul style={{ margin: '0 0 1rem', paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '6px' }}>Access the personal data we hold about you</li>
              <li style={{ marginBottom: '6px' }}>Request correction of inaccurate or incomplete data</li>
              <li style={{ marginBottom: '6px' }}>Request erasure of your personal data in certain circumstances</li>
              <li style={{ marginBottom: '6px' }}>Object to or restrict the processing of your data</li>
              <li style={{ marginBottom: '6px' }}>Request a copy of your data in a portable format</li>
              <li style={{ marginBottom: '6px' }}>Lodge a complaint with the Information Commissioner&rsquo;s Office (ICO) at ico.org.uk</li>
            </ul>
            <P>To exercise any of these rights, please contact us using the details below.</P>
          </Section>

          <Section id="disclaimer" title="7. Disclaimer">
            <P>
              The information on this website is provided in good faith for general informational purposes only.
              Barnes Bowling Club makes no representation or warranty of any kind, express or implied, regarding the
              accuracy, adequacy, or completeness of any information on the site.
            </P>
            <P>
              The Club accepts no liability for any loss or damage of any nature arising from use of this website or
              reliance on its content. We reserve the right to update or remove content at any time without notice.
            </P>
          </Section>

          <Section id="contact" title="8. Contact">
            <P>
              If you have any questions about this Privacy Policy or how we handle your personal data, please contact us:
            </P>
            <div style={{ background: 'rgba(45,90,61,.05)', padding: '1.25rem 1.5rem', borderLeft: '3px solid rgba(45,90,61,.2)', marginTop: '8px' }}>
              <strong>Barnes Bowling Club</strong><br />
              The Sun Inn, Church Road, Barnes, London SW13 9HE<br />
              <a href="mailto:info@barnesbowling.com" style={{ color: 'var(--green-mid)' }}>info@barnesbowling.com</a>
            </div>
          </Section>

        </div>
      </main>
      <Footer />
    </>
  );
}
