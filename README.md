# Ste-Fix - Gestione Rapportini Digitali

Applicazione web per la gestione digitale dei rapportini di intervento tecnico con firme digitali e invio automatico via email.

## ✨ Caratteristiche

- **Interfaccia moderna e responsive** - Ottimizzata per desktop, tablet e smartphone
- **Gestione dati cliente** - Inserimento completo dei dati cliente con validazione email
- **Compilazione rapportino** - Form completo per tutti i dettagli dell'intervento
- **Firme digitali** - Firma con dito su touchscreen per operatore e cliente
- **Generazione PDF automatica** - Rapportino professionale in formato PDF
- **Invio email automatico** - Invio immediato del rapportino al cliente
- **Validazione dati** - Controlli automatici per garantire completezza delle informazioni

## 📋 Campi del Rapportino

### Dati Cliente
- Nome e Cognome (obbligatori)
- Email (obbligatoria - per invio automatico)
- Telefono (opzionale)
- Indirizzo (opzionale)

### Dati Intervento
- Data intervento (obbligatoria)
- Ora inizio e fine (obbligatorie)
- Ore viaggio A/R totali
- KM percorsi A/R totali
- Descrizione dettagliata intervento (obbligatoria)
- Materiali utilizzati
- Osservazioni del cliente

### Firme Digitali
- Firma operatore con nome e cognome
- Firma cliente con nome e cognome

## 🚀 Installazione e Configurazione

### 1. File dell'Applicazione
L'applicazione è composta da questi file:
- `index.html` - Interfaccia principale
- `styles.css` - Stili e layout responsive
- `script.js` - Logica dell'applicazione
- `config.js` - Configurazione EmailJS
- `email-template.html` - Template HTML per email automatiche
- `SETUP-EMAIL.md` - Guida configurazione sistema email
- `README.md` - Questo file di documentazione

### 2. Sistema Email Automatiche

#### Template Email Professionale
L'applicazione include un sistema completo di email automatiche con:
- **Template HTML responsive** (`email-template.html`)
- **Invio automatico** del PDF firmato in allegato
- **Contenuto personalizzato** con tutti i dettagli dell'intervento
- **Copia aziendale** per archivio

#### Configurazione EmailJS (OBBLIGATORIA per l'invio email)

**Passo 1: Crea account EmailJS**
1. Vai su [https://www.emailjs.com/](https://www.emailjs.com/)
2. Registrati per un account gratuito (fino a 200 email/mese)
3. Verifica la tua email

**Passo 2: Configura il servizio email**
1. Nel dashboard EmailJS, vai su "Email Services"
2. Clicca "Add New Service"
3. Scegli il tuo provider (Gmail, Outlook, Yahoo, ecc.)
4. Segui le istruzioni per collegare il tuo account email
5. Annota il **Service ID** generato

**Passo 3: Crea template email**
1. Vai su "Email Templates"
2. Clicca "Create New Template"
3. Usa il template HTML fornito
4. Configura campi: `to_email`, `cc_email`, `from_name`, `subject`, `html_content`, `attachment`
5. Annota il **Template ID** generato

**Passo 4: Ottieni User ID**
1. Vai su "Account" nel menu
2. Copia il tuo **User ID**

**Passo 5: Aggiorna config.js**
```javascript
const EMAIL_CONFIG = {
    PUBLIC_KEY: 'la_tua_public_key',
    SERVICE_ID: 'il_tuo_service_id',
    TEMPLATE_ID: 'il_tuo_template_id'
};
```

📋 **Guida dettagliata:** Consulta `SETUP-EMAIL.md` per istruzioni complete

### 3. Avvio dell'Applicazione

#### Opzione A: Apertura diretta
1. Apri il file `index.html` con un browser web moderno
2. L'applicazione sarà immediatamente utilizzabile

#### Opzione B: Server locale (consigliato)
1. Installa un server web locale come:
   - **Live Server** (estensione VS Code)
   - **Python**: `python -m http.server 8000`
   - **Node.js**: `npx serve .`
2. Accedi all'applicazione tramite `http://localhost:8000`

## 📱 Utilizzo dell'Applicazione

### 1. Inserimento Dati Cliente
- Compila tutti i campi obbligatori (contrassegnati con *)
- L'email è fondamentale per l'invio automatico
- Clicca "Procedi al Rapportino"

### 2. Compilazione Rapportino
- Inserisci data e orari dell'intervento
- Compila la descrizione dettagliata (obbligatoria)
- Aggiungi materiali utilizzati e osservazioni
- Clicca "Procedi alle Firme"

### 3. Firme Digitali
- Inserisci nome e cognome dell'operatore
- Firma nell'area dedicata (usa il dito su touchscreen)
- Ripeti per la firma del cliente
- Clicca "Salva e Invia Rapportino"

### 4. Generazione e Invio
- L'applicazione genera automaticamente un PDF professionale
- Il rapportino viene inviato immediatamente all'email del cliente
- Riceverai una conferma di invio riuscito

## Personalizzazione

### Modifica del Logo/Intestazione
Nel file `index.html`, modifica:
```html
<h1>Ste-Fix - Rapportini Digitali</h1>
<p>Sistema di gestione rapportini per interventi tecnici</p>
```

### Modifica dei Colori
Nel file `styles.css`, cerca e modifica le variabili colore:
```css
/* Colori principali */
--primary-color: #3498db;
--secondary-color: #2c3e50;
--success-color: #27ae60;
```

### Aggiunta di Campi
Per aggiungere nuovi campi al rapportino:
1. Aggiungi il campo HTML in `index.html`
2. Aggiorna la funzione `salvaDatiRapportino()` in `script.js`
3. Modifica la funzione `generaPDF()` per includere il nuovo campo

## 📋 Requisiti Tecnici

- **Browser**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **JavaScript**: Abilitato
- **Connessione Internet**: Necessaria per invio email
- **Touchscreen**: Consigliato per firme digitali (opzionale)

## 🔒 Sicurezza e Privacy

- I dati vengono elaborati solo localmente nel browser
- Nessun dato viene salvato su server esterni
- Le email vengono inviate tramite EmailJS con crittografia TLS
- I PDF vengono generati localmente e non memorizzati

## 🐛 Risoluzione Problemi

### L'email non viene inviata
1. Verifica la configurazione EmailJS
2. Controlla la connessione internet
3. Verifica che l'email del cliente sia valida
4. Controlla la console del browser per errori

### Le firme non funzionano
1. Assicurati che JavaScript sia abilitato
2. Su mobile, usa il dito direttamente sullo schermo
3. Prova a ricaricare la pagina

### Il PDF non si genera
1. Verifica che tutti i campi obbligatori siano compilati
2. Controlla che le firme siano presenti
3. Prova con un browser diverso

## 📞 Supporto

Per assistenza tecnica o personalizzazioni:
- Email: support@ste-fix.com
- Documentazione: Questo file README

## 📄 Licenza

Questo software è proprietario di Ste-Fix. Tutti i diritti riservati.

---

**Versione**: 1.0.0  
**Ultimo aggiornamento**: Gennaio 2024  
**Sviluppato per**: Ste-Fix - Servizi Tecnici