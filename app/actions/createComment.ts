'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function createComment(formData: FormData): Promise<ActionResponse> {
  const sql = neon(process.env.DATABASE_URL!);
  const rawComment = formData.get('comment');

  if (!rawComment || typeof rawComment !== 'string') {
    return { success: false, message: 'O campo de comentário é obrigatório.' };
  }

  const comment = rawComment.trim();

  if (comment.length === 0) {
    return { success: false, message: 'O comentário não pode estar vazio.' };
  }

  try {
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;

    // CORREÇÃO: Use o caminho correto. Se a página é a raiz, use '/'.
    revalidatePath('/'); 

    return { success: true, message: 'Comentário criado com sucesso!' };
  } catch (error) {
    console.error('ERRO FATAL NO BANCO DE DADOS:', error);
    return { success: false, message: 'Falha interna ao salvar o comentário.' };
  }
}
