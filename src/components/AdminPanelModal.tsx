import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  X, 
  Download, 
  UserCheck, 
  Mail, 
  Phone, 
  Award, 
  Key, 
  Globe, 
  Lock, 
  Trash2, 
  RefreshCw, 
  Edit3, 
  Crown, 
  Sparkles, 
  Plus, 
  UserPlus, 
  Palette, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  Calendar,
  FileText,
  Play,
  Image as ImageIcon,
  Send,
  AlertCircle,
  Bell,
  Clock,
  CreditCard,
  Smartphone,
  Zap,
  Building2,
  Save
} from 'lucide-react';
import { EditPaymentConfigModal } from './EditPaymentConfigModal';
import { DEFAULT_PAYMENT_CONFIG } from '../services/paymentConfigService';
import { DoctorConfig } from '../types';
import { getDoctorTrialStatus } from '../utils/trialHelper';
import { AdminDoctorRecipeEditorModal } from './AdminDoctorRecipeEditorModal';
import { AdminCreateDoctorModal } from './AdminCreateDoctorModal';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredDoctors: DoctorConfig[];
  onRefreshFromCloud?: () => Promise<void>;
  onDeleteDoctor?: (id: string) => void;
  onResetAllData?: () => void;
  onUpdateDoctor?: (updatedDoctor: DoctorConfig) => void;
  onAddNewDoctor?: (newDoctor: DoctorConfig) => void;
  onLoginAsDoctor?: (doctor: DoctorConfig) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  registeredDoctors,
  onRefreshFromCloud,
  onDeleteDoctor,
  onResetAllData,
  onUpdateDoctor,
  onAddNewDoctor,
  onLoginAsDoctor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [versionFilter, setVersionFilter] = useState<'todos' | 'pendiente' | 'activo' | 'prueba' | 'elite' | 'basico' | 'diseno-pro' | 'clinica-full'>('todos');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modals for admin actions
  const [editingRecipeDoctor, setEditingRecipeDoctor] = useState<DoctorConfig | null>(null);
  const [isCreateDoctorOpen, setIsCreateDoctorOpen] = useState(false);
  const [copiedDoctorId, setCopiedDoctorId] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Feature: Voucher Photo Modal
  const [viewingVoucherDoc, setViewingVoucherDoc] = useState<DoctorConfig | null>(null);

  // Feature: "Dar Play" Activation Modal State
  const [activatingPlayDoc, setActivatingPlayDoc] = useState<DoctorConfig | null>(null);
  const [chosenPlanForPlay, setChosenPlanForPlay] = useState<'mensual' | 'trimestral' | 'anual' | 'elite'>('trimestral');

  // Feature: "Plan Élite" Custom Activation Modal State (Otorgar a futuro por X días)
  const [activatingEliteDoc, setActivatingEliteDoc] = useState<DoctorConfig | null>(null);
  const [eliteDaysInput, setEliteDaysInput] = useState<number>(30);
  const [eliteCustomNotes, setEliteCustomNotes] = useState<string>('');

  // Feature: Payment Accounts Settings Modal
  const [isPaymentAccountsModalOpen, setIsPaymentAccountsModalOpen] = useState(false);

  if (!isOpen) return null;

  // Compute version and payment stats
  const totalDoctors = registeredDoctors.length;
  
  const pendingVoucherDocs = registeredDoctors.filter(d => 
    d.paymentStatus === 'pendiente' || !!d.paymentVoucherImg
  );

  const pendientesCount = registeredDoctors.filter(d => 
    d.paymentStatus === 'pendiente' || (!d.isPaidClient && d.paymentStatus !== 'prueba')
  ).length;

  const activosCount = registeredDoctors.filter(d => 
    d.paymentStatus === 'activo' || d.isPaidClient
  ).length;

  const pruebasCount = registeredDoctors.filter(d => 
    d.paymentStatus === 'prueba'
  ).length;

  const eliteCount = registeredDoctors.filter(d => 
    Boolean(d.isElite || d.paidPlanName?.toLowerCase().includes('élite') || d.paidPlanName?.toLowerCase().includes('elite') || d.subscriptionPlan === 'elite')
  ).length;

  // Filtered doctors list
  const filteredDoctors = registeredDoctors.filter((doc) => {
    // 1. Version or status filter
    if (versionFilter === 'pendiente') {
      if (doc.paymentStatus !== 'pendiente' && doc.paymentStatus === 'activo') return false;
    } else if (versionFilter === 'activo') {
      if (doc.paymentStatus !== 'activo' && !doc.isPaidClient) return false;
    } else if (versionFilter === 'prueba') {
      if (doc.paymentStatus !== 'prueba') return false;
    } else if (versionFilter === 'elite') {
      const isEl = doc.isElite || doc.paidPlanName?.toLowerCase().includes('élite') || doc.paidPlanName?.toLowerCase().includes('elite') || doc.subscriptionPlan === 'elite';
      if (!isEl) return false;
    } else if (versionFilter === 'basico') {
      const isBas = doc.subscriptionPlan === 'basico' || (!doc.isPaidClient && !doc.subscriptionPlan);
      if (!isBas) return false;
    } else if (versionFilter === 'diseno-pro') {
      const isPro = doc.subscriptionPlan === 'diseno-pro' || (doc.isPaidClient && doc.subscriptionPlan !== 'clinica-full');
      if (!isPro) return false;
    } else if (versionFilter === 'clinica-full') {
      if (doc.subscriptionPlan !== 'clinica-full') return false;
    }

    // 2. Text query search
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      (doc.doctorName || '').toLowerCase().includes(query) ||
      (doc.ci || '').toLowerCase().includes(query) ||
      (doc.mpps || '').toLowerCase().includes(query) ||
      (doc.specialty || '').toLowerCase().includes(query) ||
      (doc.email || '').toLowerCase().includes(query) ||
      (doc.phone || '').toLowerCase().includes(query) ||
      (doc.institution || '').toLowerCase().includes(query)
    );
  });

  const handleExportCSV = () => {
    const headers = ['Nombre Médico', 'Cédula (Usuario)', 'Clave de Acceso', 'Versión / Plan', 'Estado de Pago', 'Especialidad', 'M.P.P.S', 'Colegio', 'Teléfono', 'Correo', 'Comprobante', 'Notas Pago'];
    const rows = registeredDoctors.map(doc => [
      `"${doc.doctorName || ''}"`,
      `"${doc.ci || ''}"`,
      `"${doc.password || doc.ci || ''}"`,
      `"${doc.paidPlanName || doc.subscriptionPlan || 'Suscripción'}"`,
      `"${doc.paymentStatus || (doc.isPaidClient ? 'Activo' : 'Pendiente')}"`,
      `"${doc.specialty || ''}"`,
      `"${doc.mpps || ''}"`,
      `"${doc.collegeNumber || ''}"`,
      `"${doc.phone || ''}"`,
      `"${doc.email || ''}"`,
      `"${doc.paymentVoucherImg ? 'SI (Adjunto)' : 'NO'}"`,
      `"${doc.paymentVoucherNotes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medicos_digitalmedic_usuarios_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = async () => {
    if (onRefreshFromCloud) {
      setIsRefreshing(true);
      await onRefreshFromCloud();
      setIsRefreshing(false);
    }
  };

  const togglePasswordVisibility = (docId: string) => {
    setShowPasswordMap(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  // --- Feature: 'DAR PLAY' (Activar Cuenta) Execution ---
  const handleConfirmDarPlay = (doc: DoctorConfig, planToActivate: 'mensual' | 'trimestral' | 'anual' | 'elite', customDays = 30) => {
    if (planToActivate === 'elite') {
      handleConfirmActivateElite(doc, customDays || eliteDaysInput || 30);
      setActivatingPlayDoc(null);
      return;
    }

    const planNames = {
      mensual: 'Mensual PRO ($10 USD)',
      trimestral: 'Trimestral PRO ($28 USD)',
      anual: 'Anual VIP ($95 USD)'
    };

    const updated: DoctorConfig = {
      ...doc,
      paymentStatus: 'activo',
      isPaidClient: true,
      subscriptionPlan: planToActivate,
      isVip: planToActivate === 'anual' ? true : doc.isVip,
      paidPlanName: planNames[planToActivate],
      paidUntilDate: new Date(Date.now() + (planToActivate === 'anual' ? 365 : planToActivate === 'trimestral' ? 90 : 30) * 24 * 60 * 60 * 1000).toISOString()
    };

    if (onUpdateDoctor) {
      onUpdateDoctor(updated);
    }

    setActivatingPlayDoc(null);

    // Auto-copy WhatsApp activation message
    const msg = `*¡CUENTA ACTIVADA EN DIGITAL MÉDICO!* 🩺\n\nEstimado(a) Dr(a). *${doc.doctorName}*:\nSu suscripción (*${planNames[planToActivate]}*) ha sido verificada y activada exitosamente.\n\n📧 *Correo:* ${doc.email}\n👤 *Cédula / Usuario:* ${doc.ci}\n🔑 *Clave:* ${doc.password || doc.ci}\n\nYa puede ingresar de forma permanente. ¡Bienvenido(a)!`;
    navigator.clipboard.writeText(msg);
    alert(`✓ ¡Cuenta activada con éxito! Se ha copiado el mensaje de confirmación para WhatsApp.`);
  };

  // --- Feature: 'ACTIVAR PLAN ÉLITE' (Por cantidad de días definida por Administrador) ---
  const handleConfirmActivateElite = (doc: DoctorConfig, days: number, notes?: string) => {
    const validDays = Math.max(1, Math.round(Number(days) || 30));
    const expiresDate = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);
    const formattedExpires = expiresDate.toLocaleDateString('es-VE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });

    const updated: DoctorConfig = {
      ...doc,
      paymentStatus: 'activo',
      isPaidClient: true,
      isVip: true,
      isElite: true,
      subscriptionPlan: 'elite',
      paidPlanName: `Plan Élite (${validDays} Días)`,
      paidUntilDate: expiresDate.toISOString(),
      eliteActivatedAt: new Date().toISOString(),
      eliteExpiresAt: expiresDate.toISOString(),
      eliteDays: validDays,
      eliteNotes: notes?.trim() || 'Autorizado directamente por el Administrador Master Dr. Carlos Leal'
    };

    if (onUpdateDoctor) {
      onUpdateDoctor(updated);
    }

    setActivatingEliteDoc(null);

    // Auto-copy WhatsApp activation message for Plan Élite
    const msg = `*¡PLAN ÉLITE ACTIVADO EN DIGITAL MÉDICO!* 💎✨\n\nEstimado(a) Dr(a). *${doc.doctorName}*:\nEl Administrador Master Dr. Carlos Leal le ha concedido acceso exclusivo al *PLAN ÉLITE* por *${validDays} días continuos*.\n\n📅 *Vigencia hasta:* ${formattedExpires}\n⭐ *Privilegios Élite Desbloqueados:*\n• Emisión ilimitada de Récipes Médicos 4 en 1 y Máster\n• Módulos completos de Historias Clínicas, Informes y Reposos Médicos\n• Acceso Exclusivo al Estudio de Diseño PRO (sellos, firmas y membretes de alta gama)\n• Respaldo y sincronización en la nube\n\n📧 *Correo:* ${doc.email}\n👤 *Cédula / Usuario:* ${doc.ci}\n🔑 *Clave:* ${doc.password || doc.ci}\n\nYa puede ingresar y emitir sus formatos con categoría Élite. ¡Muchos éxitos en su consulta médica!`;
    
    try {
      navigator.clipboard.writeText(msg);
    } catch (_) {}

    alert(`✓ ¡Plan Élite activado con éxito para Dr(a). ${doc.doctorName} por ${validDays} días! (Vence el ${formattedExpires})\n\nSe ha copiado el mensaje de confirmación para WhatsApp.`);
  };

  const handleDeactivateElite = (doc: DoctorConfig) => {
    if (!window.confirm(`¿Está seguro de DESACTIVAR el Plan Élite para ${doc.doctorName}? El médico regresará a la condición de prueba o plan regular.`)) return;

    const updated: DoctorConfig = {
      ...doc,
      isElite: false,
      subscriptionPlan: 'basico',
      paidPlanName: 'Plan Básico',
      eliteDays: 0,
      eliteExpiresAt: undefined,
    };

    if (onUpdateDoctor) {
      onUpdateDoctor(updated);
    }
    setActivatingEliteDoc(null);
    alert(`✓ El Plan Élite ha sido desactivado para ${doc.doctorName}.`);
  };

  const copyDoctorCredentialsWhatsApp = (doc: DoctorConfig) => {
    const msg = `*Credenciales Digital Médico* 🩺\nDr(a). *${doc.doctorName}*\n\n📧 *Correo:* ${doc.email}\n👤 *Cédula:* ${doc.ci}\n🔑 *Clave:* ${doc.password || doc.ci}\n⭐ *Estado:* ${doc.paymentStatus === 'activo' ? 'Activo (Dar Play Confirmado)' : doc.paymentStatus === 'prueba' ? 'Prueba 14 Días' : 'Pendiente'}\n\nIngrese en la app con su Correo o Cédula y su Clave.`;
    navigator.clipboard.writeText(msg);
    setCopiedDoctorId(doc.id);
    setTimeout(() => setCopiedDoctorId(null), 2500);
  };

  const handleAdminChangePassword = (doc: DoctorConfig) => {
    const newPass = window.prompt(`Ingrese la nueva clave de acceso para ${doc.doctorName}:`, doc.password || doc.ci);
    if (!newPass || !newPass.trim()) return;
    const updated: DoctorConfig = {
      ...doc,
      password: newPass.trim(),
    };
    if (onUpdateDoctor) {
      onUpdateDoctor(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-2 md:p-6 modal-overlay animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">Panel de Administración Central ("El 'Play' del Creador")</h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                  Acceso Exclusivo
                </span>
              </div>
              <p className="text-xs text-slate-400">Control de usuarios, notificaciones de pago con comprobante y botón de activación "Dar Play"</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                const masterAdmin = registeredDoctors.find(d => d.id === 'doc-admin-master' || d.email === 'carloseduardoleal29@gmail.com') || registeredDoctors[0];
                if (masterAdmin) setEditingRecipeDoctor(masterAdmin);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 via-indigo-600 to-blue-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Editar diseño de récipe, membrete, especialidad y sello del Administrador Master"
            >
              <Palette className="w-4 h-4 text-amber-300" />
              <span>🎨 Editar Mi Récipe y Sello</span>
            </button>

            <button
              onClick={() => setIsPaymentAccountsModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Configurar cuentas de Pago Móvil, Binance USDT, Zinli y Tasa Binance del día"
            >
              <CreditCard className="w-4 h-4 text-slate-950" />
              <span>⚙️ Editar Datos de Cobro &amp; Tasa</span>
            </button>

            <button
              onClick={() => setIsCreateDoctorOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Crear Médico</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Notification Banner for Pending Payment Reports */}
          {pendingVoucherDocs.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-amber-500/60 flex items-center justify-between gap-4 text-xs shadow-lg animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-black text-amber-300 text-sm flex items-center gap-1.5">
                    <span>🔔 {pendingVoucherDocs.length} Médico(s) con Reporte de Pago o Comprobante Pendiente</span>
                  </h4>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Revise las fotos de comprobante y presione <strong>"▶ DAR PLAY"</strong> para aprobar su acceso definitivo.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setVersionFilter('pendiente')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all shrink-0"
              >
                Filtrar Pendientes
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total Médicos</span>
                <span className="text-lg font-black text-white">{totalDoctors}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-amber-500/40 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wider">Pendientes</span>
                <span className="text-lg font-black text-amber-300">{pendientesCount}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">Activos (Play)</span>
                <span className="text-lg font-black text-emerald-400">{activosCount}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-cyan-500/40 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-cyan-400 block uppercase tracking-wider">Prueba (14 Días)</span>
                <span className="text-lg font-black text-cyan-300">{pruebasCount}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-purple-500/50 rounded-2xl p-3 flex items-center gap-2.5 bg-gradient-to-br from-purple-950/30 to-slate-900">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/40">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-purple-300 block uppercase tracking-wider">Plan Élite</span>
                <span className="text-lg font-black text-amber-300">{eliteCount}</span>
              </div>
            </div>
          </div>

          {/* Filtering & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs pb-1 md:pb-0">
              {[
                { id: 'todos', label: `Todos (${totalDoctors})` },
                { id: 'pendiente', label: `🔔 Pendientes (${pendientesCount})` },
                { id: 'activo', label: `✓ Activos (${activosCount})` },
                { id: 'prueba', label: `Prueba 14d (${pruebasCount})` },
                { id: 'elite', label: `💎 Plan Élite (${eliteCount})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setVersionFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                    versionFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar médico, cédula, correo..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {onRefreshFromCloud && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors shrink-0 cursor-pointer"
                  title="Sincronizar desde la nube"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>
          </div>

          {/* Doctors Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Médico / Datos</th>
                    <th className="px-4 py-3">Credenciales (Correo / Clave)</th>
                    <th className="px-4 py-3">Comprobante / Pago</th>
                    <th className="px-4 py-3">Estado &amp; Plan</th>
                    <th className="px-4 py-3 text-right">BOTÓN DE ACTIVACIÓN ("DAR PLAY")</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredDoctors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-500 text-xs">
                        No se encontraron médicos registrados.
                      </td>
                    </tr>
                  ) : (
                    filteredDoctors.map((doc) => {
                      const isPwdVisible = !!showPasswordMap[doc.id];
                      const effectivePassword = doc.password || doc.ci || 'Sin clave';
                      const isPending = doc.paymentStatus === 'pendiente' || (!doc.isPaidClient && doc.paymentStatus !== 'prueba');

                      return (
                        <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Doctor Name & Details */}
                          <td className="px-4 py-3">
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                              <span>{doc.doctorName}</span>
                            </div>
                            <span className="text-[11px] text-indigo-300 block">{doc.specialty}</span>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                              <span>MPPS: {doc.mpps || 'S/N'}</span>
                              <span>·</span>
                              <span>CI: {doc.ci || 'S/N'}</span>
                            </div>
                          </td>

                          {/* Login Credentials */}
                          <td className="px-4 py-3 font-mono space-y-1">
                            <div className="text-[11px] text-slate-300 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-blue-400 shrink-0" />
                              <span className="truncate max-w-[140px]">{doc.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-slate-400 text-[10px]">Clave:</span>
                              <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-bold text-emerald-300">
                                {isPwdVisible ? effectivePassword : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(doc.id)}
                                className="p-0.5 text-slate-400 hover:text-white"
                              >
                                {isPwdVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>

                          {/* Voucher / Comprobante de Pago Photo */}
                          <td className="px-4 py-3">
                            {doc.paymentVoucherImg ? (
                              <button
                                type="button"
                                onClick={() => setViewingVoucherDoc(doc)}
                                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Ver Comprobante</span>
                              </button>
                            ) : doc.paymentVoucherNotes ? (
                              <div className="text-[10px] text-slate-300 font-mono bg-slate-800 p-1.5 rounded border border-slate-700 max-w-[130px] truncate">
                                {doc.paymentVoucherNotes}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Sin comprobante</span>
                            )}
                          </td>

                          {/* Status & Plan */}
                          <td className="px-4 py-3">
                            {(() => {
                              const isEliteDoc = Boolean(doc.isElite || doc.paidPlanName?.toLowerCase().includes('élite') || doc.paidPlanName?.toLowerCase().includes('elite') || doc.subscriptionPlan === 'elite');
                              return (
                                <div className="space-y-1">
                                  {isEliteDoc ? (
                                    <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-500/25 via-pink-500/20 to-amber-500/25 text-purple-200 border border-purple-400/50 text-[10px] font-black inline-flex items-center gap-1 shadow-xs">
                                      <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                                      <span>💎 PLAN ÉLITE ACTIVO</span>
                                    </span>
                                  ) : doc.paymentStatus === 'activo' || doc.isPaidClient ? (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black inline-flex items-center gap-1">
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span>ACTIVADO (PLAY)</span>
                                    </span>
                                  ) : doc.paymentStatus === 'prueba' ? (
                                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-cyan-400" />
                                      <span>Prueba 14 Días</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3 text-amber-400" />
                                      <span>Pendiente / Cortado</span>
                                    </span>
                                  )}
                                  
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <div className="text-[10px] text-slate-400 font-semibold truncate">
                                      {doc.paidPlanName || doc.subscriptionPlan || 'Plan Básico'}
                                    </div>
                                    {(doc.isVip || doc.subscriptionPlan === 'anual' || isEliteDoc) && (
                                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px] font-black">
                                        👑 VIP
                                      </span>
                                    )}
                                  </div>

                                  {/* Days Remaining Countdown Indicator */}
                                  {(() => {
                                    if (isEliteDoc) {
                                      if (doc.paidUntilDate) {
                                        const diff = Math.ceil((new Date(doc.paidUntilDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                        const days = diff > 0 ? diff : 0;
                                        return (
                                          <div className="text-[10px] text-purple-300 font-mono font-bold flex items-center gap-1 mt-0.5">
                                            <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                                            <span>Quedan {days}d de Plan Élite</span>
                                          </div>
                                        );
                                      }
                                      return (
                                        <div className="text-[10px] text-purple-300 font-mono font-bold flex items-center gap-1 mt-0.5">
                                          <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                                          <span>Plan Élite Activo</span>
                                        </div>
                                      );
                                    } else if (doc.paymentStatus === 'activo' || doc.isPaidClient) {
                                      if (doc.paidUntilDate) {
                                        const diff = Math.ceil((new Date(doc.paidUntilDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                        const days = diff > 0 ? diff : 0;
                                        return (
                                          <div className="text-[10px] text-emerald-300 font-mono font-bold flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                                            <span>Quedan {days}d de plan</span>
                                          </div>
                                        );
                                      }
                                      return (
                                        <div className="text-[10px] text-emerald-300 font-mono font-bold flex items-center gap-1 mt-0.5">
                                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                          <span>Acceso Anual / Activo</span>
                                        </div>
                                      );
                                    } else if (doc.paymentStatus === 'prueba') {
                                      const trial = getDoctorTrialStatus(doc);
                                      return (
                                        <div className="text-[10px] text-cyan-300 font-mono font-bold flex items-center gap-1 mt-0.5">
                                          <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                                          <span>Prueba: {trial.daysLeft}d restantes</span>
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <div className="text-[10px] text-rose-400 font-mono font-bold flex items-center gap-1 mt-0.5">
                                          <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                                          <span>Acceso Cortado / Vencido</span>
                                        </div>
                                      );
                                    }
                                  })()}
                                </div>
                              );
                            })()}
                          </td>

                          {/* EL "PLAY" DEL CREADOR (Boton de Activación y Cortar) */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              
                              {/* ACTIVAR O GESTIONAR PLAN ÉLITE */}
                              {(() => {
                                const isEliteDoc = Boolean(doc.isElite || doc.paidPlanName?.toLowerCase().includes('élite') || doc.paidPlanName?.toLowerCase().includes('elite') || doc.subscriptionPlan === 'elite');
                                return (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActivatingEliteDoc(doc);
                                      setEliteDaysInput(doc.eliteDays || 30);
                                      setEliteCustomNotes(doc.eliteNotes || '');
                                    }}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                      isEliteDoc
                                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white border border-purple-400/60 shadow-md ring-1 ring-purple-300/40 hover:brightness-110'
                                        : 'bg-purple-950/70 hover:bg-purple-900 text-purple-200 border border-purple-500/40 hover:border-purple-400'
                                    }`}
                                    title="Activar o renovar Plan Élite por una cantidad personalizada de días"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                    <span>{isEliteDoc ? '💎 Élite Activo' : '💎 Plan Élite'}</span>
                                  </button>
                                );
                              })()}

                              {/* VIP ACCESS TOGGLE FOR ESTUDIO DE DISEÑO */}
                              <button
                                type="button"
                                onClick={() => {
                                  const nextVip = !doc.isVip;
                                  const updated: DoctorConfig = {
                                    ...doc,
                                    isVip: nextVip,
                                  };
                                  if (onUpdateDoctor) onUpdateDoctor(updated);
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                                  doc.isVip || doc.subscriptionPlan === 'anual'
                                    ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 hover:bg-amber-500/40 shadow-xs'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                                }`}
                                title={doc.isVip || doc.subscriptionPlan === 'anual' ? 'Usuario VIP con Estudio de Diseño PRO activo. Clic para desactivar.' : 'Clic para conceder acceso VIP con Estudio de Diseño PRO'}
                              >
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                                <span>{doc.isVip || doc.subscriptionPlan === 'anual' ? 'VIP 👑' : '+ VIP'}</span>
                              </button>

                              {/* PROMINENT "DAR PLAY" BUTTON */}
                              <button
                                type="button"
                                onClick={() => setActivatingPlayDoc(doc)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                                  isPending
                                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 ring-2 ring-emerald-400/50 scale-105 animate-pulse'
                                    : 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40'
                                }`}
                                title="Aprobar pago y dar acceso definitivo a este médico"
                              >
                                <Play className="w-4 h-4 fill-current" />
                                <span>▶ DAR PLAY</span>
                              </button>

                              {/* CORTAR / SUSPENDER ACCESO BUTTON */}
                              {(doc.paymentStatus === 'activo' || doc.isPaidClient || doc.paymentStatus === 'prueba') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`¿Está seguro de CORTAR O SUSPENDER el acceso al médico ${doc.doctorName}? El usuario no podrá emitir más documentos hasta que vuelva a dar 'Play'.`)) {
                                      const updated: DoctorConfig = {
                                        ...doc,
                                        paymentStatus: 'pendiente',
                                        isPaidClient: false,
                                      };
                                      if (onUpdateDoctor) onUpdateDoctor(updated);
                                      const msg = `*Aviso de Suscripción Digital Médico* 🩺\nEstimado(a) Dr(a). *${doc.doctorName}*:\nSu acceso ha sido temporalmente suspendido. Por favor comuníquese con la Administración de Digital Médic para verificar su pago o renovar su plan.`;
                                      navigator.clipboard.writeText(msg);
                                      alert(`⛔ Se ha cortado el acceso a ${doc.doctorName}. Se ha copiado el aviso de suspensión para enviárselo por WhatsApp.`);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/50 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Cortar o suspender el acceso de este médico inmediatamente"
                                >
                                  <X className="w-3.5 h-3.5 text-rose-400" />
                                  <span>⛔ Cortar</span>
                                </button>
                              )}

                              {/* Edit Logo, Sello y Firma */}
                              <button
                                type="button"
                                onClick={() => setEditingRecipeDoctor(doc)}
                                className="px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105"
                                title="Editar Logo, Sello, Firma y Membrete de este médico"
                              >
                                <Palette className="w-3.5 h-3.5 text-amber-300" />
                                <span>Logo, Sello y Firma</span>
                              </button>

                              {/* Entrar a la App como este Médico */}
                              {onLoginAsDoctor && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onLoginAsDoctor(doc);
                                    onClose();
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105"
                                  title="Ingresar a la app con la sesión activa de este médico para prescribir o entrar a su Estudio de Diseño"
                                >
                                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Entrar como Médico</span>
                                </button>
                              )}

                              {/* WhatsApp Copy Credentials */}
                              <button
                                onClick={() => copyDoctorCredentialsWhatsApp(doc)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all cursor-pointer"
                                title="Copiar datos para WhatsApp"
                              >
                                {copiedDoctorId === doc.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>

                              {/* Delete Doctor */}
                              {onDeleteDoctor && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`¿Está seguro de eliminar permanentemente al médico ${doc.doctorName}?`)) {
                                      onDeleteDoctor(doc.id);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                  title="Eliminar médico permanentemente de la base de datos"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Borrar Médico</span>
                                </button>
                              )}

                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Panel de Administrador · Digital Médico Studio</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-xs cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: FULL PHOTO COMPROBANTE DE PAGO PREVIEW          */}
      {/* ======================================================== */}
      {viewingVoucherDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 text-white space-y-4 relative shadow-2xl">
            <button
              onClick={() => setViewingVoucherDoc(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <ImageIcon className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="font-bold text-base text-white">Comprobante de Pago Adjuntado</h3>
                <p className="text-xs text-slate-400">Dr(a). {viewingVoucherDoc.doctorName} · CI: {viewingVoucherDoc.ci}</p>
              </div>
            </div>

            {viewingVoucherDoc.paymentVoucherImg ? (
              <div className="bg-black p-2 rounded-2xl border border-slate-800 max-h-[50vh] flex items-center justify-center overflow-hidden">
                <img 
                  src={viewingVoucherDoc.paymentVoucherImg} 
                  alt="Foto Comprobante de Pago" 
                  className="max-h-[48vh] w-auto object-contain rounded-xl"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No hay foto de comprobante guardada.</p>
            )}

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1">
              <div><strong className="text-amber-300">Plan Solicitado:</strong> {viewingVoucherDoc.requestedPlan || viewingVoucherDoc.subscriptionPlan || 'Suscripción'}</div>
              <div><strong className="text-slate-400">Aviso / Referencia:</strong> {viewingVoucherDoc.paymentVoucherNotes || 'Sin notas adicionales'}</div>
              <div><strong className="text-slate-400">Contacto:</strong> {viewingVoucherDoc.phone} · {viewingVoucherDoc.email}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewingVoucherDoc(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const docToAct = viewingVoucherDoc;
                  setViewingVoucherDoc(null);
                  setActivatingPlayDoc(docToAct);
                }}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>▶ DAR PLAY Y ACTIVAR AHORA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DIÁLOGO DE ACTIVACIÓN "DAR PLAY" DEL CREADOR    */}
      {/* ======================================================== */}
      {activatingPlayDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/70 rounded-3xl max-w-lg w-full p-6 text-white space-y-5 relative shadow-2xl">
            <button
              onClick={() => setActivatingPlayDoc(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
              </div>
              <h3 className="font-black text-xl text-white">
                Dar Play: Activar Cuenta Definitiva
              </h3>
              <p className="text-xs text-slate-300">
                Aprobar acceso para Dr(a). <strong>{activatingPlayDoc.doctorName}</strong> (C.I: {activatingPlayDoc.ci})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-2 uppercase">
                Seleccione el Plan Autorizado para este Médico:
              </label>
              <div className="space-y-2">
                {[
                  { id: 'mensual', name: 'Mensual PRO', price: '$10 USD / mes', desc: 'Acceso a récipes, historias, informes y reposos' },
                  { id: 'trimestral', name: 'Trimestral PRO', price: '$28 USD / 3 meses', desc: 'Descuento especial de 3 meses' },
                  { id: 'anual', name: 'Anual VIP', price: '$95 USD / año', desc: 'Acceso total + Estudio de Diseño PRO' },
                  { id: 'elite', name: '💎 Plan Élite Personalizado', price: `${eliteDaysInput} Días`, desc: 'Acceso Élite exclusivo por la cantidad de días que defina' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setChosenPlanForPlay(p.id as any)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      chosenPlanForPlay === p.id
                        ? 'bg-emerald-500/20 border-emerald-400 text-white ring-2 ring-emerald-400/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.desc}</div>
                    </div>
                    <span className="font-black text-emerald-300 text-xs">{p.price}</span>
                  </button>
                ))}
              </div>

              {chosenPlanForPlay === 'elite' && (
                <div className="mt-3 p-3 bg-purple-950/50 border border-purple-500/50 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">Días a otorgar para el Plan Élite:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={3650}
                        value={eliteDaysInput}
                        onChange={(e) => setEliteDaysInput(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-2 py-1 bg-slate-900 border border-purple-400 rounded-lg text-white font-mono font-bold text-center text-xs"
                      />
                      <span className="text-xs text-slate-400">días</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Vence el: <strong className="text-amber-300 font-mono">{new Date(Date.now() + eliteDaysInput * 24 * 60 * 60 * 1000).toLocaleDateString('es-VE')}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleConfirmDarPlay(activatingPlayDoc, chosenPlanForPlay, eliteDaysInput)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span> Confirmar Activación ("Dar Play") Ya</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ACTIVAR PLAN ÉLITE PERSONALIZADO A FUTURO      */}
      {/* ======================================================== */}
      {activatingEliteDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 md:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-purple-500/70 rounded-3xl max-w-xl w-full p-5 sm:p-7 text-white space-y-5 relative shadow-2xl overflow-y-auto max-h-[95vh]">
            <button
              onClick={() => setActivatingEliteDoc(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white font-black flex items-center justify-center mx-auto shadow-xl shadow-purple-600/30 border-2 border-purple-300/40">
                <Sparkles className="w-8 h-8 text-amber-200" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 text-xs font-black uppercase tracking-wider">
                👑 Control Exclusivo del Administrador Master
              </div>
              <h3 className="font-black text-xl text-white">
                Activar Plan Élite Personalizado
              </h3>
              <p className="text-xs text-slate-300">
                Dr(a). <strong>{activatingEliteDoc.doctorName}</strong> (C.I: {activatingEliteDoc.ci} · {activatingEliteDoc.specialty})
              </p>
            </div>

            {/* Aviso aclaratorio de la salida del Plan Élite */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-950 to-purple-950/60 border border-purple-500/30 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>¿Cómo funciona el Plan Élite?</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                El <strong>Plan Élite</strong> saldrá próximamente como un paquete premium de cobro oficial. Como Administrador Master, esta función le permite <strong>activarlo de forma anticipada o por cortesía</strong> a los médicos que usted considere, asignando la <strong>cantidad exacta de días</strong> de acceso continuo que desee.
              </p>
            </div>

            {/* Selector de días */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wide">
                  1. Seleccione o Escriba la Cantidad de Días:
                </label>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                  {eliteDaysInput} Días
                </span>
              </div>

              {/* Botones de días predeterminados */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[
                  { days: 7, label: '7 Días' },
                  { days: 15, label: '15 Días' },
                  { days: 30, label: '30 Días (1 Mes)' },
                  { days: 60, label: '60 Días (2 Meses)' },
                  { days: 90, label: '90 Días (3 Meses)' },
                  { days: 180, label: '180 Días (6 Meses)' },
                  { days: 365, label: '365 Días (1 Año)' },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setEliteDaysInput(preset.days)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      eliteDaysInput === preset.days
                        ? 'bg-purple-600 text-white border-purple-300 shadow-md ring-2 ring-purple-400/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-purple-500/40'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Input manual libre para cualquier número de días */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-300 font-semibold">
                  O ingrese manualmente la cantidad exacta de días:
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min={1}
                    max={3650}
                    value={eliteDaysInput}
                    onChange={(e) => setEliteDaysInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-1.5 bg-slate-900 border border-purple-400 rounded-xl text-white font-mono font-bold text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <span className="text-xs text-slate-400 font-bold">días</span>
                </div>
              </div>
            </div>

            {/* Cálculo de fecha de vigencia y resumen en tiempo real */}
            {(() => {
              const expiresDate = new Date(Date.now() + Math.max(1, eliteDaysInput) * 24 * 60 * 60 * 1000);
              const formattedExpires = expiresDate.toLocaleDateString('es-VE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
              return (
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Inicio de vigencia:</span>
                    <span className="text-white font-bold">Hoy ({new Date().toLocaleDateString('es-VE')})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300 font-bold">Fecha de vencimiento calculada:</span>
                    <span className="text-amber-300 font-mono font-bold uppercase">{formattedExpires}</span>
                  </div>
                  <div className="pt-2 border-t border-purple-900/60 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Acceso total ilimitado a todos los formatos médicos oficiales</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Estudio de Diseño PRO desbloqueado (sellos notariales y membretes)</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Notas opcionales */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Motivo / Nota de Concesión (Opcional):
              </label>
              <input
                type="text"
                value={eliteCustomNotes}
                onChange={(e) => setEliteCustomNotes(e.target.value)}
                placeholder="Ej: Cortesía del Administrador, Prueba piloto especial, etc."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Botones de acción */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmActivateElite(activatingEliteDoc, eliteDaysInput, eliteCustomNotes)}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>Confirmar y Activar Plan Élite ({eliteDaysInput} Días)</span>
              </button>

              {(activatingEliteDoc.isElite || activatingEliteDoc.paidPlanName?.toLowerCase().includes('élite')) && (
                <button
                  type="button"
                  onClick={() => handleDeactivateElite(activatingEliteDoc)}
                  className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  ⛔ Desactivar / Cancelar Plan Élite de este Médico
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Sub-Modals */}
      {isCreateDoctorOpen && (
        <AdminCreateDoctorModal
          isOpen={isCreateDoctorOpen}
          onClose={() => setIsCreateDoctorOpen(false)}
          onSaveNewDoctor={(newDoc) => {
            if (onAddNewDoctor) onAddNewDoctor(newDoc);
            else if (onUpdateDoctor) onUpdateDoctor(newDoc);
          }}
          onEditDoctorDesign={(doc) => {
            setIsCreateDoctorOpen(false);
            setEditingRecipeDoctor(doc);
          }}
          onLoginAsDoctor={(doc) => {
            setIsCreateDoctorOpen(false);
            if (onLoginAsDoctor) onLoginAsDoctor(doc);
          }}
        />
      )}

      {editingRecipeDoctor && (
        <AdminDoctorRecipeEditorModal
          isOpen={!!editingRecipeDoctor}
          onClose={() => setEditingRecipeDoctor(null)}
          doctor={editingRecipeDoctor}
          onSaveDoctor={(updated) => {
            if (onUpdateDoctor) onUpdateDoctor(updated);
            setEditingRecipeDoctor(null);
          }}
        />
      )}

      {/* Modal para Editar Cuentas y Datos de Pago (Solo 3 Métodos + Tasa Binance en Vivo) */}
      <EditPaymentConfigModal
        isOpen={isPaymentAccountsModalOpen}
        onClose={() => setIsPaymentAccountsModalOpen(false)}
      />

    </div>
  );
};
