import { sql } from '../../../lib/neon';

const GOOGLE_API_KEY = process.env.API_GOOGLE_GPS;

// Função que envia para Google
async function enviarParaGoogle(dados) {
  if (!GOOGLE_API_KEY) {
    throw new Error('API_GOOGLE_GPS não configurada');
  }

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

// Função auxiliar para obter ou criar registro de wifi_scans
async function obterRegistroWifiScans() {
  try {
    // Tenta obter o registro existente
    const registros = await sql`
      SELECT * FROM wifi_scans LIMIT 1
    `;

    if (registros && registros.length > 0) {
      return registros[0];
    }

    // Se não existe, cria um novo
    const novoRegistro = await sql`
      INSERT INTO wifi_scans (scan_data, ultimo_scan_array, scan_para_enviar) 
      VALUES ('{}'::jsonb, '[]'::jsonb, NULL) 
      RETURNING *
    `;

    return novoRegistro[0];
  } catch (err) {
    console.error("Erro ao obter registro de wifi_scans:", err);
    throw err;
  }
}

// GET para enviar scan para Google (quando há scan pronto)
export async function GET() {
  try {
    const registro = await obterRegistroWifiScans();
    
    if (!registro.scan_para_enviar) {
      return new Response(JSON.stringify({ ok: false, error: "Nenhum scan para enviar" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resultado = await enviarParaGoogle(registro.scan_para_enviar);
    
    // Limpa o scan após envio
    await sql`
      UPDATE wifi_scans 
      SET scan_para_enviar = NULL
      WHERE id = ${registro.id}
    `;

    return new Response(JSON.stringify({ ok: true, resultado }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("Erro em GET /api/status2:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST para receber scan da ESP32 ou chamar Google
export async function POST(req) {
  try {
    const body = await req.json();

    // Se for ação "chamar_google", envia o scan atual para Google
    if (body.acao === "chamar_google") {
      const registro = await obterRegistroWifiScans();
      
      if (!registro.scan_para_enviar) {
        return new Response(JSON.stringify({ ok: false, error: "Nenhum scan para enviar" }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const resultado = await enviarParaGoogle(registro.scan_para_enviar);
      
      // Limpa o scan após envio
      await sql`
        UPDATE wifi_scans 
        SET scan_para_enviar = NULL
        WHERE id = ${registro.id}
      `;

      return new Response(JSON.stringify({ ok: true, resultado }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Caso contrário, processa scan do ESP32
    const novoScanArray = body.scan?.wifiAccessPoints || [];
    const registro = await obterRegistroWifiScans();
    
    const ultimoScanArray = registro.ultimo_scan_array || [];
    
    // Compara com o último scan
    const mudou = JSON.stringify(novoScanArray) !== JSON.stringify(ultimoScanArray);

    if (mudou) {
      // Atualiza no banco de dados
      await sql`
        UPDATE wifi_scans 
        SET 
          scan_data = ${JSON.stringify(body)}::jsonb,
          ultimo_scan_array = ${JSON.stringify(novoScanArray)}::jsonb,
          scan_para_enviar = ${JSON.stringify(body)}::jsonb
        WHERE id = ${registro.id}
      `;

      console.log("Novo scan recebido e pronto para envio:", body);
    } else {
      console.log("Nenhuma alteração no scan. Nada para enviar.");
    }

    return new Response(JSON.stringify({ ok: true, mudou }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("Erro em POST /api/status2:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message || "JSON inválido" }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
