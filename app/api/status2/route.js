let ultimoScan = { wifiAccessPoints: [] }; // Guarda o último JSON recebido
let scanParaEnviar = null; // Guarda o scan que pode ser enviado para Google API
const GOOGLE_API_KEY = process.env.API_GOOGLE_GPS;

// Função que envia para a Google API
async function enviarParaGoogle(dados) {
  const urlGoogle = `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`;
  try {
    const response = await fetch(urlGoogle, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
    const resultado = await response.json();
    console.log("Resposta da Google API:", resultado);
    return resultado;
  } catch (error) {
    console.error("Erro ao enviar para Google API:", error);
    return { error: error.message };
  }
}

// Endpoint que recebe scan (como status2)
export async function POST(req) {
  try {
    const novoScan = await req.json();

    // Comparar com o último scan
    const mudou = JSON.stringify(novoScan) !== JSON.stringify(ultimoScan);

    if (mudou) {
      ultimoScan = novoScan;          // Atualiza último scan
      scanParaEnviar = novoScan;      // Marca para envio futuro
      console.log("Novo scan recebido e pronto para envio:", novoScan);
    } else {
      console.log("Nenhuma alteração no scan. Nada para enviar.");
    }

    return new Response(JSON.stringify({ ok: true, mudou }), { status: 200 });
  } catch (error) {
    console.error("Erro no POST:", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }
}

// Endpoint separado para enviar à Google API (chamado por botão ou ação)
export async function GET() {
  if (!scanParaEnviar) {
    return new Response(JSON.stringify({ ok: false, error: "Nenhum scan para enviar" }), { status: 400 });
  }

  const resultado = await enviarParaGoogle(scanParaEnviar);
  scanParaEnviar = null; // Limpa após envio

  return new Response(JSON.stringify({ ok: true, resultado }), { status: 200 });
}
