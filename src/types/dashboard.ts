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

export interface OrdenDeCompraCreatePayload {
  Fecha__c?: string;
  Detalle__c?: string;
  Total__c: number;
  Estado__c?: string;
  Participante__c: string; // Required
}

export interface OrdenDeCompraUpdatePayload {
  Id: string; // Required for update
  Fecha__c?: string;
  Detalle__c?: string;
  Total__c?: number;
  Estado__c?: string;
}
