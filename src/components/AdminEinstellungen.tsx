import React, { useState } from 'react';
import { Plus, Trash2, Save, Building, Users, Key } from 'lucide-react';
import { AppSettings, Anlage, HierarchicalCategory } from '../types';
import { CategoryManager } from './CategoryManager';

interface AdminEinstellungenProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function AdminEinstellungen({ settings, onSave }: AdminEinstellungenProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [neueAnlage, setNeueAnlage] = useState({ name: '', beschreibung: '', standort: '', kategoriePfad: [] as string[] });
  const [neuerBenutzer, setNeuerBenutzer] = useState('');

  const getAllCategories = (categories: HierarchicalCategory[] = localSettings.kategorien): HierarchicalCategory[] => {
    let result: HierarchicalCategory[] = [];
    for (const cat of categories) {
      result.push(cat);
      result = result.concat(getAllCategories(cat.children));
    }
    return result;
  };

  const getCategoryPath = (categoryId: string): string[] => {
    const findPath = (categories: HierarchicalCategory[], path: string[] = []): string[] | null => {
      for (const cat of categories) {
        const currentPath = [...path, cat.name];
        if (cat.id === categoryId) {
          return currentPath;
        }
        const childPath = findPath(cat.children, currentPath);
        if (childPath) return childPath;
      }
      return null;
    };
    return findPath(localSettings.kategorien) || [];
  };

  const addAnlage = () => {
    if (!neueAnlage.name.trim()) return;
    
    const anlage: Anlage = {
      id: Date.now().toString(),
      name: neueAnlage.name.trim(),
      beschreibung: neueAnlage.beschreibung.trim(),
      standort: neueAnlage.standort.trim(),
      kategoriePfad: neueAnlage.kategoriePfad
    };

    setLocalSettings(prev => ({
      ...prev,
      anlagen: [...prev.anlagen, anlage]
    }));

    setNeueAnlage({ name: '', beschreibung: '', standort: '', kategoriePfad: [] });
  };

  const removeAnlage = (id: string) => {
    setLocalSettings(prev => ({
      ...prev,
      anlagen: prev.anlagen.filter(a => a.id !== id)
    }));
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

  const handleCategoriesUpdate = (kategorien: HierarchicalCategory[]) => {
    setLocalSettings(prev => ({ ...prev, kategorien }));
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

      {/* Anlagen verwalten */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building className="w-5 h-5" />
          Anlagen verwalten
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Anlagenname"
              value={neueAnlage.name}
              onChange={(e) => setNeueAnlage(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Standort"
              value={neueAnlage.standort}
              onChange={(e) => setNeueAnlage(prev => ({ ...prev, standort: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={neueAnlage.kategoriePfad.length > 0 ? getAllCategories().find(cat => getCategoryPath(cat.id).join(' → ') === neueAnlage.kategoriePfad.join(' → '))?.id || '' : ''}
              onChange={(e) => {
                const selectedPath = e.target.value ? getCategoryPath(e.target.value) : [];
                setNeueAnlage(prev => ({ ...prev, kategoriePfad: selectedPath }));
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Kategorie wählen</option>
              {getAllCategories().map(kategorie => (
                <option key={kategorie.id} value={kategorie.id}>
                  {'→'.repeat(kategorie.level)} {kategorie.name}
                </option>
              ))}
            </select>
            <button
              onClick={addAnlage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Hinzufügen
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Beschreibung"
            value={neueAnlage.beschreibung}
            onChange={(e) => setNeueAnlage(prev => ({ ...prev, beschreibung: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <div className="space-y-2">
            {localSettings.anlagen.map((anlage) => (
              <div key={anlage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{anlage.name}</div>
                  <div className="text-sm text-gray-600">
                    {anlage.kategoriePfad.length > 0 && (
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2">
                        {anlage.kategoriePfad.join(' → ')}
                      </span>
                    )}
                    {anlage.standort && `${anlage.standort} • `}
                    {anlage.beschreibung}
                  </div>
                </div>
                <button
                  onClick={() => removeAnlage(anlage.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

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