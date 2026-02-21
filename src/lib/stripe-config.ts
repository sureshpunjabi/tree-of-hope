// Stripe configuration detection
// Returns true only if real (non-placeholder) Stripe keys are configured

const PLACEHOLDER_PATTERNS = ['placeholder', 'sk_test_placeholder', 'pk_test_placeholder', 'whsec_placeholder']

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true
  return PLACEHOLDER_PATTERNS.some(p => value.includes(p))
}

export const IS_STRIPE_CONFIGURED =
  !isPlaceholder(process.env.STRIPE_SECRET_KEY) &&
  !isPlaceholder(process.env.STRIPE_PRICE_NURTURE) &&
  !isPlaceholder(process.env.STRIPE_PRICE_SUSTAIN) &&
  !isPlaceholder(process.env.STRIPE_PRICE_FLOURISH)

export const STRIPE_DEMO_MESSAGE =
  'Payments are being configured. In the meantime, your leaf and your presence matter most. Contact hello@treeofhope.com to support directly.'
