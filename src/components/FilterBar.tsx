'use client';

import React from 'react';

export interface FilterConfig {
  searchPlaceholder: string;
  sortOptions: { value: string; label: string }[];
  statusOptions?: { value: string; label: string; color?: string }[];
  showStatusFilter?: boolean;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  config: FilterConfig;
}

export default function FilterBar({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  statusValue = '',
  onStatusChange,
  config,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={config.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#006935' } as React.CSSProperties}
          />
        </div>

        {/* Ordenamiento */}
        <div className="relative">
          <i className="fas fa-sort absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent appearance-none cursor-pointer"
            style={{ '--tw-ring-color': '#006935' } as React.CSSProperties}
          >
            {config.sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
        </div>

        {/* Filtro de Estado (opcional) */}
        {config.showStatusFilter && config.statusOptions && onStatusChange && (
          <div className="relative">
            <i className="fas fa-filter absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <select
              value={statusValue}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent appearance-none cursor-pointer"
              style={{ '--tw-ring-color': '#006935' } as React.CSSProperties}
            >
              <option value="">Todos los estados</option>
              {config.statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
          </div>
        )}
      </div>

      {/* Indicadores activos */}
      {(searchValue || statusValue || sortValue !== config.sortOptions[0]?.value) && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600 font-medium">Filtros activos:</span>
          
          {searchValue && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <i className="fas fa-search text-xs"></i>
              {searchValue}
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:text-green-900"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </span>
          )}
          
          {statusValue && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <i className="fas fa-tag text-xs"></i>
              {config.statusOptions?.find(s => s.value === statusValue)?.label}
              <button
                onClick={() => onStatusChange?.('')}
                className="ml-1 hover:text-blue-900"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </span>
          )}
          
          {sortValue !== config.sortOptions[0]?.value && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              <i className="fas fa-sort text-xs"></i>
              {config.sortOptions.find(s => s.value === sortValue)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
