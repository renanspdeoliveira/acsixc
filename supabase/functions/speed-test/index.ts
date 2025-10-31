import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ACS_CLIENT_ID = Deno.env.get("ACS_CLIENT_ID");
const ACS_CLIENT_SECRET = Deno.env.get("ACS_CLIENT_SECRET");
const TOKEN_URL = "https://128.201.140.41:443/api/v1/token/oauth";

async function getAccessToken() {
  if (!ACS_CLIENT_ID || !ACS_CLIENT_SECRET) {
    throw new Error("ACS_CLIENT_ID e ACS_CLIENT_SECRET precisam ser configurados nos segredos do Supabase.");
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'client_id': ACS_CLIENT_ID,
      'client_secret': ACS_CLIENT_SECRET,
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Erro ao obter token:", response.status, errorBody);
    throw new Error(`Falha ao obter token de acesso: ${response.statusText}. Detalhes: ${errorBody}`);
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Não foi possível obter o access_token da API.");
    }

    const { serial_number } = await req.json();
    if (!serial_number) {
      return new Response(JSON.stringify({ error: 'O número de série é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiUrl = `https://128.201.140.41:443/api/v2/devices/${serial_number}/diagnostics/speedTest/start`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fileSizes: {
          download: { size1: 52428800, size2: 524288000 },
          upload: { size1: 10485760, size2: 52428800 }
        },
        testTypes: { download: true, upload: true }
      })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Erro na API externa (speed-test): ${response.status}`, errorBody);
        throw new Error(`Falha ao iniciar o teste: ${response.statusText}. Detalhes: ${errorBody}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Erro detalhado na Edge Function 'speed-test':", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})