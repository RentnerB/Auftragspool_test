import { Auftrag } from '../types';

export const generatePDF = (auftrag: Auftrag) => {
  // Create a new window for the PDF content
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const formatZeit = (stunden: number) => {
    return `${stunden.toString().replace('.', ',')}h`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'offen': return 'Offen';
      case 'in_bearbeitung': return 'In Bearbeitung';
      case 'abgeschlossen': return 'Abgeschlossen';
      case 'ueberfaellig': return 'Überfällig';
      default: return status;
    }
  };

  const getPriorityText = (prioritaet: string) => {
    return prioritaet.charAt(0).toUpperCase() + prioritaet.slice(1);
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Auftrag ${auftrag.auftragsnummer}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.6;
        }
        .header {
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 28px;
        }
        .header .subtitle {
          color: #666;
          margin: 5px 0 0 0;
          font-size: 14px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .info-section {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        .info-section h3 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 16px;
        }
        .info-row {
          display: flex;
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: bold;
          min-width: 120px;
          color: #374151;
        }
        .info-value {
          color: #111827;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-offen { background: #dbeafe; color: #1e40af; }
        .status-in_bearbeitung { background: #fef3c7; color: #d97706; }
        .status-abgeschlossen { background: #d1fae5; color: #065f46; }
        .status-ueberfaellig { background: #fee2e2; color: #dc2626; }
        .priority-niedrig { background: #f3f4f6; color: #374151; }
        .priority-normal { background: #dbeafe; color: #1e40af; }
        .priority-hoch { background: #fed7aa; color: #ea580c; }
        .priority-kritisch { background: #fee2e2; color: #dc2626; }
        .abteilung-wartung { background: #d1fae5; color: #065f46; }
        .abteilung-reparatur { background: #fed7aa; color: #ea580c; }
        .abteilung-inspektion { background: #dbeafe; color: #1e40af; }
        .abteilung-notfall { background: #fee2e2; color: #dc2626; }
        .abteilung-modernisierung { background: #e9d5ff; color: #7c3aed; }
        .meldetext {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #10b981;
        }
        .meldetext h3 {
          margin: 0 0 10px 0;
          color: #059669;
        }
        .ausfuehrungen {
          margin-bottom: 30px;
        }
        .ausfuehrungen h3 {
          color: #1e40af;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .ausfuehrung {
          background: #f9fafb;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 8px;
          border-left: 4px solid #6b7280;
        }
        .ausfuehrung-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-size: 14px;
          color: #6b7280;
        }
        .ausfuehrung-meta {
          display: flex;
          gap: 20px;
        }
        .zeit-badge {
          background: #2563eb;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
        .dateien {
          margin-bottom: 30px;
        }
        .dateien h3 {
          color: #1e40af;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .datei-liste {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        .datei-item {
          background: #f9fafb;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .datei-name {
          font-weight: bold;
          margin-bottom: 5px;
          word-break: break-all;
        }
        .datei-info {
          font-size: 12px;
          color: #6b7280;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        @media print {
          body { margin: 0; }
          .info-grid { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Auftrag ${auftrag.auftragsnummer}</h1>
        <p class="subtitle">Erstellt am ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}</p>
      </div>

      <div class="info-grid">
        <div class="info-section">
          <h3>Auftragsdaten</h3>
          <div class="info-row">
            <span class="info-label">Erteilt am:</span>
            <span class="info-value">${new Date(auftrag.erteiltAm).toLocaleDateString('de-DE')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Erledigen bis:</span>
            <span class="info-value">${new Date(auftrag.erledigenBis).toLocaleDateString('de-DE')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Kategorie:</span>
            <span class="info-value">${auftrag.kategorie}${auftrag.unterkategorie ? ` → ${auftrag.unterkategorie}` : ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="status-badge status-${auftrag.status}">${getStatusText(auftrag.status)}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Zuständigkeiten & Details</h3>
          <div class="info-row">
            <span class="info-label">Verantwortlicher:</span>
            <span class="info-value">${auftrag.verantwortlicher}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ausführender:</span>
            <span class="info-value">${auftrag.ausfuehrender}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Priorität:</span>
            <span class="status-badge priority-${auftrag.prioritaet}">${getPriorityText(auftrag.prioritaet)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Abteilung:</span>
            <span class="status-badge abteilung-${auftrag.abteilung.toLowerCase()}">${auftrag.abteilung}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Geschätzte Dauer:</span>
            <span class="info-value">${auftrag.geschaetzteDauer > 0 ? `${auftrag.geschaetzteDauer.toString().replace('.', ',')}h` : 'Nicht angegeben'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Gesamtzeit:</span>
            <span class="info-value">${auftrag.gesamtzeit > 0 ? `${auftrag.gesamtzeit.toString().replace('.', ',')}h` : 'Noch keine Zeit erfasst'}</span>
          </div>
        </div>
      </div>

      <div class="meldetext">
        <h3>Meldetext</h3>
        <p>${auftrag.meldetext}</p>
      </div>

      ${auftrag.dateien.length > 0 ? `
        <div class="dateien">
          <h3>Dateien (${auftrag.dateien.length})</h3>
          <div class="datei-liste">
            ${auftrag.dateien.map(datei => `
              <div class="datei-item">
                <div class="datei-name">${datei.name}</div>
                <div class="datei-info">
                  Typ: ${datei.typ === 'bild' ? 'Bild' : 'Dokument'}<br>
                  Größe: ${(datei.groesse / 1024).toFixed(1)} KB<br>
                  Hochgeladen von: ${datei.hochgeladenVon}<br>
                  Am: ${new Date(datei.hochgeladenAm).toLocaleDateString('de-DE')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${auftrag.ausfuehrungen.length > 0 ? `
        <div class="ausfuehrungen">
          <h3>Ausführungen (${auftrag.ausfuehrungen.length})</h3>
          ${auftrag.ausfuehrungen.map(ausfuehrung => `
            <div class="ausfuehrung">
              <div class="ausfuehrung-header">
                <div class="ausfuehrung-meta">
                  <span>📅 ${new Date(ausfuehrung.datum).toLocaleDateString('de-DE')}</span>
                  <span>🕐 ${ausfuehrung.uhrzeit}</span>
                  <span>👤 ${ausfuehrung.bearbeiter}</span>
                </div>
                <span class="zeit-badge">${ausfuehrung.zeitaufwand.toString().replace('.', ',')}h</span>
              </div>
              <p>${ausfuehrung.beschreibung}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="footer">
        <p>Generiert von AuftragsPool - Professionelle Auftragsverwaltung</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
};