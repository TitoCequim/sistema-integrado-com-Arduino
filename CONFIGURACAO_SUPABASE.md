# Configuração do Supabase para Persistência de Dados

## Por que usar Supabase?

Na Vercel (serverless), as variáveis em memória são perdidas entre requisições devido ao cold start e múltiplas instâncias. O Supabase resolve isso persistindo os dados em um banco PostgreSQL.

## Passos para Configuração

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - **Name**: nome do projeto (ex: `arduino-integration`)
   - **Database Password**: escolha uma senha forte
   - **Region**: escolha a região mais próxima
5. Aguarde a criação do projeto (pode levar alguns minutos)

### 2. Executar o Schema SQL

1. No painel do Supabase, vá em **SQL Editor** (ícone de banco de dados no menu lateral)
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `database/schema.sql`
4. Clique em **Run** (ou pressione Ctrl+Enter)
5. Verifique se as tabelas foram criadas:
   - Vá em **Table Editor** e confirme que existem as tabelas:
     - `esp32_status`
     - `wifi_scans`

### 3. Obter Credenciais

1. No painel do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie os seguintes valores:
   - **Project URL** (será `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (será `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 4. Configurar Variáveis de Ambiente na Vercel

1. Acesse o painel da Vercel: [https://vercel.com](https://vercel.com)
2. Vá no seu projeto
3. Clique em **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-public
```

5. Se ainda não tiver configurado, adicione também:
```
API_GOOGLE_GPS=sua-chave-da-google-geolocation-api
APP_PASSWORD=sua-senha-de-app-do-gmail
```

6. Clique em **Save**
7. **IMPORTANTE**: Faça um novo deploy para as variáveis terem efeito:
   - Vá em **Deployments**
   - Clique nos três pontos do último deployment
   - Selecione **Redeploy**

### 5. Configurar Variáveis de Ambiente Localmente (Opcional)

Para testar localmente, crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-public
API_GOOGLE_GPS=sua-chave-da-google-geolocation-api
APP_PASSWORD=sua-senha-de-app-do-gmail
```

⚠️ **Nunca commite o arquivo `.env.local` no Git!**

## Estrutura do Banco de Dados

### Tabela `esp32_status`
Armazena o estado atual do ESP32:
- `id`: ID único (auto-incremento)
- `estado`: Estado atual ("dentro", "fora", "desconhecido")
- `updated_at`: Data/hora da última atualização

### Tabela `wifi_scans`
Armazena scans de Wi-Fi para geolocalização:
- `id`: ID único (auto-incremento)
- `scan_data`: Dados completos do scan (JSONB)
- `ultimo_scan_array`: Array do último scan (JSONB)
- `scan_para_enviar`: Scan pronto para enviar à Google API (JSONB)
- `updated_at`: Data/hora da última atualização

### Tabela `emails_cadastrados`
Armazena emails cadastrados para receber alertas:
- `id`: ID único (auto-incremento)
- `email`: Endereço de email (único)
- `ativo`: Se o email está ativo (boolean)
- `created_at`: Data/hora de cadastro
- `updated_at`: Data/hora da última atualização

## Funcionalidades Implementadas

### Cadastro de Emails para Alertas

O sistema agora permite que usuários cadastrem seus emails para receber alertas quando o ESP32 sair do perímetro:

1. **Interface no Frontend**: 
   - Campo de input para inserir email
   - Botão "Cadastrar" para adicionar email
   - Lista de emails cadastrados com opção de remover

2. **API `/api/emails`**:
   - `GET`: Lista todos os emails cadastrados e ativos
   - `POST`: Cadastra um novo email
   - `DELETE`: Remove/desativa um email

3. **Envio de Alertas**:
   - Quando o ESP32 sai do perímetro, o sistema busca todos os emails cadastrados
   - Envia email de alerta para todos os emails ativos simultaneamente
   - O email contém informações sobre o status do dispositivo

## Verificação

Após configurar, teste:

1. **Cadastro de Email**:
   - Acesse a interface no frontend
   - Insira um email válido e clique em "Cadastrar"
   - Verifique se o email aparece na lista

2. **Status do ESP32**:
   - O ESP32 envia POST para `/api/status` com `{ estado: "dentro" }`
   - O frontend consulta GET `/api/status` e deve retornar `{ estado: "dentro" }`

3. **Geolocalização**:
   - O ESP32 envia POST para `/api/status2` com scan de Wi-Fi
   - O botão "Chamar Google" no frontend deve enviar o scan para a Google API

4. **Alertas**:
   - Quando o estado muda para "fora", todos os emails cadastrados recebem um alerta
   - Verifique a caixa de entrada dos emails cadastrados

## Troubleshooting

### Erro: "Variáveis de ambiente do Supabase não configuradas"
- Verifique se as variáveis estão configuradas na Vercel
- Faça um novo deploy após adicionar as variáveis
- Para local, verifique o arquivo `.env.local`

### Erro: "relation does not exist"
- Execute o SQL do arquivo `database/schema.sql` no SQL Editor do Supabase

### Dados não persistem
- Verifique se as tabelas foram criadas corretamente
- Verifique os logs da Vercel para erros do Supabase
- Confirme que as credenciais estão corretas

