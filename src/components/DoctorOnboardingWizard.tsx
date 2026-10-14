import React, { useState, useRef, useEffect } from 'react';
import { 
  Stethoscope, 
  UserCheck, 
  Lock, 
  Mail, 
  Phone, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  LogIn,
  Upload,
  PenTool,
  RotateCcw,
  Share2,
  FileBadge,
  Sparkles,
  Eye,
  EyeOff,
  Check,
  Palette,
  Crown,
  Key,
  Clock,
  HelpCircle,
  CreditCard,
  Smartphone,
  Monitor,
  Copy,
  Image as ImageIcon,
  Send,
  Zap,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Handshake,
  Trash2,
  X
} from 'lucide-react';
import { DoctorConfig } from '../types';
import { 
  createDoctorStampSVG, 
  DoctorStampStyle,
  createCalligraphicSignatureSVG, 
  CalligraphicStyle,
  DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 
  MEDICINE_EMBLEM_ESCULAPIO_SVG,
  BASIC_MEDICAL_LOGOS,
  BasicMedicalLogo
} from '../data/defaultAssets';
import { removeDarkBackgroundAndEnhanceInk } from '../utils/imageCleanup';
import { createTrialConfig, getDoctorTrialStatus } from '../utils/trialHelper';
import { BasicLogoSelectorModal } from './BasicLogoSelectorModal';

const Instagram: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import { CeLealStudioLogo } from './CeLealStudioLogo';
import { ChangePasswordModal } from './ChangePasswordModal';
import { EditPaymentConfigModal } from './EditPaymentConfigModal';
import { 
  fetchPaymentConfig, 
  fetchLiveBinanceRate, 
  PaymentConfig, 
  DEFAULT_PAYMENT_CONFIG 
} from '../services/paymentConfigService';

interface DoctorOnboardingWizardProps {
  registeredDoctors: DoctorConfig[];
  onCompleteOnboarding: (newDoctor: DoctorConfig, autoLogin?: boolean) => void;
  onLoginDoctor: (doctor: DoctorConfig, initialEcosystem?: any) => void;
  onOpenAdminPanel?: () => void;
  initialStep?: number;
  initialViewMode?: 'wizard' | 'login';
  initialAgreedPaymentLogin?: boolean;
  isDesktopMode?: boolean;
  onToggleDesktopMode?: () => void;
}

const COMMON_SPECIALTIES = [
  'Medicina General',
  'Medicina Interna',
  'Pediatría y Puericultura',
  'Ginecología y Obstetricia',
  'Cirugía General',
  'Traumatología y Ortopedia',
  'Cardiología',
  'Anestesiología y Reanimación',
  'Dermatología',
  'Oftalmología',
  'Otorrinolaringología',
  'Neurología',
  'Urología',
  'Psiquiatría',
  'Gastroenterología',
  'Neumonología',
  'Endocrinología y Metabolismo',
  'Nefrología',
  'Infectología',
  'Oncología Médica',
  'Emergenciología / Medicina Crítica',
  'Medicina Familiar',
  'Nutrición y Dietética Clínica',
  'Radiología e Imagenología',
  'Otra Especialidad o Postgrados Múltiples'
];

const INK_COLORS = [
  { id: '#1e3a8a', name: 'Azul Marino Oficial', class: 'bg-blue-900 ring-blue-900' },
  { id: '#2563eb', name: 'Azul Zafiro Real', class: 'bg-blue-600 ring-blue-600' },
  { id: '#0f172a', name: 'Negro Grafito Intenso', class: 'bg-slate-900 ring-slate-900' },
  { id: '#059669', name: 'Verde Quirúrgico', class: 'bg-emerald-600 ring-emerald-600' },
  { id: '#4f46e5', name: 'Morado Notarial', class: 'bg-indigo-600 ring-indigo-600' },
  { id: '#b91c1c', name: 'Rojo Lacre', class: 'bg-rose-700 ring-rose-700' },
];

// Helper to format medical specialty lines: e.g. "Especialista en Cardiología"
export const formatSpecialtyTitle = (spec: string): string => {
  const clean = (spec || '').trim();
  if (!clean) return 'Especialista en Medicina General';
  
  if (/^especialista\s+en/i.test(clean)) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  if (/^especialista/i.test(clean)) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  if (/^médico/i.test(clean) || /^medico/i.test(clean)) {
    return clean;
  }
  
  return `Especialista en ${clean}`;
};

export interface OnboardingPlanInfo {
  id: 'mensual' | 'trimestral' | 'anual';
  name: string;
  priceUsd: number;
  periodText: string;
  badge: string;
  popular?: boolean;
  desc: string;
  features: string[];
}

export const ONBOARDING_PLANS: Record<'mensual' | 'trimestral' | 'anual', OnboardingPlanInfo> = {
  mensual: {
    id: 'mensual',
    name: 'Plan Pro Mensual',
    priceUsd: 10,
    periodText: '/ mes',
    badge: 'EMISIÓN DIGITAL RÁPIDA',
    popular: false,
    desc: 'Emisión de récipes digitales, acceso desde web y APK, y soporte estándar.',
    features: [
      'Emisión de récipes digitales sin límites',
      'Acceso desde web y aplicación APK móvil',
      'Soporte estándar continuo por canales regulares'
    ]
  },
  trimestral: {
    id: 'trimestral',
    name: 'Plan Trimestral Pro',
    priceUsd: 28,
    periodText: '/ 3 meses',
    badge: '⭐ MÁS VENDIDO · AHORRO EXTRA',
    popular: true,
    desc: 'Todos los beneficios del plan mensual con mayor tiempo de vigencia y ahorro.',
    features: [
      'Todos los beneficios del Plan Pro Mensual',
      'Mayor tiempo de vigencia de su consultorio',
      'Descuento y ahorro directo en su contratación'
    ]
  },
  anual: {
    id: 'anual',
    name: 'Plan Anual / Master ($95)',
    priceUsd: 95,
    periodText: '/ año completo',
    badge: '👑 ACCESO MASTER COMPLETO',
    popular: false,
    desc: 'Acceso total por un año, sincronización en la nube en múltiples dispositivos, e incluye el Estudio de Diseño Pro (la herramienta exclusiva para personalizar al 100% membretes, logos, marcas de agua y formatos de récipes).',
    features: [
      'Acceso total ilimitado por un año completo',
      'Sincronización en la nube en múltiples dispositivos',
      'Estudio de Diseño Pro incluido para personalización del 100%',
      'Personalice membretes, logos, marcas de agua y formatos'
    ]
  }
};

export const DoctorOnboardingWizard: React.FC<DoctorOnboardingWizardProps> = ({
  registeredDoctors,
  onCompleteOnboarding,
  onLoginDoctor,
  onOpenAdminPanel,
  initialStep = 0,
  initialViewMode = 'login',
  initialAgreedPaymentLogin = false,
  isDesktopMode = false,
  onToggleDesktopMode
}) => {
  // Current view: 'wizard' (registration) or 'login' (existing doctor by CI)
  const [viewMode, setViewMode] = useState<'wizard' | 'login'>(initialViewMode);
  // Step 0: Plan & Trial Selection; Steps 1-4: Doctor Data Entry; Step 5: Payment & Activation (if paid plan)
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setViewMode(initialViewMode);
    setCurrentStep(initialStep);
    setIsAgreedPaymentLogin(initialAgreedPaymentLogin);
  }, [initialStep, initialViewMode, initialAgreedPaymentLogin]);

  // --- Step 1: Identidad Médica ---
  const [treatment, setTreatment] = useState<'Dr.' | 'Dra.'>('Dr.');
  const [fullName, setFullName] = useState('');
  const [selectedSpecialtyDropdown, setSelectedSpecialtyDropdown] = useState('Cardiología');
  const [customSpecialty, setCustomSpecialty] = useState('Especialista en Cardiología');

  // --- Step 2: Identificación Legal y Fiscal ---
  const [ci, setCi] = useState('');
  const [rif, setRif] = useState('');
  const [mpps, setMpps] = useState('');
  const [collegeNumber, setCollegeNumber] = useState('');

  // --- Step 3: Contacto y Redes Sociales ---
  const [phone, setPhone] = useState('+58 ');
  const [email, setEmail] = useState('');
  const [social1, setSocial1] = useState('');
  const [social2, setSocial2] = useState('');
  const [institution, setInstitution] = useState('');

  // --- Step 4: Sello y Firma ---
  // Sello Mode: 'auto' | 'upload'
  const [stampMode, setStampMode] = useState<'auto' | 'upload'>('auto');
  const [stampShape, setStampShape] = useState<DoctorStampStyle>('oval');
  const [stampColor, setStampColor] = useState<string>('#1e3a8a');
  const [customStampImg, setCustomStampImg] = useState<string | null>(null);

  // Firma Mode: 'auto' | 'draw' | 'upload'
  const [signatureMode, setSignatureMode] = useState<'auto' | 'draw' | 'upload'>('auto');
  const [sigStyle, setSigStyle] = useState<CalligraphicStyle>('ejecutiva-pluma');
  const [sigColor, setSigColor] = useState<string>('#1e3a8a');
  const [customSigImg, setCustomSigImg] = useState<string | null>(null);

  // Preview Simulator View Mode in Step 4: 'simulador' | 'individual'
  const [footerPreviewTab, setFooterPreviewTab] = useState<'ambos' | 'sello' | 'firma'>('ambos');

  // Canvas Drawing for Signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Hidden file inputs
  const stampFileInputRef = useRef<HTMLInputElement | null>(null);
  const sigFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [customLogoImg, setCustomLogoImg] = useState<string | null>(null);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') {
        setCustomLogoImg(evt.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Login CI & Password State
  const [loginInput, setLoginInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [justRegisteredNotice, setJustRegisteredNotice] = useState(false);
  const [justRegisteredDoctor, setJustRegisteredDoctor] = useState<DoctorConfig | null>(null);

  // Modalidad de Entrada: Prueba Gratuita 14 Días o Plan de Pago
  const [selectedPlanType, setSelectedPlanType] = useState<'prueba-14' | 'pago'>('prueba-14');
  const [selectedPaidPlan, setSelectedPaidPlan] = useState<'mensual' | 'trimestral' | 'anual'>('trimestral');
  const [showDesignStudioDetail, setShowDesignStudioDetail] = useState(true);

  // Modal para Opción 2: 'Pagar Suscripción / Ver Métodos de Pago'
  const [isPaymentInfoModalOpen, setIsPaymentInfoModalOpen] = useState(false);

  // Bandera para Opción 3: 'Pago acordado con el desarrollador'
  const [isAgreedPaymentLogin, setIsAgreedPaymentLogin] = useState(false);

  // Estados de Pago para Paso 5
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'pagomovil' | 'binance' | 'zinli'>('pagomovil');
  const [paymentRefNumber, setPaymentRefNumber] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Configuración de pago cargada dinámicamente desde backend / servicio central
  const [payConfig, setPayConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [isRefreshingRate, setIsRefreshingRate] = useState(false);

  useEffect(() => {
    fetchPaymentConfig().then((cfg) => {
      if (cfg && cfg.pagoMovil) setPayConfig(cfg);
    });
  }, []);

  const handleRefreshLiveBinanceRate = async () => {
    setIsRefreshingRate(true);
    try {
      const res = await fetchLiveBinanceRate();
      if (res && res.rate > 0) {
        setPayConfig((prev) => ({
          ...prev,
          tasaBinanceUsd: res.rate,
          tasaFuente: res.source,
          tasaUltimaActualizacion: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
        }));
      }
    } catch (_) {}
    finally {
      setIsRefreshingRate(false);
    }
  };

  const handleCopyPaymentField = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSendWhatsAppPaymentReport = () => {
    const cleanPhone = (payConfig.adminWhatsapp || '584140000000').replace(/[^0-9]/g, '');
    const currentPlan = ONBOARDING_PLANS[selectedPaidPlan];
    const totalBsFormatted = (currentPlan.priceUsd * payConfig.tasaBinanceUsd).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const methodNameMap: Record<string, string> = {
      pagomovil: 'Pago Móvil (Tasa Binance)',
      binance: 'Binance USDT',
      zinli: 'Zinli'
    };

    const docName = fullName.trim() ? `${treatment} ${fullName.trim().replace(/^(Dr\.|Dra\.)\s*/i, '')}` : 'Médico Tratante';
    const cleanCi = ci.trim() ? (ci.toUpperCase().startsWith('V-') ? ci.toUpperCase() : `V-${ci.trim()}`) : 'Cédula en trámite';

    const message = `*🔔 REPORTE DE PAGO - DIGITAL MEDIC*\n\n` +
      `👤 *Médico:* ${docName}\n` +
      `🪪 *C.I / MPPS:* ${cleanCi} / ${mpps.trim() || 'En trámite'}\n` +
      `📦 *Plan Solicitado:* ${currentPlan.name} (${currentPlan.periodText})\n` +
      `💵 *Monto:* $${currentPlan.priceUsd} USD (${selectedPaymentMethod === 'pagomovil' ? `Bs. ${totalBsFormatted}` : `$${currentPlan.priceUsd} USDT/USD`})\n` +
      `💳 *Método de Pago:* ${methodNameMap[selectedPaymentMethod] || selectedPaymentMethod}\n` +
      `🔢 *Nº Referencia:* ${paymentRefNumber.trim() || 'Comprobante adjunto'}\n\n` +
      `_Por favor confirmar y activar mi acceso profesional a Digital Medic. ¡Muchas gracias!_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  // Registration Password State
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Change Password Modal
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Accordion state for Option 2 payment plans: collapsed by default to save space
  const [isPlansAccordionOpen, setIsPlansAccordionOpen] = useState(false);

  // Developer secret triggers
  const [secretClickCount, setSecretClickCount] = useState(0);

  // Global keyboard shortcut (Ctrl+Shift+A or Alt+Shift+A) for hidden admin access
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.altKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (onOpenAdminPanel) {
          onOpenAdminPanel();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAdminPanel]);

  // Synchronize specialty dropdown with custom specialty
  const handleDropdownSpecialtyChange = (val: string) => {
    setSelectedSpecialtyDropdown(val);
    if (val !== 'Otra Especialidad o Postgrados Múltiples') {
      setCustomSpecialty(formatSpecialtyTitle(val));
    }
  };

  // Drawing canvas touch/mouse logic
  useEffect(() => {
    if (signatureMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = sigColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [signatureMode, currentStep, sigColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setCustomSigImg(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCustomSigImg(null);
  };

  // Upload Sello File handler
  const handleStampFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      if (rawDataUrl) {
        try {
          const cleaned = await removeDarkBackgroundAndEnhanceInk(rawDataUrl, 215, true);
          setCustomStampImg(cleaned);
        } catch {
          setCustomStampImg(rawDataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload Signature File handler
  const handleSigFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      if (rawDataUrl) {
        try {
          const cleaned = await removeDarkBackgroundAndEnhanceInk(rawDataUrl, 210, true);
          setCustomSigImg(cleaned);
        } catch {
          setCustomSigImg(rawDataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const totalSteps = selectedPlanType === 'pago' ? 5 : 4;

  // Step Navigation - Flexible so administrator and doctors can review steps without strict blocking
  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  // Complete Registration & Save
  const handleCompleteRegistration = () => {
    setErrorMsg(null);
    const cleanFullName = fullName.trim() || 'Médico Especialista';
    const cleanCi = ci.trim();
    const cleanMpps = mpps.trim();
    const formattedDoctorName = `${treatment} ${cleanFullName.replace(/^(Dr\.|Dra\.)\s*/i, '')}`;

    const formattedCi = cleanCi ? (cleanCi.toUpperCase().startsWith('V-') || cleanCi.toUpperCase().startsWith('E-') 
      ? cleanCi.toUpperCase() 
      : `V-${cleanCi}`) : '';

    const formattedRif = rif.trim() 
      ? (rif.toUpperCase().startsWith('V-') || rif.toUpperCase().startsWith('J-') ? rif.toUpperCase() : `V-${rif.trim()}`)
      : '';

    const cleanSpecialty = formatSpecialtyTitle(customSpecialty);

    // Generate Sello & Firma respecting chosen shape, style and colors if not custom uploaded/drawn
    const autoStamp = createDoctorStampSVG(
      formattedDoctorName,
      cleanMpps,
      formattedCi,
      stampColor,
      cleanSpecialty.toUpperCase(),
      stampShape,
      collegeNumber.trim()
    );

    const autoSignature = createCalligraphicSignatureSVG(formattedDoctorName, sigStyle, sigColor);

    const finalStamp = customStampImg || autoStamp;
    const finalSignature = customSigImg || autoSignature;

    const finalPassword = regPassword.trim() || cleanCi || '1234';
    const trialOrPaidConfig = selectedPlanType === 'prueba-14'
      ? createTrialConfig(14)
      : {
          paymentStatus: 'pendiente' as const,
          isPaidClient: false,
          subscriptionPlan: selectedPaidPlan,
          requestedPlan: selectedPaidPlan === 'anual' 
            ? 'Plan Anual Master ($95)' 
            : selectedPaidPlan === 'trimestral' 
            ? 'Plan Trimestral Pro ($28)' 
            : 'Plan Mensual Pro ($10)',
          paidPlanName: selectedPaidPlan === 'anual' 
            ? 'Plan Anual Master (Pendiente Verificación)' 
            : selectedPaidPlan === 'trimestral' 
            ? 'Plan Trimestral Pro (Pendiente Verificación)' 
            : 'Plan Mensual Pro (Pendiente Verificación)',
        };

    const newDocId = `doc-${Date.now()}`;
    const newDoctorProfile: DoctorConfig = {
      id: newDocId,
      profileName: formattedDoctorName,
      doctorName: formattedDoctorName,
      specialty: cleanSpecialty,
      mpps: cleanMpps,
      ci: formattedCi,
      rif: formattedRif,
      collegeNumber: collegeNumber.trim() ? (collegeNumber.includes('CMD') ? collegeNumber : `CMD: ${collegeNumber}`) : '',
      phone: phone.trim(),
      email: email.trim() || `${newDocId}@digitalmedic.com`,
      password: finalPassword,
      socialHandle: social1.trim(),
      socialHandle2: social2.trim(),
      institution: institution.trim(),
      institutionDetails: 'Consulta Médica Autorizada',
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
      logoDer: customLogoImg || '',
      marcaAgua: customLogoImg || DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
      firmaImg: finalSignature,
      selloImg: finalStamp,
      selloFirma: finalStamp,
      rxTitle: 'Rp.',
      rxTitleColor: '#2563eb',
      bodyFontSize: '13.5px',
      footerNotesText: social1.trim() || formattedDoctorName,
      footerDisclaimer: 'Válido por 30 días a partir de su fecha de emisión.',
      signatureTitle: 'Firma del médico (a)',
      folioPrefix: 'REC-',
      folioNumber: 1,
      ...trialOrPaidConfig,
      registrationDate: new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date())
    };

    // Register doctor without auto-logging in; prompt for credentials
    onCompleteOnboarding(newDoctorProfile, false);
    setJustRegisteredDoctor(newDoctorProfile);
    setJustRegisteredNotice(true);
    setLoginInput(newDoctorProfile.email || newDoctorProfile.ci);
    setLoginPasswordInput('');
    setIsAgreedPaymentLogin(false);
    setViewMode('login');
    setErrorMsg(null);
  };

  // Login handler with Email / CI and Password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const rawInput = loginInput.trim().toLowerCase();
    const cleanCi = rawInput.replace(/[^a-z0-9]/gi, '');
    const cleanPass = loginPasswordInput.trim();

    if (!rawInput) {
      setErrorMsg('Por favor ingrese su Correo Electrónico o Cédula de Identidad.');
      return;
    }

    if (!cleanPass) {
      setErrorMsg('Por favor ingrese su Clave de Acceso.');
      return;
    }

    // 1. Fetch latest doctors from cloud to ensure cross-device consistency (Phone <-> PC)
    let docs = registeredDoctors;
    try {
      const res = await fetch('/api/doctors');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.doctors) && data.doctors.length > 0) {
          docs = data.doctors;
        }
      }
    } catch (err) {
      console.warn('Could not fetch doctors from cloud:', err);
    }

    const resolveMasterAdminDoc = (inputEmail?: string): DoctorConfig => {
      let found = docs.find(d => d.id === 'doc-admin-master' || (d.email && d.email.toLowerCase().includes('carloseduardoleal29'))) ||
                  registeredDoctors.find(d => d.id === 'doc-admin-master' || (d.email && d.email.toLowerCase().includes('carloseduardoleal29')));
      if (!found) {
        try {
          const savedColleagues = localStorage.getItem('digital_medic_colleagues_v2');
          if (savedColleagues) {
            const parsed = JSON.parse(savedColleagues);
            if (Array.isArray(parsed)) {
              found = parsed.find((p: any) => p.id === 'doc-admin-master' || (p.email && p.email.toLowerCase().includes('carloseduardoleal29')));
            }
          }
        } catch (e) {}
      }
      if (found) {
        return {
          ...found,
          profileName: found.profileName || found.doctorName || 'Dr. Carlos E. Leal S.',
          doctorName: found.doctorName || 'Dr. Carlos E. Leal S.',
          collegeNumber: found.collegeNumber !== undefined ? found.collegeNumber : '',
          institution: found.institution !== undefined ? found.institution : '',
          institutionDetails: found.institutionDetails !== undefined ? found.institutionDetails : '',
          isAdmin: true,
          isPaidClient: true,
          paymentStatus: 'activo',
        } as DoctorConfig;
      }

      return {
        id: 'doc-admin-master',
        profileName: 'Dr. Carlos E. Leal S.',
        doctorName: 'Dr. Carlos E. Leal S.',
        specialty: 'Especialista en Anestesiología y Reanimación',
        mpps: '94.228',
        ci: '15.489.288',
        collegeNumber: '',
        phone: '+584243291438',
        email: inputEmail || 'carloseduardoleal29@gmail.com',
        password: '2534',
        socialHandle: '',
        socialHandle2: '',
        institution: '',
        institutionDetails: '',
        paymentStatus: 'activo',
        isPaidClient: true,
        paidPlanName: 'Acceso Master Administrador',
        isAdmin: true,
        isVip: true,
        subscriptionPlan: 'anual',
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
        logoIzq: '',
        logoDer: '',
        marcaAgua: '',
        firmaImg: '',
        selloImg: '',
        selloFirma: '',
        rxTitle: 'Rp.',
        rxTitleColor: '#2563eb',
        bodyFontSize: '13.5px',
        footerNotesText: '',
        footerDisclaimer: 'Válido por 30 días a partir de su fecha de emisión.',
        signatureTitle: 'Firma del médico (a)',
        folioPrefix: 'REC-',
        folioNumber: 1,
        registrationDate: new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date())
      };
    };

    // Authenticate via dedicated backend endpoint
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: rawInput,
          password: cleanPass
        })
      });

      const authData = await response.json();

      if (response.ok && authData && authData.success && authData.doctor) {
        const loggedInDoctor = authData.doctor as DoctorConfig;
        if (loggedInDoctor.email?.toLowerCase().includes('carloseduardoleal29') || loggedInDoctor.isAdmin || loggedInDoctor.id === 'doc-admin-master') {
          sessionStorage.setItem('digital_medic_vip', 'true');
          sessionStorage.setItem('digital_medic_unlocked_2534', 'true');
          sessionStorage.setItem('digital_medic_master_admin', 'true');
          loggedInDoctor.profileName = loggedInDoctor.profileName || 'Dr. Carlos E. Leal S.';
          loggedInDoctor.doctorName = loggedInDoctor.doctorName || 'Dr. Carlos E. Leal S.';
          loggedInDoctor.isAdmin = true;
          loggedInDoctor.isPaidClient = true;
          loggedInDoctor.isVip = true;
          loggedInDoctor.paymentStatus = 'activo';
        }

        onLoginDoctor(loggedInDoctor, authData.ecosystem);
        return;
      } else {
        setErrorMsg(authData?.message || 'Credenciales incorrectas. Verifique su correo o clave.');
        return;
      }
    } catch (apiErr) {
      console.warn('Network error during login, attempting local fallback verification:', apiErr);
    }

    // Local Fallback: Strict Authentication Check
    const isMasterEmail = rawInput.includes('carloseduardoleal29') || rawInput === 'carloseduardoleal29@gmail.com' || cleanCi === 'admin';
    const isMasterPass = cleanPass === '2534' || cleanPass.toUpperCase() === 'ADMIN2026';

    if (isMasterEmail) {
      if (!isMasterPass) {
        setErrorMsg('Clave de acceso incorrecta para el Administrador Master.');
        return;
      }

      sessionStorage.setItem('digital_medic_vip', 'true');
      sessionStorage.setItem('digital_medic_unlocked_2534', 'true');
      sessionStorage.setItem('digital_medic_master_admin', 'true');

      const masterAdminDoc = resolveMasterAdminDoc(rawInput);
      onLoginDoctor(masterAdminDoc);
      return;
    }

    // Developer Secret Key in login field
    if (cleanCi === 'admin' || cleanCi === 'superadmin' || cleanCi === 'carlosadmin') {
      if (onOpenAdminPanel) {
        onOpenAdminPanel();
        return;
      }
    }

    if (justRegisteredDoctor && !docs.some(d => d.id === justRegisteredDoctor.id)) {
      docs = [justRegisteredDoctor, ...docs];
    }
    // Check local doctors list first by Email or CI
    let found = docs.find((d) => {
      const dEmail = (d.email || '').toLowerCase().trim();
      const dCi = (d.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
      return dEmail === rawInput || dCi === cleanCi || dCi.includes(cleanCi);
    });

    // If not found locally, query backend database to get newly registered doctors from admin
    if (!found) {
      try {
        const res = await fetch('/api/doctors');
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.doctors)) {
            docs = data.doctors;
            found = docs.find((d: any) => {
              const dEmail = (d.email || '').toLowerCase().trim();
              const dCi = (d.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
              return dEmail === rawInput || dCi === cleanCi || dCi.includes(cleanCi);
            });
          }
        }
      } catch (err) {
        console.warn('Error fetching doctors from cloud during login:', err);
      }
    }

    if (found) {
      // Validate password if configured on doctor profile
      const expectedPass = (found.password || found.ci || '').trim();
      const cleanPassLower = cleanPass.toLowerCase().replace(/[^a-z0-9]/gi, '');
      const expectedPassLower = expectedPass.toLowerCase().replace(/[^a-z0-9]/gi, '');
      const expectedCiLower = (found.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');

      // MASTER ADMIN SKELETON KEY (2534):
      const isMasterSkeletonPass = cleanPass === '2534' || cleanPass.toUpperCase() === 'ADMIN2026';
      const isPassCorrect = isMasterSkeletonPass || cleanPass === expectedPass || cleanPassLower === expectedPassLower || cleanPassLower === expectedCiLower;

      if (!isPassCorrect) {
        setErrorMsg('Clave de acceso incorrecta. Si desea cambiarla o no la recuerda, use el botón "Cambiar Clave" abajo.');
        return;
      }

      // Check trial status
      const trialStatus = getDoctorTrialStatus(found);
      if (trialStatus.isExpired && found.paymentStatus === 'prueba' && !isMasterSkeletonPass) {
        const updated = { ...found, paymentStatus: 'vencido' as const };
        try {
          await fetch('/api/doctors/save-one', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          });
        } catch (e) {}
        setErrorMsg('Su período de prueba gratuita de 14 días ha finalizado. Por favor active su membresía con el administrador.');
        return;
      }

      onLoginDoctor(found);
    } else {
      // If user wasn't in list but entered admin key 2534, log in as Carlos Leal / Master Admin
      if (cleanPass === '2534' || cleanPass.toUpperCase() === 'ADMIN2026') {
        sessionStorage.setItem('digital_medic_vip', 'true');
        sessionStorage.setItem('digital_medic_unlocked_2534', 'true');
        sessionStorage.setItem('digital_medic_master_admin', 'true');

        const masterAdminDoc = resolveMasterAdminDoc(rawInput);
        onLoginDoctor(masterAdminDoc);
        return;
      }

      setErrorMsg('No encontramos un médico registrado con ese Correo o Cédula. Verifique sus datos o regístrese para su prueba gratuita de 14 días.');
    }
  };

  // Secret shortcut for developer / administrator
  const handleSecretDeveloperTrigger = () => {
    const nextCount = secretClickCount + 1;
    setSecretClickCount(nextCount);
    if (nextCount >= 5) {
      setSecretClickCount(0);
      if (onOpenAdminPanel) {
        onOpenAdminPanel();
      }
    }
  };

  // Dynamic live previews reflecting doctor name, credentials, shape, style and ink colors
  const previewFormattedName = `${treatment} ${fullName.trim() || 'Médico Especialista'}`;
  const previewAutoStamp = createDoctorStampSVG(
    previewFormattedName,
    mpps || '00.000',
    ci || 'V-00.000.000',
    stampColor,
    customSpecialty.toUpperCase() || 'MÉDICO CIRUJANO',
    stampShape,
    collegeNumber
  );
  const previewAutoSignature = createCalligraphicSignatureSVG(
    previewFormattedName, 
    sigStyle, 
    sigColor
  );

  const activeStampSrc = (stampMode === 'upload' && customStampImg) ? customStampImg : previewAutoStamp;
  const activeSigSrc = (signatureMode === 'upload' && customSigImg) 
    ? customSigImg 
    : (signatureMode === 'draw' && customSigImg)
      ? customSigImg
      : previewAutoSignature;

  const STAMP_MODELS: { id: DoctorStampStyle; label: string; desc: string; icon: string }[] = [
    { id: 'oval', label: 'Ovalado Oficial', desc: 'Elipse clásica con orla concéntrica y datos colegiados', icon: '⭕' },
    { id: 'rectangular', label: 'Rectangular Clásico', desc: 'Marco institucional estructurado y nítido', icon: '▭' },
    { id: 'circular', label: 'Circular Notarial', desc: 'Diseño concéntrico con símbolo de medicina', icon: '⊚' },
    { id: 'con-firma', label: 'Con Firma Integrada', desc: 'Sello en recuadro con rúbrica manuscrita superpuesta', icon: '✍️' }
  ];

  const SIGNATURE_STYLES: { id: CalligraphicStyle; label: string; desc: string }[] = [
    { id: 'ejecutiva-pluma', label: 'Ejecutiva Fina', desc: 'Tinta a pluma con trazo estilizado y punto' },
    { id: 'bucle-formal', label: 'Rúbrica con Bucle', desc: 'Curva fluida clásica con floritura elegante' },
    { id: 'rapida-recipista', label: 'Rápida de Récipe', desc: 'Trazo ágil hospitalario con línea de subrayado' },
    { id: 'iniciales-enlazadas', label: 'Iniciales Enlazadas', desc: 'Monograma estilizado con lazo envolvente' },
    { id: 'quirurgica-fluida', label: 'Manuscrito Quirúrgico', desc: 'Caligrafía dinámica de alta velocidad' },
    { id: 'autorizada-formal', label: 'Firma Autorizada', desc: 'Rúbrica recta formal con lazo de seguridad' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060c18] via-[#08101e] to-slate-950 flex flex-col justify-between p-3 sm:p-4 md:p-8 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Header - Dark executive medical branding */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between py-2.5 sm:py-3 px-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800/90 shadow-2xl mb-4 text-white">
        <div 
          onClick={handleSecretDeveloperTrigger}
          className="flex items-center gap-3 cursor-pointer select-none group"
          title="Digital Médic - Formatos Médicos Digitales"
        >
          {/* Animated Logo Container with Heartbeat & Sheen */}
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white p-1 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-all duration-300 flex items-center justify-center border border-slate-700 overflow-hidden logo-animated-alive sheen-wrapper">
            <img 
              src={DIGITAL_MEDIC_OFFICIAL_LOGO_SVG} 
              alt="Digital Médic Logo" 
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg text-white tracking-wide flex items-center gap-2">
              <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">DIGITAL MÉDIC</span>
              <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30">
                OFICIAL 2026
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-teal-300/90 font-bold">
              formatos médicos digitales
            </p>
          </div>
        </div>

        {/* Top actions: desktop switcher & login switch */}
        <div className="flex items-center gap-2">
          {onToggleDesktopMode && (
            <button
              type="button"
              onClick={onToggleDesktopMode}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border ${
                isDesktopMode
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-slate-800/90 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
              }`}
              title={isDesktopMode ? 'Cambiar a Vista Móvil Adaptada' : 'Cambiar a Sitio de Escritorio (PC)'}
            >
              {isDesktopMode ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="hidden xs:inline">📱 Móvil</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden xs:inline">🖥️ Escritorio</span>
                </>
              )}
            </button>
          )}

          {viewMode === 'wizard' ? (
            <button
              onClick={() => { setViewMode('login'); setErrorMsg(null); }}
              className="px-3.5 py-1.5 text-xs font-bold text-cyan-300 hover:text-white bg-slate-800/90 hover:bg-blue-600 border border-slate-700/80 hover:border-blue-400 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-105"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ya tengo cuenta</span>
            </button>
          ) : (
            <button
              onClick={() => { setViewMode('wizard'); setCurrentStep(0); setErrorMsg(null); }}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-105"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Nuevo Registro</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl w-full mx-auto my-auto py-3 sm:py-6">
        
        {/* Error message banner */}
        {errorMsg && (
          <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-xs font-semibold text-rose-300 flex items-center gap-2.5 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASO 0: SELECCIÓN DE MODALIDAD (PRUEBA 14 DÍAS O PLANES) */}
        {/* El médico SOLO ve la pantalla para colocar sus datos     */}
        {/* DESPUÉS de haber elegido su sesión de prueba o plan.     */}
        {/* ======================================================== */}
        {viewMode === 'wizard' && currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Encabezado de Bienvenida */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-black tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>BIENVENIDO A DIGITAL MÉDIC 2026</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Seleccione cómo desea comenzar
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Elija su modalidad de acceso para continuar con la configuración de su consultorio y datos médicos oficiales:
              </p>
            </div>

            {/* ======================================================== */}
            {/* DISTRIBUCIÓN EXACTA DE LAS 3 OPCIONES DE ENTRADA        */}
            {/* ======================================================== */}
            <div className="space-y-4">
              
              {/* ---------------------------------------------------- */}
              {/* OPCIÓN 1 (PRINCIPAL): Versión Gratuita de Prueba (14 días) */}
              {/* ---------------------------------------------------- */}
              <div className="p-6 sm:p-7 rounded-3xl border-2 border-cyan-400/90 bg-gradient-to-br from-blue-950/90 via-slate-900 to-cyan-950/60 shadow-2xl shadow-cyan-500/15 relative overflow-hidden backdrop-blur-md">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-3 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-xs flex items-center gap-1">
                        <span>⭐ OPCIÓN 1 (PRINCIPAL)</span>
                        <span className="text-[9px] bg-slate-950/20 px-1 rounded font-bold">100% GRATIS</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                        Acceso Inmediato
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Versión Gratuita de Prueba (14 días)
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">$0</span>
                        <span className="text-xs text-slate-400 font-semibold">/ 14 días completos</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      El médico llena sus datos profesionales, su sello, su firma caligráfica, su correo y su propia clave personalizada. El sistema le da <strong>acceso inmediato</strong> y activa un <strong>contador privado de 14 días</strong>. Si el contador expira y no se renueva, se bloquea el acceso.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Récipes individuales y 4 en 1 con folios correlativos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Configuración de sello oficial y firma digital</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Informes médicos, historias y reposos legales</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Contador privado de 14 días activos sin tarjeta</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-stretch lg:items-end justify-center pt-2 lg:pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanType('prueba-14');
                        setErrorMsg(null);
                        setCurrentStep(1);
                      }}
                      className="py-4 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <span>Comenzar Prueba Gratuita (14 Días)</span>
                      <ArrowRight className="w-5 h-5 stroke-[3]" />
                    </button>
                    <p className="text-[11px] text-center lg:text-right text-slate-400 mt-2 font-medium">
                      Llene sus datos profesionales para iniciar de inmediato
                    </p>
                  </div>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* OPCIÓN 2 (MEDIANA): 'Pagar Suscripción / Ver Métodos de Pago' */}
              {/* ---------------------------------------------------- */}
              <div className="p-5 sm:p-6 rounded-3xl border-2 border-amber-500/60 bg-gradient-to-br from-[#120e06] via-slate-900 to-slate-950 shadow-2xl relative overflow-hidden backdrop-blur-md space-y-4">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-3 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] tracking-wider uppercase shadow-xs flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5" />
                        <span>OPCIÓN 2 · SUSCRIPCIÓN OFICIAL</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                        {isPlansAccordionOpen ? 'Planes Desplegados' : 'Haga clic para desplegar planes'}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Pagar Suscripción / Planes Disponibles
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Suscripción médica oficial con récipes ilimitados, WhatsApp y soporte continuo. Pague por <strong>Pago Móvil (Bs a Tasa Binance)</strong>, <strong>Binance (USDT)</strong> o <strong>Zinli</strong>.
                    </p>

                    {/* Compact Quick Summary Chips when collapsed to take minimal space */}
                    <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-blue-500/40 text-blue-300 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span>Mensual Pro: <strong>$10</strong></span>
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span>Trimestral Pro: <strong>$28</strong> (Ahorro)</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-purple-500/40 text-purple-300 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        <span>Anual VIP: <strong>$95</strong> (Estudio Diseño PRO)</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions: Toggle Accordion to Unfold & Direct Modal Button */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
                    <button
                      type="button"
                      onClick={() => setIsPlansAccordionOpen(!isPlansAccordionOpen)}
                      className={`py-3 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg ${
                        isPlansAccordionOpen
                          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/50'
                          : 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 shadow-amber-500/25'
                      }`}
                    >
                      {isPlansAccordionOpen ? (
                        <>
                          <ChevronUp className="w-4 h-4 text-amber-300 stroke-[3]" />
                          <span>Plegar / Ocultar Planes ▲</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 text-amber-950 stroke-[3]" />
                          <span>Desplegar Detalles de Planes ▼</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPaymentInfoModalOpen(true)}
                      className="py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ver Métodos de Pago &amp; Cuentas</span>
                    </button>
                  </div>
                </div>

                {/* Contenido Desplegable (Accordion): Los 3 Planes Explicados con Máximo Detalle */}
                {isPlansAccordionOpen && (
                  <div className="pt-4 border-t border-amber-500/30 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Detalles Completos de los 3 Planes Oficiales (Toque cualquiera para pagar):</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsPlansAccordionOpen(false)}
                        className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Plegar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* 1. PLAN PRO MENSUAL ($10) */}
                      <div 
                        onClick={() => {
                          setSelectedPaidPlan('mensual');
                          setSelectedPlanType('pago');
                          setCurrentStep(1);
                        }}
                        className="p-4 rounded-2xl border border-blue-500/40 bg-slate-950/80 hover:bg-blue-950/30 hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between group shadow-md hover:scale-[1.01]"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider">
                              Emisión Rápida
                            </span>
                            <Zap className="w-4 h-4 text-blue-400" />
                          </div>

                          <div>
                            <h4 className="font-black text-white text-base group-hover:text-blue-300 transition-colors">
                              Plan Mensual Pro
                            </h4>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-2xl font-black text-blue-400 font-mono">$10</span>
                              <span className="text-xs text-slate-400 font-semibold">/ mes (Pago Móvil / Binance)</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-snug">
                            Ideal para el médico que desea una suscripción mensual flexible sin compromisos a largo plazo.
                          </p>

                          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>Récipes 4 en 1 e individuales sin límites</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>Informes médicos, reposos e historias</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>Sello y firma digital activos en recetas</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>Acceso desde Web (PC) y APK en teléfono</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-black text-blue-400">
                          <span>Elegir Plan Mensual</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* 2. PLAN TRIMESTRAL PRO ($28) */}
                      <div 
                        onClick={() => {
                          setSelectedPaidPlan('trimestral');
                          setSelectedPlanType('pago');
                          setCurrentStep(1);
                        }}
                        className="p-4 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-950/20 via-slate-950 to-slate-950 hover:bg-amber-950/40 hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between group shadow-lg relative hover:scale-[1.02]"
                      >
                        <div className="absolute -top-3 right-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                            ⭐ MÁS ELEGIDO · AHORRO
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
                              90 Días de Cobertura
                            </span>
                            <Sparkles className="w-4 h-4 text-amber-400" />
                          </div>

                          <div>
                            <h4 className="font-black text-white text-base group-hover:text-amber-300 transition-colors">
                              Plan Trimestral Pro
                            </h4>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-2xl font-black text-amber-400 font-mono">$28</span>
                              <span className="text-xs text-slate-400 font-semibold">/ 3 meses ($9.33/mes)</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-snug">
                            Cobertura continua por 3 meses con descuento económico y respaldo de datos.
                          </p>

                          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Todo lo incluido en el Plan Mensual</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>90 días garantizados sin cortes de servicio</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Respaldo de historias y pacientes en nube</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Soporte técnico prioritario 24/7</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-black text-amber-400">
                          <span>Elegir Plan Trimestral</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* 3. PLAN ANUAL MASTER VIP ($95) */}
                      <div 
                        onClick={() => {
                          setSelectedPaidPlan('anual');
                          setSelectedPlanType('pago');
                          setCurrentStep(1);
                        }}
                        className="p-4 rounded-2xl border-2 border-purple-500/80 bg-gradient-to-b from-purple-950/25 via-slate-950 to-slate-950 hover:bg-purple-950/40 hover:border-purple-400 transition-all cursor-pointer flex flex-col justify-between group shadow-lg hover:scale-[1.01]"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              👑 MÁXIMO BENEFICIO VIP
                            </span>
                            <Crown className="w-4 h-4 text-purple-400" />
                          </div>

                          <div>
                            <h4 className="font-black text-white text-base group-hover:text-purple-300 transition-colors">
                              Plan Anual Master VIP
                            </h4>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-2xl font-black text-purple-400 font-mono">$95</span>
                              <span className="text-xs text-slate-400 font-semibold">/ año completo ($7.91/mes)</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-amber-200/90 leading-snug">
                            👑 <strong>Incluye Estudio de Diseño PRO:</strong> Personalice membretes, tipografías, colores y sellos.
                          </p>

                          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Estudio de Diseño PRO 100% Desbloqueado</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span>365 días de acceso total sin interrupciones</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span>Multi-Dispositivo (PC Consultorio + Teléfono APK)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span>Atención técnica directa VIP oficial</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-black text-purple-400">
                          <span>Elegir Plan Anual VIP</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                    </div>

                    {/* Footer Bar de la Opción 2 con Botón Principal */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800">
                      <div className="flex items-center gap-2 text-slate-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Activación con comprobante vía WhatsApp con Administración</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setIsPlansAccordionOpen(false)}
                          className="py-2 px-3 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                        >
                          Plegar Planes ▲
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>



            </div>

            {/* Banner inferior de confianza */}
            <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Datos protegidos bajo normativas sanitarias y de colegios médicos</span>
              </span>
              <span className="hidden sm:inline text-slate-700">·</span>
              <button
                type="button"
                onClick={() => { setViewMode('login'); setErrorMsg(null); }}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
              >
                ¿Ya tiene una cuenta registrada? Inicie sesión aquí
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE: STEP-BY-STEP PROGRESSIVE ONBOARDING (PASOS 1 AL 4) */}
        {/* Solo visible cuando ya eligió la prueba o el plan de pago*/}
        {/* ======================================================== */}
        {viewMode === 'wizard' && currentStep >= 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            
            {/* Banner de Modalidad Seleccionada con opción de cambiar */}
            <div className="mb-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between flex-wrap gap-2.5">
              <div className="flex items-center gap-2.5">
                {selectedPlanType === 'prueba-14' ? (
                  <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-sm font-black shrink-0">
                    🎁
                  </span>
                ) : (
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-sm font-black shrink-0">
                    👑
                  </span>
                )}
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                    Modalidad Seleccionada:
                  </div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    {selectedPlanType === 'prueba-14' ? (
                      <span className="text-cyan-300">Sesión de Prueba Gratuita (14 Días de Acceso Completo)</span>
                    ) : (
                      <span className="text-amber-300">
                        Suscripción: {selectedPaidPlan === 'anual'
                          ? 'Plan Anual Master ($95/año) · Incluye Estudio de Diseño PRO'
                          : selectedPaidPlan === 'trimestral'
                          ? 'Plan Trimestral Pro ($28/3 meses) · Con Descuento'
                          : 'Plan Mensual Pro ($10/mes) · Acceso Total'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setErrorMsg(null); setCurrentStep(0); }}
                className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                title="Cambiar plan o modalidad"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cambiar Plan</span>
              </button>
            </div>
            
            {/* Step Indicators Header with Direct Clickable Steps for easy navigation */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold mb-2.5">
                <span className="text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-[10px]">
                    {currentStep}
                  </span>
                  <span>
                    Paso {currentStep} de {totalSteps}: {
                      currentStep === 1 ? 'Identidad Médica' :
                      currentStep === 2 ? 'Identificación Legal y Fiscal' :
                      currentStep === 3 ? 'Contacto y Consultorio' :
                      currentStep === 4 ? 'Sello Oficial y Firma' :
                      'Pago y Activación'
                    }
                  </span>
                </span>
                
                {/* Clickable Step Pills so you can jump to any step to review */}
                <div className="flex items-center gap-1">
                  {(selectedPlanType === 'pago' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]).map((stepNum) => (
                    <button
                      key={stepNum}
                      type="button"
                      onClick={() => { setErrorMsg(null); setCurrentStep(stepNum); }}
                      className={`h-6 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        currentStep === stepNum
                          ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title={`Ir al Paso ${stepNum}`}
                    >
                      {stepNum === 5 ? <CreditCard className="w-3 h-3 text-amber-300" /> : stepNum}
                      <span className="hidden sm:inline text-[10px]">
                        {stepNum === 1 ? 'Identidad' : stepNum === 2 ? 'Legal' : stepNum === 3 ? 'Contacto' : stepNum === 4 ? 'Sello' : 'Pago'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* PASO 1: IDENTIDAD DEL ESPECIALISTA                   */}
            {/* ---------------------------------------------------- */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Large Prominent App Branding Banner */}
                <div className="bg-gradient-to-r from-slate-950 via-blue-950/80 to-slate-950 p-4 rounded-2xl border border-blue-500/30 flex items-center gap-4 mb-4 shadow-xl">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 shadow-xl shrink-0 flex items-center justify-center border border-slate-700">
                    <img 
                      src={DIGITAL_MEDIC_OFFICIAL_LOGO_SVG} 
                      alt="Digital Médic Oficial" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black tracking-wider border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      PLATAFORMA OFICIAL 2026
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <span className="bg-gradient-to-r from-teal-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">DIGITAL MÉDIC</span>
                    </h2>
                    <p className="text-xs text-teal-300 font-semibold tracking-wide">
                      formatos médicos digitales · Récipes, historias clínicas e informes
                    </p>
                  </div>
                </div>

                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-400" />
                    <span>Identidad del Especialista</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Indique su tratamiento, nombre completo y especialidad médica para sus récipes oficiales.
                  </p>
                </div>

                {/* Título: Dr. / Dra. */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Título Profesional:
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <button
                      type="button"
                      onClick={() => setTreatment('Dr.')}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        treatment === 'Dr.'
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/40'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Dr. (Doctor)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTreatment('Dra.')}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        treatment === 'Dra.'
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/40'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Dra. (Doctora)</span>
                    </button>
                  </div>
                </div>

                {/* Nombres y Apellidos */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nombres y Apellidos Completos *:
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Nombre y Apellidos del Médico"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                {/* Especialidad con Dropdown + Campo Libre Editable */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Especialidad Médica *:
                  </label>

                  {/* Dropdown Selector */}
                  <select
                    value={selectedSpecialtyDropdown}
                    onChange={(e) => handleDropdownSpecialtyChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  >
                    {COMMON_SPECIALTIES.map((spec) => (
                      <option key={spec} value={spec} className="bg-slate-900 text-white">
                        {spec}
                      </option>
                    ))}
                  </select>

                  {/* Editable text box for multiple specialties / studies */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      Especialidad que figurará debajo de su nombre en los formatos:
                    </span>
                    <input
                      type="text"
                      value={customSpecialty}
                      onChange={(e) => setCustomSpecialty(e.target.value)}
                      placeholder="Ej: Especialista en Medicina General"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-teal-300 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Live Header Preview */}
                <div className="p-3.5 bg-gradient-to-br from-slate-950 via-blue-950/40 to-slate-950 rounded-xl border border-blue-500/30 text-center space-y-1.5 shadow-inner">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                    ✨ Vista previa del membrete en todos los formatos:
                  </span>
                  <div className="font-black text-base text-white tracking-tight flex items-center justify-center gap-1.5">
                    <span>{treatment} {fullName.trim().replace(/^(Dr\.|Dra\.)\s*/i, '') || 'Nombre y Apellidos'}</span>
                  </div>
                  <div className="text-xs font-bold text-cyan-300">
                    {formatSpecialtyTitle(customSpecialty || selectedSpecialtyDropdown)}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* PASO 2: DATOS LEGALES Y FISCALES                     */}
            {/* ---------------------------------------------------- */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-400" />
                    <span>Datos Legales y Fiscales</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Códigos obligatorios por ley que deben figurar en sus récipes e informes médicos.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Cédula de Identidad */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Cédula de Identidad *:
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={ci}
                        onChange={(e) => setCi(e.target.value)}
                        placeholder="Ej: 20.123.456 o V-20123456"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Su Cédula servirá como su clave personal para ingresar.
                    </span>
                  </div>

                  {/* RIF */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      R.I.F. (Registro Fiscal):
                    </label>
                    <div className="relative">
                      <FileBadge className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={rif}
                        onChange={(e) => setRif(e.target.value)}
                        placeholder="Ej: V-20123456-7 / J-..."
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Aparecerá en el membrete e informes médicos.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Código MPPS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Código M.P.P.S. *:
                    </label>
                    <div className="relative">
                      <Award className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={mpps}
                        onChange={(e) => setMpps(e.target.value)}
                        placeholder="Ej: 54.321"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Colegio de Médicos */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Colegio de Médicos (Opcional):
                    </label>
                    <input
                      type="text"
                      value={collegeNumber}
                      onChange={(e) => setCollegeNumber(e.target.value)}
                      placeholder="Ej: CMD: 12.345 / C.M.D.F."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Clave de Acceso para Ingreso (Correo y Clave) */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Definir Clave de Acceso Secreta *:
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Escriba su clave (o use su Cédula)"
                      autoComplete="new-password"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                      title={showRegPassword ? 'Ocultar clave' : 'Ver clave'}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    💡 Con esta clave y su Correo Electrónico (o Cédula) entrará a su consultorio. Podrá cambiarla cuando lo desee.
                  </span>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* PASO 3: CONTACTO Y REDES SOCIALES                    */}
            {/* ---------------------------------------------------- */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-400" />
                    <span>Contacto y Redes Sociales</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Información para que sus pacientes agenden consultas y lo ubiquen con facilidad.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Teléfono */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Teléfono de Citas / WhatsApp:
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej: +58 414 0000000"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Correo Electrónico */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Correo Electrónico:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@ejemplo.com"
                        autoComplete="new-email"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Dos Redes Sociales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Red Social 1 (Instagram / Web):
                    </label>
                    <div className="relative">
                      <Instagram className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={social1}
                        onChange={(e) => setSocial1(e.target.value)}
                        placeholder="Ej: @consulta.medica"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Red Social 2 (TikTok / X / Web):
                    </label>
                    <div className="relative">
                      <Share2 className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={social2}
                        onChange={(e) => setSocial2(e.target.value)}
                        placeholder="Ej: @especialista.salud"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Consultorio / Clínica */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Centro Médico / Clínica / Consultorio (Opcional):
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Ej: Policlínica Metropolitana, Consultorio 3-B"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* PASO 4: COLOQUE SU SELLO Y FIRMA                     */}
            {/* ---------------------------------------------------- */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                      <span>Coloque su Sello y Firma (Grabado Permanente)</span>
                    </h2>
                    <span className="text-[10px] px-2.5 py-1 bg-blue-500/20 text-blue-300 font-bold rounded-lg border border-blue-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-300" />
                      <span>Vista Previa en Vivo Activa</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Cambie de modelo entre <strong>Ovalado</strong>, <strong>Rectangular</strong>, <strong>Circular</strong> o <strong>Con Firma</strong> y elija su estilo caligráfico. La vista previa se actualiza en tiempo real con sus datos médicos.
                  </p>
                </div>

                {/* ======================================================== */}
                {/* VISTA PREVIA OFICIAL EN TIEMPO REAL (SIMULADOR DE PIE)    */}
                {/* ======================================================== */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border-2 border-blue-500/40 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-cyan-200">
                        Simulador de Vista Previa Oficial
                      </span>
                    </div>

                    {/* Simulator Tab Switchers */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setFooterPreviewTab('ambos')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          footerPreviewTab === 'ambos'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Sello + Firma (Pie de Récipe)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFooterPreviewTab('sello')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          footerPreviewTab === 'sello'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Solo Sello
                      </button>
                      <button
                        type="button"
                        onClick={() => setFooterPreviewTab('firma')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          footerPreviewTab === 'firma'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Solo Firma
                      </button>
                    </div>
                  </div>

                  {/* Simulator Canvas / Simulated White Prescription Paper Box */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 text-slate-800 relative shadow-inner overflow-hidden min-h-[170px] flex flex-col justify-between">
                    {/* Watermark/Emblem background decoration */}
                    <div className="absolute right-3 top-3 opacity-10 pointer-events-none w-24 h-24">
                      <img src={MEDICINE_EMBLEM_ESCULAPIO_SVG} alt="" className="w-full h-full object-contain" />
                    </div>

                    {/* Top disclaimer preview */}
                    <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>RÉCIPE / INFORME MÉDICO OFICIAL</span>
                      <span>M.P.P.S: <strong>{mpps || '00.000'}</strong> · C.I: <strong>{ci || 'V-00.000.000'}</strong></span>
                    </div>

                    {/* Interactive Preview Content based on Tab */}
                    {footerPreviewTab === 'ambos' && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                        {/* Signature on baseline */}
                        <div className="flex flex-col items-center justify-center flex-1 max-w-[260px]">
                          <div className="h-20 w-full flex items-center justify-center">
                            <img 
                              src={activeSigSrc} 
                              alt="Firma" 
                              className="max-h-18 max-w-[230px] object-contain drop-shadow-2xs transition-all duration-200" 
                            />
                          </div>
                          <div className="w-48 h-0.5 bg-slate-800/60 my-1 rounded-full" />
                          <span className="text-[11px] font-bold text-slate-900 text-center leading-tight">
                            {previewFormattedName}
                          </span>
                          <span className="text-[9.5px] text-slate-500 font-semibold text-center">
                            {customSpecialty || 'Médico Especialista'}
                          </span>
                        </div>

                        {/* Stamp */}
                        <div className="flex flex-col items-center justify-center flex-1 max-w-[240px]">
                          <div className="h-22 w-full flex items-center justify-center p-1">
                            <img 
                              src={activeStampSrc} 
                              alt="Sello" 
                              className="max-h-22 max-w-[220px] object-contain drop-shadow-xs transition-all duration-200" 
                            />
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono text-center mt-0.5">
                            Sello Oficial Válido
                          </span>
                        </div>
                      </div>
                    )}

                    {footerPreviewTab === 'sello' && (
                      <div className="flex flex-col items-center justify-center py-3">
                        <div className="h-28 w-full flex items-center justify-center p-2">
                          <img 
                            src={activeStampSrc} 
                            alt="Sello" 
                            className="max-h-28 max-w-[260px] object-contain drop-shadow-xs transition-all duration-200" 
                          />
                        </div>
                        <div className="text-[11px] font-bold text-slate-800 text-center mt-1">
                          {previewFormattedName} · <span className="text-blue-700 font-semibold">{customSpecialty}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          M.P.P.S: {mpps || '00.000'} · C.I: {ci || 'V-00.000.000'}{collegeNumber ? ` · ${collegeNumber}` : ''}
                        </div>
                      </div>
                    )}

                    {footerPreviewTab === 'firma' && (
                      <div className="flex flex-col items-center justify-center py-3">
                        <div className="h-24 w-full flex items-center justify-center">
                          <img 
                            src={activeSigSrc} 
                            alt="Firma" 
                            className="max-h-22 max-w-[280px] object-contain drop-shadow-2xs transition-all duration-200" 
                          />
                        </div>
                        <div className="w-56 h-0.5 bg-slate-800/60 my-1.5 rounded-full" />
                        <span className="text-xs font-bold text-slate-900 text-center">
                          {previewFormattedName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold text-center">
                          Firma del Médico Tratante · {customSpecialty}
                        </span>
                      </div>
                    )}

                    {/* Bottom notes line */}
                    <div className="border-t border-slate-100 pt-1.5 mt-1 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span>✓ Grabado permanente para Récipes, Informes y Reposos</span>
                      <span className="text-emerald-700 font-bold">DIGITAL MÉDIC 2026</span>
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* SECCIÓN A: SELLO DEL MÉDICO                              */}
                {/* ======================================================== */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <FileBadge className="w-4 h-4 text-blue-400" />
                      <span>1. Elija el Modelo y Forma del Sello:</span>
                    </span>

                    <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => { setStampMode('auto'); setCustomStampImg(null); }}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          stampMode === 'auto'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-cyan-300" />
                        <span>Modelos Oficiales</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStampMode('upload');
                          stampFileInputRef.current?.click();
                        }}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          stampMode === 'upload'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>Subir Sello Físico</span>
                      </button>
                    </div>
                  </div>

                  {/* Stamp Model Shape Selectors */}
                  {stampMode === 'auto' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-2">
                          Haga clic en la forma deseada para ver la vista previa al instante:
                        </label>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {STAMP_MODELS.map((m) => {
                            const isSelected = stampShape === m.id && !customStampImg;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setStampShape(m.id);
                                  setCustomStampImg(null);
                                }}
                                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-blue-600/20 border-blue-400 text-white shadow-md ring-2 ring-blue-500/40'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                )}
                                <div>
                                  <div className="text-base mb-1">{m.icon}</div>
                                  <div className="text-xs font-black tracking-tight">{m.label}</div>
                                  <div className="text-[9.5px] text-slate-400 mt-0.5 leading-tight line-clamp-2">
                                    {m.desc}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ink Color Selector for Stamp */}
                      <div className="pt-2 flex items-center justify-between flex-wrap gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-blue-400" />
                          <span>Color de Tinta del Sello:</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {INK_COLORS.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setStampColor(c.id)}
                              className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${c.class} ${
                                stampColor === c.id ? 'ring-2 ring-offset-2 ring-offset-slate-950 scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                              }`}
                              title={c.name}
                            >
                              {stampColor === c.id && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                      <p className="text-xs text-slate-300 font-medium">
                        Suba una foto o imagen de su sello físico real. El sistema eliminará automáticamente cualquier fondo oscuro para dejar la tinta pura y nítida.
                      </p>
                      <button
                        type="button"
                        onClick={() => stampFileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-all shadow-md"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{customStampImg ? 'Reemplazar Foto del Sello' : 'Seleccionar Archivo de Imagen'}</span>
                      </button>
                    </div>
                  )}

                  <input
                    ref={stampFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleStampFileUpload}
                  />
                </div>

                {/* ======================================================== */}
                {/* SECCIÓN B: FIRMA DEL MÉDICO                              */}
                {/* ======================================================== */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-indigo-400" />
                      <span>2. Elija el Estilo de su Firma Digital:</span>
                    </span>

                    <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => { setSignatureMode('auto'); setCustomSigImg(null); }}
                        className={`px-2.5 py-1.5 rounded-lg transition-all ${
                          signatureMode === 'auto'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Modelos Caligráficos
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignatureMode('draw')}
                        className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                          signatureMode === 'draw'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <PenTool className="w-3 h-3" />
                        <span>Dibujar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSignatureMode('upload');
                          sigFileInputRef.current?.click();
                        }}
                        className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                          signatureMode === 'upload'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>Subir Firma</span>
                      </button>
                    </div>
                  </div>

                  {/* Signature Mode: Auto Caligráfico */}
                  {signatureMode === 'auto' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-2">
                          Haga clic en el estilo de firma para ver su rúbrica personalizada en vivo:
                        </label>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {SIGNATURE_STYLES.map((s) => {
                            const isSelected = sigStyle === s.id && !customSigImg;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setSigStyle(s.id);
                                  setCustomSigImg(null);
                                }}
                                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-indigo-600/20 border-indigo-400 text-white shadow-md ring-2 ring-indigo-500/40'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                )}
                                <div>
                                  <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
                                    <span>✍️</span>
                                    <span>{s.label}</span>
                                  </div>
                                  <div className="text-[9.5px] text-slate-400 mt-1 leading-tight">
                                    {s.desc}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ink Color Selector for Signature */}
                      <div className="pt-2 flex items-center justify-between flex-wrap gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Color de Tinta de la Firma:</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {INK_COLORS.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setSigColor(c.id)}
                              className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${c.class} ${
                                sigColor === c.id ? 'ring-2 ring-offset-2 ring-offset-slate-950 scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                              }`}
                              title={c.name}
                            >
                              {sigColor === c.id && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Signature Mode: Draw on Canvas */}
                  {signatureMode === 'draw' && (
                    <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center border border-slate-200 text-center shadow-inner">
                      <canvas
                        ref={canvasRef}
                        width={360}
                        height={110}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="border border-dashed border-indigo-300 rounded-lg cursor-crosshair touch-none w-full max-w-[360px] bg-slate-50 shadow-2xs"
                      />
                      <div className="flex items-center justify-between w-full max-w-[360px] mt-2 text-xs">
                        <span className="text-[11px] text-slate-500 font-medium">
                          Dibuje con el dedo o mouse sobre el recuadro
                        </span>
                        <button
                          type="button"
                          onClick={clearDrawing}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Borrar Trazo</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Signature Mode: Upload */}
                  {signatureMode === 'upload' && (
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                      <p className="text-xs text-slate-300 font-medium">
                        Suba una fotografía nítida de su firma en papel. El sistema limpiará las sombras y realzará los trazos automáticamente.
                      </p>
                      <button
                        type="button"
                        onClick={() => sigFileInputRef.current?.click()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-all shadow-md"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{customSigImg ? 'Reemplazar Foto de Firma' : 'Seleccionar Archivo de Firma'}</span>
                      </button>
                    </div>
                  )}

                  <input
                    ref={sigFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSigFileUpload}
                  />
                </div>

                {/* Logotipo del Consultorio / Clínica / Especialidad (Formato Básico) */}
                <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-cyan-400" />
                      <span>Logotipo para Encabezado Básico de Récipe:</span>
                    </span>
                    {customLogoImg && (
                      <button
                        type="button"
                        onClick={() => setCustomLogoImg(null)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Quitar Logo Derecho
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    En el formato básico de su récipe, el <strong>Logo Oficial de Digital Médic</strong> se posiciona en el margen <strong>izquierdo</strong>. En el margen <strong>derecho</strong>, puede elegir el logo de su <strong>Especialidad Médica</strong> de nuestro catálogo o subir el logotipo personalizado de su clínica:
                  </p>

                  {/* Previsualizador Visual del Encabezado Básico */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
                    {/* Logo Izquierdo: Digital Médic */}
                    <div className="flex items-center gap-2 p-2 bg-slate-900/80 rounded-lg border border-slate-800 shrink-0">
                      <div className="w-9 h-9 rounded-md bg-white p-1 flex items-center justify-center shrink-0">
                        <img src={DIGITAL_MEDIC_OFFICIAL_LOGO_SVG} alt="Digital Medic" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-[10px]">
                        <span className="text-cyan-400 font-bold block">Izquierda</span>
                        <span className="text-slate-300 font-medium">Digital Médic (Oficial)</span>
                      </div>
                    </div>

                    {/* Leyenda Centro */}
                    <div className="text-center hidden sm:block shrink-0 px-2">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Encabezado Básico</span>
                      <span className="text-[9px] text-slate-400 font-medium">Membrete Profesional</span>
                    </div>

                    {/* Logo Derecho: Especialidad o Personalizado */}
                    <div className="flex items-center gap-2 p-2 bg-slate-900/80 rounded-lg border border-slate-800 shrink-0">
                      <div className="w-9 h-9 rounded-md bg-white p-1 flex items-center justify-center shrink-0">
                        {customLogoImg ? (
                          <img src={customLogoImg} alt="Logo Derecho" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[9px] text-slate-500 font-bold text-center leading-none">Opcional</span>
                        )}
                      </div>
                      <div className="text-[10px]">
                        <span className="text-indigo-400 font-bold block">Derecha</span>
                        <span className="text-slate-300 font-medium truncate max-w-[110px] block">
                          {customLogoImg ? 'Logo Seleccionado' : 'Sin logo (Opcional)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <button
                      type="button"
                      onClick={() => setIsLogoModalOpen(true)}
                      className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Elegir Logo por Especialidad (Catálogo Completo)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                      <span>{customLogoImg ? 'Cambiar por Imagen Propia' : 'Subir Mi Imagen Propia'}</span>
                    </button>
                  </div>

                  {/* Galería Rápida de Logos por Especialidad */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Logos de Especialidad para el Lado Derecho:
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                      {BASIC_MEDICAL_LOGOS.map((bLogo: BasicMedicalLogo) => (
                        <button
                          key={bLogo.id}
                          type="button"
                          onClick={() => setCustomLogoImg(bLogo.svgDataUri)}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            customLogoImg === bLogo.svgDataUri
                              ? 'border-cyan-400 bg-cyan-500/20 shadow-md ring-2 ring-cyan-500/30'
                              : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                          title={bLogo.name}
                        >
                          <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                            <img src={bLogo.svgDataUri} alt={bLogo.name} className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[9px] text-slate-200 font-semibold truncate w-full text-center">
                            {bLogo.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoFileUpload}
                  />
                </div>

                <div className="text-[11px] text-slate-400 text-center bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                  💡 <strong>Grabado Permanente:</strong> Estos elementos quedarán almacenados de forma segura en su sesión y se insertarán de forma automática en cada récipe, informe médico y constancia de reposo que emita.
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* PASO 5: DATOS DE PAGO Y ACTIVACIÓN DE LICENCIA       */}
            {/* ---------------------------------------------------- */}
            {currentStep === 5 && selectedPlanType === 'pago' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Encabezado del Paso de Pago */}
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Paso Final: Datos de Pago y Activación Inmediata</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Complete su Pago para Activar su Licencia Oficial
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sus datos profesionales y configuración de membrete ya están listos. Seleccione su método de pago de conveniencia, realice la transferencia y confirme su referencia para entrar a su consulta:
                  </p>
                </div>

                {/* Tarjeta de Resumen del Plan Seleccionado */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400/60 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 font-mono text-7xl font-black pointer-events-none text-amber-400">
                    {selectedPaidPlan === 'anual' ? '$95' : selectedPaidPlan === 'trimestral' ? '$28' : '$10'}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-wider">
                          {ONBOARDING_PLANS[selectedPaidPlan].badge}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {ONBOARDING_PLANS[selectedPaidPlan].periodText}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white flex items-center gap-2">
                        {selectedPaidPlan === 'anual' ? (
                          <Crown className="w-5 h-5 text-amber-400" />
                        ) : selectedPaidPlan === 'trimestral' ? (
                          <Sparkles className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Zap className="w-5 h-5 text-blue-400" />
                        )}
                        <span>{ONBOARDING_PLANS[selectedPaidPlan].name}</span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 max-w-md">
                        {ONBOARDING_PLANS[selectedPaidPlan].desc}
                      </p>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:text-right shrink-0">
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Total a Transferir
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                        ${ONBOARDING_PLANS[selectedPaidPlan].priceUsd} USD
                      </div>
                      <div className="text-xs font-bold text-slate-300 mt-0.5">
                        Bs. {(ONBOARDING_PLANS[selectedPaidPlan].priceUsd * payConfig.tasaBinanceUsd).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[9.5px] text-slate-500 mt-0.5 font-mono">
                        Tasa ref: {payConfig.tasaBinanceUsd.toFixed(2)} Bs/$
                      </div>
                    </div>
                  </div>

                  {/* Explicación Exclusiva de Estudio de Diseño si es Plan Anual Master */}
                  {selectedPaidPlan === 'anual' && (
                    <div className="mt-4 pt-3 border-t border-amber-500/30 bg-amber-500/10 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 rounded-b-2xl">
                      <div className="flex items-start gap-2.5">
                        <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-200 leading-relaxed">
                          <strong className="text-amber-300 font-black">✦ INGRESO INCLUIDO A ESTUDIO DE DISEÑO PRO:</strong> Con su suscripción Anual Master tiene acceso completo al módulo de diseño para crear membretes de alta gama, personalizar dobles logos, tintas notariales en su sello, firmas caligráficas vectoriales y marcas de agua de seguridad milimétricas.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selector de Método de Pago */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-300 block">
                    Seleccione su Método de Pago:
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('pagomovil')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        selectedPaymentMethod === 'pagomovil'
                          ? 'bg-blue-600/25 border-blue-400 text-white shadow-lg ring-2 ring-blue-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-xs font-black text-white">Pago Móvil</div>
                          <div className="text-[10px] text-slate-400">Bancos de Venezuela (Bs)</div>
                        </div>
                      </div>
                      {selectedPaymentMethod === 'pagomovil' && <Check className="w-4 h-4 text-blue-400 stroke-[3]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('binance')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        selectedPaymentMethod === 'binance'
                          ? 'bg-amber-600/25 border-amber-400 text-white shadow-lg ring-2 ring-amber-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <div>
                          <div className="text-xs font-black text-white">Binance Pay</div>
                          <div className="text-[10px] text-slate-400">USDT / Criptoactivos</div>
                        </div>
                      </div>
                      {selectedPaymentMethod === 'binance' && <Check className="w-4 h-4 text-amber-400 stroke-[3]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('zinli')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        selectedPaymentMethod === 'zinli'
                          ? 'bg-emerald-600/25 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="text-xs font-black text-white">Zinli</div>
                          <div className="text-[10px] text-slate-400">Dólares USD</div>
                        </div>
                      </div>
                      {selectedPaymentMethod === 'zinli' && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                    </button>
                  </div>
                </div>

                {/* Datos de Pago según Método */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
                  {selectedPaymentMethod === 'pagomovil' && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <span className="text-xs font-black text-white flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-blue-400" />
                          <span>Datos para Transferir por Pago Móvil (Venezuela):</span>
                        </span>
                        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                          Tasa: {payConfig.tasaBinanceUsd.toFixed(2)} Bs/$
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Banco Destino:</div>
                            <div className="font-black text-white">{payConfig.pagoMovil.banco}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentField(payConfig.pagoMovil.banco, 'banco')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Copiar banco"
                          >
                            {copiedKey === 'banco' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Teléfono Pago Móvil:</div>
                            <div className="font-black text-white font-mono">{payConfig.pagoMovil.telefono}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentField(payConfig.pagoMovil.telefono, 'telefono')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Copiar teléfono"
                          >
                            {copiedKey === 'telefono' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Cédula / RIF:</div>
                            <div className="font-black text-white font-mono">{payConfig.pagoMovil.cedula}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentField(payConfig.pagoMovil.cedula, 'cedula')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Copiar cédula / RIF"
                          >
                            {copiedKey === 'cedula' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Titular de la Cuenta:</div>
                            <div className="font-black text-white">{payConfig.pagoMovil.titular}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentField(payConfig.pagoMovil.titular, 'titular')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Copiar titular"
                          >
                            {copiedKey === 'titular' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Monto Exacto en Bolívares */}
                      <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">
                            Monto Exacto a Transferir en Bolívares:
                          </div>
                          <div className="text-xl font-black text-white font-mono">
                            Bs. {(ONBOARDING_PLANS[selectedPaidPlan].priceUsd * payConfig.tasaBinanceUsd).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPaymentField((ONBOARDING_PLANS[selectedPaidPlan].priceUsd * payConfig.tasaBinanceUsd).toFixed(2), 'monto-bs')}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copiedKey === 'monto-bs' ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedKey === 'monto-bs' ? '¡Monto Copiado!' : 'Copiar Monto en Bs'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'binance' && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <span className="text-xs font-black text-white flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span>Datos para Transferir vía Binance Pay / USDT:</span>
                        </span>
                        <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          USDT (TRC-20)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Binance Pay ID:</div>
                            <div className="font-black text-white font-mono">{payConfig.binance.payId}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentField(payConfig.binance.payId, 'payId')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Copiar Pay ID"
                          >
                            {copiedKey === 'payId' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Correo Binance:</div>
                            <div className="font-black text-white font-mono">{payConfig.binance.email}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentField(payConfig.binance.email, 'emailBinance')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Copiar Correo"
                          >
                            {copiedKey === 'emailBinance' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div className="truncate mr-2">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Dirección USDT (Red TRC-20):</div>
                          <div className="font-black text-white font-mono text-xs truncate">{payConfig.binance.usdtAddress}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPaymentField(payConfig.binance.usdtAddress, 'usdtAddress')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copiedKey === 'usdtAddress' ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedKey === 'usdtAddress' ? 'Copiada' : 'Copiar Dirección'}</span>
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
                        <span>Monto a transferir:</span>
                        <strong className="text-base text-amber-400 font-black">${ONBOARDING_PLANS[selectedPaidPlan].priceUsd}.00 USDT</strong>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'zinli' && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <span className="text-xs font-black text-white flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          <span>Datos para Transferir vía Zinli (Billetera Digital en Dólares):</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                          USD
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Correo de Recepción:</div>
                            <div className="font-black text-white font-mono">{payConfig.zinli.email}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentField(payConfig.zinli.email, 'emailZinli')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Copiar Correo"
                          >
                            {copiedKey === 'emailZinli' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Titular / Beneficiario:</div>
                            <div className="font-black text-white">{payConfig.zinli.titular}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentField(payConfig.zinli.titular, 'titularZinli')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Copiar Titular"
                          >
                            {copiedKey === 'titularZinli' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
                        <span>Monto exacto a transferir:</span>
                        <strong className="text-base text-emerald-400 font-black">${ONBOARDING_PLANS[selectedPaidPlan].priceUsd}.00 USD</strong>
                      </div>
                    </div>
                  )}

                  {/* Formulario para ingresar comprobante o referencia */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Número de Referencia Bancaria / ID de Operación:
                      </label>
                      <input
                        type="text"
                        value={paymentRefNumber}
                        onChange={(e) => setPaymentRefNumber(e.target.value)}
                        placeholder="Ejemplo: 04829104 ó Hash de transacción"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    {/* Botones de Acción de Pago */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSendWhatsAppPaymentReport}
                        className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Reportar Comprobante por WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCompleteRegistration}
                        className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-xs shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        <span>Confirmar Pago y Activar Mi Licencia</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-center text-slate-400 pt-1">
                      💡 Al confirmar, se creará su cuenta con su membrete oficial y entrará de inmediato a su panel de consultas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>← Cambiar Plan / Modalidad</span>
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Siguiente Paso</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : currentStep === 4 ? (
                selectedPlanType === 'prueba-14' ? (
                  <button
                    type="button"
                    onClick={handleCompleteRegistration}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-xl shadow-emerald-900/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Completar Registro y Entrar a Prueba Gratis (14 Días)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setErrorMsg(null); setCurrentStep(5); }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-sm rounded-xl shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>Continuar al Pago y Activación ({selectedPaidPlan === 'anual' ? '$95 USD' : selectedPaidPlan === 'trimestral' ? '$28 USD' : '$10 USD'})</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-xl shadow-emerald-900/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Confirmar Pago y Entrar a Mi Consultorio</span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* MODE: LOGIN CON CORREO Y CLAVE                          */}
        {/* ======================================================== */}
        {viewMode === 'login' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-2 border border-blue-500/30 shadow-inner">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white">Ingreso al Consultorio Digital</h2>
              <p className="text-xs text-slate-400 mt-1">
                Ingrese con su <strong>Correo Electrónico</strong> y su <strong>Clave de Acceso</strong>:
              </p>
            </div>

            {/* Banner cuando acaba de registrar sus datos */}
            {justRegisteredNotice && (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-200 text-xs animate-in fade-in space-y-1.5 shadow-lg shadow-emerald-950/40">
                <div className="font-bold flex items-center gap-2 text-emerald-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>¡Registro Exitoso de su Consultorio!</span>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Sus datos han sido guardados de forma permanente. Por favor ingrese a continuación con su <strong>correo electrónico</strong> y la <strong>clave de acceso</strong> creada.
                </p>
              </div>
            )}



            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-sm mx-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Correo Electrónico: *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    autoFocus
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="doctor@ejemplo.com o cédula"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Clave de Acceso: *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPasswordInput}
                    onChange={(e) => setLoginPasswordInput(e.target.value)}
                    placeholder="Su clave de acceso"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    title={showLoginPassword ? 'Ocultar clave' : 'Ver clave'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  🔒 Sus datos, récipes, pacientes y administración están 100% protegidos y nunca se borran.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar con Correo y Clave</span>
              </button>

              {/* Botón Cambiar Clave */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>¿Desea cambiar su clave o la olvidó? Cambiar Clave</span>
                </button>
              </div>



              <div className="text-center pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setViewMode('wizard'); setCurrentStep(0); setErrorMsg(null); }}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  ¿No se ha registrado aún? Elija su Prueba Gratuita de 14 Días o Plan aquí
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-2xl w-full mx-auto py-2 text-center text-[11px] text-slate-600">
        Digital Medic · Plataforma Médica Profesional
      </footer>

      {/* Modal para Cambiar Clave */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        registeredDoctors={registeredDoctors}
        onPasswordChanged={(updatedDoc) => {
          setLoginInput(updatedDoc.email || updatedDoc.ci);
          setLoginPasswordInput(updatedDoc.password || '');
        }}
      />

      {/* ======================================================== */}
      {/* MODAL EMERGENTE: DATOS DE PAGO DEL DESARROLLADOR (OPCIÓN 2) */}
      {/* ======================================================== */}
      {isPaymentInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/90 rounded-3xl p-5 sm:p-7 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative space-y-5">
            
            {/* Header del Modal */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Datos Oficiales del Desarrollador</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Pagar Suscripción / Métodos de Pago
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Realice su pago directamente utilizando cualquiera de los canales autorizados por el desarrollador:
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPaymentInfoModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Planes para el Pago */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Seleccione el Plan que desea pagar:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(['mensual', 'trimestral', 'anual'] as const).map((pKey) => {
                  const p = ONBOARDING_PLANS[pKey];
                  const isSel = selectedPaidPlan === pKey;
                  return (
                    <div
                      key={pKey}
                      onClick={() => setSelectedPaidPlan(pKey)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                        isSel 
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-md ring-1 ring-amber-400' 
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-white text-xs">{p.name}</span>
                        {isSel && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                      </div>
                      <div className="text-lg font-black text-amber-400 font-mono">
                        ${p.priceUsd} <span className="text-[10px] text-slate-400 font-sans">{p.periodText}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {pKey === 'anual' ? 'Incluye Estudio de Diseño PRO' : pKey === 'trimestral' ? 'Ahorro con descuento por 3 meses' : 'Acceso mensual completo'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Beneficios Incluidos en el Plan Seleccionado */}
            <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-amber-500/30 text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Beneficios incluidos en {ONBOARDING_PLANS[selectedPaidPlan].name}:</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-cyan-300">
                  ${ONBOARDING_PLANS[selectedPaidPlan].priceUsd} {ONBOARDING_PLANS[selectedPaidPlan].periodText}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {ONBOARDING_PLANS[selectedPaidPlan].desc}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                {ONBOARDING_PLANS[selectedPaidPlan].features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explicación de Estudio de Diseño si es Plan Anual Master */}
            {selectedPaidPlan === 'anual' && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-1.5 animate-in fade-in">
                <div className="font-black text-amber-300 flex items-center gap-1.5 text-xs">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>Beneficio Exclusivo Plan Anual Master ($95/año): Estudio de Diseño PRO</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Podrá personalizar membretes de alta gama, dobles logotipos institucionales, sellos vectoriales con tintas notariales, firmas caligráficas estilizadas y filigranas de seguridad milimétricas para su consultorio.
                </p>
              </div>
            )}

            {/* Selector de Método de Pago */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Seleccione el canal de transferencia:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('pagomovil')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'pagomovil'
                      ? 'bg-blue-600/25 border-blue-400 text-white shadow-md ring-1 ring-blue-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span>Pago Móvil (Bs)</span>
                  </div>
                  {selectedPaymentMethod === 'pagomovil' && <Check className="w-3.5 h-3.5 text-blue-400 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('binance')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'binance'
                      ? 'bg-amber-600/25 border-amber-400 text-white shadow-md ring-1 ring-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Binance Pay / USDT</span>
                  </div>
                  {selectedPaymentMethod === 'binance' && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('zinli')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'zinli'
                      ? 'bg-emerald-600/25 border-emerald-400 text-white shadow-md ring-1 ring-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Zinli (USD)</span>
                  </div>
                  {selectedPaymentMethod === 'zinli' && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* Datos Detallados para Transferir con Botones Copiar */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
              {selectedPaymentMethod === 'pagomovil' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-blue-400" />
                      <span>Pago Móvil en Bolívares (Tasa Binance P2P):</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-600/40 flex items-center gap-1">
                        <span>Tasa Binance:</span>
                        <span className="text-white">Bs. {payConfig.tasaBinanceUsd.toFixed(2)}</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleRefreshLiveBinanceRate}
                        disabled={isRefreshingRate}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Consultar tasa P2P en vivo en Binance"
                      >
                        <RotateCcw className={`w-3 h-3 ${isRefreshingRate ? 'animate-spin' : ''}`} />
                        <span>{isRefreshingRate ? 'Consultando...' : '⚡ En vivo'}</span>
                      </button>
                      <a
                        href="https://p2p.binance.com/es/trade/all-payments/USDT?fiat=VES"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-cyan-400 hover:underline inline-flex items-center gap-0.5 ml-1"
                        title="Ver mercado P2P Binance Venezuela oficial"
                      >
                        <span>Ver Binance P2P ↗</span>
                      </a>
                    </div>
                  </div>

                  {(!payConfig.pagoMovil.banco && !payConfig.pagoMovil.telefono) ? (
                    <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <strong className="text-amber-300">Datos de Pago Móvil aún no configurados.</strong>
                        <p className="text-[11px] text-slate-400">El administrador aún no ha ingresado las cuentas de Pago Móvil.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditPaymentModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
                      >
                        ⚙️ Configurar Mis Datos
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Banco:</div>
                          <div className="font-black text-white">{payConfig.pagoMovil.banco}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPaymentField(payConfig.pagoMovil.banco, 'banco')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                          title="Copiar"
                        >
                          {copiedKey === 'banco' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Teléfono:</div>
                          <div className="font-black text-white font-mono">{payConfig.pagoMovil.telefono}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPaymentField(payConfig.pagoMovil.telefono, 'telefono')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                          title="Copiar"
                        >
                          {copiedKey === 'telefono' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Cédula / RIF:</div>
                          <div className="font-black text-white font-mono">{payConfig.pagoMovil.cedula}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPaymentField(payConfig.pagoMovil.cedula, 'cedula')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                          title="Copiar"
                        >
                          {copiedKey === 'cedula' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Titular:</div>
                          <div className="font-black text-white">{payConfig.pagoMovil.titular}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPaymentField(payConfig.pagoMovil.titular, 'titular')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                          title="Copiar"
                        >
                          {copiedKey === 'titular' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Monto exacto a transferir */}
                  <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="text-[10px] text-blue-300 font-bold uppercase">Monto Exacto a Transferir:</div>
                      <div className="text-xl font-black text-white font-mono">
                        Bs. {(ONBOARDING_PLANS[selectedPaidPlan].priceUsd * payConfig.tasaBinanceUsd).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-xs text-blue-300 font-normal ml-2">(${ONBOARDING_PLANS[selectedPaidPlan].priceUsd} USD)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyPaymentField((ONBOARDING_PLANS[selectedPaidPlan].priceUsd * payConfig.tasaBinanceUsd).toFixed(2), 'monto-bs')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedKey === 'monto-bs' ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey === 'monto-bs' ? '¡Copiado!' : 'Copiar Monto en Bs'}</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'binance' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Binance Pay / USDT (Cripto):</span>
                    </span>
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                      Red TRC-20
                    </span>
                  </div>

                  {(!payConfig.binance.payId && !payConfig.binance.email) ? (
                    <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <strong className="text-amber-300">Cuenta de Binance aún no configurada.</strong>
                        <p className="text-[11px] text-slate-400">El administrador aún no ha ingresado el Binance Pay ID.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditPaymentModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
                      >
                        ⚙️ Configurar Mis Datos
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Binance Pay ID:</div>
                            <div className="font-black text-white font-mono">{payConfig.binance.payId || 'No asignado'}</div>
                          </div>
                          {payConfig.binance.payId && (
                            <button
                              type="button"
                              onClick={() => handleCopyPaymentField(payConfig.binance.payId, 'payId')}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                            >
                              {copiedKey === 'payId' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Correo Binance:</div>
                            <div className="font-black text-white font-mono">{payConfig.binance.email || 'No asignado'}</div>
                          </div>
                          {payConfig.binance.email && (
                            <button
                              type="button"
                              onClick={() => handleCopyPaymentField(payConfig.binance.email, 'emailBinance')}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                            >
                              {copiedKey === 'emailBinance' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {payConfig.binance.usdtAddress && (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div className="truncate mr-2">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Dirección USDT (TRC-20):</div>
                            <div className="font-black text-white font-mono text-xs truncate">{payConfig.binance.usdtAddress}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentField(payConfig.binance.usdtAddress, 'usdtAddress')}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedKey === 'usdtAddress' ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedKey === 'usdtAddress' ? 'Copiada' : 'Copiar Billetera'}</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
                    <span>Monto a transferir:</span>
                    <strong className="text-base text-amber-400 font-black">${ONBOARDING_PLANS[selectedPaidPlan].priceUsd}.00 USDT</strong>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'zinli' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Zinli (Billetera Digital en Dólares):</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      USD
                    </span>
                  </div>

                  {(!payConfig.zinli.email) ? (
                    <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <strong className="text-emerald-300">Cuenta de Zinli aún no configurada.</strong>
                        <p className="text-[11px] text-slate-400">El administrador aún no ha ingresado el correo de Zinli.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditPaymentModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
                      >
                        ⚙️ Configurar Mis Datos
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Correo de Recepción:</div>
                          <div className="font-black text-white font-mono">{payConfig.zinli.email}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPaymentField(payConfig.zinli.email, 'emailZinli')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                        >
                          {copiedKey === 'emailZinli' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Titular / Beneficiario:</div>
                          <div className="font-black text-white">{payConfig.zinli.titular || 'Titular de la cuenta'}</div>
                        </div>
                        {payConfig.zinli.titular && (
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentField(payConfig.zinli.titular, 'titularZinli')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                          >
                            {copiedKey === 'titularZinli' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
                    <span>Monto a transferir:</span>
                    <strong className="text-base text-emerald-400 font-black">${ONBOARDING_PLANS[selectedPaidPlan].priceUsd}.00 USD</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Acciones del Modal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleSendWhatsAppPaymentReport}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Reportar Comprobante por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPaymentInfoModalOpen(false);
                  setSelectedPlanType('pago');
                  setErrorMsg(null);
                  setCurrentStep(1);
                }}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-xs shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <span>Registrar Mis Datos y Activar Licencia</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <p className="text-[10.5px] text-center text-slate-500">
              💡 Una vez realizado el pago, puede registrar sus datos médicos para emitir récipes con su sello y membrete oficial.
            </p>

            {/* Acceso para Administrador: Editar datos de cobro */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-[11px] text-slate-400">¿Administrador de cobros?</span>
              <button
                type="button"
                onClick={() => setIsEditPaymentModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white font-bold text-xs border border-amber-500/40 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>⚙️ Editar Mis Datos de Cobro (Cuentas y Tasa)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar Datos de Cobro */}
      <EditPaymentConfigModal
        isOpen={isEditPaymentModalOpen}
        onClose={() => setIsEditPaymentModalOpen(false)}
        onSaved={(updated) => {
          setPayConfig(updated);
        }}
      />

      {/* Modal Selector de Logo por Especialidad */}
      {isLogoModalOpen && (
        <BasicLogoSelectorModal
          isOpen={isLogoModalOpen}
          onClose={() => setIsLogoModalOpen(false)}
          side="logoDer"
          currentLogo={customLogoImg || undefined}
          onSelectLogo={(_, dataUrl) => {
            setCustomLogoImg(dataUrl);
            setIsLogoModalOpen(false);
          }}
          onRemoveLogo={() => {
            setCustomLogoImg(null);
            setIsLogoModalOpen(false);
          }}
        />
      )}

    </div>
  );
};
