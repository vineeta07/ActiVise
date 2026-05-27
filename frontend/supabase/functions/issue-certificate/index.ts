import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { ethers } from "npm:ethers@6.15.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CERTIFICATE_REGISTRY_ABI = [
  "function anchorCertificate(string certificateId, bytes32 contentHash, string templateType) external returns (bytes32)",
] as const;

type IssueBody = {
  templateCode?: string;
  recipientName?: string;
  missionTitle?: string;
  issuerName?: string;
  recipientPhone?: string;
  filler?: Record<string, string | number | boolean | null | undefined>;
};

type TemplateRow = {
  template_code: string;
  display_name: string;
  body_template: string;
  placeholders: string[];
};

function assertRequiredString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

function generateCertificateId() {
  const timestamp = Date.now().toString().slice(-8);
  const randomSuffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `CIV-${timestamp}-${randomSuffix}`;
}

function toSortedObject(input: Record<string, string>) {
  return Object.keys(input)
    .sort((a, b) => a.localeCompare(b))
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = input[key];
      return acc;
    }, {});
}

function renderTemplate(bodyTemplate: string, values: Record<string, string>) {
  return bodyTemplate.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key: string) => values[key] ?? "");
}

async function sha256Hex(text: string) {
  const encoded = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function sendWhatsAppIfConfigured(baseUrl: string, serviceRoleKey: string, phone: string, message: string) {
  const fnEndpoint = `${baseUrl}/functions/v1/send-whatsapp`;
  await fetch(fnEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
      message,
    }),
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as IssueBody;

    const templateCode = assertRequiredString(body.templateCode, "templateCode").toLowerCase();
    const recipientName = assertRequiredString(body.recipientName, "recipientName");
    const missionTitle = assertRequiredString(body.missionTitle, "missionTitle");
    const issuerName = assertRequiredString(body.issuerName, "issuerName");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase service configuration is missing");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: template, error: templateError } = await supabase
      .from("certificate_templates")
      .select("template_code,display_name,body_template,placeholders")
      .eq("template_code", templateCode)
      .eq("is_active", true)
      .maybeSingle<TemplateRow>();

    if (templateError || !template) {
      throw new Error("Template not found or inactive");
    }

    const issuedOn = new Date().toISOString().slice(0, 10);
    const filler = body.filler || {};
    const normalizedValues: Record<string, string> = {
      recipient_name: recipientName,
      mission_title: missionTitle,
      issuer_name: issuerName,
      issued_on: issuedOn,
    };

    Object.entries(filler).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      normalizedValues[key] = String(value).trim();
    });

    const missing = (template.placeholders || []).filter((key) => !normalizedValues[key] || normalizedValues[key].trim().length === 0);
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Missing placeholder values: ${missing.join(", ")}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const certificateId = generateCertificateId();
    const renderedContent = renderTemplate(template.body_template, normalizedValues);

    const canonicalPayload = JSON.stringify({
      certificate_id: certificateId,
      template_code: templateCode,
      recipient_name: recipientName,
      mission_title: missionTitle,
      issuer_name: issuerName,
      filler: toSortedObject(normalizedValues),
      rendered_content: renderedContent,
    });

    const contentHash = await sha256Hex(canonicalPayload);

    const { data: issuanceInsert, error: insertError } = await supabase
      .from("certificate_issuances")
      .insert({
        certificate_id: certificateId,
        template_code: templateCode,
        recipient_name: recipientName,
        issuer_name: issuerName,
        mission_title: missionTitle,
        filler: normalizedValues,
        rendered_content: renderedContent,
        content_hash: contentHash,
        status: "pending",
      })
      .select("id,certificate_id")
      .single<{ id: string; certificate_id: string }>();

    if (insertError || !issuanceInsert) {
      throw new Error(insertError?.message || "Failed to create certificate issuance record");
    }

    const rpcUrl = Deno.env.get("SEPOLIA_RPC_URL") || Deno.env.get("CHAIN_RPC_URL");
    const signerPrivateKey = Deno.env.get("ISSUER_PRIVATE_KEY") || Deno.env.get("DEPLOYER_PRIVATE_KEY");
    const contractAddress = Deno.env.get("CERTIFICATE_REGISTRY_ADDRESS");
    const chainId = 11155111;

    if (!rpcUrl || !signerPrivateKey || !contractAddress) {
      const chainConfigError = "Missing chain config (SEPOLIA_RPC_URL/ISSUER_PRIVATE_KEY/CERTIFICATE_REGISTRY_ADDRESS)";

      await supabase
        .from("certificate_issuances")
        .update({
          status: "failed",
          error_message: chainConfigError,
        })
        .eq("id", issuanceInsert.id);

      return new Response(
        JSON.stringify({
          ok: false,
          status: "failed",
          error: chainConfigError,
          certificateId,
          contentHash,
          renderedContent,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const signer = new ethers.Wallet(signerPrivateKey, provider);
      const contract = new ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, signer);

      const tx = await contract.anchorCertificate(certificateId, `0x${contentHash}`, templateCode);
      const receipt = await tx.wait();
      const txHash = tx.hash;
      const chainReference = txHash;

      await supabase.from("certificate_anchors").insert({
        certificate_id: certificateId,
        recipient_name: recipientName,
        mission_title: missionTitle,
        content_hash: contentHash,
        chain_reference: chainReference,
        anchor_status: "anchored",
      });

      await supabase
        .from("certificate_issuances")
        .update({
          chain_reference: chainReference,
          tx_hash: txHash,
          chain_id: chainId,
          contract_address: contractAddress,
          status: "anchored",
          error_message: null,
        })
        .eq("id", issuanceInsert.id);

      if (body.recipientPhone && body.recipientPhone.trim()) {
        const message = `Your CivicLens certificate ${certificateId} is anchored on Sepolia. Tx: ${txHash}`;
        await sendWhatsAppIfConfigured(supabaseUrl, serviceRoleKey, body.recipientPhone.trim(), message).catch(() => {
          // Notification failures should not fail issuance.
        });
      }

      return new Response(
        JSON.stringify({
          ok: true,
          status: "anchored",
          certificateId,
          templateCode,
          renderedContent,
          contentHash,
          txHash,
          chainReference,
          blockNumber: receipt?.blockNumber,
          chainId,
          contractAddress,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (chainError) {
      const message = chainError instanceof Error ? chainError.message : "On-chain anchoring failed";

      await supabase
        .from("certificate_issuances")
        .update({
          status: "failed",
          error_message: message,
        })
        .eq("id", issuanceInsert.id);

      return new Response(
        JSON.stringify({
          ok: false,
          status: "failed",
          error: message,
          certificateId,
          contentHash,
          renderedContent,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown issue-certificate error";
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
