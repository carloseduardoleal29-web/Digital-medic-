import React, { useState } from 'react';
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
  UserCheck
} from 'lucide-react';
import { DoctorConfig } from '../types';
import { 
  DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 
  MEDICINE_EMBLEM_ESCULAPIO_SVG,
  createDoctorStampSVG,
  createCalligraphicSignatureSVG 
} from '../data/defaultAssets';
import { createTrialConfig } from '../utils/trialHelper';

interface AdminCreateDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNewDoctor: (newDoctor: DoctorConfig) => void;
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
  onSaveNewDoctor
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

    // Auto-generate clean SVG stamp & signature
    const autoStamp = createDoctorStampSVG(
      formattedDoctorName,
      mpps.trim() || '00.000',
      formattedCi,
      '#1e3a8a',
      formattedSpecialty.toUpperCase(),
      'oval',
      collegeNumber.trim() ? (collegeNumber.includes('CMD') ? collegeNumber : `CMD: ${collegeNumber}`) : ''
    );

    const autoSig = createCalligraphicSignatureSVG(formattedDoctorName, 'ejecutiva-pluma', '#1e3a8a');

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
      headerColor: '#1e3a8a',
      fuenteNombre: "'Roboto', sans-serif",
      nombreSize: '1.35rem',
      nombreColor: '#1e3a8a',
      primaryDocColor: '#1e3a8a',
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
      selloImg: autoStamp,
      selloFirma: autoStamp,
      firmaImg: autoSig,
      rxTitle: 'Rp.',
      rxTitleColor: '#1e3a8a',
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
      isVip: version === 'anual' || version === 'trimestral', // Elevate to VIP designer access for both trimestral & anual to guarantee access
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
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Dar Ingreso a Nuevo Médico</h2>
              <p className="text-xs text-slate-400">
                El médico quedará registrado en la nube y solo deberá ingresar con su Cédula y Clave
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

              {/* Version & Subscription Plan Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Plan / Suscripción a Habilitar:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'mensual', name: 'Mensual PRO', desc: 'Acceso mensual completo a emisión y Estudio de Diseño PRO' },
                    { id: 'trimestral', name: 'Trimestral PRO', desc: 'Plan trimestral completo con descuento Pro' },
                    { id: 'anual', name: 'Anual VIP', desc: 'Suscripción anual VIP con soporte e historias clínicas' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setVersion(p.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        version === p.id
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        {p.id !== 'basico' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{p.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctor Details */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-3">
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

                  <div className="sm:col-span-9">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre y Apellidos: *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Dr. Alejandro Ramos"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                {/* Specialty */}
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Centro / Clínica:</label>
                    <input
                      type="text"
                      placeholder="Ej: Centro Médico San Judas Tadeo"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                {/* MPPS & College */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">M.P.P.S / Registro:</label>
                    <input
                      type="text"
                      placeholder="Ej: 54.321"
                      value={mpps}
                      onChange={(e) => setMpps(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Colegio de Médicos:</label>
                    <input
                      type="text"
                      placeholder="Ej: CMD: 12.890"
                      value={collegeNumber}
                      onChange={(e) => setCollegeNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono (WhatsApp):</label>
                    <input
                      type="text"
                      placeholder="+58 414-1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico:</label>
                    <input
                      type="email"
                      placeholder="doctor@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                {/* Payment status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estado de Pago:</label>
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
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Habilitar e Ingresar Médico</span>
                </button>
              </div>

            </form>
          ) : (
            /* Mode 2: Success & Credentials Card */
            <div className="space-y-4 text-center py-2 animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">¡Médico Registrado y Listo en la Nube!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  El perfil de <strong className="text-white">{createdDoctor.doctorName}</strong> ya fue creado con sellos y membrete oficial.
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

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedSuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSuccess ? '¡Mensaje Copiado!' : 'Copiar Credenciales para WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
