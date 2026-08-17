import { Webhook } from 'npm:standardwebhooks@1.0.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const HOOK_SECRET = Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? '';
// SUPABASE_URL is a built-in secret in Supabase Edge Functions
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';

const FROM = 'Barnes Bowling Club <invites@barnesbowlingclub.com>';
const REPLY_TO = 'info@barnesbowling.club';

// ── Shared layout wrappers ────────────────────────────────────────────────────

function emailWrapper(headerTitle: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:36px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#1b3b26;padding:28px 36px">
            <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(201,168,76,.85)">
              Barnes Bowling Club
            </p>
            <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#f5f0e8;letter-spacing:-.01em">
              ${headerTitle}
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px">
            ${bodyContent}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f0e8;padding:20px 36px;border-top:1px solid #e8e4dc">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9ca3af;line-height:1.6">
              Barnes Bowling Club &middot; The Sun Inn, Church Road, Barnes, London SW13&nbsp;9HE
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin-bottom:32px">
    <tr>
      <td style="background:#1b3b26;padding:0">
        <a href="${href}"
           style="display:inline-block;padding:14px 32px;background:#1b3b26;color:#f5f0e8;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">
          ${label} &rarr;
        </a>
      </td>
    </tr>
  </table>`;
}

function fallbackLink(href: string): string {
  return `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af">
    If the button above doesn&rsquo;t work, copy and paste this link into your browser:
  </p>
  <p style="margin:0 0 32px;font-family:'Courier New',Courier,monospace;font-size:11px;color:#6b7280;word-break:break-all">
    ${href}
  </p>`;
}

function greeting(firstName: string): string {
  return `<p style="margin:0 0 8px;font-family:Georgia,serif;font-size:18px;font-weight:400;color:#1b3b26">
    Hi${firstName ? ` ${firstName}` : ''},
  </p>`;
}

function membershipBadge(membershipNumber: string): string {
  if (!membershipNumber) return '';
  return `<p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(27,59,38,.55);letter-spacing:.02em">
    Membership No. <strong style="color:#1b3b26;letter-spacing:.04em">${membershipNumber}</strong>
  </p>`;
}

// ── Email templates ───────────────────────────────────────────────────────────

function buildInviteHtml(confirmationURL: string, firstName: string): string {
  const body = `
    ${greeting(firstName)}
    <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#4a5568">
      You&rsquo;ve been invited to join the Barnes Bowling Club members area. Click the button below to set
      your password and activate your account. This link will expire in&nbsp;24&nbsp;hours.
    </p>
    ${ctaButton(confirmationURL, 'Accept Invitation')}
    ${fallbackLink(confirmationURL)}
    <hr style="border:none;border-top:1px solid #e8e4dc;margin:0 0 28px" />
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#9ca3af">
      If you weren&rsquo;t expecting this invitation, you can safely ignore this email.
      Contact us at <a href="mailto:info@barnesbowling.club" style="color:#9ca3af">info@barnesbowling.club</a> if you have any questions.
    </p>`;
  return emailWrapper("You've been invited", body);
}

function buildMagiclinkHtml(confirmationURL: string, firstName: string, membershipNumber: string): string {
  const body = `
    ${greeting(firstName)}
    ${membershipBadge(membershipNumber)}
    <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#4a5568">
      Click the button below to sign in to the Barnes Bowling Club members area. This link will expire
      in&nbsp;1&nbsp;hour and can only be used once.
    </p>
    ${ctaButton(confirmationURL, 'Sign In')}
    ${fallbackLink(confirmationURL)}
    <hr style="border:none;border-top:1px solid #e8e4dc;margin:0 0 28px" />
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#9ca3af">
      If you didn&rsquo;t request this sign-in link, you can safely ignore this email &mdash; your account won&rsquo;t be affected.
    </p>`;
  return emailWrapper('Your sign-in link', body);
}

function buildRecoveryHtml(confirmationURL: string, firstName: string, membershipNumber: string): string {
  const body = `
    ${greeting(firstName)}
    ${membershipBadge(membershipNumber)}
    <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#4a5568">
      We received a request to reset the password for your Barnes Bowling Club members area account.
      Click the button below to set a new password. This link will expire in&nbsp;24&nbsp;hours.
    </p>
    ${ctaButton(confirmationURL, 'Reset Password')}
    ${fallbackLink(confirmationURL)}
    <hr style="border:none;border-top:1px solid #e8e4dc;margin:0 0 28px" />
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#9ca3af">
      If you didn&rsquo;t request a password reset, you can safely ignore this email &mdash; your password won&rsquo;t be changed.
    </p>`;
  return emailWrapper('Reset your password', body);
}

function buildSignupHtml(confirmationURL: string, firstName: string): string {
  const body = `
    ${greeting(firstName)}
    <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#4a5568">
      Please confirm your email address to activate your Barnes Bowling Club members area account.
      This link will expire in&nbsp;24&nbsp;hours.
    </p>
    ${ctaButton(confirmationURL, 'Confirm Email')}
    ${fallbackLink(confirmationURL)}
    <hr style="border:none;border-top:1px solid #e8e4dc;margin:0 0 28px" />
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#9ca3af">
      If you didn&rsquo;t create this account, you can safely ignore this email.
    </p>`;
  return emailWrapper('Confirm your email', body);
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  // Verify Supabase webhook signature
  try {
    const wh = new Webhook(HOOK_SECRET);
    wh.verify(payload, headers);
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid webhook signature' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { user, email_data } = JSON.parse(payload) as {
    user: { email: string; user_metadata?: Record<string, unknown> };
    email_data: {
      email_action_type: string;
      token_hash: string;
      redirect_to: string;
    };
  };

  const { email_action_type, token_hash, redirect_to } = email_data;

  // Build the Supabase verify URL — SUPABASE_URL is a built-in Edge Function secret
  const confirmUrl = new URL(`${SUPABASE_URL}/auth/v1/verify`);
  confirmUrl.searchParams.set('token', token_hash);
  confirmUrl.searchParams.set('type', email_action_type);
  if (redirect_to) confirmUrl.searchParams.set('redirect_to', redirect_to);
  const confirmationURL = confirmUrl.toString();

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? '';
  const firstName = fullName.split(' ')[0] ?? '';
  const membershipNumber = (user.user_metadata?.membership_number as string | undefined) ?? '';

  let subject: string;
  let html: string;

  switch (email_action_type) {
    case 'invite':
      subject = "You're invited to the Barnes Bowling Club members area";
      html = buildInviteHtml(confirmationURL, firstName);
      break;
    case 'magiclink':
      subject = 'Your Barnes Bowling Club sign-in link';
      html = buildMagiclinkHtml(confirmationURL, firstName, membershipNumber);
      break;
    case 'recovery':
      subject = 'Reset your Barnes Bowling Club password';
      html = buildRecoveryHtml(confirmationURL, firstName, membershipNumber);
      break;
    case 'signup':
      subject = 'Confirm your Barnes Bowling Club email address';
      html = buildSignupHtml(confirmationURL, firstName);
      break;
    default:
      // Return 200 so Supabase doesn't retry unknown types
      return new Response(
        JSON.stringify({ message: `Unhandled email type: ${email_action_type}` }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [user.email],
      subject,
      html,
      reply_to: REPLY_TO,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[send-email] Resend error:', err);
    return new Response(
      JSON.stringify({ error: 'Resend API error', detail: err }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
