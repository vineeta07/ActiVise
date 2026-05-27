import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Loader2, Share2, ShieldCheck } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";
import {
  getCertificateHistory,
  getTemplateDefinition,
  issueCertificate,
  renderCertificateContent,
  templateDefinitions,
  type CertificateTemplateCode,
  type IssueCertificateResult,
} from "@/lib/certificateService";

export default function Certificates() {
  const [templateCode, setTemplateCode] = useState<CertificateTemplateCode>("volunteer");
  const [recipientName, setRecipientName] = useState("Priya Sharma");
  const [missionTitle, setMissionTitle] = useState("Mithi River Plastic Recovery");
  const [issuerName, setIssuerName] = useState("CivicLens Team");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [impactSummary, setImpactSummary] = useState("1,240 kg CO2 equivalent community impact");
  const [contributionAmount, setContributionAmount] = useState("INR 15,000");
  const [partnershipRole, setPartnershipRole] = useState("Impact Sponsor");

  const [issuing, setIssuing] = useState(false);
  const [issueResult, setIssueResult] = useState<IssueCertificateResult | null>(null);
  const [history, setHistory] = useState<Array<Tables<"certificate_issuances">>>([]);

  const template = useMemo(() => getTemplateDefinition(templateCode), [templateCode]);
  const issuedOn = useMemo(() => new Date().toLocaleDateString(), []);

  const fillerPayload = useMemo(() => {
    const payload: Record<string, string> = {
      recipient_name: recipientName,
      mission_title: missionTitle,
      issuer_name: issuerName,
      issued_on: issuedOn,
      impact_summary: impactSummary,
    };

    if (templateCode === "donor") {
      payload.contribution_amount = contributionAmount;
    }

    if (templateCode === "partner") {
      payload.partnership_role = partnershipRole;
    }

    return payload;
  }, [contributionAmount, impactSummary, issuedOn, issuerName, missionTitle, partnershipRole, recipientName, templateCode]);

  const previewContent = useMemo(() => {
    return renderCertificateContent(templateCode, fillerPayload);
  }, [templateCode, fillerPayload]);

  useEffect(() => {
    if (!recipientName.trim()) {
      setHistory([]);
      return;
    }

    getCertificateHistory(recipientName).then(setHistory);
  }, [recipientName]);

  const onIssueCertificate = async () => {
    if (!recipientName.trim() || !missionTitle.trim() || !issuerName.trim()) {
      toast.error("Recipient, mission title, and issuer are required");
      return;
    }

    if (!impactSummary.trim()) {
      toast.error("Impact summary is required");
      return;
    }

    if (templateCode === "donor" && !contributionAmount.trim()) {
      toast.error("Contribution amount is required for donor template");
      return;
    }

    if (templateCode === "partner" && !partnershipRole.trim()) {
      toast.error("Partnership role is required for partner template");
      return;
    }

    setIssuing(true);
    const result = await issueCertificate({
      templateCode,
      recipientName,
      missionTitle,
      issuerName,
      recipientPhone: recipientPhone.trim() || undefined,
      filler: fillerPayload,
    });

    setIssueResult(result);
    if (result.ok) {
      toast.success("Certificate issued and anchored on-chain");
    } else {
      toast.error(result.error || "Certificate issuance failed");
    }

    const updatedHistory = await getCertificateHistory(recipientName);
    setHistory(updatedHistory);
    setIssuing(false);
  };

  const downloadCertificate = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const certificateId = issueResult?.certificateId || "UNISSUED";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Digital Impact Certificate", 40, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Template: ${template.title}`, 40, 92);
    doc.text(`Certificate ID: ${certificateId}`, 40, 112);
    doc.text(`Recipient: ${recipientName}`, 40, 132);
    doc.text(`Mission: ${missionTitle}`, 40, 152);
    doc.text(`Issuer: ${issuerName}`, 40, 172);
    doc.text(`Issued on: ${issuedOn}`, 40, 192);

    const wrappedContent = doc.splitTextToSize(previewContent, 510);
    doc.text(wrappedContent, 40, 230);

    const contentHash = issueResult?.contentHash || "Not available";
    const chainReference = issueResult?.chainReference || "Not available";
    doc.text("Blockchain Metadata", 40, 500);
    doc.setFontSize(10);
    doc.text(`Chain reference: ${chainReference}`, 40, 520);
    const wrappedHash = doc.splitTextToSize(`Content hash: ${contentHash}`, 510);
    doc.text(wrappedHash, 40, 538);

    doc.save(`${certificateId}.pdf`);
  };

  const sharePreview = async () => {
    const shareText = `${recipientName} received a ${template.title} on CivicLens for ${missionTitle}.`;
    if (navigator.share) {
      await navigator.share({
        title: template.title,
        text: shareText,
      });
      return;
    }
    await navigator.clipboard.writeText(shareText);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Certification System</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Template-driven certificate issuance with blockchain anchoring on Sepolia and PDF export.
        </p>
      </div>

      <section className="rounded-2xl border border-primary/25 bg-card p-6 glow-primary">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-muted-foreground">Template</p>
              <select
                value={templateCode}
                onChange={(event) => setTemplateCode(event.target.value as CertificateTemplateCode)}
                className="w-full mt-1 bg-secondary/50 text-sm text-foreground rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-primary"
              >
                {templateDefinitions.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.title}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground mt-1">{template.helperText}</p>
            </div>

            <div className="grid gap-2">
              <label className="text-[11px] text-muted-foreground">Recipient name</label>
              <input
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                placeholder="Recipient name"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-[11px] text-muted-foreground">Mission or campaign</label>
              <input
                value={missionTitle}
                onChange={(event) => setMissionTitle(event.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                placeholder="Mission title"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-[11px] text-muted-foreground">Issuer name</label>
              <input
                value={issuerName}
                onChange={(event) => setIssuerName(event.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                placeholder="Issuer"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-[11px] text-muted-foreground">Recipient phone (optional, WhatsApp)</label>
              <input
                value={recipientPhone}
                onChange={(event) => setRecipientPhone(event.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                placeholder="+919999999999"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-[11px] text-muted-foreground">Impact summary</label>
              <textarea
                value={impactSummary}
                onChange={(event) => setImpactSummary(event.target.value)}
                className="min-h-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            {templateCode === "donor" && (
              <div className="grid gap-2">
                <label className="text-[11px] text-muted-foreground">Contribution amount</label>
                <input
                  value={contributionAmount}
                  onChange={(event) => setContributionAmount(event.target.value)}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  placeholder="INR 15,000"
                />
              </div>
            )}

            {templateCode === "partner" && (
              <div className="grid gap-2">
                <label className="text-[11px] text-muted-foreground">Partnership role</label>
                <input
                  value={partnershipRole}
                  onChange={(event) => setPartnershipRole(event.target.value)}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  placeholder="Impact Sponsor"
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-6">
            <div className="flex items-center gap-2 text-primary mb-3">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-sm font-heading">{template.title}</p>
            </div>
            <p className="text-xl font-heading text-foreground">{recipientName || "Recipient"}</p>
            <p className="text-sm text-muted-foreground mt-1">for contribution to</p>
            <p className="text-base font-medium text-foreground mt-1">{missionTitle || "Mission"}</p>

            <div className="mt-4 rounded-lg border border-border bg-background/70 p-4">
              <p className="text-[11px] text-muted-foreground">Preview content</p>
              <p className="text-sm text-foreground mt-2 leading-6">{previewContent}</p>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-background/70 p-3">
                <p className="text-[11px] text-muted-foreground">Issued date</p>
                <p className="text-sm font-medium text-foreground">{issuedOn}</p>
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-3">
                <p className="text-[11px] text-muted-foreground">Status</p>
                <p className="text-sm font-medium text-foreground capitalize">{issueResult?.status || "draft"}</p>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-primary/20 bg-primary/10 p-3">
              <p className="text-[11px] text-muted-foreground">Blockchain reference</p>
              <p className="text-sm font-medium text-foreground break-all">{issueResult?.chainReference || "Not anchored yet"}</p>
              <p className="text-[11px] text-muted-foreground mt-1 break-all">
                {issueResult?.contentHash || "Content hash will appear after issuance."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={onIssueCertificate} className="gap-2" disabled={issuing}>
            {issuing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Issue Certificate
          </Button>
          <Button onClick={downloadCertificate} className="gap-2" variant="secondary">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button onClick={sharePreview} variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" /> Share Preview
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-base font-heading text-foreground">Issued Certificate History</h2>
        </div>

        {history.length === 0 && <p className="text-sm text-muted-foreground">No certificates found for this recipient yet.</p>}

        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-secondary/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{item.certificate_id}</p>
                <span className="text-[11px] px-2 py-1 rounded-md bg-primary/10 text-primary capitalize">{item.status}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {item.template_code} · {item.mission_title} · {new Date(item.created_at).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1 break-all">{item.chain_reference || item.error_message || "No chain reference yet"}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
