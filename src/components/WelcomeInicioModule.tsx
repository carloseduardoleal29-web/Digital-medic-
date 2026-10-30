import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  FileCheck2, 
  ClipboardList, 
  ShieldCheck, 
  Eye, 
  ArrowRight,
  Edit3, 
  LogOut, 
  Calendar, 
  CheckCircle2,
  Stethoscope,
  Users,
  Palette,
  CreditCard,
  KeyRound,
  Building2,
  Lock,
  Sparkles,
  ChevronRight,
  Menu,
  Phone,
  UserPlus,
  Search,
  Check,
  X,
  Mail,
  MapPin,
  Clock,
  UserCheck,
  Pill,
  Crown,
  Handshake,
  Smartphone,
  FlaskConical
} from 'lucide-react';
import { DoctorConfig, ActiveModule, RecipeItem, ClinicalRecord, MedicalReport, MedicalRestCert } from '../types';
import { getDoctorTrialStatus } from '../utils/trialHelper';
import { DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, getMedicalSymbolSVG, CARLOS_LEAL_DEVELOPER_LOGO_SVG } from '../data/defaultAssets';
import { CeLealStudioLogo } from './CeLealStudioLogo';
import { PWAInstallButton } from './PWAInstallButton';

export interface NewPatientFormData {
  patientFirstName: string;
  patientLastName: string;
  patientCI: string;
  patientAge: string;
  patientGender: 'M' | 'F' | 'Otro';
  patientAddress: string;
  patientPhone: string;
  patientEmail: string;
  diagnosis?: string;
  rp?: string;
}

interface WelcomeInicioModuleProps {
  config: DoctorConfig;
  onNavigate: (module: ActiveModule) => void;
  onOpenPreview: () => void;
  onOpenFormatPreview?: (mod: ActiveModule) => void;
  onOpenAuthModal?: () => void;
  onOpenVaultModal?: () => void;
  onResetAllData?: () => void;
  onSaveAll?: () => void;
  onUpdateConfig: (updated: Partial<DoctorConfig>) => void;
  onUnlockDesignerDirectly?: () => void;
  onOpenPinModal: () => void;
  onOpenLeftDrawer: () => void;
  onOpenPatientBank: () => void;
  onSaveNewPatientAndSyncAll: (patient: NewPatientFormData) => void;
  onLoadPatientToAllFormats: (patient: {
    patientName: string;
    patientCI: string;
    patientAge: string;
    patientPhone?: string;
    patientEmail?: string;
    patientAddress?: string;
    diagnosis?: string;
    rp?: string;
  }) => void;
  onLogout: () => void;
  patientCount?: number;
  existingPatients?: Array<{
    id: string;
    patientName: string;
    patientCI: string;
    patientAge: string;
    patientPhone?: string;
    patientEmail?: string;
    patientAddress?: string;
    date: string;
    diagnosis?: string;
    rp?: string;
  }>;
  activePatientName?: string;
  activePatientCI?: string;
  activePatientAge?: string;
  activePatientPhone?: string;
  activePatientEmail?: string;
  activePatientAddress?: string;
  onClearActivePatient?: () => void;
  onOpenSyncDevices?: () => void;
}

export const WelcomeInicioModule: React.FC<WelcomeInicioModuleProps> = ({
  config,
  onNavigate,
  onOpenPreview,
  onOpenFormatPreview,
  onOpenAuthModal,
  onOpenVaultModal,
  onResetAllData,
  onSaveAll,
  onUpdateConfig,
  onUnlockDesignerDirectly,
  onOpenPinModal,
  onOpenLeftDrawer,
  onOpenPatientBank,
  onOpenSyncDevices,
  onSaveNewPatientAndSyncAll,
  onLoadPatientToAllFormats,
  onLogout,
  patientCount = 0,
  existingPatients = [],
  activePatientName = '',
  activePatientCI = '',
  activePatientAge = '',
  activePatientPhone = '',
  activePatientEmail = '',
  activePatientAddress = '',
  onClearActivePatient
}) => {
  // Patient Registration Modal State
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientFirstName, setPatientFirstName] = useState('');
  const [patientLastName, setPatientLastName] = useState('');
  const [patientCI, setPatientCI] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'M' | 'F' | 'Otro'>('M');
  const [patientAddress, setPatientAddress] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientDiagnosis, setPatientDiagnosis] = useState('');

  // Phone helper states for structured country & operator selector
  const [phoneCountry, setPhoneCountry] = useState('+58');
  const [phoneOperator, setPhoneOperator] = useState('0414');
  const [phoneLocal, setPhoneLocal] = useState('');

  // Auto-sync patientPhone when structured helper fields change
  React.useEffect(() => {
    if (phoneLocal) {
      const displayOp = phoneOperator ? (phoneOperator.startsWith('0') ? phoneOperator : '0' + phoneOperator) : '';
      const formatted = displayOp 
        ? `${phoneCountry} ${displayOp} ${phoneLocal}`
        : `${phoneCountry} ${phoneLocal}`;
      setPatientPhone(formatted);
    } else {
      setPatientPhone('');
    }
  }, [phoneCountry, phoneOperator, phoneLocal]);

  // Quick Patient Search Modal State
  const [isSearchPatientModalOpen, setIsSearchPatientModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRegisterPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirstName = patientFirstName.trim();
    const cleanLastName = patientLastName.trim();
    
    if (!cleanFirstName && !cleanLastName) {
      alert('Por favor ingrese al menos el nombre o apellido del paciente.');
      return;
    }

    onSaveNewPatientAndSyncAll({
      patientFirstName: cleanFirstName,
      patientLastName: cleanLastName,
      patientCI: patientCI.trim() || 'N/A',
      patientAge: patientAge.trim() ? (patientAge.toLowerCase().includes('año') ? patientAge.trim() : `${patientAge.trim()} años`) : '',
      patientGender,
      patientAddress: patientAddress.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim(),
      diagnosis: patientDiagnosis.trim() || 'Consulta médica general'
    });

    // Reset Form
    setPatientFirstName('');
    setPatientLastName('');
    setPatientCI('');
    setPatientAge('');
    setPatientAddress('');
    setPatientPhone('');
    setPatientEmail('');
    setPatientDiagnosis('');
    setPhoneCountry('+58');
    setPhoneOperator('0414');
    setPhoneLocal('');
    setIsPatientModalOpen(false);
  };

  // Filter existing recorded patients for quick search
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return existingPatients;
    const q = searchQuery.toLowerCase();
    return existingPatients.filter(
      (p) =>
        p.patientName.toLowerCase().includes(q) ||
        p.patientCI.toLowerCase().includes(q) ||
        (p.patientPhone && p.patientPhone.toLowerCase().includes(q)) ||
        (p.diagnosis && p.diagnosis.toLowerCase().includes(q))
    );
  }, [existingPatients, searchQuery]);

  // Only Administrator and VIP Users can see and access Estudio de Diseño
  const isAuthorizedForDesigner = Boolean(
    config.isAdmin ||
    config.isVip ||
    config.id === 'doc-admin-master' ||
    config.subscriptionPlan === 'anual' ||
    config.subscriptionPlan === 'diseno-pro' ||
    config.subscriptionPlan === 'clinica-full' ||
    (typeof window !== 'undefined' && (
      sessionStorage.getItem('digital_medic_vip') === 'true' ||
      sessionStorage.getItem('digital_medic_unlocked_2534') === 'true'
    ))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* 1. HERO HEADER: CLEAN, SLEEK LIGHT COMMAND BAR WITH LOGO, DEVELOPER BADGE & PATIENT CONTROLS */}
      <div className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-blue-200/80 shadow-xl relative overflow-hidden">
        
        {/* Decorative subtle medical ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-cyan-500/10 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
          
          {/* Left: Big Legible Official Logo & Stylized Brand Identity (Column on mobile, row on tablet/desktop) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-5 flex-1 min-w-0 w-full">
            
            {/* Grand Crisp Vector Logo Container */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-blue-900 via-indigo-900 to-blue-950 p-1.5 sm:p-2 shrink-0 shadow-lg border-2 border-blue-400/40 flex items-center justify-center ring-2 sm:ring-4 ring-blue-500/15">
              <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl flex items-center justify-center p-1.5 sm:p-2 overflow-hidden shadow-inner">
                <img 
                  src={DIGITAL_MEDIC_OFFICIAL_LOGO_SVG} 
                  alt="Digital Médic Logo Oficial" 
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
            </div>

            {/* App Brand Header & Developer Badge */}
            <div className="space-y-2 min-w-0 flex-1">
              
              <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-blue-700 px-2.5 sm:px-3.5 py-1 rounded-xl border border-blue-500 flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse"></span>
                  DIGITAL MÉDIC
                </span>
                <span className="text-[11px] sm:text-xs font-black text-blue-900 bg-blue-100/90 px-2.5 sm:px-3 py-1 rounded-xl border border-blue-300 shadow-2xs">
                  Formatos Médicos Digitales 2026
                </span>

                {/* Strategic Developer Logo: C.E. LEAL studio */}
                <CeLealStudioLogo variant="badge" />
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-snug sm:leading-relaxed font-semibold">
                Prescripción clínica oficial · Récipes Médicos · Informes · Reposos laborales · Historias Clínicas · Indicaciones
              </p>

              {/* Saludo médico oficial limpio y profesional */}
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <div className="inline-flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm cursor-default max-w-full">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-base sm:text-xl md:text-2xl font-black text-slate-900 font-sans tracking-tight truncate">
                    ¡Hola, {config.doctorName || 'Dr(a). Médico'}!
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right: PATIENT ADMISSION & SEARCH CONTROLS (Compact 3-Column Grid on Mobile, Full Width Column on Desktop) */}
          <div className="w-full lg:w-80 shrink-0 grid grid-cols-3 lg:flex lg:flex-col gap-1.5 sm:gap-2.5">
            
            {/* BOTÓN PRINCIPAL: INGRESAR PACIENTE */}
            <button
              onClick={() => setIsPatientModalOpen(true)}
              className="w-full p-2 sm:p-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl sm:rounded-2xl transition-all flex flex-col lg:flex-row items-center justify-center lg:justify-between text-center lg:text-left shadow-md shadow-emerald-700/20 group hover:scale-[1.01] border border-emerald-400/40 cursor-pointer min-h-[64px] lg:min-h-0"
            >
              <div className="flex flex-col lg:flex-row items-center gap-1 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-black uppercase tracking-tight flex items-center justify-center lg:justify-start gap-1">
                    <span className="truncate">Ingresar</span>
                    <span className="hidden min-[380px]:inline lg:inline">Paciente</span>
                    <span className="px-1 py-0.2 bg-white text-emerald-900 text-[8px] font-black rounded font-mono hidden sm:inline">
                      +
                    </span>
                  </div>
                  <div className="hidden lg:block text-[10px] sm:text-[11px] text-emerald-100 mt-0.5 leading-tight">
                    Nombre, C.I., Edad, Teléfono y Correo
                  </div>
                </div>
              </div>
              <ArrowRight className="hidden lg:block w-4 h-4 text-emerald-100 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* BOTÓN SECUNDARIO: BUSCAR PACIENTE GRABADO */}
            <button
              onClick={() => setIsSearchPatientModalOpen(true)}
              className="w-full p-2 sm:p-3 bg-slate-100 hover:bg-blue-50 text-slate-900 rounded-xl sm:rounded-2xl transition-all flex flex-col lg:flex-row items-center justify-center lg:justify-between text-center lg:text-left shadow-sm group hover:scale-[1.01] border border-slate-300 cursor-pointer min-h-[64px] lg:min-h-0"
            >
              <div className="flex flex-col lg:flex-row items-center gap-1 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-black uppercase tracking-tight text-slate-900 flex items-center justify-center lg:justify-start gap-1">
                    <span className="truncate">Buscar</span>
                    <span className="hidden min-[380px]:inline lg:inline">Paciente</span>
                    {existingPatients.length > 0 && (
                      <span className="text-[10px] text-blue-700 font-mono font-black">({existingPatients.length})</span>
                    )}
                  </div>
                  <div className="hidden lg:block text-[10px] sm:text-[10.5px] text-slate-600">
                    Cargar datos guardados a todos los formatos
                  </div>
                </div>
              </div>
              <ChevronRight className="hidden lg:block w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* BANNER ANIMADO LLAMATIVO: CREAR RÉCIPE */}
            <button
              onClick={() => onNavigate('recipe-master')}
              className="w-full p-2 sm:p-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl sm:rounded-2xl transition-all flex flex-col lg:flex-row items-center justify-center lg:justify-between text-center lg:text-left shadow-lg shadow-blue-600/25 group hover:scale-[1.02] border border-cyan-300/60 cursor-pointer relative overflow-hidden min-h-[64px] lg:min-h-0"
            >
              {/* Shimmer background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row items-center gap-1 sm:gap-2.5 relative z-10">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30 shadow-inner group-hover:rotate-12 transition-transform">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-black uppercase tracking-tight flex items-center justify-center lg:justify-start gap-1 text-white">
                    <span>Crear</span>
                    <span className="hidden min-[380px]:inline lg:inline">Récipe</span>
                    <span className="px-1 py-0.2 bg-amber-400 text-slate-950 text-[8px] font-black rounded font-mono shadow-xs">
                      ✨
                    </span>
                  </div>
                  <div className="hidden lg:block text-[10px] sm:text-[11px] text-cyan-100 mt-0.5 font-bold leading-tight">
                    Redactar prescripción rápida & descargar PDF
                  </div>
                </div>
              </div>
            </button>

          </div>

        </div>
      </div>

      {/* PACIENTE ACTIVO ECOSYSTEM PANEL (COMMAND CENTER) */}
      {activePatientName && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-850">
                  Paciente Activo en el Consultorio Digital
                </span>
              </div>
              
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 font-sans flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-600 text-white p-1 rounded-lg shrink-0">👤</span>
                <span>{activePatientName}</span>
              </h3>
              
              <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-4 gap-y-1.5 text-xs font-bold text-slate-700">
                {activePatientCI && (
                  <span className="bg-slate-200/80 text-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-300 shadow-2xs">
                    C.I: <strong className="text-slate-950 font-mono">{activePatientCI}</strong>
                  </span>
                )}
                {activePatientAge && (
                  <span className="bg-slate-200/80 text-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-300 shadow-2xs">
                    Edad: <strong className="text-slate-950">{activePatientAge}</strong>
                  </span>
                )}
                {activePatientPhone && (
                  <span className="bg-slate-200/80 text-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-300 shadow-2xs">
                    📱 {activePatientPhone}
                  </span>
                )}
                {activePatientEmail && (
                  <span className="bg-slate-200/80 text-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-300 shadow-2xs truncate max-w-[200px] sm:max-w-none">
                    ✉️ {activePatientEmail}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl pt-1 font-semibold">
                👉 Este paciente se encuentra <strong className="text-emerald-800">sincronizado en tiempo real</strong> en todos los formatos del consultorio. Seleccione abajo el módulo que desea emitir para él:
              </p>
            </div>
            
            <div className="shrink-0 pt-2 md:pt-0 w-full md:w-auto">
              <button
                type="button"
                onClick={onClearActivePatient}
                className="w-full md:w-auto px-4 py-2.5 sm:px-5 sm:py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl sm:rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 border-2 border-rose-500 transition-all hover:scale-[1.02] cursor-pointer"
                title="Limpiar paciente actual para ingresar uno nuevo"
              >
                <X className="w-4 h-4 text-white shrink-0" />
                <span>Nuevo Paciente (Limpiar)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. THE CORE MEDICAL MODULES: RÉCIPES, INFORME MÉDICO, CONSTANCIA/REPOSO, HISTORIA CLÍNICA, INDICACIONES, ESTUDIO DE DISEÑO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Módulos de Atención Médica Digital</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Seleccione el módulo para redactar, imprimir o enviar al paciente:
          </span>
        </div>

        {/* Beautiful Modern Responsive Grid (2 columns on mobile, 3 on tablet/desktop) */}
        <div className="grid grid-cols-2 min-[640px]:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-4">
          
          {/* 1. RÉCIPES MÉDICOS */}
          <div 
            onClick={() => onNavigate('recipe-master')}
            className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-blue-500/70 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-0.5 shadow-xs"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER (COMPACT FOR MOBILE) */}
            <div className="relative h-14 min-[400px]:h-16 sm:h-28 w-full bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 overflow-hidden flex items-center justify-center p-1.5 sm:p-3">
              {/* Background ambient glows */}
              <div className="absolute -top-6 -right-6 w-16 h-16 sm:w-28 sm:h-28 bg-cyan-400/25 rounded-full blur-lg sm:blur-xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 sm:w-24 sm:h-24 bg-blue-500/20 rounded-full blur-md sm:blur-lg" />
              
              {/* Stylized Vector Illustration: Prescription Sheet + Rx Badge */}
              <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5 transform group-hover:scale-105 transition-all duration-300">
                <div className="w-9 h-11 min-[400px]:w-11 min-[400px]:h-13 sm:w-18 sm:h-24 bg-white/95 backdrop-blur-md rounded-md sm:rounded-lg shadow-md p-1 sm:p-2 border border-white/60 flex flex-col justify-between transform -rotate-3 group-hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-0.5">
                    <span className="text-[5px] sm:text-[8px] font-black tracking-tighter text-blue-800">DIGITAL MÉDIC</span>
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="space-y-0.5 my-0.5">
                    <div className="text-[7px] sm:text-[10px] font-black italic text-blue-600 font-serif leading-none">Rp.</div>
                    <div className="w-full h-0.5 bg-slate-200 rounded"></div>
                  </div>
                  <div className="pt-0.5 border-t border-slate-100 flex items-center justify-between">
                    <div className="w-2.5 sm:w-4 h-0.5 bg-slate-300 rounded"></div>
                    <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full bg-blue-50 border border-blue-300 flex items-center justify-center text-[4px] sm:text-[6px] text-blue-700 font-bold">✓</div>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 sm:gap-1.5">
                  <div className="px-1 sm:px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/40 rounded sm:rounded-md shadow-xs flex items-center gap-0.5 text-white">
                    <span className="text-[6.5px] sm:text-[9px] font-black bg-cyan-400 text-slate-950 px-0.5 rounded font-mono">Rx</span>
                    <span className="text-[6.5px] sm:text-[9px] font-bold hidden min-[360px]:inline">Digital</span>
                  </div>
                  <div className="w-4 h-4 sm:w-7 sm:h-7 rounded sm:rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-xs transform rotate-12 group-hover:rotate-45 transition-transform">
                    <Pill className="w-2 sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                </div>
              </div>

              {/* Top Tag */}
              <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-20">
                <span className="px-1 sm:px-2 py-0.2 sm:py-0.5 bg-slate-950/80 backdrop-blur-md text-cyan-300 text-[6.5px] sm:text-[8.5px] font-black uppercase tracking-wider rounded border border-cyan-500/30">
                  Asistente
                </span>
              </div>
            </div>
            
            {/* CARD BODY */}
            <div className="p-2 sm:p-3.5 space-y-1 sm:space-y-2.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-blue-50/25">
              <div>
                <h3 className="font-black text-slate-900 text-[11px] min-[360px]:text-xs sm:text-base group-hover:text-blue-600 transition-colors flex items-center justify-between gap-1 leading-tight">
                  <span className="truncate">Récipes Médicos</span>
                  <span className="text-[6.5px] sm:text-[8.5px] font-extrabold text-blue-700 bg-blue-100 px-1 py-0.2 rounded uppercase tracking-wider shrink-0">
                    Rx
                  </span>
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 leading-tight line-clamp-1 sm:line-clamp-2">
                  Prescripción guiada: Paciente ➜ Fármacos ➜ PDF / WhatsApp.
                </p>
              </div>

              <div className="pt-1 sm:pt-2 border-t border-slate-200/60 flex flex-col gap-1 sm:gap-2">
                {activePatientName && (
                  <div className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/25 rounded-md py-0.5 px-1 text-center text-[8px] sm:text-[10px] font-black flex items-center justify-center gap-1">
                    <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{activePatientName}</span>
                  </div>
                )}
                
                <div className="flex gap-1 sm:gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenFormatPreview) onOpenFormatPreview('recipe-master');
                      else onOpenPreview();
                    }}
                    className="px-1.5 sm:px-2.5 py-1 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs flex items-center justify-center gap-0.5 transition-all cursor-pointer border border-blue-200 shrink-0"
                    title="Ver vista previa de la hoja de récipe"
                  >
                    <Eye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                    <span>DISEÑO</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('recipe-master');
                    }}
                    className="flex-1 py-1 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs uppercase tracking-tight flex items-center justify-center gap-0.5 transition-all shadow-xs cursor-pointer text-center truncate"
                  >
                    <span className="truncate">{activePatientName ? 'Emitir' : 'Redactar'}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. EXÁMENES Y LABORATORIOS */}
          <div 
            onClick={() => onNavigate('examenes')}
            className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-cyan-500/70 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-0.5 shadow-xs"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER (COMPACT FOR MOBILE) */}
            <div className="relative h-14 min-[400px]:h-16 sm:h-28 w-full bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-900 overflow-hidden flex items-center justify-center p-1.5 sm:p-3">
              <div className="absolute -top-6 -right-6 w-16 h-16 sm:w-28 sm:h-28 bg-cyan-400/25 rounded-full blur-lg sm:blur-xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 sm:w-24 sm:h-24 bg-blue-500/20 rounded-full blur-md sm:blur-lg" />

              <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5 transform group-hover:scale-105 transition-all duration-300">
                <div className="w-10 h-11 min-[400px]:w-12 min-[400px]:h-13 sm:w-18 sm:h-24 bg-white/95 backdrop-blur-md rounded-md sm:rounded-lg shadow-md p-1 sm:p-2 border border-white/60 flex flex-col justify-between transform -rotate-2 group-hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between border-b border-cyan-100 pb-0.5">
                    <span className="text-[5px] sm:text-[8px] font-black tracking-tighter text-cyan-900">LAB / RX</span>
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-cyan-500"></span>
                  </div>
                  <div className="space-y-0.5 my-0.5">
                    <div className="text-[5px] sm:text-[7px] font-bold text-slate-800 leading-none">🩸 Perfil 20</div>
                    <div className="text-[5px] sm:text-[7px] font-bold text-slate-800 leading-none">🩻 Rx Tórax</div>
                  </div>
                  <div className="pt-0.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[5px] sm:text-[7px] text-cyan-700 font-bold">Orden</span>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-cyan-100 flex items-center justify-center text-[4px] sm:text-[6px] text-cyan-800 font-bold">🔬</div>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 sm:gap-1.5">
                  <div className="px-1 sm:px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/40 rounded sm:rounded-md shadow-xs flex items-center gap-0.5 text-white">
                    <FlaskConical className="w-2 sm:w-3 sm:h-3 text-cyan-300" />
                    <span className="text-[6.5px] sm:text-[9px] font-bold hidden min-[360px]:inline">Estudios</span>
                  </div>
                  <div className="w-4 h-4 sm:w-7 sm:h-7 rounded sm:rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-xs transform rotate-6 group-hover:rotate-12 transition-transform">
                    <FlaskConical className="w-2 sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                </div>
              </div>

              <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-20">
                <span className="px-1 sm:px-2 py-0.2 sm:py-0.5 bg-slate-950/80 backdrop-blur-md text-cyan-300 text-[6.5px] sm:text-[8.5px] font-black uppercase tracking-wider rounded border border-cyan-500/30">
                  Estudios
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-2 sm:p-3.5 space-y-1 sm:space-y-2.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-cyan-50/25">
              <div>
                <h3 className="font-black text-slate-900 text-[11px] min-[360px]:text-xs sm:text-base group-hover:text-cyan-700 transition-colors flex items-center justify-between gap-1 leading-tight">
                  <span className="truncate">Exámenes / Lab</span>
                  <span className="text-[6.5px] sm:text-[8.5px] font-extrabold text-cyan-800 bg-cyan-100 px-1 py-0.2 rounded uppercase tracking-wider shrink-0">
                    Orden
                  </span>
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 leading-tight line-clamp-1 sm:line-clamp-2">
                  Sangre, química, orina, Rx, ecografía y preparación.
                </p>
              </div>

              <div className="pt-1 sm:pt-2 border-t border-slate-200/60 flex flex-col gap-1 sm:gap-2">
                {activePatientName && (
                  <div className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/25 rounded-md py-0.5 px-1 text-center text-[8px] sm:text-[10px] font-black flex items-center justify-center gap-1">
                    <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{activePatientName}</span>
                  </div>
                )}
                
                <div className="flex gap-1 sm:gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenFormatPreview) onOpenFormatPreview('examenes');
                      else onNavigate('examenes');
                    }}
                    className="px-1.5 sm:px-2.5 py-1 sm:py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs flex items-center justify-center gap-0.5 transition-all cursor-pointer border border-cyan-200 shrink-0"
                    title="Ver vista previa de la orden de exámenes"
                  >
                    <Eye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-cyan-700 shrink-0" />
                    <span>DISEÑO</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('examenes');
                    }}
                    className="flex-1 py-1 sm:py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs uppercase tracking-tight flex items-center justify-center gap-0.5 transition-all shadow-xs cursor-pointer text-center truncate"
                  >
                    <span className="truncate">{activePatientName ? 'Emitir' : 'Indicar'}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. INFORME MÉDICO */}
          <div 
            onClick={() => onNavigate('informes')}
            className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-teal-500/70 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-0.5 shadow-xs"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER (COMPACT FOR MOBILE) */}
            <div className="relative h-14 min-[400px]:h-16 sm:h-28 w-full bg-gradient-to-br from-teal-600 via-emerald-700 to-slate-900 overflow-hidden flex items-center justify-center p-1.5 sm:p-3">
              <div className="absolute -top-6 -right-6 w-16 h-16 sm:w-28 sm:h-28 bg-emerald-400/25 rounded-full blur-lg sm:blur-xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 sm:w-24 sm:h-24 bg-teal-500/20 rounded-full blur-md sm:blur-lg" />

              <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5 transform group-hover:scale-105 transition-all duration-300">
                <div className="w-10 h-11 min-[400px]:w-12 min-[400px]:h-13 sm:w-18 sm:h-24 bg-white/95 backdrop-blur-md rounded-md sm:rounded-lg shadow-md p-1 sm:p-2 border border-white/60 flex flex-col justify-between transform rotate-2 group-hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-0.5">
                    <span className="text-[5px] sm:text-[8px] font-black tracking-tighter text-teal-800">INFORME</span>
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-teal-500"></span>
                  </div>
                  <div className="space-y-0.5 my-0.5">
                    <div className="w-full h-1 flex items-center">
                      <svg className="w-full h-1 text-teal-600" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M0,10 L30,10 L35,2 L42,18 L48,5 L54,14 L60,10 L100,10" />
                      </svg>
                    </div>
                    <div className="w-full h-0.5 bg-slate-200 rounded"></div>
                  </div>
                  <div className="pt-0.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[5px] sm:text-[7px] font-bold text-teal-700">OFICIAL</span>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-100 flex items-center justify-center text-[4px] sm:text-[6px] text-emerald-800 font-bold">★</div>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 sm:gap-1.5">
                  <div className="px-1 sm:px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/40 rounded sm:rounded-md shadow-xs flex items-center gap-0.5 text-white">
                    <FileCheck2 className="w-2 sm:w-3 sm:h-3 text-emerald-300" />
                    <span className="text-[6.5px] sm:text-[9px] font-bold hidden min-[360px]:inline">Clínico</span>
                  </div>
                  <div className="w-4 h-4 sm:w-7 sm:h-7 rounded sm:rounded-lg bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-xs transform -rotate-6 group-hover:rotate-0 transition-transform">
                    <Stethoscope className="w-2 sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                </div>
              </div>

              <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-20">
                <span className="px-1 sm:px-2 py-0.2 sm:py-0.5 bg-slate-950/80 backdrop-blur-md text-emerald-300 text-[6.5px] sm:text-[8.5px] font-black uppercase tracking-wider rounded border border-emerald-500/30">
                  Informe
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-2 sm:p-3.5 space-y-1 sm:space-y-2.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-teal-50/25">
              <div>
                <h3 className="font-black text-slate-900 text-[11px] min-[360px]:text-xs sm:text-base group-hover:text-teal-600 transition-colors flex items-center justify-between gap-1 leading-tight">
                  <span className="truncate">Informe Médico</span>
                  <span className="text-[6.5px] sm:text-[8.5px] font-extrabold text-teal-700 bg-teal-100 px-1 py-0.2 rounded uppercase tracking-wider shrink-0">
                    Clínico
                  </span>
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 leading-tight line-clamp-1 sm:line-clamp-2">
                  Informes clínicos, diagnósticos, evolución y procedimientos.
                </p>
              </div>

              <div className="pt-1 sm:pt-2 border-t border-slate-200/60 flex flex-col gap-1 sm:gap-2">
                {activePatientName && (
                  <div className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/25 rounded-md py-0.5 px-1 text-center text-[8px] sm:text-[10px] font-black flex items-center justify-center gap-1">
                    <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{activePatientName}</span>
                  </div>
                )}
                
                <div className="flex gap-1 sm:gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenFormatPreview) onOpenFormatPreview('informes');
                      else onNavigate('informes');
                    }}
                    className="px-1.5 sm:px-2.5 py-1 sm:py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs flex items-center justify-center gap-0.5 transition-all cursor-pointer border border-teal-200 shrink-0"
                    title="Ver vista previa del informe médico"
                  >
                    <Eye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-teal-600 shrink-0" />
                    <span>DISEÑO</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('informes');
                    }}
                    className="flex-1 py-1 sm:py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs uppercase tracking-tight flex items-center justify-center gap-0.5 transition-all shadow-xs cursor-pointer text-center truncate"
                  >
                    <span className="truncate">{activePatientName ? 'Emitir' : 'Redactar'}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. CONSTANCIA / REPOSO */}
          <div 
            onClick={() => onNavigate('reposo')}
            className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-amber-500/70 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-0.5 shadow-xs"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER (COMPACT FOR MOBILE) */}
            <div className="relative h-14 min-[400px]:h-16 sm:h-28 w-full bg-gradient-to-br from-amber-500 via-orange-600 to-slate-900 overflow-hidden flex items-center justify-center p-1.5 sm:p-3">
              <div className="absolute -top-6 -right-6 w-16 h-16 sm:w-28 sm:h-28 bg-amber-300/25 rounded-full blur-lg sm:blur-xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 sm:w-24 sm:h-24 bg-orange-500/20 rounded-full blur-md sm:blur-lg" />

              <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5 transform group-hover:scale-105 transition-all duration-300">
                <div className="w-10 h-11 min-[400px]:w-12 min-[400px]:h-13 sm:w-18 sm:h-24 bg-white/95 backdrop-blur-md rounded-md sm:rounded-lg shadow-md p-1 sm:p-2 border border-white/60 flex flex-col justify-between transform -rotate-2 group-hover:rotate-0 transition-transform">
                  <div className="bg-amber-600 text-white rounded py-0.2 px-1 text-center">
                    <span className="text-[5px] sm:text-[7px] font-black uppercase tracking-wider block">REPOSO</span>
                  </div>
                  <div className="text-center my-0.2">
                    <span className="text-xs sm:text-base font-black text-slate-900 leading-none block">10</span>
                    <span className="text-[5px] sm:text-[7px] font-bold text-amber-700 uppercase">Días</span>
                  </div>
                  <div className="pt-0.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[5px] sm:text-[7px] text-slate-500 font-semibold">Cálculo</span>
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-500"></span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 sm:gap-1.5">
                  <div className="px-1 sm:px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/40 rounded sm:rounded-md shadow-xs flex items-center gap-0.5 text-white">
                    <Clock className="w-2 sm:w-3 sm:h-3 text-amber-300" />
                    <span className="text-[6.5px] sm:text-[9px] font-bold hidden min-[360px]:inline">Laboral</span>
                  </div>
                  <div className="w-4 h-4 sm:w-7 sm:h-7 rounded sm:rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xs transform rotate-6 group-hover:rotate-12 transition-transform">
                    <Clock className="w-2 sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                </div>
              </div>

              <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-20">
                <span className="px-1 sm:px-2 py-0.2 sm:py-0.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[6.5px] sm:text-[8.5px] font-black uppercase tracking-wider rounded border border-amber-500/30">
                  Reposo
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-2 sm:p-3.5 space-y-1 sm:space-y-2.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-amber-50/25">
              <div>
                <h3 className="font-black text-slate-900 text-[11px] min-[360px]:text-xs sm:text-base group-hover:text-amber-600 transition-colors flex items-center justify-between gap-1 leading-tight">
                  <span className="truncate">Constancia / Reposo</span>
                  <span className="text-[6.5px] sm:text-[8.5px] font-extrabold text-amber-700 bg-amber-100 px-1 py-0.2 rounded uppercase tracking-wider shrink-0">
                    Reposo
                  </span>
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 leading-tight line-clamp-1 sm:line-clamp-2">
                  Certificados oficiales y reposos laborales con cálculo de días.
                </p>
              </div>

              <div className="pt-1 sm:pt-2 border-t border-slate-200/60 flex flex-col gap-1 sm:gap-2">
                {activePatientName && (
                  <div className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/25 rounded-md py-0.5 px-1 text-center text-[8px] sm:text-[10px] font-black flex items-center justify-center gap-1">
                    <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{activePatientName}</span>
                  </div>
                )}
                
                <div className="flex gap-1 sm:gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenFormatPreview) onOpenFormatPreview('reposo');
                      else onNavigate('reposo');
                    }}
                    className="px-1.5 sm:px-2.5 py-1 sm:py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs flex items-center justify-center gap-0.5 transition-all cursor-pointer border border-amber-200 shrink-0"
                    title="Ver vista previa de la constancia de reposo"
                  >
                    <Eye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
                    <span>DISEÑO</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('reposo');
                    }}
                    className="flex-1 py-1 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs uppercase tracking-tight flex items-center justify-center gap-0.5 transition-all shadow-xs cursor-pointer text-center truncate"
                  >
                    <span className="truncate">{activePatientName ? 'Emitir' : 'Emitir'}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5. HISTORIA CLÍNICA */}
          <div 
            onClick={() => onNavigate('historias')}
            className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-purple-500/70 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-0.5 shadow-xs"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER (COMPACT FOR MOBILE) */}
            <div className="relative h-14 min-[400px]:h-16 sm:h-28 w-full bg-gradient-to-br from-purple-600 via-indigo-800 to-slate-900 overflow-hidden flex items-center justify-center p-1.5 sm:p-3">
              <div className="absolute -top-6 -right-6 w-16 h-16 sm:w-28 sm:h-28 bg-purple-400/25 rounded-full blur-lg sm:blur-xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 sm:w-24 sm:h-24 bg-indigo-500/20 rounded-full blur-md sm:blur-lg" />

              <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5 transform group-hover:scale-105 transition-all duration-300">
                <div className="w-10 h-11 min-[400px]:w-12 min-[400px]:h-13 sm:w-18 sm:h-24 bg-white/95 backdrop-blur-md rounded-md sm:rounded-lg shadow-md p-1 sm:p-2 border border-white/60 flex flex-col justify-between transform rotate-3 group-hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-0.5">
                    <span className="text-[5px] sm:text-[8px] font-black tracking-tighter text-purple-900">HISTORIA</span>
                    <span className="text-[4px] sm:text-[7px] font-bold text-purple-600">HC</span>
                  </div>
                  <div className="space-y-0.5 my-0.2">
                    <div className="text-[5px] sm:text-[6.5px] font-bold text-slate-700 bg-purple-50 p-0.5 rounded leading-none">TA: 120/80</div>
                    <div className="w-full h-0.5 bg-slate-200 rounded"></div>
                  </div>
                  <div className="pt-0.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[5px] sm:text-[7px] text-slate-500 font-semibold">Exp.</span>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-100 flex items-center justify-center text-[4px] text-purple-800 font-bold">📁</div>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 sm:gap-1.5">
                  <div className="px-1 sm:px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/40 rounded sm:rounded-md shadow-xs flex items-center gap-0.5 text-white">
                    <Users className="w-2 sm:w-3 sm:h-3 text-purple-300" />
                    <span className="text-[6.5px] sm:text-[9px] font-bold hidden min-[360px]:inline">Paciente</span>
                  </div>
                  <div className="w-4 h-4 sm:w-7 sm:h-7 rounded sm:rounded-lg bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center text-white shadow-xs transform -rotate-12 group-hover:rotate-0 transition-transform">
                    <FileText className="w-2 sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                </div>
              </div>

              <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-20">
                <span className="px-1 sm:px-2 py-0.2 sm:py-0.5 bg-slate-950/80 backdrop-blur-md text-purple-300 text-[6.5px] sm:text-[8.5px] font-black uppercase tracking-wider rounded border border-purple-500/30">
                  Expediente
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-2 sm:p-3.5 space-y-1 sm:space-y-2.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-purple-50/25">
              <div>
                <h3 className="font-black text-slate-900 text-[11px] min-[360px]:text-xs sm:text-base group-hover:text-purple-600 transition-colors flex items-center justify-between gap-1 leading-tight">
                  <span className="truncate">Historia Clínica</span>
                  <span className="text-[6.5px] sm:text-[8.5px] font-extrabold text-purple-700 bg-purple-100 px-1 py-0.2 rounded uppercase tracking-wider shrink-0">
                    Signos
                  </span>
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 leading-tight line-clamp-1 sm:line-clamp-2">
                  Expediente clínico integral: antecedentes y evolución.
                </p>
              </div>

              <div className="pt-1 sm:pt-2 border-t border-slate-200/60 flex flex-col gap-1 sm:gap-2">
                {activePatientName && (
                  <div className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/25 rounded-md py-0.5 px-1 text-center text-[8px] sm:text-[10px] font-black flex items-center justify-center gap-1">
                    <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{activePatientName}</span>
                  </div>
                )}
                
                <div className="flex gap-1 sm:gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenFormatPreview) onOpenFormatPreview('historias');
                      else onNavigate('historias');
                    }}
                    className="px-1.5 sm:px-2.5 py-1 sm:py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs flex items-center justify-center gap-0.5 transition-all cursor-pointer border border-purple-200 shrink-0"
                    title="Ver vista previa de la historia clínica"
                  >
                    <Eye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-purple-600 shrink-0" />
                    <span>DISEÑO</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('historias');
                    }}
                    className="flex-1 py-1 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs uppercase tracking-tight flex items-center justify-center gap-0.5 transition-all shadow-xs cursor-pointer text-center truncate"
                  >
                    <span className="truncate">{activePatientName ? 'Abrir' : 'Historias'}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 6. INDICACIONES MÉDICAS */}
          <div 
            onClick={() => onNavigate('indicaciones')}
            className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-cyan-500/70 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-0.5 shadow-xs"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER (COMPACT FOR MOBILE) */}
            <div className="relative h-14 min-[400px]:h-16 sm:h-28 w-full bg-gradient-to-br from-cyan-600 via-teal-700 to-slate-900 overflow-hidden flex items-center justify-center p-1.5 sm:p-3">
              <div className="absolute -top-6 -right-6 w-16 h-16 sm:w-28 sm:h-28 bg-cyan-300/25 rounded-full blur-lg sm:blur-xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 sm:w-24 sm:h-24 bg-teal-500/20 rounded-full blur-md sm:blur-lg" />

              <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5 transform group-hover:scale-105 transition-all duration-300">
                <div className="w-10 h-11 min-[400px]:w-12 min-[400px]:h-13 sm:w-18 sm:h-24 bg-white/95 backdrop-blur-md rounded-md sm:rounded-lg shadow-md p-1 sm:p-2 border border-white/60 flex flex-col justify-between transform -rotate-3 group-hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between border-b border-cyan-100 pb-0.5">
                    <span className="text-[5px] sm:text-[8px] font-black tracking-tighter text-cyan-900">HORARIO</span>
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-cyan-500"></span>
                  </div>
                  <div className="space-y-0.5 my-0.2">
                    <div className="text-[5px] sm:text-[6.5px] font-bold text-slate-800 leading-none">⏰ Cada 8h</div>
                    <div className="text-[5px] sm:text-[6.5px] font-bold text-slate-800 leading-none">🥗 Dieta</div>
                  </div>
                  <div className="pt-0.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[5px] sm:text-[7px] text-cyan-700 font-bold">Dosis</span>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-cyan-50 border border-cyan-300 flex items-center justify-center text-[4px] sm:text-[6px] text-cyan-700 font-bold">💊</div>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 sm:gap-1.5">
                  <div className="px-1 sm:px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/40 rounded sm:rounded-md shadow-xs flex items-center gap-0.5 text-white">
                    <ClipboardList className="w-2 sm:w-3 sm:h-3 text-cyan-300" />
                    <span className="text-[6.5px] sm:text-[9px] font-bold hidden min-[360px]:inline">Pautas</span>
                  </div>
                  <div className="w-4 h-4 sm:w-7 sm:h-7 rounded sm:rounded-lg bg-gradient-to-tr from-cyan-400 to-teal-500 flex items-center justify-center text-white shadow-xs transform rotate-12 group-hover:rotate-45 transition-transform">
                    <Clock className="w-2 sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                </div>
              </div>

              <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-20">
                <span className="px-1 sm:px-2 py-0.2 sm:py-0.5 bg-slate-950/80 backdrop-blur-md text-cyan-300 text-[6.5px] sm:text-[8.5px] font-black uppercase tracking-wider rounded border border-cyan-500/30">
                  Indicaciones
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-2 sm:p-3.5 space-y-1 sm:space-y-2.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-cyan-50/25">
              <div>
                <h3 className="font-black text-slate-900 text-[11px] min-[360px]:text-xs sm:text-base group-hover:text-cyan-700 transition-colors flex items-center justify-between gap-1 leading-tight">
                  <span className="truncate">Indicaciones</span>
                  <span className="text-[6.5px] sm:text-[8.5px] font-extrabold text-cyan-800 bg-cyan-100 px-1 py-0.2 rounded uppercase tracking-wider shrink-0">
                    Posología
                  </span>
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 leading-tight line-clamp-1 sm:line-clamp-2">
                  Horarios de medicamentos, pautas de dieta y cuidados.
                </p>
              </div>

              <div className="pt-1 sm:pt-2 border-t border-slate-200/60 flex flex-col gap-1 sm:gap-2">
                {activePatientName && (
                  <div className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/25 rounded-md py-0.5 px-1 text-center text-[8px] sm:text-[10px] font-black flex items-center justify-center gap-1">
                    <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{activePatientName}</span>
                  </div>
                )}
                
                <div className="flex gap-1 sm:gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenFormatPreview) onOpenFormatPreview('indicaciones');
                      else onNavigate('indicaciones');
                    }}
                    className="px-1.5 sm:px-2.5 py-1 sm:py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs flex items-center justify-center gap-0.5 transition-all cursor-pointer border border-cyan-200 shrink-0"
                    title="Ver vista previa de la hoja de indicaciones"
                  >
                    <Eye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-cyan-700 shrink-0" />
                    <span>DISEÑO</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('indicaciones');
                    }}
                    className="flex-1 py-1 sm:py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs uppercase tracking-tight flex items-center justify-center gap-0.5 transition-all shadow-xs cursor-pointer text-center truncate"
                  >
                    <span className="truncate">{activePatientName ? 'Emitir' : 'Redactar'}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 7. ESTUDIO DE DISEÑO Y PERSONALIZACIÓN (SOLO ADMINISTRADOR Y USUARIOS VIP) */}
          {isAuthorizedForDesigner && (
            <div 
              onClick={() => onNavigate('diseno')}
              className="bg-gradient-to-b from-amber-50/40 via-white to-white rounded-xl sm:rounded-2xl border border-amber-300/80 hover:border-amber-500 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-0.5 shadow-xs"
            >
              {/* STYLIZED MODERN HERO IMAGE BANNER (COMPACT FOR MOBILE) */}
              <div className="relative h-14 min-[400px]:h-16 sm:h-28 w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden flex items-center justify-center p-1.5 sm:p-3">
                <div className="absolute -top-6 -right-6 w-16 h-16 sm:w-28 sm:h-28 bg-amber-500/20 rounded-full blur-lg sm:blur-xl group-hover:scale-125 transition-transform" />
                <div className="absolute -bottom-6 -left-6 w-16 h-16 sm:w-24 sm:h-24 bg-blue-500/20 rounded-full blur-md sm:blur-lg" />

                <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5 transform group-hover:scale-105 transition-all duration-300">
                  <div className="w-10 h-11 min-[400px]:w-12 min-[400px]:h-13 sm:w-18 sm:h-24 bg-white/95 backdrop-blur-md rounded-md sm:rounded-lg shadow-md p-1 sm:p-2 border border-white/60 flex flex-col justify-between transform rotate-2 group-hover:rotate-0 transition-transform">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                      <span className="text-[5px] sm:text-[8px] font-black tracking-tighter text-slate-900">DISEÑO</span>
                      <Sparkles className="w-2 h-2 text-amber-500" />
                    </div>
                    <div className="space-y-0.5 my-0.2">
                      <div className="flex items-center gap-0.5 justify-center">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal-600"></div>
                      </div>
                      <div className="text-[5px] sm:text-[7px] font-serif italic text-slate-700 text-center">Firma</div>
                    </div>
                    <div className="pt-0.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[5px] sm:text-[7px] text-slate-500 font-bold">Personalizar</span>
                      <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-500" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5 sm:gap-1.5">
                    <div className="px-1 sm:px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/40 rounded sm:rounded-md shadow-xs flex items-center gap-0.5 text-white">
                      <Palette className="w-2 sm:w-3 sm:h-3 text-cyan-300" />
                      <span className="text-[6.5px] sm:text-[9px] font-bold hidden min-[360px]:inline">Estudio</span>
                    </div>
                    <div className="w-4 h-4 sm:w-7 sm:h-7 rounded sm:rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-xs transform -rotate-6 group-hover:rotate-0 transition-transform">
                      <Sparkles className="w-2 sm:w-3.5 sm:h-3.5 text-amber-200" />
                    </div>
                  </div>
                </div>

                <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-20 flex items-center gap-1">
                  <span className="px-1 sm:px-2 py-0.2 sm:py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[6.5px] sm:text-[8.5px] font-black uppercase tracking-wider rounded shadow-2xs">
                    👑 VIP
                  </span>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="p-2 sm:p-3.5 space-y-1 sm:space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-[11px] min-[360px]:text-xs sm:text-base group-hover:text-amber-600 transition-colors flex items-center justify-between gap-1 leading-tight">
                    <span className="truncate">Estudio Diseño PRO</span>
                    <span className="text-[6.5px] sm:text-[8.5px] font-bold text-amber-900 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 flex items-center gap-0.5 shrink-0">
                      👑 VIP
                    </span>
                  </h3>
                  <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 leading-tight line-clamp-1 sm:line-clamp-2">
                    Membretes, tipografías, colores, sellos y logos.
                  </p>
                </div>

                <div className="pt-1 sm:pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('diseno');
                    }}
                    className="w-full py-1 sm:py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black rounded-lg text-[8px] min-[360px]:text-[9px] sm:text-xs flex items-center justify-center gap-0.5 transition-all shadow-xs cursor-pointer truncate"
                  >
                    <Palette className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-200 shrink-0" />
                    <span className="truncate">Personalizar</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 8. PAGOS, SUSCRIPCIÓN Y TASA BINANCE */}
          <div 
            onClick={() => onNavigate('suscripcion')}
            className="bg-white rounded-xl sm:rounded-3xl border border-slate-200/90 hover:border-emerald-500/70 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-1 shadow-sm"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER */}
            <div className="relative h-24 sm:h-36 w-full bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 overflow-hidden flex items-center justify-center p-2 sm:p-4">
              <div className="absolute -top-10 -right-10 w-24 h-24 sm:w-36 sm:h-36 bg-emerald-400/25 rounded-full blur-xl sm:blur-2xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-8 -left-8 w-20 h-20 sm:w-32 sm:h-32 bg-teal-500/20 rounded-full blur-lg sm:blur-xl" />

              {/* Stylized Vector Illustration: Binance & Payment Badge */}
              <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-3 transform group-hover:scale-105 transition-all duration-300">
                <div className="w-14 h-20 sm:w-24 sm:h-32 bg-white/95 backdrop-blur-md rounded-lg sm:rounded-xl shadow-xl p-1.5 sm:p-2.5 border border-white/60 flex flex-col justify-between transform -rotate-2 group-hover:rotate-0 transition-transform">
                  <div className="bg-emerald-600 text-white rounded-md sm:rounded-lg py-0.5 px-1 sm:px-2 text-center">
                    <span className="text-[6px] sm:text-[9px] font-black uppercase tracking-wider block">PAGO MÓVIL</span>
                  </div>
                  <div className="text-center my-0.5">
                    <span className="text-[7px] sm:text-[10px] font-bold text-slate-500">TASA EN VIVO</span>
                    <span className="text-[10px] sm:text-sm font-black text-emerald-800 leading-tight block">Binance</span>
                  </div>
                  <div className="pt-0.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[6px] sm:text-[8px] text-slate-500 font-semibold">Bs · USDT</span>
                    <span className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-emerald-500"></span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 sm:gap-2">
                  <div className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white/20 backdrop-blur-md border border-white/40 rounded-lg sm:rounded-xl shadow-md flex items-center gap-1 text-white">
                    <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300" />
                    <span className="text-[8px] sm:text-[11px] font-bold hidden min-[360px]:inline">Cobros</span>
                  </div>
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/30 transform rotate-6 group-hover:rotate-12 transition-transform text-[10px] sm:text-xs">
                    ₿
                  </div>
                </div>
              </div>

              <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-20">
                <span className="px-1.5 sm:px-2.5 py-0.5 bg-slate-950/80 backdrop-blur-md text-emerald-300 text-[8px] sm:text-[10px] font-black uppercase tracking-wider rounded-md sm:rounded-lg border border-emerald-500/30">
                  Pagos
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-2.5 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-xs min-[400px]:text-sm sm:text-lg group-hover:text-emerald-600 transition-colors flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-1 leading-tight">
                  <span className="truncate">Pagos &amp; Tasa</span>
                  <span className="text-[7.5px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0 w-fit">
                    Bs · USDT
                  </span>
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 mt-1 sm:mt-1.5 leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Tasa Binance P2P del día, Pago Móvil en Bolívares y Binance Pay.
                </p>
              </div>

              <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('suscripcion');
                  }}
                  className="w-full py-1.5 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black rounded-lg sm:rounded-xl text-[9px] min-[400px]:text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all shadow-xs hover:scale-[1.02] active:scale-95 cursor-pointer truncate"
                >
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-200 shrink-0" />
                  <span className="truncate">Ver Planes &amp; Tasa</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: INGRESAR DATOS DEL PACIENTE (GRABADO PARA TODOS LOS FORMATOS)    */}
      {/* ========================================================================= */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white border border-white/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-tight flex items-center gap-2">
                    <span>Ingresar Datos del Paciente</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Sincronización Total
                    </span>
                  </h3>
                  <p className="text-xs text-blue-200">
                    Estos datos se grabarán en la sesión y se insertarán en todos sus récipes, informes, reposos e historias.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPatientModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleRegisterPatientSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nombres del Paciente <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientFirstName}
                    onChange={(e) => setPatientFirstName(e.target.value)}
                    placeholder="Nombres del Paciente"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Apellidos del Paciente <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientLastName}
                    onChange={(e) => setPatientLastName(e.target.value)}
                    placeholder="Apellidos del Paciente"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Cédula de Identidad (C.I.)
                  </label>
                  <input
                    type="text"
                    value={patientCI}
                    onChange={(e) => setPatientCI(e.target.value)}
                    placeholder="Ej. V-18.942.110"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Edad
                  </label>
                  <input
                    type="text"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="Ej. 38 años"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Sexo / Género
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dirección de Habitación</span>
                </label>
                <input
                  type="text"
                  value={patientAddress}
                  onChange={(e) => setPatientAddress(e.target.value)}
                  placeholder="Ej. Av. Principal, Urb. Los Rosales, Casa #14, Caracas"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Teléfono / WhatsApp</span>
                  </label>
                  <div className="flex gap-1.5">
                    {/* Country Selector */}
                    <select
                      value={phoneCountry}
                      onChange={(e) => {
                        const code = e.target.value;
                        setPhoneCountry(code);
                        if (code === '+58') setPhoneOperator('0414');
                        else if (code === '+57') setPhoneOperator('310');
                        else if (code === '+34') setPhoneOperator('6');
                        else if (code === '+56') setPhoneOperator('9');
                        else if (code === '+54') setPhoneOperator('9');
                        else setPhoneOperator('');
                      }}
                      className="w-[110px] px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 shrink-0 cursor-pointer"
                    >
                      <option value="+58">🇻🇪 +58</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+54">🇦🇷 +54</option>
                    </select>

                    {/* Operator Selector (only shown if country has preset operators) */}
                    {['+58', '+57', '+34', '+56', '+54'].includes(phoneCountry) && (
                      <select
                        value={phoneOperator}
                        onChange={(e) => setPhoneOperator(e.target.value)}
                        className="w-[95px] px-1.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 shrink-0 cursor-pointer"
                      >
                        {phoneCountry === '+58' && (
                          <>
                            <option value="0414">0414</option>
                            <option value="0424">0424</option>
                            <option value="0412">0412</option>
                            <option value="0416">0416</option>
                            <option value="0426">0426</option>
                            <option value="">Libre</option>
                          </>
                        )}
                        {phoneCountry === '+57' && (
                          <>
                            <option value="310">310</option>
                            <option value="311">311</option>
                            <option value="312">312</option>
                            <option value="313">313</option>
                            <option value="315">315</option>
                            <option value="316">316</option>
                            <option value="300">300</option>
                            <option value="301">301</option>
                            <option value="">Libre</option>
                          </>
                        )}
                        {phoneCountry === '+34' && (
                          <>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="">Libre</option>
                          </>
                        )}
                        {['+56', '+54'].includes(phoneCountry) && (
                          <>
                            <option value="9">9</option>
                            <option value="">Libre</option>
                          </>
                        )}
                      </select>
                    )}

                    {/* Remaining digits */}
                    <input
                      type="text"
                      value={phoneLocal}
                      onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, ''))}
                      placeholder="Número"
                      maxLength={10}
                      className="flex-1 min-w-0 px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Correo Electrónico</span>
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="Ej. paciente@gmail.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Diagnóstico o Motivo de Consulta Inicial (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={patientDiagnosis}
                  onChange={(e) => setPatientDiagnosis(e.target.value)}
                  placeholder="Ej. Faringoamigdalitis aguda bacteriana / Control postoperatorio"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Informative Note for Doctor */}
              <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3 text-[11px] text-blue-900 leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-800">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sincronización Automática de Documentos:</span>
                </div>
                <p>
                  • En el <strong>Récipe Médico e Informes</strong> se mostrarán de forma limpia: <strong>Nombre, Cédula y Edad</strong>.
                </p>
                <p>
                  • El <strong>Teléfono y Correo</strong> quedan grabados en la sesión y servirán para el envío digital directo (WhatsApp y Correo) sin saturar el récipe impreso.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar y Cargar a Todos los Formatos</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BUSCADOR RÁPIDO DE PACIENTES YA REGISTRADOS                      */}
      {/* ========================================================================= */}
      {isSearchPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-cyan-300 flex items-center justify-center border border-slate-700">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Buscar Pacientes Grabados</h3>
                  <p className="text-[11px] text-slate-400">Seleccione un paciente para cargarlo a todos sus formatos</p>
                </div>
              </div>
              <button
                onClick={() => setIsSearchPatientModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Escriba el nombre, apellido o cédula..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Patients List */}
            <div className="p-3 overflow-y-auto space-y-2 flex-1 max-h-[420px]">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-600">No se encontraron pacientes</p>
                  <p className="text-[11px] mt-0.5">Use el botón "Ingresar Paciente" para registrar uno nuevo.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchPatientModalOpen(false);
                      setIsPatientModalOpen(true);
                    }}
                    className="mt-3 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Ingresar Nuevo Paciente</span>
                  </button>
                </div>
              ) : (
                filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{p.patientName}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 flex items-center gap-2 flex-wrap">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-slate-700 font-semibold">
                          C.I: {p.patientCI}
                        </span>
                        {p.patientAge && <span>· {p.patientAge}</span>}
                        {p.patientPhone && <span>· 📱 {p.patientPhone}</span>}
                      </div>
                      {p.diagnosis && (
                        <div className="text-[10px] text-slate-600 truncate max-w-[280px] italic">
                          Dx: {p.diagnosis}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadPatientToAllFormats(p);
                        setIsSearchPatientModalOpen(false);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1"
                    >
                      <span>Cargar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>{filteredPatients.length} paciente(s) disponibles</span>
              <button
                type="button"
                onClick={() => {
                  setIsSearchPatientModalOpen(false);
                  setIsPatientModalOpen(true);
                }}
                className="text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>+ Ingresar Nuevo Paciente</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. DEVELOPER STAMP & TECHNICAL SUPPORT CARD (Responsive for Mobile & Desktop) */}
      <div className="bg-gradient-to-r from-slate-950 via-[#0a1529] to-slate-950 border border-cyan-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
        <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-5 flex-1 min-w-0 w-full">
          <div className="p-1 rounded-2xl bg-slate-950 border border-cyan-500/40 shrink-0 shadow-md">
            <img 
              src={CARLOS_LEAL_DEVELOPER_LOGO_SVG} 
              alt="Carlos Leal Developer Logo" 
              className="h-12 sm:h-14 w-auto object-contain rounded-md"
            />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
              <span>Ingeniería de Software & Aplicaciones Médicas</span>
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-black text-white">
              Desarrollado y Respaldado por Carlos Leal · C.E. LEAL studio
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Plataforma desarrollada a la medida para profesionales de la salud. Garantía técnica, sincronización de datos y soporte continuo directo con el desarrollador.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('suscripcion')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
          >
            <Crown className="w-4 h-4" />
            <span>Gestionar Suscripción</span>
          </button>
        </div>
      </div>

      {/* 5. STRATEGIC DEVELOPER OFFICIAL FOOTER */}
      <CeLealStudioLogo variant="footer" />

    </div>
  );
};
