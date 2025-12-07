# ⚡ Resumo Rápido - Configuração com Neon

## 🎯 4 Passos Principais

### 1️⃣ Obter Connection String do Neon
- Acesse: https://console.neon.tech/app/projects/gentle-mud-38667321
- Copie a **Connection String** (algo como `postgresql://...`)

### 2️⃣ Executar SQL
- SQL Editor → New Query
- Cole conteúdo de `database/schema.sql`
- Run ✅

### 3️⃣ Variáveis na Vercel
- Settings → Environment Variables
- Adicione:
  - `DATABASE_URL` (Connection String do Neon)
  - `APP_PASSWORD` (Gmail)
  - `API_GOOGLE_GPS` (Google)

### 4️⃣ Deploy
- Deployments → Redeploy
- Aguarde concluir ✅

---

## 📝 Checklist

```
[ ] Connection String copiada
[ ] SQL executado
[ ] DATABASE_URL configurada
[ ] Deploy feito
[ ] Email cadastrado
[ ] Teste funcionando
```

---

📖 **Guia completo**: Veja `PASSO_A_PASSO_NEON.md`

