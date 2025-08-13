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
        const registerResult = await supabaseService.registerUser(username);
        
        if (registerResult.fallback) {
          setError('Offline-Modus: Daten werden lokal gespeichert');
        }
        
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
        setError('Offline-Modus: Verwende lokale Speicherung');
        
        // Fallback auf lokale Speicherung
        const localData = localStorage.getItem(`userData_${username}`);
        if (localData) {
          try {
            setUserData(JSON.parse(localData));
          } catch (parseError) {
            console.error('Fehler beim Parsen der lokalen Daten:', parseError);
            setUserData(initialValue);
          }
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
      
      // Speichere in Supabase (mit Fallback)
      if (username) {
        const result = await supabaseService.saveUserData(username, updatedData);
        
        if (result.fallback) {
          setError('Offline-Modus: Daten wurden lokal gespeichert');
        } else {
          // Erfolgreich in Supabase gespeichert
          if (error && error.includes('Offline-Modus')) {
            setError(null);
          }
        }
      }
    } catch (err) {
      console.error('Fehler beim Speichern der Daten:', err);
      setError('Offline-Modus: Daten wurden lokal gespeichert');
      
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
    clearError: () => setError(null),
    isOffline: !supabaseService.isAvailable()
  };
}