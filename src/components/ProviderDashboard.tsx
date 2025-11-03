"use client";

import { useEffect, useState, useCallback } from 'react';
import supabaseClient from '@/lib/supabase/client';
import type { Requisition, PurchaseOrder, Invoice } from '@/types/dashboard';

export default function ProviderDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showNewRequisitionModal, setShowNewRequisitionModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<unknown | null>(null);
  const [salesforceData, setSalesforceData] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  // Projects returned by Salesforce -> account.projects
  type Participant = {
    Descripci_n_del_servicio__c?: string | null;
    CuentaName?: string | null;
    Cuenta__c?: string | null;
    Name?: string | null;
    Id?: string | null;
  };

  type Project = {
    participants?: Participant[];
    Valor_del_contrato__c?: number | null;
    Valor_total_del_contrato__c?: number | null;
    Objeto_del_contrato__c?: string | null;
    Name?: string | null;
    Id?: string | null;
  };

  const [projects, setProjects] = useState<Project[]>([]);


  const getAccountProjectsFromSalesforce = useCallback((sf: unknown): Project[] => {
    if (!sf || typeof sf !== 'object') return [];
    const acct = (sf as Record<string, unknown>)['account'];
    if (!acct || typeof acct !== 'object') return [];
    const projs = (acct as Record<string, unknown>)['projects'];
    if (!Array.isArray(projs)) return [];
    // We trust the upstream shape for now but keep static Project typing
    return projs as Project[];
  }, []);
  const [newRequisition, setNewRequisition] = useState({
    title: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    project: '',
    service: '' // participant Id
  });

  // If projects arrive from Salesforce, pick the first project's name as default for new requisitions
  useEffect(() => {
    if (projects.length > 0 && !newRequisition.project) {
      const first = projects[0];
      setNewRequisition(prev => ({ ...prev, project: String(first?.Id ?? first?.Name ?? '') }));
    }
  }, [projects, newRequisition.project]);

  // When selected project changes, default the service select to the first participant (if any)
  useEffect(() => {
    if (!newRequisition.project) return;
    const found = projects.find(p => String(p.Id) === String(newRequisition.project));
    const parts = found?.participants ?? [];
    if (parts.length > 0) {
      setNewRequisition(prev => ({ ...prev, service: String(parts[0].Id ?? parts[0].Name ?? '') }));
    } else {
      setNewRequisition(prev => ({ ...prev, service: '' }));
    }
  }, [newRequisition.project, projects]);

  const getParticipantsForProject = (projectId: string) => {
    const found = projects.find(p => String(p.Id) === String(projectId));
    return found?.participants ?? [];
  };

  // Data placeholders (replaced previous mock data). Real data should come from Salesforce/API.
  const [requisitions] = useState<Requisition[]>([]);
  const [purchaseOrders] = useState<PurchaseOrder[]>([]);
  const [invoices] = useState<Invoice[]>([]);

  const handleNewRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría la requisición
    setShowNewRequisitionModal(false);
    setNewRequisition({ title: '', description: '', quantity: 1, unitPrice: 0, project: '', service: '' });
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
    try { localStorage.removeItem('user'); } catch {}
    supabaseClient.auth.signOut().catch(() => {});
    window.location.href = '/';
  };

  useEffect(() => {
    // Verificar autenticación primero
    const checkAuth = async () => {
      try {
        // Verificar sesión de Supabase
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!session) {
          console.log('[Dashboard] No session found, redirecting to home');
          window.location.href = '/';
          return;
        }

        setAuthenticated(true);

        // Try to load combined user from localStorage (saved by Header/LoginModal)
        try {
          const raw = localStorage.getItem('user');
          if (raw) {
            const parsed = JSON.parse(raw);
            setCurrentUser(parsed);
            if (parsed.salesforce) {
              setSalesforceData(parsed.salesforce);
              try {
                const projs = getAccountProjectsFromSalesforce(parsed.salesforce);
                setProjects(projs);
              } catch {
                // ignore
              }
            }
            setLoading(false);
            return;
          }
        } catch {
          // ignore
        }

        // Otherwise, fetch from server using current supabase session
        const token = session.access_token;
        const res = await fetch('/api/salesforce/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          console.warn('[Dashboard] Failed to fetch salesforce data');
          setLoading(false);
          return;
        }

        const payload = await res.json();
        setCurrentUser(payload.user ?? null);
        setSalesforceData(payload.salesforce ?? null);
        
        try {
          const projs = getAccountProjectsFromSalesforce(payload.salesforce);
          setProjects(projs);
        } catch {
          // ignore
        }
        
        try { 
          localStorage.setItem('user', JSON.stringify({ 
            ...(payload.user ?? {}), 
            salesforce: payload.salesforce ?? null 
          })); 
        } catch {}

      } catch (err) {
        console.error('[Dashboard] Error verificando autenticación:', err);
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [getAccountProjectsFromSalesforce]);

  const displayCompany = () => {
    // try a few common fields safely
    const sf = salesforceData as Record<string, unknown> | null;
    const tryString = (v: unknown) => (typeof v === 'string' ? v : undefined);
    if (sf) {
      let candidate = tryString(sf.accountName) ?? tryString(sf.name) ?? tryString(sf.company) ?? tryString(sf.AccountName);
      const acct = sf.account as Record<string, unknown> | undefined;
      if (!candidate && acct) {
        candidate = tryString(acct.Name) ?? tryString(acct.name) ?? candidate;
      }
      if (candidate) return candidate;
    }
    const u = currentUser as Record<string, unknown> | null;
    return (u?.email as string) ?? 'Proveedor';
  };

  const stripHtml = (s: string | null | undefined) => {
    if (!s) return '';
    return s.replace(/<[^>]*>/g, '').trim();
  };

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{borderColor: '#006935'}}></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si no está autenticado (ya redirigió)
  if (!authenticated) {
    return null;
  }

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
                <p className="text-gray-600">Bienvenido, {displayCompany()}</p>
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

                {/* Proyectos (desde Salesforce) */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Proyectos Asociados</h3>
                  {projects.length === 0 ? (
                    <p className="text-gray-600">No se encontraron proyectos asociados.</p>
                  ) : (
                    <div className="grid gap-4">
                      {projects.slice(0, 6).map((p, idx) => (
                        <div key={p.Id ?? idx} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-gray-800">{p.Name ?? 'Sin nombre'}</h4>
                              <p className="text-sm text-gray-600">{p.Objeto_del_contrato__c ?? ''}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-800">{p.Valor_del_contrato__c ? formatCurrency(p.Valor_del_contrato__c) : '-'}</p>
                              <p className="text-xs text-gray-500">{(p.participants ?? []).length} participante(s)</p>
                            </div>
                          </div>

                          {(p.participants ?? []).slice(0, 3).map((par) => (
                            <div key={par.Id} className="mt-3 text-sm text-gray-700">
                              <p className="font-medium">{par.Name ?? ''} <span className="text-gray-500">· {par.CuentaName ?? ''}</span></p>
                              <p className="text-gray-600">{stripHtml(par.Descripci_n_del_servicio__c ?? par.Name ?? '')}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
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
                      <h3 className="text-2xl font-bold text-gray-800">{displayCompany()}</h3>
                      <p className="text-gray-600">Proveedor</p>
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
                  {projects.map((p, i) => (
                    <option key={String(p.Id ?? p.Name ?? i)} value={String(p.Id ?? p.Name ?? i)}>{String(p.Objeto_del_contrato__c ?? p.Name ?? p.Id ?? '')}</option>
                  ))}
                </select>
              </div>

              {/* Servicio / descripción según proyecto seleccionado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del servicio</label>
                <select
                  value={newRequisition.service}
                  onChange={(e) => setNewRequisition({...newRequisition, service: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = '#006935'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                >
                  <option value="">Selecciona una descripción</option>
                  {getParticipantsForProject(newRequisition.project).map((par, i) => (
                    <option key={String(par.Id ?? par.Name ?? i)} value={String(par.Id ?? par.Name ?? '')}>{stripHtml(par.Descripci_n_del_servicio__c ?? par.Name ?? '')}</option>
                  ))}
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
