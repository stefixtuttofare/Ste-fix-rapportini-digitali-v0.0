// Configurazione EmailJS per l'invio automatico dei rapportini
// IMPORTANTE: Sostituisci questi valori con le tue credenziali EmailJS

const EMAIL_CONFIG = {
    // La tua Public Key di EmailJS v4 (sostituisce USER_ID)
    PUBLIC_KEY: 'v_yoPjhvpPz3H80qY',
    
    // Il tuo Service ID (es. Gmail, Outlook, ecc.)
    SERVICE_ID: 'service_k1vjewi',
    
    // Il tuo Template ID per l'invio dei rapportini
    TEMPLATE_ID: 'template_quyomkn',
    
    // Il tuo Template ID per l'invio delle ricevute (senza allegato PDF)
    TEMPLATE_ID_SIMPLE: 'template_3cmps1k',
    
    // Template per email automatiche
    EMAIL_TEMPLATE: {
        subject: 'Rapportino Intervento N° {{numeroIntervento}} - {{nomeCliente}}',
        to_email: '{{emailCliente}}', // Email del cliente
        cc_email: '{{emailAzienda}}', // Email aziendale in copia
        from_name: '{{nomeAzienda}}',
        reply_to: '{{emailAzienda}}'
    }
};

// Configurazione dell'applicazione
const APP_CONFIG = {
    // Nome dell'azienda
    COMPANY_NAME: 'Ste-Fix',
    
    // Email di supporto
    SUPPORT_EMAIL: 'support@ste-fix.com',
    
    // Versione dell'applicazione
    VERSION: '1.0.0'
};

// Esporta le configurazioni per l'uso nell'applicazione
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EMAIL_CONFIG, APP_CONFIG };
}

// ISTRUZIONI PER LA CONFIGURAZIONE EMAILJS v4:
/*
1. Vai su https://www.emailjs.com/ e crea un account gratuito
2. Crea un nuovo servizio email (Gmail, Outlook, ecc.)
3. Crea un template email con questi parametri:
   - to_email: {{to_email}}
   - to_name: {{to_name}}
   - from_name: {{from_name}}
   - subject: {{subject}}
   - message: {{message}}
   - attachment: {{attachment}} (per il PDF in base64)
4. Ottieni la tua Public Key dal dashboard EmailJS (Account > API Keys)
5. Copia i tuoi ID e sostituiscili nelle variabili sopra:
   - PUBLIC_KEY: la tua chiave pubblica EmailJS v4
   - SERVICE_ID: l'ID del servizio email configurato
   - TEMPLATE_ID: l'ID del template email creato
6. L'applicazione utilizzerà automaticamente EmailJS v4 con le nuove API

NOTA: EmailJS v4 richiede la Public Key invece del vecchio User ID
*/