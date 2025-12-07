import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return Response.json({ ok: false, msg: "Email inválido" }, { status: 400 });
  }

  try {
    const existe = await prisma.email.findUnique({
      where: { address: email },
    });

    if (existe) {
      return Response.json({ ok: true, msg: "Email já cadastrado." });
    }

    await prisma.email.create({
      data: { address: email },
    });

    return Response.json({ ok: true, msg: "Email cadastrado!" });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
