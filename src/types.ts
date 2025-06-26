export interface Auftrag {
  id: string;
  auftragsnummer: string;
  erteiltAm: string;
  erledigenBis: string;
  anlage: string;
  meldetext: string;
  verantwortlicher: string;
  ausfuehrender: string;
  status: 'offen' | 'in_bearbeitung' | 'abgeschlossen' | 'ueberfaellig';
  prioritaet: 'niedrig' | 'normal' | 'hoch' | 'kritisch';
  ausfuehrungen: Ausfuehrung[];
  gesamtzeit: number; // in Minuten
  geschaetzteDauer: number; // in Minuten - voraussichtliche Auftragsdauer
}

export interface Ausfuehrung {
  id: string;
  datum: string;
  uhrzeit: string;
  beschreibung: string;
  zeitaufwand: number; // in Minuten
  bearbeiter: string;
}

export interface Anlage {
  id: string;
  name: string;
  beschreibung: string;
  standort: string;
  kategoriePfad: string[]; // Hierarchischer Pfad: ['Druckluft', 'Kompressor Station 1', 'Motor']
}

export interface HierarchicalCategory {
  id: string;
  name: string;
  beschreibung: string;
  parentId?: string;
  children: HierarchicalCategory[];
  level: number;
}

export interface AppSettings {
  anlagen: Anlage[];
  kategorien: HierarchicalCategory[];
  benutzer: string[];
  naechsteAuftragsnummer: number;
  adminPasswort: string;
}

export interface UserData {
  auftraege: Auftrag[];
  settings: AppSettings;
}

export type SortField = 'auftragsnummer' | 'erteiltAm' | 'erledigenBis' | 'status' | 'prioritaet' | 'anlage';
export type SortDirection = 'asc' | 'desc';