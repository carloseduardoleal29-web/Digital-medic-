import React, { useState, useRef } from 'react';
import { 
  Stethoscope, 
  UserCheck, 
  Lock, 
  Key, 
  Mail, 
  Phone, 
  Award, 
  Building2, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  LogIn,
  UserPlus,
  X,
  Eye,
  EyeOff,
  CreditCard,
  Smartphone,
  Zap,
  Upload,
  Image as ImageIcon,
  Clock,
  Handshake,
  Send,
  Check,
  Crown,
  Play,
  Copy,
  Users,
  Star,
  ChevronRight,
  ArrowLeft,
  FileText,
  FileCheck2,
  Calendar,
  Layers,
  Palette,
  CheckCircle
} from 'lucide-react';
import { DoctorConfig } from '../types';
import { 
  createDoctorStampSVG, 
  createCalligraphicSignatureSVG, 
  DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 
  MEDICINE_EMBLEM_ESCULAPIO_SVG,
  CARLOS_LEAL_DEVELOPER_LOGO_SVG,
  CARLOS_LEAL_DEVELOPER_BADGE_SVG
} from '../data/defaultAssets';
import { createTrialConfig, getDoctorTrialStatus } from '../utils/trialHelper';
import { isApkOrStandaloneEnvironment } from '../utils/sessionHelper';

import { 
  PaymentConfig, 
  DEFAULT_PAYMENT_CONFIG, 
  fetchPaymentConfig 
} from '../services/paymentConfigService';

interface DoctorAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  registeredDoctors: DoctorConfig[];
  onRegisterNewDoctor: (newDoctor: DoctorConfig) => void;
  onLoginDoctor: (doctor: DoctorConfig, ecosystem?: any) => void;
  onOpenAdminPanel?: () => void;
  onResetAllData?: () => void;
  onContinueAsGuest?: () => void;
}

export const DoctorAuthModal: React.FC<DoctorAuthModalProps> = ({
  isOpen,
  onClose,
  registeredDoctors,
  onRegisterNewDoctor,
  onLoginDoctor,
  onOpenAdminPanel,
  onContinueAsGuest
}) => {
  // Screen views: 'agreed-login' (Default: Correo y Clave) | 'trial-register' (14 días gratis) | 'pay-subscription' (Planes) | 'splash' (Menú general)
  // Por confidencialidad y seguridad médica, el acceso siempre solicita correo y clave para ingresar
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'trial-register' | 'pay-subscription' | 'agreed-login'>('agreed-login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- Shared Registration Form Fields ---
  const [treatment, setTreatment] = useState<'Dr.' | 'Dra.'>('Dr.');
  const [fullName, setFullName] = useState('');
  const [ci, setCi] = useState('');
  const [mpps, setMpps] = useState('');
  const [collegeNumber, setCollegeNumber] = useState('');
  const [specialty, setSpecialty] = useState('Medicina General');
  const [phone, setPhone] = useState('+58 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [institution, setInstitution] = useState('');
  const [country, setCountry] = useState('Venezuela');

  // --- Option 2 Specific Fields (Payment Subscription & Voucher) ---
  const [selectedPlan, setSelectedPlan] = useState<'mensual' | 'trimestral' | 'anual'>('trimestral');
  const [paymentMethod, setPaymentMethod] = useState<'pagomovil' | 'binance' | 'zinli'>('pagomovil');
  const [voucherImg, setVoucherImg] = useState<string | null>(null);
  const [voucherNotes, setVoucherNotes] = useState('');
  const [voucherRef, setVoucherRef] = useState('');
  const voucherInputRef = useRef<HTMLInputElement>(null);

  // --- Option 3 Specific Fields (Agreed Payment Login) ---
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Copy state for payment info
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Payment Configuration (loaded dynamically from central service)
  const [payConfig, setPayConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG);

  React.useEffect(() => {
    fetchPaymentConfig().then((cfg) => {
      if (cfg && cfg.pagoMovil) setPayConfig(cfg);
    });
  }, []);

  const planPrices = {
    mensual: 10,
    trimestral: 28,
    anual: 95
  };

  if (!isOpen) return null;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Upload Voucher Image Handler
  const handleVoucherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('La foto del comprobante excede 8MB. Por favor seleccione una imagen más liviana.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setVoucherImg(event.target?.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // --- Option 1 Submit: Versión Gratuita de Prueba (14 días) ---
  const handleTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = fullName.trim();
    const cleanCi = ci.trim();
    const cleanMpps = mpps.trim();
    const cleanEmail = email.trim();
    const cleanPass = password.trim() || cleanCi || '1234';

    if (!cleanName) return setErrorMsg('Por favor ingrese su Nombre y Apellidos.');
    if (!cleanCi) return setErrorMsg('Por favor ingrese su Cédula de Identidad.');
    if (!cleanMpps) return setErrorMsg('Por favor ingrese su código M.P.P.S.');

    const formattedName = `${treatment} ${cleanName.replace(/^(Dr\.|Dra\.)\s*/i, '')}`;
    const formattedCi = cleanCi.toUpperCase().startsWith('V-') || cleanCi.toUpperCase().startsWith('E-') ? cleanCi.toUpperCase() : `V-${cleanCi}`;

    // Create 14-day Trial Doctor Config
    const newDocId = `doc-${Date.now()}`;
    const trialConfig = createTrialConfig(14);

    const newDoctor: DoctorConfig = {
      id: newDocId,
      profileName: formattedName,
      doctorName: formattedName,
      specialty: specialty.trim() || 'Médico Cirujano',
      mpps: cleanMpps,
      ci: formattedCi,
      collegeNumber: collegeNumber.trim() ? (collegeNumber.includes('CMD') ? collegeNumber : `CMD: ${collegeNumber}`) : '',
      phone: phone.trim() || '+58 414-0000000',
      email: cleanEmail || `${newDocId}@digitalmedic.com`,
      password: cleanPass,
      socialHandle: `@${formattedName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      institution: institution.trim() || 'Consultorio Médico Privado',
      institutionDetails: country === 'Venezuela' ? 'Consulta Médica Autorizada' : `Consulta Médica (${country})`,
      headerStyle: 'clasico',
      headerLayout: 'ambos-logos',
      tonePapel: '#ffffff',
      fuenteHeader: "'Roboto', sans-serif",
      headerColor: '#1e3a8a',
      fuenteNombre: "'Roboto', sans-serif",
      nombreSize: '1.35rem',
      nombreColor: '#1e3a8a',
      primaryDocColor: '#2563eb',
      borderStyle: 'solido',
      docCornerRadius: '16px',
      logoSize: 52,
      formaLogo: 'logo-redondo',
      watermarkOpacity: 0.16,
      watermarkScale: 55,
      watermarkRotation: 0,
      logoIzq: DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
      logoDer: MEDICINE_EMBLEM_ESCULAPIO_SVG,
      marcaAgua: DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
      firmaImg: createCalligraphicSignatureSVG(formattedName, 'ejecutiva-pluma', '#1e3a8a'),
      selloImg: createDoctorStampSVG(formattedName, cleanMpps, formattedCi, '#1e3a8a', specialty.trim().toUpperCase() || 'MÉDICO CIRUJANO', 'oval', collegeNumber.trim()),
      selloFirma: createDoctorStampSVG(formattedName, cleanMpps, formattedCi, '#1e3a8a', specialty.trim().toUpperCase() || 'MÉDICO CIRUJANO', 'con-firma', collegeNumber.trim()),
      rxTitle: 'Rp.',
      rxTitleColor: '#2563eb',
      bodyFontSize: '13.5px',
      footerNotesText: `${formattedName} · Citas: ${phone.trim()}`,
      footerDisclaimer: 'Válido por 30 días a partir de su fecha de emisión.',
      signatureTitle: 'Firma del médico (a)',
      folioPrefix: 'REC-',
      folioNumber: 1,
      ...trialConfig,
      registrationDate: new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date())
    };

    onRegisterNewDoctor(newDoctor);
  };

  // --- Option 2 Submit: Pagar Suscripción y Adjuntar Comprobante ---
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = fullName.trim();
    const cleanCi = ci.trim();
    const cleanMpps = mpps.trim();
    const cleanEmail = email.trim();
    const cleanPass = password.trim() || cleanCi || '1234';

    if (!cleanName) return setErrorMsg('Por favor ingrese su Nombre y Apellidos.');
    if (!cleanCi) return setErrorMsg('Por favor ingrese su Cédula de Identidad.');
    if (!cleanMpps) return setErrorMsg('Por favor ingrese su código M.P.P.S.');
    if (!voucherImg && !voucherRef.trim()) {
      return setErrorMsg('Por favor adjunte la foto de su comprobante de pago o coloque el número de referencia bancaria.');
    }

    const formattedName = `${treatment} ${cleanName.replace(/^(Dr\.|Dra\.)\s*/i, '')}`;
    const formattedCi = cleanCi.toUpperCase().startsWith('V-') || cleanCi.toUpperCase().startsWith('E-') ? cleanCi.toUpperCase() : `V-${cleanCi}`;

    const newDocId = `doc-${Date.now()}`;
    const planNameMap = {
      mensual: 'Plan Mensual Pro ($10 USD)',
      trimestral: 'Plan Trimestral Pro ($28 USD)',
      anual: 'Plan Master Anual ($95 USD)'
    };

    const newDoctor: DoctorConfig = {
      id: newDocId,
      profileName: formattedName,
      doctorName: formattedName,
      specialty: specialty.trim() || 'Médico Cirujano',
      mpps: cleanMpps,
      ci: formattedCi,
      collegeNumber: collegeNumber.trim() ? (collegeNumber.includes('CMD') ? collegeNumber : `CMD: ${collegeNumber}`) : '',
      phone: phone.trim() || '+58 414-0000000',
      email: cleanEmail || `${newDocId}@digitalmedic.com`,
      password: cleanPass,
      socialHandle: `@${formattedName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      institution: institution.trim() || 'Consultorio Médico Privado',
      institutionDetails: country === 'Venezuela' ? 'Consulta Médica Autorizada' : `Consulta Médica (${country})`,
      headerStyle: 'clasico',
      headerLayout: 'ambos-logos',
      tonePapel: '#ffffff',
      fuenteHeader: "'Roboto', sans-serif",
      headerColor: '#1e3a8a',
      fuenteNombre: "'Roboto', sans-serif",
      nombreSize: '1.35rem',
      nombreColor: '#1e3a8a',
      primaryDocColor: '#2563eb',
      borderStyle: 'solido',
      docCornerRadius: '16px',
      logoSize: 52,
      formaLogo: 'logo-redondo',
      watermarkOpacity: 0.16,
      watermarkScale: 55,
      watermarkRotation: 0,
      logoIzq: DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
      logoDer: MEDICINE_EMBLEM_ESCULAPIO_SVG,
      marcaAgua: DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
      firmaImg: createCalligraphicSignatureSVG(formattedName, 'ejecutiva-pluma', '#1e3a8a'),
      selloImg: createDoctorStampSVG(formattedName, cleanMpps, formattedCi, '#1e3a8a', specialty.trim().toUpperCase() || 'MÉDICO CIRUJANO', 'oval', collegeNumber.trim()),
      selloFirma: createDoctorStampSVG(formattedName, cleanMpps, formattedCi, '#1e3a8a', specialty.trim().toUpperCase() || 'MÉDICO CIRUJANO', 'con-firma', collegeNumber.trim()),
      rxTitle: 'Rp.',
      rxTitleColor: '#2563eb',
      bodyFontSize: '13.5px',
      footerNotesText: `${formattedName} · Citas: ${phone.trim()}`,
      footerDisclaimer: 'Válido por 30 días a partir de su fecha de emisión.',
      signatureTitle: 'Firma del médico (a)',
      folioPrefix: 'REC-',
      folioNumber: 1,
      // Pending Admin Approval State
      paymentStatus: 'pendiente',
      isPaidClient: false,
      subscriptionPlan: selectedPlan,
      requestedPlan: planNameMap[selectedPlan],
      paymentVoucherImg: voucherImg || undefined,
      paymentVoucherNotes: voucherNotes.trim() || `Ref: ${voucherRef.trim()}`,
      paymentVoucherDate: new Date().toISOString(),
      paymentMethodUsed: paymentMethod,
      registrationDate: new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date())
    };

    onRegisterNewDoctor(newDoctor);
    setSuccessMsg(`✓ ¡Comprobante de pago enviado con éxito para ${formattedName}! Su cuenta ha sido registrada y está en proceso de verificación por la administración. En breve el Administrador validará su pago y activará su consultorio para que pueda ingresar en "Ya tengo sesión" con su correo y clave.`);
    setCurrentScreen('splash');
  };

  // --- Option 3 Submit: Pago Acordado con el Desarrollador / Acceso Administrador (Login) ---
  const handleAgreedLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanInput = loginIdentifier.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanInput) return setErrorMsg('Por favor ingrese su Correo Electrónico o Cédula de Identidad.');
    if (!cleanPass) return setErrorMsg('Por favor ingrese su Clave de Acceso.');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanInput,
          password: cleanPass
        })
      });

      const data = await response.json();

      if (response.ok && data && data.success && data.doctor) {
        const loggedDoc = data.doctor as DoctorConfig;
        
        // If master admin, ensure official privileges
        if (loggedDoc.email?.toLowerCase().includes('carloseduardoleal29') || loggedDoc.isAdmin || loggedDoc.id === 'doc-admin-master') {
          loggedDoc.profileName = loggedDoc.profileName || 'Administrador Master';
          loggedDoc.doctorName = loggedDoc.doctorName || 'Administrador Master';
          loggedDoc.isAdmin = true;
          loggedDoc.isPaidClient = true;
          loggedDoc.isVip = true;
          loggedDoc.paymentStatus = 'activo';
        }

        onLoginDoctor(loggedDoc, data.ecosystem);
        return;
      } else {
        return setErrorMsg(data?.message || 'Error de autenticación. Verifique su correo o clave.');
      }
    } catch (err) {
      console.warn('Network error during login, attempting local fallback:', err);
    }

    // Local fallback in case server was temporarily unreachable
    const isMasterUser = cleanInput.includes('carloseduardoleal29') || cleanInput === 'admin';
    if (isMasterUser) {
      if (cleanPass !== '2534') {
        return setErrorMsg('Clave de acceso incorrecta para el Administrador Master.');
      }

      const existingMaster = registeredDoctors.find(d => d.id === 'doc-admin-master' || d.isAdmin || (d.email && d.email.toLowerCase().includes('carloseduardo')));

      const masterAdminDoc: DoctorConfig = {
        id: 'doc-admin-master',
        profileName: existingMaster?.profileName || 'Administrador Master',
        doctorName: existingMaster?.doctorName || 'Administrador Master',
        specialty: existingMaster?.specialty || 'Médico Cirujano',
        mpps: existingMaster?.mpps || '',
        ci: existingMaster?.ci || '',
        collegeNumber: existingMaster?.collegeNumber || '',
        phone: existingMaster?.phone || '',
        email: existingMaster?.email || 'admin@digitalmedic.com',
        password: '2534',
        socialHandle: existingMaster?.socialHandle || '',
        institution: existingMaster?.institution || '',
        institutionDetails: existingMaster?.institutionDetails || '',
        paymentStatus: 'activo',
        isPaidClient: true,
        paidPlanName: 'Acceso Master Administrador',
        isAdmin: true,
        isVip: true,
        headerStyle: existingMaster?.headerStyle || 'clasico',
        headerLayout: existingMaster?.headerLayout || 'ambos-logos',
        tonePapel: existingMaster?.tonePapel || '#ffffff',
        fuenteHeader: existingMaster?.fuenteHeader || "'Roboto', sans-serif",
        headerColor: existingMaster?.headerColor || '#1e3a8a',
        fuenteNombre: existingMaster?.fuenteNombre || "'Roboto', sans-serif",
        nombreSize: existingMaster?.nombreSize || '1.35rem',
        nombreColor: existingMaster?.nombreColor || '#1e3a8a',
        primaryDocColor: existingMaster?.primaryDocColor || '#2563eb',
        borderStyle: existingMaster?.borderStyle || 'solido',
        docCornerRadius: existingMaster?.docCornerRadius || '16px',
        logoSize: existingMaster?.logoSize || 52,
        formaLogo: existingMaster?.formaLogo || 'logo-redondo',
        watermarkOpacity: existingMaster?.watermarkOpacity ?? 0.16,
        watermarkScale: existingMaster?.watermarkScale ?? 55,
        watermarkRotation: existingMaster?.watermarkRotation ?? 0,
        logoIzq: existingMaster?.logoIzq || DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
        logoDer: existingMaster?.logoDer || MEDICINE_EMBLEM_ESCULAPIO_SVG,
        marcaAgua: existingMaster?.marcaAgua || DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
        firmaImg: existingMaster?.firmaImg || '',
        selloImg: existingMaster?.selloImg || '',
        selloFirma: existingMaster?.selloFirma || '',
        rxTitle: existingMaster?.rxTitle || 'Rp.',
        rxTitleColor: existingMaster?.rxTitleColor || '#2563eb',
        bodyFontSize: existingMaster?.bodyFontSize || '13.5px',
        footerNotesText: existingMaster?.footerNotesText || '',
        footerDisclaimer: existingMaster?.footerDisclaimer || 'Válido por 30 días a partir de su fecha de emisión.',
        signatureTitle: existingMaster?.signatureTitle || 'Firma del médico (a)',
        folioPrefix: existingMaster?.folioPrefix || 'REC-',
        folioNumber: existingMaster?.folioNumber || 1,
        registrationDate: existingMaster?.registrationDate || new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date())
      };

      onLoginDoctor(masterAdminDoc);
      return;
    }

    const docs = registeredDoctors;
    const cleanDigits = cleanInput.replace(/[^a-z0-9]/gi, '');
    const found = docs.find((d) => {
      const dCi = (d.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
      const dEmail = (d.email || '').toLowerCase().trim();
      return dCi === cleanInput || dEmail === cleanInput || (cleanDigits && dCi === cleanDigits);
    });

    if (found) {
      const expectedPass = (found.password || found.ci || '').trim();
      const cleanPassLower = cleanPass.toLowerCase().replace(/[^a-z0-9]/gi, '');
      const expectedPassLower = expectedPass.toLowerCase().replace(/[^a-z0-9]/gi, '');
      const expectedCiLower = (found.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');

      if (cleanPass !== expectedPass && cleanPassLower !== expectedPassLower && cleanPassLower !== expectedCiLower) {
        return setErrorMsg('Clave de acceso incorrecta. Verifique sus datos o use Cambiar Clave.');
      }

      onLoginDoctor(found);
    } else {
      setErrorMsg('No se encontró un médico registrado con esas credenciales. Solo entra quien tenga correo y clave registrados.');
    }
  };

  const handleSelectPlanDirectly = (plan: 'mensual' | 'trimestral' | 'anual') => {
    setSelectedPlan(plan);
    setCurrentScreen('pay-subscription');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto modal-overlay animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700/80 text-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col my-auto relative max-h-[92vh]">
        
        {/* Close Modal Button (if applicable) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-md cursor-pointer border border-slate-700"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ======================================================== */}
        {/* HERO HEADER: BIENVENIDA OFICIAL, LOGO & IDENTIDAD        */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 p-6 sm:p-8 text-center border-b border-slate-800 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 animate-in zoom-in duration-500 flex flex-col items-center">
            
            {/* Logos Container */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white p-2 shadow-2xl ring-4 ring-blue-500/20 flex items-center justify-center transform hover:scale-105 transition-transform">
                <img 
                  src={DIGITAL_MEDIC_OFFICIAL_LOGO_SVG} 
                  alt="Digital Médic Logo Oficial" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-950/80 p-2 border border-slate-700 shadow-xl flex items-center justify-center transform hover:scale-105 transition-transform">
                <img 
                  src={CARLOS_LEAL_DEVELOPER_BADGE_SVG} 
                  alt="Carlos Leal Desarrollador" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>

            {/* App Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-950/80 border border-cyan-800/80 px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                DIGITAL MÉDIC 2026
              </span>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-3 py-0.5 rounded-full">
                SISTEMA MÉDICO PROFESIONAL
              </span>
            </div>

            {/* App Title */}
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Bienvenido a <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">Digital Médic</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-2 leading-relaxed">
              Plataforma profesional para la redacción, cálculo automático, emisión e impresión oficial de récipes, informes, reposos, historias clínicas e indicaciones de posología.
            </p>

            {/* Back Button if in sub-screen */}
            {currentScreen !== 'agreed-login' && (
              <button
                type="button"
                onClick={() => { setCurrentScreen('agreed-login'); setErrorMsg(null); }}
                className="mt-4 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-700 cursor-pointer shadow-sm hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Ingreso con Correo y Clave</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto max-h-[68vh] space-y-6">

          {/* Success Message Alert */}
          {successMsg && (
            <div className="p-4 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-2xl text-xs font-bold text-emerald-200 flex items-start gap-3 animate-in fade-in shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="block text-emerald-300 font-black text-sm">¡Comprobante de Pago Recibido!</span>
                <span className="block text-[11.5px] leading-relaxed text-emerald-100">{successMsg}</span>
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-xs font-bold text-rose-300 flex items-center gap-2.5 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA PRINCIPAL: 3 BOTONES LIMPIOS + 3 PLANES         */}
          {/* ======================================================== */}
          {currentScreen === 'splash' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* ---------------------------------------------------- */}
              {/* SECCIÓN 1: LOS TRES BOTONES LIMPIOS DE ACCIÓN RÁPIDA */}
              {/* ---------------------------------------------------- */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Seleccione su modo de acceso:</span>
                  </h2>
                  <span className="text-[11px] text-slate-500 font-medium">3 opciones disponibles</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  
                  {/* BOTÓN 1: Versión Gratuita de Prueba (14 días) */}
                  <button
                    type="button"
                    onClick={() => { setCurrentScreen('trial-register'); setErrorMsg(null); }}
                    className="p-4 sm:p-5 rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-b from-cyan-950/40 to-slate-900 hover:border-cyan-400 hover:from-cyan-950/70 hover:to-slate-900 transition-all cursor-pointer group shadow-lg text-left flex flex-col justify-between hover:scale-[1.01]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30">
                          <Clock className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500 text-slate-950 uppercase tracking-wider">
                          14 Días Gratis
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                        Versión Gratuita de Prueba
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Acceso inmediato completo durante 14 días. Sin pagos previos ni tarjeta de crédito.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs font-bold text-cyan-400">
                      <span>Iniciar Prueba</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* BOTÓN 2: Pagar Suscripción / Ver Planes */}
                  <button
                    type="button"
                    onClick={() => { setCurrentScreen('pay-subscription'); setErrorMsg(null); }}
                    className="p-4 sm:p-5 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-950/40 to-slate-900 hover:border-amber-400 hover:from-amber-950/70 hover:to-slate-900 transition-all cursor-pointer group shadow-lg text-left flex flex-col justify-between hover:scale-[1.01]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                          <Crown className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 uppercase tracking-wider">
                          Acceso Pro
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                        Pagar Suscripción / Planes
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Emita sus récipes sin límites. PagoMóvil, Binance o Zinli con activación inmediata.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs font-bold text-amber-400">
                      <span>Ver Formas de Pago</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* BOTÓN 3: Ya tengo sesión / Ingresar con Clave */}
                  <button
                    type="button"
                    onClick={() => { setCurrentScreen('agreed-login'); setErrorMsg(null); }}
                    className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-slate-900 hover:border-emerald-400 hover:from-emerald-950/70 hover:to-slate-900 transition-all cursor-pointer group shadow-lg text-left flex flex-col justify-between hover:scale-[1.01]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
                          <LogIn className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wider">
                          Médicos Registrados
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                        Ya tengo sesión / Ingresar
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Solo entra quien tenga correo y clave registrados, o Administrador Master.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span>Ingresar con Clave</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* SECCIÓN 2: LAS TARJETAS CON LA DESCRIPCIÓN DE PLANES */}
              {/* ---------------------------------------------------- */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-block">
                    TARIFAS TRANSPARENTES Y OFICIALES
                  </span>
                  <h2 className="text-xl font-black text-white">
                    Planes de Suscripción Médica Digital
                  </h2>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto">
                    Seleccione cualquiera de las tarjetas de planes a continuación para activarlo directamente:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* PLAN 1: PLAN MENSUAL PRO */}
                  <div 
                    onClick={() => handleSelectPlanDirectly('mensual')}
                    className="rounded-3xl bg-slate-850/80 border border-slate-700/80 hover:border-blue-500 p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-blue-400 uppercase tracking-wider">Básico Mensual</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[10px] font-bold border border-blue-500/20">
                          1 Mes
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white">Plan Pro Mensual</h3>
                      
                      <div className="mt-3 mb-4 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">$10</span>
                        <span className="text-xs text-slate-400 font-semibold">USD / mes</span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed mb-4 pb-3 border-b border-slate-700/60">
                        Ideal para médicos que inician la digitalización de su consulta y desean facturación flexible mes a mes.
                      </p>

                      <ul className="space-y-2 text-xs text-slate-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>Récipes Médicos 4 en 1 y Master ilimitados</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>Informes, Reposos e Historias Clínicas</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>Membrete institucional, sello y firma digital</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>Acceso Web y APK Móvil Android</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-700/60">
                      <button
                        type="button"
                        className="w-full py-2.5 rounded-xl bg-slate-800 group-hover:bg-blue-600 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Elegir Plan Mensual</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* PLAN 2: PLAN TRIMESTRAL PRO (RECOMENDADO) */}
                  <div 
                    onClick={() => handleSelectPlanDirectly('trimestral')}
                    className="rounded-3xl bg-gradient-to-b from-blue-950/60 via-slate-850 to-slate-900 border-2 border-cyan-400 p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1 relative ring-4 ring-cyan-500/15"
                  >
                    {/* Recomended Tag */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-slate-950" />
                      <span>MÁS POPULAR / RECOMENDADO</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2 mt-1">
                        <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">Trimestral</span>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-black border border-cyan-400/40">
                          Ahorra 10%
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white">Plan Trimestral Pro</h3>
                      
                      <div className="mt-3 mb-4 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-cyan-300">$28</span>
                        <span className="text-xs text-slate-400 font-semibold">USD / 3 meses</span>
                        <span className="text-[10px] text-cyan-400 font-mono ml-1">($9.33/mes)</span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed mb-4 pb-3 border-b border-cyan-500/30">
                        La mejor relación calidad-precio para médicos con consulta activa regular.
                      </p>

                      <ul className="space-y-2 text-xs text-slate-200">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span><strong>Todos los beneficios del Plan Mensual</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>Respaldo y sincronización en la nube</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>Soporte prioritario para configuración inicial</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>Sin interrupciones mensuales de servicio</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-3 border-t border-cyan-500/30">
                      <button
                        type="button"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <span>Elegir Plan Trimestral</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* PLAN 3: PLAN MASTER ANUAL */}
                  <div 
                    onClick={() => handleSelectPlanDirectly('anual')}
                    className="rounded-3xl bg-slate-850/80 border border-amber-500/50 hover:border-amber-400 p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Máximo Control</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40">
                          2 Meses Gratis
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white">Plan Master Anual</h3>
                      
                      <div className="mt-3 mb-4 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-amber-300">$95</span>
                        <span className="text-xs text-slate-400 font-semibold">USD / año</span>
                        <span className="text-[10px] text-amber-400 font-mono ml-1">($7.91/mes)</span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed mb-4 pb-3 border-b border-slate-700/60">
                        Acceso VIP completo por 365 días con todas las funciones avanzadas habilitadas.
                      </p>

                      <ul className="space-y-2 text-xs text-slate-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>Acceso Ilimitado al Estudio de Diseño PRO</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>Soporte VIP directo con el desarrollador</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>Personalización exclusiva de sellos y marcas</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>Actualizaciones automáticas durante todo el año</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-700/60">
                      <button
                        type="button"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Elegir Plan Master</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Direct Doctor Login with Email & Password */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => { setCurrentScreen('agreed-login'); setErrorMsg(null); }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-white bg-slate-800/90 hover:bg-slate-750 px-5 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-95"
                >
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>¿Ya tiene una cuenta registrada? Iniciar Sesión con Correo y Clave</span>
                </button>
              </div>

              {/* Quick Login Existing Doctor Profiles */}
              {registeredDoctors.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <div className="text-xs font-bold text-slate-400 mb-2.5 flex items-center justify-between">
                    <span>Perfiles de Médicos Guardados en este Dispositivo:</span>
                    <span className="text-[10px] text-slate-500">{registeredDoctors.length} guardado(s)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                    {registeredDoctors.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          setLoginIdentifier(doc.email || doc.ci || '');
                          setLoginPassword('');
                          setCurrentScreen('agreed-login');
                          setErrorMsg(null);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-left transition-all flex items-center justify-between gap-2 group cursor-pointer border border-slate-700/60"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">{doc.doctorName}</div>
                          <div className="text-[10px] text-slate-400 truncate">{doc.specialty} · MPPS: {doc.mpps}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* OPCIÓN 1 FORM: Versión Gratuita de Prueba (14 días)      */}
          {/* ======================================================== */}
          {currentScreen === 'trial-register' && (
            <form onSubmit={handleTrialSubmit} className="space-y-4 animate-in fade-in">
              <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-cyan-300">
                <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <strong>Active su Prueba Gratuita de 14 Días:</strong> Ingrese sus datos profesionales para generar sus formatos oficiales de inmediato.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tratamiento:</label>
                  <select
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value as 'Dr.' | 'Dra.')}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Dra.">Dra.</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nombre y Apellidos completos *:</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Dr. Alejandro Ramos"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cédula de Identidad *:</label>
                  <input
                    type="text"
                    required
                    value={ci}
                    onChange={(e) => setCi(e.target.value)}
                    placeholder="Ej: V-20.123.456"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Código M.P.P.S. *:</label>
                  <input
                    type="text"
                    required
                    value={mpps}
                    onChange={(e) => setMpps(e.target.value)}
                    placeholder="Ej: 54.321"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Colegio Médico (Opcional):</label>
                  <input
                    type="text"
                    value={collegeNumber}
                    onChange={(e) => setCollegeNumber(e.target.value)}
                    placeholder="Ej: CMD-12345"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Especialidad Médica *:</label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Ej: Cardiología / Medicina Interna"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Clínica / Institución:</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Ej: Centro Médico San Juan"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono de Contacto:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: +58 414 1234567"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Correo Electrónico *:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@ejemplo.com"
                    autoComplete="new-email"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Clave de Acceso *:</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Cree una clave para ingresar a su sesión"
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2 pr-10 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('splash')}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Activar Prueba de 14 Días y Entrar</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* OPCIÓN 2 FORM: Pagar Suscripción & Adjuntar Comprobante  */}
          {/* ======================================================== */}
          {currentScreen === 'pay-subscription' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-5 animate-in fade-in">
              
              {/* Plan Selection Header */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-black text-amber-300">Plan Seleccionado:</div>
                      <div className="text-sm font-bold text-white">
                        {selectedPlan === 'mensual' && 'Plan Pro Mensual ($10 USD / mes)'}
                        {selectedPlan === 'trimestral' && 'Plan Trimestral Pro ($28 USD / 3 meses) - Recomendado'}
                        {selectedPlan === 'anual' && 'Plan Master Anual ($95 USD / año) - 2 Meses Gratis'}
                      </div>
                    </div>
                  </div>

                  {/* Plan Selector Buttons */}
                  <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan('mensual')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${selectedPlan === 'mensual' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                      $10 Mes
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlan('trimestral')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${selectedPlan === 'trimestral' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                      $28 Tri
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlan('anual')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${selectedPlan === 'anual' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                      $95 Año
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                  1. Método de Pago Disponible:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pagomovil')}
                    className={`p-3 rounded-2xl border text-center transition-all ${paymentMethod === 'pagomovil' ? 'bg-blue-600/20 border-blue-400 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                  >
                    <Smartphone className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <div className="text-xs font-black">PagoMóvil</div>
                    <div className="text-[10px] text-slate-400">Bs. (Tasa Binance)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('binance')}
                    className={`p-3 rounded-2xl border text-center transition-all ${paymentMethod === 'binance' ? 'bg-amber-600/20 border-amber-400 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                  >
                    <Zap className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                    <div className="text-xs font-black">Binance Pay</div>
                    <div className="text-[10px] text-slate-400">USDT</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('zinli')}
                    className={`p-3 rounded-2xl border text-center transition-all ${paymentMethod === 'zinli' ? 'bg-purple-600/20 border-purple-400 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <div className="text-xs font-black">Zinli</div>
                    <div className="text-[10px] text-slate-400">USD</div>
                  </button>
                </div>
              </div>

              {/* Payment Data Display Box */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400">Datos para realizar la transferencia:</div>
                {paymentMethod === 'pagomovil' && (
                  <div className="text-xs space-y-1 font-mono text-slate-300">
                    <div><strong>Banco:</strong> {payConfig.pagoMovil.banco}</div>
                    <div><strong>Teléfono:</strong> {payConfig.pagoMovil.telefono}</div>
                    <div><strong>Cédula / RIF:</strong> {payConfig.pagoMovil.cedula}</div>
                    <div><strong>Titular:</strong> {payConfig.pagoMovil.titular}</div>
                    <div className="text-amber-300 pt-1 font-sans text-xs">
                      <strong>Monto total:</strong> ${(planPrices as any)[selectedPlan]} USD (Calculado a tasa del día)
                    </div>
                  </div>
                )}
                {paymentMethod === 'binance' && (
                  <div className="text-xs space-y-1 font-mono text-slate-300">
                    <div><strong>Binance Pay ID:</strong> {payConfig.binance.payId}</div>
                    <div><strong>Email Binance:</strong> {payConfig.binance.email}</div>
                    <div className="text-amber-300 pt-1 font-sans text-xs">
                      <strong>Monto total:</strong> ${(planPrices as any)[selectedPlan]} USDT
                    </div>
                  </div>
                )}
                {paymentMethod === 'zinli' && (
                  <div className="text-xs space-y-1 font-mono text-slate-300">
                    <div><strong>Email Zinli:</strong> {payConfig.zinli.email}</div>
                    <div><strong>Titular:</strong> {payConfig.zinli.titular}</div>
                    <div className="text-amber-300 pt-1 font-sans text-xs">
                      <strong>Monto total:</strong> ${(planPrices as any)[selectedPlan]} USD
                    </div>
                  </div>
                )}
              </div>

              {/* Doctor Details */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                  2. Datos del Médico:
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Tratamiento:</label>
                    <select
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value as 'Dr.' | 'Dra.')}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white"
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Dra.">Dra.</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Nombre Completo *:</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej: Dr. Alejandro Ramos"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Cédula *:</label>
                    <input
                      type="text"
                      required
                      value={ci}
                      onChange={(e) => setCi(e.target.value)}
                      placeholder="Ej: V-20.123.456"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Código MPPS *:</label>
                    <input
                      type="text"
                      required
                      value={mpps}
                      onChange={(e) => setMpps(e.target.value)}
                      placeholder="Ej: 54.321"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Especialidad *:</label>
                    <input
                      type="text"
                      required
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="Ej: Médico Cirujano"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Correo Electrónico *:</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doctor@ejemplo.com"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Clave de Acceso *:</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Cree su contraseña"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Proof Upload / Ref */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                  3. Comprobante de Pago:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Nro. de Referencia:</label>
                    <input
                      type="text"
                      value={voucherRef}
                      onChange={(e) => setVoucherRef(e.target.value)}
                      placeholder="Ej: Ref 12345678"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Adjuntar Captura / Foto:</label>
                    <input
                      type="file"
                      ref={voucherInputRef}
                      accept="image/*"
                      onChange={handleVoucherUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => voucherInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>{voucherImg ? '✓ Comprobante Cargado' : 'Subir Comprobante (JPG/PNG)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('splash')}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Registrar Suscripción y Activar</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* OPCIÓN 3 FORM: Ya tengo sesión / Ingresar con Clave      */}
          {/* ======================================================== */}
          {currentScreen === 'agreed-login' && (
            <form onSubmit={handleAgreedLoginSubmit} className="space-y-4 animate-in fade-in">
              
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center gap-1 text-center">
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold uppercase tracking-wider">
                  <LogIn className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ya tengo sesión / Acceso con Correo y Clave</span>
                </div>
                <span className="text-[10.5px] text-slate-400">
                  Solo entra quien tenga correo y clave registrados previamente o Administrador Master
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Correo Electrónico o Cédula de Identidad *:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="doctor@ejemplo.com o V-20.123.456"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Clave de Acceso *:
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Ingrese su contraseña autorizada"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('splash')}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                  title="Ver pantalla de bienvenida con todas las opciones"
                >
                  Menú de opciones
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Ingresar a Mi Consulta Médica</span>
                </button>
              </div>

              {/* Quick links for new doctors accessing via web */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setCurrentScreen('trial-register'); setErrorMsg(null); }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>¿Médico nuevo? Iniciar prueba de 14 días</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setCurrentScreen('pay-subscription'); setErrorMsg(null); }}
                  className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer flex items-center gap-1.5"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Planes de suscripción</span>
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            Digital Médico · Sistema Oficial Certificado
          </span>
          <span className="text-[11px] text-slate-400">
            Desarrollado por <strong className="text-cyan-300">Digital Médic Studio</strong>
          </span>
        </div>

      </div>
    </div>
  );
};
