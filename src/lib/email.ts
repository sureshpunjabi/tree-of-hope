// Loops.so email integration for Tree of Hope
// Easter Minimum: E0 receipt email on checkout, then 90-day drip sequence
// "90 days of emails IS the product." — Andreas Debrief

const LOOPS_API_KEY = process.env.LOOPS_API_KEY || ''
const LOOPS_BASE_URL = 'https://app.loops.so/api/v1'

interface ReceiptEmailParams {
  email: string
  name: string
  patient_name: string
  campaign_slug: string
  amount_cents: number
  commitment_type: string
}

/**
 * Send E0 receipt/confirmation email via Loops.so transactional endpoint
 */
export async function sendReceiptEmail(params: ReceiptEmailParams): Promise<void> {
  if (!LOOPS_API_KEY) {
    console.warn('Loops API key not configured — skipping receipt email')
    return
  }

  try {
    const response = await fetch(`${LOOPS_BASE_URL}/transactional`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify({
        transactionalId: process.env.LOOPS_RECEIPT_TEMPLATE_ID || '',
        email: params.email,
        dataVariables: {
          name: params.name,
          patientName: params.patient_name,
          campaignSlug: params.campaign_slug,
          amountFormatted: `$${(params.amount_cents / 100).toFixed(0)}`,
          commitmentType: params.commitment_type === 'sponsor' ? 'Fund a Tree' : 'Plant a Leaf',
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Loops receipt email failed:', response.status, errorText)
    }
  } catch (err) {
    // Email should never break the main flow
    console.error('Loops receipt email error:', err)
  }
}

/**
 * Add or update a contact in Loops.so and trigger the 90-day drip event
 */
export async function triggerLoopsEvent(
  email: string,
  eventName: string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  if (!LOOPS_API_KEY) {
    console.warn('Loops API key not configured — skipping event trigger')
    return
  }

  try {
    // Upsert contact
    await fetch(`${LOOPS_BASE_URL}/contacts/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        ...properties,
      }),
    })

    // Fire event to trigger drip sequence
    await fetch(`${LOOPS_BASE_URL}/events/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        eventName,
        eventProperties: properties,
      }),
    })
  } catch (err) {
    console.error('Loops event trigger error:', err)
  }
}
