# 🚀 Deployment su Vercel - Ste-Fix WebApp

## Prerequisiti
1. Account Vercel (gratuito su [vercel.com](https://vercel.com))
2. Repository Git (GitHub, GitLab, o Bitbucket)

## 📋 Passi per il Deployment

### 1. Preparazione Repository
```bash
# Inizializza repository Git (se non già fatto)
git init
git add .
git commit -m "Initial commit for Vercel deployment"

# Collega a repository remoto
git remote add origin https://github.com/tuousername/ste-fix-webapp.git
git push -u origin main
```

### 2. Configurazione Vercel
1. Vai su [vercel.com](https://vercel.com) e accedi
2. Clicca "New Project"
3. Importa il tuo repository
4. Configura il progetto:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (lascia vuoto)
   - **Output Directory**: (lascia vuoto)
   - **Install Command**: (lascia vuoto)

### 3. Variabili d'Ambiente (Opzionali)
Se hai configurazioni sensibili, aggiungi le variabili d'ambiente:
- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID`

### 4. Deploy
Clicca "Deploy" e attendi il completamento.

## 🔧 File di Configurazione Inclusi

- **`vercel.json`**: Configurazione routing per Vercel
- **`package.json`**: Metadati del progetto
- **`.vercelignore`**: File da escludere dal deployment

## 🌐 Dopo il Deployment

1. Vercel ti fornirà un URL (es: `https://ste-fix-webapp.vercel.app`)
2. Testa tutte le funzionalità:
   - ✅ Creazione rapportini
   - ✅ Generazione ricevute
   - ✅ Invio email
   - ✅ Archivio

## 🐛 Risoluzione Problemi

### Errore 404 su refresh pagina
- ✅ Risolto con configurazione routing in `vercel.json`

### Problemi con EmailJS
- Verifica che le credenziali in `config.js` siano corrette
- Controlla che il dominio Vercel sia autorizzato in EmailJS

### File non trovati
- Verifica che tutti i path siano relativi (non assoluti)
- Controlla `.vercelignore` per file esclusi

## 📱 Dominio Personalizzato

1. Vai nelle impostazioni del progetto Vercel
2. Sezione "Domains"
3. Aggiungi il tuo dominio personalizzato
4. Configura i DNS secondo le istruzioni Vercel

## 🔄 Aggiornamenti Automatici

Ogni push al branch `main` attiverà automaticamente un nuovo deployment.

---

**✨ La tua webapp Ste-Fix è ora online e accessibile da qualsiasi dispositivo!**