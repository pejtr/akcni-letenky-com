# 🚀 Kompletní Migrace akcni-letenky: Manus → Claude Code

## ✅ Hotovo (Manus)
- [x] **Checkpoint uložen**: `dca80da3` (Čedok-style redesign + Kiwi widget fix)
- [x] **GitHub repo**: https://github.com/pejtr/akcni-letenky
- [x] **Kód pushnut**: Všechny soubory v GitHub main branch

## 📦 Co je v GitHub repo

```
akcni-letenky/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Home, LevneLetenky, TipyCestovatele, atd.
│   │   ├── components/       # Navigation, Hero, Cards, atd.
│   │   └── lib/              # tRPC client, utils
│   └── index.html            # Kiwi widget script
├── server/                    # Express + tRPC backend
│   ├── routers.ts            # tRPC procedures
│   ├── db.ts                 # Database helpers
│   └── _core/                # OAuth, LLM, storage
├── drizzle/                  # Database schema
│   └── schema.ts             # Tables: users, articles, flights, tips, social_posts
├── shared/                   # Shared types & constants
├── storage/                  # S3 helpers
├── package.json              # Dependencies
└── .env.example              # Template pro .env.local
```

---

## 🔧 Setup v Claude Code (Step-by-Step)

### Krok 1: Clone GitHub repo
```bash
git clone https://github.com/pejtr/akcni-letenky.git
cd akcni-letenky
```

### Krok 2: Nainstaluj dependencies
```bash
pnpm install
# nebo npm install
```

### Krok 3: Vytvoř `.env.local` s Manus secrets

Zkopíruj všechny tyto env variables z Manus Secrets panelu:

```env
# Database (ZMĚŇ na lokální DB)
DATABASE_URL=mysql://root:password@localhost:3306/akcni_letenky
# nebo pro SQLite:
# DATABASE_URL=file:./dev.db

# Manus OAuth
JWT_SECRET=<z Manus Secrets>
VITE_APP_ID=<z Manus Secrets>
OAUTH_SERVER_URL=<z Manus Secrets>
VITE_OAUTH_PORTAL_URL=<z Manus Secrets>
OWNER_OPEN_ID=<z Manus Secrets>
OWNER_NAME=<z Manus Secrets>

# Manus APIs
BUILT_IN_FORGE_API_URL=<z Manus Secrets>
BUILT_IN_FORGE_API_KEY=<z Manus Secrets>
VITE_FRONTEND_FORGE_API_KEY=<z Manus Secrets>
VITE_FRONTEND_FORGE_API_URL=<z Manus Secrets>

# External APIs
RESEND_API_KEY=<z Manus Secrets>
TELEGRAM_BOT_TOKEN=<z Manus Secrets>
TELEGRAM_CHAT_ID=<z Manus Secrets>
TRAVELPAYOUTS_API_TOKEN=<z Manus Secrets>

# Meta Pixel
META_PIXEL_ID=<z Manus Secrets>
META_CONVERSION_API_TOKEN=<z Manus Secrets>
META_TEST_EVENT_CODE=<z Manus Secrets>
VITE_META_PIXEL_ID=<z Manus Secrets>

# Web Push
VAPID_PUBLIC_KEY=<z Manus Secrets>
VAPID_PRIVATE_KEY=<z Manus Secrets>
VITE_VAPID_PUBLIC_KEY=<z Manus Secrets>

# Analytics
VITE_ANALYTICS_ENDPOINT=<z Manus Secrets>
VITE_ANALYTICS_WEBSITE_ID=<z Manus Secrets>

# App Config
VITE_APP_TITLE=Akční Letenky
VITE_APP_LOGO=https://your-logo-url.png
```

### Krok 4: Nastav databázi

#### Varianta A: MySQL (doporučeno - stejné jako Manus)
```bash
# 1. Vytvoř novou DB
mysql -u root -p
> CREATE DATABASE akcni_letenky CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> EXIT;

# 2. Importuj SQL dump z Manus (pokud máš)
mysql -u root -p akcni_letenky < akcni_letenky_dump.sql

# 3. Aktualizuj DATABASE_URL v .env.local
DATABASE_URL=mysql://root:password@localhost:3306/akcni_letenky
```

#### Varianta B: SQLite (jednodušší pro development)
```bash
# Stačí nastavit v .env.local:
DATABASE_URL=file:./dev.db

# Drizzle automaticky vytvoří DB
```

### Krok 5: Inicializuj databázi (Drizzle migrations)
```bash
pnpm db:push
# Vytvoří všechny tabulky podle schema.ts
```

### Krok 6: Spusť dev server
```bash
pnpm dev
# Server běží na http://localhost:5173 (frontend)
# API na http://localhost:3000
```

---

## 🗄️ Databáze - Tabulky

```sql
-- Automaticky vytvořeno Drizzle:
- users (id, openId, name, email, role, createdAt, updatedAt)
- articles (id, slug, title, content, category, createdAt)
- flights (id, origin, destination, price, airline, date)
- tips (id, slug, title, content, category, createdAt)
- social_posts (id, platform, content, scheduledAt, status)
- social_settings (id, platform, token, enabled)
```

---

## 🔐 Secrets Checklist

Zkontroluj, že máš všechny tyto secrets v `.env.local`:

- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] VITE_APP_ID
- [ ] OAUTH_SERVER_URL
- [ ] VITE_OAUTH_PORTAL_URL
- [ ] OWNER_OPEN_ID
- [ ] OWNER_NAME
- [ ] BUILT_IN_FORGE_API_URL
- [ ] BUILT_IN_FORGE_API_KEY
- [ ] VITE_FRONTEND_FORGE_API_KEY
- [ ] VITE_FRONTEND_FORGE_API_URL
- [ ] RESEND_API_KEY
- [ ] TELEGRAM_BOT_TOKEN
- [ ] TELEGRAM_CHAT_ID
- [ ] TRAVELPAYOUTS_API_TOKEN
- [ ] META_PIXEL_ID
- [ ] META_CONVERSION_API_TOKEN
- [ ] META_TEST_EVENT_CODE
- [ ] VITE_META_PIXEL_ID
- [ ] VAPID_PUBLIC_KEY
- [ ] VAPID_PRIVATE_KEY
- [ ] VITE_VAPID_PUBLIC_KEY
- [ ] VITE_ANALYTICS_ENDPOINT
- [ ] VITE_ANALYTICS_WEBSITE_ID
- [ ] VITE_APP_TITLE
- [ ] VITE_APP_LOGO

---

## 🔄 Workflow po Migraci

### Development (Claude Code)
```bash
# 1. Pracuješ na features
pnpm dev

# 2. Commitneš do GitHub
git add .
git commit -m "feat: new feature"
git push origin main
```

### Production (Manus)
```bash
# Manus zůstává běžet na akcni-letenky.com
# Máš 2 možnosti:

# Varianta 1: Ručně pushni do Manus
# - Jdi do Manus Management UI
# - GitHub panel → sync s GitHub repo

# Varianta 2: CI/CD (budoucí setup)
# - Automaticky deploy z GitHub do Manus
```

---

## 🐛 Troubleshooting

### `pnpm install` selhává
```bash
# Vymaž node_modules a lock file
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Database connection error
```bash
# Zkontroluj DATABASE_URL v .env.local
# Zkontroluj, že MySQL/SQLite běží
mysql -u root -p -e "SELECT 1"
```

### Kiwi widget se nezobrazuje
```bash
# Zkontroluj v client/index.html:
# - data-target="widget-holder" je nastaveno
# - data-width="100%" místo "320px"
```

### tRPC errors
```bash
# Zkontroluj server/routers.ts
# Zkontroluj, že DB je inicializovaná (pnpm db:push)
```

---

## 📊 Projekt Info

| | |
|---|---|
| **GitHub** | https://github.com/pejtr/akcni-letenky |
| **Manus Checkpoint** | dca80da3 |
| **Manus Production** | https://akcni-letenky.com |
| **Tech Stack** | React 19 + Express + tRPC + Drizzle |
| **Database** | MySQL (prod) / SQLite (dev) |
| **Features** | OAuth, LLM, S3 storage, Telegram, Meta Pixel |

---

## ✨ Hotové Features

- ✅ Homepage s Čedok-style designem
- ✅ Hero sekce s tab search (Letenky/Dovolená/Tipy)
- ✅ Kiwi.com widget (opraveno)
- ✅ Tipy pro cestovatele (50 témat)
- ✅ Social proof notifications
- ✅ Admin dashboard
- ✅ Seedance resource card
- ✅ Schema.org SEO markup

---

## 🚀 Příští Kroky

1. **IG + LinkedIn Scheduler** — Admin panel pro automatické posty
2. **do-italie.cz propagace** — Affiliate linking
3. **Performance monitoring** — Analytics dashboard
4. **Mobile app** — React Native (budoucí)

---

**Máš otázky?** Vrať se do Claude Code s detaily o chybě a já ti pomůžu! 🎯
