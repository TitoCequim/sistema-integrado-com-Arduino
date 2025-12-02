//teste 

let ultimoScan = { wifiAccessPoints: [] }; // Guarda o último JSON recebido

export async function GET() {
  return Response.json(ultimoScan); // quando abrir no navegador
}

export async function POST(req) {
  try {
    const data = await req.json(); // pega o JSON enviado pela ESP32

    // Apenas salva em memória — NÃO envia nada ainda
    ultimoScan = data;

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { ok: false, error: "JSON inválido" },
      { status: 400 }
    );
  }
}
