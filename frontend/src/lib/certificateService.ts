import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type CertificateTemplateCode = "volunteer" | "donor" | "partner";

export type CertificateTemplateDefinition = {
  code: CertificateTemplateCode;
  title: string;
  placeholders: string[];
  bodyTemplate: string;
  helperText: string;
};

export type IssueCertificateInput = {
  templateCode: CertificateTemplateCode;
  recipientName: string;
  missionTitle: string;
  issuerName: string;
  recipientPhone?: string;
  filler: Record<string, string>;
};

export type IssueCertificateResult = {
  ok: boolean;
  status: string;
  error?: string;
  certificateId?: string;
  templateCode?: string;
  renderedContent?: string;
  contentHash?: string;
  txHash?: string;
  chainReference?: string;
  blockNumber?: number;
  chainId?: number;
  contractAddress?: string;
};

export const templateDefinitions: CertificateTemplateDefinition[] = [
  {
    code: "volunteer",
    title: "Volunteer Certificate",
    placeholders: ["recipient_name", "mission_title", "impact_summary", "issuer_name", "issued_on"],
    helperText: "For volunteers who directly complete a civic mission.",
    bodyTemplate:
      "This is to certify that {{recipient_name}} has successfully volunteered in \"{{mission_title}}\" and delivered measurable community impact. Impact summary: {{impact_summary}}. Issued by {{issuer_name}} on {{issued_on}}.",
  },
  {
    code: "donor",
    title: "Donor Certificate",
    placeholders: ["recipient_name", "mission_title", "contribution_amount", "impact_summary", "issuer_name", "issued_on"],
    helperText: "For contributors who financially support verified community impact.",
    bodyTemplate:
      "This certifies that {{recipient_name}} supported \"{{mission_title}}\" through a contribution of {{contribution_amount}} and enabled verified impact outcomes. Impact summary: {{impact_summary}}. Issued by {{issuer_name}} on {{issued_on}}.",
  },
  {
    code: "partner",
    title: "Partner/Sponsor Certificate",
    placeholders: ["recipient_name", "mission_title", "partnership_role", "impact_summary", "issuer_name", "issued_on"],
    helperText: "For organizations or people partnering in mission delivery.",
    bodyTemplate:
      "This certifies that {{recipient_name}} partnered in \"{{mission_title}}\" as {{partnership_role}} and helped drive verified civic impact. Impact summary: {{impact_summary}}. Issued by {{issuer_name}} on {{issued_on}}.",
  },
];

export function getTemplateDefinition(templateCode: CertificateTemplateCode) {
  return templateDefinitions.find((item) => item.code === templateCode) || templateDefinitions[0];
}

export function renderCertificateContent(templateCode: CertificateTemplateCode, values: Record<string, string>) {
  const definition = getTemplateDefinition(templateCode);
  return definition.bodyTemplate.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key: string) => values[key] || "");
}

export async function issueCertificate(input: IssueCertificateInput): Promise<IssueCertificateResult> {
  const { data, error } = await supabase.functions.invoke("issue-certificate", {
    body: {
      templateCode: input.templateCode,
      recipientName: input.recipientName,
      missionTitle: input.missionTitle,
      issuerName: input.issuerName,
      recipientPhone: input.recipientPhone,
      filler: input.filler,
    },
  });

  if (error) {
    return {
      ok: false,
      status: "failed",
      error: error.message,
    };
  }

  return (data || {
    ok: false,
    status: "failed",
    error: "Unknown issue-certificate response",
  }) as IssueCertificateResult;
}

export async function getCertificateHistory(recipientName: string): Promise<Tables<"certificate_issuances">[]> {
  const trimmed = recipientName.trim();
  if (!trimmed) return [];

  const { data, error } = await supabase
    .from("certificate_issuances")
    .select("*")
    .eq("recipient_name", trimmed)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return data;
}

export async function getActiveTemplates(): Promise<Tables<"certificate_templates">[]> {
  const { data, error } = await supabase
    .from("certificate_templates")
    .select("*")
    .eq("is_active", true)
    .order("display_name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}
