import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, MapPin, Rocket, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import MissionMap from "@/components/MissionMap";
import { impactMetrics, type Campaign } from "@/data/platformData";
import { getAllCampaigns } from "@/lib/campaignStore";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState(impactMetrics);

  useEffect(() => {
    const load = async () => {
      const campaignsFromDb = await getAllCampaigns();
      setCampaignList(campaignsFromDb);

      const [missionResult, volunteerResult, proofResult] = await Promise.all([
        supabase.from("missions").select("id", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("volunteers").select("id", { count: "exact", head: true }),
        supabase.from("impact_proofs").select("co2_offset_kg"),
      ]);

      const co2SavedKg = (proofResult.data || []).reduce((sum, row) => sum + (row.co2_offset_kg || 0), 0);
      setMetrics({
        co2SavedKg: Math.round(co2SavedKg || impactMetrics.co2SavedKg),
        campaignsCompleted: missionResult.count || impactMetrics.campaignsCompleted,
        volunteersActive: volunteerResult.count || impactMetrics.volunteersActive,
        reportsToday: campaignsFromDb.length,
      });
    };

    void load();
  }, []);

  const featuredCampaigns = useMemo(() => {
    const source = campaignList.length ? campaignList : [];
    return source.filter((campaign) => campaign.verified).slice(0, 3);
  }, [campaignList]);

  const mapPreviewPoints = campaignList.length ? campaignList.slice(0, 4) : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <section className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-6 md:p-10 overflow-hidden relative">
        <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered civic impact command center
            </span>
            <h1 className="mt-4 text-3xl md:text-5xl font-heading font-bold text-foreground leading-tight">
              Turning citizens into climate action contributors.
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl">
              Report real-world environmental issues, join verified campaigns, and prove impact with an AI trust layer trusted by communities and corporate ESG teams.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/report"
                className="h-11 px-5 inline-flex items-center rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                Report an Issue
              </Link>
              <Link
                to="/campaigns"
                className="h-11 px-5 inline-flex items-center rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:border-primary/40"
              >
                Join a Campaign
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-background/90 p-3">
                <p className="text-[11px] text-muted-foreground">CO2 Saved</p>
                <p className="text-lg font-heading text-foreground">{metrics.co2SavedKg.toLocaleString()} kg</p>
              </div>
              <div className="rounded-xl border border-border bg-background/90 p-3">
                <p className="text-[11px] text-muted-foreground">Campaigns Completed</p>
                <p className="text-lg font-heading text-foreground">{metrics.campaignsCompleted}</p>
              </div>
              <div className="rounded-xl border border-border bg-background/90 p-3">
                <p className="text-[11px] text-muted-foreground">Volunteers Active</p>
                <p className="text-lg font-heading text-foreground">{metrics.volunteersActive.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-border bg-background/90 p-3">
                <p className="text-[11px] text-muted-foreground">Reports Today</p>
                <p className="text-lg font-heading text-foreground">{metrics.reportsToday}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/80 p-3">
            <p className="text-xs text-muted-foreground mb-2">Live map preview: nearby environmental issues</p>
            <MissionMap points={mapPreviewPoints} zoom={12} height={280} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg text-foreground">Featured Verified High-Priority Campaigns</h2>
          <Link to="/campaigns" className="text-xs text-primary inline-flex items-center gap-1">
            View all campaigns <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {featuredCampaigns.map((campaign) => {
            const progress = Math.round((campaign.volunteers / campaign.targetVolunteers) * 100);
            return (
              <article key={campaign.id} className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary font-heading">Verified</span>
                  <span className="text-[10px] px-2 py-1 rounded-md bg-secondary text-secondary-foreground">{campaign.urgency}</span>
                </div>
                <h3 className="mt-3 text-base font-heading text-foreground">{campaign.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{campaign.summary}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {campaign.locationName}
                </div>
                <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {campaign.volunteers}/{campaign.targetVolunteers} volunteers committed
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/80 backdrop-blur p-6">
        <h2 className="font-heading text-lg text-foreground">Smooth Journey from Concern to Verified Change</h2>
        <div className="mt-4 grid md:grid-cols-4 gap-3">
          {[
            { title: "Report", desc: "Capture issue evidence with geotagged photos.", icon: Rocket },
            { title: "Mobilize", desc: "Nearby volunteers join verified campaigns.", icon: Users },
            { title: "Verify", desc: "AI trust engine validates before/after impact.", icon: ShieldCheck },
            { title: "Celebrate", desc: "Earn certificates and ESG contribution credits.", icon: CheckCircle2 },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-background/80 p-4 animate-slide-up"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
