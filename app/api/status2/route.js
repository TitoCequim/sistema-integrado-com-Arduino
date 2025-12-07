let ultimoEstado = null;

const GOOGLE_API_KEY = process.env.API_GOOGLE_GPS;

async function enviarParaGoogle(estado) {
  const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`;

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(estado)
  });

  return await r.json();
}

export async function GET() {
  return Response.json({ estado: ultimoEstado });
}

export async function POST(req) {
  const body = await req.json();

  if (body.estado) {
    ultimoEstado = body.estado;
    return Response.json({ ok: true, salvo: ultimoEstado });
  }

  if (body.acao === "chamar_google") {
    if (!ultimoEstado) {
      return Response.json({ ok: false, erro: "Nenhum estado salvo" });
    }

    const respostaGoogle = await enviarParaGoogle(ultimoEstado);

    return Response.json({ ok: true, google: respostaGoogle });
  }

  return Response.json({ ok: false, erro: "Nada para fazer" });
}
