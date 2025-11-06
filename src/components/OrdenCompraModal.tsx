"use client";

import { useState } from 'react';
import type { ItemOrdenCompra, UnidadMedida } from '@/types/dashboard';

interface OrdenCompraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrdenCompraFormData) => void;
  proveedores: Array<{ id: string; nombre: string }>;
}

export interface OrdenCompraFormData {
  proveedorId: string;
  items: ItemOrdenCompra[];
  observaciones?: string;
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

export default function OrdenCompraModal({ isOpen, onClose, onSubmit, proveedores }: OrdenCompraModalProps) {
  const [proveedorId, setProveedorId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<ItemOrdenCompra[]>([
    {
      id: crypto.randomUUID(),
      descripcion: '',
      unidadMedida: 'unid',
      cantidad: 1,
    },
  ]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!proveedorId) {
      alert('Debe seleccionar un proveedor');
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
      items: itemsValidos,
      observaciones: observaciones.trim() || undefined,
    });

    // Reset form
    setProveedorId('');
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
    // Reset form al cerrar
    setProveedorId('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Nueva Orden de Compra</h3>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            
            {/* Proveedor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Proveedor <span className="text-red-500">*</span>
              </label>
              <select
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Seleccione un proveedor</option>
                {proveedores.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </option>
                ))}
              </select>
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

                    {/* Botón eliminar (solo si hay más de 1) */}
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

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
                      {/* Descripción */}
                      <div className="md:col-span-6">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Descripción
                        </label>
                        <input
                          type="text"
                          value={item.descripcion}
                          onChange={(e) => actualizarItem(item.id, 'descripcion', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ej: Cemento gris, Varilla corrugada..."
                          required
                        />
                      </div>

                      {/* Unidad de Medida */}
                      <div className="md:col-span-3">
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
                      <div className="md:col-span-3">
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
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
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
