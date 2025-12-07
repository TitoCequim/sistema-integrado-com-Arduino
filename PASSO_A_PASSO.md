# 🚀 Passo a Passo Completo - Configuração do Sistema

Este guia vai te levar do zero até o sistema funcionando completamente.

---

## 📋 Pré-requisitos

- ✅ Conta no GitHub (já deve ter, pois está usando)
- ✅ Projeto já conectado à Vercel (já deve estar)
- ✅ Conta no Gmail (para enviar emails)
- ⏳ Criar conta no Supabase (vamos fazer agora)

---

## PASSO 1: Criar Projeto no Supabase

### 1.1. Acessar o Supabase
1. Acesse: https://supabase.com
2. Clique em **"Sign In"** ou **"Start your project"**
3. Faça login com GitHub (mais fácil) ou crie uma conta

### 1.2. Criar Novo Projeto
1. No dashboard, clique em **"New Project"**
2. Preencha os dados:
   - **Name**: `arduino-integration` (ou outro nome de sua escolha)
   - **Database Password**: ⚠️ **ANOTE ESTA SENHA!** Você vai precisar dela
   - **Region**: Escolha a mais próxima (ex: `South America (São Paulo)`)
   - **Pricing Plan**: Escolha **Free** (plano gratuito)
3. Clique em **"Create new project"**
4. ⏳ Aguarde 2-3 minutos enquanto o projeto é criado

### 1.3. Obter Credenciais
1. No painel do projeto, vá em **Settings** (ícone de engrenagem ⚙️ no menu lateral esquerdo)
2. Clique em **API** (no menu Settings)
3. Você verá duas informações importantes:
   - **Project URL**: Algo como `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key: Uma chave longa começando com `eyJ...`
4. ⚠️ **COPIE E GUARDE ESSAS DUAS INFORMAÇÕES!** Você vai precisar delas no Passo 3

---

## PASSO 2: Executar o SQL no Supabase

### 2.1. Abrir SQL Editor
1. No painel do Supabase, clique em **SQL Editor** (ícone de banco de dados no menu lateral)
2. Clique em **"New Query"** (botão no topo)

### 2.2. Copiar e Executar o SQL
1. Abra o arquivo `database/schema.sql` do seu projeto
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione `Ctrl + Enter` / `Cmd + Enter`)
5. ✅ Você deve ver a mensagem: **"Success. No rows returned"**

### 2.3. Verificar se as Tabelas Foram Criadas
1. No menu lateral, clique em **Table Editor** (ícone de tabela)
2. Você deve ver 3 tabelas:
   - ✅ `emails_cadastrados`
   - ✅ `esp32_status`
   - ✅ `wifi_scans`
3. Se as 3 tabelas aparecerem, está tudo certo! ✅

---

## PASSO 3: Configurar Variáveis de Ambiente na Vercel

### 3.1. Acessar Configurações da Vercel
1. Acesse: https://vercel.com
2. Faça login
3. Clique no seu projeto
4. Vá em **Settings** (no topo)
5. Clique em **Environment Variables** (no menu lateral)

### 3.2. Adicionar Variáveis do Supabase
1. Clique em **"Add New"**
2. Adicione a primeira variável:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Cole a **Project URL** que você copiou no Passo 1.3
   - **Environments**: Marque todas (Production, Preview, Development)
   - Clique em **Save**

3. Clique em **"Add New"** novamente
4. Adicione a segunda variável:
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Cole a **anon public key** que você copiou no Passo 1.3
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
Você deve ter pelo menos estas 4 variáveis:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `APP_PASSWORD`
- ✅ `API_GOOGLE_GPS`

---

## PASSO 4: Fazer Deploy na Vercel

### 4.1. Fazer Commit e Push (se ainda não fez)
1. No terminal, na pasta do projeto:
```bash
git add .
git commit -m "Adiciona persistência com Supabase e cadastro de emails"
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

- [ ] Conta no Supabase criada
- [ ] Projeto no Supabase criado
- [ ] SQL executado com sucesso
- [ ] 3 tabelas criadas no Supabase
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Deploy feito na Vercel
- [ ] Site carregando sem erros
- [ ] Email cadastrado com sucesso
- [ ] Email de teste recebido
- [ ] ESP32 configurado e enviando dados

---

## 🆘 Problemas Comuns e Soluções

### Erro: "Variáveis de ambiente do Supabase não configuradas"
- ✅ Verifique se as variáveis estão na Vercel
- ✅ Faça um novo deploy após adicionar variáveis
- ✅ Verifique se os nomes estão corretos (case-sensitive)

### Erro: "relation does not exist"
- ✅ Execute o SQL novamente no Supabase
- ✅ Verifique se as tabelas foram criadas no Table Editor

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

## 📞 Precisa de Ajuda?

Se encontrar algum problema:
1. Verifique os logs na Vercel (Deployments → Functions → Logs)
2. Verifique o console do navegador (F12)
3. Verifique os logs do Supabase (Logs → API)

---

## 🎉 Pronto!

Se todos os passos foram concluídos, seu sistema está funcionando! 

Agora você pode:
- ✅ Cadastrar emails para receber alertas
- ✅ Monitorar o status do ESP32 em tempo real
- ✅ Receber emails quando o ESP32 sair do perímetro
- ✅ Usar geolocalização via Google API

**Tudo está persistido no Supabase (banco na nuvem), então funciona perfeitamente na Vercel!** 🚀

