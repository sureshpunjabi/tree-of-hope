// Stripe product/price configuration
// Easter Minimum: Exactly 2 products. Recurring only. No one-off payments. Ever.
// Source: Locked Brief (Rules of One) + Andreas Debrief (Confirmed Decisions)
export const STRIPE_PRODUCTS = {
  // Plant a Leaf — $35/month (Giver)
  leaf: {
    name: 'Plant a Leaf',
    amount: 3500, // $35.00/month
    priceId: process.env.STRIPE_PRICE_LEAF || process.env.STRIPE_PRICE_FLOURISH || '',
    description: 'Show up for someone you love. $35/month builds their Sanctuary.',
  },
  // Fund a Tree — $500/month (Sponsor)
  sponsor: {
    name: 'Fund a Tree',
    amount: 50000, // $500.00/month
    priceId: process.env.STRIPE_PRICE_SPONSOR || '',
    description: 'Sponsor the entire Tree and its Sanctuary for the family.',
  },
} as const

export type CommitmentType = keyof typeof STRIPE_PRODUCTS

// Backward compatibility — map old tier names to new structure
export const LEGACY_TIER_MAP: Record<string, keyof typeof STRIPE_PRODUCTS> = {
  nurture: 'leaf',
  sustain: 'leaf',
  flourish: 'leaf',
}

// No joining gifts. No one-off payments. Recurring only.
// "No one-off gifts ever accepted." — Locked Brief, Rule of One

// Legacy type aliases — keep Bridge pages compiling until Phase 2 rewrite
export type MonthlyTier = CommitmentType | 'nurture' | 'sustain' | 'flourish'
export type JoiningGiftTier = string
