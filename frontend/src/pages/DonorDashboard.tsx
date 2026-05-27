import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Building2, CheckCircle2, Leaf, Target } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { campaigns as seedCampaigns, corporateMilestones, type Campaign } from "@/data/platformData";
import { completeNextCompanyTask, getAllCampaigns, getCompanyCompletedTaskCount } from "@/lib/campaignStore";

const fallbackPortfolio = seedCampaigns.filter((campaign) => campaign.sponsor);

export default function DonorDashboard() {
  const [completedTasks, setCompletedTasks] = useState(0);
  const [portfolioCampaigns, setPortfolioCampaigns] = useState<Campaign[]>(fallbackPortfolio);

  useEffect(() => {
    const load = async () => {
      const [count, remoteCampaigns] = await Promise.all([
        getCompanyCompletedTaskCount(),
        getAllCampaigns(),
      ]);
      setCompletedTasks(count);
      setPortfolioCampaigns(remoteCampaigns.length ? remoteCampaigns.slice(0, 8) : fallbackPortfolio);
    };

    void load();
  }, []);

  const totalOffset = portfolioCampaigns.reduce((sum, campaign) => sum + campaign.co2PotentialKg, 0);
  const completionRate = Math.round((completedTasks / corporateMilestones.length) * 100);

  const dynamicMilestones = useMemo(() => {
    return corporateMilestones.map((milestone, index) => ({
      ...milestone,
      done: index < completedTasks,
    }));
  }, [completedTasks]);

  const markTaskComplete = async () => {
    const next = await completeNextCompanyTask();
    setCompletedTasks(next);
    toast.success("Company task completed. ESG report readiness updated.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Corporate ESG Sponsorship Hub</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sponsor campaigns, track carbon offset performance, and monitor zero-carbon office progress.
        </p>
      </div>

      <div className="rounded-xl border border-primary/20 bg-card p-5 glow-primary">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-heading text-sm text-foreground">ActiVise Corporate Console</span>
          </div>
          <span className="text-xs text-muted-foreground">GreenOrbit Technologies</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Sponsored campaigns</p>
            <p className="text-lg font-heading text-foreground">{portfolioCampaigns.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Carbon offset contribution</p>
            <p className="text-lg font-heading text-chart-3">{(totalOffset / 1000).toFixed(1)} tCO2e</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Completion rate</p>
            <p className="text-lg font-heading text-primary">{completionRate}%</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-heading text-sm text-foreground mb-3">Zero-Carbon Office Progress Tracker</h3>
        <Button onClick={markTaskComplete} size="sm" variant="secondary" className="mb-3">
          Complete Next Task
        </Button>
        <div className="space-y-2">
          {dynamicMilestones.map((milestone) => (
            <div key={milestone.title} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                {milestone.done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Target className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{milestone.title}</p>
                <p className="text-xs text-muted-foreground">{milestone.done ? "Completed" : "In progress"}</p>
              </div>
              <span className={`px-2 py-1 rounded-md text-[10px] font-heading ${milestone.done ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                {milestone.done ? "Achieved" : "Open"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-heading text-sm text-foreground mb-3">Sponsored Campaign Portfolio</h3>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {portfolioCampaigns.map((campaign) => (
            <div key={campaign.id} className="p-3 flex items-start gap-3">
              <Leaf className="h-4 w-4 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground">{campaign.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(campaign.sponsor || "ActiVise") + " · Potential " + campaign.co2PotentialKg.toLocaleString() + " kg CO2 · " + campaign.volunteers + "/" + campaign.targetVolunteers + " volunteers"}
                </p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary">{campaign.urgency}</span>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full font-heading gap-2">
        <ArrowUpRight className="h-4 w-4" /> Sponsor Additional Campaign
      </Button>
    </div>
  );
}
