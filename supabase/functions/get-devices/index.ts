import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ACS_CLIENT_ID = Deno.env.get("ACS_CLIENT_ID");
const ACS_CLIENT_SECRET = Deno.env.get("ACS_CLIENT_SECRET");
// ATENÇÃO: Mudando para HTTP como tentativa de diagnóstico. Não é uma solução segura para produção.
const TOKEN_URL = "http://128.201.140.41/api/v1/token/oauth";
const API_BASE_URL = "http://128.201.140.41/api/v1/devices/views/natural";

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

    const body = await req.json();
    const { searchQuery, searchCategory, searchOperator = 'like' } = body;

    const params = new URLSearchParams({
      'pagination[pageSize]': '50',
      'pagination[currentPage]': '1',
      'sorting[sortBy]': 'created',
      'sorting[sortOrder]': 'desc',
      'filters[0][0][type]': 'boolean',
      'filters[0][0][accessor]': 'status',
      'filters[0][0][operator]': 'equal',
      'filters[0][0][value]': 'true',
    });

    if (searchQuery && searchCategory) {
      params.append('filters[0][1][type]', 'string');
      params.append('filters[0][1][accessor]', searchCategory);
      params.append('filters[0][1][operator]', searchOperator);
      params.append('filters[0][1][value]', searchQuery);
    }

    const finalUrl = `${API_BASE_URL}?${params.toString()}`;

    const response = await fetch(finalUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Erro ao buscar dispositivos: ${response.status}`, errorBody);
      throw new Error(`Falha ao buscar dispositivos: ${response.status} ${response.statusText}. Detalhes: ${errorBody}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Erro detalhado na Edge Function 'get-devices':", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})