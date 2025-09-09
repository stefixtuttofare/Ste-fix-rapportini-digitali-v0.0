# 🔧 Guida Configurazione EmailJS per Ste-Fix

## 📋 Panoramica
Questa guida ti aiuterà a configurare correttamente EmailJS per l'invio automatico dei rapportini.

## 🚀 Passaggi di Configurazione

### 1. Creazione Account EmailJS
1. Vai su [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea un account gratuito
3. Verifica la tua email

### 2. Configurazione Servizio Email
1. Nel dashboard EmailJS, vai su **Email Services**
2. Clicca **Add New Service**
3. Scegli il tuo provider email (Gmail, Outlook, ecc.)
4. Segui le istruzioni per collegare il tuo account email
5. **Importante**: Annota il **Service ID** generato (es. `service_k1vjewi`)

### 3. Creazione Template Email
1. Vai su **Email Templates**
2. Clicca **Create New Template**
3. Configura il template con questi parametri:

#### Template Settings:
- **Template Name**: `Rapportino Ste-Fix`
- **Subject**: `{{subject}}`
- **To Email**: `{{to_email}}`
- **To Name**: `{{to_name}}`
- **From Name**: `{{from_name}}`
- **Reply To**: `{{reply_to}}`

#### Template Content (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapportino Intervento</title>
</head>
<body>
    {{{message}}}
</body>
</html>
```

#### Parametri Template Richiesti:
- `to_email` - Email destinatario
- `to_name` - Nome destinatario
- `from_name` - Nome mittente
- `reply_to` - Email di risposta
- `subject` - Oggetto email
- `message` - Contenuto HTML (usa {{{message}}} con triple parentesi per HTML)
- `attachment` - Allegato PDF in base64 (opzionale)

4. **Importante**: Annota il **Template ID** generato (es. `template_quyomkn`)

### 4. Ottenere Public Key
1. Vai su **Account** → **General**
2. Nella sezione **API Keys**, copia la **Public Key**
3. **Importante**: Annota la **Public Key** (es. `v_yoPjhvpPz3H80qY`)

### 5. Aggiornare config.js
Modifica il file `config.js` con i tuoi dati:

```javascript
const EMAIL_CONFIG = {
    PUBLIC_KEY: 'LA_TUA_PUBLIC_KEY',     // Sostituisci con la tua Public Key
    SERVICE_ID: 'IL_TUO_SERVICE_ID',     // Sostituisci con il tuo Service ID
    TEMPLATE_ID: 'IL_TUO_TEMPLATE_ID',   // Sostituisci con il tuo Template ID
    // ... resto della configurazione
};
```

## 🧪 Test Configurazione

### Usando il File di Debug
1. Apri `http://localhost:8000/debug-email.html`
2. Verifica che la configurazione sia corretta
3. Inserisci la tua email nel campo di test
4. Clicca "Invia Email Test"
5. Controlla la tua casella email

### Errori Comuni e Soluzioni

#### ❌ "Template not found"
- **Causa**: Template ID errato o template non pubblicato
- **Soluzione**: Verifica il Template ID e assicurati che il template sia attivo

#### ❌ "Service not found"
- **Causa**: Service ID errato o servizio non configurato
- **Soluzione**: Verifica il Service ID e la configurazione del servizio email

#### ❌ "Invalid public key"
- **Causa**: Public Key errata o non valida
- **Soluzione**: Verifica la Public Key nel dashboard EmailJS

#### ❌ "Template parameter missing"
- **Causa**: Parametri del template non corrispondenti
- **Soluzione**: Verifica che tutti i parametri richiesti siano presenti nel template

## 📧 Parametri Email Rapportino

L'applicazione invia questi parametri al template:

```javascript
{
    to_email: 'email@cliente.com',
    to_name: 'Nome Cliente',
    from_name: 'Ste-Fix',
    reply_to: 'info@ste-fix.com',
    subject: '🔧 Rapportino Intervento N° 123 - Cliente',
    message: '<div>...contenuto HTML formattato...</div>',
    attachment: 'base64_pdf_data',
    pdf_filename: 'Rapportino_123_Cliente.pdf'
}
```

## 🔒 Sicurezza

- ✅ La Public Key può essere esposta nel codice frontend
- ✅ EmailJS gestisce l'autenticazione lato server
- ✅ I limiti di invio sono gestiti da EmailJS
- ⚠️ Non esporre mai credenziali email private

## 📞 Supporto

Se hai problemi:
1. Controlla i log nel file di debug
2. Verifica la configurazione nel dashboard EmailJS
3. Consulta la documentazione EmailJS: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)

---

**Versione**: 1.0.0  
**Ultimo aggiornamento**: $(date)  
**Compatibilità**: EmailJS v4
