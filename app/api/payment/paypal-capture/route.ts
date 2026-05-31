import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

    // Insert ledger credit if we have a member email to look up
    if (memberEmail && amount) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', memberEmail)
        .single();

      if (profile?.id) {
        await supabaseAdmin.from('member_ledger').insert({
          member_id: profile.id,
          date: new Date().toISOString().split('T')[0],
          description: description || 'PayPal payment',
          category: 'membership_fee',
          amount: parseFloat(amount),
          type: 'credit',
          metadata: { paypal_order_id: orderID, provider: 'paypal' },
          created_by: 'paypal_payment',
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
