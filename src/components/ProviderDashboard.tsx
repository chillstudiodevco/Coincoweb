'use client';

import { useState } from 'react';

interface Requisition {
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

interface PurchaseOrder {
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

interface Invoice {
  id: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  description: string;
}

export default function ProviderDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showNewRequisitionModal, setShowNewRequisitionModal] = useState(false);
  const [newRequisition, setNewRequisition] = useState({
    title: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    project: ''
  });

  // Datos simulados
  const requisitions: Requisition[] = [
    {
      id: 'REQ-001',
      title: 'Cemento Portland Tipo I',
      description: 'Cemento Portland Tipo I para fundación del edificio',
      quantity: 100,
      unitPrice: 25000,
      totalPrice: 2500000,
      status: 'approved',
      createdAt: '2025-01-10',
      project: 'Edificio Residencial Los Cedros'
    },
    {
      id: 'REQ-002',
      title: 'Varillas de Acero #4',
      description: 'Varillas de acero corrugado calibre #4 para refuerzo estructural',
      quantity: 200,
      unitPrice: 35000,
      totalPrice: 7000000,
      status: 'pending',
      createdAt: '2025-01-12',
      project: 'Centro Comercial Plaza Norte'
    },
    {
      id: 'REQ-003',
      title: 'Bloques de Concreto',
      description: 'Bloques de concreto 15x20x40 cm para mampostería',
      quantity: 500,
      unitPrice: 4500,
      totalPrice: 2250000,
      status: 'rejected',
      createdAt: '2025-01-08',
      project: 'Vivienda Unifamiliar San José'
    }
  ];

  const purchaseOrders: PurchaseOrder[] = [
    {
      id: 'PO-001',
      orderNumber: 'OC-2025-001',
      supplier: 'Cementos del Caribe S.A.',
      items: ['Cemento Portland Tipo I', 'Arena lavada', 'Grava triturada'],
      totalAmount: 8500000,
      status: 'approved',
      createdAt: '2025-01-11',
      deliveryDate: '2025-01-20',
      project: 'Edificio Residencial Los Cedros'
    },
    {
      id: 'PO-002',
      orderNumber: 'OC-2025-002',
      supplier: 'Aceros Bogotá Ltda.',
      items: ['Varillas de Acero #4', 'Malla electrosoldada', 'Alambre galvanizado'],
      totalAmount: 12300000,
      status: 'pending',
      createdAt: '2025-01-13',
      deliveryDate: '2025-01-25',
      project: 'Centro Comercial Plaza Norte'
    },
    {
      id: 'PO-003',
      orderNumber: 'OC-2025-003',
      supplier: 'Ladrillos y Bloques del Valle',
      items: ['Bloques de concreto', 'Ladrillos cerámicos', 'Mortero premezclado'],
      totalAmount: 5600000,
      status: 'delivered',
      createdAt: '2025-01-05',
      deliveryDate: '2025-01-15',
      project: 'Vivienda Unifamiliar San José'
    }
  ];

  const invoices: Invoice[] = [
    {
      id: 'INV-001',
      invoiceNumber: 'FC-2025-001',
      purchaseOrderId: 'PO-003',
      amount: 5600000,
      status: 'paid',
      dueDate: '2025-02-15',
      createdAt: '2025-01-15',
      description: 'Factura por entrega de materiales de construcción'
    },
    {
      id: 'INV-002',
      invoiceNumber: 'FC-2025-002',
      purchaseOrderId: 'PO-001',
      amount: 8500000,
      status: 'pending',
      dueDate: '2025-02-20',
      createdAt: '2025-01-20',
      description: 'Factura por cemento y agregados'
    },
    {
      id: 'INV-003',
      invoiceNumber: 'FC-2025-003',
      purchaseOrderId: 'PO-002',
      amount: 12300000,
      status: 'overdue',
      dueDate: '2025-01-25',
      createdAt: '2025-01-10',
      description: 'Factura por materiales de acero'
    }
  ];

  const handleNewRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría la requisición
    console.log('Nueva requisición:', newRequisition);
    setShowNewRequisitionModal(false);
    setNewRequisition({ title: '', description: '', quantity: 1, unitPrice: 0, project: '' });
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      case 'paid': return 'Pagado';
      case 'overdue': return 'Vencido';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
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

  const handleLogout = () => {
    // En un proyecto real, aquí se limpiaría la sesión
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Dashboard */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: '#006935'}}>
                <i className="fas fa-user-shield text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Portal de Proveedores</h1>
                <p className="text-gray-600">Bienvenido, Construcciones ABC S.A.S.</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 cursor-pointer"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 flex items-center cursor-pointer ${
                    activeSection === 'dashboard' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeSection === 'dashboard' ? {backgroundColor: '#006935'} : {}}
                >
                  <i className="fas fa-tachometer-alt mr-3"></i>
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveSection('requisitions')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 flex items-center cursor-pointer ${
                    activeSection === 'requisitions' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeSection === 'requisitions' ? {backgroundColor: '#006935'} : {}}
                >
                  <i className="fas fa-clipboard-list mr-3"></i>
                  Requisiciones
                </button>
                <button
                  onClick={() => setActiveSection('purchase-orders')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 flex items-center cursor-pointer ${
                    activeSection === 'purchase-orders' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeSection === 'purchase-orders' ? {backgroundColor: '#006935'} : {}}
                >
                  <i className="fas fa-shopping-cart mr-3"></i>
                  Órdenes de Compra
                </button>
                <button
                  onClick={() => setActiveSection('invoices')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 flex items-center cursor-pointer ${
                    activeSection === 'invoices' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeSection === 'invoices' ? {backgroundColor: '#006935'} : {}}
                >
                  <i className="fas fa-file-invoice-dollar mr-3"></i>
                  Facturas
                </button>
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 flex items-center cursor-pointer ${
                    activeSection === 'profile' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeSection === 'profile' ? {backgroundColor: '#006935'} : {}}
                >
                  <i className="fas fa-user-cog mr-3"></i>
                  Mi Perfil
                </button>
              </nav>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:w-3/4">
            {activeSection === 'dashboard' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-800">Resumen General</h2>
                
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Requisiciones Activas</p>
                        <p className="text-3xl font-bold text-blue-600">{requisitions.filter(r => r.status === 'pending').length}</p>
                      </div>
                      <i className="fas fa-clipboard-list text-blue-500 text-2xl"></i>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Órdenes Aprobadas</p>
                        <p className="text-3xl font-bold text-green-600">{purchaseOrders.filter(po => po.status === 'approved').length}</p>
                      </div>
                      <i className="fas fa-check-circle text-green-500 text-2xl"></i>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Facturas Pendientes</p>
                        <p className="text-3xl font-bold text-yellow-600">{invoices.filter(i => i.status === 'pending').length}</p>
                      </div>
                      <i className="fas fa-clock text-yellow-500 text-2xl"></i>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{borderColor: '#006935'}}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Facturado</p>
                        <p className="text-2xl font-bold" style={{color: '#006935'}}>{formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}</p>
                      </div>
                      <i className="fas fa-dollar-sign text-2xl" style={{color: '#006935'}}></i>
                    </div>
                  </div>
                </div>

                {/* Actividad Reciente */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                      <i className="fas fa-check-circle text-green-500 text-xl"></i>
                      <div>
                        <p className="font-medium text-gray-800">Requisición REQ-001 aprobada</p>
                        <p className="text-gray-600 text-sm">Hace 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                      <i className="fas fa-shopping-cart text-blue-500 text-xl"></i>
                      <div>
                        <p className="font-medium text-gray-800">Nueva orden de compra OC-2025-002 creada</p>
                        <p className="text-gray-600 text-sm">Hace 1 día</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                      <i className="fas fa-file-invoice text-yellow-500 text-xl"></i>
                      <div>
                        <p className="font-medium text-gray-800">Factura FC-2025-002 pendiente de pago</p>
                        <p className="text-gray-600 text-sm">Hace 3 días</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'requisitions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-gray-800">Mis Requisiciones</h2>
                  <button
                    onClick={() => setShowNewRequisitionModal(true)}
                    className="text-white px-6 py-3 rounded-lg transition-colors duration-300 flex items-center cursor-pointer hover:opacity-90"
                    style={{backgroundColor: '#006935'}}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Nueva Requisición
                  </button>
                </div>

                <div className="grid gap-6">
                  {requisitions.map((req) => (
                    <div key={req.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{req.title}</h3>
                          <p className="text-gray-600">{req.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(req.status)}`}>
                          {getStatusText(req.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-gray-600 text-sm">Cantidad</p>
                          <p className="font-bold">{req.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Precio Unitario</p>
                          <p className="font-bold">{formatCurrency(req.unitPrice)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Total</p>
                          <p className="font-bold">{formatCurrency(req.totalPrice)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Fecha</p>
                          <p className="font-bold">{formatDate(req.createdAt)}</p>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-gray-600 text-sm">Proyecto: <span className="font-medium">{req.project}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'purchase-orders' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800">Órdenes de Compra</h2>
                
                <div className="grid gap-6">
                  {purchaseOrders.map((po) => (
                    <div key={po.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{po.orderNumber}</h3>
                          <p className="text-gray-600">Proveedor: {po.supplier}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(po.status)}`}>
                          {getStatusText(po.status)}
                        </span>
                      </div>
                      <div className="mb-4">
                        <p className="text-gray-600 text-sm mb-2">Artículos:</p>
                        <div className="flex flex-wrap gap-2">
                          {po.items.map((item, index) => (
                            <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{item}</span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-gray-600 text-sm">Monto Total</p>
                          <p className="font-bold text-lg">{formatCurrency(po.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Fecha de Entrega</p>
                          <p className="font-bold">{formatDate(po.deliveryDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Creada</p>
                          <p className="font-bold">{formatDate(po.createdAt)}</p>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-gray-600 text-sm">Proyecto: <span className="font-medium">{po.project}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'invoices' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800">Mis Facturas</h2>
                
                <div className="grid gap-6">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{invoice.invoiceNumber}</h3>
                          <p className="text-gray-600">{invoice.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-gray-600 text-sm">Monto</p>
                          <p className="font-bold text-lg">{formatCurrency(invoice.amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Fecha de Vencimiento</p>
                          <p className="font-bold">{formatDate(invoice.dueDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Creada</p>
                          <p className="font-bold">{formatDate(invoice.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Orden de Compra</p>
                          <p className="font-bold">{invoice.purchaseOrderId}</p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-4">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 cursor-pointer">
                          <i className="fas fa-download mr-2"></i>
                          Descargar PDF
                        </button>
                        {invoice.status === 'pending' && (
                          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 cursor-pointer">
                            <i className="fas fa-credit-card mr-2"></i>
                            Marcar como Pagada
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800">Mi Perfil</h2>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{backgroundColor: '#006935'}}>
                      <i className="fas fa-building text-white text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Construcciones ABC S.A.S.</h3>
                      <p className="text-gray-600">Proveedor de Materiales de Construcción</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-4">Información de Contacto</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-600 text-sm">NIT</p>
                          <p className="font-medium">900.123.456-7</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Teléfono</p>
                          <p className="font-medium">(+57) 301 234 5678</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Email</p>
                          <p className="font-medium">contacto@construccionesabc.com</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Dirección</p>
                          <p className="font-medium">Calle 123 #45-67, Bogotá, Colombia</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-800 mb-4">Información Bancaria</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-600 text-sm">Banco</p>
                          <p className="font-medium">Banco de Bogotá</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Tipo de Cuenta</p>
                          <p className="font-medium">Cuenta Corriente</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Número de Cuenta</p>
                          <p className="font-medium">****-****-****-1234</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <button 
                      className="text-white px-6 py-3 rounded-lg transition-colors duration-300 cursor-pointer hover:opacity-90"
                      style={{backgroundColor: '#006935'}}
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Editar Perfil
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Nueva Requisición */}
      {showNewRequisitionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">Nueva Requisición</h3>
                <button
                  onClick={() => setShowNewRequisitionModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-300 cursor-pointer"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleNewRequisition} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título del Material</label>
                <input
                  type="text"
                  value={newRequisition.title}
                  onChange={(e) => setNewRequisition({...newRequisition, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = '#006935'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="Ej: Cemento Portland Tipo I"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={newRequisition.description}
                  onChange={(e) => setNewRequisition({...newRequisition, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = '#006935'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="Describe las especificaciones del material..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                  <input
                    type="number"
                    value={newRequisition.quantity}
                    onChange={(e) => setNewRequisition({...newRequisition, quantity: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio Unitario (COP)</label>
                  <input
                    type="number"
                    value={newRequisition.unitPrice}
                    onChange={(e) => setNewRequisition({...newRequisition, unitPrice: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
                <select
                  value={newRequisition.project}
                  onChange={(e) => setNewRequisition({...newRequisition, project: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = '#006935'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                >
                  <option value="">Selecciona un proyecto</option>
                  <option value="Edificio Residencial Los Cedros">Edificio Residencial Los Cedros</option>
                  <option value="Centro Comercial Plaza Norte">Centro Comercial Plaza Norte</option>
                  <option value="Vivienda Unifamiliar San José">Vivienda Unifamiliar San José</option>
                </select>
              </div>
              
              {newRequisition.quantity > 0 && newRequisition.unitPrice > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">
                    Total: {formatCurrency(newRequisition.quantity * newRequisition.unitPrice)}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowNewRequisitionModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors duration-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white py-3 px-6 rounded-lg transition-colors duration-300 cursor-pointer hover:opacity-90"
                  style={{backgroundColor: '#006935'}}
                >
                  Crear Requisición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
