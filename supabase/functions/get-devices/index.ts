import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const IXC_TOKEN = Deno.env.get("IXC_TOKEN");
const API_BASE_URL = "https://acs.futuranet.net.br/api/v1/devices/views/natural";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log("--- Nova requisição para get-devices ---");

  try {
    if (!IXC_TOKEN) {
      console.error("IXC_TOKEN não encontrado.");
      throw new Error("O token da API (IXC_TOKEN) não está configurado nos segredos do Supabase.");
    }

    const body = await req.json();
    const { searchQuery, searchCategory, searchOperator = 'like' } = body;
    console.log("Parâmetros recebidos:", JSON.stringify(body));


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
    console.log("Chamando API externa:", finalUrl);

    const response = await fetch(finalUrl, {
      headers: {
        "Authorization": `Bearer ${IXC_TOKEN}`,
        "Accept": "application/json",
      },
    });

    const responseText = await response.text();
    console.log(`Resposta da API externa (Status: ${response.status}):`, responseText);

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