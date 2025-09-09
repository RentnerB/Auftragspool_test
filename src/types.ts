export interface Auftrag {
  id: string;
  auftragsnummer: string;
  erteiltAm: string;
  erledigenBis: string;
  kategorie: string;
  unterkategorie?: string;
  meldetext: string;
  verantwortlicher: string;
  ausfuehrender: string;
  status: 'offen' | 'in_bearbeitung' | 'abgeschlossen' | 'ueberfaellig';
  prioritaet: 'niedrig' | 'normal' | 'hoch' | 'kritisch';
  abteilung: string;
  ausfuehrungen: Ausfuehrung[];
  gesamtzeit: number; // in Stunden
  geschaetzteDauer: number; // in Stunden
  dateien: AuftragDatei[];
}

export interface Ausfuehrung {
  id: string;
  datum: string;
  uhrzeit: string;
  beschreibung: string;
  zeitaufwand: number; // in Stunden
  bearbeiter: string;
}

export interface AuftragDatei {
  id: string;
  name: string;
  typ: 'bild' | 'dokument';
  url: string;
  groesse: number;
  hochgeladenAm: string;
  hochgeladenVon: string;
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
  kategorien: HierarchicalCategory[];
  benutzer: string[];
  abteilungen: string[];
  naechsteAuftragsnummer: number;
  adminPasswort: string;
}

export interface UserData {
  auftraege: Auftrag[];
  settings: AppSettings;
}

export type SortField = 'auftragsnummer' | 'erteiltAm' | 'erledigenBis' | 'status' | 'prioritaet' | 'kategorie' | 'abteilung';
export type SortDirection = 'asc' | 'desc';