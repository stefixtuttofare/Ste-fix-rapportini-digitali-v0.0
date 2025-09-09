// Variabili globali
let datiCliente = {};
let datiRapportino = {};
let firmaOperatore = null;
let firmaCliente = null;
let canvasOperatore, canvasCliente;
let ctxOperatore, ctxCliente;
let isDrawing = false;

// Funzioni di autenticazione
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('stefix_logged_in') === 'true';
    const loginTime = localStorage.getItem('stefix_login_time');
    
    if (!isLoggedIn || !loginTime) {
        redirectToLogin();
        return false;
    }
    
    // Controlla se la sessione è scaduta (24 ore)
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
        logout();
        return false;
    }
    
    return true;
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

function logout() {
    localStorage.removeItem('stefix_logged_in');
    localStorage.removeItem('stefix_username');
    localStorage.removeItem('stefix_login_time');
    redirectToLogin();
}

function getCurrentUser() {
    return localStorage.getItem('stefix_username') || 'Utente';
}

function updateUserDisplay() {
    const userElement = document.getElementById('current-user');
    if (userElement) {
        const username = getCurrentUser();
        userElement.textContent = `Ciao, ${username}`;
    }
}

// Inizializzazione dell'applicazione
document.addEventListener('DOMContentLoaded', function() {
    // Controlla autenticazione prima di inizializzare
    if (!checkAuthentication()) {
        return;
    }
    
    initializeApp();
});

function initializeApp() {
    // Mostra il nome utente nell'header
    updateUserDisplay();
    
    // Imposta la data di oggi come default
    const oggi = new Date().toISOString().split('T')[0];
    document.getElementById('data-intervento').value = oggi;
    
    // Inizializza i canvas per le firme
    initializeSignaturePads();
    
    // Inizializza EmailJS v4
(function(){
    emailjs.init({
        publicKey: EMAIL_CONFIG.PUBLIC_KEY,
    });
})();

    // Variabili EmailJS per l'invio delle email
    window.EMAIL_SERVICE_ID = EMAIL_CONFIG.SERVICE_ID;
    window.EMAIL_TEMPLATE_ID = EMAIL_CONFIG.TEMPLATE_ID;
    window.EMAIL_TEMPLATE_ID_SIMPLE = EMAIL_CONFIG.TEMPLATE_ID_SIMPLE;
    window.EMAIL_PUBLIC_KEY = EMAIL_CONFIG.PUBLIC_KEY;
    
    // Listener per ridimensionamento finestra
    window.addEventListener('resize', () => {
        if (document.getElementById('firme-section').style.display !== 'none') {
            setTimeout(resizeCanvases, 100);
        }
    });
    
    console.log('App inizializzata correttamente');
}

// Gestione navigazione tra sezioni
function procediRapportino() {
    if (validaFormCliente()) {
        salvaDatiCliente();
        mostraSezione('rapportino-section');
        nascondiSezione('cliente-section');
    }
}

function procediFireme() {
    if (validaFormRapportino()) {
        salvaDatiRapportino();
        mostraSezione('firme-section');
        nascondiSezione('rapportino-section');
        // Ridimensiona i canvas dopo che la sezione è visibile
        setTimeout(() => {
            resizeCanvases();
        }, 100);
    }
}

function tornaIndietro() {
    nascondiSezione('firme-section');
    mostraSezione('rapportino-section');
}

function mostraSezione(sectionId) {
    document.getElementById(sectionId).style.display = 'block';
    // Scroll verso l'alto della pagina
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Piccolo delay per assicurarsi che la sezione sia visibile prima dello scroll
    setTimeout(() => {
        document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function nascondiSezione(sectionId) {
    document.getElementById(sectionId).style.display = 'none';
}

// Validazione form
function validaFormCliente() {
    const form = document.getElementById('cliente-form');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            field.style.borderColor = '#27ae60';
        }
    });
    
    // Validazione email più rigorosa
    const email = document.getElementById('email-cliente').value;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!email || !emailRegex.test(email) || email.length > 254) {
        document.getElementById('email-cliente').style.borderColor = '#e74c3c';
        mostraMessaggio('Inserisci un indirizzo email valido (es: nome@dominio.com)', 'error');
        isValid = false;
    }
    
    if (!isValid) {
        mostraMessaggio('Compila tutti i campi obbligatori correttamente', 'error');
    }
    
    return isValid;
}

function validaFormRapportino() {
    const form = document.getElementById('rapportino-form');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            field.style.borderColor = '#27ae60';
        }
    });
    
    // Validazione orari
    const oraInizio = document.getElementById('ora-inizio').value;
    const oraFine = document.getElementById('ora-fine').value;
    
    if (oraInizio && oraFine && oraInizio >= oraFine) {
        mostraMessaggio('L\'ora di fine deve essere successiva all\'ora di inizio', 'error');
        isValid = false;
    }
    
    if (!isValid) {
        mostraMessaggio('Compila tutti i campi obbligatori correttamente', 'error');
    }
    
    return isValid;
}

// Salvataggio dati
function salvaDatiCliente() {
    const form = document.getElementById('cliente-form');
    const formData = new FormData(form);
    
    datiCliente = {
        nome: formData.get('nomeCliente'),
        cognome: formData.get('cognomeCliente'),
        email: formData.get('emailCliente'),
        telefono: formData.get('telefonoCliente'),
        indirizzo: formData.get('indirizzoCliente')
    };
}

function salvaDatiRapportino() {
    const form = document.getElementById('rapportino-form');
    const formData = new FormData(form);
    
    datiRapportino = {
        data: formData.get('dataIntervento'),
        oraInizio: formData.get('oraInizio'),
        oraFine: formData.get('oraFine'),
        oreViaggio: formData.get('oreViaggio') || '0',
        kmPercorsi: formData.get('kmPercorsi') || '0',
        descrizione: formData.get('descrizioneIntervento'),
        materiali: formData.get('materialiUtilizzati'),
        osservazioni: formData.get('osservazioniCliente')
    };
}

// Gestione firme digitali
function initializeSignaturePads() {
    // Canvas Operatore
    canvasOperatore = document.getElementById('canvas-operatore');
    ctxOperatore = canvasOperatore.getContext('2d');
    setupCanvas(canvasOperatore, ctxOperatore, 'operatore');
    
    // Canvas Cliente
    canvasCliente = document.getElementById('canvas-cliente');
    ctxCliente = canvasCliente.getContext('2d');
    setupCanvas(canvasCliente, ctxCliente, 'cliente');
}

function resizeCanvases() {
    // Ridimensiona canvas operatore
    if (canvasOperatore) {
        const containerOperatore = canvasOperatore.parentElement;
        const rectOperatore = containerOperatore.getBoundingClientRect();
        canvasOperatore.width = Math.max(400, rectOperatore.width - 20);
        canvasOperatore.height = 200;
        // Riempie con sfondo bianco
        ctxOperatore.fillStyle = '#FFFFFF';
        ctxOperatore.fillRect(0, 0, canvasOperatore.width, canvasOperatore.height);
        setupCanvasStyle(ctxOperatore);
    }
    
    // Ridimensiona canvas cliente
    if (canvasCliente) {
        const containerCliente = canvasCliente.parentElement;
        const rectCliente = containerCliente.getBoundingClientRect();
        canvasCliente.width = Math.max(400, rectCliente.width - 20);
        canvasCliente.height = 200;
        // Riempie con sfondo bianco
        ctxCliente.fillStyle = '#FFFFFF';
        ctxCliente.fillRect(0, 0, canvasCliente.width, canvasCliente.height);
        setupCanvasStyle(ctxCliente);
    }
    
    console.log('Canvas ridimensionati:', {
        operatore: { width: canvasOperatore.width, height: canvasOperatore.height },
        cliente: { width: canvasCliente.width, height: canvasCliente.height }
    });
}

function setupCanvasStyle(ctx) {
    // Stile del pennello - nero su sfondo bianco
    ctx.strokeStyle = '#000000'; // Nero
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function setupCanvas(canvas, ctx, tipo) {
    // Imposta le dimensioni del canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(400, rect.width || 400);
    canvas.height = Math.max(200, rect.height || 200);
    
    // Riempie il canvas con sfondo bianco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Applica lo stile del pennello
    setupCanvasStyle(ctx);
    
    // Event listeners per mouse
    canvas.addEventListener('mousedown', (e) => startDrawing(e, ctx, tipo));
    canvas.addEventListener('mousemove', (e) => draw(e, ctx, canvas, tipo));
    canvas.addEventListener('mouseup', () => stopDrawing(tipo));
    canvas.addEventListener('mouseout', () => stopDrawing(tipo));
    
    // Event listeners per touch (mobile)
    canvas.addEventListener('touchstart', (e) => {
        // Previeni il comportamento di default solo se il touch è sul canvas
        if (e.cancelable) {
            e.preventDefault();
        }
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        // Previeni il comportamento di default solo durante il disegno
        if (isDrawing && e.cancelable) {
            e.preventDefault();
        }
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        if (e.cancelable) {
            e.preventDefault();
        }
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    }, { passive: false });
}

function startDrawing(e, ctx, tipo) {
    isDrawing = true;
    const rect = e.target.getBoundingClientRect();
    const scaleX = e.target.width / rect.width;
    const scaleY = e.target.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e, ctx, canvas, tipo) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing(tipo) {
    if (isDrawing) {
        isDrawing = false;
        // Salva la firma solo se il canvas non è vuoto
        if (tipo === 'operatore') {
            if (isCanvasEmpty(canvasOperatore)) {
                firmaOperatore = null;
            } else {
                firmaOperatore = canvasOperatore.toDataURL('image/png');
            }
        } else {
            if (isCanvasEmpty(canvasCliente)) {
                firmaCliente = null;
            } else {
                firmaCliente = canvasCliente.toDataURL('image/png');
            }
        }
    }
}

function clearSignature(tipo) {
    if (tipo === 'operatore') {
        // Cancella e riempie con sfondo bianco
        ctxOperatore.clearRect(0, 0, canvasOperatore.width, canvasOperatore.height);
        ctxOperatore.fillStyle = '#FFFFFF';
        ctxOperatore.fillRect(0, 0, canvasOperatore.width, canvasOperatore.height);
        // Ripristina lo stile del pennello
        setupCanvasStyle(ctxOperatore);
        firmaOperatore = null;
    } else {
        // Cancella e riempie con sfondo bianco
        ctxCliente.clearRect(0, 0, canvasCliente.width, canvasCliente.height);
        ctxCliente.fillStyle = '#FFFFFF';
        ctxCliente.fillRect(0, 0, canvasCliente.width, canvasCliente.height);
        // Ripristina lo stile del pennello
        setupCanvasStyle(ctxCliente);
        firmaCliente = null;
    }
}

// Generazione e invio rapportino
async function salvaEInviaRapportino() {
    // Validazione finale
    if (!validaFirme()) {
        return;
    }
    
    mostraLoading(true);
    
    try {
        // Genera PDF
        const pdfBlob = await generaPDF();
        
        mostraLoading(false);
        
        // Mostra anteprima PDF
        await mostraAnteprimaPDF(pdfBlob);
        
    } catch (error) {
        console.error('Errore:', error);
        mostraMessaggio('Errore durante la generazione del rapportino: ' + error.message, 'error');
        mostraLoading(false);
    }
}

// FUNZIONE TEMPORANEA - Genera solo PDF rapportino senza invio email
async function generaSoloRapportinoPDF() {
    // Validazione finale
    if (!validaFirme()) {
        return;
    }
    
    mostraLoading(true);
    
    try {
        // Genera PDF
        const pdfBlob = await generaPDF();
        
        mostraLoading(false);
        
        // Scarica direttamente il PDF senza anteprima email
        const fileName = `Rapportino_${Date.now()}_${datiCliente.nome}_${datiCliente.cognome}.pdf`;
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Salva nell'archivio
        const datiCompleti = {
            numeroIntervento: generateInterventionNumber(),
            nomeCliente: datiCliente.nome,
            cognomeCliente: datiCliente.cognome,
            emailCliente: datiCliente.email,
            telefonoCliente: datiCliente.telefono,
            indirizzoCliente: datiCliente.indirizzo,
            dataIntervento: datiRapportino.data,
            oraInizio: datiRapportino.oraInizio,
            oraFine: datiRapportino.oraFine,
            descrizioneIntervento: datiRapportino.descrizione,
            materialiUtilizzati: datiRapportino.materiali,
            nomeOperatore: document.getElementById('nome-operatore').value,
            nomeClienteFirma: document.getElementById('nome-cliente').value
        };
        
        salvaRapportinoInArchivio(datiCompleti);
        
        mostraMessaggio('📄 Rapportino PDF generato e salvato con successo! Reindirizzamento alla pagina ricevute...', 'success');
        
        // Reindirizzamento automatico alla pagina ricevute dopo 2 secondi
        setTimeout(() => {
            mostraSezione('ricevute-section');
            const ricevuteBtn = document.querySelector('[onclick*="ricevute-section"]');
            if (ricevuteBtn) {
                setActiveNav(ricevuteBtn);
            }
            // Scroll automatico verso l'alto
            window.scrollTo(0, 0);
            mostraMessaggio('Ora puoi generare la ricevuta per questo intervento', 'info');
        }, 2000);
        
    } catch (error) {
        console.error('Errore:', error);
        mostraMessaggio('Errore durante la generazione del rapportino: ' + error.message, 'error');
        mostraLoading(false);
    }
}

function validaFirme() {
    const nomeOperatore = document.getElementById('nome-operatore').value.trim();
    const nomeFirmatarioCliente = document.getElementById('nome-firmatario-cliente').value.trim();
    
    if (!nomeOperatore) {
        mostraMessaggio('Inserisci il nome dell\'operatore', 'error');
        return false;
    }
    
    if (!nomeFirmatarioCliente) {
        mostraMessaggio('Inserisci il nome del firmatario cliente', 'error');
        return false;
    }
    
    if (!firmaOperatore) {
        mostraMessaggio('Manca la firma dell\'operatore', 'error');
        return false;
    }
    
    if (!firmaCliente) {
        mostraMessaggio('Manca la firma del cliente', 'error');
        return false;
    }
    
    return true;
}

async function generaPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Carica e aggiungi il logo
    try {
        const logoImg = new Image();
        logoImg.src = './public/images/logo(1).png';
        await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
        });
        
        // Aggiungi logo (ridimensionato)
        doc.addImage(logoImg, 'PNG', 20, 10, 30, 30);
    } catch (error) {
        console.log('Logo non caricato:', error);
    }
    
    // Header con dati aziendali
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('RAPPORTINO DI INTERVENTO', 60, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(52, 152, 219);
    doc.text('Ste-Fix di Paderno Stefano', 60, 28);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Via Convento Aguzzano 17/A', 60, 34);
    doc.text('25034 Orzinuovi (BS)', 60, 38);
    doc.text('Mail: stefixtuttofare@gmail.com', 60, 42);
    doc.text('Cell: +39 352 054 3212', 60, 46);
    
    // Linea separatrice
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(1);
    doc.line(20, 55, 190, 55);
    
    let yPos = 70;
    
    // Dati Cliente
    doc.setFontSize(16);
    doc.setTextColor(52, 152, 219);
    doc.text('DATI CLIENTE', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nome: ${datiCliente.nome} ${datiCliente.cognome}`, 20, yPos);
    yPos += 8;
    doc.text(`Email: ${datiCliente.email}`, 20, yPos);
    yPos += 8;
    if (datiCliente.telefono) {
        doc.text(`Telefono: ${datiCliente.telefono}`, 20, yPos);
        yPos += 8;
    }
    if (datiCliente.indirizzo) {
        doc.text(`Indirizzo: ${datiCliente.indirizzo}`, 20, yPos);
        yPos += 8;
    }
    
    yPos += 10;
    
    // Dati Intervento
    doc.setFontSize(16);
    doc.setTextColor(52, 152, 219);
    doc.text('DATI INTERVENTO', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Data: ${formatDate(datiRapportino.data)}`, 20, yPos);
    yPos += 8;
    doc.text(`Orario: ${datiRapportino.oraInizio} - ${datiRapportino.oraFine}`, 20, yPos);
    yPos += 8;
    doc.text(`Ore viaggio A/R: ${datiRapportino.oreViaggio}`, 20, yPos);
    yPos += 8;
    doc.text(`KM percorsi A/R: ${datiRapportino.kmPercorsi}`, 20, yPos);
    yPos += 15;
    
    // Descrizione intervento
    doc.setFontSize(14);
    doc.setTextColor(52, 152, 219);
    doc.text('DESCRIZIONE INTERVENTO:', 20, yPos);
    yPos += 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const descrizioneLines = doc.splitTextToSize(datiRapportino.descrizione, 170);
    doc.text(descrizioneLines, 20, yPos);
    yPos += descrizioneLines.length * 6 + 10;
    
    // Materiali utilizzati
    if (datiRapportino.materiali) {
        doc.setFontSize(14);
        doc.setTextColor(52, 152, 219);
        doc.text('MATERIALI UTILIZZATI:', 20, yPos);
        yPos += 8;
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const materialiLines = doc.splitTextToSize(datiRapportino.materiali, 170);
        doc.text(materialiLines, 20, yPos);
        yPos += materialiLines.length * 6 + 10;
    }
    
    // Osservazioni cliente
    if (datiRapportino.osservazioni) {
        doc.setFontSize(14);
        doc.setTextColor(52, 152, 219);
        doc.text('OSSERVAZIONI CLIENTE:', 20, yPos);
        yPos += 8;
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const osservazioniLines = doc.splitTextToSize(datiRapportino.osservazioni, 170);
        doc.text(osservazioniLines, 20, yPos);
        yPos += osservazioniLines.length * 6 + 15;
    }
    
    // Nuova pagina se necessario
    if (yPos > 220) {
        doc.addPage();
        yPos = 30;
    }
    
    // Firme
    doc.setFontSize(16);
    doc.setTextColor(52, 152, 219);
    doc.text('FIRME', 20, yPos);
    yPos += 15;
    
    // Firma Operatore
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Operatore: ${document.getElementById('nome-operatore').value}`, 20, yPos);
    yPos += 8;
    if (firmaOperatore && isValidSignature(firmaOperatore)) {
        try {
            doc.addImage(firmaOperatore, 'PNG', 20, yPos, 60, 20);
        } catch (error) {
            console.warn('Errore nell\'aggiungere firma operatore:', error);
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            doc.text('[Firma non disponibile]', 20, yPos + 15);
        }
    } else {
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text('[Firma non presente]', 20, yPos + 15);
    }
    
    // Firma Cliente
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Cliente: ${document.getElementById('nome-firmatario-cliente').value}`, 110, yPos - 8);
    if (firmaCliente && isValidSignature(firmaCliente)) {
        try {
            doc.addImage(firmaCliente, 'PNG', 110, yPos, 60, 20);
        } catch (error) {
            console.warn('Errore nell\'aggiungere firma cliente:', error);
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            doc.text('[Firma non disponibile]', 110, yPos + 15);
        }
    } else {
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text('[Firma non presente]', 110, yPos + 15);
    }
    
    // Footer
    yPos += 40;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Rapportino generato il ${new Date().toLocaleString('it-IT')}`, 20, yPos);
    
    return doc.output('blob');
}

async function inviaEmail(pdfBlob) {
    // Validazione email prima dell'invio
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!datiCliente.email || !emailRegex.test(datiCliente.email) || datiCliente.email.length > 254) {
        mostraLoading(false);
        mostraMessaggio('❌ Indirizzo email non valido. Controlla e riprova.', 'error');
        return { status: 'error', error: 'Invalid email address' };
    }
    
    // Raccogli tutti i dati del form
    const formData = {
        numeroIntervento: `INT-${Date.now()}`,
        nomeCliente: `${datiCliente.nome} ${datiCliente.cognome}`,
        indirizzoCliente: datiCliente.indirizzo,
        emailCliente: datiCliente.email,
        dataIntervento: datiRapportino.data,
        orarioInizio: datiRapportino.oraInizio || 'Non specificato',
        orarioFine: datiRapportino.oraFine || 'Non specificato',
        nomeOperatore: document.getElementById('nome-operatore').value,
        tipoIntervento: 'Intervento Tecnico',
        descrizioneLavori: datiRapportino.descrizione || 'Non specificata',
        materialiUtilizzati: datiRapportino.materiali || 'Nessun materiale utilizzato',
        oreLavorate: calcolaOreLavorate(datiRapportino.oraInizio, datiRapportino.oraFine),
        noteAggiuntive: datiRapportino.osservazioni || 'Nessuna nota aggiuntiva',
        nomeAzienda: 'Ste-Fix',
        emailAzienda: 'info@ste-fix.com'
    };

    try {
        // Scarica automaticamente il PDF
        const fileName = `Rapportino_${formData.numeroIntervento}_${formData.nomeCliente.replace(/\s+/g, '_')}.pdf`;
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Parametri per EmailJS con tutte le variabili del template
        const templateParams = {
            to_email: formData.emailCliente,
            to_name: formData.nomeCliente,
            from_name: formData.nomeAzienda,
            reply_to: formData.emailAzienda,
            subject: `Rapportino Intervento N° ${formData.numeroIntervento} - ${formData.nomeCliente}`,
            numeroIntervento: formData.numeroIntervento,
            nomeCliente: formData.nomeCliente,
            indirizzoCliente: formData.indirizzoCliente,
            dataIntervento: formatDate(formData.dataIntervento),
            orarioInizio: formData.orarioInizio,
            orarioFine: formData.orarioFine,
            nomeOperatore: formData.nomeOperatore,
            tipoIntervento: formData.tipoIntervento,
            descrizioneLavori: formData.descrizioneLavori,
            materialiUtilizzati: formData.materialiUtilizzati,
            oreLavorate: formData.oreLavorate,
            noteAggiuntive: formData.noteAggiuntive,
            nomeAzienda: formData.nomeAzienda,
            emailAzienda: formData.emailAzienda,
            telefonoAzienda: '0123-456789'
        };
        
        // Invia email tramite EmailJS
        const response = await emailjs.send(
            EMAIL_CONFIG.SERVICE_ID,
            EMAIL_CONFIG.TEMPLATE_ID,
            templateParams
        );
        
        mostraLoading(false);
        mostraMessaggio('✅ Email inviata con successo! Il rapportino PDF è stato scaricato automaticamente.', 'success');
        
        return { status: 'success', response };
        
    } catch (error) {
        console.error('Errore invio email:', error);
        mostraLoading(false);
        
        // Gestione errori specifici
        if (error.status === 422) {
            if (error.text && error.text.includes('recipients address is corrupted')) {
                mostraMessaggio('❌ Indirizzo email non valido o corrotto. Verifica l\'email inserita e riprova.', 'error');
            } else {
                mostraMessaggio('❌ Dati email non validi. Controlla tutti i campi e riprova.', 'error');
            }
        } else if (error.status === 400) {
            mostraMessaggio('❌ Errore nei parametri email. Controlla i dati inseriti.', 'error');
        } else {
            mostraMessaggio('❌ Errore nell\'invio dell\'email. Riprova o contatta il supporto.', 'error');
        }
        
        return { status: 'error', error: error.message };
    }
}

function calcolaOreLavorate(oraInizio, oraFine) {
    if (!oraInizio || !oraFine) return 0;
    
    const [oreInizio, minutiInizio] = oraInizio.split(':').map(Number);
    const [oreFine, minutiFine] = oraFine.split(':').map(Number);
    
    const minutiTotaliInizio = oreInizio * 60 + minutiInizio;
    const minutiTotaliFine = oreFine * 60 + minutiFine;
    
    const differenzaMinuti = minutiTotaliFine - minutiTotaliInizio;
    
    // Restituisce ore in formato decimale (es. 2.5 per 2 ore e 30 minuti)
    return Math.round((differenzaMinuti / 60) * 100) / 100;
}

async function generateEmailContent(formData) {
    // Rimuovo completamente le firme dall'email per rispettare il limite di 50KB
    
    return `Rapportino Intervento N° ${formData.numeroIntervento}

Cliente: ${formData.nomeCliente}
Data: ${formatDate(formData.dataIntervento)}
Operatore: ${formData.nomeOperatore}

Descrizione: ${formData.descrizioneLavori || 'Non specificata'}
Materiali: ${formData.materialiUtilizzati || 'Nessuno'}

Intervento completato con successo.

Ste-Fix`;
}

// Utility functions
function isCanvasEmpty(canvas) {
    // Verifica che il canvas esista
    if (!canvas) {
        return true;
    }
    
    // Crea un canvas temporaneo vuoto per il confronto
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // Confronta i dati del canvas con un canvas vuoto
    return canvas.toDataURL() === tempCanvas.toDataURL();
}

function isValidSignature(signatureDataURL) {
    // Verifica che la firma sia un data URL valido
    if (!signatureDataURL || typeof signatureDataURL !== 'string') {
        return false;
    }
    
    // Verifica che inizi con data:image/png;base64,
    if (!signatureDataURL.startsWith('data:image/png;base64,')) {
        return false;
    }
    
    // Verifica che abbia contenuto dopo l'header
    const base64Data = signatureDataURL.split(',')[1];
    if (!base64Data || base64Data.length < 100) {
        return false; // Troppo piccolo per essere una firma valida
    }
    
    // Verifica che il base64 sia valido
    try {
        atob(base64Data);
        return true;
    } catch (error) {
        console.warn('Base64 non valido per la firma:', error);
        return false;
    }
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Funzione optimizeLogo rimossa per ridurre le dimensioni dell'email

// Funzione per comprimere le firme


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
}

function mostraMessaggio(messaggio, tipo) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = messaggio;
    messageDiv.className = `message ${tipo}`;
    messageDiv.style.display = 'block';
    
    // Nascondi il messaggio dopo 5 secondi
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function mostraLoading(show) {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = show ? 'block' : 'none';
}

async function mostraAnteprimaPDF(pdfBlob) {
    return new Promise((resolve) => {
        // Crea URL per il PDF
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Crea modal per anteprima
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 10px; max-width: 90%; max-height: 90%; display: flex; flex-direction: column;">
                <h3 style="margin: 0 0 15px 0; text-align: center; color: #2c3e50;">📄 Anteprima Rapportino</h3>
                <iframe src="${pdfUrl}" style="width: 800px; height: 600px; border: 1px solid #ddd; border-radius: 5px;"></iframe>
                <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
                    <button id="btn-invia" style="background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px;">📧 Invia Email</button>
                    <button id="btn-modifica" style="background: #f39c12; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px;">✏️ Modifica</button>
                    <button id="btn-chiudi" style="background: #e74c3c; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px;">❌ Chiudi</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('#btn-invia').onclick = async () => {
            document.body.removeChild(modal);
            URL.revokeObjectURL(pdfUrl);
            
            try {
                mostraLoading(true);
                await inviaEmail(pdfBlob);
                mostraMessaggio('Rapportino inviato con successo! Reindirizzamento alla pagina ricevute...', 'success');
                
                // Reindirizzamento automatico alla pagina ricevute dopo 2 secondi
                setTimeout(() => {
                    mostraSezione('ricevute-section');
                    const ricevuteBtn = document.querySelector('[onclick*="ricevute-section"]');
                    if (ricevuteBtn) {
                        setActiveNav(ricevuteBtn);
                    }
                    // Scroll automatico verso l'alto
                    window.scrollTo(0, 0);
                    mostraMessaggio('Ora puoi generare la ricevuta per questo intervento', 'info');
                }, 2000);
                
            } catch (error) {
                mostraMessaggio('Errore durante l\'invio: ' + error.message, 'error');
            } finally {
                mostraLoading(false);
            }
            
            resolve();
        };
        
        modal.querySelector('#btn-modifica').onclick = () => {
            document.body.removeChild(modal);
            URL.revokeObjectURL(pdfUrl);
            mostraMessaggio('Puoi modificare i dati e rigenerare il rapportino', 'info');
            resolve();
        };
        
        modal.querySelector('#btn-chiudi').onclick = () => {
            document.body.removeChild(modal);
            URL.revokeObjectURL(pdfUrl);
            resolve();
        };
    });
}

function resetApp() {
    // Reset dei dati
    datiCliente = {};
    datiRapportino = {};
    firmaOperatore = null;
    firmaCliente = null;
    
    // Reset dei form
    document.getElementById('cliente-form').reset();
    document.getElementById('rapportino-form').reset();
    document.getElementById('nome-operatore').value = '';
    document.getElementById('nome-firmatario-cliente').value = '';
    
    // Pulisci le firme
    clearSignature('operatore');
    clearSignature('cliente');
    
    // Torna alla prima sezione
    nascondiSezione('rapportino-section');
    nascondiSezione('firme-section');
    mostraSezione('cliente-section');
    
    // Imposta la data di oggi
    const oggi = new Date().toISOString().split('T')[0];
    document.getElementById('data-intervento').value = oggi;
    
    // Nascondi messaggi
    document.getElementById('message').style.display = 'none';
    
    mostraMessaggio('Applicazione pronta per un nuovo rapportino', 'info');
}

// === SISTEMA ARCHIVIO ===

// Variabili globali per l'archivio
let rapportiniArchivio = [];
let rapportiniFiltrati = [];
let rapportinoCorrente = null;

// Inizializza l'archivio al caricamento
function inizializzaArchivio() {
    caricaRapportiniDaLocalStorage();
    popolaFiltriAnno();
    filtraRapportini(); // Usa filtraRapportini che chiama automaticamente visualizzaRapportini e aggiornaStatistiche
}

// Navigazione tra sezioni
function mostraSezione(sectionId) {
    // Nascondi tutte le sezioni
    const sezioni = ['cliente-section', 'rapportino-section', 'firme-section', 'archivio-section', 'ricevute-section'];
    sezioni.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.style.display = 'none';
    });
    
    // Mostra la sezione richiesta
    const sezioneTarget = document.getElementById(sectionId);
    if (sezioneTarget) {
        sezioneTarget.style.display = 'block';
        
        // Se è l'archivio, aggiorna i dati
        if (sectionId === 'archivio-section') {
            inizializzaArchivio();
            mostraTabArchivio('rapportini'); // Mostra sempre i rapportini per default
        }
    }
}

function setActiveNav(button) {
    // Controllo di sicurezza per evitare errori se button è null
    if (!button) {
        console.warn('setActiveNav: button parameter is null');
        return;
    }
    
    // Rimuovi classe active da tutti i bottoni
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Aggiungi classe active al bottone cliccato
    button.classList.add('active');
}

// Genera numero intervento univoco
function generateInterventionNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6); // Ultimi 6 cifre del timestamp
    
    return `INT-${year}${month}${day}-${timestamp}`;
}

// Salvataggio rapportino nell'archivio
function salvaRapportinoInArchivio(datiCompleti) {
    const rapportino = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        numeroIntervento: datiCompleti.numeroIntervento || generateInterventionNumber(),
        cliente: {
            nome: datiCompleti.nomeCliente || '',
            cognome: datiCompleti.cognomeCliente || '',
            email: datiCompleti.emailCliente || '',
            telefono: datiCompleti.telefonoCliente || '',
            indirizzo: datiCompleti.indirizzoCliente || ''
        },
        intervento: {
            data: datiCompleti.dataIntervento || '',
            oraInizio: datiCompleti.oraInizio || '',
            oraFine: datiCompleti.oraFine || '',
            descrizione: datiCompleti.descrizioneIntervento || '',
            materiali: datiCompleti.materialiUtilizzati || ''
        },
        operatore: {
            nome: datiCompleti.nomeOperatore || '',
            nomeCliente: datiCompleti.nomeClienteFirma || ''
        }
    };
    
    // Carica archivio esistente
    caricaRapportiniDaLocalStorage();
    
    // Aggiungi nuovo rapportino
    rapportiniArchivio.unshift(rapportino);
    
    // Salva nell'archivio
    salvaRapportiniInLocalStorage();
    
    console.log('Rapportino salvato nell\'archivio:', rapportino);
}

// Gestione localStorage
function salvaRapportiniInLocalStorage() {
    try {
        localStorage.setItem('stefix_rapportini', JSON.stringify(rapportiniArchivio));
    } catch (error) {
        console.error('Errore nel salvare i rapportini:', error);
        mostraMessaggio('Errore nel salvare nell\'archivio', 'error');
    }
}

function caricaRapportiniDaLocalStorage() {
    try {
        const datiSalvati = localStorage.getItem('stefix_rapportini');
        rapportiniArchivio = datiSalvati ? JSON.parse(datiSalvati) : [];
    } catch (error) {
        console.error('Errore nel caricare i rapportini:', error);
        rapportiniArchivio = [];
    }
}

// Filtri e ricerca
function filtraRapportini() {
    const searchTerm = document.getElementById('search-rapportini').value.toLowerCase();
    const filterMese = document.getElementById('filter-mese').value;
    const filterAnno = document.getElementById('filter-anno').value;
    
    rapportiniFiltrati = rapportiniArchivio.filter(rapportino => {
        const dataIntervento = new Date(rapportino.intervento.data);
        const meseIntervento = String(dataIntervento.getMonth() + 1).padStart(2, '0');
        const annoIntervento = String(dataIntervento.getFullYear());
        
        // Filtro testo
        const testoCompleto = [
            rapportino.numeroIntervento,
            rapportino.cliente.nome,
            rapportino.cliente.cognome,
            rapportino.operatore.nome,
            rapportino.intervento.descrizione
        ].join(' ').toLowerCase();
        
        const matchTesto = !searchTerm || testoCompleto.includes(searchTerm);
        const matchMese = !filterMese || meseIntervento === filterMese;
        const matchAnno = !filterAnno || annoIntervento === filterAnno;
        
        return matchTesto && matchMese && matchAnno;
    });
    
    visualizzaRapportini();
    aggiornaStatistiche();
}

// Visualizzazione rapportini
function visualizzaRapportini() {
    const container = document.getElementById('rapportini-lista');
    
    // Controllo di sicurezza per elemento container
    if (!container) {
        console.error('Elemento container non trovato:', container);
        return;
    }
    
    if (rapportiniFiltrati.length === 0) {
        container.innerHTML = `
            <div class="no-rapportini" id="no-rapportini">
                <p>📋 Nessun rapportino salvato</p>
                <p>I rapportini verranno automaticamente salvati nell'archivio dopo l'invio.</p>
            </div>
        `;
        return;
    }
    
    // Il messaggio "nessun rapportino" viene gestito dinamicamente tramite innerHTML
    
    container.innerHTML = rapportiniFiltrati.map(rapportino => {
        const dataFormattata = formatDate(rapportino.intervento.data);
        const nomeCompleto = `${rapportino.cliente.nome} ${rapportino.cliente.cognome}`.trim();
        
        return `
            <div class="rapportino-item" onclick="mostraDettagliRapportino('${rapportino.id}')">
                <div class="rapportino-header">
                    <div class="rapportino-numero">#${rapportino.numeroIntervento}</div>
                    <div class="rapportino-data">${dataFormattata}</div>
                </div>
                <div class="rapportino-cliente">${nomeCompleto}</div>
                <div class="rapportino-operatore">Operatore: ${rapportino.operatore.nome}</div>
                <div class="rapportino-descrizione">${rapportino.intervento.descrizione}</div>
            </div>
        `;
    }).join('');
}

// Statistiche
function aggiornaStatistiche() {
    const totalElement = document.getElementById('total-rapportini');
    const meseElement = document.getElementById('rapportini-mese');
    const filtratiElement = document.getElementById('rapportini-filtrati');
    
    if (totalElement) totalElement.textContent = rapportiniArchivio.length;
    if (filtratiElement) filtratiElement.textContent = rapportiniFiltrati.length;
    
    // Rapportini del mese corrente
    const meseCorrente = new Date().getMonth() + 1;
    const annoCorrente = new Date().getFullYear();
    const rapportiniMese = rapportiniArchivio.filter(r => {
        const data = new Date(r.intervento.data);
        return data.getMonth() + 1 === meseCorrente && data.getFullYear() === annoCorrente;
    }).length;
    
    if (meseElement) meseElement.textContent = rapportiniMese;
}

// Popola filtro anni
function popolaFiltriAnno() {
    const selectAnno = document.getElementById('filter-anno');
    if (!selectAnno) return;
    
    const anni = [...new Set(rapportiniArchivio.map(r => {
        return new Date(r.intervento.data).getFullYear();
    }))].sort((a, b) => b - a);
    
    // Mantieni l'opzione "Tutti gli anni"
    selectAnno.innerHTML = '<option value="">Tutti gli anni</option>';
    
    anni.forEach(anno => {
        const option = document.createElement('option');
        option.value = anno;
        option.textContent = anno;
        selectAnno.appendChild(option);
    });
}

// Modal dettagli
function mostraDettagliRapportino(id) {
    const rapportino = rapportiniArchivio.find(r => r.id === id);
    if (!rapportino) return;
    
    rapportinoCorrente = rapportino;
    
    const modal = document.getElementById('modal-dettagli');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = `Rapportino #${rapportino.numeroIntervento}`;
    
    const dataFormattata = formatDate(rapportino.intervento.data);
    const nomeCompleto = `${rapportino.cliente.nome} ${rapportino.cliente.cognome}`.trim();
    
    body.innerHTML = `
        <div class="dettaglio-section">
            <h4>📋 Informazioni Generali</h4>
            <div class="dettaglio-grid">
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Numero Intervento</div>
                    <div class="dettaglio-value">#${rapportino.numeroIntervento}</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Data Intervento</div>
                    <div class="dettaglio-value">${dataFormattata}</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Ora Inizio</div>
                    <div class="dettaglio-value">${rapportino.intervento.oraInizio}</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Ora Fine</div>
                    <div class="dettaglio-value">${rapportino.intervento.oraFine}</div>
                </div>
            </div>
        </div>
        
        <div class="dettaglio-section">
            <h4>👤 Dati Cliente</h4>
            <div class="dettaglio-grid">
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Nome Completo</div>
                    <div class="dettaglio-value">${nomeCompleto}</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Email</div>
                    <div class="dettaglio-value">${rapportino.cliente.email}</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Telefono</div>
                    <div class="dettaglio-value">${rapportino.cliente.telefono}</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Indirizzo</div>
                    <div class="dettaglio-value">${rapportino.cliente.indirizzo}</div>
                </div>
            </div>
        </div>
        
        <div class="dettaglio-section">
            <h4>🔧 Dettagli Intervento</h4>
            <div class="dettaglio-item">
                <div class="dettaglio-label">Descrizione Lavori</div>
                <div class="dettaglio-value">${rapportino.intervento.descrizione}</div>
            </div>
            <div class="dettaglio-item">
                <div class="dettaglio-label">Materiali Utilizzati</div>
                <div class="dettaglio-value">${rapportino.intervento.materiali}</div>
            </div>
        </div>
        
        <div class="dettaglio-section">
            <h4>👷 Operatore</h4>
            <div class="dettaglio-grid">
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Nome Operatore</div>
                    <div class="dettaglio-value">${rapportino.operatore.nome}</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Cliente Firmatario</div>
                    <div class="dettaglio-value">${rapportino.operatore.nomeCliente}</div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function chiudiModal() {
    const modal = document.getElementById('modal-dettagli');
    modal.style.display = 'none';
    rapportinoCorrente = null;
}

// Elimina rapportino
function eliminaRapportino() {
    if (!rapportinoCorrente) return;
    
    if (confirm(`Sei sicuro di voler eliminare il rapportino #${rapportinoCorrente.numeroIntervento}?`)) {
        rapportiniArchivio = rapportiniArchivio.filter(r => r.id !== rapportinoCorrente.id);
        salvaRapportiniInLocalStorage();
        chiudiModal();
        filtraRapportini();
        mostraMessaggio('Rapportino eliminato con successo', 'success');
    }
}

// Esporta archivio in CSV
function esportaArchivio() {
    if (rapportiniArchivio.length === 0) {
        mostraMessaggio('Nessun rapportino da esportare', 'error');
        return;
    }
    
    const headers = [
        'Numero Intervento',
        'Data',
        'Ora Inizio',
        'Ora Fine',
        'Cliente Nome',
        'Cliente Cognome',
        'Cliente Email',
        'Cliente Telefono',
        'Cliente Indirizzo',
        'Operatore',
        'Descrizione',
        'Materiali'
    ];
    
    const csvContent = [
        headers.join(','),
        ...rapportiniArchivio.map(r => [
            r.numeroIntervento,
            r.intervento.data,
            r.intervento.oraInizio,
            r.intervento.oraFine,
            r.cliente.nome,
            r.cliente.cognome,
            r.cliente.email,
            r.cliente.telefono,
            r.cliente.indirizzo,
            r.operatore.nome,
            `"${r.intervento.descrizione.replace(/"/g, '""')}"`,
            `"${r.intervento.materiali.replace(/"/g, '""')}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stefix_archivio_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostraMessaggio('Archivio esportato con successo', 'success');
}

// Cancella tutto l'archivio
function cancellaArchivio() {
    if (rapportiniArchivio.length === 0) {
        mostraMessaggio('L\'archivio è già vuoto', 'error');
        return;
    }
    
    if (confirm('Sei sicuro di voler cancellare TUTTI i rapportini dall\'archivio? Questa azione non può essere annullata.')) {
        rapportiniArchivio = [];
        rapportiniFiltrati = [];
        salvaRapportiniInLocalStorage();
        visualizzaRapportini();
        aggiornaStatistiche();
        mostraMessaggio('Archivio cancellato completamente', 'success');
    }
}

// Modifica la funzione salvaEInviaRapportino per includere il salvataggio nell'archivio
const originalSalvaEInviaRapportino = salvaEInviaRapportino;

// Override della funzione originale
window.salvaEInviaRapportino = async function() {
    try {
        // Esegui la funzione originale
        await originalSalvaEInviaRapportino();
        
        // Dopo l'invio riuscito, salva nell'archivio
        const datiCompleti = {
            numeroIntervento: generateInterventionNumber(),
            nomeCliente: datiCliente.nome,
            cognomeCliente: datiCliente.cognome,
            emailCliente: datiCliente.email,
            telefonoCliente: datiCliente.telefono,
            indirizzoCliente: datiCliente.indirizzo,
            dataIntervento: datiRapportino.data,
            oraInizio: datiRapportino.oraInizio,
            oraFine: datiRapportino.oraFine,
            descrizioneIntervento: datiRapportino.descrizione,
            materialiUtilizzati: datiRapportino.materiali,
            nomeOperatore: document.getElementById('nome-operatore').value,
            nomeClienteFirma: document.getElementById('nome-cliente').value
        };
        
        salvaRapportinoInArchivio(datiCompleti);
        
    } catch (error) {
        console.error('Errore durante il salvataggio:', error);
        throw error;
    }
};

// Inizializza l'archivio quando la pagina è caricata
document.addEventListener('DOMContentLoaded', function() {
    // Aspetta che l'app sia inizializzata
    setTimeout(() => {
        if (document.getElementById('archivio-section')) {
            caricaRapportiniDaLocalStorage();
        }
    }, 100);
    inizializzaRicevute();
});

// ===== SISTEMA RICEVUTE =====

// Variabili globali per ricevute
let ricevuteArchivio = [];
let firmaRicevuta = null;
let canvasRicevuta, ctxRicevuta;
let isDrawingRicevuta = false;

// Pricelist predefinite
const pricelist = {
    standard: {
        nome: 'Standard',
        costoOrario: 25,
        costoChilometro: 0.50,
        costoViaggio: 20
    },
    premium: {
        nome: 'Premium',
        costoOrario: 35,
        costoChilometro: 0.60,
        costoViaggio: 25
    },
    urgenza: {
        nome: 'Urgenza',
        costoOrario: 45,
        costoChilometro: 0.70,
        costoViaggio: 30
    }
};

// Inizializzazione sistema ricevute
function inizializzaRicevute() {
    caricaRicevuteDaLocalStorage();
    inizializzaFirmaRicevuta();
    generaNumeroRicevuta();
}

// Inizializza canvas firma per ricevute
function inizializzaFirmaRicevuta() {
    canvasRicevuta = document.getElementById('ricevuta-signature-canvas');
    if (canvasRicevuta) {
        ctxRicevuta = canvasRicevuta.getContext('2d');
        setupCanvasStyleRicevuta(ctxRicevuta);
        setupCanvasRicevuta();
    }
}

function setupCanvasStyleRicevuta(ctx) {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function setupCanvasRicevuta() {
    // Mouse events
    canvasRicevuta.addEventListener('mousedown', (e) => startDrawingRicevuta(e));
    canvasRicevuta.addEventListener('mousemove', (e) => drawRicevuta(e));
    canvasRicevuta.addEventListener('mouseup', stopDrawingRicevuta);
    canvasRicevuta.addEventListener('mouseout', stopDrawingRicevuta);
    
    // Touch events
    canvasRicevuta.addEventListener('touchstart', (e) => {
        if (e.cancelable) {
            e.preventDefault();
        }
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvasRicevuta.dispatchEvent(mouseEvent);
    }, { passive: false });
    
    canvasRicevuta.addEventListener('touchmove', (e) => {
        if (isDrawingRicevuta && e.cancelable) {
            e.preventDefault();
        }
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvasRicevuta.dispatchEvent(mouseEvent);
    }, { passive: false });
    
    canvasRicevuta.addEventListener('touchend', (e) => {
        if (e.cancelable) {
            e.preventDefault();
        }
        const mouseEvent = new MouseEvent('mouseup', {});
        canvasRicevuta.dispatchEvent(mouseEvent);
    }, { passive: false });
}

function startDrawingRicevuta(e) {
    isDrawingRicevuta = true;
    const rect = canvasRicevuta.getBoundingClientRect();
    const scaleX = canvasRicevuta.width / rect.width;
    const scaleY = canvasRicevuta.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    ctxRicevuta.beginPath();
    ctxRicevuta.moveTo(x, y);
}

function drawRicevuta(e) {
    if (!isDrawingRicevuta) return;
    const rect = canvasRicevuta.getBoundingClientRect();
    const scaleX = canvasRicevuta.width / rect.width;
    const scaleY = canvasRicevuta.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    ctxRicevuta.lineTo(x, y);
    ctxRicevuta.stroke();
}

function stopDrawingRicevuta() {
    isDrawingRicevuta = false;
    ctxRicevuta.beginPath();
}

// Genera numero ricevuta
function generaNumeroRicevuta() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    
    const numeroRicevuta = `RIC-${year}${month}${day}-${timestamp}`;
    document.getElementById('ricevuta-id').value = numeroRicevuta;
}

// Toggle modalità pricing
function togglePricingMode() {
    const mode = document.querySelector('input[name="pricing-mode"]:checked').value;
    const pricelistSection = document.getElementById('pricelist-section');
    const manualSection = document.getElementById('manual-pricing-section');
    
    if (mode === 'pricelist') {
        pricelistSection.style.display = 'block';
        manualSection.style.display = 'none';
    } else {
        pricelistSection.style.display = 'none';
        manualSection.style.display = 'block';
    }
    
    // Reset calcoli
    resetCalcoli();
}

// Applica pricelist selezionata
function applicaPricelist() {
    const selectedPricelist = document.getElementById('pricelist-select').value;
    if (selectedPricelist && pricelist[selectedPricelist]) {
        const tariffe = pricelist[selectedPricelist];
        
        // Aggiorna i campi nascosti per i calcoli
        document.getElementById('costo-orario').value = tariffe.costoOrario;
        document.getElementById('costo-chilometro').value = tariffe.costoChilometro;
        document.getElementById('costo-viaggio').value = tariffe.costoViaggio;
        
        // Ricalcola automaticamente
        calcolaImporti();
    }
}

// Calcola importi
function calcolaImporti() {
    const ore = parseFloat(document.getElementById('ricevuta-ore').value) || 0;
    const km = parseFloat(document.getElementById('ricevuta-km').value) || 0;
    const oreViaggio = parseFloat(document.getElementById('ricevuta-ore-viaggio').value) || 0;
    
    let costoOrario, costoChilometro, costoViaggio;
    
    const mode = document.querySelector('input[name="pricing-mode"]:checked').value;
    
    if (mode === 'pricelist') {
        const selectedPricelist = document.getElementById('pricelist-select').value;
        if (selectedPricelist && pricelist[selectedPricelist]) {
            const tariffe = pricelist[selectedPricelist];
            costoOrario = tariffe.costoOrario;
            costoChilometro = tariffe.costoChilometro;
            costoViaggio = tariffe.costoViaggio;
        } else {
            mostraMessaggio('Seleziona una pricelist', 'error');
            return;
        }
    } else {
        costoOrario = parseFloat(document.getElementById('costo-orario').value) || 0;
        costoChilometro = parseFloat(document.getElementById('costo-chilometro').value) || 0;
        costoViaggio = parseFloat(document.getElementById('costo-viaggio').value) || 0;
    }
    
    const costoMateriali = parseFloat(document.getElementById('costo-materiali').value) || 0;
    
    const costoLavoro = ore * costoOrario;
    const costoChilometraggio = km * costoChilometro;
    const costoViaggioTotale = oreViaggio * costoViaggio;
    const totale = costoLavoro + costoChilometraggio + costoViaggioTotale + costoMateriali;
    
    // Aggiorna visualizzazione
    document.getElementById('calc-lavoro').textContent = `€${costoLavoro.toFixed(2)}`;
    document.getElementById('calc-chilometraggio').textContent = `€${costoChilometraggio.toFixed(2)}`;
    document.getElementById('calc-viaggio').textContent = `€${costoViaggioTotale.toFixed(2)}`;
    document.getElementById('calc-materiali').textContent = `€${costoMateriali.toFixed(2)}`;
    document.getElementById('calc-totale').textContent = `€${totale.toFixed(2)}`;
}

// Reset calcoli
function resetCalcoli() {
    document.getElementById('calc-lavoro').textContent = '€0.00';
    document.getElementById('calc-chilometraggio').textContent = '€0.00';
    document.getElementById('calc-viaggio').textContent = '€0.00';
    document.getElementById('calc-materiali').textContent = '€0.00';
    document.getElementById('calc-totale').textContent = '€0.00';
}

// Importa dati da ultimo rapportino
function importaDatiRapportino() {
    const ultimoRapportino = rapportiniArchivio[rapportiniArchivio.length - 1];
    if (ultimoRapportino) {
        // Calcola ore lavorate dall'ultimo rapportino
        const oreLavorate = calcolaOreLavorate(ultimoRapportino.oraInizio, ultimoRapportino.oraFine);
        document.getElementById('ricevuta-ore').value = oreLavorate;
        
        // Importa descrizione
        document.getElementById('ricevuta-descrizione').value = ultimoRapportino.descrizioneIntervento;
        
        mostraMessaggio('Dati importati dall\'ultimo rapportino', 'success');
    } else {
        mostraMessaggio('Nessun rapportino trovato nell\'archivio', 'error');
    }
}

// Importa tutti i dati dal rapportino
function importaTuttiDatiRapportino() {
    // Prova prima a importare dal form corrente del rapportino
    const descrizioneIntervento = document.getElementById('descrizione-intervento');
    
    if (descrizioneIntervento && descrizioneIntervento.value.trim() !== '') {
        // Importa dati cliente dal form corrente
        const nomeCliente = document.getElementById('nome-cliente');
        const cognomeCliente = document.getElementById('cognome-cliente');
        const emailCliente = document.getElementById('email-cliente');
        
        if (nomeCliente && cognomeCliente && nomeCliente.value && cognomeCliente.value) {
            document.getElementById('ricevuta-cliente-nome').value = `${nomeCliente.value} ${cognomeCliente.value}`;
        }
        if (emailCliente && emailCliente.value) {
            document.getElementById('ricevuta-cliente-email').value = emailCliente.value;
        }
        
        // Importa direttamente dal form del rapportino corrente
        document.getElementById('ricevuta-descrizione').value = descrizioneIntervento.value;
        
        // Genera e importa codice intervento
        const codiceIntervento = generateInterventionNumber();
        document.getElementById('ricevuta-codice-intervento').value = codiceIntervento;
        
        // Importa altri dati se disponibili nel form corrente
        const oraInizio = document.getElementById('ora-inizio');
        const oraFine = document.getElementById('ora-fine');
        
        if (oraInizio && oraFine && oraInizio.value && oraFine.value) {
            const oreLavorate = calcolaOreLavorate(oraInizio.value, oraFine.value);
            document.getElementById('ricevuta-ore').value = oreLavorate;
        }
        
        // Importa km se disponibili
        const kmPercorsi = document.getElementById('km-percorsi');
        if (kmPercorsi && kmPercorsi.value) {
            document.getElementById('ricevuta-km').value = kmPercorsi.value;
        }
        
        // Importa ore viaggio se disponibili
        const oreViaggio = document.getElementById('ore-viaggio');
        if (oreViaggio && oreViaggio.value) {
            document.getElementById('ricevuta-ore-viaggio').value = oreViaggio.value;
        }
        
        // Genera nuovo numero ricevuta
        generaNumeroRicevuta();
        
        // Calcola automaticamente gli importi se è selezionata una pricelist
        const pricelistSelect = document.getElementById('pricelist-select');
        if (pricelistSelect.value !== '') {
            calcolaImporti();
        }
        
        mostraMessaggio('✅ Tutti i dati importati dal rapportino corrente con successo!', 'success');
        return;
    }
    
    // Se non ci sono dati nel form corrente, prova dall'archivio
    const ultimoRapportino = rapportiniArchivio[rapportiniArchivio.length - 1];
    if (ultimoRapportino) {
        // Dati cliente
        document.getElementById('ricevuta-cliente-nome').value = `${ultimoRapportino.nomeCliente} ${ultimoRapportino.cognomeCliente}`;
        document.getElementById('ricevuta-cliente-email').value = ultimoRapportino.emailCliente;
        
        // Descrizione intervento
        document.getElementById('ricevuta-descrizione').value = ultimoRapportino.descrizioneIntervento || ultimoRapportino.descrizione || '';
        
        // Importa codice intervento dal rapportino
        document.getElementById('ricevuta-codice-intervento').value = ultimoRapportino.numeroIntervento || '';
        
        // Calcola ore lavorate dal rapportino
        let oreLavorate = 0;
        if (ultimoRapportino.oraInizio && ultimoRapportino.oraFine) {
            oreLavorate = calcolaOreLavorate(ultimoRapportino.oraInizio, ultimoRapportino.oraFine);
        }
        document.getElementById('ricevuta-ore').value = oreLavorate;
        
        // Genera nuovo numero ricevuta
        generaNumeroRicevuta();
        
        // Calcola automaticamente gli importi se è selezionata una pricelist
        const pricelistSelect = document.getElementById('pricelist-select');
        if (pricelistSelect.value !== '') {
            calcolaImporti();
        }
        
        mostraMessaggio('✅ Tutti i dati del rapportino sono stati importati dall\'archivio!', 'success');
    } else {
        mostraMessaggio('❌ Nessun dato disponibile. Compila prima il rapportino o verifica che ci siano rapportini nell\'archivio.', 'error');
    }
}

// Importa dati cliente
function importaDatiCliente() {
    const ultimoRapportino = rapportiniArchivio[rapportiniArchivio.length - 1];
    if (ultimoRapportino) {
        document.getElementById('ricevuta-cliente-nome').value = `${ultimoRapportino.nomeCliente} ${ultimoRapportino.cognomeCliente}`;
        document.getElementById('ricevuta-cliente-email').value = ultimoRapportino.emailCliente;
        
        mostraMessaggio('Dati cliente importati', 'success');
    } else {
        mostraMessaggio('Nessun rapportino trovato nell\'archivio', 'error');
    }
}

// Pulisci firma ricevuta
function pulisciFirmaRicevuta() {
    if (ctxRicevuta && canvasRicevuta) {
        ctxRicevuta.clearRect(0, 0, canvasRicevuta.width, canvasRicevuta.height);
    }
    firmaRicevuta = null;
}

// Valida form ricevuta
function validaFormRicevuta() {
    const descrizione = document.getElementById('ricevuta-descrizione').value.trim();
    const idIntervento = document.getElementById('ricevuta-id').value.trim();
    const nomeCliente = document.getElementById('ricevuta-cliente-nome').value.trim();
    const emailCliente = document.getElementById('ricevuta-cliente-email').value.trim();
    
    if (!descrizione) {
        mostraMessaggio('Inserisci la descrizione dell\'intervento', 'error');
        return false;
    }
    
    if (!idIntervento) {
        mostraMessaggio('Genera un numero identificativo', 'error');
        return false;
    }
    
    if (!nomeCliente) {
        mostraMessaggio('Inserisci il nome del cliente', 'error');
        return false;
    }
    
    if (!emailCliente) {
        mostraMessaggio('Inserisci l\'email del cliente', 'error');
        return false;
    }
    
    // Valida email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(emailCliente)) {
        mostraMessaggio('Inserisci un indirizzo email valido', 'error');
        return false;
    }
    
    // Verifica che ci siano dati di lavoro
    const ore = parseFloat(document.getElementById('ricevuta-ore').value) || 0;
    const km = parseFloat(document.getElementById('ricevuta-km').value) || 0;
    const oreViaggio = parseFloat(document.getElementById('ricevuta-ore-viaggio').value) || 0;
    
    if (ore === 0 && km === 0 && oreViaggio === 0) {
        mostraMessaggio('Inserisci almeno un dato di lavoro (ore, km o ore viaggio)', 'error');
        return false;
    }
    
    // Verifica firma (solo se il canvas esiste)
    if (canvasRicevuta && isCanvasEmpty(canvasRicevuta)) {
        mostraMessaggio('Inserisci la firma digitale', 'error');
        return false;
    }
    
    return true;
}

// Salva e invia ricevuta con firma
async function salvaEInviaRicevutaConFirma() {
    if (!validaFormRicevuta()) {
        return;
    }
    
    try {
        mostraLoading(true);
        
        // Raccogli dati ricevuta
        const datiRicevuta = {
            numeroRicevuta: document.getElementById('ricevuta-id').value,
            descrizioneIntervento: document.getElementById('ricevuta-descrizione').value,
            oreLavorate: parseFloat(document.getElementById('ricevuta-ore').value) || 0,
            chilometri: parseFloat(document.getElementById('ricevuta-km').value) || 0,
            oreViaggio: parseFloat(document.getElementById('ricevuta-ore-viaggio').value) || 0,
            nomeCliente: document.getElementById('ricevuta-cliente-nome').value,
            emailCliente: document.getElementById('ricevuta-cliente-email').value,
            dataCreazione: new Date().toISOString(),
            firmaCliente: canvasRicevuta.toDataURL()
        };
        
        // Calcola importi finali
        calcolaImporti();
        datiRicevuta.costoLavoro = document.getElementById('calc-lavoro').textContent;
        datiRicevuta.costoChilometraggio = document.getElementById('calc-chilometraggio').textContent;
        datiRicevuta.costoViaggio = document.getElementById('calc-viaggio').textContent;
        datiRicevuta.costoMateriali = document.getElementById('calc-materiali').textContent;
        datiRicevuta.totale = document.getElementById('calc-totale').textContent;
        
        // Genera PDF ricevuta
        const pdfBlob = await generaPDFRicevuta(datiRicevuta);
        
        mostraLoading(false);
        
        // Mostra anteprima PDF
        await mostraAnteprimaPDF(pdfBlob);
        
        // Invia email
        await inviaEmailRicevuta(pdfBlob, datiRicevuta);
        
        // Salva in archivio
        salvaRicevutaInArchivio(datiRicevuta);
        
        mostraMessaggio('Ricevuta generata e inviata con successo!', 'success');
        resetFormRicevuta();
        
    } catch (error) {
        console.error('Errore durante la generazione della ricevuta:', error);
        mostraMessaggio('Errore durante la generazione della ricevuta: ' + error.message, 'error');
    } finally {
        mostraLoading(false);
    }
}

// Salva e invia ricevuta (funzione originale)
async function salvaEInviaRicevuta() {
    if (!validaFormRicevuta()) {
        return;
    }
    
    try {
        mostraLoading(true);
        
        // Raccogli dati ricevuta
        const datiRicevuta = {
            numeroRicevuta: document.getElementById('ricevuta-id').value,
            descrizioneIntervento: document.getElementById('ricevuta-descrizione').value,
            oreLavorate: parseFloat(document.getElementById('ricevuta-ore').value) || 0,
            chilometri: parseFloat(document.getElementById('ricevuta-km').value) || 0,
            oreViaggio: parseFloat(document.getElementById('ricevuta-ore-viaggio').value) || 0,
            nomeCliente: document.getElementById('ricevuta-cliente-nome').value,
            emailCliente: document.getElementById('ricevuta-cliente-email').value,
            dataCreazione: new Date().toISOString(),
            firmaCliente: canvasRicevuta.toDataURL()
        };
        
        // Calcola importi finali
        calcolaImporti();
        datiRicevuta.costoLavoro = document.getElementById('calc-lavoro').textContent;
        datiRicevuta.costoChilometraggio = document.getElementById('calc-chilometraggio').textContent;
        datiRicevuta.costoViaggio = document.getElementById('calc-viaggio').textContent;
        datiRicevuta.costoMateriali = document.getElementById('calc-materiali').textContent;
        datiRicevuta.totale = document.getElementById('calc-totale').textContent;
        
        // Genera PDF ricevuta
        const pdfBlob = await generaPDFRicevuta(datiRicevuta);
        
        mostraLoading(false);
        
        // Mostra anteprima PDF
        await mostraAnteprimaPDF(pdfBlob);
        
        // Invia email
        await inviaEmailRicevuta(pdfBlob, datiRicevuta);
        
        // Salva in archivio
        salvaRicevutaInArchivio(datiRicevuta);
        
        mostraMessaggio('Ricevuta generata e inviata con successo!', 'success');
        resetFormRicevuta();
        
    } catch (error) {
        console.error('Errore durante la generazione della ricevuta:', error);
        mostraMessaggio('Errore durante la generazione della ricevuta: ' + error.message, 'error');
    } finally {
        mostraLoading(false);
    }
}

// Genera solo PDF ricevuta (senza invio email)
async function generaSoloRicevutaPDF() {
    if (!validaFormRicevuta()) {
        return;
    }
    
    try {
        mostraLoading(true);
        
        // Raccogli dati ricevuta
        const datiRicevuta = {
            numeroRicevuta: document.getElementById('ricevuta-id').value,
            descrizioneIntervento: document.getElementById('ricevuta-descrizione').value,
            oreLavorate: parseFloat(document.getElementById('ricevuta-ore').value) || 0,
            chilometri: parseFloat(document.getElementById('ricevuta-km').value) || 0,
            oreViaggio: parseFloat(document.getElementById('ricevuta-ore-viaggio').value) || 0,
            nomeCliente: document.getElementById('ricevuta-cliente-nome').value,
            emailCliente: document.getElementById('ricevuta-cliente-email').value,
            dataCreazione: new Date().toISOString(),
            firmaCliente: null // Nessuna firma richiesta per la versione solo PDF
        };
        
        // Calcola importi finali
        calcolaImporti();
        datiRicevuta.costoLavoro = document.getElementById('calc-lavoro').textContent;
        datiRicevuta.costoChilometraggio = document.getElementById('calc-chilometraggio').textContent;
        datiRicevuta.costoViaggio = document.getElementById('calc-viaggio').textContent;
        datiRicevuta.totale = document.getElementById('calc-totale').textContent;
        
        // Genera PDF ricevuta
        const pdfBlob = await generaPDFRicevuta(datiRicevuta);
        
        // Scarica il PDF
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ricevuta_${datiRicevuta.numeroRicevuta}_${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        
        // Salva in archivio
        salvaRicevutaInArchivio(datiRicevuta);
        
        mostraMessaggio('📄 Ricevuta PDF generata e scaricata con successo!', 'success');
        resetFormRicevuta();
        
    } catch (error) {
        console.error('Errore durante la generazione della ricevuta:', error);
        mostraMessaggio('Errore durante la generazione della ricevuta: ' + error.message, 'error');
    } finally {
        mostraLoading(false);
    }
}

// Genera PDF ricevuta
async function generaPDFRicevuta(datiRicevuta) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Carica e aggiungi il logo
    try {
        const logoImg = new Image();
        logoImg.src = './public/images/logo(1).png';
        await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
        });
        
        // Aggiungi logo (ridimensionato)
        doc.addImage(logoImg, 'PNG', 20, 10, 30, 30);
    } catch (error) {
        console.log('Logo non caricato:', error);
    }
    
    // Header con dati aziendali
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('RICEVUTA DI PAGAMENTO', 60, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(52, 152, 219);
    doc.text('Ste-Fix di Paderno Stefano', 60, 28);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Via Convento Aguzzano 17/A', 60, 34);
    doc.text('25034 Orzinuovi (BS)', 60, 38);
    doc.text('Mail: stefixtuttofare@gmail.com', 60, 42);
    doc.text('Cell: +39 352 054 3212', 60, 46);
    
    // Linea separatrice
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(1);
    doc.line(20, 55, 190, 55);
    
    let yPos = 70;
    
    // Numero ricevuta e data
    doc.setFontSize(14);
    doc.setTextColor(52, 152, 219);
    doc.text(`RICEVUTA N° ${datiRicevuta.numeroRicevuta}`, 20, yPos);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Data: ${formatDate(datiRicevuta.dataCreazione)}`, 130, yPos);
    yPos += 20;
    
    // Dati Cliente
    doc.setFontSize(16);
    doc.setTextColor(52, 152, 219);
    doc.text('DATI CLIENTE', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nome: ${datiRicevuta.nomeCliente}`, 20, yPos);
    yPos += 8;
    doc.text(`Email: ${datiRicevuta.emailCliente}`, 20, yPos);
    yPos += 20;
    
    // Descrizione intervento
    doc.setFontSize(16);
    doc.setTextColor(52, 152, 219);
    doc.text('DESCRIZIONE INTERVENTO', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const descrizioneLines = doc.splitTextToSize(datiRicevuta.descrizioneIntervento, 170);
    doc.text(descrizioneLines, 20, yPos);
    yPos += (descrizioneLines.length * 6) + 15;
    
    // Dettagli e costi
    doc.setFontSize(16);
    doc.setTextColor(52, 152, 219);
    doc.text('DETTAGLIO COSTI', 20, yPos);
    yPos += 15;
    
    // Tabella costi
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Header tabella
    doc.setFont('helvetica', 'bold');
    doc.text('Descrizione', 20, yPos);
    doc.text('Quantità', 100, yPos);
    doc.text('Importo', 150, yPos);
    yPos += 8;
    
    // Rimossa linea sotto header per layout più pulito
    
    doc.setFont('helvetica', 'normal');
    
    if (datiRicevuta.oreLavorate > 0) {
        doc.text('Ore lavorate', 20, yPos);
        doc.text(`${datiRicevuta.oreLavorate}h`, 100, yPos);
        doc.text(`${datiRicevuta.costoLavoro}`, 150, yPos);
        yPos += 8;
    }
    
    if (datiRicevuta.chilometri > 0) {
        doc.text('Chilometraggio', 20, yPos);
        doc.text(`${datiRicevuta.chilometri} km`, 100, yPos);
        doc.text(`${datiRicevuta.costoChilometraggio}`, 150, yPos);
        yPos += 8;
    }
    
    if (datiRicevuta.oreViaggio > 0) {
        doc.text('Ore viaggio', 20, yPos);
        doc.text(`${datiRicevuta.oreViaggio}h`, 100, yPos);
        doc.text(`${datiRicevuta.costoViaggio}`, 150, yPos);
        yPos += 8;
    }
    
    if (datiRicevuta.costoMateriali > 0) {
        doc.text('Materiali utilizzati', 20, yPos);
        doc.text('-', 100, yPos);
        doc.text(`${datiRicevuta.costoMateriali}`, 150, yPos);
        yPos += 8;
    }
    
    // Spazio sopra totale
    yPos += 15;
    
    // Totale
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(52, 152, 219);
    doc.text('TOTALE:', 20, yPos);
    doc.text(`${datiRicevuta.totale}`, 150, yPos);
    yPos += 20;
    
    // Firma (se presente)
    if (datiRicevuta.firmaCliente) {
        doc.setFontSize(14);
        doc.setTextColor(52, 152, 219);
        doc.text('FIRMA CLIENTE', 20, yPos);
        yPos += 8;
        
        // Nome del firmatario
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Firma di: ${datiRicevuta.nomeCliente}`, 20, yPos);
        yPos += 10;
        
        try {
            doc.addImage(datiRicevuta.firmaCliente, 'PNG', 20, yPos, 80, 30);
        } catch (error) {
            console.warn('Errore nell\'aggiunta della firma al PDF:', error);
        }
        yPos += 35;
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Grazie per aver scelto Ste-Fix', 105, 260, { align: 'center' });
    
    // Postilla lavori occasionali
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    const postilla = 'Ricevuta per prestazione di lavoro occasionale ai sensi dell\'art. 67 del TUIR e dell\'art. 54-bis del D.L. 50/2017.';
    const postilla2 = 'Prestazione occasionale entro i limiti di legge (max 5.000€ annui per prestatore e max 2.500€ per singolo committente).';
    
    doc.text(postilla, 105, 275, { align: 'center', maxWidth: 180 });
    doc.text(postilla2, 105, 282, { align: 'center', maxWidth: 180 });
    
    return doc.output('blob');
}

// Invia email ricevuta con riepilogo (senza PDF allegato)
async function inviaEmailRicevuta(pdfBlob, datiRicevuta) {
    const templateParams = {
        to_email: datiRicevuta.emailCliente,
        to_name: datiRicevuta.nomeCliente,
        subject: `Riepilogo Ricevuta ${datiRicevuta.numeroRicevuta} - Ste-Fix`,
        numero_ricevuta: datiRicevuta.numeroRicevuta,
        data_ricevuta: formatDate(datiRicevuta.dataCreazione || new Date()),
        descrizione: datiRicevuta.descrizioneIntervento,
        ore_lavorate: datiRicevuta.oreLavorate,
        chilometri: datiRicevuta.chilometri,
        ore_viaggio: datiRicevuta.oreViaggio,
        costo_materiali: datiRicevuta.costoMateriali,
        totale: datiRicevuta.totale
    };
    
    return emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID_SIMPLE, templateParams, EMAIL_PUBLIC_KEY);
}

// Invia email ricevuta con PDF allegato (funzione originale)
async function inviaEmailRicevutaConAllegato(pdfBlob, datiRicevuta) {
    const base64PDF = await blobToBase64(pdfBlob);
    
    const templateParams = {
        to_email: datiRicevuta.emailCliente,
        to_name: datiRicevuta.nomeCliente,
        subject: `Ricevuta ${datiRicevuta.numeroRicevuta} - Ste-Fix`,
        message: `Gentile ${datiRicevuta.nomeCliente},\n\nIn allegato trova la ricevuta per l'intervento effettuato.\n\nNumero ricevuta: ${datiRicevuta.numeroRicevuta}\nTotale: ${datiRicevuta.totale}\n\nGrazie per aver scelto Ste-Fix.\n\nCordiali saluti,\nSte-Fix Team`,
        attachment: base64PDF,
        filename: `Ricevuta_${datiRicevuta.numeroRicevuta}.pdf`
    };
    
    return emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams, EMAIL_PUBLIC_KEY);
}

// Salva ricevuta in archivio
function salvaRicevutaInArchivio(datiRicevuta) {
    ricevuteArchivio.push(datiRicevuta);
    salvaRicevuteInLocalStorage();
}

// Salva ricevute in localStorage
function salvaRicevuteInLocalStorage() {
    try {
        localStorage.setItem('ricevuteArchivio', JSON.stringify(ricevuteArchivio));
    } catch (error) {
        console.error('Errore nel salvare le ricevute:', error);
    }
}

// Carica ricevute da localStorage
function caricaRicevuteDaLocalStorage() {
    try {
        const ricevuteSalvate = localStorage.getItem('ricevuteArchivio');
        if (ricevuteSalvate) {
            ricevuteArchivio = JSON.parse(ricevuteSalvate);
        }
    } catch (error) {
        console.error('Errore nel caricare le ricevute:', error);
        ricevuteArchivio = [];
    }
}

// Reset form ricevuta
function resetFormRicevuta() {
    document.getElementById('ricevuta-form').reset();
    document.getElementById('ricevuta-ore').value = '';
    document.getElementById('ricevuta-km').value = '';
    document.getElementById('ricevuta-ore-viaggio').value = '';
    document.getElementById('costo-materiali').value = '';
    document.getElementById('ricevuta-cliente-nome').value = '';
    document.getElementById('ricevuta-cliente-email').value = '';
    pulisciFirmaRicevuta();
    resetCalcoli();
    generaNumeroRicevuta();
}

// Gestione pricelist
let pricelistInModifica = null;

function mostraGestionePricelist() {
    document.getElementById('modal-pricelist').style.display = 'flex';
    caricaPricelistEsistenti();
    resetFormPricelist();
}

function chiudiModalPricelist() {
    document.getElementById('modal-pricelist').style.display = 'none';
    pricelistInModifica = null;
    resetFormPricelist();
}

function caricaPricelistEsistenti() {
    const lista = document.getElementById('pricelist-lista');
    lista.innerHTML = '';
    
    Object.keys(pricelist).forEach(key => {
        const item = pricelist[key];
        const pricelistCard = document.createElement('div');
        pricelistCard.className = 'pricelist-card';
        pricelistCard.innerHTML = `
            <div class="pricelist-info">
                <h5>${item.nome}</h5>
                <div class="pricelist-details">
                    <span>💰 Orario: €${item.costoOrario}</span>
                    <span>🚗 Km: €${item.costoChilometro}</span>
                    <span>✈️ Viaggio: €${item.costoViaggio}</span>
                </div>
            </div>
            <div class="pricelist-actions">
                <button class="btn btn-sm btn-primary" onclick="modificaPricelist('${key}')" title="Modifica">
                    ✏️
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminaPricelist('${key}')" title="Elimina">
                    🗑️
                </button>
            </div>
        `;
        lista.appendChild(pricelistCard);
    });
}

function resetFormPricelist() {
    document.getElementById('form-pricelist').reset();
    document.getElementById('form-title').textContent = '➕ Aggiungi Nuova Pricelist';
    document.getElementById('btn-salva-pricelist').textContent = '💾 Salva Pricelist';
    document.getElementById('btn-annulla-modifica').style.display = 'none';
    pricelistInModifica = null;
}

function modificaPricelist(key) {
    const item = pricelist[key];
    pricelistInModifica = key;
    
    document.getElementById('pricelist-nome').value = item.nome;
    document.getElementById('pricelist-orario').value = item.costoOrario;
    document.getElementById('pricelist-chilometro').value = item.costoChilometro;
    document.getElementById('pricelist-viaggio').value = item.costoViaggio;
    
    document.getElementById('form-title').textContent = '✏️ Modifica Pricelist';
    document.getElementById('btn-salva-pricelist').textContent = '💾 Aggiorna Pricelist';
    document.getElementById('btn-annulla-modifica').style.display = 'inline-block';
}

function annullaModificaPricelist() {
    resetFormPricelist();
}

function eliminaPricelist(key) {
    if (confirm(`Sei sicuro di voler eliminare la pricelist "${pricelist[key].nome}"?`)) {
        delete pricelist[key];
        salvaPricelistInLocalStorage();
        aggiornaPricelistSelect();
        caricaPricelistEsistenti();
        mostraMessaggio('Pricelist eliminata con successo', 'success');
    }
}

function salvaPricelistInLocalStorage() {
    try {
        localStorage.setItem('pricelist', JSON.stringify(pricelist));
    } catch (error) {
        console.error('Errore nel salvare le pricelist:', error);
        mostraMessaggio('Errore nel salvare le pricelist', 'error');
    }
}

function caricaPricelistDaLocalStorage() {
    try {
        const pricelistSalvate = localStorage.getItem('pricelist');
        if (pricelistSalvate) {
            const pricelistCaricate = JSON.parse(pricelistSalvate);
            Object.assign(pricelist, pricelistCaricate);
        }
    } catch (error) {
        console.error('Errore nel caricare le pricelist:', error);
    }
}

function aggiornaPricelistSelect() {
    const select = document.getElementById('pricelist-select');
    const valorePrecedente = select.value;
    
    // Rimuovi tutte le opzioni tranne la prima
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Aggiungi le nuove opzioni con anteprima delle tariffe
    Object.keys(pricelist).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        const tariffe = pricelist[key];
        option.textContent = `${tariffe.nome} - €${tariffe.costoOrario}/h, €${tariffe.costoChilometro}/km, €${tariffe.costoViaggio}/h viaggio`;
        select.appendChild(option);
    });
    
    // Ripristina il valore precedente se ancora valido
    if (pricelist[valorePrecedente]) {
        select.value = valorePrecedente;
    }
}

// Event listener per il form pricelist
document.addEventListener('DOMContentLoaded', function() {
    const formPricelist = document.getElementById('form-pricelist');
    if (formPricelist) {
        formPricelist.addEventListener('submit', function(e) {
            e.preventDefault();
            salvaNuovaPricelist();
        });
    }
    
    // Carica pricelist salvate all'avvio
    caricaPricelistDaLocalStorage();
    aggiornaPricelistSelect();
});

function salvaNuovaPricelist() {
    const nome = document.getElementById('pricelist-nome').value.trim();
    const costoOrario = parseFloat(document.getElementById('pricelist-orario').value);
    const costoChilometro = parseFloat(document.getElementById('pricelist-chilometro').value);
    const costoViaggio = parseFloat(document.getElementById('pricelist-viaggio').value);
    
    if (!nome || isNaN(costoOrario) || isNaN(costoChilometro) || isNaN(costoViaggio)) {
        mostraMessaggio('Compila tutti i campi correttamente', 'error');
        return;
    }
    
    // Genera chiave univoca per nuove pricelist
    let key;
    if (pricelistInModifica) {
        key = pricelistInModifica;
    } else {
        key = nome.toLowerCase().replace(/[^a-z0-9]/g, '');
        // Assicurati che la chiave sia univoca
        let counter = 1;
        let originalKey = key;
        while (pricelist[key]) {
            key = originalKey + counter;
            counter++;
        }
    }
    
    // Salva la pricelist
    pricelist[key] = {
        nome: nome,
        costoOrario: costoOrario,
        costoChilometro: costoChilometro,
        costoViaggio: costoViaggio
    };
    
    salvaPricelistInLocalStorage();
    aggiornaPricelistSelect();
    caricaPricelistEsistenti();
    resetFormPricelist();
    
    const messaggio = pricelistInModifica ? 'Pricelist aggiornata con successo' : 'Nuova pricelist creata con successo';
    mostraMessaggio(messaggio, 'success');
}

// ===== GESTIONE TAB ARCHIVIO =====

// Mostra tab archivio
function mostraTabArchivio(tipo) {
    // Rimuovi classe active da tutti i tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Nascondi tutti i contenuti
    document.getElementById('archivio-rapportini').style.display = 'none';
    document.getElementById('archivio-ricevute').style.display = 'none';
    
    // Mostra il contenuto selezionato
    if (tipo === 'rapportini') {
        document.getElementById('tab-rapportini').classList.add('active');
        document.getElementById('archivio-rapportini').style.display = 'block';
        inizializzaArchivio();
    } else if (tipo === 'ricevute') {
        document.getElementById('tab-ricevute').classList.add('active');
        document.getElementById('archivio-ricevute').style.display = 'block';
        inizializzaArchivioRicevute();
    }
}

// ===== ARCHIVIO RICEVUTE =====

let ricevuteFiltrate = [];

// Inizializza archivio ricevute
function inizializzaArchivioRicevute() {
    caricaRicevuteDaLocalStorage();
    popolaFiltriAnniRicevute();
    filtraRicevute();
    aggiornaStatisticheRicevute();
}

// Popola filtri anni per ricevute
function popolaFiltriAnniRicevute() {
    const selectAnno = document.getElementById('filter-anno-ricevute');
    const anni = [...new Set(ricevuteArchivio.map(r => new Date(r.dataCreazione).getFullYear()))];
    
    // Pulisci opzioni esistenti (tranne "Tutti gli anni")
    selectAnno.innerHTML = '<option value="">Tutti gli anni</option>';
    
    anni.sort((a, b) => b - a).forEach(anno => {
        const option = document.createElement('option');
        option.value = anno;
        option.textContent = anno;
        selectAnno.appendChild(option);
    });
}

// Filtra ricevute
function filtraRicevute() {
    const searchTerm = document.getElementById('search-ricevute').value.toLowerCase();
    const meseSelezionato = document.getElementById('filter-mese-ricevute').value;
    const annoSelezionato = document.getElementById('filter-anno-ricevute').value;
    
    ricevuteFiltrate = ricevuteArchivio.filter(ricevuta => {
        const dataRicevuta = new Date(ricevuta.dataCreazione);
        const meseRicevuta = String(dataRicevuta.getMonth() + 1).padStart(2, '0');
        const annoRicevuta = String(dataRicevuta.getFullYear());
        
        const matchSearch = !searchTerm || 
            ricevuta.nomeCliente.toLowerCase().includes(searchTerm) ||
            ricevuta.numeroRicevuta.toLowerCase().includes(searchTerm) ||
            ricevuta.descrizioneIntervento.toLowerCase().includes(searchTerm);
            
        const matchMese = !meseSelezionato || meseRicevuta === meseSelezionato;
        const matchAnno = !annoSelezionato || annoRicevuta === annoSelezionato;
        
        return matchSearch && matchMese && matchAnno;
    });
    
    visualizzaRicevute();
    aggiornaStatisticheRicevute();
}

// Visualizza ricevute
function visualizzaRicevute() {
    const container = document.getElementById('ricevute-lista');
    
    if (ricevuteFiltrate.length === 0) {
        container.innerHTML = `
            <div class="no-ricevute" id="no-ricevute">
                <p>📄 Nessuna ricevuta salvata</p>
                <p>Le ricevute verranno automaticamente salvate nell'archivio dopo l'invio.</p>
            </div>
        `;
        return;
    }
    
    // Le ricevute vengono gestite dinamicamente tramite innerHTML
    
    container.innerHTML = ricevuteFiltrate.map(ricevuta => {
        const dataFormattata = formatDate(ricevuta.dataCreazione);
        
        return `
            <div class="rapportino-item" onclick="mostraDettagliRicevuta('${ricevuta.numeroRicevuta}')">
                <div class="rapportino-header">
                    <div class="rapportino-numero">#${ricevuta.numeroRicevuta}</div>
                    <div class="rapportino-data">${dataFormattata}</div>
                </div>
                <div class="rapportino-cliente">${ricevuta.nomeCliente}</div>
                <div class="rapportino-operatore">Email: ${ricevuta.emailCliente}</div>
                <div class="rapportino-descrizione">${ricevuta.descrizioneIntervento}</div>
                <div class="rapportino-totale">Totale: ${ricevuta.totale}</div>
            </div>
        `;
    }).join('');
}

// Aggiorna statistiche ricevute
function aggiornaStatisticheRicevute() {
    const totalRicevute = ricevuteArchivio.length;
    const ricevuteMese = ricevuteArchivio.filter(r => {
        const dataRicevuta = new Date(r.dataCreazione);
        const oggi = new Date();
        return dataRicevuta.getMonth() === oggi.getMonth() && 
               dataRicevuta.getFullYear() === oggi.getFullYear();
    }).length;
    const ricevuteFiltrate = document.querySelectorAll('#ricevute-lista .rapportino-item').length;
    
    document.getElementById('total-ricevute').textContent = totalRicevute;
    document.getElementById('ricevute-mese').textContent = ricevuteMese;
    document.getElementById('ricevute-filtrate').textContent = ricevuteFiltrate;
}

// Mostra dettagli ricevuta
function mostraDettagliRicevuta(numeroRicevuta) {
    const ricevuta = ricevuteArchivio.find(r => r.numeroRicevuta === numeroRicevuta);
    if (!ricevuta) return;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow-y: auto;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; max-height: 90vh; overflow-y: auto; margin: 20px;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f1f3f4; padding-bottom: 15px;">
                <h3 style="margin: 0; color: #2c3e50;">💰 Dettagli Ricevuta #${ricevuta.numeroRicevuta}</h3>
                <button onclick="this.closest('.modal-content').parentElement.remove()" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">×</button>
            </div>
            
            <div class="dettaglio-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Data Creazione:</div>
                    <div class="dettaglio-value">${formatDate(ricevuta.dataCreazione)}</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Cliente:</div>
                    <div class="dettaglio-value">${ricevuta.nomeCliente}</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Email:</div>
                    <div class="dettaglio-value">${ricevuta.emailCliente}</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Totale:</div>
                    <div class="dettaglio-value" style="font-weight: bold; color: #27ae60;">${ricevuta.totale}</div>
                </div>
            </div>
            
            <div class="dettaglio-item" style="margin-bottom: 15px;">
                <div class="dettaglio-label">Descrizione Intervento:</div>
                <div class="dettaglio-value">${ricevuta.descrizioneIntervento}</div>
            </div>
            
            <div class="dettaglio-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Ore Lavorate:</div>
                    <div class="dettaglio-value">${ricevuta.oreLavorate}h</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Chilometri:</div>
                    <div class="dettaglio-value">${ricevuta.chilometri} km</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Ore Viaggio:</div>
                    <div class="dettaglio-value">${ricevuta.oreViaggio}h</div>
                </div>
            </div>
            
            <div class="dettaglio-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Costo Lavoro:</div>
                    <div class="dettaglio-value">${ricevuta.costoLavoro}</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Costo Chilometraggio:</div>
                    <div class="dettaglio-value">${ricevuta.costoChilometraggio}</div>
                </div>
                <div class="dettaglio-item">
                    <div class="dettaglio-label">Costo Viaggio:</div>
                    <div class="dettaglio-value">${ricevuta.costoViaggio}</div>
                </div>
            </div>
            
            ${ricevuta.firmaCliente ? `
                <div class="dettaglio-item" style="margin-bottom: 20px;">
                    <div class="dettaglio-label">Firma Cliente:</div>
                    <img src="${ricevuta.firmaCliente}" style="max-width: 200px; border: 1px solid #ddd; border-radius: 5px;" alt="Firma Cliente">
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="rigeneraRicevutaPDF('${ricevuta.numeroRicevuta}')" class="btn btn-primary">📄 Rigenera PDF</button>
                <button onclick="this.closest('.modal-content').parentElement.remove()" class="btn btn-secondary">Chiudi</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Esporta archivio ricevute
function esportaArchivioRicevute() {
    if (ricevuteArchivio.length === 0) {
        mostraMessaggio('Nessuna ricevuta da esportare', 'warning');
        return;
    }
    
    const headers = ['Numero Ricevuta', 'Data', 'Cliente', 'Email', 'Descrizione', 'Ore Lavorate', 'Chilometri', 'Ore Viaggio', 'Costo Lavoro', 'Costo Chilometraggio', 'Costo Viaggio', 'Totale'];
    
    const csvContent = [
        headers.join(','),
        ...ricevuteArchivio.map(ricevuta => [
            `"${ricevuta.numeroRicevuta}"`,
            `"${formatDate(ricevuta.dataCreazione)}"`,
            `"${ricevuta.nomeCliente}"`,
            `"${ricevuta.emailCliente}"`,
            `"${ricevuta.descrizioneIntervento.replace(/"/g, '""')}"`,
            ricevuta.oreLavorate,
            ricevuta.chilometri,
            ricevuta.oreViaggio,
            `"${ricevuta.costoLavoro}"`,
            `"${ricevuta.costoChilometraggio}"`,
            `"${ricevuta.costoViaggio}"`,
            `"${ricevuta.totale}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `archivio_ricevute_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostraMessaggio('Archivio ricevute esportato con successo!', 'success');
}

// Cancella archivio ricevute
function cancellaArchivioRicevute() {
    if (ricevuteArchivio.length === 0) {
        mostraMessaggio('Nessuna ricevuta da cancellare', 'warning');
        return;
    }
    
    if (confirm('Sei sicuro di voler cancellare TUTTE le ricevute dall\'archivio? Questa azione non può essere annullata.')) {
        ricevuteArchivio = [];
        salvaRicevuteInLocalStorage();
        inizializzaArchivioRicevute();
        mostraMessaggio('Archivio ricevute cancellato', 'success');
    }
}

// ===== RIGENERAZIONE PDF =====

// Rigenera PDF rapportino dall'archivio
async function rigeneraRapportinoPDF() {
    if (!rapportinoCorrente) {
        mostraMessaggio('Nessun rapportino selezionato', 'error');
        return;
    }
    
    try {
        mostraLoading(true);
        
        // Prepara i dati per la generazione PDF
        const formData = {
            cliente: rapportinoCorrente.cliente,
            intervento: rapportinoCorrente.intervento,
            operatore: rapportinoCorrente.operatore,
            numeroIntervento: rapportinoCorrente.numeroIntervento
        };
        
        // Genera il PDF usando la funzione esistente
        const pdfBlob = await generaPDFDaArchivio(formData, rapportinoCorrente.firmaOperatore, rapportinoCorrente.firmaCliente);
        
        // Scarica il PDF
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapportino_${rapportinoCorrente.numeroIntervento}_${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        
        mostraMessaggio('PDF rigenerato e scaricato con successo!', 'success');
        
    } catch (error) {
        console.error('Errore nella rigenerazione PDF rapportino:', error);
        mostraMessaggio('Errore nella rigenerazione del PDF', 'error');
    } finally {
        mostraLoading(false);
    }
}

// Rigenera PDF ricevuta dall'archivio
async function rigeneraRicevutaPDF(numeroRicevuta) {
    const ricevuta = ricevuteArchivio.find(r => r.numeroRicevuta === numeroRicevuta);
    if (!ricevuta) {
        mostraMessaggio('Ricevuta non trovata', 'error');
        return;
    }
    
    try {
        mostraLoading(true);
        
        // Genera il PDF usando la funzione esistente
        const pdfBlob = await generaPDFRicevuta(ricevuta);
        
        // Scarica il PDF
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ricevuta_${ricevuta.numeroRicevuta}_${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        
        mostraMessaggio('PDF ricevuta rigenerato e scaricato con successo!', 'success');
        
        // Chiudi il modal se aperto
        const modal = document.querySelector('.modal-content');
        if (modal && modal.parentElement) {
            modal.parentElement.remove();
        }
        
    } catch (error) {
        console.error('Errore nella rigenerazione PDF ricevuta:', error);
        mostraMessaggio('Errore nella rigenerazione del PDF ricevuta', 'error');
    } finally {
        mostraLoading(false);
    }
}

// Funzione per generare PDF da dati archivio rapportino
async function generaPDFDaArchivio(formData, firmaOperatore, firmaCliente) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORTINO DI INTERVENTO', 105, 20, { align: 'center' });
    
    // Numero intervento
    doc.setFontSize(14);
    doc.text(`N° ${formData.numeroIntervento}`, 105, 30, { align: 'center' });
    
    // Dati cliente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATI CLIENTE', 20, 50);
    doc.setFont('helvetica', 'normal');
    
    let y = 60;
    doc.text(`Nome: ${formData.cliente.nome} ${formData.cliente.cognome}`, 20, y);
    y += 8;
    doc.text(`Email: ${formData.cliente.email}`, 20, y);
    y += 8;
    doc.text(`Telefono: ${formData.cliente.telefono}`, 20, y);
    y += 8;
    doc.text(`Indirizzo: ${formData.cliente.indirizzo}`, 20, y);
    
    // Dati intervento
    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('DATI INTERVENTO', 20, y);
    doc.setFont('helvetica', 'normal');
    
    y += 10;
    doc.text(`Data: ${formData.intervento.data}`, 20, y);
    y += 8;
    doc.text(`Ora inizio: ${formData.intervento.oraInizio}`, 20, y);
    y += 8;
    doc.text(`Ora fine: ${formData.intervento.oraFine}`, 20, y);
    
    // Calcola ore lavorate
    const oreLavorate = calcolaOreLavorate(formData.intervento.oraInizio, formData.intervento.oraFine);
    y += 8;
    doc.text(`Ore lavorate: ${oreLavorate}`, 20, y);
    
    // Descrizione lavori
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIZIONE LAVORI ESEGUITI', 20, y);
    doc.setFont('helvetica', 'normal');
    
    y += 10;
    const descrizioneLines = doc.splitTextToSize(formData.intervento.descrizione, 170);
    doc.text(descrizioneLines, 20, y);
    y += descrizioneLines.length * 6;
    
    // Materiali utilizzati
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('MATERIALI UTILIZZATI', 20, y);
    doc.setFont('helvetica', 'normal');
    
    y += 10;
    const materialiLines = doc.splitTextToSize(formData.intervento.materiali, 170);
    doc.text(materialiLines, 20, y);
    y += materialiLines.length * 6;
    
    // Firme
    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('FIRME', 20, y);
    
    // Firma operatore
    y += 15;
    doc.setFont('helvetica', 'normal');
    doc.text(`Operatore: ${formData.operatore.nome}`, 20, y);
    
    if (firmaOperatore) {
        try {
            doc.addImage(firmaOperatore, 'PNG', 20, y + 5, 60, 20);
        } catch (error) {
            console.warn('Errore nell\'aggiunta della firma operatore al PDF:', error);
        }
    }
    
    // Firma cliente
    doc.text(`Cliente: ${formData.operatore.nomeCliente}`, 110, y);
    
    if (firmaCliente) {
        try {
            doc.addImage(firmaCliente, 'PNG', 110, y + 5, 60, 20);
        } catch (error) {
            console.warn('Errore nell\'aggiunta della firma cliente al PDF:', error);
        }
    }
    
    return doc.output('blob');
}