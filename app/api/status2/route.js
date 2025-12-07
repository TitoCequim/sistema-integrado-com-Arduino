let ultimoScan = [];         // guarda apenas o array wifiAccessPoints
let scanParaEnviar = null;   // guarda scan pronto para enviar à Google API
const GOOGLE_API_KEY = process.env.API_GOOGLE_GPS;

// Função que envia para Google
async function enviarParaGoogle(dados) {
  const urlGoogle = `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`;
  try {
    const res = await fetch(urlGoogle, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
    const resultado = await res.json();
    console.log("Resposta Google API:", resultado);
    return resultado;
  } catch (err) {
    console.error("Erro Google API:", err);
    return { error: err.message };
  }
}

// GET para simular o "botão"
export async function GET() {
  if (!scanParaEnviar) {
    return new Response(JSON.stringify({ ok: false, error: "Nenhum scan para enviar" }), { status: 400 });
  }

  const resultado = await enviarParaGoogle(scanParaEnviar);
  scanParaEnviar = null;  // limpa após envio
  return new Response(JSON.stringify({ ok: true, resultado }), { status: 200 });
}

// POST para receber scan da ESP32
export async function POST(req) {
  try {
    const body = await req.json();
    const novoScanArray = body.scan?.wifiAccessPoints || [];

    // compara com o último scan
    const mudou = JSON.stringify(novoScanArray) !== JSON.stringify(ultimoScan);

    if (mudou) {
      ultimoScan = novoScanArray;
      scanParaEnviar = body;  // marca para envio
      console.log("Novo scan recebido e pronto para envio:", body);
    } else {
      console.log("Nenhuma alteração no scan. Nada para enviar.");
    }

    return new Response(JSON.stringify({ ok: true, mudou }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: "JSON inválido" }), { status: 400 });
  }
}
