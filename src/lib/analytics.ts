import { getSupabase } from './supabase'

export type AnalyticsEvent =
  // Campaign funnel
  | 'campaign_view'
  | 'leaf_started'
  | 'leaf_submitted'
  | 'commitment_viewed'
  | 'commitment_paused'
  | 'tier_selected'
  | 'checkout_started'
  | 'checkout_succeeded'
  | 'checkout_abandoned'
  // Auth funnel
  | 'magic_link_sent'
  | 'magic_link_sent_failed'
  | 'magic_link_opened'
  | 'sign_in_success'
  | 'sign_in_failed'
  | 'missing_token_or_type'
  // Sanctuary events
  | 'sanctuary_claimed'
  | 'sanctuary_day_viewed'
  | 'journal_entry_created'
  | 'tool_used'
  | 'sanctuary'
  | 'journal'
  | 'appointments'
  | 'medications'
  | 'symptoms'
  | 'tasks'
  | 'tools_hub'
  // Bridge events
  | 'bridge_landing_view'
  | 'bridge_gofundme_clicked'
  | 'bridge_compare_viewed'
  | 'bridge_activate_started'
  | 'bridge_activate_submitted'
  | 'bridge_activate_form_focused'
  | 'bridge_activated'
  | 'bridge_checkout_started'
  | 'bridge_checkout_succeeded'
  | 'bridge_organiser_viewed'
  | 'bridge_organiser_claimed'
  | 'bridge_outreach_sent'
  | 'bridge_pre_built'
  | 'bridge_scouted'

export async function trackEvent(
  eventName: AnalyticsEvent,
  properties: Record<string, unknown> = {},
  campaignId?: string,
  userId?: string,
) {
  try {
    const sessionId = typeof window !== 'undefined'
      ? sessionStorage.getItem('toh_session_id') || crypto.randomUUID()
      : undefined

    if (typeof window !== 'undefined' && sessionId) {
      sessionStorage.setItem('toh_session_id', sessionId)
    }

    const supabase = getSupabase()
    if (!supabase) return

    await supabase.from('analytics_events').insert({
      event_name: eventName,
      campaign_id: campaignId || null,
      user_id: userId || null,
      session_id: sessionId || null,
      properties,
    })
  } catch (error) {
    console.error('Analytics tracking error:', error)
  }
}

// Server-side tracking (uses service role)
export async function trackServerEvent(
  eventName: AnalyticsEvent,
  properties: Record<string, unknown> = {},
  campaignId?: string,
  userId?: string,
) {
  try {
    const { getServiceSupabase } = await import('./supabase')
    const adminClient = getServiceSupabase()

    await adminClient.from('analytics_events').insert({
      event_name: eventName,
      campaign_id: campaignId || null,
      user_id: userId || null,
      session_id: null,
      properties,
    })
  } catch (error) {
    console.error('Server analytics tracking error:', error)
  }
}
