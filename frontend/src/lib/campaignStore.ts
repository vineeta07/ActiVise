import {
  campaigns as seedCampaigns,
  corporateMilestones,
  type Campaign,
  type CampaignTag,
  type CampaignUrgency,
} from "@/data/platformData";
import { supabase } from "@/integrations/supabase/client";

type ReportCampaignInput = {
  title: string;
  summary: string;
  locationName: string;
  lat: number;
  lng: number;
  urgency: CampaignUrgency;
  impactType: Campaign["impactType"];
  targetVolunteers: number;
};

type StoredRegistration = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  registeredAt: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  channel?: "in-app" | "whatsapp";
};

const COMPANY_KEY = "greenorbit-tech";
const USER_KEY = "demo-user";
const DEFAULT_PHONE = "+919999999999";

function toImpactType(category: string): Campaign["impactType"] {
  if (category === "tree_plantation") return "Trees";
  if (category === "water_body" || category === "priority_alpha") return "Water";
  if (category === "road_repair" || category === "public_health") return "Air";
  return "Waste";
}

function toTags(urgency: CampaignUrgency, isVerified: boolean): CampaignTag[] {
  const tags: CampaignTag[] = [];
  if (urgency === "critical" || urgency === "high") tags.push("Urgent");
  if (isVerified) tags.push("Verified");
  tags.push("Community-driven");
  return tags;
}

function timeAgo(value: string): string {
  const elapsed = Date.now() - new Date(value).getTime();
  const mins = Math.max(0, Math.floor(elapsed / 60000));
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  const { data: missions, error } = await supabase
    .from("missions")
    .select("id,title,description,location_name,latitude,longitude,urgency,category,volunteer_count,status,fund_goal")
    .order("created_at", { ascending: false });

  if (error || !missions) {
    return seedCampaigns;
  }

  const missionIds = missions.map((mission) => mission.id);
  const { data: verifiedProofs } = missionIds.length
    ? await supabase
        .from("impact_proofs")
        .select("mission_id")
        .eq("verification_status", "verified")
        .in("mission_id", missionIds)
    : { data: [] as Array<{ mission_id: string | null }> };

  const verifiedMissionIds = new Set((verifiedProofs || []).map((row) => row.mission_id).filter(Boolean));

  return missions.map((mission) => {
    const urgency = (mission.urgency || "medium") as CampaignUrgency;
    const isVerified = verifiedMissionIds.has(mission.id) || mission.status === "verified";
    const volunteers = mission.volunteer_count || 0;
    const targetVolunteers = Math.max(20, mission.fund_goal ? Math.round(mission.fund_goal / 1000) : volunteers + 25);
    return {
      id: mission.id,
      title: mission.title,
      summary: mission.description || "Community-submitted environmental action.",
      locationName: mission.location_name || "Location pending",
      lat: mission.latitude,
      lng: mission.longitude,
      urgency,
      impactType: toImpactType(mission.category),
      tags: toTags(urgency, isVerified),
      volunteers,
      targetVolunteers,
      co2PotentialKg: Math.max(300, targetVolunteers * 45),
      verified: isVerified,
    };
  });
}

export async function getHeatmapData() {
  const urgencyWeight: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const { data } = await supabase
    .from('missions')
    .select('latitude, longitude, urgency, fund_goal')
    .order('created_at', { ascending: false });
  
  if (!data) return [];

  return data.map(m => ({
    lat: m.latitude,
    lng: m.longitude,
    intensity: urgencyWeight[m.urgency] * (m.fund_goal || 1000)
  }));
}

export async function addReportedCampaign(input: ReportCampaignInput): Promise<{ synced: boolean; message?: string }> {
  const payload = {
    title: input.title,
    description: input.summary,
    category: input.impactType === "Trees" ? "tree_plantation" : input.impactType === "Water" ? "water_body" : input.impactType === "Air" ? "road_repair" : "waste_cleanup",
    urgency: input.urgency,
    latitude: input.lat,
    longitude: input.lng,
    location_name: input.locationName,
    fund_goal: Math.max(0, input.targetVolunteers * 1000),
    volunteer_count: 0,
    status: "active",
  };

  const { error } = await supabase.from("missions").insert(payload);

  if (error) {
    return { synced: false, message: error.message };
  }

  await supabase.from("app_notifications").insert({
    title: "New campaign report submitted",
    message: `${input.title} was submitted and listed for campaign discovery.`,
    channel: "in-app",
    priority: input.urgency === "critical" || input.urgency === "high" ? "high" : "normal",
    campaign_id: null,
  });

  return { synced: true };
}

export async function getCampaignRegistrations(): Promise<StoredRegistration[]> {
  const { data } = await supabase
    .from("campaign_registrations")
    .select("id,campaign_id,campaign_title,created_at")
    .eq("user_key", USER_KEY)
    .order("created_at", { ascending: false });

  return (data || []).map((row: { id: string; campaign_id: string; campaign_title: string; created_at: string }) => ({
    id: row.id,
    campaignId: row.campaign_id,
    campaignTitle: row.campaign_title,
    registeredAt: row.created_at,
  }));
}

async function sendWhatsAppNotification(phone: string, message: string) {
  await supabase.functions.invoke("send-whatsapp", {
    body: {
      phone,
      message,
    },
  });
}

export async function registerForCampaign(campaignId: string, campaignTitle: string): Promise<StoredRegistration[]> {
  const { data: existing } = await supabase
    .from("campaign_registrations")
    .select("id")
    .eq("campaign_id", campaignId)
    .eq("user_key", USER_KEY)
    .maybeSingle();

  if (!existing) {
    await supabase.from("campaign_registrations").insert({
      campaign_id: campaignId,
      campaign_title: campaignTitle,
      user_key: USER_KEY,
      phone: DEFAULT_PHONE,
      whatsapp_opt_in: true,
      status: "registered",
    });

    const registrationMessage = `You registered for ${campaignTitle}. WhatsApp updates are enabled.`;

    await supabase.from("app_notifications").insert([
      {
        title: "Campaign registration confirmed",
        message: registrationMessage,
        channel: "in-app",
        campaign_id: campaignId,
        priority: "normal",
      },
      {
        title: "Campaign registration WhatsApp",
        message: registrationMessage,
        channel: "whatsapp",
        user_phone: DEFAULT_PHONE,
        campaign_id: campaignId,
        priority: "normal",
      },
    ]);

    await sendWhatsAppNotification(DEFAULT_PHONE, registrationMessage);
  }

  const { data: mission } = await supabase.from("missions").select("urgency").eq("id", campaignId).maybeSingle();
  const { data: proof } = await supabase
    .from("impact_proofs")
    .select("id")
    .eq("mission_id", campaignId)
    .eq("verification_status", "verified")
    .limit(1)
    .maybeSingle();

  const highPriority = mission && (mission.urgency === "critical" || mission.urgency === "high") && !!proof;

  if (highPriority) {
    const priorityMessage = `${campaignTitle} is AI-verified and high-priority. Immediate action recommended.`;

    await supabase.from("app_notifications").insert([
      {
        title: "AI high-priority campaign alert",
        message: priorityMessage,
        channel: "in-app",
        campaign_id: campaignId,
        priority: "high",
      },
      {
        title: "AI high-priority WhatsApp alert",
        message: priorityMessage,
        channel: "whatsapp",
        user_phone: DEFAULT_PHONE,
        campaign_id: campaignId,
        priority: "high",
      },
    ]);

    await sendWhatsAppNotification(DEFAULT_PHONE, priorityMessage);
  }

  return getCampaignRegistrations();
}

export async function getCompanyCompletedTaskCount(): Promise<number> {
  const { data } = await supabase
    .from("company_task_progress")
    .select("completed_tasks")
    .eq("company_key", COMPANY_KEY)
    .maybeSingle();

  if (!data) {
    await supabase.from("company_task_progress").upsert(
      {
        company_key: COMPANY_KEY,
        company_name: "GreenOrbit Technologies",
        completed_tasks: 0,
      },
      { onConflict: "company_key" }
    );
    return 0;
  }

  const value = Number((data as { completed_tasks: number }).completed_tasks || 0);
  return Math.max(0, Math.min(value, corporateMilestones.length));
}

export async function completeNextCompanyTask(): Promise<number> {
  const current = await getCompanyCompletedTaskCount();
  const nextValue = Math.min(current + 1, corporateMilestones.length);

  await supabase.from("company_task_progress").upsert(
    {
      company_key: COMPANY_KEY,
      company_name: "GreenOrbit Technologies",
      completed_tasks: nextValue,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "company_key" }
  );

  await supabase.from("app_notifications").insert({
    title: "Company milestone completed",
    message: `GreenOrbit completed milestone ${nextValue}/${corporateMilestones.length}. ESG readiness updated.`,
    channel: "in-app",
    priority: "normal",
  });

  return nextValue;
}

export async function getUnifiedNotifications(): Promise<NotificationItem[]> {
  const { data } = await supabase
    .from("app_notifications")
    .select("id,title,message,channel,created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((row: { id: string; title: string; message: string; channel: "in-app" | "whatsapp"; created_at: string }) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    channel: row.channel,
    time: timeAgo(row.created_at),
  }));
}

export async function anchorCertificate(certificate: {
  certificateId: string;
  recipientName: string;
  missionTitle: string;
  contentHash: string;
}) {
  const chainReference = `ANCHOR-${certificate.contentHash.slice(0, 16).toUpperCase()}`;

  const { error } = await supabase.from("certificate_anchors").insert({
    certificate_id: certificate.certificateId,
    recipient_name: certificate.recipientName,
    mission_title: certificate.missionTitle,
    content_hash: certificate.contentHash,
    chain_reference: chainReference,
    anchor_status: "anchored",
  });

  if (error) {
    return { ok: false, chainReference: "Pending" };
  }

  return { ok: true, chainReference };
}
