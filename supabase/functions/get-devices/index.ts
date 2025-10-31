import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Novas constantes para a autenticação OAuth ---
const ACS_CLIENT_ID = Deno.env.get("ACS_CLIENT_ID");
const ACS_CLIENT_SECRET = Deno.env.get("ACS_CLIENT_SECRET");
const TOKEN_URL = "https://128.201.140.41:443/api/v1/token/oauth";
const API_BASE_URL = "https://128.201.140.41:443/api/v1/devices/views/natural";

// Função para obter o token de acesso
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
    throw new Error(`Falha ao obter token de acesso: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log("--- Nova requisição para get-devices (com OAuth) ---");

  try {
    // 1. Obter o token de acesso
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Não foi possível obter o access_token da API.");
    }
    console.log("Token de acesso obtido com sucesso.");

    // 2. Usar o token para buscar os dispositivos
    const body = await req.json();
    const { searchQuery, searchCategory, searchOperator = 'like' } = body;
    console.log("Parâmetros de busca recebidos:", JSON.stringify(body));

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
    console.log("Chamando API de dispositivos:", finalUrl);

    const response = await fetch(finalUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`, // Usando o novo token
        "Accept": "application/json",
      },
    });

    const responseText = await response.text();
    console.log(`Resposta da API de dispositivos (Status: ${response.status}):`, responseText);

    if (!response.ok) {
      throw new Error(`Falha ao buscar dispositivos: ${response.status} ${response.statusText}`);
    }

    const result = JSON.parse(responseText);
    console.log("Resultado parseado enviado para o frontend:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Erro na Edge Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})