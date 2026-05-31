import { NextRequest, NextResponse } from 'next/server';

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
    const { amount, description } = await req.json();

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum < 1) {
      return NextResponse.json({ error: 'Invalid amount (minimum £1)' }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: 'GBP', value: amountNum.toFixed(2) },
            description: description || 'Barnes Bowling Club payment',
          },
        ],
      }),
    });

    const order = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: order.message ?? 'Failed to create PayPal order' }, { status: 400 });
    }

    return NextResponse.json({ orderID: order.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
