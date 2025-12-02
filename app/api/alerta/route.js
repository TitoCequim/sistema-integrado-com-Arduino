import nodemailer from "nodemailer";

const SENDER_EMAIL = "titocgmunhoes@gmail.com"; // email gmail
const PASS = process.env.APP_PASSWORD;         
const RECEIVER_EMAIL = "tito.78052@aluno.iffar.edu.br";     // o email fixo que vai receber

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: PASS,
  },
});

export async function POST(req) {
  const body = await req.json();
  const { texto } = body;

  await transporter.sendMail({
    from: SENDER_EMAIL,
    to: RECEIVER_EMAIL,
    subject: "Nova mensagem",
    text: "O ESP32 saiu do perímetro!",
  });

  return Response.json({ ok: true });
}
