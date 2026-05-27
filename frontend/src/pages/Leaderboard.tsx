import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Volunteer = {
  id: string;
  name: string;
  avatar: string;
  sbt_count: number | null;
  co2_offset: number | null;
  badge: string | null;
  impact_rank: number | null;
};

export default function Leaderboard() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  useEffect(() => {
    supabase.from("volunteers").select("*").order("sbt_count", { ascending: false }).then(({ data }) => {
      if (data) setVolunteers(data);
    });
  }, []);

  const top3 = volunteers.slice(0, 3);
  const rest = volunteers.slice(3);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Leaderboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Top volunteers ranked by verified impact.</p>
      </div>

      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[1, 0, 2].map((order, i) => {
            const vol = top3[order];
            if (!vol) return null;
            const isFirst = order === 0;
            return (
              <div
                key={vol.id}
                className={`rounded-xl border bg-card p-4 text-center animate-slide-up ${
                  isFirst ? "border-primary/30 glow-primary" : "border-border"
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`h-12 w-12 rounded-full mx-auto flex items-center justify-center text-sm font-heading font-bold ${
                  isFirst ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                  {vol.avatar}
                </div>
                <p className="text-sm font-medium text-foreground mt-2">{vol.name}</p>
                <p className="text-xs text-muted-foreground">{vol.badge}</p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <Flame className="h-3 w-3 text-primary" />
                  <span className="text-xs font-heading text-primary">{vol.sbt_count} SBTs</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{vol.co2_offset} tons CO₂</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {rest.map((v, i) => (
          <div key={v.id} className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
            <span className="text-sm font-heading text-muted-foreground w-6 text-center">#{i + 4}</span>
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-xs font-heading text-secondary-foreground">
              {v.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{v.name}</p>
              <p className="text-xs text-muted-foreground">{v.badge}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-heading text-primary">{v.sbt_count} SBTs</p>
              <p className="text-xs text-muted-foreground">{v.co2_offset} tons CO₂</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
