import { useEffect, useMemo, useState } from "react";
import { Filter, Gauge, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import MissionMap from "@/components/MissionMap";
import { type Campaign, type CampaignUrgency } from "@/data/platformData";
import { getAllCampaigns, getCampaignRegistrations, registerForCampaign } from "@/lib/campaignStore";
import { toast } from "sonner";

const urgencyOrder: Record<CampaignUrgency, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function CampaignDiscovery() {
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [registrations, setRegistrations] = useState<Array<{ campaignId: string }>>([]);
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | CampaignUrgency>("all");
  const [impactFilter, setImpactFilter] = useState<"all" | Campaign["impactType"]>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncData = async () => {
      setLoading(true);
      const [campaignsResult, registrationsResult] = await Promise.all([
        getAllCampaigns(),
        getCampaignRegistrations(),
      ]);
      setCampaignList(campaignsResult);
      setRegistrations(registrationsResult);
      setLoading(false);
    };

    const onFocus = () => {
      void syncData();
    };

    void syncData();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const sortedCampaigns = useMemo(() => {
    return campaignList
      .filter((campaign) => (urgencyFilter === "all" ? true : campaign.urgency === urgencyFilter))
      .filter((campaign) => (impactFilter === "all" ? true : campaign.impactType === impactFilter))
      .filter((campaign) => (verifiedOnly ? campaign.verified : true))
      .sort((a, b) => {
        if (a.verified !== b.verified) {
          return a.verified ? -1 : 1;
        }
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      });
  }, [campaignList, urgencyFilter, impactFilter, verifiedOnly]);

  const pinned = sortedCampaigns.filter((campaign) => campaign.verified && campaign.urgency === "critical");

  const onRegister = async (campaign: Campaign) => {
    const next = await registerForCampaign(campaign.id, campaign.title);
    setRegistrations(next);
    toast.success(`Registered for ${campaign.title}. WhatsApp updates enabled.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Campaign Discovery and Smart Listing</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verified priority campaigns are pinned first, with AI-ranked urgency and map-driven navigation.
            </p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-right">
            <p className="text-[11px] text-muted-foreground">Campaigns in scope</p>
            <p className="text-lg font-heading text-primary">{loading ? "..." : sortedCampaigns.length}</p>
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-background/80 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-foreground">Urgency</p>
            </div>
            <select
              value={urgencyFilter}
              onChange={(event) => setUrgencyFilter(event.target.value as "all" | CampaignUrgency)}
              className="h-9 w-full rounded-md border border-border bg-card px-2 text-xs text-foreground"
            >
              <option value="all">All urgency levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="rounded-xl border border-border bg-background/80 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-foreground">Impact type</p>
            </div>
            <select
              value={impactFilter}
              onChange={(event) => setImpactFilter(event.target.value as "all" | Campaign["impactType"])}
              className="h-9 w-full rounded-md border border-border bg-card px-2 text-xs text-foreground"
            >
              <option value="all">All impact types</option>
              <option value="Waste">Waste</option>
              <option value="Trees">Trees</option>
              <option value="Water">Water</option>
              <option value="Air">Air</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setVerifiedOnly((value) => !value)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              verifiedOnly ? "border-primary bg-primary/10" : "border-border bg-background/80"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-foreground">Verification filter</p>
            </div>
            <p className="text-xs text-muted-foreground">Show only verified campaigns</p>
          </button>
        </div>
      </div>

      {pinned.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-heading text-foreground">Verified High-Priority Campaigns</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {pinned.map((campaign) => (
              <article key={campaign.id} className="rounded-xl border border-red-500/25 bg-red-500/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-1 rounded-md bg-red-500/15 text-red-500 font-heading">URGENT VERIFIED</span>
                  <span className="text-[11px] text-muted-foreground">{campaign.impactType}</span>
                </div>
                <h3 className="mt-2 text-base font-heading text-foreground">{campaign.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{campaign.summary}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {campaign.locationName}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-4">
        <section className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4">
          <h2 className="text-sm font-heading text-foreground mb-3">Campaign Intelligence Map</h2>
          <MissionMap points={sortedCampaigns} />
        </section>

        <section className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4">
          <h2 className="text-sm font-heading text-foreground mb-3">Campaign Cards</h2>
          <div className="space-y-2 max-h-[350px] overflow-auto pr-1">
            {sortedCampaigns.map((campaign) => {
              const progress = Math.round((campaign.volunteers / campaign.targetVolunteers) * 100);
              const isRegistered = registrations.some((entry) => entry.campaignId === campaign.id);
              return (
                <article key={campaign.id} className="rounded-xl border border-border bg-background/80 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-foreground">{campaign.title}</h3>
                    <span className="text-[10px] px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                      {campaign.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{campaign.summary}</p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {campaign.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3">
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {campaign.volunteers}/{campaign.targetVolunteers} volunteers joined
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRegister(campaign)}
                    disabled={isRegistered}
                    className="mt-3 h-8 w-full rounded-lg border border-border bg-card text-xs text-foreground disabled:opacity-60"
                  >
                    {isRegistered ? "Registered · WhatsApp alerts active" : "Register for Campaign"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
