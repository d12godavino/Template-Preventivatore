# EdilPro S.r.l. - Preventivatore Edile (DEMO COMMERCIALE)

## Overview

Questa è una **DEMO COMMERCIALE** di un preventivatore edile professionale. L'applicazione mostra tutte le funzionalità usando dati fittizi e realistici, ed è destinata esclusivamente a scopi dimostrativi.

**NOTA IMPORTANTE**: Questo preventivo è solo un esempio dimostrativo e NON deve essere utilizzato come preventivo reale.

## Dati Demo Precompilati

### Dati Azienda (Fittizi)
- **Ragione Sociale**: EdilPro S.r.l.
- **Indirizzo**: Via Roma 123, 40100 Bologna
- **Telefono**: +39 051 1234567
- **Email**: info@edilpro.it
- **Partita IVA**: 01234567890

### Dati Cliente (Fittizi)
- **Nome**: Mario Rossi
- **Indirizzo**: Via Garibaldi 45, 40121 Bologna
- **Telefono**: +39 333 4567890
- **Email**: mario.rossi@email.it
- **Codice Fiscale**: RSSMRA80A01A944X

### Voci di Computo Demo (5 voci)
1. Demolizione pavimento ceramico (20 mq @ €12,00 = €240,00)
2. Realizzazione muratura in mattoni forati (9,80 mq @ €45,00 = €441,00)
3. Fornitura e posa pavimentazione gres porcellanato (20 mq @ €55,00 = €1.100,00)
4. Tinteggiatura pareti interne (33,60 mq @ €8,50 = €285,60)
5. Fornitura e posa porte interne (2 cad @ €320,00 = €640,00)

### Totali Demo
- **Totale Imponibile**: €2.706,60
- **IVA 22%**: €595,45
- **Totale Finale**: €3.302,05

## Credenziali di Accesso Demo
- **Username**: mattoncino
- **Password**: 1234

## System Architecture

### Frontend Architecture
- **Pure vanilla stack**: HTML, CSS, and JavaScript with no frontend frameworks
- **Single-page application pattern**: All functionality contained in `index.html` with `app.js` handling logic
- **Authentication**: Simple login overlay with hardcoded credentials (client-side only)
- **Styling**: Custom CSS with CSS custom properties (variables) for theming

### Data Management
- **Database**: Construction pricing data stored in CSV file (`attached_assets/database_edile_completo_*.csv`) loaded via fetch
- **Fallback database**: `database_temp.js` contains a JavaScript object version for offline/fallback use
- **State persistence**: Uses `localStorage` for persisting quote numbers across browser sessions
- **Demo data**: Automatically loaded on startup via `caricaDatiDemo()` function

### PDF Generation
- **Libraries used**: 
  - `html2canvas` (v1.4.1) for capturing HTML elements as images
  - `jspdf` (v2.5.1) for PDF document generation

## External Dependencies

### CDN Libraries
- **html2canvas** (v1.4.1): `https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js`
- **jspdf** (v2.5.1): `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`

### Data Files
- CSV database at `attached_assets/database_edile_completo_*.csv` containing construction work items

## Recent Changes

- **13 Gennaio 2026**: Trasformazione in DEMO COMMERCIALE
  - Dati aziendali fittizi (EdilPro S.r.l.)
  - Dati cliente di esempio (Mario Rossi)
  - 5 voci di computo precompilate con lavorazioni edilizie realistiche
  - IVA 22% attivata di default
  - Titolo preventivo personalizzato
