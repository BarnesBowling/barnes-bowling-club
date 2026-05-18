import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { amount, description, name, membershipNumber } = await req.json();

    if (!amount || typeof amount !== 'number' || amount < 100) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      description: description || 'Barnes Bowling Club payment',
      metadata: {
        member_name: name || '',
        membership_number: membershipNumber || '',
        description: description || '',
      },
    });

    return NextResponse.json({ client_secret: paymentIntent.client_secret });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
