import { useState, useEffect } from 'react';
import { UserData } from '../types';
import { SupabaseService } from '../services/supabaseService';

export function useSupabaseStorage(username: string, initialValue: UserData) {
  const [userData, setUserData] = useState<UserData>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabaseService = SupabaseService.getInstance();

  // Daten beim ersten Laden abrufen
  useEffect(() => {
    if (!username) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Versuche Benutzer zu registrieren/anmelden
        await supabaseService.registerUser(username);
        
        // Lade Benutzerdaten
        const loadedData = await supabaseService.loadUserData(username);
        
        if (loadedData) {
          setUserData(loadedData);
        } else {
          // Wenn keine Daten vorhanden, verwende Initialwerte und speichere sie
          setUserData(initialValue);
          await supabaseService.saveUserData(username, initialValue);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Daten:', err);
        setError('Fehler beim Laden der Daten. Verwende lokale Speicherung.');
        // Fallback auf lokale Speicherung
        const localData = localStorage.getItem(`userData_${username}`);
        if (localData) {
          setUserData(JSON.parse(localData));
        } else {
          setUserData(initialValue);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [username]);

  // Funktion zum Aktualisieren der Daten
  const updateUserData = async (newData: UserData | ((prev: UserData) => UserData)) => {
    try {
      const updatedData = typeof newData === 'function' ? newData(userData) : newData;
      
      // Optimistische Aktualisierung
      setUserData(updatedData);
      
      // Speichere in Supabase
      if (username) {
        await supabaseService.saveUserData(username, updatedData);
      }
      
      setError(null);
    } catch (err) {
      console.error('Fehler beim Speichern der Daten:', err);
      setError('Fehler beim Speichern. Daten wurden lokal gespeichert.');
      
      // Fallback: Lokale Speicherung
      if (username) {
        const updatedData = typeof newData === 'function' ? newData(userData) : newData;
        localStorage.setItem(`userData_${username}`, JSON.stringify(updatedData));
      }
    }
  };

  return {
    userData,
    setUserData: updateUserData,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}