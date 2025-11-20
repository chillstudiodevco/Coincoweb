"use client";

import { useState, useEffect } from 'react';
import supabaseClient from '@/lib/supabase/client';
import type { OrdenDeCompra } from '@/types/dashboard';

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

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onOrdenClick: (ordenId: string) => void;
  onGoToOrders: () => void;
  accountId?: string;
}

export default function ProjectDetailModal({ 
  isOpen, 
  onClose, 
  project,
  onOrdenClick,
  onGoToOrders,
  accountId
}: ProjectDetailModalProps) {
  const [ordenes, setOrdenes] = useState<OrdenDeCompra[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjectOrders = async () => {
    if (!project?.Id || !accountId) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) return;

      // Obtener órdenes del proyecto específico
      const response = await fetch(
        `/api/salesforce/ordenes-compra?accountId=${accountId}&proyectoId=${project.Id}&limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setOrdenes(result.data?.ordenes || []);
      }
    } catch (error) {
      console.error('Error loading project orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && project?.Id && accountId) {
      fetchProjectOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, project?.Id, accountId]);

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

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Requisición generada': 'bg-blue-100 text-blue-800',
      'Requisición aprobada': 'bg-green-100 text-green-800',
      'Cotización en trámite': 'bg-yellow-100 text-yellow-800',
      'Orden de compra para aprobación contratista': 'bg-orange-100 text-orange-800',
      'Orden de compra en tramite': 'bg-purple-100 text-purple-800',
      'Orden de compra tramitada': 'bg-indigo-100 text-indigo-800',
      'Remisión': 'bg-cyan-100 text-cyan-800',
      'Facturado': 'bg-green-100 text-green-800',
      'Pago programado': 'bg-teal-100 text-teal-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const stripHtml = (s: string | null | undefined) => {
    if (!s) return '';
    return s.replace(/<[^>]*>/g, '').trim();
  };

  const handleOrdenClick = (ordenId: string | undefined) => {
    if (!ordenId) return;
    onOrdenClick(ordenId);
    onClose();
  };

  if (!isOpen || !project) return null;

  const myParticipations = project.participants?.filter(p => p.Cuenta__c === accountId) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-project-diagram text-white text-2xl"></i>
            <div>
              <h3 className="text-xl font-bold text-white">
                {project.Name || 'Detalle del Proyecto'}
              </h3>
              <p className="text-green-100 text-sm">
                {project.Objeto_del_contrato__c || 'Sin descripción'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Información del Proyecto */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-info-circle text-green-600"></i>
              Información del Proyecto
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Nombre del Proyecto</p>
                <p className="text-sm font-medium text-gray-800">{project.Name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Valor de Mi Contrato</p>
                <p className="text-lg font-bold" style={{ color: '#006935' }}>
                  {myParticipations.length > 0 && myParticipations[0].Valor_contrato__c 
                    ? formatCurrency(myParticipations[0].Valor_contrato__c) 
                    : '-'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-600 font-semibold uppercase">Objeto del Contrato</p>
                <p className="text-sm text-gray-700">{project.Objeto_del_contrato__c || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Mis Participaciones */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-user-check text-green-600"></i>
              Mis Participaciones ({myParticipations.length})
            </h4>
            {myParticipations.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <i className="fas fa-user-slash text-gray-400 text-4xl mb-3"></i>
                <p className="text-gray-600">No tienes participaciones registradas en este proyecto</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myParticipations.map((par) => (
                  <div key={par.Id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-green-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-bold text-gray-800">{par.Name || 'Sin nombre'}</h5>
                          {par.Tipo_de_tercero__c && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                              {par.Tipo_de_tercero__c}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{stripHtml(par.Descripci_n_del_servicio__c || '')}</p>
                        {par.CuentaName && (
                          <p className="text-xs text-gray-500 mt-1">
                            <i className="fas fa-building mr-1"></i>
                            {par.CuentaName}
                          </p>
                        )}
                      </div>
                      {par.Valor_contrato__c && (
                        <div className="text-right">
                          <p className="text-xs text-gray-600 font-semibold uppercase">Valor</p>
                          <p className="text-lg font-bold" style={{ color: '#006935' }}>
                            {formatCurrency(par.Valor_contrato__c)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Órdenes de Compra */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-shopping-cart text-green-600"></i>
                Órdenes de Compra del Proyecto ({ordenes.length})
              </h4>
              <button
                onClick={onGoToOrders}
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
              >
                Ver todas las órdenes
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 mx-auto mb-4"
                  style={{ borderTopColor: '#006935' }}
                ></div>
                <p className="text-gray-600">Cargando órdenes...</p>
              </div>
            ) : ordenes.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-3"></i>
                <p className="text-gray-600">No hay órdenes de compra para este proyecto</p>
              </div>
            ) : (
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {ordenes.map((orden) => (
                  <div
                    key={orden.Id}
                    onClick={() => handleOrdenClick(orden.Id)}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-bold text-gray-800">{orden.Name || 'Sin número'}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orden.Estado__c || '')}`}>
                            {orden.Estado__c || 'Sin estado'}
                          </span>
                        </div>
                        {orden.Proveedor__r?.Cuenta__r?.Name && (
                          <p className="text-xs text-gray-600">
                            <i className="fas fa-store mr-1"></i>
                            {orden.Proveedor__r.Cuenta__r.Name}
                          </p>
                        )}
                      </div>
                      {orden.Total__c && (
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: '#006935' }}>
                            {formatCurrency(orden.Total__c)}
                          </p>
                          {orden.Fecha__c && (
                            <p className="text-xs text-gray-500">{formatDate(orden.Fecha__c)}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        <i className="fas fa-calendar mr-1"></i>
                        {orden.Fecha__c ? formatDate(orden.Fecha__c) : 'Sin fecha'}
                      </span>
                      <span className="text-green-600 hover:text-green-700">
                        Click para ver detalle
                        <i className="fas fa-arrow-right ml-1"></i>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <i className="fas fa-times mr-2"></i>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
