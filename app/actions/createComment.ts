'use server';

import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';

type ActionResponse = {
  success: boolean;
  message: string;
};

// Inicialização da função de conexão fora da função principal
const sql: NeonQueryFunction<false, false> = neon(process.env.DATABASE_URL!);

export async function createComment(formData: FormData): Promise<ActionResponse> {
  const rawComment = formData.get('comment');

  // Validação de Dados
  if (!rawComment || typeof rawComment !== 'string') {
    return {
      success: false,
      message: 'O campo de comentário é obrigatório e deve ser um texto válido.',
    };
  }

  const comment = rawComment.trim();

  if (comment.length === 0) {
    return {
      success: false,
      message: 'O comentário não pode estar vazio.',
    };
  }

  // Tratamento de Erros com try...catch
  try {
    // CORREÇÃO: Uso da função 'sql' como Template Literal Tagged Function
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;

    revalidatePath('/caminho-da-sua-pagina-de-comentarios');

    return {
      success: true,
      message: 'Comentário criado com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao inserir comentário no banco de dados:', error);
    return {
      success: false,
      message: 'Falha ao criar o comentário. Tente novamente mais tarde.',
    };
  }
}
