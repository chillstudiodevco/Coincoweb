/**
 * Tipos usados por el dashboard de proveedor
 */

export interface Requisition {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  project: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  items: string[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryDate: string;
  project: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  description: string;
}

// Orden de Compra de Salesforce
export interface OrdenDeCompra {
  Id?: string;
  Fecha__c?: string;
  Detalle__c?: string;
  Total__c?: number;
  Estado__c?: string;
  Participante__c?: string;
  Participante__r?: {
    Name?: string;
  };
}

// Unidades de medida disponibles
export type UnidadMedida = 'm' | 'm2' | 'm3' | 'unid' | 'kg' | 'caja' | 'lb' | 'L' | 'gal' | 'cuñete';

// Item/Partida de una orden de compra
export interface ItemOrdenCompra {
  id: string; // ID temporal para manejo en el frontend
  descripcion: string;
  unidadMedida: UnidadMedida;
  cantidad: number;
  precioUnitario?: number; // Opcional, puede calcularse después
  subtotal?: number; // Opcional, puede calcularse después
}

export interface OrdenDeCompraCreatePayload {
  Fecha__c?: string;
  Detalle__c?: string; // JSON stringificado de los items
  Total__c: number;
  Estado__c?: string;
  Participante__c: string; // Required - ID del proveedor
}

export interface OrdenDeCompraUpdatePayload {
  Id: string; // Required for update
  Fecha__c?: string;
  Detalle__c?: string;
  Total__c?: number;
  Estado__c?: string;
}
