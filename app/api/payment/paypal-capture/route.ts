import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

// TODO: switch to https://api-m.paypal.com once live PayPal credentials are
// confirmed in the Netlify dashboard (current .env.local has sandbox placeholders).
const PAYPAL_BASE = 'https://api-m.sandbox.paypal.com';

async function getAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('Could not obtain PayPal access token');
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { orderID, memberEmail, amount, description } = await req.json();

    if (!orderID) {
      return NextResponse.json({ error: 'Missing orderID' }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const capture = await res.json();

    if (!res.ok || capture.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: capture.message ?? 'Payment capture failed' },
        { status: 400 }
      );
    }

    const amountGBP    = parseFloat(amount) || 0;
    const amountFormatted = `£${amountGBP.toFixed(2)}`;
    const paymentLabel = description || 'PayPal payment';
    const dateISO      = new Date().toISOString().split('T')[0];
    const paymentDate  = new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    // Look up member via club_members (same source as member_ledger foreign key)
    let memberId: string | null = null;
    let memberName: string = memberEmail ?? 'Member';

    if (memberEmail) {
      const { data: clubMember, error: lookupError } = await supabaseAdmin
        .from('club_members')
        .select('id, full_name')
        .eq('email', memberEmail)
        .maybeSingle();

      if (lookupError) {
        console.error('[paypal-capture] club_members lookup failed:', lookupError);
      } else if (clubMember) {
        memberId   = clubMember.id;
        memberName = clubMember.full_name || memberEmail;
      } else {
        console.error('[paypal-capture] no club_members row for email:', memberEmail);
      }
    }

    // Insert ledger credit
    if (memberId && amountGBP > 0) {
      const { error: ledgerError } = await supabaseAdmin.from('member_ledger').insert({
        member_id:   memberId,
        date:        dateISO,
        description: `Payment received — ${paymentLabel} (PayPal ref: ${orderID.slice(-8)})`,
        category:    'payment',
        amount:      amountGBP,
        type:        'credit',
        metadata:    { paypal_order_id: orderID, provider: 'paypal' },
        created_by:  'paypal_payment',
      });
      if (ledgerError) console.error('[paypal-capture] member_ledger insert failed:', ledgerError);
    }

    // Send confirmation emails — fire-and-forget, never blocks the response
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const stripeRef = orderID; // reuse same email template variable name

      const emailHtml = (recipient: 'member' | 'admin') => `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a3a2a">
          <div style="background:#1a3a2a;padding:28px 32px">
            <h1 style="margin:0;font-size:20px;color:#f5f0e8;letter-spacing:.02em">Barnes Bowling Club</h1>
            <p style="margin:6px 0 0;font-size:12px;color:rgba(245,240,232,.6);font-family:Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">Established 1725</p>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:22px;font-weight:500;margin:0 0 8px;color:#1a3a2a">
              ${recipient === 'admin' ? `Payment received from ${memberName}` : 'Payment Received'}
            </h2>
            <p style="font-size:15px;line-height:1.8;color:#4a5568;margin:0 0 24px">
              ${recipient === 'member'
                ? `Thank you for your payment of ${amountFormatted}. Your account has been updated.`
                : `A payment of ${amountFormatted} has been received from ${memberName} (${memberEmail ?? '—'}) via PayPal.`
              }
            </p>
            <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
              ${recipient === 'admin' ? `
              <tr style="border-bottom:1px solid #e8e4dc">
                <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif;width:40%">Member</td>
                <td style="padding:10px 0;color:#1a3a2a;font-weight:500">${memberName} &lt;${memberEmail ?? '—'}&gt;</td>
              </tr>` : ''}
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
              ${recipient === 'member'
                ? 'If you have any questions please contact us at <a href="mailto:info@barnesbowling.club" style="color:#2d5a3d">info@barnesbowling.club</a>.'
                : "The member's account statement has been updated automatically."
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
        resend.emails.send({
          from:    'Barnes Bowling Club <noreply@barnesbowlingclub.com>',
          to:      memberEmail,
          subject: 'Payment Received — Barnes Bowling Club',
          html:    emailHtml('member'),
        }).then(undefined, err => console.error('[paypal-capture] member email failed:', err));
      }

      resend.emails.send({
        from:    'Barnes Bowling Club <noreply@barnesbowlingclub.com>',
        to:      'info@barnesbowling.club',
        subject: `Payment received — ${memberName} — ${amountFormatted}`,
        html:    emailHtml('admin'),
      }).then(undefined, err => console.error('[paypal-capture] admin email failed:', err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
