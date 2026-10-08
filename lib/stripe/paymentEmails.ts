import { Resend } from 'resend';

export interface SendPaymentEmailsArgs {
  resend: Resend;
  memberEmail: string | null;
  memberName: string;
  amountFormatted: string;
  paymentLabel: string;
  paymentDate: string;
  stripeRef: string;
  matched: boolean;
  membershipNumberTyped?: string | null;
  subjectSuffix?: string;
}

export async function sendPaymentEmails({
  resend,
  memberEmail,
  memberName,
  amountFormatted,
  paymentLabel,
  paymentDate,
  stripeRef,
  matched,
  membershipNumberTyped,
  subjectSuffix = '',
}: SendPaymentEmailsArgs) {
  const suffix = subjectSuffix ? ` ${subjectSuffix}` : '';

  const unmatchedBanner = !matched ? `
    <div style="background:#fff3cd;border-left:4px solid #e67e22;padding:14px 16px;margin-bottom:24px">
      <p style="margin:0;font-size:14px;font-weight:700;color:#7d4e00;font-family:Arial,sans-serif">ACTION NEEDED — unmatched payment</p>
      <p style="margin:6px 0 0;font-size:13px;color:#7d4e00;font-family:Arial,sans-serif;line-height:1.6">
        This payment could not be matched to any member account automatically.
        Please allocate it manually using the details below.
      </p>
    </div>` : '';

  const memberEmailHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a3a2a">
      <div style="background:#1a3a2a;padding:28px 32px">
        <h1 style="margin:0;font-size:20px;color:#f5f0e8;letter-spacing:.02em">Barnes Bowling Club</h1>
        <p style="margin:6px 0 0;font-size:12px;color:rgba(245,240,232,.6);font-family:Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">Established 1725</p>
      </div>
      <div style="padding:32px">
        <h2 style="font-size:22px;font-weight:500;margin:0 0 8px;color:#1a3a2a">Payment Received</h2>
        <p style="font-size:15px;line-height:1.8;color:#4a5568;margin:0 0 24px">
          Thank you for your payment of ${amountFormatted}.${matched ? ' Your account has been updated.' : ''}
        </p>
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="border-bottom:1px solid #e8e4dc">
            <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif;width:40%">Description</td>
            <td style="padding:10px 0;color:#1a3a2a;font-weight:500">${paymentLabel}</td>
          </tr>
          <tr style="border-bottom:1px solid #e8e4dc">
            <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif">Amount</td>
            <td style="padding:10px 0;color:#1a3a2a;font-weight:700">${amountFormatted}</td>
          </tr>
          <tr style="border-bottom:1px solid #e8e4dc">
            <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif">Date</td>
            <td style="padding:10px 0;color:#1a3a2a">${paymentDate}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif">Reference</td>
            <td style="padding:10px 0;color:#1a3a2a;font-size:12px;font-family:'Courier New',monospace">${stripeRef}</td>
          </tr>
        </table>
        <p style="font-size:14px;line-height:1.8;color:#4a5568;margin:24px 0 0">
          If you have any questions please contact us at <a href="mailto:info@barnesbowling.club" style="color:#2d5a3d">info@barnesbowling.club</a>.
        </p>
      </div>
      <div style="background:#f5f1ea;padding:20px 32px;border-top:1px solid #e8e4dc">
        <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif">
          Barnes Bowling Club · Sun Inn, Church Road, Barnes, London SW13 9HE
        </p>
      </div>
    </div>
  `;

  const adminEmailHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a3a2a">
      <div style="background:#1a3a2a;padding:28px 32px">
        <h1 style="margin:0;font-size:20px;color:#f5f0e8;letter-spacing:.02em">Barnes Bowling Club</h1>
        <p style="margin:6px 0 0;font-size:12px;color:rgba(245,240,232,.6);font-family:Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">Established 1725</p>
      </div>
      <div style="padding:32px">
        ${unmatchedBanner}
        <h2 style="font-size:22px;font-weight:500;margin:0 0 8px;color:#1a3a2a">Payment received from ${memberName}</h2>
        <p style="font-size:15px;line-height:1.8;color:#4a5568;margin:0 0 24px">
          A payment of ${amountFormatted} has been received from ${memberName} (${memberEmail ?? '—'}).
        </p>
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="border-bottom:1px solid #e8e4dc">
            <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif;width:40%">Member</td>
            <td style="padding:10px 0;color:#1a3a2a;font-weight:500">${memberName} &lt;${memberEmail ?? '—'}&gt;</td>
          </tr>
          ${!matched ? `
          <tr style="border-bottom:1px solid #e8e4dc">
            <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif">Membership no. given</td>
            <td style="padding:10px 0;color:#1a3a2a;font-weight:500">${membershipNumberTyped || '(none provided)'}</td>
          </tr>` : ''}
          <tr style="border-bottom:1px solid #e8e4dc">
            <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif">Description</td>
            <td style="padding:10px 0;color:#1a3a2a;font-weight:500">${paymentLabel}</td>
          </tr>
          <tr style="border-bottom:1px solid #e8e4dc">
            <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif">Amount</td>
            <td style="padding:10px 0;color:#1a3a2a;font-weight:700">${amountFormatted}</td>
          </tr>
          <tr style="border-bottom:1px solid #e8e4dc">
            <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif">Date</td>
            <td style="padding:10px 0;color:#1a3a2a">${paymentDate}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif">Stripe ref</td>
            <td style="padding:10px 0;color:#1a3a2a;font-size:12px;font-family:'Courier New',monospace">${stripeRef}</td>
          </tr>
        </table>
        <p style="font-size:14px;line-height:1.8;color:#4a5568;margin:24px 0 0">
          ${matched
            ? "The member's account statement has been updated automatically."
            : 'Please log into the admin panel and record this payment against the correct member account manually.'
          }
        </p>
      </div>
      <div style="background:#f5f1ea;padding:20px 32px;border-top:1px solid #e8e4dc">
        <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif">
          Barnes Bowling Club · Sun Inn, Church Road, Barnes, London SW13 9HE
        </p>
      </div>
    </div>
  `;

  if (memberEmail) {
    const { error: memberEmailError } = await resend.emails.send({
      from:    'Barnes Bowling Club <noreply@barnesbowlingclub.com>',
      to:      memberEmail,
      subject: `Payment Received — Barnes Bowling Club${suffix}`,
      html:    memberEmailHtml,
    });
    if (memberEmailError) console.error('[sendPaymentEmails] member email failed:', memberEmailError);
  }

  const adminSubject = matched
    ? `Payment received — ${memberName} — ${amountFormatted}${suffix}`
    : `ACTION NEEDED – unmatched payment — ${memberName} — ${amountFormatted}${suffix}`;

  const { error: adminEmailError } = await resend.emails.send({
    from:    'Barnes Bowling Club <noreply@barnesbowlingclub.com>',
    to:      'info@barnesbowling.club',
    subject: adminSubject,
    html:    adminEmailHtml,
  });
  if (adminEmailError) console.error('[sendPaymentEmails] admin email failed:', adminEmailError);
}
