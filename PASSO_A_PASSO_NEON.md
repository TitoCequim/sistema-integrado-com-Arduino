# 🚀 Passo a Passo Completo - Configuração com Neon

Este guia vai te levar do zero até o sistema funcionando completamente usando **Neon** como banco de dados.

---

## 📋 Pré-requisitos

- ✅ Conta no GitHub (já deve ter, pois está usando)
- ✅ Projeto já conectado à Vercel (já deve estar)
- ✅ Conta no Gmail (para enviar emails)
- ⏳ Criar conta no Neon (vamos fazer agora)

---

## PASSO 1: Obter Connection String do Neon

### 1.1. Acessar o Projeto Neon
Você já tem um projeto no Neon: https://console.neon.tech/app/projects/gentle-mud-38667321

1. Acesse o link acima e faça login
2. Você verá o dashboard do seu projeto

### 1.2. Obter Connection String
1. No dashboard do Neon, procure por **"Connection Details"** ou **"Connection String"**
2. Você verá algo como:
   ```
   postgresql://usuario:senha@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. ⚠️ **COPIE E GUARDE ESTA CONNECTION STRING!** Você vai precisar dela no Passo 3
4. Se não encontrar, vá em **Settings** → **Connection Details** ou clique no botão **"Connection String"**

### 1.3. Alternativa: Criar Nova Connection String
Se precisar criar uma nova:
1. Vá em **Settings** → **Connections**
2. Clique em **"Create Connection"** ou **"New Connection"**
3. Copie a connection string gerada

---

## PASSO 2: Executar o SQL no Neon

### 2.1. Abrir SQL Editor
1. No dashboard do Neon, clique em **"SQL Editor"** (no menu lateral ou no topo)
2. Clique em **"New Query"** ou **"+"** para criar uma nova query

### 2.2. Copiar e Executar o SQL
1. Abra o arquivo `database/schema.sql` do seu projeto
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Neon
4. Clique em **"Run"** (ou pressione `Ctrl + Enter` / `Cmd + Enter`)
5. ✅ Você deve ver a mensagem: **"Success"** ou **"Query executed successfully"**

### 2.3. Verificar se as Tabelas Foram Criadas
1. No menu lateral, procure por **"Tables"** ou **"Database"**
2. Expanda as tabelas ou vá em **"Schema"**
3. Você deve ver 3 tabelas:
   - ✅ `emails_cadastrados`
   - ✅ `esp32_status`
   - ✅ `wifi_scans`
4. Se as 3 tabelas aparecerem, está tudo certo! ✅

---

## PASSO 3: Configurar Variáveis de Ambiente na Vercel

### 3.1. Acessar Configurações da Vercel
1. Acesse: https://vercel.com
2. Faça login
3. Clique no seu projeto
4. Vá em **Settings** (no topo)
5. Clique em **Environment Variables** (no menu lateral)

### 3.2. Adicionar Connection String do Neon
1. Clique em **"Add New"**
2. Adicione a variável:
   - **Key**: `DATABASE_URL`
   - **Value**: Cole a **Connection String** que você copiou no Passo 1.2
     - Deve ser algo como: `postgresql://usuario:senha@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - **Environments**: Marque todas (Production, Preview, Development)
   - Clique em **Save**

### 3.3. Adicionar Variáveis do Gmail (se ainda não tiver)
1. **APP_PASSWORD** (senha de app do Gmail):
   - Se ainda não tiver, você precisa criar uma "App Password" no Gmail
   - Acesse: https://myaccount.google.com/apppasswords
   - Gere uma senha de app
   - Adicione na Vercel:
     - **Key**: `APP_PASSWORD`
     - **Value**: A senha de app gerada
     - **Environments**: Todas
     - Clique em **Save**

2. **API_GOOGLE_GPS** (chave da Google Geolocation API):
   - Se ainda não tiver, você precisa criar uma chave no Google Cloud
   - Acesse: https://console.cloud.google.com/apis/credentials
   - Crie uma nova chave de API
   - Adicione na Vercel:
     - **Key**: `API_GOOGLE_GPS`
     - **Value**: A chave da API
     - **Environments**: Todas
     - Clique em **Save**

### 3.4. Verificar Variáveis
Você deve ter pelo menos estas 3 variáveis:
- ✅ `DATABASE_URL` (Connection String do Neon)
- ✅ `APP_PASSWORD` (senha de app do Gmail)
- ✅ `API_GOOGLE_GPS` (chave da Google API)

---

## PASSO 4: Fazer Deploy na Vercel

### 4.1. Fazer Commit e Push (se ainda não fez)
1. No terminal, na pasta do projeto:
```bash
git add .
git commit -m "Migração para Neon como banco de dados"
git push
```

### 4.2. Redeploy na Vercel
1. Na Vercel, vá em **Deployments** (no topo)
2. Encontre o último deployment
3. Clique nos **3 pontinhos** (⋯) ao lado
4. Clique em **Redeploy**
5. ⏳ Aguarde o deploy terminar (2-3 minutos)

### 4.3. Verificar se Deploy Funcionou
1. Após o deploy, clique em **"Visit"** para abrir o site
2. Se a página carregar sem erros, está funcionando! ✅

---

## PASSO 5: Testar o Sistema

### 5.1. Testar Cadastro de Email
1. Acesse seu site na Vercel
2. Você deve ver a seção **"📧 Cadastro de Emails para Alertas"**
3. Digite um email válido (ex: `seuemail@gmail.com`)
4. Clique em **"Cadastrar"**
5. ✅ Deve aparecer: **"✅ Email cadastrado com sucesso!"**
6. O email deve aparecer na lista abaixo

### 5.2. Testar Status do ESP32
1. No frontend, você deve ver o **Status do ESP32**
2. Deve mostrar: **"⏳ Aguardando..."** (inicialmente)
3. Quando o ESP32 enviar dados, o status deve atualizar

### 5.3. Testar Envio de Alerta (Simulação)
Para testar se os emails estão sendo enviados:

1. **Opção 1 - Via ESP32**:
   - Configure o ESP32 para enviar `{ estado: "fora" }` para `/api/status`
   - O sistema deve enviar email automaticamente

2. **Opção 2 - Via Código (teste manual)**:
   - Você pode fazer um POST manual para `/api/alerta`:
   ```bash
   curl -X POST https://seu-site.vercel.app/api/alerta \
     -H "Content-Type: application/json" \
     -d '{"estado": "fora"}'
   ```
   - Ou usar Postman/Insomnia

3. ✅ Verifique a caixa de entrada do email cadastrado
4. ✅ Você deve receber um email com o assunto: **"🚨 Alerta: ESP32 saiu do perímetro!"**

---

## PASSO 6: Configurar ESP32 (se ainda não fez)

### 6.1. Endpoint do Status
O ESP32 deve fazer POST para:
```
https://seu-site.vercel.app/api/status
```
Com o body:
```json
{
  "estado": "dentro"
}
```
ou
```json
{
  "estado": "fora"
}
```

### 6.2. Endpoint de Scan Wi-Fi (opcional)
Se quiser usar geolocalização, o ESP32 deve fazer POST para:
```
https://seu-site.vercel.app/api/status2
```
Com o body:
```json
{
  "scan": {
    "wifiAccessPoints": [
      {
        "macAddress": "XX:XX:XX:XX:XX:XX",
        "signalStrength": -45
      }
    ]
  }
}
```

---

## ✅ Checklist Final

Marque quando completar cada item:

- [ ] Connection String do Neon copiada
- [ ] SQL executado com sucesso no Neon
- [ ] 3 tabelas criadas no Neon
- [ ] Variável `DATABASE_URL` configurada na Vercel
- [ ] Deploy feito na Vercel
- [ ] Site carregando sem erros
- [ ] Email cadastrado com sucesso
- [ ] Email de teste recebido
- [ ] ESP32 configurado e enviando dados

---

## 🆘 Problemas Comuns e Soluções

### Erro: "Variável de ambiente DATABASE_URL não configurada"
- ✅ Verifique se a variável está na Vercel
- ✅ Faça um novo deploy após adicionar variável
- ✅ Verifique se o nome está correto: `DATABASE_URL` (case-sensitive)
- ✅ Verifique se a connection string está completa (inclui `?sslmode=require`)

### Erro: "relation does not exist"
- ✅ Execute o SQL novamente no Neon
- ✅ Verifique se as tabelas foram criadas no SQL Editor
- ✅ Verifique se está usando o banco de dados correto

### Erro de conexão com o banco
- ✅ Verifique se a connection string está correta
- ✅ Verifique se o projeto Neon está ativo (não pausado)
- ✅ Verifique se a connection string inclui `?sslmode=require`

### Emails não estão sendo enviados
- ✅ Verifique se `APP_PASSWORD` está configurada corretamente
- ✅ Verifique se há emails cadastrados no banco
- ✅ Verifique os logs da Vercel (Deployments → Functions → Logs)

### Status não atualiza
- ✅ Verifique se o ESP32 está fazendo POST para o endpoint correto
- ✅ Verifique os logs da Vercel
- ✅ Teste fazendo POST manual via Postman/curl

### Site não carrega
- ✅ Verifique se o deploy foi concluído
- ✅ Verifique os logs de erro na Vercel
- ✅ Verifique se todas as dependências estão no `package.json`

---

## 🔍 Verificar Dados no Neon

### Via SQL Editor
1. No Neon, vá em **SQL Editor**
2. Execute queries como:
```sql
-- Ver todos os emails cadastrados
SELECT * FROM emails_cadastrados;

-- Ver status atual
SELECT * FROM esp32_status;

-- Ver scans de Wi-Fi
SELECT * FROM wifi_scans;
```

### Via Dashboard
1. No Neon, procure por **"Tables"** ou **"Database Browser"**
2. Você pode visualizar os dados diretamente na interface

---

## 📞 Precisa de Ajuda?

Se encontrar algum problema:
1. Verifique os logs na Vercel (Deployments → Functions → Logs)
2. Verifique o console do navegador (F12)
3. Verifique os logs do Neon (se disponível)
4. Teste a connection string diretamente com um cliente PostgreSQL

---

## 🎉 Pronto!

Se todos os passos foram concluídos, seu sistema está funcionando! 

Agora você pode:
- ✅ Cadastrar emails para receber alertas
- ✅ Monitorar o status do ESP32 em tempo real
- ✅ Receber emails quando o ESP32 sair do perímetro
- ✅ Usar geolocalização via Google API

**Tudo está persistido no Neon (banco PostgreSQL serverless na nuvem), então funciona perfeitamente na Vercel!** 🚀

---

## 📝 Notas Importantes

- **Neon é serverless**: O banco pode "dormir" após inatividade, mas acorda automaticamente na primeira requisição
- **Connection String**: Guarde-a com segurança, mas ela é necessária para conectar
- **SSL obrigatório**: A connection string deve incluir `?sslmode=require` para funcionar na Vercel
- **Plano Free**: O Neon oferece um plano gratuito generoso, perfeito para este projeto

