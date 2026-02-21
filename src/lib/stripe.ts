import Stripe from 'stripe'

// Only initialize Stripe on the server side
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  : (null as unknown as Stripe)

// Re-export product config for backward compatibility
export { STRIPE_PRODUCTS, type JoiningGiftTier, type MonthlyTier } from './stripe-products'
