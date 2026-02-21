-- Tree of Hope — Complete Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ENUMS
create type user_role as enum ('supporter', 'patient', 'caregiver', 'admin');
create type campaign_status as enum ('draft', 'active', 'paused', 'completed');
create type commitment_status as enum ('active', 'paused', 'cancelled', 'past_due');
create type membership_role as enum ('supporter', 'patient', 'caregiver');
create type pause_reason as enum ('hardship', 'personal', 'other');
create type tool_status as enum ('active', 'evolving', 'coming_soon');
create type bridge_status as enum ('scouted', 'pre_built', 'active', 'claimed', 'declined', 'expired');

-- USERS
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  display_name text,
  avatar_url text,
  role user_role default 'supporter',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CAMPAIGNS
create table public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  patient_name text not null,
  title text not null,
  story text,
  hero_image_url text,
  status campaign_status default 'draft',
  created_by uuid references public.users(id),
  sanctuary_claimed boolean default false,
  sanctuary_claimed_by uuid references public.users(id),
  sanctuary_claimed_at timestamptz,
  sanctuary_start_date date,
  leaf_count integer default 0,
  supporter_count integer default 0,
  monthly_total_cents integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MEMBERSHIPS
create table public.memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  role membership_role not null,
  joined_at timestamptz default now(),
  unique(user_id, campaign_id)
);

-- LEAVES
create table public.leaves (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  author_id uuid references public.users(id),
  author_name text not null,
  message text not null,
  is_public boolean default true,
  is_hidden boolean default false,
  hidden_by uuid references public.users(id),
  position_x float,
  position_y float,
  created_at timestamptz default now()
);

-- COMMITMENTS
create table public.commitments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  stripe_subscription_id text,
  stripe_customer_id text,
  joining_gift_cents integer default 0,
  monthly_amount_cents integer not null,
  status commitment_status default 'active',
  paused_at timestamptz,
  pause_reason pause_reason,
  pause_note text,
  resumes_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, campaign_id)
);

-- SANCTUARY DAYS
create table public.sanctuary_days (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  day_number integer not null check (day_number between 1 and 30),
  title text not null,
  content_markdown text not null,
  reflection_prompt text,
  is_unlocked boolean default false,
  unlocked_at timestamptz,
  unique(campaign_id, day_number)
);

-- JOURNAL ENTRIES
create table public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  sanctuary_day integer,
  title text,
  content text not null,
  mood_score integer check (mood_score between 1 and 5),
  is_private boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- APPOINTMENTS
create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  provider text,
  location text,
  notes text,
  scheduled_at timestamptz not null,
  reminder_sent boolean default false,
  created_at timestamptz default now()
);

-- MEDICATIONS
create table public.medications (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  dosage text,
  frequency text,
  time_of_day text,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- SYMPTOM LOGS
create table public.symptom_logs (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  symptom text not null,
  severity integer check (severity between 1 and 10),
  notes text,
  logged_at timestamptz default now()
);

-- TASKS
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  is_completed boolean default false,
  completed_at timestamptz,
  due_date date,
  created_at timestamptz default now()
);

-- EMAIL EVENTS
create table public.email_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  email_type text not null,
  subject text,
  sent_at timestamptz default now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  metadata jsonb default '{}'
);

-- AUDIT EVENTS
create table public.audit_events (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.users(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb default '{}',
  ip_address inet,
  created_at timestamptz default now()
);

-- ANALYTICS EVENTS
create table public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_name text not null,
  campaign_id uuid references public.campaigns(id),
  user_id uuid references public.users(id),
  session_id text,
  properties jsonb default '{}',
  created_at timestamptz default now()
);

-- BRIDGE CAMPAIGNS
create table public.bridge_campaigns (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  gofundme_url text not null,
  gofundme_title text,
  gofundme_organiser_name text,
  gofundme_raised_cents integer,
  gofundme_goal_cents integer,
  gofundme_donor_count integer,
  gofundme_created_at timestamptz,
  gofundme_category text,
  status bridge_status default 'scouted',
  scouted_at timestamptz default now(),
  pre_built_at timestamptz,
  activated_at timestamptz,
  claimed_by uuid references public.users(id),
  claimed_at timestamptz,
  organiser_email text,
  organiser_contacted_at timestamptz,
  organiser_response text,
  outreach_attempts integer default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BRIDGE OUTREACH LOG
create table public.bridge_outreach (
  id uuid primary key default uuid_generate_v4(),
  bridge_id uuid references public.bridge_campaigns(id) on delete cascade,
  channel text not null,
  message_summary text,
  sent_at timestamptz default now(),
  response_received boolean default false,
  response_at timestamptz,
  response_type text
);

-- KEY INDEXES
create index idx_campaigns_slug on public.campaigns(slug);
create index idx_campaigns_status on public.campaigns(status);
create index idx_leaves_campaign on public.leaves(campaign_id);
create index idx_commitments_user on public.commitments(user_id);
create index idx_commitments_campaign on public.commitments(campaign_id);
create index idx_commitments_stripe on public.commitments(stripe_subscription_id);
create index idx_memberships_user on public.memberships(user_id);
create index idx_memberships_campaign on public.memberships(campaign_id);
create index idx_journal_campaign on public.journal_entries(campaign_id);
create index idx_sanctuary_days_campaign on public.sanctuary_days(campaign_id);
create index idx_analytics_event on public.analytics_events(event_name);
create index idx_analytics_campaign on public.analytics_events(campaign_id);
create index idx_audit_action on public.audit_events(action);
create index idx_bridge_status on public.bridge_campaigns(status);
create index idx_bridge_gofundme on public.bridge_campaigns(gofundme_url);
create index idx_bridge_campaign on public.bridge_campaigns(campaign_id);
create index idx_outreach_bridge on public.bridge_outreach(bridge_id);

-- ROW LEVEL SECURITY
alter table public.users enable row level security;
alter table public.campaigns enable row level security;
alter table public.memberships enable row level security;
alter table public.leaves enable row level security;
alter table public.commitments enable row level security;
alter table public.sanctuary_days enable row level security;
alter table public.journal_entries enable row level security;
alter table public.appointments enable row level security;
alter table public.medications enable row level security;
alter table public.symptom_logs enable row level security;
alter table public.tasks enable row level security;

-- PUBLIC: anyone can view active campaigns
create policy "Public campaigns are viewable by everyone"
  on public.campaigns for select
  using (status = 'active');

-- PUBLIC: anyone can view public, non-hidden leaves
create policy "Public leaves are viewable"
  on public.leaves for select
  using (is_public = true and is_hidden = false);

-- AUTHENTICATED: users can read their own data
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- SANCTUARY: only patient/caregiver + admin can access
create policy "Sanctuary access for patient/caregiver"
  on public.journal_entries for all
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.memberships
      where campaign_id = journal_entries.campaign_id
      and user_id = auth.uid()
      and role in ('patient', 'caregiver')
    )
  );

-- Appointments: patient/caregiver access
create policy "Appointments access"
  on public.appointments for all
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.memberships
      where campaign_id = appointments.campaign_id
      and user_id = auth.uid()
      and role in ('patient', 'caregiver')
    )
  );

-- Medications: patient/caregiver access
create policy "Medications access"
  on public.medications for all
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.memberships
      where campaign_id = medications.campaign_id
      and user_id = auth.uid()
      and role in ('patient', 'caregiver')
    )
  );

-- Symptom logs: patient/caregiver access
create policy "Symptom logs access"
  on public.symptom_logs for all
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.memberships
      where campaign_id = symptom_logs.campaign_id
      and user_id = auth.uid()
      and role in ('patient', 'caregiver')
    )
  );

-- Tasks: patient/caregiver access
create policy "Tasks access"
  on public.tasks for all
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.memberships
      where campaign_id = tasks.campaign_id
      and user_id = auth.uid()
      and role in ('patient', 'caregiver')
    )
  );

-- Allow service role to bypass RLS (for API routes)
-- Note: Supabase service role key bypasses RLS by default
