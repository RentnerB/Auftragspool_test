import { Auftrag, AppSettings, UserData } from '../types';

const SUPABASE_URL = "https://qivzrvifdlvrjxtkbxef.supabase.co/functions/v1";

export class SupabaseService {
  private static instance: SupabaseService;
  
  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const response = await fetch(`${SUPABASE_URL}/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Supabase request failed:`, error);
      throw error;
    }
  }

  // Benutzer registrieren/anmelden
  async registerUser(username: string, password: string = 'default') {
    return this.makeRequest('rapid-service', 'POST', { username, password });
  }

  async loginUser(username: string, password: string = 'default') {
    return this.makeRequest('Login', 'POST', { username, password });
  }

  // Auftragsdaten speichern
  async saveUserData(username: string, userData: UserData) {
    try {
      // Verwende einen generischen Endpunkt zum Speichern der Daten
      const response = await this.makeRequest('save-data', 'POST', {
        username,
        data: userData
      });
      return response;
    } catch (error) {
      console.error('Fehler beim Speichern der Benutzerdaten:', error);
      // Fallback: Lokale Speicherung
      localStorage.setItem(`userData_${username}`, JSON.stringify(userData));
      return { success: true, fallback: true };
    }
  }

  // Auftragsdaten laden
  async loadUserData(username: string): Promise<UserData | null> {
    try {
      const response = await this.makeRequest('load-data', 'POST', { username });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error);
      // Fallback: Lokale Speicherung
      const localData = localStorage.getItem(`userData_${username}`);
      return localData ? JSON.parse(localData) : null;
    }
  }

  // Einzelnen Auftrag speichern
  async saveAuftrag(username: string, auftrag: Auftrag) {
    try {
      return await this.makeRequest('save-auftrag', 'POST', {
        username,
        auftrag
      });
    } catch (error) {
      console.error('Fehler beim Speichern des Auftrags:', error);
      throw error;
    }
  }

  // Auftrag aktualisieren
  async updateAuftrag(username: string, auftrag: Auftrag) {
    try {
      return await this.makeRequest('update-auftrag', 'POST', {
        username,
        auftrag
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Auftrags:', error);
      throw error;
    }
  }

  // Alle Aufträge laden
  async loadAuftraege(username: string): Promise<Auftrag[]> {
    try {
      const response = await this.makeRequest('load-auftraege', 'POST', { username });
      return response.auftraege || [];
    } catch (error) {
      console.error('Fehler beim Laden der Aufträge:', error);
      return [];
    }
  }
}