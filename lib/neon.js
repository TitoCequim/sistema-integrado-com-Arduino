import { neon } from '@neondatabase/serverless';

// Tenta usar URL_DO_BANCO_DE_DADOS (criada automaticamente pela Vercel) ou DATABASE_URL
const connectionString = process.env.URL_DO_BANCO_DE_DADOS || process.env.DATABASE_URL || process.env.URL_POSTGRES;

if (!connectionString) {
  throw new Error('Variável de ambiente do banco de dados não configurada. Configure URL_DO_BANCO_DE_DADOS, DATABASE_URL ou URL_POSTGRES com a connection string do Neon.');
}

export const sql = neon(connectionString);

