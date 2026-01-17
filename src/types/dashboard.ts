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

// Documento de Cuenta de Cobro adjunto a una orden
export interface CuentaCobroDocumento {
  fileName: string;
  contentDocumentId: string;
  contentVersionId: string;
  fileExtension: string;
  fileSize: number;
  createdDate: string;
  downloadUrl: string;
  viewUrl: string;
}

// Partida de una orden de compra (respuesta de Salesforce)
export interface PartidaSalesforce {
  Id?: string;
  N_mero_de_item__c?: number;
  Descripci_n__c?: string;
  Cantidad__c?: number;
  Unidad_de_medida__c?: UnidadMedida;
  Orden_de_compra__c?: string;
  Valor_unitario__c?: number;
  Valor_total__c?: number;
  Impuestos__c?: number;
  Descuentos__c?: number;
}

// Orden de Compra de Salesforce (respuesta completa)
export interface OrdenDeCompra {
  Id?: string;
  Name?: string;
  Participante__c?: string;
  Proveedor__c?: string;
  Proyecto__c?: string;
  Fecha__c?: string;
  Fecha_de_vencimiento__c?: string;
  Estado__c?: string;
  Forma_de_pago__c?: string;
  Medio_de_pago__c?: string;
  Detalle__c?: string;
  Observaciones__c?: string;
  Referencia__c?: string;
  Total__c?: number;
  Participante__r?: {
    Id?: string;
    Name?: string;
    Cuenta__r?: {
      Name?: string;
    };
    Descripci_n_del_servicio__c?: string;
    Aprobardor_de_ordenes__c?: boolean;
    Tipo_de_tercero__c?: string;
  };

  Proveedor__r?: {
    Id?: string;
    Name?: string;
    Cuenta__c?: string;
    Cuenta__r?: {
      Id?: string;
      Name?: string;
    };
  };
  Proyecto__r?: {
    Id?: string;
    Name?: string;
    Objeto_del_contrato__c?: string;
    Participantes__r?: {
      totalSize?: number;
      done?: boolean;
      records?: Array<{
        Id?: string;
        Name?: string;
        Cuenta__c?: string;
        Aprobardor_de_ordenes__c?: boolean;
        Tipo_de_tercero__c?: string;
      }>;
    };
  };
  Total_abonado__c?: number;
  Direcci_n_de_entrega__c?: string;
  Nombre_persona_que_recibe__c?: string;
  Tel_fono_persona_que_recibe__c?: string;
  Fecha_aprobacion_contratista__c?: string;
  partidas?: PartidaSalesforce[]; // Solo viene si includePartidas=true
  Partidas_de_ordenes_de_compra__r?: {
    totalSize?: number;
    done?: boolean;
    records?: PartidaSalesforce[];
  }; // Relación desde Salesforce con estructura de query
}

export interface OrdenDeCompraUpdatePayload {
  Id: string; // Required for update
  Fecha__c?: string;
  Detalle__c?: string;
  Total__c?: number;
  Estado__c?: string;
  Direcci_n_de_entrega__c?: string;
  Nombre_persona_que_recibe__c?: string;
  Tel_fono_persona_que_recibe__c?: string;
}

// Payload para aprobar orden de compra
export interface AprobarOrdenPayload {
  cuentaCobroBase64: string;
  cuentaCobroFileName: string;
  nombrePersonaRecibe?: string;
  telefonoPersonaRecibe?: string;
  direccionEntrega?: string;
}
export type UnidadMedida = 'm' | 'm2' | 'm3' | 'unid' | 'kg' | 'caja' | 'lb' | 'L' | 'gal' | 'cuñete';

// Forma de pago
export type FormaPago = 'Crédito' | 'Contado' | 'Anticipo';

// Medio de pago
export type MedioPago = 
  | '(31) Transferencia Débito'
  | '(32) Transferencia Crédito'
  | '(33) Cheque'
  | '(34) Efectivo';

// Partida de una orden de compra (para enviar a Salesforce)
export interface PartidaOrdenCompra {
  N_mero_de_item__c: number;
  Descripci_n__c: string;
  Cantidad__c: number;
  Unidad_de_medida__c: UnidadMedida;
}

// Item/Partida de una orden de compra (para manejo en el frontend)
export interface ItemOrdenCompra {
  id: string; // ID temporal para manejo en el frontend
  descripcion: string;
  unidadMedida: UnidadMedida;
  cantidad: number;
  precioUnitario?: number; // Opcional, puede calcularse después
  subtotal?: number; // Opcional, puede calcularse después
}

// Payload para crear orden de compra
export interface OrdenDeCompraCreatePayload {
  orden: {
    Participante__c: string;
    Proveedor__c: string;
    Proyecto__c: string;
    Fecha__c: string; // YYYY-MM-DD
    Fecha_de_vencimiento__c?: string; // YYYY-MM-DD
    Estado__c?: string;
    Forma_de_pago__c?: FormaPago;
    Medio_de_pago__c?: MedioPago;
    Detalle__c?: string;
    Observaciones__c?: string;
    Referencia__c?: string;
  };
  partidas: PartidaOrdenCompra[];
}
