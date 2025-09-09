# 🚨 Risoluzione Problemi EmailJS - Non Ricevo Email

## 🔍 Diagnosi Rapida

### 1. Verifica Configurazione Base
- [ ] **Credenziali EmailJS**: Apri `http://localhost:8000/test-email-simple.html`
- [ ] **Public Key**: Deve essere valida (non `YOUR_PUBLIC_KEY`)
- [ ] **Service ID**: Deve corrispondere al servizio configurato
- [ ] **Template ID**: Deve corrispondere al template creato

### 2. Problemi Comuni e Soluzioni

#### ❌ **Problema**: "Template not found" o "Invalid template"
**Causa**: Template ID errato o template non attivo

**Soluzioni**:
1. Vai su [EmailJS Dashboard](https://dashboard.emailjs.com/admin/templates)
2. Verifica che il template esista e sia **ATTIVO**
3. Copia esattamente il Template ID
4. Aggiorna `config.js` con l'ID corretto

#### ❌ **Problema**: "Service not found" o "Invalid service"
**Causa**: Service ID errato o servizio non configurato

**Soluzioni**:
1. Vai su [EmailJS Dashboard](https://dashboard.emailjs.com/admin/integration)
2. Verifica che il servizio email sia configurato e **CONNESSO**
3. Copia esattamente il Service ID
4. Testa la connessione del servizio

#### ❌ **Problema**: "Invalid public key" o "Unauthorized"
**Causa**: Public Key errata

**Soluzioni**:
1. Vai su [EmailJS Dashboard](https://dashboard.emailjs.com/admin/account)
2. Nella sezione "API Keys", copia la **Public Key**
3. Aggiorna `config.js` con la chiave corretta

#### ❌ **Problema**: Email inviata ma non ricevuta
**Causa**: Problemi di consegna o configurazione email

**Soluzioni**:
1. **Controlla SPAM/Posta Indesiderata**
2. **Verifica indirizzo destinatario** (typo nell'email)
3. **Controlla limiti EmailJS** (account gratuito: 200 email/mese)
4. **Verifica configurazione servizio email**:
   - Gmail: Controlla "App meno sicure" o usa App Password
   - Outlook: Verifica autenticazione a due fattori

### 3. Test Passo-Passo

#### Passo 1: Test Configurazione
```
1. Apri: http://localhost:8000/test-email-simple.html
2. Clicca "🔍 Verifica Configurazione"
3. Tutti i parametri devono essere ✅ Validi
```

#### Passo 2: Test Inizializzazione
```
1. Clicca "🚀 Inizializza EmailJS"
2. Deve apparire: "✅ EmailJS inizializzato con successo!"
```

#### Passo 3: Test Invio
```
1. Inserisci la TUA email nel campo
2. Clicca "📤 Invia Email Test"
3. Controlla i log per errori
4. Controlla la tua casella email (anche SPAM)
```

### 4. Configurazione Template EmailJS

#### Template Corretto per Ste-Fix:
```html
<!-- Subject -->
{{subject}}

<!-- To Email -->
{{to_email}}

<!-- From Name -->
{{from_name}}

<!-- Reply To -->
{{reply_to}}

<!-- Message Body (HTML) -->
{{{message}}}
```

**IMPORTANTE**: Usa `{{{message}}}` con **3 parentesi graffe** per contenuto HTML!

### 5. Verifica Account EmailJS

#### Limiti Account Gratuito:
- ✅ 200 email/mese
- ✅ 2 servizi email
- ✅ Template illimitati

#### Come Controllare Utilizzo:
1. Vai su [EmailJS Dashboard](https://dashboard.emailjs.com/admin)
2. Controlla "Usage" nella sidebar
3. Verifica di non aver superato i limiti

### 6. Debug Avanzato

#### Console Browser (F12):
```javascript
// Testa manualmente EmailJS
emailjs.init('TUA_PUBLIC_KEY');
emailjs.send('TUO_SERVICE_ID', 'TUO_TEMPLATE_ID', {
    to_email: 'tua@email.com',
    subject: 'Test',
    message: 'Test message'
}).then(response => {
    console.log('SUCCESS!', response);
}).catch(error => {
    console.log('FAILED...', error);
});
```

#### Log Applicazione:
- Apri Console Browser (F12)
- Riproduci il problema
- Cerca errori in rosso
- Copia e analizza i messaggi di errore

### 7. Soluzioni Alternative

Se EmailJS continua a non funzionare:

#### Opzione A: Ricrea Configurazione
1. Crea nuovo servizio email su EmailJS
2. Crea nuovo template
3. Aggiorna credenziali in `config.js`

#### Opzione B: Verifica Provider Email
- **Gmail**: Potrebbe richiedere "App Password"
- **Outlook**: Verifica impostazioni sicurezza
- **Altri**: Controlla configurazione SMTP

### 8. Checklist Finale

- [ ] ✅ Credenziali EmailJS corrette
- [ ] ✅ Template attivo e configurato
- [ ] ✅ Servizio email connesso
- [ ] ✅ Test con `test-email-simple.html` funzionante
- [ ] ✅ Email ricevuta (controllato anche SPAM)
- [ ] ✅ Limiti account non superati
- [ ] ✅ Console browser senza errori

---

## 📞 Supporto

Se il problema persiste:
1. 📧 Controlla [EmailJS Status](https://status.emailjs.com/)
2. 📖 Consulta [EmailJS Docs](https://www.emailjs.com/docs/)
3. 🔧 Usa il file `test-email-simple.html` per debug

**Ultimo aggiornamento**: $(date)
