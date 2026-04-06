import Stripe from 'stripe';

// Stripe validates keys at request time, not instantiation — safe to init at module level.
// We pass an empty string fallback so the build doesn't throw; requests will fail
// with a clear auth error if the key is missing at runtime.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-03-25.dahlia',
});

export default stripe;
