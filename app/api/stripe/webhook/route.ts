import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';
import { sendPaymentEmails } from '@/lib/stripe/paymentEmails';

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

  // ── PaymentIntent flow (StripePaymentForm.tsx → /api/stripe/create-payment-intent) ──
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent        = event.data.object;
    const membershipNumberRaw  = (paymentIntent.metadata?.membership_number ?? '').trim();
    const metaEmail            = (paymentIntent.metadata?.member_email ?? '').trim().toLowerCase() || null;
    const amountPence          = paymentIntent.amount_received ?? 0;
    // Use net_amount (pre-fee) for the ledger credit so the member's balance
    // reflects what they intended to pay, not the grossed-up Stripe total.
    const netAmountMeta        = paymentIntent.metadata?.net_amount;
    const netPence             = netAmountMeta ? parseInt(netAmountMeta, 10) : amountPence;
    const amountGBP            = netPence / 100;
    const amountFormatted      = `£${amountGBP.toFixed(2)}`;
    const paymentLabel         = paymentIntent.metadata?.description || 'Payment received';
    const paymentDate          = new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const dateISO = new Date().toISOString().slice(0, 10);

    let clubMember: { id: string; email: string | null; full_name: string | null } | null = null;

    // 1. Try membership_number (trimmed, case-insensitive)
    if (membershipNumberRaw) {
      const { data, error } = await supabaseAdmin
        .from('club_members')
        .select('id, email, full_name')
        .ilike('membership_number', membershipNumberRaw)
        .maybeSingle();
      if (error) console.error('[webhook] membership_number lookup failed:', error);
      else       clubMember = data;
    }

    // 2. Fall back to email (case-insensitive)
    if (!clubMember && metaEmail) {
      const { data, error } = await supabaseAdmin
        .from('club_members')
        .select('id, email, full_name')
        .ilike('email', metaEmail)
        .maybeSingle();
      if (error) console.error('[webhook] email lookup failed:', error);
      else       clubMember = data;
    }

    const matched      = clubMember !== null;
    const memberName   = paymentIntent.metadata?.member_name || clubMember?.full_name || clubMember?.email || 'Unknown Member';
    const memberEmail  = paymentIntent.metadata?.member_email || clubMember?.email || null;

    if (matched) {
      // Insert credit into member_ledger
      const { error: ledgerError } = await supabaseAdmin.from('member_ledger').insert({
        member_id:   clubMember!.id,
        date:        dateISO,
        description: `Payment received — ${paymentLabel} (Stripe ref: ${paymentIntent.id.slice(-8)})`,
        category:    'payment',
        amount:      amountGBP,
        type:        'credit',
        created_by:  'stripe-webhook',
      });
      if (ledgerError) console.error('[webhook] member_ledger insert failed:', ledgerError);
    } else {
      console.warn(
        '[webhook] payment_intent.succeeded: no member matched — membership_number:',
        membershipNumberRaw || '(none)', '| email:', metaEmail || '(none)',
        '| Stripe ref:', paymentIntent.id,
      );
    }

    // Always send emails — admin email is sent even when unmatched
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await sendPaymentEmails({
        resend, memberEmail, memberName, amountFormatted,
        paymentLabel, paymentDate, stripeRef: paymentIntent.id,
        matched, membershipNumberTyped: membershipNumberRaw || null,
      });
    }
  }

  // ── Checkout Session flow (kept for any other routes that use /api/checkout) ──
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

    // Record payment in payments table
    const { error: paymentsError } = await supabaseAdmin.from('payments').insert({
      user_id: userId,
      stripe_checkout_id: session.id,
      amount: amountPence,
      status: 'paid',
      membership_type: paymentType,
    });
    if (paymentsError) console.error('[webhook] payments insert failed:', paymentsError);

    // Update profile membership status for subscription payments
    if (userId && paymentType !== 'guest_fee' && paymentType !== 'outstanding_balance') {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ membership_status: 'active', membership_type: paymentType })
        .eq('id', userId);
      if (profileError) console.error('[webhook] profile update failed:', profileError);
    }

    // Post credit to member_ledger
    if (memberEmail && amountGBP > 0) {
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

    // Send emails
    if (process.env.RESEND_API_KEY && memberEmail) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      let memberName: string = memberEmail;
      const { data: profile } = await supabaseAdmin
        .from('member_profiles')
        .select('first_name, last_name')
        .eq('member_email', memberEmail)
        .maybeSingle();
      if (profile?.first_name) {
        memberName = `${profile.first_name} ${profile.last_name ?? ''}`.trim();
      }
      await sendPaymentEmails({
        resend, memberEmail, memberName, amountFormatted,
        paymentLabel, paymentDate, stripeRef: session.id,
        matched: true,
      });
    }
  }

  return new Response('ok');
}
