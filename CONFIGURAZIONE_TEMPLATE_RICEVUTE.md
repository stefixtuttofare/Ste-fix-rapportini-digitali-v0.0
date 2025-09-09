# 📧 Configurazione Template EmailJS per Ricevute

## 🎯 Panoramica
Questo documento ti guida nella configurazione del nuovo template EmailJS per l'invio automatico delle email delle ricevute senza allegato PDF.

## 📋 Prerequisiti
- Account EmailJS attivo
- Servizio email già configurato (Gmail, Outlook, etc.)
- Template ID: `template_ricevute_simple`

## 🚀 Procedura di Configurazione

### 1. Accesso a EmailJS
1. Vai su [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)
2. Accedi al tuo account
3. Seleziona il tuo servizio email esistente

### 2. Creazione del Template
1. Clicca su **"Email Templates"** nel menu laterale
2. Clicca su **"Create New Template"**
3. Imposta il **Template ID** come: `template_ricevute_simple`
4. Imposta il **Template Name** come: `Ricevute Ste-Fix - Riepilogo`

### 3. Configurazione Parametri
Nella sezione **"Settings"**, configura questi parametri:

#### 📬 Parametri Email Base
```
To Email: {{to_email}}
To Name: {{to_name}}
Subject: {{subject}}
From Name: Ste-Fix
Reply To: [tua-email-aziendale]
```

#### 📊 Parametri Ricevuta
```
numero_ricevuta: {{numero_ricevuta}}
data_ricevuta: {{data_ricevuta}}
descrizione: {{descrizione}}
ore_lavorate: {{ore_lavorate}}
chilometri: {{chilometri}}
ore_viaggio: {{ore_viaggio}}
costo_materiali: {{costo_materiali}}
totale: {{totale}}
```

### 4. Template HTML
Copia il contenuto del file `template-ricevute-emailjs.html` nella sezione **"Content"**.

### 5. Test del Template
1. Clicca su **"Test"**
2. Compila i parametri di test:
   ```
   to_email: tua-email@test.com
   to_name: Cliente Test
   subject: Test Ricevuta RIC-20240115-001
   numero_ricevuta: RIC-20240115-001
   data_ricevuta: 15/01/2024
   descrizione: Riparazione impianto elettrico
   ore_lavorate: 3
   chilometri: 25
   ore_viaggio: 1
   costo_materiali: €50.00
   totale: €180.00
   ```
3. Clicca **"Send Test"**

### 6. Salvataggio
1. Clicca **"Save"** per salvare il template
2. Verifica che il Template ID sia: `template_ricevute_simple`

## ✅ Verifica Configurazione

### File Aggiornati
- ✅ `config.js` - Aggiunto `TEMPLATE_ID_SIMPLE`
- ✅ `script.js` - Aggiunte variabili EmailJS
- ✅ `script.js` - Aggiornata funzione `inviaEmailRicevuta()`

### Variabili Configurate
```javascript
// In config.js
TEMPLATE_ID_SIMPLE: 'template_ricevute_simple'

// In script.js
window.EMAIL_TEMPLATE_ID_SIMPLE = EMAIL_CONFIG.TEMPLATE_ID_SIMPLE;
```

## 🔧 Funzionalità

### Email Automatica Ricevute
- **Trigger**: Quando si clicca "📧 Genera e Invia Ricevuta"
- **Contenuto**: Riepilogo dettagliato senza PDF allegato
- **Template**: HTML formattato con stile professionale
- **Parametri**: Tutti i dati della ricevuta inclusi

### Differenze con Rapportini
| Caratteristica | Rapportini | Ricevute |
|---|---|---|
| Template ID | `template_quyomkn` | `template_ricevute_simple` |
| Allegato PDF | ✅ Sì | ❌ No |
| Contenuto | Rapportino completo | Riepilogo ricevuta |
| Funzione | `inviaEmailRapportino()` | `inviaEmailRicevuta()` |

## 🐛 Risoluzione Problemi

### Errore "Template not found"
- Verifica che il Template ID sia esattamente: `template_ricevute_simple`
- Controlla che il template sia salvato e attivo

### Email non ricevute
- Verifica la configurazione del servizio email
- Controlla la cartella spam
- Testa con un indirizzo email diverso

### Parametri mancanti
- Verifica che tutti i parametri siano configurati nel template
- Controlla la sintassi: `{{nome_parametro}}`

## 📞 Supporto
Per problemi con EmailJS:
- [Documentazione ufficiale](https://www.emailjs.com/docs/)
- [FAQ EmailJS](https://www.emailjs.com/docs/faq/)
- [Supporto EmailJS](https://www.emailjs.com/contact/)

---

**✨ Configurazione completata!** 
Ora le ricevute invieranno automaticamente email di riepilogo ai clienti senza allegato PDF.