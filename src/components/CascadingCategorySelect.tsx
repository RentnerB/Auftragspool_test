import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { HierarchicalCategory } from '../types';

interface CascadingCategorySelectProps {
  kategorien: HierarchicalCategory[];
  selectedKategorie?: string;
  selectedUnterkategorie?: string;
  onKategorieChange: (kategorie: string) => void;
  onUnterkategorieChange: (unterkategorie?: string) => void;
  required?: boolean;
}

export function CascadingCategorySelect({
  kategorien,
  selectedKategorie,
  selectedUnterkategorie,
  onKategorieChange,
  onUnterkategorieChange,
  required = false
}: CascadingCategorySelectProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategorySelect = (category: HierarchicalCategory) => {
    if (category.level === 0) {
      onKategorieChange(category.name);
      onUnterkategorieChange(undefined);
      // Auto-expand when selecting main category
      const newExpanded = new Set(expandedCategories);
      newExpanded.add(category.id);
      setExpandedCategories(newExpanded);
    } else {
      onUnterkategorieChange(category.name);
    }
  };

  const renderCategory = (category: HierarchicalCategory, level: number = 0) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = (level === 0 && selectedKategorie === category.name) || 
                     (level > 0 && selectedUnterkategorie === category.name);

    return (
      <div key={category.id} className="mb-1">
        <div 
          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
            isSelected 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'hover:bg-gray-100'
          }`}
          style={{ marginLeft: `${level * 16}px` }}
          onClick={() => handleCategorySelect(category)}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(category.id);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            
            <div className="flex-1">
              <div className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                {category.name}
              </div>
              {category.beschreibung && (
                <div className={`text-sm ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                  {category.beschreibung}
                </div>
              )}
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Kategorie {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto bg-white">
        {kategorien.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>Keine Kategorien verfügbar</p>
          </div>
        ) : (
          <div className="space-y-1">
            {kategorien.map(category => renderCategory(category))}
          </div>
        )}
      </div>
      
      {selectedKategorie && (
        <div className="text-sm text-gray-600">
          Ausgewählt: <span className="font-medium">{selectedKategorie}</span>
          {selectedUnterkategorie && (
            <span> → <span className="font-medium">{selectedUnterkategorie}</span></span>
          )}
        </div>
      )}
    </div>
  );
}