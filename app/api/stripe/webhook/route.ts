import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const PAYMENT_LABELS: Record<string, string> = {
  full:                'Playing Member Subscription',
  social:              'Social Member Subscription',
  junior:              'Junior Member Subscription',
  guest_fee:           'Guest Fee',
  outstanding_balance: 'Outstanding Balance',
};

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (e) {
    return new Response(`Webhook Error: ${(e as Error).message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session      = event.data.object;
    const paymentType  = session.metadata?.payment_type  || 'unknown';
    const memberEmail  = session.metadata?.member_email  || session.customer_details?.email || session.customer_email || null;
    const userId       = session.metadata?.user_id       || null;
    const amountPence  = session.amount_total            ?? 0;
    const amountGBP    = amountPence / 100;
    const paymentLabel = PAYMENT_LABELS[paymentType] ?? 'Payment';
    const paymentDate  = new Date(session.created * 1000).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const amountFormatted = `£${amountGBP.toFixed(2)}`;

    // ── 1. Record payment in payments table ───────────────────────────────
    const { error: paymentsError } = await supabaseAdmin.from('payments').insert({
      user_id: userId,
      stripe_checkout_id: session.id,
      amount: amountPence,
      status: 'paid',
      membership_type: paymentType,
    });
    if (paymentsError) console.error('[webhook] payments insert failed:', paymentsError);

    // ── 2. Update profile membership status for subscription payments ──────
    if (userId && paymentType !== 'guest_fee' && paymentType !== 'outstanding_balance') {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ membership_status: 'active', membership_type: paymentType })
        .eq('id', userId);
      if (profileError) console.error('[webhook] profile update failed:', profileError);
    }

    // ── 3. Post credit to member_ledger (the table the account page reads) ─
    if (memberEmail && amountGBP > 0) {
      // member_ledger uses member_id (UUID) not email — look it up first
      const { data: clubMember, error: lookupError } = await supabaseAdmin
        .from('club_members')
        .select('id')
        .eq('email', memberEmail)
        .maybeSingle();

      if (lookupError) {
        console.error('[webhook] club_members lookup failed:', lookupError);
      } else if (!clubMember) {
        console.error('[webhook] no club_members row found for email:', memberEmail);
      } else {
        const { error: ledgerError } = await supabaseAdmin.from('member_ledger').insert({
          member_id:   clubMember.id,
          date:        new Date(session.created * 1000).toISOString().slice(0, 10),
          description: `Payment received — ${paymentLabel} (Stripe ref: ${session.id.slice(-8)})`,
          category:    'payment',
          amount:      amountGBP,
          type:        'credit',
          created_by:  'stripe-webhook',
        });
        if (ledgerError) console.error('[webhook] member_ledger insert failed:', ledgerError);
      }
    }

    // ── 4. Emails ─────────────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const customerEmail = memberEmail;

      // Look up member name for admin notification
      let memberName = customerEmail;
      if (customerEmail) {
        const { data: profile } = await supabaseAdmin
          .from('member_profiles')
          .select('first_name, last_name')
          .eq('member_email', customerEmail)
          .maybeSingle();
        if (profile?.first_name) {
          memberName = `${profile.first_name} ${profile.last_name ?? ''}`.trim();
        }
      }

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
                : `A payment of ${amountFormatted} has been received from ${memberName} (${customerEmail ?? '—'}).`
              }
            </p>
            <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
              ${recipient === 'admin' ? `
              <tr style="border-bottom:1px solid #e8e4dc">
                <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif;width:40%">Member</td>
                <td style="padding:10px 0;color:#1a3a2a;font-weight:500">${memberName} &lt;${customerEmail ?? '—'}&gt;</td>
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
                <td style="padding:10px 0;color:#1a3a2a;font-size:12px;font-family:'Courier New',monospace">${session.id}</td>
              </tr>
            </table>
            <p style="font-size:14px;line-height:1.8;color:#4a5568;margin:24px 0 0">
              ${recipient === 'member'
                ? 'If you have any questions please contact us at <a href="mailto:info@barnesbowling.club" style="color:#2d5a3d">info@barnesbowling.club</a>.'
                : 'The member\'s account statement has been updated automatically.'
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

      // Send confirmation to member
      if (customerEmail) {
        const { error: memberEmailError } = await resend.emails.send({
          from:    'Barnes Bowling Club <noreply@barnesbowlingclub.com>',
          to:      customerEmail,
          subject: 'Payment Received — Barnes Bowling Club',
          html:    emailHtml('member'),
        });
        if (memberEmailError) console.error('[webhook] member confirmation email failed:', memberEmailError);
      }

      // Send admin notification
      const { error: adminEmailError } = await resend.emails.send({
        from:    'Barnes Bowling Club <noreply@barnesbowlingclub.com>',
        to:      'info@barnesbowling.club',
        subject: `Payment received — ${memberName} — ${amountFormatted}`,
        html:    emailHtml('admin'),
      });
      if (adminEmailError) console.error('[webhook] admin notification email failed:', adminEmailError);
    }
  }

  return new Response('ok');
}
