import React, { useState, useRef } from 'react';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  Key, 
  ShieldCheck, 
  Crown, 
  Building2, 
  Phone, 
  Mail, 
  Award, 
  Copy, 
  Check, 
  Sparkles,
  UserCheck,
  Upload,
  Palette,
  Zap,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { DoctorConfig } from '../types';
import { 
  DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 
  MEDICINE_EMBLEM_ESCULAPIO_SVG,
  createDoctorStampSVG,
  createCalligraphicSignatureSVG 
} from '../data/defaultAssets';
import { createTrialConfig } from '../utils/trialHelper';
import { removeDarkBackgroundAndEnhanceInk } from '../utils/imageCleanup';

interface AdminCreateDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNewDoctor: (newDoctor: DoctorConfig) => void;
  onEditDoctorDesign?: (doctor: DoctorConfig) => void;
  onLoginAsDoctor?: (doctor: DoctorConfig) => void;
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
  'Medicina Familiar',
  'Nutrición y Dietética Clínica',
  'Radiología e Imagenología',
  'Otra Especialidad'
];

export const AdminCreateDoctorModal: React.FC<AdminCreateDoctorModalProps> = ({
  isOpen,
  onClose,
  onSaveNewDoctor,
  onEditDoctorDesign,
  onLoginAsDoctor
}) => {
  const [treatment, setTreatment] = useState<'Dr.' | 'Dra.'>('Dr.');
  const [fullName, setFullName] = useState('');
  const [ci, setCi] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('Traumatología y Ortopedia');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [mpps, setMpps] = useState('');
  const [collegeNumber, setCollegeNumber] = useState('');
  const [phone, setPhone] = useState('+58 ');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [version, setVersion] = useState<'mensual' | 'trimestral' | 'anual'>('mensual');
  const [paymentStatus, setPaymentStatus] = useState<'activo' | 'prueba' | 'pendiente'>('activo');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New assets for direct editing during creation: Logo, Sello, Firma, Color
  const [primaryColor, setPrimaryColor] = useState<string>('#1e3a8a');
  const [logoIzq, setLogoIzq] = useState<string>('');
  const [customStampImg, setCustomStampImg] = useState<string>('');
  const [customSigImg, setCustomSigImg] = useState<string>('');
  const [stampShape, setStampShape] = useState<'oval' | 'rectangular'>('oval');
  const [isCleaningImage, setIsCleaningImage] = useState<boolean>(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);
  
  // Success state with credential summary
  const [createdDoctor, setCreatedDoctor] = useState<DoctorConfig | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  if (!isOpen) return null;

  // Auto-sync password with CI if password was untouched
  const handleCiChange = (val: string) => {
    setCi(val);
    if (!password || password === ci) {
      setPassword(val);
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo' | 'sello' | 'firma'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      if (typeof evt.target?.result === 'string') {
        let finalData = evt.target.result;
        if (field === 'sello' || field === 'firma') {
          setIsCleaningImage(true);
          try {
            finalData = await removeDarkBackgroundAndEnhanceInk(finalData, 210, true);
          } catch (err) {
            console.warn('Error cleaning image:', err);
          } finally {
            setIsCleaningImage(false);
          }
        }
        if (field === 'logo') setLogoIzq(finalData);
        if (field === 'sello') setCustomStampImg(finalData);
        if (field === 'firma') setCustomSigImg(finalData);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = fullName.trim();
    const cleanCi = ci.trim();
    const finalPass = password.trim() || cleanCi;

    if (!cleanName) {
      setErrorMsg('Por favor ingrese el Nombre y Apellidos del médico.');
      return;
    }
    if (!cleanCi) {
      setErrorMsg('Por favor ingrese la Cédula de Identidad (será su usuario de acceso).');
      return;
    }

    const formattedDoctorName = `${treatment} ${cleanName.replace(/^(Dr\.|Dra\.)\s*/i, '')}`;
    const formattedCi = cleanCi.toUpperCase().startsWith('V-') || cleanCi.toUpperCase().startsWith('E-')
      ? cleanCi.toUpperCase()
      : `V-${cleanCi}`;

    const effectiveSpecialty = specialty === 'Otra Especialidad' && customSpecialty.trim() 
      ? customSpecialty.trim() 
      : specialty;

    const formattedSpecialty = effectiveSpecialty.startsWith('Especialista') || effectiveSpecialty.startsWith('Médico')
      ? effectiveSpecialty
      : `Especialista en ${effectiveSpecialty}`;

    const newId = `doc-${Date.now()}`;
    const isPaid = paymentStatus === 'activo';
    const planName = version === 'anual' ? 'Anual VIP' : version === 'trimestral' ? 'Trimestral PRO' : 'Mensual PRO';

    // Auto-generate clean SVG stamp & signature if custom was not uploaded
    const autoStamp = createDoctorStampSVG(
      formattedDoctorName,
      mpps.trim() || '00.000',
      formattedCi,
      primaryColor,
      formattedSpecialty.toUpperCase(),
      stampShape,
      collegeNumber.trim() ? (collegeNumber.includes('CMD') ? collegeNumber : `CMD: ${collegeNumber}`) : ''
    );

    const autoSig = createCalligraphicSignatureSVG(formattedDoctorName, 'ejecutiva-pluma', primaryColor);

    const finalStamp = customStampImg || autoStamp;
    const finalSig = customSigImg || autoSig;

    const newDoc: DoctorConfig = {
      id: newId,
      profileName: formattedDoctorName,
      doctorName: formattedDoctorName,
      specialty: formattedSpecialty,
      mpps: mpps.trim() || 'S/N',
      ci: formattedCi,
      password: finalPass,
      collegeNumber: collegeNumber.trim() ? (collegeNumber.includes('CMD') ? collegeNumber : `CMD: ${collegeNumber}`) : 'Colegio N/A',
      phone: phone.trim(),
      email: email.trim() || `${cleanCi.replace(/[^0-9]/g, '')}@digitalmedic.com`,
      socialHandle: `@${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.')}`,
      institution: institution.trim() || 'Consultorio Privado',
      institutionDetails: 'Consulta Médica Autorizada',
      headerStyle: 'clasico',
      headerLayout: 'ambos-logos',
      tonePapel: '#ffffff',
      fuenteHeader: "'Roboto', sans-serif",
      headerColor: primaryColor,
      fuenteNombre: "'Roboto', sans-serif",
      nombreSize: '1.35rem',
      nombreColor: primaryColor,
      primaryDocColor: primaryColor,
      borderStyle: 'solido',
      docCornerRadius: '16px',
      logoSize: 52,
      formaLogo: 'logo-redondo',
      watermarkOpacity: 0.16,
      watermarkScale: 55,
      watermarkRotation: 0,
      logoIzq: logoIzq || '',
      logoDer: MEDICINE_EMBLEM_ESCULAPIO_SVG,
      marcaAgua: logoIzq || DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
      selloImg: finalStamp,
      selloFirma: finalStamp,
      firmaImg: finalSig,
      rxTitle: 'Rp.',
      rxTitleColor: primaryColor,
      bodyFontSize: '13.5px',
      footerNotesText: phone.trim() ? `Citas y Consultas: ${phone.trim()}` : formattedDoctorName,
      footerDisclaimer: 'Válido por 30 días a partir de su fecha de emisión.',
      signatureTitle: 'Firma del médico (a)',
      folioPrefix: 'REC-',
      folioNumber: 1,
      subscriptionPlan: version,
      isPaidClient: isPaid,
      paidPlanName: planName,
      paymentStatus: paymentStatus,
      isVip: version === 'anual' || version === 'trimestral',
      ...(paymentStatus === 'prueba' ? createTrialConfig(14) : {}),
      registrationDate: new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date())
    };

    onSaveNewDoctor(newDoc);
    setCreatedDoctor(newDoc);
  };

  const getWhatsAppMessage = (doc: DoctorConfig) => {
    return `*¡Bienvenido a Digital Médic!* 🩺✨\n\nEstimado(a) *${doc.doctorName}*, su consultorio digital ya fue dado de alta y configurado en la plataforma oficial.\n\n*Sus credenciales de ingreso son:*\n📧 *Correo (Usuario):* ${doc.email}\n👤 *Cédula:* ${doc.ci}\n🔑 *Clave Inicial Asignada:* ${doc.password || doc.ci}\n⭐ *Plan / Estado:* ${doc.paymentStatus === 'prueba' ? 'Prueba Gratuita (14 Días)' : (doc.paidPlanName || 'Activo')}\n\n*Nota:* Al ingresar a la aplicación podrá cambiar su clave de acceso en cualquier momento mediante la opción "Cambiar Clave".\n\nAbra la aplicación, ingrese con su Correo o Cédula y su Clave de Acceso para emitir sus récipes médicos y documentos listos para imprimir o compartir.`;
  };

  const handleCopyWhatsApp = () => {
    if (!createdDoctor) return;
    const msg = getWhatsAppMessage(createdDoctor);
    navigator.clipboard.writeText(msg);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-3 md:p-6 overflow-y-auto modal-overlay animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Dar Ingreso a Nuevo Médico</h2>
              <p className="text-xs text-slate-400">
                Configure sus datos, logo, sello y firma para que ingrese listo a la plataforma
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs font-semibold text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Mode 1: Form to Create */}
          {!createdDoctor ? (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Credentials Box (Cédula y Clave) */}
              <div className="bg-indigo-950/40 border border-indigo-500/40 p-3.5 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <span>Credenciales con las que entrará el Médico a la App:</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Cédula de Identidad (Usuario): *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: V-15.489.288 o 15489288"
                      value={ci}
                      onChange={(e) => handleCiChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-indigo-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Clave de Acceso: *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Por defecto igual a su cédula"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-emerald-300 focus:outline-none focus:border-indigo-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Identity */}
              <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Datos Profesionales del Médico:</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tratamiento:</label>
                    <select
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Dra.">Dra.</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo y Apellidos: *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Carlos Eduardo Leal S."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Especialidad Médica:</label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      {COMMON_SPECIALTIES.map((sp) => (
                        <option key={sp} value={sp}>{sp}</option>
                      ))}
                    </select>
                  </div>

                  {specialty === 'Otra Especialidad' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Especifique Especialidad:</label>
                      <input
                        type="text"
                        placeholder="Ej: Cirugía Cardiovascular"
                        value={customSpecialty}
                        onChange={(e) => setCustomSpecialty(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Color Principal de Récipe:</label>
                      <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-xs text-slate-200 uppercase font-bold">{primaryColor}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nº MPPS (Matrícula):</label>
                    <input
                      type="text"
                      placeholder="Ej: 94.228"
                      value={mpps}
                      onChange={(e) => setMpps(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nº Colegio Médico (CMD / CMA):</label>
                    <input
                      type="text"
                      placeholder="Ej: CMD: 12.450"
                      value={collegeNumber}
                      onChange={(e) => setCollegeNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono Móvil (WhatsApp):</label>
                    <input
                      type="text"
                      placeholder="+58 424 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico:</label>
                    <input
                      type="email"
                      placeholder="medico@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Clínica, Hospital o Consultorio:</label>
                  <input
                    type="text"
                    placeholder="Ej: Centro Médico Quirúrgico / Consultorio 4B"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* SECCIÓN CLAVE: PERSONALIZAR LOGO, SELLO Y FIRMA DEL MÉDICO AL DAR INGRESO */}
              <div className="p-3.5 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/40 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Activos Visuales: Logo, Sello y Firma del Médico</span>
                  </span>
                  {isCleaningImage && (
                    <span className="text-[10px] text-amber-300 font-bold animate-pulse">
                      ⏳ Limpiando fondo transparente...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* 1. Logotipo del Médico */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-200 block mb-1">1. Logotipo:</span>
                      <div className="w-16 h-16 rounded-xl bg-white p-1 mx-auto my-2 flex items-center justify-center border border-slate-600 overflow-hidden shadow-inner">
                        {logoIzq ? (
                          <img src={logoIzq} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[9px] text-slate-400 text-center font-bold">Sin logo</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 mt-1">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Subir Logo</span>
                      </button>
                      {logoIzq && (
                        <button
                          type="button"
                          onClick={() => setLogoIzq('')}
                          className="w-full py-1 bg-slate-800 hover:bg-rose-900/40 text-rose-300 rounded-lg text-[10px] font-bold transition-all"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                    />
                  </div>

                  {/* 2. Sello del Médico */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-200 block mb-1">2. Sello Médico:</span>
                      <div className="w-24 h-16 rounded-xl bg-white p-1 mx-auto my-2 flex items-center justify-center border border-slate-600 overflow-hidden shadow-inner">
                        {customStampImg ? (
                          <img src={customStampImg} alt="Sello" className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-[8px] text-blue-900 font-bold border border-blue-900 rounded p-1 text-center leading-tight">
                            SELLO AUTO
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 mt-1">
                      <button
                        type="button"
                        onClick={() => stampInputRef.current?.click()}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Subir Foto Sello</span>
                      </button>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setStampShape(stampShape === 'oval' ? 'rectangular' : 'oval')}
                          className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold"
                        >
                          {stampShape === 'oval' ? 'Forma: Oval' : 'Forma: Rect'}
                        </button>
                        {customStampImg && (
                          <button
                            type="button"
                            onClick={() => setCustomStampImg('')}
                            className="px-2 py-1 bg-slate-800 hover:bg-rose-900/40 text-rose-300 rounded text-[9px] font-bold"
                          >
                            Auto
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      ref={stampInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'sello')}
                    />
                  </div>

                  {/* 3. Firma del Médico */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-200 block mb-1">3. Firma Digitalizada:</span>
                      <div className="w-24 h-16 rounded-xl bg-white p-1 mx-auto my-2 flex items-center justify-center border border-slate-600 overflow-hidden shadow-inner">
                        {customSigImg ? (
                          <img src={customSigImg} alt="Firma" className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-serif italic text-slate-800 text-[10px] font-bold">Firma Caligráfica</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 mt-1">
                      <button
                        type="button"
                        onClick={() => sigInputRef.current?.click()}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Subir Firma</span>
                      </button>
                      {customSigImg && (
                        <button
                          type="button"
                          onClick={() => setCustomSigImg('')}
                          className="w-full py-1 bg-slate-800 hover:bg-rose-900/40 text-rose-300 rounded-lg text-[9px] font-bold"
                        >
                          Usar Caligráfica
                        </button>
                      )}
                    </div>
                    <input
                      ref={sigInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'firma')}
                    />
                  </div>

                </div>
              </div>

              {/* Version & Subscription Plan Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Plan / Suscripción a Habilitar:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'mensual', name: 'Mensual PRO', desc: 'Emisión y Estudio de Diseño PRO' },
                    { id: 'trimestral', name: 'Trimestral PRO', desc: 'Descuento y validez extendida' },
                    { id: 'anual', name: 'Anual VIP', desc: 'VIP con soporte e historias clínicas' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setVersion(p.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        version === p.id
                          ? 'border-indigo-500 bg-indigo-950/60 ring-1 ring-indigo-500/50'
                          : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs font-bold text-white block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estado de Pago Inicial:</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="prueba">🎁 Prueba Gratuita (14 Días)</option>
                  <option value="activo">✅ Activo / Suscripción Pagada (Acceso Total)</option>
                  <option value="pendiente">⏱️ Pendiente de Pago</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Habilitar e Ingresar Médico</span>
                </button>
              </div>

            </form>
          ) : (
            /* Mode 2: Success & Credentials Card with Immediate Customization Actions */
            <div className="space-y-4 text-center py-2 animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">¡Médico Registrado y Listo en la Nube!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  El perfil de <strong className="text-white">{createdDoctor.doctorName}</strong> ya fue creado con sus logos, sellos y membrete.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-2 max-w-md mx-auto">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Usuario (Cédula):</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">{createdDoctor.ci}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Clave de Acceso:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{createdDoctor.password || createdDoctor.ci}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Versión:</span>
                  <span className="font-bold text-indigo-300">{createdDoctor.paidPlanName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Especialidad:</span>
                  <span className="text-slate-200">{createdDoctor.specialty}</span>
                </div>
              </div>

              {/* Action Buttons: Edit Design, Enter as Doctor, Copy WhatsApp, Close */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2 flex-wrap">
                {onEditDoctorDesign && (
                  <button
                    type="button"
                    onClick={() => {
                      onEditDoctorDesign(createdDoctor);
                      onClose();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
                  >
                    <Palette className="w-4 h-4 text-amber-300" />
                    <span>Personalizar Logo, Sello y Récipe</span>
                  </button>
                )}

                {onLoginAsDoctor && (
                  <button
                    type="button"
                    onClick={() => {
                      onLoginAsDoctor(createdDoctor);
                      onClose();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
                  >
                    <Zap className="w-4 h-4 text-emerald-300" />
                    <span>Entrar a la App como este Médico</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSuccess ? '¡Copiado!' : 'Copiar para WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminCreateDoctorModal;
