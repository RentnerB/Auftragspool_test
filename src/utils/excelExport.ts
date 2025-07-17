import * as XLSX from 'xlsx';
import { Auftrag } from '../types';

export const exportToExcel = (auftraege: Auftrag[], filename: string = 'auftraege') => {
  // Daten für Excel vorbereiten
  const excelData = auftraege.map(auftrag => ({
    'Auftragsnummer': auftrag.auftragsnummer,
    'Erteilt am': new Date(auftrag.erteiltAm).toLocaleDateString('de-DE'),
    'Erledigen bis': new Date(auftrag.erledigenBis).toLocaleDateString('de-DE'),
    'Anlage': auftrag.anlage,
    'Meldetext': auftrag.meldetext,
    'Verantwortlicher': auftrag.verantwortlicher,
    'Ausführender': auftrag.ausfuehrender,
    'Status': auftrag.status.replace('_', ' ').toUpperCase(),
    'Priorität': auftrag.prioritaet.charAt(0).toUpperCase() + auftrag.prioritaet.slice(1),
    'Geschätzte Dauer (Std:Min)': auftrag.geschaetzteDauer > 0 ? formatZeitForExcel(auftrag.geschaetzteDauer) : '-',
    'Gesamtzeit (Std:Min)': formatZeitForExcel(auftrag.gesamtzeit),
    'Anzahl Ausführungen': auftrag.ausfuehrungen.length,
    'Letzte Bearbeitung': auftrag.ausfuehrungen.length > 0 
      ? new Date(auftrag.ausfuehrungen[auftrag.ausfuehrungen.length - 1].datum).toLocaleDateString('de-DE')
      : '-'
  }));

  // Arbeitsblatt erstellen
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Spaltenbreiten anpassen
  const columnWidths = [
    { wch: 15 }, // Auftragsnummer
    { wch: 12 }, // Erteilt am
    { wch: 12 }, // Erledigen bis
    { wch: 25 }, // Anlage
    { wch: 40 }, // Meldetext
    { wch: 18 }, // Verantwortlicher
    { wch: 18 }, // Ausführender
    { wch: 15 }, // Status
    { wch: 10 }, // Priorität
    { wch: 18 }, // Geschätzte Dauer (Std:Min)
    { wch: 15 }, // Gesamtzeit (Std:Min)
    { wch: 12 }, // Anzahl Ausführungen
    { wch: 15 }  // Letzte Bearbeitung
  ];
  worksheet['!cols'] = columnWidths;

  // Arbeitsmappe erstellen
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Aufträge');

  // Datei herunterladen
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);
};

const formatZeitForExcel = (minuten: number): string => {
  const stunden = Math.floor(minuten / 60);
  const mins = minuten % 60;
  return `${stunden.toString().replace('.', ',')}:${mins.toString().padStart(2, '0')}`;
};