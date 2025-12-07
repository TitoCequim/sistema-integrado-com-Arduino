import { sql } from '../../../lib/neon';

//const API_TOKEN = "MEU_TOKEN_SECRETO_123";

// Função auxiliar para obter ou criar registro de status
async function obterRegistroStatus() {
  try {
    // Tenta obter o registro existente
    const registros = await sql`
      SELECT * FROM esp32_status LIMIT 1
    `;

    if (registros && registros.length > 0) {
      return registros[0];
    }

    // Se não existe, cria um novo
    const novoRegistro = await sql`
      INSERT INTO esp32_status (estado) 
      VALUES ('desconhecido') 
      RETURNING *
    `;

    return novoRegistro[0];
  } catch (err) {
    console.error("Erro ao obter registro de status:", err);
    throw err;
  }
}

export async function GET() {
  try {
    const registro = await obterRegistroStatus();
    return Response.json({ estado: registro?.estado || 'desconhecido' });
  } catch (err) {
    console.error("Erro em GET /api/status:", err);
    return Response.json({ estado: 'desconhecido' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    /*
    const token = req.headers.get("x-token");

    if (token !== API_TOKEN) {
      return Response.json({ ok: false, error: "POST Invalido" }, { status: 401 });
    }
    */
    const data = await req.json();
    console.log("POST recebido:", data);
    
    const novoEstado = data.estado || 'desconhecido';
    
    // Obtém o registro atual
    const registro = await obterRegistroStatus();
    
    // Atualiza o estado no banco de dados
    await sql`
      UPDATE esp32_status 
      SET estado = ${novoEstado}
      WHERE id = ${registro.id}
    `;

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Erro em POST /api/status:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
