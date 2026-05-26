// netlify/functions/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const attempts = {}; // ⚠️ use Upstash Redis in production (see below)

exports.handler = async (event) => {
  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'];
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 3;

  // Rate limiting
  attempts[ip] = (attempts[ip] || []).filter(t => now - t < windowMs);
  attempts[ip].push(now);

  if (attempts[ip].length > maxAttempts) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Too many attempts. Try again later.' })
    };
  }

  try {
    const { amount } = JSON.parse(event.body);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    };
  }
};