import { useState } from "react";
import { Play, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/campaigns?verified=true&urgency=high",
    desc: "List campaigns with smart filters",
    response: {
      campaigns: [
        { id: "cmp-101", title: "Mithi River Plastic Recovery", urgency: "critical", verified: true },
        { id: "cmp-102", title: "Aarey Urban Forest Restore", urgency: "high", verified: true },
      ],
      total: 2,
    },
  },
  {
    method: "POST",
    path: "/api/v1/verification/scan",
    desc: "Submit before and after evidence for AI verification",
    response: {
      verificationStatus: "verified",
      confidence: 93,
      fraudSignals: {
        exif: "pass",
        geolocation: "pass",
        manipulationCheck: "warn",
      },
      impactDelta: 67,
    },
  },
  {
    method: "GET",
    path: "/api/v1/certificates/user/pri-22",
    desc: "Fetch generated impact certificate",
    response: {
      certificateId: "CIV-90124510",
      user: "Priya Sharma",
      campaign: "Mithi River Plastic Recovery",
      verifiedImpact: "1240 kg CO2 equivalent",
      issuedAt: "2026-04-12T11:42:00Z",
    },
  },
  {
    method: "GET",
    path: "/api/v1/esg/company/grn-01/dashboard",
    desc: "Get corporate ESG dashboard metrics",
    response: {
      carbonOffsetTons: 38.2,
      participationRate: 0.91,
      completionRate: 0.84,
      certificationStage: "Stage 3 / 4",
    },
  },
  {
    method: "POST",
    path: "/api/v1/auth/oauth/google",
    desc: "Role-based secure OAuth login",
    response: {
      token: "eyJhb...",
      role: "volunteer",
      permissions: ["report:create", "campaign:join", "certificate:view"],
    },
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-primary/20 text-primary",
  POST: "bg-chart-3/20 text-chart-3",
  PUT: "bg-chart-2/20 text-chart-2",
  DELETE: "bg-destructive/20 text-destructive",
};

export default function APIExplorer() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(endpoints[active].response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">API Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">Test ActiVise API endpoints with live responses.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Endpoint List */}
        <div className="lg:col-span-2 space-y-2">
          {endpoints.map((ep, i) => (
            <button
              key={ep.path}
              onClick={() => setActive(i)}
              className={`w-full text-left rounded-xl border p-3 transition-all ${
                active === i ? "border-primary/30 bg-card glow-primary" : "border-border bg-card hover:border-primary/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-heading ${methodColors[ep.method]}`}>{ep.method}</span>
                <span className="text-xs font-mono text-foreground">{ep.path}</span>
              </div>
              <p className="text-xs text-muted-foreground">{ep.desc}</p>
            </button>
          ))}
        </div>

        {/* Response */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-heading ${methodColors[endpoints[active].method]}`}>
                {endpoints[active].method}
              </span>
              <span className="text-xs font-mono text-muted-foreground">{endpoints[active].path}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={copy} className="text-muted-foreground hover:text-foreground">
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="p-4 overflow-auto max-h-[500px]">
            <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(endpoints[active].response, null, 2)}
            </pre>
          </div>
          <div className="px-4 py-2 border-t border-border bg-secondary/30 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">200 OK · 42ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
