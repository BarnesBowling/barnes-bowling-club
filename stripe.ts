import Stripe from 'stripe';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' as any });
