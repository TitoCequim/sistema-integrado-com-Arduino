import { supabase } from '../../../lib/supabase';

// GET: Lista todos os emails cadastrados
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('emails_cadastrados')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return Response.json({ ok: true, emails: data || [] });
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
    const { data: existente } = await supabase
      .from('emails_cadastrados')
      .select('id, ativo')
      .eq('email', emailNormalizado)
      .single();

    if (existente) {
      // Se existe mas está inativo, reativa
      if (!existente.ativo) {
        const { error: updateError } = await supabase
          .from('emails_cadastrados')
          .update({ ativo: true })
          .eq('id', existente.id);

        if (updateError) {
          throw updateError;
        }

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
    const { data, error } = await supabase
      .from('emails_cadastrados')
      .insert({ email: emailNormalizado, ativo: true })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ 
      ok: true, 
      message: "Email cadastrado com sucesso!",
      email: data 
    });
  } catch (err) {
    console.error("Erro em POST /api/emails:", err);
    
    // Erro de constraint única (email duplicado)
    if (err.code === '23505') {
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
    const { error } = await supabase
      .from('emails_cadastrados')
      .update({ ativo: false })
      .eq('email', emailNormalizado);

    if (error) {
      throw error;
    }

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

