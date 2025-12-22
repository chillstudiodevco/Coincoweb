"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import supabaseClient from '@/lib/supabase/client';
import type { ItemOrdenCompra, UnidadMedida } from '@/types/dashboard';

interface OrdenCompraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrdenCompraFormData) => void;
  proveedores: Array<{ id: string; nombre: string }>;
  proyectos: Array<{ id: string; nombre: string }>;
  onProyectoChange?: (proyectoId: string) => void;
}

interface ItemSuggestion {
  Id: string;
  Descripci_n__c: string;
}

export interface OrdenCompraFormData {
  proveedorId: string;
  proyectoId: string;
  detalle?: string;
  observaciones?: string;
  items: ItemOrdenCompra[];
}

const UNIDADES_MEDIDA: { value: UnidadMedida; label: string }[] = [
  { value: 'm', label: 'Metro (m)' },
  { value: 'm2', label: 'Metro cuadrado (m²)' },
  { value: 'm3', label: 'Metro cúbico (m³)' },
  { value: 'unid', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'caja', label: 'Caja' },
  { value: 'lb', label: 'Libra (lb)' },
  { value: 'L', label: 'Litro (L)' },
  { value: 'gal', label: 'Galón (gal)' },
  { value: 'cuñete', label: 'Cuñete' },
];

export default function OrdenCompraModal({ isOpen, onClose, onSubmit, proveedores, proyectos, onProyectoChange }: OrdenCompraModalProps) {
  const [proveedorId, setProveedorId] = useState('');
  const [proyectoId, setProyectoId] = useState('');
  const [detalle, setDetalle] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<ItemOrdenCompra[]>([
    {
      id: crypto.randomUUID(),
      descripcion: '',
      unidadMedida: 'unid',
      cantidad: 1,
    },
  ]);

  // Estados para autocomplete
  const [suggestions, setSuggestions] = useState<ItemSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const agregarItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        descripcion: '',
        unidadMedida: 'unid',
        cantidad: 1,
      },
    ]);
  };

  const eliminarItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const actualizarItem = (id: string, campo: keyof ItemOrdenCompra, valor: string | number) => {
    setItems(
      items.map(item =>
        item.id === id
          ? { ...item, [campo]: valor }
          : item
      )
    );
  };

  // Función para buscar items con debounce
  const searchItems = useCallback(async (term: string, itemId: string) => {
    if (term.length < 2) {
      setSuggestions([]);
      setShowSuggestions(null);
      return;
    }

    setLoadingSuggestions(true);
    setShowSuggestions(itemId);

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        console.error('No hay sesión activa');
        return;
      }

      const response = await fetch(
        `/api/salesforce/ordenes-compra?searchItems=${encodeURIComponent(term)}&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuggestions(result.items || []);
        console.log('✅ [Autocomplete] Sugerencias guardadas:', result.items?.length || 0);
      } else {
        console.error('❌ [Autocomplete] Error al buscar items:', result);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error inesperado al buscar items:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Handler para cambio en descripción con debounce
  const handleDescripcionChange = useCallback((itemId: string, value: string) => {
    // Actualizar el valor inmediatamente
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, descripcion: value }
          : item
      )
    );

    // Cancelar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Nuevo timer con debounce de 300ms
    debounceTimer.current = setTimeout(() => {
      searchItems(value, itemId);
    }, 300);
  }, [searchItems]);

  // Seleccionar sugerencia
  const selectSuggestion = (itemId: string, descripcion: string) => {
    actualizarItem(itemId, 'descripcion', descripcion);
    setSuggestions([]);
    setShowSuggestions(null);
  };

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(null);
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!proveedorId) {
      alert('Debe seleccionar un proveedor');
      return;
    }

    if (!proyectoId) {
      alert('Debe seleccionar un proyecto');
      return;
    }

    const itemsValidos = items.filter(
      item => item.descripcion.trim() && item.cantidad > 0
    );

    if (itemsValidos.length === 0) {
      alert('Debe agregar al menos un item válido');
      return;
    }

    onSubmit({
      proveedorId,
      proyectoId,
      detalle: detalle.trim() || undefined,
      observaciones: observaciones.trim() || undefined,
      items: itemsValidos,
    });

    // Reset form
    setProveedorId('');
    setProyectoId('');
    setDetalle('');
    setObservaciones('');
    setItems([
      {
        id: crypto.randomUUID(),
        descripcion: '',
        unidadMedida: 'unid',
        cantidad: 1,
      },
    ]);
  };

  const handleClose = () => {
    setProveedorId('');
    setProyectoId('');
    setDetalle('');
    setObservaciones('');
    setItems([
      {
        id: crypto.randomUUID(),
        descripcion: '',
        unidadMedida: 'unid',
        cantidad: 1,
      },
    ]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-white">Nueva Orden de Compra</h3>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <i className="fas fa-times text-lg sm:text-xl"></i>
          </button>
        </div>

        {/* Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            
            {/* Proyecto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Proyecto <span className="text-red-500">*</span>
              </label>
              <select
                value={proyectoId}
                onChange={(e) => {
                  setProyectoId(e.target.value);
                  onProyectoChange?.(e.target.value);
                  setProveedorId('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                style={{ maxHeight: '200px' }}
                required
              >
                <option value="">Seleccione un proyecto</option>
                {proyectos.map((proyecto) => (
                  <option 
                    key={proyecto.id} 
                    value={proyecto.id}
                    title={proyecto.nombre}
                    className="py-2"
                  >
                    {proyecto.nombre.length > 80 ? proyecto.nombre.substring(0, 80) + '...' : proyecto.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Proveedor <span className="text-red-500">*</span>
              </label>
              <select
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={!proyectoId}
              >
                <option value="">{!proyectoId ? 'Primero seleccione un proyecto' : 'Seleccione un proveedor'}</option>
                {proveedores.map((proveedor) => (
                  <option 
                    key={proveedor.id} 
                    value={proveedor.id}
                    title={proveedor.nombre}
                  >
                    {proveedor.nombre.length > 80 ? proveedor.nombre.substring(0, 80) + '...' : proveedor.nombre}
                  </option>
                ))}
              </select>
              {!proyectoId && (
                <p className="text-xs text-gray-500 mt-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  Seleccione un proyecto para ver los proveedores disponibles
                </p>
              )}
            </div>

            {/* Detalle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Detalle
              </label>
              <input
                type="text"
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Compra de materiales para construcción"
              />
            </div>

            {/* Items / Partidas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Items / Partidas <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={agregarItem}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                >
                  <i className="fas fa-plus-circle"></i>
                  Agregar Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative"
                  >
                    {/* Número del item */}
                    <div className="absolute -top-3 -left-3 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>

                    {/* Botón eliminar */}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarItem(item.id)}
                        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                        title="Eliminar item"
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 mt-2">
                      {/* Descripción con Autocomplete */}
                      <div className="sm:col-span-2 lg:col-span-6 relative">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Descripción
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={item.descripcion}
                            onChange={(e) => handleDescripcionChange(item.id, e.target.value)}
                            onFocus={() => {
                              if (item.descripcion.length >= 2 && suggestions.length > 0) {
                                setShowSuggestions(item.id);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Ej: Cemento gris, Varilla corrugada..."
                            required
                            autoComplete="off"
                          />
                          {loadingSuggestions && showSuggestions === item.id && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <i className="fas fa-spinner fa-spin text-gray-400 text-sm"></i>
                            </div>
                          )}
                        </div>

                        {/* Dropdown de Sugerencias */}
                        {showSuggestions === item.id && suggestions.length > 0 && (
                          <div 
                            ref={suggestionsRef}
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          >
                            {suggestions.map((suggestion) => (
                              <button
                                key={suggestion.Id}
                                type="button"
                                onClick={() => selectSuggestion(item.id, suggestion.Descripci_n__c)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 hover:text-green-700 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-2"
                              >
                                <i className="fas fa-box text-green-600 mt-1 text-xs"></i>
                                <span className="flex-1">{suggestion.Descripci_n__c}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Unidad de Medida */}
                      <div className="lg:col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Unidad
                        </label>
                        <select
                          value={item.unidadMedida}
                          onChange={(e) =>
                            actualizarItem(item.id, 'unidadMedida', e.target.value as UnidadMedida)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {UNIDADES_MEDIDA.map((unidad) => (
                            <option key={unidad.value} value={unidad.value}>
                              {unidad.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Cantidad */}
                      <div className="lg:col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) =>
                            actualizarItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)
                          }
                          min="0.01"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Información adicional sobre la orden..."
              />
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <i className="fas fa-check"></i>
              Crear Orden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
