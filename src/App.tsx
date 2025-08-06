import React, { useState, useMemo } from 'react';
import { Search, Plus, Download, BarChart3, Settings, ClipboardList, User, AlertTriangle, CheckCircle, Clock, Edit, Shield, ArrowUpDown, ArrowUp, ArrowDown, LogOut, FileText } from 'lucide-react';
import { Auftrag, AppSettings, SortField, SortDirection, UserData } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AuftragBearbeiten } from './components/AuftragBearbeiten';
import { AdminEinstellungen } from './components/AdminEinstellungen';
import { AdminLogin } from './components/AdminLogin';
import { UserLogin } from './components/UserLogin';
import { CascadingCategorySelect } from './components/CascadingCategorySelect';
import { exportToExcel } from './utils/excelExport';
import { generatePDF } from './utils/pdfExport';

const initialSettings: AppSettings = {
  kategorien: [
    {
      id: '1',
      name: 'Druckluft',
      beschreibung: 'Kompressoren und Druckluftsysteme',
      level: 0,
      children: [
        {
          id: '1-1',
          name: 'Kompressor Station 1',
          beschreibung: 'Hauptkompressor-Station',
          parentId: '1',
          level: 1,
          children: [
            {
              id: '1-1-1',
              name: 'Motor',
              beschreibung: 'Antriebsmotoren',
              parentId: '1-1',
              level: 2,
              children: []
            }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Pumpen',
      beschreibung: 'Wasser- und Kühlmittelpumpen',
      level: 0,
      children: [
        {
          id: '2-1',
          name: 'Kühlwasserpumpen',
          beschreibung: 'Pumpen für Kühlkreisläufe',
          parentId: '2',
          level: 1,
          children: []
        }
      ]
    },
    {
      id: '3',
      name: 'Heizung',
      beschreibung: 'Heizungsanlagen und Klimatechnik',
      level: 0,
      children: [
        {
          id: '3-1',
          name: 'Zentrale Anlagen',
          beschreibung: 'Zentrale Heizungs- und Klimaanlagen',
          parentId: '3',
          level: 1,
          children: []
        }
      ]
    }
  ],
  benutzer: ['Max Mustermann', 'Anna Weber', 'Klaus Fischer', 'Robert Lang', 'Peter Schmidt', 'Thomas Müller', 'Maria Klein', 'Stefan Gross'],
  abteilungen: ['Wartung', 'Reparatur', 'Inspektion', 'Notfall', 'Modernisierung'],
  naechsteAuftragsnummer: 5,
  adminPasswort: 'admin123'
};

const mockAuftraege: Auftrag[] = [
  {
    id: '1',
    auftragsnummer: 'A-2025-001',
    erteiltAm: '2025-01-15',
    erledigenBis: '2025-01-25',
    kategorie: 'Druckluft',
    unterkategorie: 'Kompressor Station 1',
    meldetext: 'Ölstand prüfen und ggf. nachfüllen',
    verantwortlicher: 'Max Mustermann',
    ausfuehrender: 'Peter Schmidt',
    status: 'in_bearbeitung',
    prioritaet: 'normal',
    abteilung: 'Wartung',
    geschaetzteDauer: 1,
    ausfuehrungen: [
      {
        id: '1',
        datum: '2025-01-16',
        uhrzeit: '09:30',
        beschreibung: 'Ölstand geprüft - war niedrig, 2L Öl nachgefüllt',
        zeitaufwand: 45,
        bearbeiter: 'Peter Schmidt'
      }
    ],
    gesamtzeit: 45,
    dateien: []
  },
  {
    id: '2',
    auftragsnummer: 'A-2025-002',
    erteiltAm: '2025-01-10',
    erledigenBis: '2025-01-20',
    kategorie: 'Pumpen',
    unterkategorie: 'Kühlwasserpumpen',
    meldetext: 'Dichtung austauschen - Leckage festgestellt',
    verantwortlicher: 'Anna Weber',
    ausfuehrender: 'Thomas Müller',
    status: 'ueberfaellig',
    prioritaet: 'hoch',
    abteilung: 'Reparatur',
    geschaetzteDauer: 2,
    ausfuehrungen: [],
    gesamtzeit: 0,
    dateien: []
  },
  {
    id: '3',
    auftragsnummer: 'A-2025-003',
    erteiltAm: '2025-01-18',
    erledigenBis: '2025-02-01',
    kategorie: 'Heizung',
    unterkategorie: 'Zentrale Anlagen',
    meldetext: 'Wartung und Reinigung der Brennkammer',
    verantwortlicher: 'Klaus Fischer',
    ausfuehrender: 'Maria Klein',
    status: 'offen',
    prioritaet: 'normal',
    abteilung: 'Wartung',
    geschaetzteDauer: 3,
    ausfuehrungen: [],
    gesamtzeit: 0,
    dateien: []
  },
  {
    id: '4',
    auftragsnummer: 'A-2025-004',
    erteiltAm: '2025-01-12',
    erledigenBis: '2025-01-18',
    kategorie: 'Druckluft',
    unterkategorie: 'Kompressor Station 1',
    meldetext: 'Notfallreparatur - Kompressor ausgefallen',
    verantwortlicher: 'Robert Lang',
    ausfuehrender: 'Stefan Gross',
    status: 'abgeschlossen',
    prioritaet: 'kritisch',
    abteilung: 'Notfall',
    geschaetzteDauer: 4,
    ausfuehrungen: [
      {
        id: '2',
        datum: '2025-01-13',
        uhrzeit: '08:00',
        beschreibung: 'Schaden begutachtet, Ersatzteile bestellt',
        zeitaufwand: 30,
        bearbeiter: 'Stefan Gross'
      },
      {
        id: '3',
        datum: '2025-01-15',
        uhrzeit: '14:00',
        beschreibung: 'Kompressor repariert und getestet',
        zeitaufwand: 180,
        bearbeiter: 'Stefan Gross'
      }
    ],
    gesamtzeit: 210,
    dateien: []
  }
];

function App() {
  const [currentUser, setCurrentUser] = useState<string>('');
  const [userData, setUserData] = useLocalStorage<UserData>(`userData_${currentUser}`, {
    auftraege: mockAuftraege,
    settings: initialSettings
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('alle');
  const [priorityFilter, setPriorityFilter] = useState<string>('alle');
  const [abteilungFilter, setAbteilungFilter] = useState<string>('alle');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAuftrag, setEditingAuftrag] = useState<Auftrag | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [sortField, setSortField] = useState<SortField>('auftragsnummer');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'offen': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_bearbeitung': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'abgeschlossen': return 'bg-green-100 text-green-800 border-green-200';
      case 'ueberfaellig': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'offen': return <ClipboardList className="w-4 h-4" />;
      case 'in_bearbeitung': return <Clock className="w-4 h-4" />;
      case 'abgeschlossen': return <CheckCircle className="w-4 h-4" />;
      case 'ueberfaellig': return <AlertTriangle className="w-4 h-4" />;
      default: return <ClipboardList className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (prioritaet: string) => {
    switch (prioritaet) {
      case 'niedrig': return 'bg-gray-100 text-gray-600';
      case 'normal': return 'bg-blue-100 text-blue-600';
      case 'hoch': return 'bg-orange-100 text-orange-600';
      case 'kritisch': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getAbteilungColor = (abteilung: string) => {
    const colors = {
      'Wartung': 'bg-green-100 text-green-700',
      'Reparatur': 'bg-orange-100 text-orange-700',
      'Inspektion': 'bg-blue-100 text-blue-700',
      'Notfall': 'bg-red-100 text-red-700',
      'Modernisierung': 'bg-purple-100 text-purple-700'
    };
    return colors[abteilung as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getAllCategories = (categories = userData.settings.kategorien): any[] => {
    let result: any[] = [];
    for (const cat of categories) {
      result.push(cat);
      result = result.concat(getAllCategories(cat.children));
    }
    return result;
  };

  const generateAuftragsnummer = () => {
    const year = new Date().getFullYear();
    const nummer = String(userData.settings.naechsteAuftragsnummer).padStart(3, '0');
    return `A-${year}-${nummer}`;
  };

  const createAuftrag = (auftragData: Partial<Auftrag>) => {
    console.log('Creating auftrag with data:', auftragData);
    
    const neuerAuftrag: Auftrag = {
      id: Date.now().toString(),
      auftragsnummer: generateAuftragsnummer(),
      erteiltAm: new Date().toISOString().split('T')[0],
      erledigenBis: auftragData.erledigenBis || '',
      kategorie: auftragData.kategorie || '',
      unterkategorie: auftragData.unterkategorie,
      meldetext: auftragData.meldetext || '',
      verantwortlicher: auftragData.verantwortlicher || '',
      ausfuehrender: auftragData.ausfuehrender || '',
      status: 'offen',
      prioritaet: auftragData.prioritaet || 'normal',
      abteilung: auftragData.abteilung || '',
      geschaetzteDauer: auftragData.geschaetzteDauer || 0,
      ausfuehrungen: [],
      gesamtzeit: 0,
      dateien: []
    };

    console.log('New auftrag created:', neuerAuftrag);

    setUserData(prev => ({
      ...prev,
      auftraege: [...prev.auftraege, neuerAuftrag],
      settings: { ...prev.settings, naechsteAuftragsnummer: prev.settings.naechsteAuftragsnummer + 1 }
    }));
    
    console.log('UserData updated');
  };

  const updateAuftrag = (updatedAuftrag: Auftrag) => {
    setUserData(prev => ({
      ...prev,
      auftraege: prev.auftraege.map(a => a.id === updatedAuftrag.id ? updatedAuftrag : a)
    }));
  };

  const updateSettings = (newSettings: AppSettings) => {
    setUserData(prev => ({ ...prev, settings: newSettings }));
  };

  const handleAdminLogin = (password: string) => {
    if (password === userData.settings.adminPasswort) {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    if (activeTab === 'einstellungen') {
      setActiveTab('dashboard');
    }
  };

  const handleUserLogout = () => {
    setCurrentUser('');
    setIsAdminMode(false);
    setActiveTab('dashboard');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const handleExport = () => {
    exportToExcel(filteredAndSortedAuftraege, 'auftraege');
  };

  const handlePDFExport = (auftrag: Auftrag) => {
    generatePDF(auftrag);
  };

  // Filter aufträge für aktuellen Benutzer
  const userAuftraege = useMemo(() => {
    console.log('All auftraege:', userData.auftraege);
    console.log('Current user:', currentUser);
    
    // Zeige ALLE Aufträge für die Firma, nicht nur die des aktuellen Benutzers
    return userData.auftraege;
  }, [userData.auftraege, currentUser]);

  const filteredAndSortedAuftraege = useMemo(() => {
    let filtered = userAuftraege.filter(auftrag => {
      const matchesSearch = searchTerm === '' || 
        auftrag.auftragsnummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auftrag.kategorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (auftrag.unterkategorie && auftrag.unterkategorie.toLowerCase().includes(searchTerm.toLowerCase())) ||
        auftrag.meldetext.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auftrag.verantwortlicher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auftrag.ausfuehrender.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'alle' || auftrag.status === statusFilter;
      const matchesPriority = priorityFilter === 'alle' || auftrag.prioritaet === priorityFilter;
      const matchesAbteilung = abteilungFilter === 'alle' || auftrag.abteilung === abteilungFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAbteilung;
    });

    // Sortierung anwenden
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'erteiltAm':
        case 'erledigenBis':
          aValue = new Date(a[sortField]);
          bValue = new Date(b[sortField]);
          break;
        case 'prioritaet':
          const priorityOrder = { 'niedrig': 1, 'normal': 2, 'hoch': 3, 'kritisch': 4 };
          aValue = priorityOrder[a.prioritaet];
          bValue = priorityOrder[b.prioritaet];
          break;
        case 'status':
          const statusOrder = { 'offen': 1, 'in_bearbeitung': 2, 'ueberfaellig': 3, 'abgeschlossen': 4 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [userAuftraege, searchTerm, statusFilter, priorityFilter, abteilungFilter, sortField, sortDirection]);

  const statusCounts = useMemo(() => {
    return userAuftraege.reduce((acc, auftrag) => {
      acc[auftrag.status] = (acc[auftrag.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [userAuftraege]);

  // Dashboard Prioritäten - nur hohe/kritische Aufträge anzeigen
  const dashboardPriorities = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    return userAuftraege.filter(auftrag => {
      if (auftrag.status === 'abgeschlossen') return false;
      
      if (auftrag.prioritaet === 'kritisch') return true;
      
      if (auftrag.prioritaet === 'hoch') {
        const erledigenBis = new Date(auftrag.erledigenBis);
        return erledigenBis <= threeDaysFromNow;
      }
      
      return false;
    });
  }, [userAuftraege]);

  const isOverdue = (erledigenBis: string, status: string) => {
    return new Date(erledigenBis) < new Date() && status !== 'abgeschlossen';
  };

  const formatZeit = (minuten: number) => {
    const stunden = Math.floor(minuten / 60);
    const mins = minuten % 60;
    const stundenStr = stunden > 0 ? stunden.toString().replace('.', ',') : '';
    const minsStr = mins.toString().replace('.', ',');
    return stunden > 0 ? `${stundenStr}h ${minsStr}min` : `${minsStr}min`;
  };

  // If no user is logged in, show login screen
  if (!currentUser) {
    return <UserLogin onLogin={setCurrentUser} />;
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Offene Aufträge</p>
              <p className="text-3xl font-bold text-blue-600">{statusCounts.offen || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Bearbeitung</p>
              <p className="text-3xl font-bold text-yellow-600">{statusCounts.in_bearbeitung || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Überfällig</p>
              <p className="text-3xl font-bold text-red-600">{statusCounts.ueberfaellig || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abgeschlossen</p>
              <p className="text-3xl font-bold text-green-600">{statusCounts.abgeschlossen || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktuelle Prioritäten</h3>
        <div className="space-y-3">
          {dashboardPriorities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Keine prioritären Aufträge</p>
            </div>
          ) : (
            dashboardPriorities.slice(0, 10).map(auftrag => (
              <div key={auftrag.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">{auftrag.auftragsnummer}</p>
                    <p className="text-sm text-gray-600">{auftrag.kategorie} {auftrag.unterkategorie && `→ ${auftrag.unterkategorie}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${getAbteilungColor(auftrag.abteilung)}`}>
                    {auftrag.abteilung}
                  </span>
                  {auftrag.geschaetzteDauer > 0 && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Geschätzt: {auftrag.geschaetzteDauer}h
                    </span>
                  )}
                  {auftrag.gesamtzeit > 0 && (
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {formatZeit(auftrag.gesamtzeit)}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(auftrag.status)}`}>
                    {auftrag.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderAuftraege = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Auftragsübersicht</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Aufträge durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="alle">Alle Status</option>
              <option value="offen">Offen</option>
              <option value="in_bearbeitung">In Bearbeitung</option>
              <option value="abgeschlossen">Abgeschlossen</option>
              <option value="ueberfaellig">Überfällig</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="alle">Alle Prioritäten</option>
              <option value="niedrig">Niedrig</option>
              <option value="normal">Normal</option>
              <option value="hoch">Hoch</option>
              <option value="kritisch">Kritisch</option>
            </select>
            <select
              value={abteilungFilter}
              onChange={(e) => setAbteilungFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="alle">Alle Abteilungen</option>
              {userData.settings.abteilungen.map(abteilung => (
                <option key={abteilung} value={abteilung}>{abteilung}</option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Neuer Auftrag
            </button>
            <button 
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Excel Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('auftragsnummer')}
                >
                  <div className="flex items-center gap-1">
                    Auftragsnummer
                    {getSortIcon('auftragsnummer')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('erteiltAm')}
                >
                  <div className="flex items-center gap-1">
                    Erteilt am
                    {getSortIcon('erteiltAm')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('erledigenBis')}
                >
                  <div className="flex items-center gap-1">
                    Erledigen bis
                    {getSortIcon('erledigenBis')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('kategorie')}
                >
                  <div className="flex items-center gap-1">
                    Kategorie
                    {getSortIcon('kategorie')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meldetext</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verantwortlicher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ausführender</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('prioritaet')}
                >
                  <div className="flex items-center gap-1">
                    Priorität
                    {getSortIcon('prioritaet')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('abteilung')}
                >
                  <div className="flex items-center gap-1">
                    Abteilung
                    {getSortIcon('abteilung')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zeit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedAuftraege.map((auftrag) => (
                <tr key={auftrag.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{auftrag.auftragsnummer}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(auftrag.erteiltAm).toLocaleDateString('de-DE')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isOverdue(auftrag.erledigenBis, auftrag.status) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {new Date(auftrag.erledigenBis).toLocaleDateString('de-DE')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {auftrag.kategorie}
                      {auftrag.unterkategorie && (
                        <div className="text-xs text-gray-500">→ {auftrag.unterkategorie}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={auftrag.meldetext}>
                      {auftrag.meldetext}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{auftrag.verantwortlicher}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{auftrag.ausfuehrender}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(auftrag.status)}`}>
                      {getStatusIcon(auftrag.status)}
                      {auftrag.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(auftrag.prioritaet)}`}>
                      {auftrag.prioritaet.charAt(0).toUpperCase() + auftrag.prioritaet.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getAbteilungColor(auftrag.abteilung)}`}>
                      {auftrag.abteilung}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {auftrag.gesamtzeit > 0 ? formatZeit(auftrag.gesamtzeit) : '-'}
                    </div>
                    {auftrag.geschaetzteDauer > 0 && (
                      <div className="text-xs text-blue-600">
                        Geschätzt: {auftrag.geschaetzteDauer}h
                      </div>
                    )}
                    {auftrag.ausfuehrungen.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {auftrag.ausfuehrungen.length} Einträge
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingAuftrag(auftrag)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="Auftrag bearbeiten"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePDFExport(auftrag)}
                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                        title="PDF exportieren"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">AuftragsPool</h1>
          </div>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('auftraege')}
            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
              activeTab === 'auftraege' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ClipboardList className="w-5 h-5 mr-3" />
            Aufträge
          </button>
          
          <button
            onClick={() => {
              if (isAdminMode) {
                setActiveTab('einstellungen');
              } else {
                setShowAdminLogin(true);
              }
            }}
            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
              activeTab === 'einstellungen' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Einstellungen
            {!isAdminMode && <Shield className="w-4 h-4 ml-auto text-gray-400" />}
          </button>

          {isAdminMode && (
            <button
              onClick={handleAdminLogout}
              className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors text-red-600 hover:bg-red-50"
            >
              <Shield className="w-5 h-5 mr-3" />
              Admin abmelden
            </button>
          )}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-500 text-center mb-3">
            Firma: <br />
            <span className="font-medium">{currentUser}</span>
          </div>
          <button
            onClick={handleUserLogout}
            className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Abmelden
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'auftraege' && 'Aufträge'}
              {activeTab === 'einstellungen' && 'Einstellungen'}
            </h2>
            <p className="text-gray-600 mt-1">
              {activeTab === 'dashboard' && 'Übersicht über alle Aufträge und aktuelle Prioritäten'}
              {activeTab === 'auftraege' && 'Verwalten Sie alle Aufträge und deren Status'}
              {activeTab === 'einstellungen' && 'Systemeinstellungen und Konfiguration'}
            </p>
          </div>

          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'auftraege' && renderAuftraege()}
          {activeTab === 'einstellungen' && isAdminMode && (
            <AdminEinstellungen settings={userData.settings} onSave={updateSettings} />
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Neuen Auftrag erstellen</h3>
              <p className="text-sm text-gray-600 mt-1">
                Auftragsnummer: {generateAuftragsnummer()}
              </p>
            </div>
            <CreateOrderForm onSubmit={(auftragData) => {
              createAuftrag(auftragData);
              setShowCreateModal(false);
            }} onCancel={() => setShowCreateModal(false)} settings={userData.settings} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAuftrag && (
        <AuftragBearbeiten
          auftrag={editingAuftrag}
          onSave={updateAuftrag}
          onClose={() => setEditingAuftrag(null)}
          currentUser={currentUser}
          isAdmin={isAdminMode}
          settings={userData.settings}
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}

interface CreateOrderFormProps {
  onSubmit: (auftragData: Partial<Auftrag>) => void;
  onCancel: () => void;
  settings: AppSettings;
}

function CreateOrderForm({ onSubmit, onCancel, settings }: CreateOrderFormProps) {
  const [selectedKategorie, setSelectedKategorie] = useState<string>('');
  const [selectedUnterkategorie, setSelectedUnterkategorie] = useState<string | undefined>();
  const [erledigenBis, setErledigenBis] = useState('');
  const [meldetext, setMeldetext] = useState('');
  const [verantwortlicher, setVerantwortlicher] = useState('');
  const [ausfuehrender, setAusfuehrender] = useState('');
  const [prioritaet, setPrioritat] = useState<Auftrag['prioritaet']>('normal');
  const [abteilung, setAbteilung] = useState('');
  const [geschaetzteDauer, setGeschaetzteDauer] = useState('');

  const isFormValid = selectedKategorie.trim() !== '' && 
                     erledigenBis.trim() !== '' && 
                     meldetext.trim() !== '' && 
                     verantwortlicher.trim() !== '' && 
                     ausfuehrender.trim() !== '' && 
                     abteilung.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }
    
    const geschaetzteDauerValue = geschaetzteDauer ? parseFloat(geschaetzteDauer.replace(',', '.')) : 0;
    
    onSubmit({
      erledigenBis: erledigenBis,
      kategorie: selectedKategorie,
      unterkategorie: selectedUnterkategorie,
      meldetext: meldetext,
      verantwortlicher: verantwortlicher,
      ausfuehrender: ausfuehrender,
      prioritaet: prioritaet,
      abteilung: abteilung,
      geschaetzteDauer
    });
  };

  console.log('Form validation:', {
    selectedKategorie,
    erledigenBis,
    meldetext,
    verantwortlicher,
    ausfuehrender,
    abteilung,
    isFormValid
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Erledigen bis</label>
          <input 
            type="date" 
            value={erledigenBis}
            onChange={(e) => setErledigenBis(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <CascadingCategorySelect
          kategorien={settings.kategorien}
          selectedKategorie={selectedKategorie}
          selectedUnterkategorie={selectedUnterkategorie}
          onKategorieChange={setSelectedKategorie}
          onUnterkategorieChange={setSelectedUnterkategorie}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meldetext</label>
          <textarea 
            rows={3} 
            value={meldetext}
            onChange={(e) => setMeldetext(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verantwortlicher</label>
            <select 
              value={verantwortlicher}
              onChange={(e) => setVerantwortlicher(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Verantwortlicher auswählen</option>
              {settings.benutzer.map(benutzer => (
                <option key={benutzer} value={benutzer}>{benutzer}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ausführender</label>
            <select 
              value={ausfuehrender}
              onChange={(e) => setAusfuehrender(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Ausführender auswählen</option>
              {settings.benutzer.map(benutzer => (
                <option key={benutzer} value={benutzer}>{benutzer}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
            <select 
              value={prioritaet}
              onChange={(e) => setPrioritat(e.target.value as Auftrag['prioritaet'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="niedrig">Niedrig</option>
              <option value="normal">Normal</option>
              <option value="hoch">Hoch</option>
              <option value="kritisch">Kritisch</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Abteilung</label>
            <select 
              value={abteilung}
              onChange={(e) => setAbteilung(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Abteilung auswählen</option>
              {settings.abteilungen.map(abteilung => (
                <option key={abteilung} value={abteilung}>{abteilung}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geschätzte Dauer (Stunden)</label>
            <input 
              type="text"
              value={geschaetzteDauer}
              onChange={(e) => setGeschaetzteDauer(e.target.value)}
              placeholder="z.B. 2,5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className={`px-4 py-2 rounded-lg transition-colors ${
            isFormValid 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Auftrag erstellen
        </button>
      </div>
    </form>
  );
}

export default App;