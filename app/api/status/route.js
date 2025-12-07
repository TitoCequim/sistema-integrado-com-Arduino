import { supabase } from '../../../lib/supabase';

//const API_TOKEN = "MEU_TOKEN_SECRETO_123";

// Função auxiliar para obter ou criar registro de status
async function obterRegistroStatus() {
  const { data, error } = await supabase
    .from('esp32_status')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code === 'PGRST116') {
    // Registro não existe, criar um
    const { data: newData, error: insertError } = await supabase
      .from('esp32_status')
      .insert({ estado: 'desconhecido' })
      .select()
      .single();
    
    if (insertError) {
      throw insertError;
    }
    return newData;
  }

  if (error) {
    throw error;
  }

  return data;
}

export async function GET() {
  try {
    const registro = await obterRegistroStatus();
    return Response.json({ estado: registro.estado || 'desconhecido' });
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
    const { error } = await supabase
      .from('esp32_status')
      .update({ estado: novoEstado })
      .eq('id', registro.id);

    if (error) {
      throw error;
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Erro em POST /api/status:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
