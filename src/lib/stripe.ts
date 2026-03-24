import Stripe from 'stripe'

// Only initialize Stripe on the server side
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  : (null as unknown as Stripe)

// Re-export product config
export { STRIPE_PRODUCTS, type CommitmentType } from './stripe-products'
