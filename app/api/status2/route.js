let ultimoEstado = null;
let ultimoScan = { wifiAccessPoints: [] }; // Guarda o último JSON recebido
const GOOGLE_API_KEY = process.env.API_GOOGLE_GPS;

async function enviarParaGoogle() {
  const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`;

  // envia o último scan para o Google, ou vazio se nenhum scan
  const body = ultimoScan.wifiAccessPoints.length
    ? { wifiAccessPoints: ultimoScan.wifiAccessPoints }
    : {};

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return await r.json();
}

export async function GET() {
  // Retorna os dados atuais
  return Response.json({ estado: ultimoEstado, scan: ultimoScan });
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Atualiza estado se enviado
    if (body.estado) {
      ultimoEstado = body.estado;
      return Response.json({ ok: true, salvo: ultimoEstado });
    }

    // Atualiza scan de Wi-Fi se enviado
    if (body.wifiAccessPoints) {
      ultimoScan = body;
      return Response.json({ ok: true, salvo: ultimoScan });
    }

    // Chamar Google
    if (body.acao === "chamar_google") {
      if (!ultimoScan.wifiAccessPoints.length) {
        return Response.json({ ok: false, erro: "Nenhum scan de Wi-Fi salvo" });
      }

      const respostaGoogle = await enviarParaGoogle();
      return Response.json({ ok: true, google: respostaGoogle });
    }

    return Response.json({ ok: false, erro: "Nada para fazer" });
  } catch (err) {
    return Response.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }
}
