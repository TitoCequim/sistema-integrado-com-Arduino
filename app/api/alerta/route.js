import fs from "fs";
import nodemailer from "nodemailer";

const EMAIL_FILE = "emails.json";
const SENDER_EMAIL = "titocgmunhoes@gmail.com";

function getEmails() {
  if (!fs.existsSync(EMAIL_FILE)) {
    fs.writeFileSync(EMAIL_FILE, JSON.stringify({ emails: [] }, null, 2));
  }
  const data = fs.readFileSync(EMAIL_FILE, "utf8");
  return JSON.parse(data).emails;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: "cyawwjslhrbvdats",
  },
});

export async function POST(req) {
  const body = await req.json();
  const { estado } = body;

  if (estado === "fora") {
    const emails = getEmails();
    
    if (emails.length === 0) {
        console.log("Nenhum email cadastrado para enviar alerta.");
        return Response.json({ ok: true, msg: "Nenhum email cadastrado." });
    }

    try {
      for (const email of emails) {
        await transporter.sendMail({
          from: SENDER_EMAIL,
          to: email,
          subject: "Alerta ESP32 fora do perímetro",
          text: "O ESP32 está fora do perímetro!",
        });
        console.log("Alerta enviado para:", email);
      }
      
      return Response.json({ ok: true, msg: `Alerta enviado para ${emails.length} destinatário(s).` });

    } catch (err) {
      console.error("Erro ao enviar email de alerta:", err);
      return Response.json({ ok: false, msg: "Erro ao enviar email de alerta.", error: err.message }, { status: 500 });
    }
  }

  return Response.json({ ok: true, msg: "Estado recebido, mas nenhum alerta necessário." });
}
