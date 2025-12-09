'use client';

import { FilterState, Category, GeoSuggestion } from '@/types';
import { Search, X, Shield, FlameKindling, Building2 } from 'lucide-react';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onTitleChange: (value: string) => void;
  suggestions: GeoSuggestion[];
  onSuggestionSelect: (suggestion: GeoSuggestion) => void;
  searchLoading?: boolean;
  availableCities: string[];
  availableStates: string[];
  resultCount: number;
  onClearAll?: () => void;
}

const categories: (Category | 'All')[] = [
  'All',
  'Police',
  'Fire',
  'Hospital',
];

export default function Filters({
  filters,
  onFilterChange,
  onTitleChange,
  suggestions,
  onSuggestionSelect,
  searchLoading = false,
  availableCities,
  availableStates,
  resultCount,
  onClearAll,
}: FiltersProps) {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const selectedCategories = filters.categories ?? [];

  const toggleCategory = (cat: Category) => {
    // single-select behavior: select only one at a time; tapping again clears
    const exists = selectedCategories.includes(cat);
    const next = exists ? [] : [cat];
    onFilterChange({
      ...filters,
      categories: next,
      category: 'All',
    });
  };

  const clearCategories = () => {
    onFilterChange({
      ...filters,
      categories: [],
      category: 'All',
    });
  };

  const clearFilters = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      onFilterChange({
        title: '',
        category: 'All',
        categories: [],
        city: '',
        state: '',
      });
    }
  };

  const hasActiveFilters =
    filters.title !== '' ||
    filters.category !== 'All' ||
    filters.city !== '' ||
    filters.state !== '';

  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-4">
      {/* Title Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search places or titles..."
          value={filters.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
        />
        {filters.title && (
          <button
            onClick={() => onTitleChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {suggestions.length > 0 && (
          <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={`${s.lat}-${s.lon}-${s.label}`}
                onClick={() => onSuggestionSelect(s)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm"
              >
                <div className="font-medium text-gray-900">{s.label.split(',')[0]}</div>
                <div className="text-xs text-gray-600 line-clamp-1">{s.label}</div>
              </button>
            ))}
            {searchLoading && (
              <div className="px-3 py-2 text-xs text-gray-500">Searching…</div>
            )}
          </div>
        )}
      </div>

      {/* Category Tabs (multi-select) - Mobile Only */}
      <div className="space-y-2 md:hidden">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          {selectedCategories.length > 0 && (
            <button
              onClick={clearCategories}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'Police' as Category, label: 'Police', icon: <Shield className="w-4 h-4" /> },
            { key: 'Fire' as Category, label: 'Fire', icon: <FlameKindling className="w-4 h-4" /> },
            { key: 'Hospital' as Category, label: 'Hospital', icon: <Building2 className="w-4 h-4" /> },
          ].map((item) => {
            const active = selectedCategories.includes(item.key);
            return (
              <button
                key={item.key}
                onClick={() => toggleCategory(item.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm whitespace-nowrap transition ${
                  active
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* City and State Filters */}
      <div className="grid grid-cols-2 gap-3">

      <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <select
            value={filters.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full px-3 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm appearance-none cursor-pointer bg-white"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 24 24'><path d='M6.707 9.293 12 14.586l5.293-5.293 1.414 1.414L12 17.414l-6.707-6.707z'/></svg>\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'calc(100% - 12px) center',
            }}
          >
            <option value="">All States</option>
            {availableStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm appearance-none cursor-pointer bg-white"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 24 24'><path d='M6.707 9.293 12 14.586l5.293-5.293 1.414 1.414L12 17.414l-6.707-6.707z'/></svg>\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'calc(100% - 12px) center',
            }}
          >
            <option value="">All Cities</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
       
      </div>

      {/* Results Count and Clear */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          {resultCount} result{resultCount !== 1 ? 's' : ''} found
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

