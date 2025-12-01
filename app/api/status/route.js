let estadoAtual = "desconhecido";

const API_TOKEN = "MEU_TOKEN_SECRETO_123";

export async function GET() {
  return Response.json({ estado: estadoAtual });
}

export async function POST(req) {
  const token = req.headers.get("x-token");

  if (token !== API_TOKEN) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  console.log("POST recebido:", data);
  estadoAtual = data.estado;

  return Response.json({ ok: true });
}
