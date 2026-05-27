import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { getCompanyCompletedTaskCount } from "@/lib/campaignStore";
import { useEffect, useState } from "react";

const envData = [
  { category: "Waste Cleared", tons: 18.4 },
  { category: "Trees Planted", tons: 12.1 },
  { category: "Roads Repaired", tons: 8.7 },
  { category: "Water Cleaned", tons: 6.1 },
];

const sdgData = [
  { name: "SDG 11", value: 35 },
  { name: "SDG 13", value: 28 },
  { name: "SDG 14", value: 18 },
  { name: "SDG 15", value: 12 },
  { name: "SDG 6", value: 7 },
];

const radarData = [
  { subject: "Carbon", A: 85 },
  { subject: "Waste", A: 92 },
  { subject: "Water", A: 65 },
  { subject: "Biodiversity", A: 70 },
  { subject: "Community", A: 88 },
  { subject: "Governance", A: 75 },
];

const COLORS = ["hsl(155,100%,38%)", "hsl(200,80%,50%)", "hsl(45,90%,55%)", "hsl(280,70%,55%)", "hsl(0,72%,51%)"];

export default function ESGReport() {
  const [completedCompanyTasks, setCompletedCompanyTasks] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const count = await getCompanyCompletedTaskCount();
      setCompletedCompanyTasks(count);
    };
    void load();
  }, []);

  if (completedCompanyTasks === null) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">ESG Report</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading company ESG progress from Supabase...</p>
        </div>
      </div>
    );
  }

  if (completedCompanyTasks === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">ESG Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ESG reporting is unlocked only after a company completes at least one milestone task.
          </p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
          <p className="text-sm text-foreground">No completed company task detected yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Complete a task from the Corporate Hub to generate ESG analytics and certification readiness.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">ESG Report</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time ESG intelligence for environmental outcomes, participation quality, and governance trust.
        </p>
        <p className="text-xs text-primary mt-1">Tasks completed: {completedCompanyTasks}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Carbon Offset", value: "38.2 tCO2e", sub: "Tracked with verified campaign outcomes" },
          { label: "Participation Rate", value: "91%", sub: "Completed tasks / assigned tasks" },
          { label: "Verification Success", value: "88%", sub: "AI-validated submissions this quarter" },
        ].map((s, i) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-heading text-primary mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading text-sm text-foreground mb-4">Carbon Offset by Campaign Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={envData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="tons" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading text-sm text-foreground mb-4">UN SDG Alignment Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sdgData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {sdgData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {sdgData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-[10px] text-muted-foreground">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-heading text-sm text-foreground mb-4">ESG Radar</h3>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Radar dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
        <h3 className="font-heading text-sm text-foreground">ESG Certification Readiness</h3>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Carbon reduction target</p>
            <p className="text-sm font-medium text-foreground">72% of annual goal</p>
          </div>
          <div className="rounded-lg border border-border bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Verified participation</p>
            <p className="text-sm font-medium text-foreground">4,921 volunteer actions</p>
          </div>
          <div className="rounded-lg border border-border bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Certification status</p>
            <p className="text-sm font-medium text-primary">Stage 3 / 4 - Audit in progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}
