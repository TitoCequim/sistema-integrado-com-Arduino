import nodemailer from "nodemailer";
import { supabase } from '../../../lib/supabase';

const SENDER_EMAIL = "titocgmunhoes@gmail.com"; // email gmail
const PASS = process.env.APP_PASSWORD;         

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: PASS,
  },
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { estado } = body;

    // Busca todos os emails cadastrados e ativos
    const { data: emails, error: emailError } = await supabase
      .from('emails_cadastrados')
      .select('email')
      .eq('ativo', true);

    if (emailError) {
      console.error("Erro ao buscar emails:", emailError);
      throw emailError;
    }

    // Se não houver emails cadastrados, retorna sucesso mas não envia
    if (!emails || emails.length === 0) {
      console.log("Nenhum email cadastrado para enviar alerta");
      return Response.json({ 
        ok: true, 
        message: "Alerta processado, mas nenhum email cadastrado para notificar" 
      });
    }

    // Prepara a lista de destinatários
    const destinatarios = emails.map(e => e.email).join(', ');

    // Envia email para todos os emails cadastrados
    const info = await transporter.sendMail({
      from: SENDER_EMAIL,
      to: destinatarios,
      subject: "🚨 Alerta: ESP32 saiu do perímetro!",
      text: "O ESP32 saiu do perímetro! Verifique o dispositivo imediatamente.",
      html: `
        <h2>🚨 Alerta de Segurança</h2>
        <p>O ESP32 saiu do perímetro monitorado!</p>
        <p><strong>Status:</strong> ${estado || 'fora'}</p>
        <p>Verifique o dispositivo imediatamente.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Este é um email automático do sistema de monitoramento.</p>
      `,
    });

    console.log(`Alerta enviado para ${emails.length} email(s):`, emails.map(e => e.email));

    return Response.json({ 
      ok: true, 
      message: `Alerta enviado para ${emails.length} email(s)`,
      emailsEnviados: emails.length
    });
  } catch (err) {
    console.error("Erro ao enviar alerta:", err);
    return Response.json({ 
      ok: false, 
      error: err.message || "Erro ao enviar alerta" 
    }, { status: 500 });
  }
}
