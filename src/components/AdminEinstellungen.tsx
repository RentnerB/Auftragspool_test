import React, { useState } from 'react';
import { Plus, Trash2, Save, Users, Key, Building2 } from 'lucide-react';
import { AppSettings, HierarchicalCategory } from '../types';
import { CategoryManager } from './CategoryManager';

interface AdminEinstellungenProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function AdminEinstellungen({ settings, onSave }: AdminEinstellungenProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [neuerBenutzer, setNeuerBenutzer] = useState('');
  const [neueAbteilung, setNeueAbteilung] = useState('');

  const handleCategoriesUpdate = (kategorien: HierarchicalCategory[]) => {
    setLocalSettings(prev => ({ ...prev, kategorien }));
  };

  const addBenutzer = () => {
    if (!neuerBenutzer.trim() || localSettings.benutzer.includes(neuerBenutzer.trim())) return;
    
    setLocalSettings(prev => ({
      ...prev,
      benutzer: [...prev.benutzer, neuerBenutzer.trim()]
    }));

    setNeuerBenutzer('');
  };

  const removeBenutzer = (benutzer: string) => {
    setLocalSettings(prev => ({
      ...prev,
      benutzer: prev.benutzer.filter(b => b !== benutzer)
    }));
  };

  const addAbteilung = () => {
    if (!neueAbteilung.trim() || localSettings.abteilungen.includes(neueAbteilung.trim())) return;
    
    setLocalSettings(prev => ({
      ...prev,
      abteilungen: [...prev.abteilungen, neueAbteilung.trim()]
    }));

    setNeueAbteilung('');
  };

  const removeAbteilung = (abteilung: string) => {
    setLocalSettings(prev => ({
      ...prev,
      abteilungen: prev.abteilungen.filter(a => a !== abteilung)
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <div className="space-y-6">
      {/* Kategorien verwalten */}
      <CategoryManager 
        kategorien={localSettings.kategorien}
        onUpdate={handleCategoriesUpdate}
      />

      {/* Benutzer verwalten */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Benutzer verwalten
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Benutzername"
              value={neuerBenutzer}
              onChange={(e) => setNeuerBenutzer(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addBenutzer()}
            />
            <button
              onClick={addBenutzer}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Hinzufügen
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {localSettings.benutzer.map((benutzer) => (
              <div key={benutzer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{benutzer}</span>
                <button
                  onClick={() => removeBenutzer(benutzer)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Abteilungen verwalten */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Abteilungen verwalten
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Abteilungsname"
              value={neueAbteilung}
              onChange={(e) => setNeueAbteilung(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addAbteilung()}
            />
            <button
              onClick={addAbteilung}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Hinzufügen
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {localSettings.abteilungen.map((abteilung) => (
              <div key={abteilung} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{abteilung}</span>
                <button
                  onClick={() => removeAbteilung(abteilung)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System-Einstellungen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          System-Einstellungen
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nächste Auftragsnummer
            </label>
            <input
              type="number"
              value={localSettings.naechsteAuftragsnummer}
              onChange={(e) => setLocalSettings(prev => ({ 
                ...prev, 
                naechsteAuftragsnummer: Math.max(1, parseInt(e.target.value) || 1)
              }))}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
            <p className="text-sm text-gray-600 mt-1">
              Nächster Auftrag wird: A-{new Date().getFullYear()}-{String(localSettings.naechsteAuftragsnummer).padStart(3, '0')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin-Passwort
            </label>
            <input
              type="password"
              value={localSettings.adminPasswort}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, adminPasswort: e.target.value }))}
              className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Neues Passwort eingeben"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Einstellungen speichern
        </button>
      </div>
    </div>
  );
}