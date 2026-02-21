// Stripe product/price configuration
// Separated from stripe.ts to allow client-side imports without Stripe server SDK
export const STRIPE_PRODUCTS = {
  joiningGifts: {
    seedling: {
      name: 'Joining Gift — Seedling',
      amount: 999, // $9.99
      priceId: process.env.STRIPE_PRICE_SEEDLING || '',
    },
    sapling: {
      name: 'Joining Gift — Sapling',
      amount: 2499, // $24.99
      priceId: process.env.STRIPE_PRICE_SAPLING || '',
    },
    mightyOak: {
      name: 'Joining Gift — Mighty Oak',
      amount: 9900, // $99.00
      priceId: process.env.STRIPE_PRICE_MIGHTY_OAK || '',
    },
  },
  monthlyTiers: {
    nurture: {
      name: 'Monthly Commitment — Nurture',
      amount: 900, // $9/mo
      priceId: process.env.STRIPE_PRICE_NURTURE || '',
    },
    sustain: {
      name: 'Monthly Commitment — Sustain',
      amount: 1900, // $19/mo
      priceId: process.env.STRIPE_PRICE_SUSTAIN || '',
    },
    flourish: {
      name: 'Monthly Commitment — Flourish',
      amount: 3500, // $35/mo
      priceId: process.env.STRIPE_PRICE_FLOURISH || '',
    },
  },
} as const

export type JoiningGiftTier = keyof typeof STRIPE_PRODUCTS.joiningGifts
export type MonthlyTier = keyof typeof STRIPE_PRODUCTS.monthlyTiers
