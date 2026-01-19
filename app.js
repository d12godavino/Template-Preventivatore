// DettoFatto Work - Preventivatore Smart (DEMO COMMERCIALE)
// Versione demo con dati fittizi di esempio

// Base URL per compatibilità GitHub Pages
const BASE_URL = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');

// Carica il database
let databaseEdile = [];
let vociPreventivo = [];
let contatorePrevenetivo = parseInt(localStorage.getItem('ultimoNumeroPreventivo')) || 1;

// Funzione per caricare il database dal CSV
async function caricaDatabase() {
    // Lista di percorsi da provare (per compatibilità GitHub Pages e Replit)
    const percorsiDaProvare = [
        'assets/database.csv',
        './assets/database.csv',
        'database.csv'
    ];
    
    for (const databasePath of percorsiDaProvare) {
        try {
            console.log(`📂 Tentativo caricamento database da: ${databasePath}`);
            const response = await fetch(databasePath);
            
            if (!response.ok) {
                console.warn(`⚠️ Percorso ${databasePath} non trovato (${response.status})`);
                continue;
            }
            
            const csvText = await response.text();
            const lines = csvText.split(/\r?\n/);
            
            if (lines.length === 0) continue;
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
            
            databaseEdile = [];
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const values = line.split(',');
                    const obj = {};
                    headers.forEach((header, index) => {
                        let val = values[index] || '';
                        obj[header] = val.trim().replace(/^["']|["']$/g, '');
                    });
                    databaseEdile.push(obj);
                }
            }
            
            if (databaseEdile.length > 0) {
                console.log(`✅ Database caricato da ${databasePath}: ${databaseEdile.length} voci`);
                return; // Successo, esci dalla funzione
            }
        } catch (error) {
            console.warn(`⚠️ Errore caricamento da ${databasePath}:`, error.message);
        }
    }
    
    // Fallback finale: usa database JS inline se disponibile
    if (typeof window.databaseEdileFallback !== 'undefined' && window.databaseEdileFallback.length > 0) {
        databaseEdile = window.databaseEdileFallback;
        console.log(`✅ Database caricato da fallback JS: ${databaseEdile.length} voci`);
        return;
    }
    
    console.error('❌ ERRORE: Impossibile caricare il database da nessun percorso');
    alert('Errore: impossibile caricare il database. Ricarica la pagina o contatta il supporto.');
}

// Formattazione valuta italiana
function formatCurrency(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) return "€ 0,00";
    
    const numeroFormattato = new Intl.NumberFormat('it-IT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(parseFloat(amount));
    
    return `€ ${numeroFormattato}`;
}

// Inizializzazione dell'applicazione
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🏗️ DettoFatto Work - DEMO COMMERCIALE - Inizializzazione...');
    
    // Gestione Login
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginOverlay = document.getElementById('loginOverlay');
    const loginError = document.getElementById('loginError');

    loginBtn.addEventListener('click', function() {
        const user = usernameInput.value;
        const pass = passwordInput.value;

        // Credenziali: admin / 1212
        if (user === 'admin' && pass === '1212') {
            document.body.classList.remove('auth-hidden');
            loginOverlay.classList.add('hidden');
        } else {
            loginError.classList.remove('hidden');
        }
    });

    // Permetti invio con tasto Enter
    passwordInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') loginBtn.click(); });

    await caricaDatabase();
    inizializzaApp();
    caricaCategorie();
    impostaDataOggi();
    impostaEventListeners();
    caricaDatiDemo();
    console.log('✅ Applicazione DEMO pronta!');
});

function inizializzaApp() {
    const numeroPreventivo = document.getElementById('numeroPreventivo');
    if (numeroPreventivo) {
        numeroPreventivo.value = String(contatorePrevenetivo).padStart(3, '0');
        
        // Se l'utente modifica manualmente il numero
        numeroPreventivo.addEventListener('change', function() {
            const nuovoValore = parseInt(this.value);
            if (!isNaN(nuovoValore)) {
                contatorePrevenetivo = nuovoValore;
                localStorage.setItem('ultimoNumeroPreventivo', contatorePrevenetivo);
            }
        });
    }
}

function impostaDataOggi() {
    const oggi = new Date();
    const dataInput = document.getElementById('dataPreventivo');
    if (dataInput) {
        const anno = oggi.getFullYear();
        const mese = String(oggi.getMonth() + 1).padStart(2, '0');
        const giorno = String(oggi.getDate()).padStart(2, '0');
        dataInput.value = `${anno}-${mese}-${giorno}`;
    }
}

function caricaCategorie() {
    const categoriaSelect = document.getElementById('categoria');
    if (!categoriaSelect) return;
    
    const categorie = [...new Set(databaseEdile.map(item => item.Categoria))].sort();
    categoriaSelect.innerHTML = '<option value="">Seleziona categoria</option>';
    
    categorie.forEach(categoria => {
        if (categoria) {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            categoriaSelect.appendChild(option);
        }
    });
}

function caricaSottocategorie(categoriaSelezionata) {
    const sottocategoriaSelect = document.getElementById('sottocategoria');
    if (!sottocategoriaSelect) return;
    
    const sottocategorie = [...new Set(
        databaseEdile
            .filter(item => item.Categoria === categoriaSelezionata)
            .map(item => item.Sottocategoria)
    )].sort();
    
    sottocategoriaSelect.innerHTML = '<option value="">Seleziona sottocategoria</option>';
    sottocategoriaSelect.disabled = false;
    
    sottocategorie.forEach(sottocategoria => {
        if (sottocategoria) {
            const option = document.createElement('option');
            option.value = sottocategoria;
            option.textContent = sottocategoria;
            sottocategoriaSelect.appendChild(option);
        }
    });
    
    resetDescrizioneFields();
}

function caricaDescrizioni(categoriaSelezionata, sottocategoriaSelezionata) {
    const descrizioneSelect = document.getElementById('descrizione');
    if (!descrizioneSelect) return;
    
    const descrizioni = databaseEdile.filter(item => 
        item.Categoria === categoriaSelezionata && 
        item.Sottocategoria === sottocategoriaSelezionata
    );
    
    descrizioneSelect.innerHTML = '<option value="">Seleziona descrizione</option>';
    descrizioneSelect.disabled = false;
    
    descrizioni.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = `${categoriaSelezionata}|${sottocategoriaSelezionata}|${index}`;
        option.textContent = item.Descrizione;
        option.dataset.prezzo = item.Prezzo_Unitario;
        option.dataset.um = item['Unità_Misura'];
        descrizioneSelect.appendChild(option);
    });
}

function resetSottocategorieFields() {
    const sottocategoriaSelect = document.getElementById('sottocategoria');
    if (sottocategoriaSelect) {
        sottocategoriaSelect.innerHTML = '<option value="">Prima seleziona una categoria</option>';
        sottocategoriaSelect.disabled = true;
    }
    resetDescrizioneFields();
}

function resetDescrizioneFields() {
    const descrizioneSelect = document.getElementById('descrizione');
    const prezzoUnitarioInput = document.getElementById('prezzoUnitario');
    const unitaMisuraSelect = document.getElementById('unitaMisura');
    
    if (descrizioneSelect) {
        descrizioneSelect.innerHTML = '<option value="">Prima seleziona una sottocategoria</option>';
        descrizioneSelect.disabled = true;
    }
    if (prezzoUnitarioInput) prezzoUnitarioInput.value = '';
    if (unitaMisuraSelect) unitaMisuraSelect.value = '';
}

function impostaEventListeners() {
    // Categoria
    const categoriaSelect = document.getElementById('categoria');
    if (categoriaSelect) {
        categoriaSelect.addEventListener('change', function() {
            if (this.value) {
                caricaSottocategorie(this.value);
            } else {
                resetSottocategorieFields();
            }
        });
    }
    
    // Sottocategoria
    const sottocategoriaSelect = document.getElementById('sottocategoria');
    if (sottocategoriaSelect) {
        sottocategoriaSelect.addEventListener('change', function() {
            const categoria = document.getElementById('categoria').value;
            if (this.value && categoria) {
                caricaDescrizioni(categoria, this.value);
            } else {
                resetDescrizioneFields();
            }
        });
    }
    
    // Descrizione
    const descrizioneSelect = document.getElementById('descrizione');
    if (descrizioneSelect) {
        descrizioneSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption && selectedOption.dataset.prezzo) {
                document.getElementById('prezzoUnitario').value = selectedOption.dataset.prezzo;
                document.getElementById('unitaMisura').value = selectedOption.dataset.um || '';
            }
        });
    }
    
    // Unità misura custom
    const unitaMisuraSelect = document.getElementById('unitaMisura');
    const unitaMisuraCustom = document.getElementById('unitaMisuraCustom');
    if (unitaMisuraSelect && unitaMisuraCustom) {
        unitaMisuraSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                unitaMisuraCustom.classList.remove('hidden');
            } else {
                unitaMisuraCustom.classList.add('hidden');
            }
        });
    }
    
    // Modalità pagamento custom
    const modalitaPagamento = document.getElementById('modalitaPagamento');
    const pagamentoCustom = document.getElementById('pagamentoCustom');
    if (modalitaPagamento && pagamentoCustom) {
        modalitaPagamento.addEventListener('change', function() {
            if (this.value === 'custom') {
                pagamentoCustom.classList.remove('hidden');
            } else {
                pagamentoCustom.classList.add('hidden');
            }
        });
    }
    
    // IVA
    const includiIva = document.getElementById('includiIva');
    const ivaSettings = document.getElementById('ivaSettings');
    if (includiIva && ivaSettings) {
        includiIva.addEventListener('change', function() {
            if (this.checked) {
                ivaSettings.classList.remove('hidden');
                document.getElementById('rigaIva').classList.remove('hidden');
            } else {
                ivaSettings.classList.add('hidden');
                document.getElementById('rigaIva').classList.add('hidden');
            }
            calcolaTotali();
        });
    }
    
    // Percentuale IVA
    const percentualeIva = document.getElementById('percentualeIva');
    const ivaCustom = document.getElementById('ivaCustom');
    if (percentualeIva && ivaCustom) {
        percentualeIva.addEventListener('change', function() {
            if (this.value === 'custom') {
                ivaCustom.classList.remove('hidden');
            } else {
                ivaCustom.classList.add('hidden');
                calcolaTotali();
            }
        });
        
        ivaCustom.addEventListener('input', calcolaTotali);
    }
    
    // Aggiungi voce
    const aggiungiBtn = document.getElementById('aggiungiVoce');
    if (aggiungiBtn) {
        aggiungiBtn.addEventListener('click', aggiungiVocePreventivo);
    }
    
    // Anteprima
    const anteprimaBtn = document.getElementById('anteprimaPreventivo');
    if (anteprimaBtn) {
        anteprimaBtn.addEventListener('click', anteprimaPreventivo);
    }
    
    // Genera PDF
    const generaPdfBtn = document.getElementById('generaPDF');
    if (generaPdfBtn) {
        generaPdfBtn.addEventListener('click', generaPDF);
    }
    
    // Nuovo preventivo
    const nuovoBtn = document.getElementById('nuovoPreventivo');
    if (nuovoBtn) {
        nuovoBtn.addEventListener('click', nuovoPreventivo);
    }
}

function aggiungiVocePreventivo() {
    const descrizionePersonalizzata = document.getElementById('descrizionePersonalizzata').value.trim();
    const descrizioneSelect = document.getElementById('descrizione');
    const selectedOption = descrizioneSelect.options[descrizioneSelect.selectedIndex];
    
    let descrizione = descrizionePersonalizzata || (selectedOption?.text !== 'Seleziona descrizione' ? selectedOption?.text : '');
    
    if (!descrizione) {
        alert('Inserisci una descrizione');
        return;
    }
    
    const dimensioni = document.getElementById('dimensioni').value.trim();
    const quantita = parseFloat(document.getElementById('quantita').value) || 0;
    const prezzoUnitario = parseFloat(document.getElementById('prezzoUnitario').value) || 0;
    
    let unitaMisura = document.getElementById('unitaMisura').value;
    if (unitaMisura === 'custom') {
        unitaMisura = document.getElementById('unitaMisuraCustom').value.trim();
    }
    
    if (quantita <= 0 || prezzoUnitario <= 0) {
        alert('Quantità e prezzo unitario devono essere maggiori di zero');
        return;
    }
    
    const importoTotale = quantita * prezzoUnitario;
    
    const voce = {
        descrizione,
        unitaMisura: unitaMisura || '-',
        dimensioni: dimensioni || '-',
        quantita,
        prezzoUnitario,
        importo: importoTotale
    };
    
    vociPreventivo.push(voce);
    aggiornaTabella();
    calcolaTotali();
    pulisciCampiMateriali();
}

function aggiornaTabella() {
    const tbody = document.querySelector('#tabellaPreventivo tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    vociPreventivo.forEach((voce, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${voce.descrizione}</td>
            <td>${voce.unitaMisura}</td>
            <td>${voce.dimensioni}</td>
            <td>${voce.quantita}</td>
            <td>${formatCurrency(voce.prezzoUnitario)}</td>
            <td>${formatCurrency(voce.importo)}</td>
            <td>
                <button class="btn btn--danger" onclick="rimuoviVoce(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function rimuoviVoce(index) {
    vociPreventivo.splice(index, 1);
    aggiornaTabella();
    calcolaTotali();
}

function calcolaTotali() {
    const totaleImponibile = vociPreventivo.reduce((sum, voce) => sum + voce.importo, 0);
    
    document.getElementById('totaleImponibile').textContent = formatCurrency(totaleImponibile);
    
    const includiIva = document.getElementById('includiIva').checked;
    let totaleFinale = totaleImponibile;
    
    if (includiIva) {
        let percentuale = parseFloat(document.getElementById('percentualeIva').value);
        if (isNaN(percentuale)) {
            percentuale = parseFloat(document.getElementById('ivaCustom').value) || 0;
        }
        
        const importoIva = totaleImponibile * (percentuale / 100);
        totaleFinale = totaleImponibile + importoIva;
        
        document.getElementById('labelPercentualeIva').textContent = percentuale;
        document.getElementById('totaleIva').textContent = formatCurrency(importoIva);
    }
    
    document.getElementById('totaleFinale').textContent = formatCurrency(totaleFinale);
}

function pulisciCampiMateriali() {
    document.getElementById('descrizionePersonalizzata').value = '';
    document.getElementById('dimensioni').value = '';
    document.getElementById('quantita').value = '';
    document.getElementById('prezzoUnitario').value = '';
    document.getElementById('categoria').value = '';
    resetSottocategorieFields();
}

function caricaDatiDemo() {
    const vociDemo = [
        {
            descrizione: 'Consulenza professionale iniziale e analisi requisiti',
            unitaMisura: 'ore',
            dimensioni: '-',
            quantita: 8,
            prezzoUnitario: 75.00,
            importo: 600.00
        },
        {
            descrizione: 'Sviluppo e implementazione progetto fase 1',
            unitaMisura: 'a corpo',
            dimensioni: '-',
            quantita: 1,
            prezzoUnitario: 1500.00,
            importo: 1500.00
        },
        {
            descrizione: 'Fornitura materiali e attrezzature specializzate',
            unitaMisura: 'cad',
            dimensioni: '-',
            quantita: 5,
            prezzoUnitario: 180.00,
            importo: 900.00
        },
        {
            descrizione: 'Gestione e coordinamento attività operative',
            unitaMisura: 'ore',
            dimensioni: '-',
            quantita: 16,
            prezzoUnitario: 55.00,
            importo: 880.00
        },
        {
            descrizione: 'Assistenza post-vendita e supporto tecnico',
            unitaMisura: 'mese',
            dimensioni: '-',
            quantita: 3,
            prezzoUnitario: 250.00,
            importo: 750.00
        }
    ];
    
    vociPreventivo = vociDemo;
    aggiornaTabella();
    
    document.getElementById('includiIva').checked = true;
    document.getElementById('ivaSettings').classList.remove('hidden');
    document.getElementById('rigaIva').classList.remove('hidden');
    document.getElementById('percentualeIva').value = '22';
    
    calcolaTotali();
    console.log('✅ Dati demo caricati: 5 voci di esempio con IVA 22%');
}

function caricaPresetElettricista() {
    const vociPreset = [
        { descrizione: 'Realizzazione punto luce standard', unitaMisura: 'cad', dimensioni: '-', quantita: 6, prezzoUnitario: 45.00, importo: 270.00 },
        { descrizione: 'Installazione presa elettrica', unitaMisura: 'cad', dimensioni: '-', quantita: 8, prezzoUnitario: 35.00, importo: 280.00 },
        { descrizione: 'Installazione quadro elettrico', unitaMisura: 'cad', dimensioni: '-', quantita: 1, prezzoUnitario: 350.00, importo: 350.00 },
        { descrizione: 'Verifica e certificazione impianto', unitaMisura: 'cad', dimensioni: '-', quantita: 1, prezzoUnitario: 180.00, importo: 180.00 }
    ];
    vociPreventivo = vociPreventivo.concat(vociPreset);
    aggiornaTabella();
    calcolaTotali();
}

function caricaPresetIdraulico() {
    const vociPreset = [
        { descrizione: 'Installazione rubinetteria', unitaMisura: 'cad', dimensioni: '-', quantita: 3, prezzoUnitario: 65.00, importo: 195.00 },
        { descrizione: 'Installazione sanitari', unitaMisura: 'cad', dimensioni: '-', quantita: 2, prezzoUnitario: 120.00, importo: 240.00 },
        { descrizione: 'Sostituzione tubazioni', unitaMisura: 'ml', dimensioni: '-', quantita: 12, prezzoUnitario: 45.00, importo: 540.00 },
        { descrizione: 'Riparazione perdite e infiltrazioni', unitaMisura: 'ore', dimensioni: '-', quantita: 3, prezzoUnitario: 55.00, importo: 165.00 }
    ];
    vociPreventivo = vociPreventivo.concat(vociPreset);
    aggiornaTabella();
    calcolaTotali();
}

function caricaPresetTecnico() {
    const vociPreset = [
        { descrizione: 'Manutenzione ordinaria programmata', unitaMisura: 'cad', dimensioni: '-', quantita: 1, prezzoUnitario: 95.00, importo: 95.00 },
        { descrizione: 'Diagnosi e risoluzione guasti', unitaMisura: 'cad', dimensioni: '-', quantita: 1, prezzoUnitario: 90.00, importo: 90.00 },
        { descrizione: 'Intervento di riparazione standard', unitaMisura: 'ore', dimensioni: '-', quantita: 4, prezzoUnitario: 50.00, importo: 200.00 },
        { descrizione: 'Installazione e configurazione dispositivi', unitaMisura: 'cad', dimensioni: '-', quantita: 2, prezzoUnitario: 120.00, importo: 240.00 },
        { descrizione: 'Controllo e verifica funzionamento', unitaMisura: 'cad', dimensioni: '-', quantita: 1, prezzoUnitario: 65.00, importo: 65.00 }
    ];
    vociPreventivo = vociPreventivo.concat(vociPreset);
    aggiornaTabella();
    calcolaTotali();
}

function caricaPresetServiziProfessionali() {
    const vociPreset = [
        { descrizione: 'Consulenza professionale iniziale', unitaMisura: 'ore', dimensioni: '-', quantita: 4, prezzoUnitario: 75.00, importo: 300.00 },
        { descrizione: 'Analisi e valutazione tecnica', unitaMisura: 'cad', dimensioni: '-', quantita: 1, prezzoUnitario: 150.00, importo: 150.00 },
        { descrizione: 'Progettazione soluzione personalizzata', unitaMisura: 'a corpo', dimensioni: '-', quantita: 1, prezzoUnitario: 350.00, importo: 350.00 },
        { descrizione: 'Coordinamento attività operative', unitaMisura: 'ore', dimensioni: '-', quantita: 8, prezzoUnitario: 55.00, importo: 440.00 }
    ];
    vociPreventivo = vociPreventivo.concat(vociPreset);
    aggiornaTabella();
    calcolaTotali();
}

function nuovoPreventivo() {
    if (!confirm('Sei sicuro di voler creare un nuovo preventivo? I dati attuali verranno persi.')) {
        return;
    }
    
    vociPreventivo = [];
    contatorePrevenetivo++;
    localStorage.setItem('ultimoNumeroPreventivo', contatorePrevenetivo);
    
    document.getElementById('numeroPreventivo').value = String(contatorePrevenetivo).padStart(3, '0');
    document.getElementById('nomeCliente').value = '';
    document.getElementById('indirizzoCliente').value = '';
    document.getElementById('telefonoCliente').value = '';
    document.getElementById('emailCliente').value = '';
    document.getElementById('cfPivaCliente').value = '';
    document.getElementById('titoloPreventivo').value = '';
    
    aggiornaTabella();
    calcolaTotali();
    impostaDataOggi();
    pulisciCampiMateriali();
}

// Funzione per visualizzare anteprima preventivo online
function anteprimaPreventivo() {
    const nomeCliente = document.getElementById('nomeCliente').value.trim();
    if (!nomeCliente) {
        alert('Inserisci il nome del cliente');
        return;
    }
    
    if (vociPreventivo.length === 0) {
        alert('Aggiungi almeno una voce al preventivo');
        return;
    }
    
    // Recupera tutti i dati
    const indirizzoAzienda = document.getElementById('indirizzoAzienda').value;
    const telefonoAzienda = document.getElementById('telefonoAzienda').value;
    const emailAzienda = document.getElementById('emailAzienda').value;
    const partitaIva = document.getElementById('partitaIva').value;
    const numeroPreventivo = document.getElementById('numeroPreventivo').value;
    const titoloPreventivo = document.getElementById('titoloPreventivo').value || 'PREVENTIVO';
    const indirizzoCliente = document.getElementById('indirizzoCliente').value;
    const telefonoCliente = document.getElementById('telefonoCliente').value;
    const emailCliente = document.getElementById('emailCliente').value;
    const cfPivaCliente = document.getElementById('cfPivaCliente').value;
    const notePreventivo = document.getElementById('notePreventivo').value;
    const validita = document.getElementById('validita').value;
    
    let modalitaPagamento = document.getElementById('modalitaPagamento').value;
    if (modalitaPagamento === 'custom') {
        modalitaPagamento = document.getElementById('pagamentoCustom').value;
    }
    
    // Formatta data
    const dataInput = document.getElementById('dataPreventivo').value;
    const dataObj = new Date(dataInput);
    const opzioni = { year: 'numeric', month: 'long', day: 'numeric' };
    const dataFormattata = dataObj.toLocaleDateString('it-IT', opzioni);
    const luogoData = `Milano, ${dataFormattata}`;
    
    // Genera HTML per l'anteprima
    const htmlAnteprima = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Anteprima Preventivo N° ${numeroPreventivo}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 40px;
                    background: white;
                    color: #000;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .header img {
                    max-width: 400px;
                    height: auto;
                    margin-bottom: 15px;
                }
                .header p {
                    margin: 5px 0;
                    font-size: 12px;
                }
                .title-section {
                    text-align: center;
                    margin: 30px 0;
                }
                .title-section h2 {
                    font-size: 20px;
                    color: #34A873;
                    margin-bottom: 10px;
                }
                .title-section p {
                    font-size: 12px;
                }
                .client-box {
                    margin: 25px 0;
                    padding: 15px;
                    background: #f5f5f5;
                    border-radius: 5px;
                }
                .client-box h3 {
                    font-size: 14px;
                    margin-bottom: 10px;
                    color: #34A873;
                }
                .client-box p {
                    margin: 3px 0;
                    font-size: 12px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    font-size: 11px;
                }
                thead {
                    background: #34A873;
                    color: white;
                }
                th, td {
                    padding: 8px;
                    border: 1px solid #ddd;
                    word-wrap: break-word;
                    white-space: normal;
                }
                th {
                    text-align: left;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .totals {
                    margin: 25px 0;
                    text-align: right;
                    font-size: 13px;
                }
                .totals p {
                    margin: 8px 0;
                }
                .total-final {
                    font-size: 16px;
                    color: #34A873;
                    margin: 12px 0;
                }
                .notes-box {
                    margin: 25px 0;
                    padding: 15px;
                    background: #f9f9f9;
                    border-left: 3px solid #34A873;
                    font-size: 11px;
                }
                .notes-box p {
                    margin: 5px 0;
                }
                .footer {
                    margin-top: 50px;
                    margin-bottom: 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .signature {
                    text-align: left;
                    margin-top: 50px;
                }
                .signature-line {
                    border-bottom: 1px solid #000;
                    width: 200px;
                    margin-bottom: 4px;
                }
                .signature p {
                    margin: 0;
                    font-size: 11px;
                }
                .stamp {
                    text-align: right;
                    margin-top: 20px;
                }
                .stamp img {
                    max-width: 180px;
                    height: auto;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="${BASE_URL}/assets/img/logo-dettofatto.png" alt="DettoFatto" />
                <p>${indirizzoAzienda}</p>
                <p>Tel: ${telefonoAzienda} | Email: ${emailAzienda}</p>
                <p>P.IVA: ${partitaIva}</p>
            </div>
            
            <div class="title-section">
                <h2>${titoloPreventivo}</h2>
                <p>Preventivo N° ${numeroPreventivo}</p>
                <p>${luogoData}</p>
            </div>
            
            <div class="client-box">
                <h3>CLIENTE</h3>
                <p><strong>${nomeCliente}</strong></p>
                ${indirizzoCliente ? `<p>${indirizzoCliente}</p>` : ''}
                ${telefonoCliente ? `<p>Tel: ${telefonoCliente}</p>` : ''}
                ${emailCliente ? `<p>Email: ${emailCliente}</p>` : ''}
                ${cfPivaCliente ? `<p>CF/P.IVA: ${cfPivaCliente}</p>` : ''}
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Descrizione della lavorazione</th>
                        <th class="text-center">Unità di Misura</th>
                        <th class="text-center">Dimensioni</th>
                        <th class="text-center">Quantità</th>
                        <th class="text-right">Prezzo Unit.</th>
                        <th class="text-right">Importo Totale</th>
                    </tr>
                </thead>
                <tbody>
                    ${vociPreventivo.map(voce => `
                        <tr>
                            <td>${voce.descrizione}</td>
                            <td class="text-center">${voce.unitaMisura}</td>
                            <td class="text-center">${voce.dimensioni}</td>
                            <td class="text-center">${voce.quantita}</td>
                            <td class="text-right">${formatCurrency(voce.prezzoUnitario)}</td>
                            <td class="text-right">${formatCurrency(voce.importo)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <p><strong>Totale Imponibile: ${document.getElementById('totaleImponibile').textContent}</strong></p>
                ${document.getElementById('includiIva').checked ? `
                    <p><strong>IVA ${document.getElementById('labelPercentualeIva').textContent}%: ${document.getElementById('totaleIva').textContent}</strong></p>
                ` : ''}
                <p class="total-final"><strong>TOTALE FINALE: ${document.getElementById('totaleFinale').textContent}</strong></p>
            </div>
            
            <div class="notes-box">
                <p><strong>Modalità di Pagamento:</strong> ${modalitaPagamento}</p>
                <p><strong>Validità:</strong> ${validita} giorni</p>
                ${notePreventivo ? `<p style="margin-top: 10px;"><strong>Note:</strong></p><p>${notePreventivo}</p>` : ''}
            </div>
            
            <div class="footer">
                <div class="signature">
                    <div class="signature-line"></div>
                    <p>Firma per presa visione ed accettazione</p>
                </div>
                <div class="stamp">
                    <img src="${BASE_URL}/assets/img/timbro-dettofatto.png" alt="Timbro" />
                </div>
            </div>
        </body>
        </html>
    `;
    
    // Apri l'anteprima in una nuova finestra
    const anteprimaWindow = window.open('', '_blank');
    anteprimaWindow.document.write(htmlAnteprima);
    anteprimaWindow.document.close();
}

// Funzione corretta per generare PDF con logo e timbro
async function generaPDF() {
    const nomeCliente = document.getElementById('nomeCliente').value.trim();
    if (!nomeCliente) {
        alert('Inserisci il nome del cliente');
        return;
    }
    
    if (vociPreventivo.length === 0) {
        alert('Aggiungi almeno una voce al preventivo');
        return;
    }
    
    console.log('📄 Generazione PDF in corso...');
    
    try {
        // Crea contenitore per PDF
        const pdfContainer = document.createElement('div');
        pdfContainer.style.cssText = `
            position: absolute;
            left: -9999px;
            width: 794px;
            background: white;
            padding: 40px;
            font-family: Arial, sans-serif;
            color: #000;
        `;
        
        // Recupera dati
        const nomeDitta = document.getElementById('nomeDitta').value;
        const indirizzoAzienda = document.getElementById('indirizzoAzienda').value;
        const telefonoAzienda = document.getElementById('telefonoAzienda').value;
        const emailAzienda = document.getElementById('emailAzienda').value;
        const partitaIva = document.getElementById('partitaIva').value;
        const numeroPreventivo = document.getElementById('numeroPreventivo').value;
        const titoloPreventivo = document.getElementById('titoloPreventivo').value || 'PREVENTIVO';
        const indirizzoCliente = document.getElementById('indirizzoCliente').value;
        const telefonoCliente = document.getElementById('telefonoCliente').value;
        const emailCliente = document.getElementById('emailCliente').value;
        const cfPivaCliente = document.getElementById('cfPivaCliente').value;
        const notePreventivo = document.getElementById('notePreventivo').value;
        const validita = document.getElementById('validita').value;
        
        let modalitaPagamento = document.getElementById('modalitaPagamento').value;
        if (modalitaPagamento === 'custom') {
            modalitaPagamento = document.getElementById('pagamentoCustom').value;
        }
        
        // Formatta data
        const dataInput = document.getElementById('dataPreventivo').value;
        const dataObj = new Date(dataInput);
        const opzioni = { year: 'numeric', month: 'long', day: 'numeric' };
        const dataFormattata = dataObj.toLocaleDateString('it-IT', opzioni);
        const luogoData = `Milano, ${dataFormattata}`;
        
        // Costruisci HTML del PDF
        pdfContainer.innerHTML = `
            <div style="margin-bottom: 30px; text-align: center;">
                <img src="${BASE_URL}/assets/img/logo-dettofatto.png" style="max-width: 400px; height: auto; margin-bottom: 15px;" />
                <p style="margin: 5px 0; font-size: 12px;">${indirizzoAzienda}</p>
                <p style="margin: 5px 0; font-size: 12px;">Tel: ${telefonoAzienda} | Email: ${emailAzienda}</p>
                <p style="margin: 5px 0; font-size: 12px;">P.IVA: ${partitaIva}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <h2 style="font-size: 20px; color: #34A873; margin-bottom: 10px;">${titoloPreventivo}</h2>
                <p style="font-size: 12px;">Preventivo N° ${numeroPreventivo}</p>
                <p style="font-size: 12px;">${luogoData}</p>
            </div>
            
            <div style="margin: 25px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                <h3 style="font-size: 14px; margin-bottom: 10px; color: #34A873;">CLIENTE</h3>
                <p style="margin: 3px 0; font-size: 12px;"><strong>${nomeCliente}</strong></p>
                ${indirizzoCliente ? `<p style="margin: 3px 0; font-size: 11px;">${indirizzoCliente}</p>` : ''}
                ${telefonoCliente ? `<p style="margin: 3px 0; font-size: 11px;">Tel: ${telefonoCliente}</p>` : ''}
                ${emailCliente ? `<p style="margin: 3px 0; font-size: 11px;">Email: ${emailCliente}</p>` : ''}
                ${cfPivaCliente ? `<p style="margin: 3px 0; font-size: 11px;">CF/P.IVA: ${cfPivaCliente}</p>` : ''}
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px;">
                <thead>
                    <tr style="background: #34A873; color: white;">
                        <th style="padding: 8px; text-align: left; border: 1px solid #ddd; word-wrap: break-word; white-space: normal;">Descrizione</th>
                        <th style="padding: 8px; text-align: center; border: 1px solid #ddd; word-wrap: break-word; white-space: normal;">Unità</th>
                        <th style="padding: 8px; text-align: center; border: 1px solid #ddd; word-wrap: break-word; white-space: normal;">Dimensioni</th>
                        <th style="padding: 8px; text-align: center; border: 1px solid #ddd; word-wrap: break-word; white-space: normal;">Quantità</th>
                        <th style="padding: 8px; text-align: right; border: 1px solid #ddd; word-wrap: break-word; white-space: normal;">Prezzo Unit. (€)</th>
                        <th style="padding: 8px; text-align: right; border: 1px solid #ddd; word-wrap: break-word; white-space: normal;">Importo Totale (€)</th>
                    </tr>
                </thead>
                <tbody>
                    ${vociPreventivo.map(voce => `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; word-wrap: break-word; white-space: normal;">${voce.descrizione}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ddd; word-wrap: break-word; white-space: normal;">${voce.unitaMisura}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ddd; word-wrap: break-word; white-space: normal;">${voce.dimensioni}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ddd; word-wrap: break-word; white-space: normal;">${voce.quantita}</td>
                            <td style="padding: 8px; text-align: right; border: 1px solid #ddd; word-wrap: break-word; white-space: normal;">${formatCurrency(voce.prezzoUnitario)}</td>
                            <td style="padding: 8px; text-align: right; border: 1px solid #ddd; word-wrap: break-word; white-space: normal;">${formatCurrency(voce.importo)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="margin: 25px 0; text-align: right; font-size: 13px;">
                <p style="margin: 8px 0;"><strong>Totale Imponibile: ${document.getElementById('totaleImponibile').textContent}</strong></p>
                ${document.getElementById('includiIva').checked ? `
                    <p style="margin: 8px 0;"><strong>IVA ${document.getElementById('labelPercentualeIva').textContent}%: ${document.getElementById('totaleIva').textContent}</strong></p>
                ` : ''}
                <p style="margin: 12px 0; font-size: 16px; color: #34A873;"><strong>TOTALE FINALE: ${document.getElementById('totaleFinale').textContent}</strong></p>
            </div>
            
            <div style="margin: 25px 0; padding: 15px; background: #f9f9f9; border-left: 3px solid #34A873; font-size: 11px;">
                <p style="margin: 5px 0;"><strong>Modalità di Pagamento:</strong> ${modalitaPagamento}</p>
                <p style="margin: 5px 0;"><strong>Validità:</strong> ${validita} giorni</p>
                ${notePreventivo ? `<p style="margin: 10px 0 5px 0;"><strong>Note:</strong></p><p style="margin: 5px 0;">${notePreventivo}</p>` : ''}
            </div>
            
            <div style="margin-top: 50px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="text-align: left; margin-top: 50px;">
                    <div style="border-bottom: 1px solid #000; width: 200px; margin-bottom: 4px;"></div>
                    <p style="margin: 0; font-size: 11px;">Firma per presa visione ed accettazione</p>
                </div>
                <div style="text-align: right; margin-top: 20px;">
                    <img src="${BASE_URL}/assets/img/timbro-dettofatto.png" style="max-width: 180px; height: auto;" />
                </div>
            </div>
        `;
        
        document.body.appendChild(pdfContainer);
        
        // Genera PDF con html2canvas e jsPDF
        const canvas = await html2canvas(pdfContainer, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
const imgData = canvas.toDataURL('image/png');
const { jsPDF } = window.jspdf;

const pdf = new jsPDF('p', 'mm', 'a4');

const pageWidth = 210;
const pageHeight = 297;

const imgWidth = pageWidth;
const imgHeight = canvas.height * imgWidth / canvas.width;

let heightLeft = imgHeight;
let position = 0;

// Prima pagina
pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
heightLeft -= pageHeight;

// Pagine successive
while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
}

pdf.save(`Preventivo_${numeroPreventivo}_${nomeCliente.replace(/\s+/g, '_')}.pdf`);
        
        document.body.removeChild(pdfContainer);
        
        console.log('✅ PDF generato con successo!');
        alert('PDF generato con successo!');
        
    } catch (error) {
        console.error('Errore generazione PDF:', error);
        alert('Errore durante la generazione del PDF. Riprova.');
    }
}
