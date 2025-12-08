'use client';

import { FilterState, Category } from '@/types';
import { Search, X } from 'lucide-react';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableCities: string[];
  availableStates: string[];
  resultCount: number;
}

const categories: (Category | 'All')[] = [
  'All',
  'Police',
  'Fire',
  'Ambulance',
  'Hospital',
  'Emergency',
];

export default function Filters({
  filters,
  onFilterChange,
  availableCities,
  availableStates,
  resultCount,
}: FiltersProps) {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      title: '',
      category: 'All',
      city: '',
      state: '',
    });
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
          placeholder="Search by title..."
          value={filters.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
        />
        {filters.title && (
          <button
            onClick={() => handleChange('title', '')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full px-3 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm appearance-none cursor-pointer bg-white"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 24 24'><path d='M6.707 9.293 12 14.586l5.293-5.293 1.414 1.414L12 17.414l-6.707-6.707z'/></svg>\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'calc(100% - 12px) center',
          }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* City and State Filters */}
      <div className="grid grid-cols-2 gap-3">
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

