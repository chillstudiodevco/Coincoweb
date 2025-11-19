"use client";

import { useEffect, useState, useCallback } from 'react';
import supabaseClient from '@/lib/supabase/client';
import OrdenCompraModal, { type OrdenCompraFormData } from './OrdenCompraModal';
import OrdenCompraDetailModal from './OrdenCompraDetailModal';
import type { Requisition, Invoice, OrdenDeCompra } from '@/types/dashboard';

export default function ProviderDashboard() {
  // Configuración de secciones habilitadas/deshabilitadas
  const enabledSections = {
    dashboard: true,
    requisitions: false,
    purchaseOrders: true,
    invoices: false,
    profile: false,
  };

  const [activeSection, setActiveSection] = useState('dashboard');
  const [showNewRequisitionModal, setShowNewRequisitionModal] = useState(false);
  const [showOrdenCompraModal, setShowOrdenCompraModal] = useState(false);
  const [showOrdenDetailModal, setShowOrdenDetailModal] = useState(false);
  const [selectedOrdenId, setSelectedOrdenId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<unknown | null>(null);
  const [salesforceData, setSalesforceData] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  // Estado para órdenes de compra
  const [ordenes, setOrdenes] = useState<OrdenDeCompra[]>([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  
  // Estado para el proyecto seleccionado en el modal de orden de compra
  const [selectedProjectForOrden, setSelectedProjectForOrden] = useState<string>('');
  
  // Projects returned by Salesforce -> account.projects
  type Participant = {
    Descripci_n_del_servicio__c?: string | null;
    CuentaName?: string | null;
    Cuenta__c?: string | null;
    Name?: string | null;
    Id?: string | null;
    Tipo_de_tercero__c?: string | null;
  };

  type Project = {
    participants?: Participant[];
    materialProviders?: Participant[];
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

  // Obtener proveedores de materiales de un proyecto específico
  const getProveedoresByProject = useCallback((projectId: string) => {
    const project = projects.find(p => String(p.Id) === String(projectId));
    
    if (!project || !project.materialProviders) {
      return [];
    }
    
    return project.materialProviders.map(proveedor => ({
      id: proveedor.Id || proveedor.Name || '',
      nombre: proveedor.CuentaName || proveedor.Descripci_n_del_servicio__c || proveedor.Name || 'Sin nombre'
    }));
  }, [projects]);

  // Data placeholders (replaced previous mock data). Real data should come from Salesforce/API.
  const [requisitions] = useState<Requisition[]>([]);
  const [invoices] = useState<Invoice[]>([]);

  // Función para cargar órdenes de compra desde la API
  const fetchOrdenes = useCallback(async () => {
    if (!currentUser || typeof currentUser !== 'object') return;
    
    const metadata = (currentUser as { user_metadata?: Record<string, unknown> }).user_metadata;
    const accountId = metadata?.salesforce_id as string | undefined;
    
    if (!accountId) {
      console.warn('⚠️ [Dashboard] No se encontró salesforce_id (accountId) en user_metadata');
      return;
    }

    try {
      setLoadingOrdenes(true);
      console.log('🔄 [Dashboard] Cargando órdenes para account:', accountId);

      // Obtener token de sesión
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        console.error('❌ [Dashboard] No hay sesión activa');
        return;
      }

      // ✅ Llamar a la API con accountId (busca todos los participantes automáticamente)
      const response = await fetch(
        `/api/salesforce/ordenes-compra?accountId=${accountId}&includePartidas=true&limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('❌ [Dashboard] Error al cargar órdenes:', result);
        return;
      }

      const loadedOrdenes = result.data?.ordenes || [];
      console.log(`✅ [Dashboard] ${loadedOrdenes.length} órdenes cargadas de todos los proyectos`);
      setOrdenes(loadedOrdenes);

    } catch (error) {
      console.error('❌ [Dashboard] Error inesperado al cargar órdenes:', error);
    } finally {
      setLoadingOrdenes(false);
    }
  }, [currentUser]);

  const handleNewRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría la requisición
    setShowNewRequisitionModal(false);
    setNewRequisition({ title: '', description: '', quantity: 1, unitPrice: 0, project: '', service: '' });
  };

  const handleOpenOrdenDetail = (ordenId: string | undefined) => {
    if (!ordenId) return;
    setSelectedOrdenId(ordenId);
    setShowOrdenDetailModal(true);
  };

  const handleCreateOrdenCompra = async (data: OrdenCompraFormData) => {
    try {
      console.log('📝 [Dashboard] Creando orden de compra:', data);
      
      // Obtener el token de sesión
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      // ✅ Buscar el ID del participante del usuario en el proyecto seleccionado
      const proyecto = projects.find(p => String(p.Id) === String(data.proyectoId));
      
      if (!proyecto) {
        console.error('❌ [Dashboard] Proyecto no encontrado:', data.proyectoId);
        alert('Error: No se encontró el proyecto seleccionado.');
        return;
      }

      // Obtener el salesforce_id de la cuenta del usuario
      const metadata = (currentUser as { user_metadata?: Record<string, unknown> })?.user_metadata;
      const accountId = metadata?.salesforce_id as string | undefined;
      
      if (!accountId) {
        console.error('❌ [Dashboard] No se encontró salesforce_id del usuario');
        alert('Error: No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.');
        return;
      }

      // ✅ Buscar el participante del usuario en este proyecto
      const participanteDelUsuario = proyecto.participants?.find(
        p => String(p.Cuenta__c) === String(accountId)
      );

      if (!participanteDelUsuario || !participanteDelUsuario.Id) {
        console.error('❌ [Dashboard] No se encontró participante del usuario en el proyecto');
        console.error('Account ID:', accountId);
        console.error('Participantes del proyecto:', proyecto.participants);
        alert('Error: No se encontró tu participación en este proyecto. Por favor, contacta al administrador.');
        return;
      }

      console.log('✅ [Dashboard] Participante encontrado:', participanteDelUsuario.Id, participanteDelUsuario.Name);

      // Crear payload con la nueva estructura: orden + partidas
      const payload = {
        orden: {
          Participante__c: participanteDelUsuario.Id, // ✅ ID del participante en este proyecto
          Proveedor__c: data.proveedorId, // ← Proveedor seleccionado
          Proyecto__c: data.proyectoId,
          Fecha__c: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          Fecha_de_vencimiento__c: data.fechaVencimiento || undefined,
          Estado__c: 'Requisición generada',
          Forma_de_pago__c: data.formaPago || undefined,
          Medio_de_pago__c: data.medioPago || undefined,
          Detalle__c: data.detalle || undefined,
          Observaciones__c: data.observaciones || undefined,
          Referencia__c: data.referencia || undefined,
        },
        partidas: data.items.map((item, index) => ({
          N_mero_de_item__c: index + 1,
          Descripci_n__c: item.descripcion,
          Cantidad__c: item.cantidad,
          Unidad_de_medida__c: item.unidadMedida,
        })),
      };

      console.log('🚀 [Dashboard] Enviando a API:', payload);

      // Llamar a la API
      const response = await fetch('/api/salesforce/ordenes-compra', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('❌ [Dashboard] Error al crear orden:', result);
        alert(`Error al crear la orden: ${result.error || 'Error desconocido'}`);
        return;
      }

      console.log('✅ [Dashboard] Orden creada exitosamente:', result.data);
      alert('¡Orden de compra creada exitosamente!');
      
      // Recargar lista de órdenes
      await fetchOrdenes();
      
      // Cerrar modal
      setShowOrdenCompraModal(false);

      // Aquí podrías recargar la lista de órdenes si la tienes
      // TODO: Implementar recarga de órdenes

    } catch (error) {
      console.error('❌ [Dashboard] Error inesperado:', error);
      alert('Error al crear la orden. Por favor, intenta nuevamente.');
    }
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

  const handleLogout = async () => {
    try {
      // 1. Limpiar localStorage primero
      localStorage.removeItem('user');
      
      // 2. Cerrar sesión en Supabase (esto limpia las cookies automáticamente)
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        console.error('[Logout] Error al cerrar sesión:', error);
      }
      
      // 3. Redirigir después de limpiar todo
      window.location.href = '/';
      
    } catch (err) {
      console.error('[Logout] Error inesperado:', err);
      // Forzar limpieza y redirect incluso si hay error
      try { localStorage.clear(); } catch {}
      window.location.href = '/';
    }
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

  // Cargar órdenes cuando el usuario esté autenticado
  useEffect(() => {
    if (authenticated && currentUser) {
      fetchOrdenes();
    }
  }, [authenticated, currentUser, fetchOrdenes]);

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
          <div className="relative mb-8">
            {/* Spinner exterior */}
            <div 
              className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 mx-auto"
              style={{ borderTopColor: '#006935' }}
            ></div>
            {/* Spinner interior (rotación inversa) */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
            >
              <div 
                className="animate-spin rounded-full h-12 w-12 border-4 border-transparent"
                style={{ 
                  borderTopColor: '#4CAF50',
                  animationDirection: 'reverse',
                  animationDuration: '1s'
                }}
              ></div>
            </div>
            {/* Icono en el centro */}
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-shield-alt text-2xl" style={{ color: '#006935' }}></i>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold" style={{ color: '#006935' }}>Portal COINCO</p>
            <p className="text-gray-600">Verificando acceso...</p>
          </div>
          {/* Puntos animados */}
          <div className="flex justify-center items-center space-x-2 mt-4">
            <div 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ 
                backgroundColor: '#006935',
                animationDelay: '0ms'
              }}
            ></div>
            <div 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ 
                backgroundColor: '#006935',
                animationDelay: '150ms'
              }}
            ></div>
            <div 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ 
                backgroundColor: '#006935',
                animationDelay: '300ms'
              }}
            ></div>
          </div>
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
                <h1 className="text-2xl font-bold text-gray-800">Portal COINCO</h1>
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
                {enabledSections.dashboard && (
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
                )}
                {enabledSections.requisitions && (
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
                )}
                {enabledSections.purchaseOrders && (
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
                )}
                {enabledSections.invoices && (
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
                )}
                {enabledSections.profile && (
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
                )}
              </nav>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:w-3/4">
            {activeSection === 'dashboard' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-800">Resumen General</h2>
                
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Órdenes de Compra</p>
                        <p className="text-3xl font-bold text-green-600">{ordenes.length}</p>
                      </div>
                      <i className="fas fa-shopping-cart text-green-500 text-2xl"></i>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{borderColor: '#006935'}}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Proyectos Asociados</p>
                        <p className="text-3xl font-bold" style={{color: '#006935'}}>{projects.length}</p>
                      </div>
                      <i className="fas fa-briefcase text-2xl" style={{color: '#006935'}}></i>
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
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-gray-800">Órdenes de Compra</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={fetchOrdenes}
                      disabled={loadingOrdenes}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Actualizar órdenes"
                    >
                      <i className={`fas fa-sync-alt ${loadingOrdenes ? 'animate-spin' : ''}`}></i>
                      Actualizar
                    </button>
                    <button
                      onClick={() => setShowOrdenCompraModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2"
                    >
                      <i className="fas fa-plus"></i>
                      Nueva Orden
                    </button>
                  </div>
                </div>
                
                {loadingOrdenes ? (
                  <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="relative">
                        {/* Spinner principal */}
                        <div 
                          className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"
                          style={{ borderTopColor: '#006935' }}
                        ></div>
                        {/* Icono en el centro */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <i className="fas fa-shopping-cart text-2xl" style={{ color: '#006935' }}></i>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold" style={{ color: '#006935' }}>
                          Cargando órdenes de compra
                        </p>
                        <p className="text-sm text-gray-500">
                          Por favor espera un momento...
                        </p>
                      </div>
                      {/* Barra de progreso animada */}
                      <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full animate-pulse"
                          style={{ 
                            width: '60%',
                            backgroundColor: '#006935',
                            animation: 'loading-bar 1.5s ease-in-out infinite'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : ordenes.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                    <i className="fas fa-shopping-cart text-gray-400 text-5xl mb-4"></i>
                    <p className="text-gray-600 mb-2">No hay órdenes de compra</p>
                    <p className="text-gray-500 text-sm">Crea tu primera orden usando el botón &quot;Nueva Orden&quot;</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {ordenes.map((orden) => (
                      <div 
                        key={orden.Id} 
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-transparent hover:border-green-200"
                        onClick={() => handleOpenOrdenDetail(orden.Id)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-800">{orden.Name || 'Sin número'}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orden.Estado__c || 'pending')}`}>
                                {orden.Estado__c || 'Pendiente'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">
                              <i className="fas fa-user-tie mr-2"></i>
                              Participante: {orden.Participante__r?.Name || 'N/A'}
                            </p>
                            {orden.Proveedor__r?.Cuenta__r?.Name && (
                              <p className="text-gray-600 text-sm mt-1">
                                <i className="fas fa-store mr-2"></i>
                                Proveedor: {orden.Proveedor__r.Cuenta__r.Name}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenOrdenDetail(orden.Id);
                            }}
                            className="text-green-600 hover:text-green-700 p-2 rounded-full hover:bg-green-50 transition-colors"
                            title="Ver detalle"
                          >
                            <i className="fas fa-eye text-xl"></i>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-gray-600 text-xs font-semibold uppercase">Fecha</p>
                            <p className="font-bold text-sm">{orden.Fecha__c ? formatDate(orden.Fecha__c) : 'N/A'}</p>
                          </div>
                          {orden.Fecha_de_vencimiento__c && (
                            <div>
                              <p className="text-gray-600 text-xs font-semibold uppercase">Vencimiento</p>
                              <p className="font-bold text-sm">{formatDate(orden.Fecha_de_vencimiento__c)}</p>
                            </div>
                          )}
                          {orden.Total__c && (
                            <div className="col-span-2">
                              <p className="text-gray-600 text-xs font-semibold uppercase">Monto Total</p>
                              <p className="font-bold text-lg" style={{ color: '#006935' }}>{formatCurrency(orden.Total__c)}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="border-t pt-4 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-gray-600 text-sm">
                              <i className="fas fa-project-diagram mr-2"></i>
                              <span className="font-medium">{orden.Proyecto__r?.Name || 'N/A'}</span>
                            </p>
                            {orden.Referencia__c && (
                              <p className="text-gray-600 text-xs mt-1">
                                <i className="fas fa-tag mr-2"></i>
                                Ref: {orden.Referencia__c}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <i className="fas fa-hand-pointer mr-1"></i>
                            Click para ver detalle
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-info-circle text-4xl mb-4"></i>
                    <p>Información de perfil próximamente disponible</p>
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

      {/* Modal para Nueva Orden de Compra */}
      <OrdenCompraModal
        isOpen={showOrdenCompraModal}
        onClose={() => setShowOrdenCompraModal(false)}
        onSubmit={handleCreateOrdenCompra}
        proveedores={selectedProjectForOrden ? getProveedoresByProject(selectedProjectForOrden) : []}
        proyectos={projects.map(p => ({
          id: p.Id || '',
          nombre: p.Objeto_del_contrato__c || p.Name || 'Sin nombre'
        }))}
        onProyectoChange={(proyectoId) => setSelectedProjectForOrden(proyectoId)}
      />

      {/* Modal de Detalle de Orden de Compra */}
      <OrdenCompraDetailModal
        isOpen={showOrdenDetailModal}
        onClose={() => {
          setShowOrdenDetailModal(false);
          setSelectedOrdenId('');
        }}
        ordenId={selectedOrdenId}
      />
    </div>
  );
}
