import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const fixedSchema = z.object({
  type: z.literal('fixed').optional(),
  membership: z.enum(['full', 'social', 'junior', 'guest_fee']),
  priceEnv: z.enum([
    'STRIPE_FULL_MEMBERSHIP_PRICE_ID',
    'STRIPE_SOCIAL_MEMBERSHIP_PRICE_ID',
    'STRIPE_JUNIOR_MEMBERSHIP_PRICE_ID',
    'STRIPE_GUEST_FEE_PRICE_ID',
  ]),
  successPath: z.string().optional(),
  cancelPath: z.string().optional(),
});

const outstandingSchema = z.object({
  type: z.literal('outstanding_balance'),
  amount: z.number().positive(),
  memberEmail: z.string().email(),
  successPath: z.string().optional(),
  cancelPath: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  // ── Outstanding balance (dynamic amount) ──────────────────────────────────
  if (body.type === 'outstanding_balance') {
    const parsed = outstandingSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: 'Invalid outstanding balance request' }, { status: 400 });

    const { amount, memberEmail, successPath, cancelPath } = parsed.data;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'gbp',
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: 'Outstanding Balance — Barnes Bowling Club',
            description: 'Settlement of outstanding fees',
          },
        },
        quantity: 1,
      }],
      success_url: `${origin}${successPath ?? '/members/payment/success'}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelPath ?? '/members/account'}`,
      customer_email: memberEmail,
      metadata: {
        payment_type: 'outstanding_balance',
        member_email: memberEmail,
        amount_gbp: amount.toFixed(2),
      },
    });

    return Response.json({ url: session.url });
  }

  // ── Fixed-price products (subscription / guest fee) ───────────────────────
  const parsed = fixedSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Invalid checkout request' }, { status: 400 });

  const price = process.env[parsed.data.priceEnv];
  if (!price) return Response.json({ error: 'Stripe price ID is not configured' }, { status: 500 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const successPath = parsed.data.successPath ?? '/success';
  const cancelPath  = parsed.data.cancelPath  ?? '/membership';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${cancelPath}`,
    customer_email: user?.email,
    metadata: {
      user_id: user?.id || '',
      membership: parsed.data.membership,
      payment_type: parsed.data.membership,
    },
  });

  return Response.json({ url: session.url });
}
