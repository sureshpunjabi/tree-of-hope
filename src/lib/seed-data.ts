import { SupabaseClient } from "@supabase/supabase-js";
import { SANCTUARY_CONTENT } from "./sanctuary-content";

export interface Campaign {
  id?: string;
  slug: string;
  patient_name: string;
  story: string;
  status: "active" | "archived" | "draft";
  created_at?: string;
}

export interface Leaf {
  id?: string;
  campaign_id: string;
  message: string;
  author: string;
  created_at?: string;
}

export interface SanctuaryDay {
  id?: string;
  campaign_id: string;
  day_number: number;
  title: string;
  content_markdown: string;
  reflection_prompt: string;
  created_at?: string;
}

/**
 * Creates a demo campaign "Sarah's Journey"
 */
export async function createSeedCampaign(
  supabase: SupabaseClient
): Promise<Campaign> {
  const campaign = {
    slug: "sarah",
    patient_name: "Sarah",
    story: `Sarah's story is one of quiet courage. For the past year, she's navigated unexpected health challenges while holding together her family, her work, and her dreams. Some days are harder than others. Some days, getting out of bed feels like climbing a mountain. But Sarah keeps going.

This Sanctuary is her space. A place where she can breathe, rest, and remember that she's not alone. Her family, friends, and community are walking with her — even in the moments when it feels impossible.

Sarah's tree grows every day. Each leaf is a message from someone who sees her strength, even when she can't see it herself.

This is her journey. And she's brave for being here.`,
    status: "active" as const,
  };

  const { data, error } = await supabase
    .from("campaigns")
    .insert([campaign])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Creates 5 seed leaves for Sarah's campaign
 */
export async function createSeedLeaves(
  supabase: SupabaseClient,
  campaignId: string
): Promise<Leaf[]> {
  const leaves = [
    {
      campaign_id: campaignId,
      message:
        "You are stronger than you know. I see your courage every single day.",
      author: "Mom",
    },
    {
      campaign_id: campaignId,
      message:
        "You make us all better just by being you. We're here, always.",
      author: "Your best friend",
    },
    {
      campaign_id: campaignId,
      message:
        "On the days when you can't believe in yourself, we believe for you.",
      author: "Your sister",
    },
    {
      campaign_id: campaignId,
      message:
        "Every small step you take matters. You matter. I'm so proud of you.",
      author: "Dad",
    },
    {
      campaign_id: campaignId,
      message: "Your light is brighter than your struggle. Keep shining.",
      author: "Someone who loves you",
    },
  ];

  const { data, error } = await supabase
    .from("leaves")
    .insert(leaves)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Creates a bridge campaign linked to a fundraiser
 */
export async function createSeedBridgeCampaign(
  supabase: SupabaseClient
): Promise<Campaign> {
  const campaign = {
    slug: "mike",
    patient_name: "Mike",
    story: `Mike is a devoted father of two who's always been the strong one in the family. He's the person people call when they need help. But recently, life threw a curve ball that even he couldn't shoulder alone.

With the support of his community, Mike is learning that accepting help is not weakness — it's wisdom. His journey isn't just about recovery; it's about rediscovering that he's worthy of care, just as he's always cared for others.

This campaign exists to ease the practical burdens Mike and his family face, so they can focus on what truly matters: being together, healing together, and remembering that strength is found in community.`,
    status: "active" as const,
  };

  const { data, error } = await supabase
    .from("campaigns")
    .insert([campaign])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Creates 3 seed leaves for the bridge campaign with spec-defined messages
 */
export async function createSeedBridgeLeaves(
  supabase: SupabaseClient,
  campaignId: string
): Promise<Leaf[]> {
  const leaves = [
    {
      campaign_id: campaignId,
      message: "Thinking of you and sending strength.",
      author: "A friend",
    },
    {
      campaign_id: campaignId,
      message: "You're not alone in this. We're here.",
      author: "Your community",
    },
    {
      campaign_id: campaignId,
      message: "One day at a time. We'll walk with you.",
      author: "Tree of Hope",
    },
  ];

  const { data, error } = await supabase
    .from("leaves")
    .insert(leaves)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Seeds all 30 sanctuary days for a campaign
 */
export async function seedSanctuaryDays(
  supabase: SupabaseClient,
  campaignId: string
): Promise<SanctuaryDay[]> {
  const sanctuaryDays = SANCTUARY_CONTENT.map((day) => ({
    campaign_id: campaignId,
    day_number: day.day_number,
    title: day.title,
    content_markdown: day.content_markdown,
    reflection_prompt: day.reflection_prompt,
  }));

  const { data, error } = await supabase
    .from("sanctuary_days")
    .insert(sanctuaryDays)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Seeds complete demo data: creates Sarah's campaign with all 30 sanctuary days
 * and Mike's bridge campaign
 */
export async function seedAllDemoData(supabase: SupabaseClient): Promise<{
  sarahCampaign: Campaign;
  sarahLeaves: Leaf[];
  sarahSanctuaryDays: SanctuaryDay[];
  mikeCampaign: Campaign;
  mikeLeaves: Leaf[];
}> {
  // Create Sarah's campaign
  const sarahCampaign = await createSeedCampaign(supabase);

  // Create Sarah's leaves
  const sarahLeaves = await createSeedLeaves(supabase, sarahCampaign.id!);

  // Seed all 30 sanctuary days for Sarah
  const sarahSanctuaryDays = await seedSanctuaryDays(supabase, sarahCampaign.id!);

  // Create Mike's bridge campaign
  const mikeCampaign = await createSeedBridgeCampaign(supabase);

  // Create Mike's leaves
  const mikeLeaves = await createSeedBridgeLeaves(supabase, mikeCampaign.id!);

  return {
    sarahCampaign,
    sarahLeaves,
    sarahSanctuaryDays,
    mikeCampaign,
    mikeLeaves,
  };
}
