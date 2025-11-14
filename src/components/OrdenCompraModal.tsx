"use client";

import { useState } from 'react';
import type { ItemOrdenCompra, UnidadMedida, FormaPago, MedioPago } from '@/types/dashboard';

interface OrdenCompraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrdenCompraFormData) => void;
  proveedores: Array<{ id: string; nombre: string }>;
  proyectos: Array<{ id: string; nombre: string }>;
  onProyectoChange?: (proyectoId: string) => void;
}

export interface OrdenCompraFormData {
  proveedorId: string;
  proyectoId: string;
  fechaVencimiento?: string;
  formaPago?: FormaPago;
  medioPago?: MedioPago;
  detalle?: string;
  observaciones?: string;
  referencia?: string;
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

const FORMAS_PAGO: FormaPago[] = ['Crédito', 'Contado', 'Anticipo'];

const MEDIOS_PAGO: MedioPago[] = [
  '(31) Transferencia Débito',
  '(32) Transferencia Crédito',
  '(33) Cheque',
  '(34) Efectivo',
];

export default function OrdenCompraModal({ isOpen, onClose, onSubmit, proveedores, proyectos, onProyectoChange }: OrdenCompraModalProps) {
  const [proveedorId, setProveedorId] = useState('');
  const [proyectoId, setProyectoId] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [formaPago, setFormaPago] = useState<FormaPago>('Crédito');
  const [medioPago, setMedioPago] = useState<MedioPago>('(31) Transferencia Débito');
  const [detalle, setDetalle] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [referencia, setReferencia] = useState('');
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
      fechaVencimiento: fechaVencimiento || undefined,
      formaPago,
      medioPago,
      detalle: detalle.trim() || undefined,
      observaciones: observaciones.trim() || undefined,
      referencia: referencia.trim() || undefined,
      items: itemsValidos,
    });

    // Reset form
    setProveedorId('');
    setProyectoId('');
    setFechaVencimiento('');
    setFormaPago('Crédito');
    setMedioPago('(31) Transferencia Débito');
    setDetalle('');
    setObservaciones('');
    setReferencia('');
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
    setProyectoId('');
    setFechaVencimiento('');
    setFormaPago('Crédito');
    setMedioPago('(31) Transferencia Débito');
    setDetalle('');
    setObservaciones('');
    setReferencia('');
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
                  setProveedorId(''); // Resetear proveedor cuando cambia el proyecto
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

            {/* Fila con 3 campos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Fecha de Vencimiento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Forma de Pago */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Forma de Pago
                </label>
                <select
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value as FormaPago)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {FORMAS_PAGO.map((forma) => (
                    <option key={forma} value={forma}>
                      {forma}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medio de Pago */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medio de Pago
                </label>
                <select
                  value={medioPago}
                  onChange={(e) => setMedioPago(e.target.value as MedioPago)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {MEDIOS_PAGO.map((medio) => (
                    <option key={medio} value={medio}>
                      {medio}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detalle y Referencia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Referencia */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Referencia
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ej: REF-2025-001"
                />
              </div>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 mt-2">
                      {/* Descripción */}
                      <div className="sm:col-span-2 lg:col-span-6">
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
