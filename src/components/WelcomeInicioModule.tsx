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
  Handshake
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
  onSaveNewPatientAndSyncAll,
  onLoadPatientToAllFormats,
  onLogout,
  patientCount = 0,
  existingPatients = []
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
      <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-blue-200/80 shadow-xl relative overflow-hidden">
        
        {/* Decorative subtle medical ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-cyan-500/10 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left: Big Legible Official Logo & Stylized Brand Identity */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
            
            {/* Grand Crisp Vector Logo Container */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-tr from-blue-900 via-indigo-900 to-blue-950 p-2 shrink-0 shadow-xl border-2 border-blue-400/40 flex items-center justify-center ring-4 ring-blue-500/15">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center p-2 overflow-hidden shadow-inner">
                <img 
                  src={DIGITAL_MEDIC_OFFICIAL_LOGO_SVG} 
                  alt="Digital Médic Logo Oficial" 
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
            </div>

            {/* App Brand Header & Developer Badge */}
            <div className="space-y-2.5 min-w-0 flex-1">
              
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm sm:text-base font-black uppercase tracking-widest text-white bg-blue-700 px-3.5 py-1 rounded-xl border border-blue-500 flex items-center gap-2 shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-pulse"></span>
                  DIGITAL MÉDIC
                </span>
                <span className="text-xs sm:text-sm font-black text-blue-900 bg-blue-100/90 px-3 py-1 rounded-xl border border-blue-300 shadow-2xs">
                  Formatos Médicos Digitales 2026
                </span>

                {/* Strategic Developer Logo: C.E. LEAL studio */}
                <CeLealStudioLogo variant="badge" />
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                Prescripción clínica oficial · Récipes Médicos · Informes · Reposos laborales · Historias Clínicas · Indicaciones
              </p>

              {/* Saludo médico oficial limpio y profesional (sin animaciones ni destellos) */}
              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm cursor-default">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 font-sans tracking-tight">
                    ¡Hola, {config.doctorName || 'Dr(a). Médico'}!
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right: PATIENT ADMISSION & SEARCH CONTROLS */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-2.5">
            
            {/* BOTÓN PRINCIPAL: INGRESAR PACIENTE */}
            <button
              onClick={() => setIsPatientModalOpen(true)}
              className="w-full p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl transition-all flex items-center justify-between text-left shadow-md shadow-emerald-700/20 group hover:scale-[1.01] border border-emerald-400/40 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                    <span>Ingresar Paciente</span>
                    <span className="px-1.5 py-0.2 bg-white text-emerald-900 text-[9px] font-black rounded font-mono">
                      NUEVO
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-100 mt-0.5 leading-tight">
                    Nombre, C.I., Edad, Dirección, Teléfono y Correo
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-100 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* BOTÓN SECUNDARIO: BUSCAR PACIENTE GRABADO */}
            <button
              onClick={() => setIsSearchPatientModalOpen(true)}
              className="w-full p-3 bg-slate-100 hover:bg-blue-50 text-slate-900 rounded-2xl transition-all flex items-center justify-between text-left shadow-sm group hover:scale-[1.01] border border-slate-300 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                    <span>Buscar Paciente</span>
                    {existingPatients.length > 0 && (
                      <span className="text-[10px] text-blue-700 font-mono">({existingPatients.length})</span>
                    )}
                  </div>
                  <div className="text-[10.5px] text-slate-600">
                    Cargar datos guardados a todos los formatos
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* INSTALAR COMO APLICACIÓN EN PC / ESCRITORIO CON LOGO OFICIAL */}
            <div className="pt-0.5 flex justify-center">
              <PWAInstallButton />
            </div>

          </div>

        </div>
      </div>

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

        {/* Beautiful Modern Grid with Stylized Visual Graphics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* 1. RÉCIPES MÉDICOS */}
          <div 
            onClick={() => onNavigate('recipe-4en1')}
            className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-500/70 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-1 shadow-md"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER */}
            <div className="relative h-40 w-full bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 overflow-hidden flex items-center justify-center p-4">
              {/* Background ambient glows */}
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-cyan-400/25 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/20 rounded-full blur-xl" />
              
              {/* Stylized Vector Illustration: Prescription Sheet + Rx Badge + Pills */}
              <div className="relative z-10 flex items-center justify-center gap-3 transform group-hover:scale-105 transition-all duration-300">
                {/* Prescription Pad Mockup */}
                <div className="w-24 h-32 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-2.5 border border-white/60 flex flex-col justify-between transform -rotate-3 group-hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-1">
                    <span className="text-[9px] font-black tracking-tighter text-blue-800">DIGITAL MÉDIC</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="space-y-1 my-1">
                    <div className="text-[12px] font-black italic text-blue-600 font-serif">Rp.</div>
                    <div className="w-full h-1 bg-slate-200 rounded"></div>
                    <div className="w-4/5 h-1 bg-slate-200 rounded"></div>
                    <div className="w-3/5 h-1 bg-blue-100 rounded"></div>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                    <div className="w-6 h-1.5 bg-slate-300 rounded"></div>
                    <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-300 flex items-center justify-center text-[7px] text-blue-700 font-bold">✓</div>
                  </div>
                </div>

                {/* Floating 3D Pill & Rx Badge */}
                <div className="flex flex-col gap-2">
                  <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5 text-white">
                    <span className="text-xs font-black bg-cyan-400 text-slate-950 px-1.5 py-0.5 rounded font-mono">Rx</span>
                    <span className="text-[11px] font-bold">Digital</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 transform rotate-12 group-hover:rotate-45 transition-transform">
                    <Pill className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Top Tag */}
              <div className="absolute top-3 left-3 z-20">
                <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-cyan-300 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs border border-cyan-500/30">
                  Prescripción Rp.
                </span>
              </div>
            </div>
            
            {/* CARD BODY */}
            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors flex items-center justify-between">
                  <span>Récipes Médicos</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Digital / Master
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Prescripción médica oficial con posología, fármacos, membrete institucional, sello digital y firma autorizada.
                </p>
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenFormatPreview) onOpenFormatPreview('recipe-4en1');
                    else onOpenPreview();
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-blue-200 shadow-2xs hover:scale-105 active:scale-95"
                  title="Ver vista previa de la hoja de récipe con su membrete y diseño"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Vista Previa</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('recipe-4en1');
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Redactar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. INFORME MÉDICO */}
          <div 
            onClick={() => onNavigate('informes')}
            className="bg-white rounded-3xl border border-slate-200/90 hover:border-teal-500/70 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-1 shadow-md"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER */}
            <div className="relative h-40 w-full bg-gradient-to-br from-teal-600 via-emerald-700 to-slate-900 overflow-hidden flex items-center justify-center p-4">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-400/25 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-500/20 rounded-full blur-xl" />

              {/* Stylized Vector Illustration: Clinical Clipboard + Pulse + Stethoscope */}
              <div className="relative z-10 flex items-center justify-center gap-3 transform group-hover:scale-105 transition-all duration-300">
                {/* Clinical Report Mockup */}
                <div className="w-24 h-32 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-2.5 border border-white/60 flex flex-col justify-between transform rotate-2 group-hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-1">
                    <span className="text-[9px] font-black tracking-tighter text-teal-800">INFORME</span>
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  </div>
                  <div className="space-y-1 my-1">
                    {/* ECG Pulse Wave */}
                    <div className="w-full h-3 flex items-center">
                      <svg className="w-full h-3 text-teal-600" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M0,10 L30,10 L35,2 L42,18 L48,5 L54,14 L60,10 L100,10" />
                      </svg>
                    </div>
                    <div className="w-full h-1 bg-slate-200 rounded"></div>
                    <div className="w-4/5 h-1 bg-slate-200 rounded"></div>
                    <div className="w-3/5 h-1 bg-teal-100 rounded"></div>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[8px] font-bold text-teal-700">OFICIAL</span>
                    <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[8px] text-emerald-800 font-bold">★</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5 text-white">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-[11px] font-bold">Clínico</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 transform -rotate-6 group-hover:rotate-0 transition-transform">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="absolute top-3 left-3 z-20">
                <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-emerald-300 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs border border-emerald-500/30">
                  Informe Oficial
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg group-hover:text-teal-600 transition-colors flex items-center justify-between">
                  <span>Informe Médico</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    Consulta / Alta
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Informes clínicos, diagnósticos, procedimientos quirúrgicos, resumen de evolución y recomendaciones.
                </p>
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenFormatPreview) onOpenFormatPreview('informes');
                    else onNavigate('informes');
                  }}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-teal-200 shadow-2xs hover:scale-105 active:scale-95"
                  title="Ver vista previa del informe médico oficial con membrete y sello"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-600" />
                  <span>Vista Previa</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('informes');
                  }}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Redactar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. CONSTANCIA / REPOSO */}
          <div 
            onClick={() => onNavigate('reposo')}
            className="bg-white rounded-3xl border border-slate-200/90 hover:border-amber-500/70 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-1 shadow-md"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER */}
            <div className="relative h-40 w-full bg-gradient-to-br from-amber-500 via-orange-600 to-slate-900 overflow-hidden flex items-center justify-center p-4">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-300/25 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-500/20 rounded-full blur-xl" />

              {/* Stylized Vector Illustration: Calendar + Rest Days Stopwatch */}
              <div className="relative z-10 flex items-center justify-center gap-3 transform group-hover:scale-105 transition-all duration-300">
                {/* Calendar Card Mockup */}
                <div className="w-24 h-32 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-2.5 border border-white/60 flex flex-col justify-between transform -rotate-2 group-hover:rotate-0 transition-transform">
                  <div className="bg-amber-600 text-white rounded-lg py-1 px-2 text-center">
                    <span className="text-[9px] font-black uppercase tracking-wider block">REPOSO</span>
                  </div>
                  <div className="text-center my-1">
                    <span className="text-2xl font-black text-slate-900 leading-none block">10</span>
                    <span className="text-[8.5px] font-bold text-amber-700 uppercase">Días Laborales</span>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[8px] text-slate-500 font-semibold">Cálculo Auto</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5 text-white">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-[11px] font-bold">Laboral</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 transform rotate-6 group-hover:rotate-12 transition-transform">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="absolute top-3 left-3 z-20">
                <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs border border-amber-500/30">
                  Días de Reposo
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg group-hover:text-amber-600 transition-colors flex items-center justify-between">
                  <span>Constancia / Reposo</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Cálculo de Fechas
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Certificados de asistencia y reposos médicos laborales oficiales con cálculo automático de días y fechas.
                </p>
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenFormatPreview) onOpenFormatPreview('reposo');
                    else onNavigate('reposo');
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-amber-200 shadow-2xs hover:scale-105 active:scale-95"
                  title="Ver vista previa de la constancia de reposo laboral con sello"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>Vista Previa</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('reposo');
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Emitir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 4. HISTORIA CLÍNICA */}
          <div 
            onClick={() => onNavigate('historias')}
            className="bg-white rounded-3xl border border-slate-200/90 hover:border-purple-500/70 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-1 shadow-md"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER */}
            <div className="relative h-40 w-full bg-gradient-to-br from-purple-600 via-indigo-800 to-slate-900 overflow-hidden flex items-center justify-center p-4">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-purple-400/25 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl" />

              {/* Stylized Vector Illustration: Digital Folder + Patient Vitals */}
              <div className="relative z-10 flex items-center justify-center gap-3 transform group-hover:scale-105 transition-all duration-300">
                {/* Dossier Mockup */}
                <div className="w-24 h-32 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-2.5 border border-white/60 flex flex-col justify-between transform rotate-3 group-hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-1">
                    <span className="text-[9px] font-black tracking-tighter text-purple-900">HISTORIA</span>
                    <span className="text-[8px] font-bold text-purple-600">HC-01</span>
                  </div>
                  <div className="space-y-1.5 my-1">
                    <div className="grid grid-cols-2 gap-1 text-[7px] font-bold text-slate-700 bg-purple-50/70 p-1 rounded">
                      <div>TA: 120/80</div>
                      <div>FC: 72 lpm</div>
                    </div>
                    <div className="w-full h-1 bg-slate-200 rounded"></div>
                    <div className="w-4/5 h-1 bg-purple-200 rounded"></div>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[8px] text-slate-500 font-semibold">Expediente</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-purple-100 flex items-center justify-center text-[7px] text-purple-800 font-bold">📁</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5 text-white">
                    <Users className="w-3.5 h-3.5 text-purple-300" />
                    <span className="text-[11px] font-bold">Paciente</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 transform -rotate-12 group-hover:rotate-0 transition-transform">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="absolute top-3 left-3 z-20">
                <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-purple-300 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs border border-purple-500/30">
                  Expediente Clínico
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors flex items-center justify-between">
                  <span>Historia Clínica</span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    Signos &amp; Examen
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Expediente clínico integral: antecedentes médicos, signos vitales, exploración física y evolución.
                </p>
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenFormatPreview) onOpenFormatPreview('historias');
                    else onNavigate('historias');
                  }}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-purple-200 shadow-2xs hover:scale-105 active:scale-95"
                  title="Ver vista previa de la historia clínica"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-600" />
                  <span>Vista Previa</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('historias');
                  }}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Abrir Expediente</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 5. INDICACIONES MÉDICAS */}
          <div 
            onClick={() => onNavigate('indicaciones')}
            className="bg-white rounded-3xl border border-slate-200/90 hover:border-cyan-500/70 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-1 shadow-md"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER */}
            <div className="relative h-40 w-full bg-gradient-to-br from-cyan-600 via-teal-700 to-slate-900 overflow-hidden flex items-center justify-center p-4">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-cyan-300/25 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-500/20 rounded-full blur-xl" />

              {/* Stylized Vector Illustration: Clock + Medication Schedule + Diet */}
              <div className="relative z-10 flex items-center justify-center gap-3 transform group-hover:scale-105 transition-all duration-300">
                {/* Schedule Sheet Mockup */}
                <div className="w-24 h-32 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-2.5 border border-white/60 flex flex-col justify-between transform -rotate-3 group-hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between border-b border-cyan-100 pb-1">
                    <span className="text-[9px] font-black tracking-tighter text-cyan-900">HORARIO</span>
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  </div>
                  <div className="space-y-1 my-1">
                    <div className="flex items-center gap-1 text-[8px] font-bold text-slate-800">
                      <span>⏰</span> <span>Cada 8 horas</span>
                    </div>
                    <div className="w-full h-1 bg-slate-200 rounded"></div>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-slate-800">
                      <span>🥗</span> <span>Dieta blanda</span>
                    </div>
                    <div className="w-4/5 h-1 bg-cyan-100 rounded"></div>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[8px] text-cyan-700 font-bold">Posología</span>
                    <div className="w-4 h-4 rounded-full bg-cyan-50 border border-cyan-300 flex items-center justify-center text-[8px] text-cyan-700 font-bold">💊</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5 text-white">
                    <ClipboardList className="w-3.5 h-3.5 text-cyan-300" />
                    <span className="text-[11px] font-bold">Horarios</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 transform rotate-12 group-hover:rotate-45 transition-transform">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="absolute top-3 left-3 z-20">
                <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-cyan-300 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs border border-cyan-500/30">
                  Pautas y Horarios
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg group-hover:text-cyan-700 transition-colors flex items-center justify-between">
                  <span>Indicaciones</span>
                  <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                    Posología &amp; Dieta
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Horarios de toma de medicamentos, pautas de dieta blanda, cuidados generales y signos de alarma.
                </p>
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenFormatPreview) onOpenFormatPreview('indicaciones');
                    else onNavigate('indicaciones');
                  }}
                  className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-cyan-200 shadow-2xs hover:scale-105 active:scale-95"
                  title="Ver vista previa de la hoja de indicaciones al paciente"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Vista Previa</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('indicaciones');
                  }}
                  className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Redactar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 6. ESTUDIO DE DISEÑO Y PERSONALIZACIÓN (SOLO ADMINISTRADOR Y USUARIOS VIP) */}
          {isAuthorizedForDesigner && (
            <div 
              onClick={() => onNavigate('diseno')}
              className="bg-gradient-to-b from-amber-50/40 via-white to-white rounded-3xl border-2 border-amber-300/80 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-1 shadow-md"
            >
              {/* STYLIZED MODERN HERO IMAGE BANNER */}
              <div className="relative h-40 w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden flex items-center justify-center p-4">
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/20 rounded-full blur-xl" />

                {/* Stylized Vector Illustration: Design Palette + Signature + Seal */}
                <div className="relative z-10 flex items-center justify-center gap-3 transform group-hover:scale-105 transition-all duration-300">
                  {/* Branding Canvas Mockup */}
                  <div className="w-24 h-32 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-2.5 border border-white/60 flex flex-col justify-between transform rotate-2 group-hover:rotate-0 transition-transform">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="text-[9px] font-black tracking-tighter text-slate-900">DISEÑO</span>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    </div>
                    <div className="space-y-1.5 my-1">
                      <div className="flex items-center gap-1 justify-center">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        <div className="w-3 h-3 rounded-full bg-teal-600"></div>
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded"></div>
                      <div className="text-[8px] font-serif italic text-slate-700 text-center">Firma & Sello</div>
                    </div>
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[8px] text-slate-500 font-bold">Personalizar</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5 text-white">
                      <Palette className="w-3.5 h-3.5 text-cyan-300" />
                      <span className="text-[11px] font-bold">Estudio</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transform -rotate-6 group-hover:rotate-0 transition-transform">
                      <Sparkles className="w-5 h-5 text-amber-200" />
                    </div>
                  </div>
                </div>

                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm border border-amber-300/40">
                    👑 {config.isAdmin ? 'ADMINISTRADOR' : 'USUARIO VIP'}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold rounded-md border border-emerald-400/30">
                    ✓ Activo
                  </span>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-lg group-hover:text-amber-600 transition-colors flex items-center justify-between">
                    <span>Estudio de Diseño PRO</span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                      👑 Acceso VIP
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Personalice a su gusto total: <strong>letras, tipografías, colores, formatos de récipes, membretes, sellos y logos</strong>.
                  </p>
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('diseno');
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <Palette className="w-4 h-4 text-amber-200" />
                    <span>Personalizar Formatos y Logotipos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. PAGOS, SUSCRIPCIÓN Y TASA BINANCE */}
          <div 
            onClick={() => onNavigate('suscripcion')}
            className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500/70 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden transform hover:-translate-y-1 shadow-md"
          >
            {/* STYLIZED MODERN HERO IMAGE BANNER */}
            <div className="relative h-40 w-full bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 overflow-hidden flex items-center justify-center p-4">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-400/25 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-500/20 rounded-full blur-xl" />

              {/* Stylized Vector Illustration: Binance & Payment Badge */}
              <div className="relative z-10 flex items-center justify-center gap-3 transform group-hover:scale-105 transition-all duration-300">
                <div className="w-24 h-32 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-2.5 border border-white/60 flex flex-col justify-between transform -rotate-2 group-hover:rotate-0 transition-transform">
                  <div className="bg-emerald-600 text-white rounded-lg py-1 px-2 text-center">
                    <span className="text-[9px] font-black uppercase tracking-wider block">PAGO MÓVIL</span>
                  </div>
                  <div className="text-center my-1">
                    <span className="text-[10px] font-bold text-slate-500">TASA EN VIVO</span>
                    <span className="text-sm font-black text-emerald-800 leading-tight block">Binance P2P</span>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 mt-1 inline-block">USDT / VES</span>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[8px] text-slate-500 font-semibold">Bs · USDT · Zinli</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5 text-white">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-[11px] font-bold">Cobros</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30 transform rotate-6 group-hover:rotate-12 transition-transform text-xs">
                    ₿
                  </div>
                </div>
              </div>

              <div className="absolute top-3 left-3 z-20">
                <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-emerald-300 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs border border-emerald-500/30 flex items-center gap-1">
                  <span>●</span> <span>Pagos & Suscripción</span>
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                  <span>Pagos y Tasa Binance</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Bs · USDT · Zinli
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Consulte la <strong>Tasa Binance P2P del día</strong>, planes de membresía, datos de Pago Móvil en Bolívares y Binance Pay.
                </p>
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('suscripcion');
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-emerald-200" />
                  <span>Ver Planes, Cuentas y Tasa Binance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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

      {/* 4. DEVELOPER STAMP & TECHNICAL SUPPORT CARD */}
      <div className="bg-gradient-to-r from-slate-950 via-[#0a1529] to-slate-950 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
          <div className="p-1 rounded-2xl bg-slate-950 border border-cyan-500/40 shrink-0 shadow-md">
            <img 
              src={CARLOS_LEAL_DEVELOPER_LOGO_SVG} 
              alt="Carlos Leal Developer Logo" 
              className="h-14 w-auto object-contain rounded-md"
            />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
              <span>Ingeniería de Software & Aplicaciones Médicas</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Desarrollado y Respaldado por Carlos Leal · C.E. LEAL studio
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Plataforma desarrollada a la medida para profesionales de la salud. Garantía técnica, sincronización de datos y soporte continuo directo con el desarrollador.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('suscripcion')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
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
