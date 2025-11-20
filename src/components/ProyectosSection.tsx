'use client';

import React, { useState, useMemo } from 'react';
import FilterBar, { FilterConfig } from './FilterBar';

interface Participant {
  Descripci_n_del_servicio__c?: string | null;
  CuentaName?: string | null;
  Cuenta__c?: string | null;
  Name?: string | null;
  Id?: string | null;
  Tipo_de_tercero__c?: string | null;
  Valor_contrato__c?: number | null;
}

interface Project {
  participants?: Participant[];
  materialProviders?: Participant[];
  Valor_del_contrato__c?: number | null;
  Valor_total_del_contrato__c?: number | null;
  Objeto_del_contrato__c?: string | null;
  Name?: string | null;
  Id?: string | null;
}

interface ProyectosSectionProps {
  projects: Project[];
  accountId?: string;
  onProjectClick: (project: Project) => void;
  currentPage: number;
  projectsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function ProyectosSection({
  projects,
  accountId,
  onProjectClick,
  currentPage,
  projectsPerPage,
  onPageChange,
}: ProyectosSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filterConfig: FilterConfig = {
    searchPlaceholder: 'Buscar por nombre u objeto del contrato...',
    sortOptions: [
      { value: 'name-asc', label: 'Nombre (A-Z)' },
      { value: 'name-desc', label: 'Nombre (Z-A)' },
      { value: 'value-asc', label: 'Valor (Menor a Mayor)' },
      { value: 'value-desc', label: 'Valor (Mayor a Menor)' },
      { value: 'participants-asc', label: 'Participantes (Menos a Más)' },
      { value: 'participants-desc', label: 'Participantes (Más a Menos)' },
    ],
    showStatusFilter: false,
  };

  // Filtrar y ordenar proyectos
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        (p.Name?.toLowerCase().includes(term)) ||
        (p.Objeto_del_contrato__c?.toLowerCase().includes(term))
      );
    }

    // Aplicar ordenamiento
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.Name || '').localeCompare(b.Name || '');
        case 'name-desc':
          return (b.Name || '').localeCompare(a.Name || '');
        case 'value-asc': {
          const aParticipant = a.participants?.find(par => String(par.Cuenta__c) === String(accountId));
          const bParticipant = b.participants?.find(par => String(par.Cuenta__c) === String(accountId));
          return (aParticipant?.Valor_contrato__c || 0) - (bParticipant?.Valor_contrato__c || 0);
        }
        case 'value-desc': {
          const aParticipant = a.participants?.find(par => String(par.Cuenta__c) === String(accountId));
          const bParticipant = b.participants?.find(par => String(par.Cuenta__c) === String(accountId));
          return (bParticipant?.Valor_contrato__c || 0) - (aParticipant?.Valor_contrato__c || 0);
        }
        case 'participants-asc':
          return (a.participants?.length || 0) - (b.participants?.length || 0);
        case 'participants-desc':
          return (b.participants?.length || 0) - (a.participants?.length || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [projects, searchTerm, sortBy, accountId]);

  // Calcular proyectos para la página actual
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredAndSortedProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredAndSortedProjects.length / projectsPerPage);

  // Resetear página cuando cambian los filtros
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      onPageChange(1);
    }
  }, [filteredAndSortedProjects.length, currentPage, totalPages, onPageChange]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Proyectos Asociados</h3>
      
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        sortValue={sortBy}
        onSortChange={setSortBy}
        config={filterConfig}
      />

      {filteredAndSortedProjects.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-folder-open text-gray-400 text-5xl mb-4"></i>
          <p className="text-gray-600 mb-2">
            {searchTerm ? 'No se encontraron proyectos con ese criterio' : 'No se encontraron proyectos asociados'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {currentProjects.map((p) => {
              const myParticipant = p.participants?.find(par => String(par.Cuenta__c) === String(accountId));
              
              return (
                <div 
                  key={p.Id} 
                  className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => onProjectClick(p)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <i className="fas fa-project-diagram text-green-600 text-lg"></i>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">{p.Name ?? 'Sin nombre'}</h4>
                          <p className="text-xs text-gray-500">{(p.participants ?? []).length} participante(s)</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{p.Objeto_del_contrato__c ?? 'Sin descripción'}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-600 font-semibold uppercase">Mi Contrato</p>
                      <p className="text-lg font-bold" style={{ color: '#006935' }}>
                        {myParticipant?.Valor_contrato__c ? formatCurrency(myParticipant.Valor_contrato__c) : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>
                          <i className="fas fa-users mr-1"></i>
                          {(p.participants ?? []).length} participantes
                        </span>
                        {p.materialProviders && p.materialProviders.length > 0 && (
                          <span>
                            <i className="fas fa-truck mr-1"></i>
                            {p.materialProviders.length} proveedores
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        <i className="fas fa-hand-pointer mr-1"></i>
                        Click para ver detalle
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {filteredAndSortedProjects.length > projectsPerPage && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  style={currentPage === page ? { backgroundColor: '#006935' } : {}}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}

          {/* Información de resultados */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Mostrando {indexOfFirstProject + 1} - {Math.min(indexOfLastProject, filteredAndSortedProjects.length)} de {filteredAndSortedProjects.length} proyecto(s)
          </div>
        </>
      )}
    </div>
  );
}
