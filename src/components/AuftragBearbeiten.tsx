import React, { useState } from 'react';
import { X, Plus, Clock, Save, Calendar, User, AlertTriangle, Upload, FileText, Image, Trash2 } from 'lucide-react';
import { Auftrag, Ausfuehrung, AuftragDatei, AppSettings } from '../types';

interface AuftragBearbeitenProps {
  auftrag: Auftrag;
  onSave: (auftrag: Auftrag) => void;
  onClose: () => void;
  currentUser: string;
  isAdmin: boolean;
  settings: AppSettings;
}

export function AuftragBearbeiten({ auftrag, onSave, onClose, currentUser, isAdmin, settings }: AuftragBearbeitenProps) {
  const [beschreibung, setBeschreibung] = useState('');
  const [zeitaufwand, setZeitaufwand] = useState(0);
  const [updatedAuftrag, setUpdatedAuftrag] = useState<Auftrag>(auftrag);

  const addZeit = (stunden: number) => {
    setZeitaufwand(prev => prev + stunden);
  };

  const addAusfuehrung = () => {
    if (!beschreibung.trim() || zeitaufwand <= 0) return;

    const now = new Date();
    const neueAusfuehrung: Ausfuehrung = {
      id: Date.now().toString(),
      datum: now.toISOString().split('T')[0],
      uhrzeit: now.toTimeString().split(' ')[0].substring(0, 5),
      beschreibung: beschreibung.trim(),
      zeitaufwand,
      bearbeiter: currentUser
    };

    const neuerAuftrag = {
      ...updatedAuftrag,
      ausfuehrungen: [...updatedAuftrag.ausfuehrungen, neueAusfuehrung],
      gesamtzeit: updatedAuftrag.gesamtzeit + zeitaufwand,
      status: updatedAuftrag.status === 'offen' ? 'in_bearbeitung' as const : updatedAuftrag.status
    };

    setUpdatedAuftrag(neuerAuftrag);
    setBeschreibung('');
    setZeitaufwand(0);
  };

  const handleStatusChange = (newStatus: Auftrag['status']) => {
    setUpdatedAuftrag(prev => ({ ...prev, status: newStatus }));
  };

  const handlePriorityChange = (newPriority: Auftrag['prioritaet']) => {
    setUpdatedAuftrag(prev => ({ ...prev, prioritaet: newPriority }));
  };

  const handleAbteilungChange = (newAbteilung: string) => {
    setUpdatedAuftrag(prev => ({ ...prev, abteilung: newAbteilung }));
  };

  const handleDateChange = (field: 'erledigenBis', value: string) => {
    setUpdatedAuftrag(prev => ({ ...prev, [field]: value }));
  };

  const handleGeschaetzteDauerChange = (value: number) => {
    setUpdatedAuftrag(prev => ({ ...prev, geschaetzteDauer: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: AuftragDatei = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          typ: file.type.startsWith('image/') ? 'bild' : 'dokument',
          url: e.target?.result as string,
          groesse: file.size,
          hochgeladenAm: new Date().toISOString(),
          hochgeladenVon: currentUser
        };

        setUpdatedAuftrag(prev => ({
          ...prev,
          dateien: [...prev.dateien, newFile]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (fileId: string) => {
    setUpdatedAuftrag(prev => ({
      ...prev,
      dateien: prev.dateien.filter(f => f.id !== fileId)
    }));
  };

  const handleSave = () => {
    onSave(updatedAuftrag);
    onClose();
  };

  const formatZeit = (minuten: number) => {
    return `${minuten.toString().replace('.', ',')}h`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPriorityColor = (prioritaet: string) => {
    switch (prioritaet) {
      case 'niedrig': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'normal': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'hoch': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'kritisch': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getAbteilungColor = (abteilung: string) => {
    const colors = {
      'Wartung': 'bg-green-100 text-green-700 border-green-200',
      'Reparatur': 'bg-orange-100 text-orange-700 border-orange-200',
      'Inspektion': 'bg-blue-100 text-blue-700 border-blue-200',
      'Notfall': 'bg-red-100 text-red-700 border-red-200',
      'Modernisierung': 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[abteilung as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Auftrag bearbeiten</h3>
            <p className="text-sm text-gray-600 mt-1">{updatedAuftrag.auftragsnummer}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Auftragsinformationen */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Auftragsinformationen</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Kategorie:</span>
                <span className="ml-2 font-medium">{updatedAuftrag.kategorie}</span>
                {updatedAuftrag.unterkategorie && (
                  <span className="ml-1 text-gray-500">→ {updatedAuftrag.unterkategorie}</span>
                )}
              </div>
              <div>
                <span className="text-gray-600">Erledigen bis:</span>
                {isAdmin ? (
                  <input
                    type="date"
                    value={updatedAuftrag.erledigenBis}
                    onChange={(e) => handleDateChange('erledigenBis', e.target.value)}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <span className="ml-2 font-medium">{new Date(updatedAuftrag.erledigenBis).toLocaleDateString('de-DE')}</span>
                )}
              </div>
              <div>
                <span className="text-gray-600">Verantwortlicher:</span>
                <span className="ml-2 font-medium">{updatedAuftrag.verantwortlicher}</span>
              </div>
              <div>
                <span className="text-gray-600">Gesamtzeit:</span>
                <span className="ml-2 font-medium text-blue-600">{updatedAuftrag.gesamtzeit.toString().replace('.', ',')}h</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-gray-600">Meldetext:</span>
              <p className="mt-1 text-gray-900">{updatedAuftrag.meldetext}</p>
            </div>
          </div>

          {/* Status, Priorität, Abteilung und Geschätzte Dauer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Status</h4>
              <div className="flex flex-wrap gap-2">
                {(['offen', 'in_bearbeitung', 'abgeschlossen'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      updatedAuftrag.status === status
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {isAdmin && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Priorität
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(['niedrig', 'normal', 'hoch', 'kritisch'] as const).map(prioritaet => (
                    <button
                      key={prioritaet}
                      onClick={() => handlePriorityChange(prioritaet)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        updatedAuftrag.prioritaet === prioritaet
                          ? getPriorityColor(prioritaet)
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                      }`}
                    >
                      {prioritaet.charAt(0).toUpperCase() + prioritaet.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Abteilung</h4>
                <div className="flex flex-wrap gap-2">
                  {settings.abteilungen.map(abteilung => (
                    <button
                      key={abteilung}
                      onClick={() => handleAbteilungChange(abteilung)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        updatedAuftrag.abteilung === abteilung
                          ? getAbteilungColor(abteilung)
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                      }`}
                    >
                      {abteilung}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Geschätzte Dauer</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0,5"
                    min="0"
                    value={updatedAuftrag.geschaetzteDauer}
                    onChange={(e) => handleGeschaetzteDauerChange(parseFloat(e.target.value.replace(',', '.')) || 0)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-600">Stunden</span>
                </div>
              </div>
            </div>
          )}

          {/* Dateien */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Dateien und Bilder
            </h4>
            
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unterstützte Formate: Bilder (JPG, PNG, GIF), Dokumente (PDF, DOC, DOCX, TXT)
                </p>
              </div>

              {updatedAuftrag.dateien.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {updatedAuftrag.dateien.map(datei => (
                    <div key={datei.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {datei.typ === 'bild' ? (
                            <Image className="w-4 h-4 text-blue-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-green-600" />
                          )}
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {datei.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(datei.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {datei.typ === 'bild' && (
                        <img
                          src={datei.url}
                          alt={datei.name}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                      )}
                      
                      <div className="text-xs text-gray-500">
                        <div>{formatFileSize(datei.groesse)}</div>
                        <div>Von: {datei.hochgeladenVon}</div>
                        <div>{new Date(datei.hochgeladenAm).toLocaleDateString('de-DE')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Neue Ausführung hinzufügen */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Neue Ausführung hinzufügen
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Was wurde gemacht?
                </label>
                <textarea
                  value={beschreibung}
                  onChange={(e) => setBeschreibung(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Beschreibung der durchgeführten Arbeiten..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zeitaufwand (Stunden)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={zeitaufwand}
                    onChange={(e) => setZeitaufwand(Math.max(0, parseFloat(e.target.value.replace(',', '.')) || 0))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. 1,5"
                  />
                  <span className="text-gray-500">oder</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addZeit(0.25)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      +0,25h
                    </button>
                    <button
                      type="button"
                      onClick={() => addZeit(0.5)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      +0,5h
                    </button>
                    <button
                      type="button"
                      onClick={() => addZeit(1)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      +1h
                    </button>
                  </div>
                </div>
                {zeitaufwand > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Entspricht: {zeitaufwand.toString().replace('.', ',')}h
                  </p>
                )}
              </div>

              <button
                onClick={addAusfuehrung}
                disabled={!beschreibung.trim() || zeitaufwand <= 0}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ausführung hinzufügen
              </button>
            </div>
          </div>

          {/* Bisherige Ausführungen */}
          {updatedAuftrag.ausfuehrungen.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Bisherige Ausführungen ({updatedAuftrag.ausfuehrungen.length})
              </h4>
              <div className="space-y-3">
                {updatedAuftrag.ausfuehrungen.map((ausfuehrung) => (
                  <div key={ausfuehrung.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(ausfuehrung.datum).toLocaleDateString('de-DE')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {ausfuehrung.uhrzeit}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {ausfuehrung.bearbeiter}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {ausfuehrung.zeitaufwand.toString().replace('.', ',')}h
                      </span>
                    </div>
                    <p className="text-gray-900">{ausfuehrung.beschreibung}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}