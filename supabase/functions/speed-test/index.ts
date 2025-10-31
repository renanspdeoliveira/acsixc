import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

// Headers para permitir que o nosso app chame esta função
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Pega o token da API de forma segura dos segredos do Supabase
const IXC_TOKEN = Deno.env.get("IXC_TOKEN");

serve(async (req) => {
  // Responde a uma requisição de "verificação" do navegador
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verifica se o token da API está configurado
    if (!IXC_TOKEN) {
      throw new Error("O token da API (IXC_TOKEN) não está configurado nos segredos do Supabase.");
    }

    // Pega o número de série enviado pelo frontend
    const { serial_number } = await req.json();
    if (!serial_number) {
      return new Response(JSON.stringify({ error: 'O número de série é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiUrl = `https://128.201.140.41:443/api/v2/devices/${serial_number}/diagnostics/speedTest/start`;

    // Faz a chamada para a API externa
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${IXC_TOKEN}`,
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
        console.error(`Erro na API externa: ${response.status}`, errorBody);
        throw new Error(`Falha ao iniciar o teste: ${response.statusText}`);
    }

    const result = await response.json();

    // Retorna o resultado para o frontend
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})