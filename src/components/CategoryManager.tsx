import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, Tag, Edit2, Check, X } from 'lucide-react';
import { HierarchicalCategory } from '../types';

interface CategoryManagerProps {
  kategorien: HierarchicalCategory[];
  onUpdate: (kategorien: HierarchicalCategory[]) => void;
}

export function CategoryManager({ kategorien, onUpdate }: CategoryManagerProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const startEdit = (category: HierarchicalCategory) => {
    setEditingCategory(category.id);
    setEditName(category.name);
    setEditDescription(category.beschreibung);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;

    const updateCategory = (categories: HierarchicalCategory[]): HierarchicalCategory[] => {
      return categories.map(cat => {
        if (cat.id === editingCategory) {
          return { ...cat, name: editName.trim(), beschreibung: editDescription.trim() };
        }
        if (cat.children.length > 0) {
          return { ...cat, children: updateCategory(cat.children) };
        }
        return cat;
      });
    };

    onUpdate(updateCategory(kategorien));
    setEditingCategory(null);
    setEditName('');
    setEditDescription('');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setEditDescription('');
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: HierarchicalCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      beschreibung: newCategoryDescription.trim(),
      parentId: selectedParentId || undefined,
      children: [],
      level: selectedParentId ? getLevel(selectedParentId) + 1 : 0
    };

    if (selectedParentId) {
      const addToParent = (categories: HierarchicalCategory[]): HierarchicalCategory[] => {
        return categories.map(cat => {
          if (cat.id === selectedParentId) {
            return { ...cat, children: [...cat.children, newCategory] };
          }
          if (cat.children.length > 0) {
            return { ...cat, children: addToParent(cat.children) };
          }
          return cat;
        });
      };
      onUpdate(addToParent(kategorien));
    } else {
      onUpdate([...kategorien, newCategory]);
    }

    setNewCategoryName('');
    setNewCategoryDescription('');
    setSelectedParentId('');
  };

  const removeCategory = (categoryId: string) => {
    const removeFromCategories = (categories: HierarchicalCategory[]): HierarchicalCategory[] => {
      return categories
        .filter(cat => cat.id !== categoryId)
        .map(cat => ({
          ...cat,
          children: removeFromCategories(cat.children)
        }));
    };

    onUpdate(removeFromCategories(kategorien));
  };

  const getLevel = (categoryId: string): number => {
    const findLevel = (categories: HierarchicalCategory[], level: number = 0): number => {
      for (const cat of categories) {
        if (cat.id === categoryId) return level;
        const childLevel = findLevel(cat.children, level + 1);
        if (childLevel !== -1) return childLevel;
      }
      return -1;
    };
    return findLevel(kategorien);
  };

  const getAllCategories = (categories: HierarchicalCategory[] = kategorien): HierarchicalCategory[] => {
    let result: HierarchicalCategory[] = [];
    for (const cat of categories) {
      result.push(cat);
      result = result.concat(getAllCategories(cat.children));
    }
    return result;
  };

  const renderCategory = (category: HierarchicalCategory, level: number = 0) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isEditing = editingCategory === category.id;

    return (
      <div key={category.id} className="mb-2">
        <div 
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(category.id)}
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
            
            {isEditing ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <button
                  onClick={saveEdit}
                  className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex-1">
                <div className="font-medium text-gray-900">{category.name}</div>
                {category.beschreibung && (
                  <div className="text-sm text-gray-600">{category.beschreibung}</div>
                )}
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => startEdit(category)}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeCategory(category.id)}
                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5" />
        Hierarchische Kategorien verwalten
      </h3>

      {/* Neue Kategorie hinzufügen */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-gray-900 mb-3">Neue Kategorie hinzufügen</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Kategoriename"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Hauptkategorie (keine Übergeordnete)</option>
              {getAllCategories().map(cat => (
                <option key={cat.id} value={cat.id}>
                  {'→'.repeat(cat.level)} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Beschreibung (optional)"
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={addCategory}
            disabled={!newCategoryName.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Kategorie hinzufügen
          </button>
        </div>
      </div>

      {/* Kategorien-Baum */}
      <div className="space-y-2">
        {kategorien.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Noch keine Kategorien vorhanden</p>
            <p className="text-sm">Fügen Sie die erste Kategorie hinzu</p>
          </div>
        ) : (
          kategorien.map(category => renderCategory(category))
        )}
      </div>
    </div>
  );
}