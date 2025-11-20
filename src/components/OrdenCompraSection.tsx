'use client';

import React, { useState, useMemo } from 'react';
import { OrdenDeCompra } from '@/types/dashboard';
import FilterBar, { FilterConfig } from './FilterBar';

interface OrdenCompraSectionProps {
  ordenes: OrdenDeCompra[];
  loadingOrdenes: boolean;
  onRefresh: () => void;
  onNewOrder: () => void;
  onOrderClick: (ordenId: string | undefined) => void;
  currentPage?: number;
  ordenesPerPage?: number;
  onPageChange?: (page: number) => void;
}

export default function OrdenCompraSection({
  ordenes,
  loadingOrdenes,
  onRefresh,
  onNewOrder,
  onOrderClick,
  currentPage = 1,
  ordenesPerPage = 6,
  onPageChange,
}: OrdenCompraSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [filterStatus, setFilterStatus] = useState('');

  const filterConfig: FilterConfig = {
    searchPlaceholder: 'Buscar por número, proyecto o proveedor...',
    sortOptions: [
      { value: 'date-desc', label: 'Fecha (Más reciente)' },
      { value: 'date-asc', label: 'Fecha (Más antigua)' },
      { value: 'name-asc', label: 'Número (A-Z)' },
      { value: 'name-desc', label: 'Número (Z-A)' },
      { value: 'total-asc', label: 'Monto (Menor a Mayor)' },
      { value: 'total-desc', label: 'Monto (Mayor a Menor)' },
    ],
    statusOptions: [
      { value: 'Requisición generada', label: 'Requisición generada' },
      { value: 'Aprobado', label: 'Aprobado' },
      { value: 'Pendiente', label: 'Pendiente' },
      { value: 'Rechazado', label: 'Rechazado' },
      { value: 'Entregado', label: 'Entregado' },
      { value: 'Cancelado', label: 'Cancelado' },
    ],
    showStatusFilter: true,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'overdue':
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtrar y ordenar órdenes
  const filteredAndSortedOrdenes = useMemo(() => {
    let result = [...ordenes];

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(o => 
        (o.Name?.toLowerCase().includes(term)) ||
        (o.Proyecto__r?.Name?.toLowerCase().includes(term)) ||
        (o.Proveedor__r?.Cuenta__r?.Name?.toLowerCase().includes(term)) ||
        (o.Participante__r?.Name?.toLowerCase().includes(term))
      );
    }

    // Aplicar filtro de estado
    if (filterStatus) {
      result = result.filter(o => o.Estado__c === filterStatus);
    }

    // Aplicar ordenamiento
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.Fecha__c || 0).getTime() - new Date(a.Fecha__c || 0).getTime();
        case 'date-asc':
          return new Date(a.Fecha__c || 0).getTime() - new Date(b.Fecha__c || 0).getTime();
        case 'name-asc':
          return (a.Name || '').localeCompare(b.Name || '');
        case 'name-desc':
          return (b.Name || '').localeCompare(a.Name || '');
        case 'total-asc':
          return (a.Total__c || 0) - (b.Total__c || 0);
        case 'total-desc':
          return (b.Total__c || 0) - (a.Total__c || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [ordenes, searchTerm, filterStatus, sortBy]);

  // Calcular órdenes para la página actual
  const indexOfLastOrden = currentPage * ordenesPerPage;
  const indexOfFirstOrden = indexOfLastOrden - ordenesPerPage;
  const currentOrdenes = filteredAndSortedOrdenes.slice(indexOfFirstOrden, indexOfLastOrden);
  const totalPages = Math.ceil(filteredAndSortedOrdenes.length / ordenesPerPage);

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Resetear página cuando cambian los filtros
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0 && onPageChange) {
      onPageChange(1);
    }
  }, [filteredAndSortedOrdenes.length, currentPage, totalPages, onPageChange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Órdenes de Compra</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onRefresh}
            disabled={loadingOrdenes}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Actualizar órdenes"
          >
            <i className={`fas fa-sync-alt ${loadingOrdenes ? 'animate-spin' : ''}`}></i>
            <span>Actualizar</span>
          </button>
          <button
            onClick={onNewOrder}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span>Nueva Orden</span>
          </button>
        </div>
      </div>

      {!loadingOrdenes && (
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          sortValue={sortBy}
          onSortChange={setSortBy}
          statusValue={filterStatus}
          onStatusChange={setFilterStatus}
          config={filterConfig}
        />
      )}
      
      {loadingOrdenes ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              {/* Spinner principal */}
              <div 
                className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"
                style={{ borderTopColor: '#006935' }}
              ></div>
              {/* Icono en el centro */}
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-shopping-cart text-2xl" style={{ color: '#006935' }}></i>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold" style={{ color: '#006935' }}>
                Cargando órdenes de compra
              </p>
              <p className="text-sm text-gray-500">
                Por favor espera un momento...
              </p>
            </div>
            {/* Barra de progreso animada */}
            <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full animate-pulse"
                style={{ 
                  width: '60%',
                  backgroundColor: '#006935',
                  animation: 'loading-bar 1.5s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>
        </div>
      ) : filteredAndSortedOrdenes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <i className="fas fa-shopping-cart text-gray-400 text-5xl mb-4"></i>
          <p className="text-gray-600 mb-2">
            {searchTerm || filterStatus ? 'No se encontraron órdenes con ese criterio' : 'No hay órdenes de compra'}
          </p>
          <p className="text-gray-500 text-sm">
            {searchTerm || filterStatus ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('');
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Limpiar filtros
              </button>
            ) : (
              'Crea tu primera orden usando el botón "Nueva Orden"'
            )}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {currentOrdenes.map((orden) => (
            <div 
              key={orden.Id} 
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-transparent hover:border-green-200"
              onClick={() => onOrderClick(orden.Id)}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">{orden.Name || 'Sin número'}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(orden.Estado__c || 'pending')}`}>
                      {orden.Estado__c || 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    <i className="fas fa-user-tie mr-2"></i>
                    Participante: {orden.Participante__r?.Name || 'N/A'}
                  </p>
                  {orden.Proveedor__r?.Cuenta__r?.Name && (
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">
                      <i className="fas fa-store mr-2"></i>
                      Proveedor: {orden.Proveedor__r.Cuenta__r.Name}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOrderClick(orden.Id);
                  }}
                  className="text-green-600 hover:text-green-700 p-2 rounded-full hover:bg-green-50 transition-colors self-start sm:self-auto"
                  title="Ver detalle"
                >
                  <i className="fas fa-eye text-lg sm:text-xl"></i>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase">Fecha</p>
                  <p className="font-bold text-sm">{orden.Fecha__c ? formatDate(orden.Fecha__c) : 'N/A'}</p>
                </div>
                {orden.Fecha_de_vencimiento__c && (
                  <div>
                    <p className="text-gray-600 text-xs font-semibold uppercase">Vencimiento</p>
                    <p className="font-bold text-sm">{formatDate(orden.Fecha_de_vencimiento__c)}</p>
                  </div>
                )}
                {orden.Total__c && (
                  <div className="sm:col-span-2">
                    <p className="text-gray-600 text-xs font-semibold uppercase">Monto Total</p>
                    <p className="font-bold text-base sm:text-lg" style={{ color: '#006935' }}>{formatCurrency(orden.Total__c)}</p>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs sm:text-sm">
                    <i className="fas fa-project-diagram mr-2"></i>
                    <span className="font-medium">{orden.Proyecto__r?.Name || 'N/A'}</span>
                  </p>
                  {orden.Referencia__c && (
                    <p className="text-gray-600 text-xs mt-1">
                      <i className="fas fa-tag mr-2"></i>
                      Ref: {orden.Referencia__c}
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right text-xs text-gray-500">
                  <i className="fas fa-hand-pointer mr-1"></i>
                  Click para ver detalle
                </div>
              </div>
            </div>
          ))}
          </div>

          {/* Paginación */}
          {filteredAndSortedOrdenes.length > ordenesPerPage && onPageChange && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
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
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}

          {/* Información de resultados */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Mostrando {indexOfFirstOrden + 1} - {Math.min(indexOfLastOrden, filteredAndSortedOrdenes.length)} de {filteredAndSortedOrdenes.length} orden(es)
          </div>
        </>
      )}
    </div>
  );
}
