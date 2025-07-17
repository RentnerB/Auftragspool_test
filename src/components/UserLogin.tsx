import React, { useState } from 'react';
import { User, LogIn, Building2 } from 'lucide-react';

interface UserLoginProps {
  onLogin: (username: string) => void;
}

export function UserLogin({ onLogin }: UserLoginProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setError('Bitte geben Sie einen Benutzernamen ein');
      return;
    }

    if (trimmedUsername.length < 2) {
      setError('Benutzername muss mindestens 2 Zeichen lang sein');
      return;
    }

    onLogin(trimmedUsername);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AuftragsPool</h1>
          <p className="text-gray-600">Professionelle Auftragsverwaltung</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firmenname
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="z.B. Worthington"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Building2 className="w-5 h-5" />
            Anmelden
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Geben Sie Ihren Firmennamen ein, um fortzufahren</p>
        </div>
      </div>
    </div>
  );
}