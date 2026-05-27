import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SendBody = {
  phone?: string;
  message?: string;
};

function withWhatsAppPrefix(value: string) {
  return value.startsWith("whatsapp:") ? value : `whatsapp:${value}`;
}

async function sendViaTwilio(phone: string, message: string) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_WHATSAPP_FROM");

  if (!accountSid || !authToken || !from) {
    return { configured: false as const, status: "queued" as const, provider: "twilio-not-configured" };
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = btoa(`${accountSid}:${authToken}`);

  const payload = new URLSearchParams({
    From: withWhatsAppPrefix(from),
    To: withWhatsAppPrefix(phone),
    Body: message,
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Twilio WhatsApp error: ${response.status} ${detail}`);
  }

  const twilioData = await response.json();
  return {
    configured: true as const,
    status: "sent" as const,
    provider: "twilio" as const,
    sid: twilioData.sid as string | undefined,
  };
}

async function sendViaGenericProvider(phone: string, message: string) {
  const apiUrl = Deno.env.get("WHATSAPP_API_URL");
  const apiToken = Deno.env.get("WHATSAPP_API_TOKEN");

  if (!apiUrl || !apiToken) {
    return { configured: false as const, status: "queued" as const, provider: "generic-not-configured" };
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: phone,
      message,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Generic WhatsApp provider error: ${response.status} ${detail}`);
  }

  return {
    configured: true as const,
    status: "sent" as const,
    provider: "generic" as const,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as SendBody;
    const phone = body.phone?.trim();
    const message = body.message?.trim();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "Both phone and message are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const twilioResult = await sendViaTwilio(phone, message);
    if (twilioResult.configured) {
      return new Response(
        JSON.stringify({
          status: twilioResult.status,
          provider: twilioResult.provider,
          sid: twilioResult.sid,
          phone,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const genericResult = await sendViaGenericProvider(phone, message);
    if (genericResult.configured) {
      return new Response(
        JSON.stringify({ status: genericResult.status, provider: genericResult.provider, phone }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: "queued",
        provider: "not-configured",
        phone,
        message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 202,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
