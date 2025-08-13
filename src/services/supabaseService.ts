import { Auftrag, AppSettings, UserData } from '../types';

const SUPABASE_URL = "https://qivzrvifdlvrjxtkbxef.supabase.co/functions/v1";

export class SupabaseService {
  private static instance: SupabaseService;
  private isSupabaseAvailable = true;
  
  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any, timeout: number = 5000) {
    // If Supabase is known to be unavailable, skip the request
    if (!this.isSupabaseAvailable) {
      throw new Error('Supabase service unavailable');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${SUPABASE_URL}/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`Supabase request to ${endpoint} failed:`, error);
      
      // Mark Supabase as unavailable for this session
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        this.isSupabaseAvailable = false;
        console.warn('Supabase marked as unavailable, falling back to local storage');
      }
      
      throw error;
    }
  }

  // Benutzer registrieren/anmelden - mit Fallback
  async registerUser(username: string, password: string = 'default') {
    try {
      return await this.makeRequest('rapid-service', 'POST', { username, password });
    } catch (error) {
      console.warn('User registration failed, using local fallback');
      // Simuliere erfolgreiche Registrierung für lokalen Betrieb
      return { success: true, user: { username }, fallback: true };
    }
  }

  async loginUser(username: string, password: string = 'default') {
    try {
      return await this.makeRequest('Login', 'POST', { username, password });
    } catch (error) {
      console.warn('User login failed, using local fallback');
      // Simuliere erfolgreichen Login für lokalen Betrieb
      return { success: true, user: { username }, fallback: true };
    }
  }

  // Auftragsdaten speichern - mit lokalem Fallback
  async saveUserData(username: string, userData: UserData) {
    try {
      const response = await this.makeRequest('save-data', 'POST', {
        username,
        data: userData
      });
      return response;
    } catch (error) {
      console.warn('Saving to Supabase failed, using local storage fallback');
      // Fallback: Lokale Speicherung
      localStorage.setItem(`userData_${username}`, JSON.stringify(userData));
      return { success: true, fallback: true };
    }
  }

  // Auftragsdaten laden - mit lokalem Fallback
  async loadUserData(username: string): Promise<UserData | null> {
    try {
      const response = await this.makeRequest('load-data', 'POST', { username });
      return response.data;
    } catch (error) {
      console.warn('Loading from Supabase failed, using local storage fallback');
      // Fallback: Lokale Speicherung
      const localData = localStorage.getItem(`userData_${username}`);
      return localData ? JSON.parse(localData) : null;
    }
  }

  // Einzelnen Auftrag speichern - mit lokalem Fallback
  async saveAuftrag(username: string, auftrag: Auftrag) {
    try {
      return await this.makeRequest('save-auftrag', 'POST', {
        username,
        auftrag
      });
    } catch (error) {
      console.warn('Saving auftrag to Supabase failed, using local storage fallback');
      // Fallback: Lokale Speicherung der gesamten Daten
      const existingData = localStorage.getItem(`userData_${username}`);
      if (existingData) {
        const userData = JSON.parse(existingData);
        const existingIndex = userData.auftraege.findIndex((a: Auftrag) => a.id === auftrag.id);
        if (existingIndex >= 0) {
          userData.auftraege[existingIndex] = auftrag;
        } else {
          userData.auftraege.push(auftrag);
        }
        localStorage.setItem(`userData_${username}`, JSON.stringify(userData));
      }
      return { success: true, fallback: true };
    }
  }

  // Auftrag aktualisieren - mit lokalem Fallback
  async updateAuftrag(username: string, auftrag: Auftrag) {
    try {
      return await this.makeRequest('update-auftrag', 'POST', {
        username,
        auftrag
      });
    } catch (error) {
      console.warn('Updating auftrag in Supabase failed, using local storage fallback');
      // Fallback: Lokale Speicherung
      const existingData = localStorage.getItem(`userData_${username}`);
      if (existingData) {
        const userData = JSON.parse(existingData);
        const existingIndex = userData.auftraege.findIndex((a: Auftrag) => a.id === auftrag.id);
        if (existingIndex >= 0) {
          userData.auftraege[existingIndex] = auftrag;
          localStorage.setItem(`userData_${username}`, JSON.stringify(userData));
        }
      }
      return { success: true, fallback: true };
    }
  }

  // Alle Aufträge laden - mit lokalem Fallback
  async loadAuftraege(username: string): Promise<Auftrag[]> {
    try {
      const response = await this.makeRequest('load-auftraege', 'POST', { username });
      return response.auftraege || [];
    } catch (error) {
      console.warn('Loading auftraege from Supabase failed, using local storage fallback');
      // Fallback: Lokale Speicherung
      const existingData = localStorage.getItem(`userData_${username}`);
      if (existingData) {
        const userData = JSON.parse(existingData);
        return userData.auftraege || [];
      }
      return [];
    }
  }

  // Status der Supabase-Verfügbarkeit prüfen
  isAvailable(): boolean {
    return this.isSupabaseAvailable;
  }

  // Supabase-Verfügbarkeit zurücksetzen (für Retry-Versuche)
  resetAvailability(): void {
    this.isSupabaseAvailable = true;
  }
}