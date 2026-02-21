/**
 * TypeScript type definitions for Tree of Hope application
 * Matches the database schema and API responses
 */

// Authentication & Users
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Campaigns & Fundraising
export interface Campaign {
  id: string
  user_id: string
  title: string
  description?: string
  story?: string
  target_cents: number
  current_cents: number
  status: 'active' | 'completed' | 'paused' | 'archived'
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface Leaf {
  id: string
  campaign_id: string
  contributor_id: string
  amount_cents: number
  leaf_type: 'seedling' | 'sprout' | 'growing' | 'flourishing' | 'golden'
  message?: string
  is_anonymous: boolean
  created_at: string
  updated_at: string
}

export interface Commitment {
  id: string
  campaign_id: string
  contributor_id: string
  amount_cents: number
  frequency: 'once' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  start_date: string
  end_date?: string
  next_charge_date?: string
  created_at: string
  updated_at: string
}

// Membership & Community
export interface Membership {
  id: string
  user_id: string
  tier: 'free' | 'supporter' | 'guardian' | 'steward'
  status: 'active' | 'paused' | 'cancelled'
  start_date: string
  end_date?: string
  auto_renew: boolean
  created_at: string
  updated_at: string
}

// Sanctuary Features
export interface SanctuaryDay {
  id: string
  user_id: string
  date: string
  mood_score?: number
  energy_score?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: string
  tags?: string[]
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  user_id: string
  title: string
  description?: string
  date_time: string
  duration_minutes?: number
  location?: string
  provider?: string
  appointment_type: 'therapy' | 'medical' | 'wellness' | 'other'
  reminder_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Medication {
  id: string
  user_id: string
  name: string
  dosage?: string
  frequency?: string
  reason?: string
  start_date: string
  end_date?: string
  notes?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface SymptomLog {
  id: string
  user_id: string
  symptom: string
  severity: 1 | 2 | 3 | 4 | 5
  duration_minutes?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
  category?: string
  created_at: string
  updated_at: string
}

// Analytics & Events
export interface AnalyticsEvent {
  id: string
  user_id?: string
  event_type: string
  event_data?: Record<string, unknown>
  page?: string
  referrer?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

// Bridge Program
export interface BridgeCampaign {
  id: string
  title: string
  description?: string
  target_participants: number
  current_participants: number
  status: 'planning' | 'active' | 'completed' | 'archived'
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export interface BridgeOutreach {
  id: string
  bridge_campaign_id: string
  outreach_type: 'email' | 'sms' | 'notification' | 'call'
  recipient_id?: string
  recipient_email?: string
  subject?: string
  message: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  sent_at?: string
  created_at: string
  updated_at: string
}

// Email Tracking
export interface EmailEvent {
  id: string
  outreach_id: string
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained'
  timestamp: string
  details?: Record<string, unknown>
  created_at: string
}

// Audit Trail
export interface AuditEvent {
  id: string
  user_id?: string
  entity_type: string
  entity_id: string
  action: 'create' | 'update' | 'delete' | 'view'
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Helper type for database timestamps
export type TimestampFields = {
  created_at: string
  updated_at: string
}
