import { sql } from '../../../lib/neon';

// GET: Lista todos os emails cadastrados
export async function GET() {
  try {
    const emails = await sql`
      SELECT * FROM emails_cadastrados 
      WHERE ativo = true 
      ORDER BY created_at DESC
    `;

    return Response.json({ ok: true, emails: emails || [] });
  } catch (err) {
    console.error("Erro em GET /api/emails:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// POST: Cadastra um novo email
export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return Response.json({ 
        ok: false, 
        error: "Email inválido. Forneça um email válido." 
      }, { status: 400 });
    }

    // Normaliza o email (minúsculas, trim)
    const emailNormalizado = email.toLowerCase().trim();

    // Verifica se o email já existe
    const existentes = await sql`
      SELECT id, ativo FROM emails_cadastrados 
      WHERE email = ${emailNormalizado}
      LIMIT 1
    `;

    if (existentes && existentes.length > 0) {
      const existente = existentes[0];
      
      // Se existe mas está inativo, reativa
      if (!existente.ativo) {
        await sql`
          UPDATE emails_cadastrados 
          SET ativo = true 
          WHERE id = ${existente.id}
        `;

        return Response.json({ 
          ok: true, 
          message: "Email reativado com sucesso!",
          email: emailNormalizado
        });
      }

      // Se já existe e está ativo
      return Response.json({ 
        ok: false, 
        error: "Este email já está cadastrado." 
      }, { status: 409 });
    }

    // Insere novo email
    const novoEmail = await sql`
      INSERT INTO emails_cadastrados (email, ativo) 
      VALUES (${emailNormalizado}, true)
      RETURNING *
    `;

    return Response.json({ 
      ok: true, 
      message: "Email cadastrado com sucesso!",
      email: novoEmail[0]
    });
  } catch (err) {
    console.error("Erro em POST /api/emails:", err);
    
    // Erro de constraint única (email duplicado)
    if (err.code === '23505' || err.message?.includes('unique constraint') || err.message?.includes('duplicate key')) {
      return Response.json({ 
        ok: false, 
        error: "Este email já está cadastrado." 
      }, { status: 409 });
    }

    return Response.json({ 
      ok: false, 
      error: err.message || "Erro ao cadastrar email" 
    }, { status: 500 });
  }
}

// DELETE: Remove/desativa um email
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return Response.json({ 
        ok: false, 
        error: "Email não fornecido" 
      }, { status: 400 });
    }

    const emailNormalizado = email.toLowerCase().trim();

    // Desativa o email (soft delete)
    await sql`
      UPDATE emails_cadastrados 
      SET ativo = false 
      WHERE email = ${emailNormalizado}
    `;

    return Response.json({ 
      ok: true, 
      message: "Email removido com sucesso!" 
    });
  } catch (err) {
    console.error("Erro em DELETE /api/emails:", err);
    return Response.json({ 
      ok: false, 
      error: err.message || "Erro ao remover email" 
    }, { status: 500 });
  }
}

