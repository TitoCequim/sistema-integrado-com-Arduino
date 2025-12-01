import fs from "fs";
import nodemailer from "nodemailer";

const EMAIL_FILE = process.env.EMAIL;

const SENDER_EMAIL = "titocgmunhoes@gmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: "cyawwjslhrbvdats",
  },
});

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return Response.json({ ok: false, msg: "Email inválido" }, { status: 400 });
  }

  let data;
  let isNewEmail = false;

  try {
    if (!fs.existsSync(EMAIL_FILE)) {
      data = { emails: [] };
    } else {
      const fileContent = fs.readFileSync(EMAIL_FILE, "utf8");
      data = JSON.parse(fileContent);
    }

    if (!data.emails.includes(email)) {
      data.emails.push(email);
      fs.writeFileSync(EMAIL_FILE, JSON.stringify(data, null, 2));
      isNewEmail = true;
      console.log(`Email ${email} cadastrado com sucesso.`);
    } else {
      console.log(`Email ${email} já estava cadastrado.`);
    }
  } catch (error) {
    console.error("Erro ao manipular o arquivo emails.json:", error);
    return Response.json({ ok: false, msg: "Erro interno ao cadastrar o email." }, { status: 500 });
  }

  if (isNewEmail) {
    try {
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: email,
        subject: "Cadastro realizado!",
        text: "Olá! Seu email foi cadastrado com sucesso.",
      });
      console.log("Email de teste enviado para", email);
      return Response.json({ ok: true, msg: "Email cadastrado e email de teste enviado!" });
    } catch (err) {
      console.error("Erro ao enviar email de teste:", err);
      return Response.json({ ok: true, msg: "Email cadastrado, mas houve um erro ao enviar o email de teste." });
    }
  }

  return Response.json({ ok: true, msg: "Email já cadastrado. Nenhum email de teste enviado." });
}
