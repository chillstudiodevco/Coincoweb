"use client";

import { useState, useEffect } from 'react';
import supabaseClient from '@/lib/supabase/client';
import type { OrdenDeCompra, CuentaCobroDocumento } from '@/types/dashboard';

interface OrdenCompraDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordenId: string;
}
//cambio
export default function OrdenCompraDetailModal({ isOpen, onClose, ordenId }: OrdenCompraDetailModalProps) {
  const [orden, setOrden] = useState<OrdenDeCompra | null>(null);
  const [cuentaCobro, setCuentaCobro] = useState<CuentaCobroDocumento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  
  // Estados para el formulario de aprobación
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [nombreRecibe, setNombreRecibe] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [archivoCC, setArchivoCC] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Estados para aprobación de Director de Obra
  const [showDirectorApprovalForm, setShowDirectorApprovalForm] = useState(false);
  const [observacionesDirector, setObservacionesDirector] = useState('');
  const [approvingDirector, setApprovingDirector] = useState(false);

  const handleSubmitDirectorApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orden?.Id) return;

    try {
      setApprovingDirector(true);
      setError(null);

      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        setError('Sesión expirada');
        return;
      }

      console.log('[Modal] Aprobando requisición como Director:', {
        ordenId: orden.Id,
        observaciones: observacionesDirector,
      });

      // Llamar al endpoint PATCH /aprobar-director
      const response = await fetch(`/api/salesforce/ordenes-compra/${orden.Id}/aprobar-director`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          observaciones: observacionesDirector,
        }),
      });

      const result = await response.json();

      console.log('[Modal] Response Director:', { status: response.status, result });

      if (!response.ok || !result.success) {
        const errorMsg = result.error || result.details || 'Error al aprobar la requisición';
        console.error('[Modal] Error aprobando como Director:', errorMsg);
        setError(errorMsg);
        return;
      }

      // Actualizar el estado local de la orden
      setOrden(prev => prev ? {
        ...prev,
        Estado__c: 'Cotización en trámite',
      } : null);
      
      setShowDirectorApprovalForm(false);
      alert('✅ Requisición aprobada exitosamente. Se enviará a cotización.');
      
      // Recargar para obtener datos actualizados
      await fetchOrdenDetail();
    } catch (err) {
      console.error('Error approving as director:', err);
      setError('Error al aprobar la requisición');
    } finally {
      setApprovingDirector(false);
    }
  };

  const handleSubmitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orden?.Id || !archivoCC) return;

    // Validar campos requeridos
    if (!direccionEntrega.trim() || !nombreRecibe.trim() || !telefonoContacto.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    try {
      setApproving(true);
      setUploadingFile(true);
      setError(null);

      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        setError('Sesión expirada');
        return;
      }

      // Convertir archivo a base64
      const arrayBuffer = await archivoCC.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      console.log('[Modal] Aprobando orden:', {
        ordenId: orden.Id,
        fileName: archivoCC.name,
        base64Length: base64.length,
        direccionEntrega,
        nombreRecibe,
        telefonoContacto,
      });

      // Llamar al endpoint PATCH /aprobar
      const response = await fetch(`/api/salesforce/ordenes-compra/${orden.Id}/aprobar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cuentaCobroBase64: base64,
          cuentaCobroFileName: `[CUENTA DE COBRO] ${archivoCC.name}`,
          nombrePersonaRecibe: nombreRecibe,
          telefonoPersonaRecibe: telefonoContacto,
          direccionEntrega: direccionEntrega,
        }),
      });

      const result = await response.json();

      console.log('[Modal] Response:', { status: response.status, result });

      if (!response.ok || !result.success) {
        const errorMsg = result.error || result.details || 'Error al aprobar la orden';
        console.error('[Modal] Error aprobando:', errorMsg);
        setError(errorMsg);
        return;
      }

      setUploadingFile(false);

      // Actualizar el estado local de la orden
      setOrden(prev => prev ? {
        ...prev,
        Estado__c: 'Orden de compra en tramite',
        Direcci_n_de_entrega__c: direccionEntrega,
        Nombre_persona_que_recibe__c: nombreRecibe,
        Tel_fono_persona_que_recibe__c: telefonoContacto,
        Fecha_aprobacion_contratista__c: new Date().toISOString(),
      } : null);
      
      setShowApprovalForm(false);
      alert('✅ Cotización aprobada exitosamente. La orden está en trámite.');
      
      // Recargar para obtener el documento
      await fetchOrdenDetail();
    } catch (err) {
      console.error('Error approving orden:', err);
      setError('Error al aprobar la orden');
    } finally {
      setApproving(false);
      setUploadingFile(false);
    }
  };

  const fetchOrdenDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        setError('Sesión expirada');
        return;
      }

      const response = await fetch(
        `/api/salesforce/ordenes-compra?id=${ordenId}&includePartidas=true&includeDocumento=true`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError('Error al cargar el detalle de la orden');
        return;
      }

      setOrden(result.data?.orden || null);
      setCuentaCobro(result.data?.cuentaCobro || null);
    } catch (err) {
      console.error('Error fetching orden detail:', err);
      setError('Error al cargar la orden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ordenId) {
      fetchOrdenDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, ordenId]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-file-invoice text-white text-2xl"></i>
            <div>
              <h3 className="text-xl font-bold text-white">
                {loading ? 'Cargando...' : orden?.Name || 'Detalle de Orden'}
              </h3>
              {orden && (
                <p className="text-green-100 text-sm">
                  {orden.Proyecto__r?.Name || 'Sin proyecto'}
                </p>
              )}
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div 
                  className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"
                  style={{ borderTopColor: '#006935' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-file-invoice text-2xl" style={{ color: '#006935' }}></i>
                </div>
              </div>
              <p className="text-gray-600">Cargando detalle de la orden...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
              <p className="text-red-600 font-semibold">{error}</p>
              <button
                onClick={fetchOrdenDetail}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Reintentar
              </button>
            </div>
          ) : !orden ? (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-gray-400 text-5xl mb-4"></i>
              <p className="text-gray-600">No se encontró la orden</p>
            </div>
          ) : (
            <>
              {/* Información General */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Información General</h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(orden.Estado__c || '')}`}>
                        {orden.Estado__c || 'Sin estado'}
                      </span>
                    </div>
                  </div>
                  {orden.Total__c && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-3xl font-bold" style={{ color: '#006935' }}>
                        {formatCurrency(orden.Total__c)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Participante</p>
                    <p className="text-sm font-medium text-gray-800">{orden.Participante__r?.Name || 'N/A'}</p>
                  </div>
                  {orden.Proveedor__r && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Proveedor</p>
                      <p className="text-sm font-medium text-gray-800">{orden.Proveedor__r.Cuenta__r?.Name || 'N/A'}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Fecha</p>
                    <p className="text-sm font-medium text-gray-800">
                      {orden.Fecha__c ? formatDate(orden.Fecha__c) : 'N/A'}
                    </p>
                  </div>
                  {orden.Fecha_de_vencimiento__c && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Vencimiento</p>
                      <p className="text-sm font-medium text-gray-800">{formatDate(orden.Fecha_de_vencimiento__c)}</p>
                    </div>
                  )}
                  {orden.Referencia__c && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Referencia</p>
                      <p className="text-sm font-medium text-gray-800">{orden.Referencia__c}</p>
                    </div>
                  )}
                  {orden.Forma_de_pago__c && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Forma de Pago</p>
                      <p className="text-sm font-medium text-gray-800">{orden.Forma_de_pago__c}</p>
                    </div>
                  )}
                  {orden.Medio_de_pago__c && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Medio de Pago</p>
                      <p className="text-sm font-medium text-gray-800">{orden.Medio_de_pago__c}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalle */}
              {orden.Detalle__c && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h5 className="text-sm font-bold text-gray-700 mb-2">
                    <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                    Detalle
                  </h5>
                  <p className="text-gray-700">{orden.Detalle__c}</p>
                </div>
              )}

              {/* Observaciones */}
              {orden.Observaciones__c && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h5 className="text-sm font-bold text-gray-700 mb-2">
                    <i className="fas fa-sticky-note mr-2 text-yellow-600"></i>
                    Observaciones
                  </h5>
                  <p className="text-gray-700">{orden.Observaciones__c}</p>
                </div>
              )}

              {/* Formulario de Aprobación para Director de Obra - Estado: Requisición aprobada */}
              {/* Mostrar si la requisición está aprobada - El backend validará si el usuario es aprobador del proyecto */}
              {orden.Estado__c === 'Requisición aprobada' && (
                <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <i className="fas fa-user-check text-blue-600"></i>
                        Aprobación de Director de Obra
                      </h5>
                      <p className="text-sm text-gray-700 mb-4">
                        Como Director de Obra, revise la requisición y apruébela para que pase a cotización.
                      </p>
                    </div>
                  </div>

                  {!showDirectorApprovalForm ? (
                    <button
                      onClick={() => setShowDirectorApprovalForm(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-bold shadow-lg"
                    >
                      <i className="fas fa-check-circle"></i>
                      Aprobar Requisición
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitDirectorApproval} className="space-y-4">
                      <div className="bg-white rounded-lg p-5 border border-blue-200 space-y-4">
                        <h6 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <i className="fas fa-comment-alt text-blue-600"></i>
                          Observaciones (Opcional)
                        </h6>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Comentarios sobre la requisición
                          </label>
                          <textarea
                            value={observacionesDirector}
                            onChange={(e) => setObservacionesDirector(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: Aprobado según presupuesto del proyecto"
                            rows={4}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={approvingDirector}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {approvingDirector ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Aprobando...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check-double"></i>
                              Confirmar Aprobación
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDirectorApprovalForm(false);
                            setError(null);
                          }}
                          disabled={approvingDirector}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Formulario de Aprobación de Cotización - Solo cuando está pendiente */}
              {orden.Estado__c === 'Orden de compra para aprobación contratista' && !cuentaCobro && (
                <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <i className="fas fa-clipboard-check text-orange-600"></i>
                        Aprobación de Cotización
                      </h5>
                      <p className="text-sm text-gray-700 mb-4">
                        Revise la cotización en la tabla de items. Si está de acuerdo, complete los datos de entrega y cargue la cuenta de cobro para aprobar.
                      </p>
                    </div>
                  </div>

                  {!showApprovalForm ? (
                    <button
                      onClick={() => setShowApprovalForm(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all font-bold shadow-lg"
                    >
                      <i className="fas fa-check-circle"></i>
                      Aprobar Cotización y Cargar Cuenta de Cobro
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitApproval} className="space-y-4">
                      <div className="bg-white rounded-lg p-5 border border-orange-200 space-y-4">
                        <h6 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <i className="fas fa-map-marker-alt text-orange-600"></i>
                          Datos de Entrega
                        </h6>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Dirección de Entrega <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={direccionEntrega}
                            onChange={(e) => setDireccionEntrega(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Ej: Calle 123 #45-67, Bogotá"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nombre de Quien Recibe <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={nombreRecibe}
                              onChange={(e) => setNombreRecibe(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Ej: Juan Pérez"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Teléfono de Contacto <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="tel"
                              value={telefonoContacto}
                              onChange={(e) => setTelefonoContacto(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Ej: 3001234567"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Cuenta de Cobro (PDF) <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setArchivoCC(e.target.files?.[0] || null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                            required
                          />
                          {archivoCC && (
                            <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                              <i className="fas fa-file-pdf text-red-500"></i>
                              {archivoCC.name} ({(archivoCC.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={approving || !archivoCC}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {approving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              {uploadingFile ? 'Subiendo archivo...' : 'Aprobando...'}
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check-double"></i>
                              Aprobar y Enviar
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowApprovalForm(false);
                            setError(null);
                          }}
                          disabled={approving}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Cuenta de Cobro ya aprobada - Mostrar cuando existe el documento */}
              {cuentaCobro && (
                <div className="bg-green-50 rounded-lg p-6 border-2 border-green-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <i className="fas fa-file-invoice-dollar text-green-600"></i>
                        Cuenta de Cobro
                      </h5>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full font-semibold">
                          <i className="fas fa-check-circle"></i>
                          Cotización aprobada
                        </span>
                      </div>
                      
                      {/* Información del archivo */}
                      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Archivo</p>
                            <p className="text-gray-800 font-medium flex items-center gap-2">
                              <i className="fas fa-file-pdf text-red-500"></i>
                              {cuentaCobro.fileName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Tamaño</p>
                            <p className="text-gray-800 font-medium">
                              {(cuentaCobro.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Fecha de subida</p>
                            <p className="text-gray-800 font-medium">
                              {new Date(cuentaCobro.createdDate).toLocaleDateString('es-CO')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Datos de entrega */}
                      {(orden.Direcci_n_de_entrega__c || orden.Nombre_persona_que_recibe__c || orden.Tel_fono_persona_que_recibe__c) && (
                        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-300">
                          <h6 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <i className="fas fa-shipping-fast text-green-600"></i>
                            Datos de Entrega
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            {orden.Direcci_n_de_entrega__c && (
                              <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Dirección</p>
                                <p className="text-gray-800">{orden.Direcci_n_de_entrega__c}</p>
                              </div>
                            )}
                            {orden.Nombre_persona_que_recibe__c && (
                              <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Recibe</p>
                                <p className="text-gray-800">{orden.Nombre_persona_que_recibe__c}</p>
                              </div>
                            )}
                            {orden.Tel_fono_persona_que_recibe__c && (
                              <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Teléfono</p>
                                <p className="text-gray-800">{orden.Tel_fono_persona_que_recibe__c}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <a
                          href={cuentaCobro.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                        >
                          <i className="fas fa-download"></i>
                          Descargar Documento
                        </a>
                        <a
                          href={cuentaCobro.viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          <i className="fas fa-eye"></i>
                          Vista Previa
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Partidas/Items */}
              {orden.Partidas_de_ordenes_de_compra__r?.records && orden.Partidas_de_ordenes_de_compra__r.records.length > 0 ? (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-list text-green-600"></i>
                    Items de la Orden ({orden.Partidas_de_ordenes_de_compra__r.records.length})
                  </h4>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Descripción</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Cantidad</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Unidad</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Valor Unit.</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Impuestos</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Descuentos</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orden.Partidas_de_ordenes_de_compra__r.records.map((partida) => {
                          const subtotal = partida.Valor_total__c || 0;
                          const porcentajeImpuestos = partida.Impuestos__c || 0;
                          const porcentajeDescuentos = partida.Descuentos__c || 0;
                          
                          // Calcular valores en moneda basados en porcentajes
                          const valorImpuestos = subtotal * (porcentajeImpuestos / 100);
                          const valorDescuentos = subtotal * (porcentajeDescuentos / 100);
                          const total = subtotal + valorImpuestos - valorDescuentos;
                          
                          return (
                            <tr key={partida.Id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {partida.N_mero_de_item__c}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {partida.Descripci_n__c}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-gray-900 font-medium">
                                {partida.Cantidad__c}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-gray-600">
                                {partida.Unidad_de_medida__c}
                              </td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">
                                {partida.Valor_unitario__c ? formatCurrency(partida.Valor_unitario__c) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">
                                {subtotal ? formatCurrency(subtotal) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right text-green-700">
                                {porcentajeImpuestos > 0 ? (
                                  <div>
                                    <div className="font-semibold">{porcentajeImpuestos}%</div>
                                    <div className="text-xs">+{formatCurrency(valorImpuestos)}</div>
                                  </div>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right text-red-700">
                                {porcentajeDescuentos > 0 ? (
                                  <div>
                                    <div className="font-semibold">{porcentajeDescuentos}%</div>
                                    <div className="text-xs">-{formatCurrency(valorDescuentos)}</div>
                                  </div>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                                {formatCurrency(total)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <i className="fas fa-box-open text-gray-400 text-4xl mb-3"></i>
                  <p className="text-gray-600">No hay items en esta orden</p>
                </div>
              )}

              {/* Totales */}
              {(orden.Total__c || orden.Total_abonado__c) && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-semibold">Total:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {orden.Total__c ? formatCurrency(orden.Total__c) : '-'}
                    </span>
                  </div>
                  {orden.Total_abonado__c && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-green-700 font-semibold">Abonado:</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(orden.Total_abonado__c)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                        <span className="text-gray-700 font-bold">Saldo Pendiente:</span>
                        <span className="text-xl font-bold" style={{ color: '#006935' }}>
                          {formatCurrency((orden.Total__c || 0) - orden.Total_abonado__c)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          {orden?.Estado__c === 'Orden de compra para aprobación contratista' && (
            <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100 px-4 py-2 rounded-lg">
              <i className="fas fa-clock"></i>
              <span className="font-semibold">Pendiente de aprobación</span>
            </div>
          )}
          <div className="flex gap-3 ml-auto">
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
    </div>
  );
}
