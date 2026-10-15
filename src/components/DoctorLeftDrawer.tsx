import React, { useState } from 'react';
import { 
  X, 
  User, 
  Stethoscope, 
  Building2, 
  Phone, 
  Mail, 
  Award, 
  ShieldCheck, 
  Edit3, 
  Save, 
  LogOut, 
  FileText, 
  CheckCircle2,
  Calendar,
  CreditCard,
  MapPin,
  ChevronLeft,
  Home,
  Grid2X2,
  Users,
  FileCheck2,
  ClipboardList,
  Palette,
  Sparkles,
  Play,
  Crown,
  Cloud,
  Monitor,
  Smartphone
} from 'lucide-react';
import { DoctorConfig, ActiveModule } from '../types';
import { DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, getMedicalSymbolSVG, CARLOS_LEAL_DEVELOPER_BADGE_SVG } from '../data/defaultAssets';
import { CeLealStudioLogo } from './CeLealStudioLogo';
import { formatSpecialtyTitle } from './DoctorOnboardingWizard';

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

interface DoctorLeftDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: DoctorConfig;
  onUpdateConfig: (updated: Partial<DoctorConfig>) => void;
  onLogout: () => void;
  onNavigate?: (module: ActiveModule) => void;
  onOpenPatientBank?: () => void;
  onOpenPlans?: () => void;
  onOpenDesignStudio?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenEditPaymentConfig?: () => void;
  onOpenSyncDevices?: () => void;
  isDesktopMode?: boolean;
  onToggleDesktopMode?: () => void;
}

export const DoctorLeftDrawer: React.FC<DoctorLeftDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onLogout,
  onNavigate,
  onOpenPatientBank,
  onOpenPlans,
  onOpenDesignStudio,
  onOpenAdminPanel,
  onOpenEditPaymentConfig,
  onOpenSyncDevices,
  isDesktopMode = false,
  onToggleDesktopMode
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const isAdminUser = Boolean(
    config.isAdmin ||
    config.id === 'doc-admin-master' ||
    (config.email && (
      config.email.toLowerCase().includes('carloseduardoleal29@gmail.com') ||
      config.email.toLowerCase().includes('carloslealdeveloper@gmail.com') ||
      config.email.toLowerCase().includes('admin@celealstudio.com')
    ))
  );

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

  const [formData, setFormData] = useState({
    doctorName: config.doctorName || '',
    specialty: config.specialty || '',
    mpps: config.mpps || '',
    ci: config.ci || '',
    collegeNumber: config.collegeNumber || '',
    rif: config.rif || '',
    phone: config.phone || '',
    email: config.email || '',
    institution: config.institution || '',
    institutionDetails: config.institutionDetails || '',
    educacionContinua: config.educacionContinua || '',
    socialHandle: config.socialHandle || '',
    enforcePureBlackText: config.enforcePureBlackText || false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if config changes
  React.useEffect(() => {
    setFormData({
      doctorName: config.doctorName || '',
      specialty: config.specialty || '',
      mpps: config.mpps || '',
      ci: config.ci || '',
      collegeNumber: config.collegeNumber || '',
      rif: config.rif || '',
      phone: config.phone || '',
      email: config.email || '',
      institution: config.institution || '',
      institutionDetails: config.institutionDetails || '',
      educacionContinua: config.educacionContinua || '',
      socialHandle: config.socialHandle || '',
      enforcePureBlackText: config.enforcePureBlackText || false,
    });
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...formData,
      specialty: formatSpecialtyTitle(formData.specialty),
    };
    onUpdateConfig(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 no-print ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Panel Sliding from Left */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-50 w-full max-w-sm sm:max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out no-print border-r border-slate-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Panel lateral del médico"
      >
        {/* Drawer Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-md flex items-center justify-center shrink-0 logo-animated-alive sheen-wrapper border border-cyan-400/40">
              <img 
                src={DIGITAL_MEDIC_OFFICIAL_LOGO_SVG} 
                alt="Logo Digital Medic" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black uppercase tracking-tight text-white">
                  Datos del Médico & Clínica
                </h2>
              </div>
              <p className="text-[11px] text-teal-300 font-medium">
                Perfil Oficial y Consultorio Activo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar panel (Tocar para ocultar)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Saved Success Notification */}
        {savedSuccess && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ Datos actualizados y sincronizados exitosamente</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          


          {/* Doctor Profile Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl p-4 border border-blue-200/80 shadow-xs relative">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center text-lg font-black shadow-md shadow-blue-500/30 shrink-0 border-2 border-white">
                {config.doctorPhoto ? (
                  <img src={config.doctorPhoto} alt="Doctor" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span>{config.doctorName?.slice(0, 2).toUpperCase() || 'DR'}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {config.showMedicalSymbols !== false && (
                    <img 
                      src={getMedicalSymbolSVG(config.medicalSymbolType || 'esculapio', '#2563eb')} 
                      alt="Símbolo médico" 
                      className="w-4 h-4 object-contain shrink-0" 
                    />
                  )}
                  <h3 className="font-black text-slate-900 text-base leading-snug truncate">
                    {config.doctorName || 'Dr(a). Médico'}
                  </h3>
                </div>
                <p className="text-xs font-bold text-blue-700 mt-0.5">
                  {config.specialty || 'Especialista Médico'}
                </p>
                {config.educacionContinua && (
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                    🎓 {config.educacionContinua}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2 py-0.5 bg-blue-100/80 text-blue-900 rounded-md text-[10px] font-bold">
                    MPPS: {config.mpps || 'N/A'}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-200/70 text-slate-800 rounded-md text-[10px] font-bold">
                    C.I.: {config.ci || 'N/A'}
                  </span>
                  {config.collegeNumber && (
                    <span className="px-2 py-0.5 bg-indigo-100/80 text-indigo-900 rounded-md text-[10px] font-bold">
                      {config.collegeNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sesión autorizada
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors border border-blue-300 flex items-center gap-1 shadow-2xs"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'Cerrar Edición' : 'Editar Datos'}</span>
              </button>
            </div>
          </div>

          {/* Prominent Admin Panel Banner (Solo Administrador) */}
          {isAdminUser && onOpenAdminPanel && (
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 border-2 border-indigo-400 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                  <Crown className="w-3 h-3 text-amber-300" />
                  <span>ADMINISTRADOR MASTER</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  ● Reconocido
                </span>
              </div>
              <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Panel de Administración Central</span>
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Creación e ingreso de médicos, validación de pagos y activación con botón <strong>"▶ DAR PLAY"</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminPanel();
                }}
                className="w-full mt-3 py-2 px-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform group-hover:scale-[1.01] active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Abrir Panel de Administrador ("Dar Play") →</span>
              </button>

              {/* Botón directo para Editar Datos de Cobro */}
              {onOpenEditPaymentConfig && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEditPaymentConfig();
                  }}
                  className="w-full mt-2 py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-300 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚙️ Editar Mis Datos de Cobro (Cuentas y Tasa)</span>
                </button>
              )}
            </div>
          )}

          {/* Prominent PRO Banner: Estudio de Diseño (Solo Administrador y Usuarios VIP) */}
          {isAuthorizedForDesigner && (
            <div className="bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-blue-500/10 rounded-2xl p-4 border-2 border-amber-400/70 shadow-md relative overflow-hidden group">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                  👑 {config.isAdmin ? 'ADMINISTRADOR' : 'USUARIO VIP'}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                  ✓ Activo
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>Estudio de Diseño PRO</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Edite a su gusto todo: <strong>letras, tipografías, colores, formatos de récipes, membretes, sellos y logos</strong>.
              </p>
              {onOpenDesignStudio && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDesignStudio();
                  }}
                  className="w-full mt-3 py-2 px-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform group-hover:scale-[1.01] active:scale-95"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-300" />
                  <span>Abrir Estudio de Diseño PRO →</span>
                </button>
              )}
            </div>
          )}

          {/* EDIT FORM (When editing) */}
          {isEditing ? (
            <form onSubmit={handleSave} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Editar Información del Médico y Clínica</span>
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Especialidad Médica:</label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="Ej: Especialista en Cardiología"
                  required
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    Educación Médica Continua / Postgrados (Opcional):
                  </label>
                  {formData.educacionContinua && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, educacionContinua: '' }))}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-bold underline cursor-pointer"
                    >
                      Quitar / Dejar vacío
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  name="educacionContinua"
                  value={formData.educacionContinua}
                  onChange={handleChange}
                  placeholder="Dejar vacío si no desea mostrar postgrados..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">C.I.:</label>
                  <input
                    type="text"
                    name="ci"
                    value={formData.ci}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Código MPPS:</label>
                  <input
                    type="text"
                    name="mpps"
                    value={formData.mpps}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Colegio de Médicos:</label>
                  <input
                    type="text"
                    name="collegeNumber"
                    value={formData.collegeNumber}
                    onChange={handleChange}
                    placeholder="CMD: 12.345"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">RIF (Opcional):</label>
                  <input
                    type="text"
                    name="rif"
                    value={formData.rif}
                    onChange={handleChange}
                    placeholder="V-00000000-0"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Institución / Clínica / Centro Médico:</label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="Ej: Clínica Santa Sofía / Hospital Central"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Dirección / Consultorio de la Clínica:</label>
                <input
                  type="text"
                  name="institutionDetails"
                  value={formData.institutionDetails}
                  onChange={handleChange}
                  placeholder="Ej: Piso 3, Consultorio 302, Caracas"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Teléfono / WhatsApp:</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+58 414-0000000"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Instagram:</label>
                  <input
                    type="text"
                    name="socialHandle"
                    value={formData.socialHandle}
                    onChange={handleChange}
                    placeholder="@dr.tunombre"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Correo Electrónico:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@ejemplo.com"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Opción de Negro Puro */}
              <div className="flex items-center gap-2.5 pt-1.5 pb-1">
                <input
                  type="checkbox"
                  id="enforcePureBlackText"
                  checked={formData.enforcePureBlackText}
                  onChange={(e) => setFormData(prev => ({ ...prev, enforcePureBlackText: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="enforcePureBlackText" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Pure Black Text / Texto en Negro Puro (Alta legibilidad)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          ) : (
            /* VIEW DETAILS MODE */
            <div className="space-y-4">
              
              {/* Clinic and Location Info */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Datos de la Clínica & Consultorio</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Institución:</span>
                      <p className="text-slate-600">{config.institution || 'No especificada (Haga clic en Editar Datos)'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Ubicación / Piso / Consultorio:</span>
                      <p className="text-slate-600">{config.institutionDetails || 'Consultorio privado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Contacto y Canales del Consultorio</span>
                </h4>

                <div className="space-y-2 text-xs">
                  {config.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800">Teléfono / WhatsApp:</span>
                      <span className="text-slate-600 font-mono">{config.phone}</span>
                    </div>
                  )}

                  {config.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800">Correo:</span>
                      <span className="text-slate-600 truncate">{config.email}</span>
                    </div>
                  )}

                  {config.socialHandle && (
                    <div className="flex items-center gap-2">
                      <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                      <span className="font-bold text-slate-800">Instagram:</span>
                      <span className="text-slate-600">{config.socialHandle}</span>
                    </div>
                  )}

                  {!config.phone && !config.email && !config.socialHandle && (
                    <p className="text-slate-400 text-xs italic">
                      Agregue teléfono y redes tocando "Editar Datos" arriba.
                    </p>
                  )}
                </div>
              </div>

              {/* Digital Stamp & Security Verification */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Sello y Membrete Oficial</span>
                  </h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Activo
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Sus récipes, informes, reposos e historias se emiten con el membrete, sello digital y firma autorizada de este consultorio.
                </p>
                {onOpenDesignStudio && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDesignStudio();
                    }}
                    className="w-full mt-2 py-1.5 px-3 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    Personalizar Membrete en Estudio de Diseño →
                  </button>
                )}
              </div>

              {/* Opción de Negro Puro (Alta Legibilidad) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-blue-600" />
                  <span>Contraste e Impresión</span>
                </h4>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">Texto en Negro Puro:</span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Fuerza la tinta a negro absoluto (#000000) en todos los formatos para garantizar una impresión 100% nítida y legible. En especial en impresoras con tinta clara.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={config.enforcePureBlackText || false}
                      onChange={(e) => onUpdateConfig({ enforcePureBlackText: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Module Navigation Shortcuts */}
              {onNavigate && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5 shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span>Módulos del Consultorio</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {isAuthorizedForDesigner && onOpenDesignStudio && (
                      <button
                        onClick={() => { onClose(); onOpenDesignStudio(); }}
                        className="p-2.5 bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-blue-500/15 hover:from-amber-500/25 hover:to-indigo-500/25 text-indigo-950 rounded-xl font-black text-left border border-indigo-300/80 transition-all flex items-center justify-between col-span-2 shadow-xs cursor-pointer group"
                        title="Personalizar letras, colores, membretes y récipes"
                      >
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-indigo-600 shrink-0 group-hover:rotate-12 transition-transform" />
                          <span className="text-xs font-black">🎨 Estudio de Diseño PRO</span>
                        </div>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700 font-bold shadow-2xs">
                          👑 {config.isAdmin ? 'ADMIN' : 'VIP'}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => { onClose(); onNavigate('inicio'); }}
                      className="p-2.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-bold text-slate-700 text-left border border-slate-200/80 transition-all flex items-center gap-2"
                    >
                      <Home className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Inicio</span>
                    </button>
                    <button
                      onClick={() => { onClose(); onNavigate('recipe-4en1'); }}
                      className="p-2.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-bold text-slate-700 text-left border border-slate-200/80 transition-all flex items-center gap-2"
                    >
                      <Grid2X2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Récipes Médicos (4 en 1)</span>
                    </button>
                    <button
                      onClick={() => { onClose(); onNavigate('historias'); }}
                      className="p-2.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-bold text-slate-700 text-left border border-slate-200/80 transition-all flex items-center gap-2"
                    >
                      <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Historias</span>
                    </button>
                    <button
                      onClick={() => { onClose(); onNavigate('informes'); }}
                      className="p-2.5 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 rounded-xl font-bold text-slate-700 text-left border border-slate-200/80 transition-all flex items-center gap-2"
                    >
                      <FileCheck2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Informes</span>
                    </button>
                    <button
                      onClick={() => { onClose(); onNavigate('indicaciones'); }}
                      className="p-2.5 bg-slate-50 hover:bg-cyan-50 hover:text-cyan-700 rounded-xl font-bold text-slate-700 text-left border border-slate-200/80 transition-all flex items-center gap-2"
                    >
                      <ClipboardList className="w-4 h-4 text-cyan-600 shrink-0" />
                      <span>Indicaciones</span>
                    </button>
                    <button
                      onClick={() => { onClose(); onNavigate('reposo'); }}
                      className="p-2.5 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 rounded-xl font-bold text-slate-700 text-left border border-slate-200/80 transition-all flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Reposo</span>
                    </button>
                    {onOpenPatientBank && (
                      <button
                        onClick={() => { onClose(); onOpenPatientBank(); }}
                        className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-left border border-emerald-200/80 transition-all flex items-center gap-2 col-span-2 shadow-2xs"
                      >
                        <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>📂 Abrir Banco de Pacientes Grabados</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Drawer Footer Actions & Developer Branding */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2.5 shrink-0">
          


          {/* Botón Sincronizar Móvil / PC */}
          {onOpenSyncDevices && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSyncDevices();
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md border border-blue-400/40"
            >
              <Smartphone className="w-4 h-4 text-cyan-300" />
              <span>📱 Abrir en mi Celular / PC (QR & Enlace)</span>
            </button>
          )}

          {/* C.E. LEAL Studio Developer Branding Badge */}
          <CeLealStudioLogo variant="badge" className="w-full justify-center" />

          {onOpenPlans && (
            <button
              onClick={() => {
                onClose();
                onOpenPlans();
              }}
              className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <CreditCard className="w-4 h-4" />
              <span>Ver Planes de Pago & Suscripción</span>
            </button>
          )}

          {onOpenEditPaymentConfig && (
            <button
              onClick={() => {
                onClose();
                onOpenEditPaymentConfig();
              }}
              className="w-full py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-300 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>⚙️ Mis Métodos de Cobro (Bs / Binance / Zinli)</span>
            </button>
          )}


          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
