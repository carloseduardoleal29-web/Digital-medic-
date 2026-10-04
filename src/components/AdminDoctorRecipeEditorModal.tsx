import React, { useState, useRef } from 'react';
import { 
  X, 
  Save, 
  Palette, 
  Type, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  UserCheck, 
  Award, 
  Building2, 
  FileText, 
  Check, 
  Image as ImageIcon,
  Key,
  Crown,
  Eye,
  Sparkles,
  Phone,
  Mail,
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { DoctorConfig } from '../types';
import { 
  DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 
  MEDICINE_EMBLEM_ESCULAPIO_SVG,
  createDoctorStampSVG,
  DoctorStampStyle,
  createCalligraphicSignatureSVG,
  CalligraphicStyle
} from '../data/defaultAssets';
import { removeDarkBackgroundAndEnhanceInk } from '../utils/imageCleanup';

interface AdminDoctorRecipeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorConfig;
  onSaveDoctor: (updated: DoctorConfig) => void;
}

const MEDICAL_PALETTES = [
  { name: 'Azul Marino Oficial', primary: '#1e3a8a', header: '#1e3a8a', nameColor: '#1e3a8a' },
  { name: 'Azul Zafiro Real', primary: '#2563eb', header: '#1d4ed8', nameColor: '#1e40af' },
  { name: 'Verde Quirúrgico', primary: '#059669', header: '#065f46', nameColor: '#064e3b' },
  { name: 'Teal Clínico', primary: '#0d9488', header: '#115e59', nameColor: '#134e4a' },
  { name: 'Gris Carbón Ejecutivo', primary: '#334155', header: '#1e293b', nameColor: '#0f172a' },
  { name: 'Vino Tinto Notarial', primary: '#881337', header: '#4c0519', nameColor: '#4c0519' },
  { name: 'Índigo Moderno', primary: '#4f46e5', header: '#3730a3', nameColor: '#312e81' },
];

export const AdminDoctorRecipeEditorModal: React.FC<AdminDoctorRecipeEditorModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onSaveDoctor,
}) => {
  const [activeTab, setActiveTab] = useState<'membrete' | 'logos' | 'firma-sello' | 'receta' | 'datos'>('membrete');
  
  // Local editable copy of the doctor config
  const [formData, setFormData] = useState<DoctorConfig>({
    ...doctor,
    folioPrefix: doctor.folioPrefix || 'REC-',
    folioNumber: doctor.folioNumber || 1,
    subscriptionPlan: doctor.subscriptionPlan || (doctor.isPaidClient ? 'diseno-pro' : 'basico'),
    paymentStatus: doctor.paymentStatus || 'activo',
    password: doctor.password || doctor.ci || '',
    headerStyle: doctor.headerStyle || 'clasico',
    headerLayout: doctor.headerLayout || 'ambos-logos',
    primaryDocColor: doctor.primaryDocColor || '#1e3a8a',
    headerColor: doctor.headerColor || '#1e3a8a',
    nombreColor: doctor.nombreColor || '#1e3a8a',
    fuenteHeader: doctor.fuenteHeader || "'Roboto', sans-serif",
    fuenteNombre: doctor.fuenteNombre || "'Roboto', sans-serif",
    tonePapel: doctor.tonePapel || '#ffffff',
    logoIzq: doctor.logoIzq || DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
    logoDer: doctor.logoDer || MEDICINE_EMBLEM_ESCULAPIO_SVG,
    marcaAgua: doctor.marcaAgua || DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
    watermarkOpacity: doctor.watermarkOpacity !== undefined ? doctor.watermarkOpacity : 0.16,
    watermarkScale: doctor.watermarkScale !== undefined ? doctor.watermarkScale : 55,
    rxTitle: doctor.rxTitle || 'Rp.',
    footerNotesText: doctor.footerNotesText || `${doctor.phone ? `Citas: ${doctor.phone}` : ''}`,
    footerDisclaimer: doctor.footerDisclaimer || 'Válido por 30 días a partir de su fecha de emisión.',
    signatureTitle: doctor.signatureTitle || 'Firma del médico (a)',
  });

  const [isCleaningImage, setIsCleaningImage] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const leftLogoInputRef = useRef<HTMLInputElement>(null);
  const rightLogoInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof DoctorConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoIzq' | 'logoDer' | 'marcaAgua' | 'selloImg' | 'firmaImg'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      if (typeof evt.target?.result === 'string') {
        let finalData = evt.target.result;
        if (field === 'selloImg' || field === 'firmaImg') {
          setIsCleaningImage(true);
          try {
            finalData = await removeDarkBackgroundAndEnhanceInk(finalData, 210, true);
          } catch (err) {
            console.warn('Error cleaning image:', err);
          }
          setIsCleaningImage(false);
        }
        handleFieldChange(field, finalData);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGenerateOfficialStamp = (style: DoctorStampStyle = 'oval') => {
    const newStamp = createDoctorStampSVG(
      formData.doctorName || 'Dr. Médico',
      formData.mpps || '00.000',
      formData.ci || 'V-00.000.000',
      formData.primaryDocColor || '#1e3a8a',
      formData.specialty || 'MEDICINA GENERAL',
      style,
      formData.collegeNumber || 'CMD: 00.000'
    );
    handleFieldChange('selloImg', newStamp);
    handleFieldChange('selloFirma', newStamp);
  };

  const handleGenerateSignature = (style: CalligraphicStyle = 'ejecutiva-pluma') => {
    const sig = createCalligraphicSignatureSVG(
      formData.doctorName || 'Dr. Médico',
      style,
      formData.primaryDocColor || '#1e3a8a'
    );
    handleFieldChange('firmaImg', sig);
  };

  const handleSave = () => {
    // If the plan is pro or full, set isPaidClient = true
    const isPaid = formData.subscriptionPlan === 'diseno-pro' || formData.subscriptionPlan === 'clinica-full';
    const planName = 
      formData.subscriptionPlan === 'clinica-full' ? 'Versión Full Clínica' :
      formData.subscriptionPlan === 'diseno-pro' ? 'Versión Pro Diseño' : 'Versión Básica';

    const finalizedDoctor: DoctorConfig = {
      ...formData,
      isPaidClient: isPaid,
      paidPlanName: planName,
      paymentStatus: formData.paymentStatus || (isPaid ? 'activo' : 'prueba')
    };

    onSaveDoctor(finalizedDoctor);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-3 md:p-6 overflow-y-auto modal-overlay animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">
                  Personalizar Récipes &amp; Membrete del Médico
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  Configuración Directa Administrador
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure logos, membrete, sellos y correlativo de <strong className="text-white">{formData.doctorName}</strong> para que al entrar ya esté todo listo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar y Dejar Listo</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {savedSuccess && (
          <div className="bg-emerald-600 text-white font-bold text-xs py-2 px-6 flex items-center justify-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ ¡Récipes y configuración guardados con éxito en la nube! El médico ya puede ingresar.</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('membrete')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'membrete'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>1. Membrete &amp; Colores</span>
          </button>

          <button
            onClick={() => setActiveTab('logos')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>2. Logos &amp; Marca de Agua</span>
          </button>

          <button
            onClick={() => setActiveTab('firma-sello')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'firma-sello'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Firma &amp; Sello Oficial</span>
          </button>

          <button
            onClick={() => setActiveTab('receta')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'receta'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. Folio &amp; Textos Récipe</span>
          </button>

          <button
            onClick={() => setActiveTab('datos')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'datos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>5. Credenciales &amp; Versión</span>
          </button>
        </div>

        {/* Modal Main Body (Form + Live 1:1 Preview) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Form Controls (5 cols) */}
          <div className="lg:col-span-6 p-6 overflow-y-auto space-y-5 border-r border-slate-800">
            
            {/* TAB 1: MEMBRETE & COLORES */}
            {activeTab === 'membrete' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4" />
                  <span>Estilo de Encabezado y Colores Médicos</span>
                </h3>

                {/* Header Style */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estilo de Encabezado:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'clasico', name: 'Clásico Formal', desc: 'Línea divisoria y distribución equilibrada' },
                      { id: 'moderno', name: 'Moderno Clínico', desc: 'Bordes estilizados con acento cromático' },
                      { id: 'minimalista', name: 'Minimalista Fino', desc: 'Limpio y directo, máxima claridad' },
                      { id: 'destacado', name: 'Destacado Institucional', desc: 'Franja superior de alto contraste' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleFieldChange('headerStyle', st.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          formData.headerStyle === st.id
                            ? 'bg-indigo-600/30 border-indigo-500 text-white'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-bold text-xs">{st.name}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{st.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Header Layout */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Disposición de Logos en Encabezado:
                  </label>
                  <select
                    value={formData.headerLayout || 'ambos-logos'}
                    onChange={(e) => handleFieldChange('headerLayout', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ambos-logos">Ambos Logos (Izquierdo y Derecho)</option>
                    <option value="solo-logo-izq">Solo Logo Izquierdo</option>
                    <option value="solo-logo-der">Solo Logo Derecho</option>
                    <option value="centrado">Logos y Datos Centrados</option>
                    <option value="solo-texto">Solo Texto (Sin Logos)</option>
                  </select>
                </div>

                {/* Color Palettes Presets */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Paleta de Color Principal del Récipe:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MEDICAL_PALETTES.map((pal) => (
                      <button
                        key={pal.name}
                        type="button"
                        onClick={() => {
                          handleFieldChange('primaryDocColor', pal.primary);
                          handleFieldChange('headerColor', pal.header);
                          handleFieldChange('nombreColor', pal.nameColor);
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          formData.primaryDocColor === pal.primary
                            ? 'border-indigo-400 bg-indigo-950/40 text-white'
                            : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                          style={{ backgroundColor: pal.primary }}
                        />
                        <span className="text-[11px] font-bold truncate">{pal.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Selector */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Color Primario Personalizado:
                    </label>
                    <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                      <input
                        type="color"
                        value={formData.primaryDocColor || '#1e3a8a'}
                        onChange={(e) => {
                          handleFieldChange('primaryDocColor', e.target.value);
                          handleFieldChange('nombreColor', e.target.value);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-200 uppercase font-bold">
                        {formData.primaryDocColor || '#1e3a8a'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Tono de Papel de Récipe:
                    </label>
                    <select
                      value={formData.tonePapel || '#ffffff'}
                      onChange={(e) => handleFieldChange('tonePapel', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="#ffffff">Blanco Puro Clásico</option>
                      <option value="#fafafa">Blanco Clínico Suave</option>
                      <option value="#fffdf5">Marfil Médico Tenue</option>
                      <option value="#f8fafc">Azul Hielo Muy Tenue</option>
                    </select>
                  </div>
                </div>

                {/* Typography */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Tipografía del Nombre:
                    </label>
                    <select
                      value={formData.fuenteNombre || "'Roboto', sans-serif"}
                      onChange={(e) => handleFieldChange('fuenteNombre', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="'Roboto', sans-serif">Roboto (Moderna)</option>
                      <option value="'Playfair Display', serif">Playfair (Elegante)</option>
                      <option value="'Merriweather', serif">Merriweather (Clásica)</option>
                      <option value="'Montserrat', sans-serif">Montserrat (Geométrica)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Tamaño del Nombre:
                    </label>
                    <select
                      value={formData.nombreSize || '1.35rem'}
                      onChange={(e) => handleFieldChange('nombreSize', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="1.15rem">Compacto (1.15rem)</option>
                      <option value="1.35rem">Estándar (1.35rem)</option>
                      <option value="1.55rem">Destacado (1.55rem)</option>
                      <option value="1.75rem">Extra Grande (1.75rem)</option>
                    </select>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: LOGOS & MARCA DE AGUA */}
            {activeTab === 'logos' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>Logotipos Oficiales &amp; Marca de Agua</span>
                </h3>

                {/* Logo Izquierdo */}
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">Logo Izquierdo (Clínica / Centro):</span>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('logoIzq', DIGITAL_MEDIC_OFFICIAL_LOGO_SVG)}
                      className="text-[10px] text-indigo-400 hover:underline"
                    >
                      Usar Logo Digital Médic
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-slate-600 overflow-hidden">
                      {formData.logoIzq ? (
                        <img src={formData.logoIzq} alt="Logo Izquierdo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Sin logo</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => leftLogoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Logo Izquierdo</span>
                      </button>
                      <p className="text-[10px] text-slate-400">Recomendado: PNG o JPG con fondo transparente</p>
                    </div>
                  </div>
                  <input
                    ref={leftLogoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'logoIzq')}
                  />
                </div>

                {/* Logo Derecho */}
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">Logo Derecho (Sociedad / Especialidad):</span>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('logoDer', MEDICINE_EMBLEM_ESCULAPIO_SVG)}
                      className="text-[10px] text-indigo-400 hover:underline"
                    >
                      Usar Emblema Esculapio
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-slate-600 overflow-hidden">
                      {formData.logoDer ? (
                        <img src={formData.logoDer} alt="Logo Derecho" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Sin logo</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => rightLogoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Logo Derecho</span>
                      </button>
                      <p className="text-[10px] text-slate-400">Logo de especialidad o sociedad médica</p>
                    </div>
                  </div>
                  <input
                    ref={rightLogoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'logoDer')}
                  />
                </div>

                {/* Marca de Agua */}
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">Marca de Agua Central de Fondo:</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-slate-600 overflow-hidden">
                      {formData.marcaAgua ? (
                        <img src={formData.marcaAgua} alt="Marca de Agua" className="w-full h-full object-contain opacity-60" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Sin marca</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => watermarkInputRef.current?.click()}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Marca de Agua</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-700">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                        <span>Opacidad:</span>
                        <span>{Math.round((formData.watermarkOpacity || 0.16) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.04"
                        max="0.45"
                        step="0.01"
                        value={formData.watermarkOpacity || 0.16}
                        onChange={(e) => handleFieldChange('watermarkOpacity', parseFloat(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                        <span>Tamaño / Escala:</span>
                        <span>{formData.watermarkScale || 55}%</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        step="5"
                        value={formData.watermarkScale || 55}
                        onChange={(e) => handleFieldChange('watermarkScale', parseInt(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>

                  <input
                    ref={watermarkInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'marcaAgua')}
                  />
                </div>

              </div>
            )}

            {/* TAB 3: FIRMA & SELLO */}
            {activeTab === 'firma-sello' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sello &amp; Firma Real Digitalizada</span>
                </h3>

                {/* Sello Oficial */}
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">Sello Médico Oficial:</span>
                    <button
                      type="button"
                      onClick={() => handleGenerateOfficialStamp('oval')}
                      className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Generar Sello Automático</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-24 h-16 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-slate-600 overflow-hidden shadow-xs">
                      {formData.selloImg ? (
                        <img src={formData.selloImg} alt="Sello Médico" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 text-center">Sin Sello</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => stampInputRef.current?.click()}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Foto de Sello</span>
                      </button>
                      <p className="text-[10px] text-slate-400">
                        {isCleaningImage ? 'Limpiando sombras...' : 'Limpia sombras y fondo oscuro automáticamente'}
                      </p>
                    </div>
                  </div>

                  {/* Stamp Presets */}
                  <div className="mt-3 pt-2 border-t border-slate-700 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400">Modelos rápidos:</span>
                    {(['oval', 'rectangular', 'circular', 'con-firma'] as DoctorStampStyle[]).map((shape) => (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => handleGenerateOfficialStamp(shape)}
                        className="px-2 py-0.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-medium transition-colors"
                      >
                        {shape === 'oval' ? 'Ovalado' : shape === 'rectangular' ? 'Rectangular' : shape === 'circular' ? 'Circular' : 'Con Firma'}
                      </button>
                    ))}
                  </div>

                  <input
                    ref={stampInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'selloImg')}
                  />
                </div>

                {/* Firma Real */}
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">Firma del Médico:</span>
                    <button
                      type="button"
                      onClick={() => handleGenerateSignature('ejecutiva-pluma')}
                      className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Generar Firma Caligráfica</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-24 h-16 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-slate-600 overflow-hidden shadow-xs">
                      {formData.firmaImg ? (
                        <img src={formData.firmaImg} alt="Firma Médica" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 text-center">Sin Firma</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => sigInputRef.current?.click()}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Foto de Firma</span>
                      </button>
                      <p className="text-[10px] text-slate-400">
                        Sube una foto de la firma sobre papel blanco
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-700 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400">Estilos:</span>
                    {(['ejecutiva-pluma', 'bucle-formal', 'rapida-recipista', 'autorizada-formal'] as CalligraphicStyle[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleGenerateSignature(st)}
                        className="px-2 py-0.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-medium transition-colors"
                      >
                        {st === 'ejecutiva-pluma' ? 'Ejecutiva' : st === 'bucle-formal' ? 'Bucle' : st === 'rapida-recipista' ? 'Rápida' : 'Formal'}
                      </button>
                    ))}
                  </div>

                  <input
                    ref={sigInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'firmaImg')}
                  />
                </div>

              </div>
            )}

            {/* TAB 4: RECETA & FOLIOS */}
            {activeTab === 'receta' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Folios, Títulos &amp; Avisos Legales</span>
                </h3>

                {/* Folio Control */}
                <div className="grid grid-cols-2 gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Prefijo de Folio Correlativo:
                    </label>
                    <input
                      type="text"
                      value={formData.folioPrefix || 'REC-'}
                      onChange={(e) => handleFieldChange('folioPrefix', e.target.value)}
                      placeholder="Ej: REC-, TRAUM-, MED-"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-xl text-xs font-mono font-bold text-amber-300 uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Número Correlativo Actual:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.folioNumber || 1}
                      onChange={(e) => handleFieldChange('folioNumber', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Rx Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título de Prescripción Médica:
                  </label>
                  <input
                    type="text"
                    value={formData.rxTitle || 'Rp.'}
                    onChange={(e) => handleFieldChange('rxTitle', e.target.value)}
                    placeholder="Ej: Rp., R/x, Tratamiento Médico, Prescripción"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Footer Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nota o Teléfono al Pie de Página:
                  </label>
                  <input
                    type="text"
                    value={formData.footerNotesText || ''}
                    onChange={(e) => handleFieldChange('footerNotesText', e.target.value)}
                    placeholder="Ej: Previa Cita: +58 414-1234567 · Instagram: @dr.leal"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Footer Legal Disclaimer */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Aviso Legal o Vigencia de Récipe:
                  </label>
                  <input
                    type="text"
                    value={formData.footerDisclaimer || 'Válido por 30 días a partir de su fecha de emisión.'}
                    onChange={(e) => handleFieldChange('footerDisclaimer', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Signature Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título bajo la Firma:
                  </label>
                  <input
                    type="text"
                    value={formData.signatureTitle || 'Firma y Sello del Médico Tratante'}
                    onChange={(e) => handleFieldChange('signatureTitle', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

              </div>
            )}

            {/* TAB 5: DATOS & CREDENCIALES */}
            {activeTab === 'datos' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  <span>Credenciales de Acceso &amp; Versión Asignada</span>
                </h3>

                {/* Subscription Version */}
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                  <label className="block text-xs font-bold text-slate-200">
                    Versión Ofrecida / Plan del Médico:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'basico', name: 'Versión Básica', desc: 'Récipes estándar (sin diseño)' },
                      { id: 'diseno-pro', name: 'Pro Diseño', desc: 'Acceso a Estudio de Diseño' },
                      { id: 'clinica-full', name: 'Full Clínica', desc: 'Récipes + Historias + Informes' },
                    ].map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => handleFieldChange('subscriptionPlan', plan.id)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          formData.subscriptionPlan === plan.id
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center gap-1">
                          {plan.id !== 'basico' && <Crown className="w-3 h-3 text-amber-400" />}
                          <span>{plan.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{plan.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Login Credentials */}
                <div className="grid grid-cols-2 gap-3 bg-indigo-950/30 p-3 rounded-2xl border border-indigo-500/30">
                  <div>
                    <label className="block text-xs font-bold text-indigo-200 mb-1">
                      Cédula (Usuario de Ingreso):
                    </label>
                    <input
                      type="text"
                      value={formData.ci || ''}
                      onChange={(e) => handleFieldChange('ci', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-indigo-200 mb-1">
                      Clave de Acceso Asignada:
                    </label>
                    <input
                      type="text"
                      value={formData.password || formData.ci || ''}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      placeholder="Igual a la cédula por defecto"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo:</label>
                    <input
                      type="text"
                      value={formData.doctorName || ''}
                      onChange={(e) => handleFieldChange('doctorName', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Especialidad:</label>
                      <input
                        type="text"
                        value={formData.specialty || ''}
                        onChange={(e) => handleFieldChange('specialty', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">M.P.P.S:</label>
                      <input
                        type="text"
                        value={formData.mpps || ''}
                        onChange={(e) => handleFieldChange('mpps', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Colegio de Médicos:</label>
                      <input
                        type="text"
                        value={formData.collegeNumber || ''}
                        onChange={(e) => handleFieldChange('collegeNumber', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono WhatsApp:</label>
                      <input
                        type="text"
                        value={formData.phone || ''}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Clínica / Institución:</label>
                    <input
                      type="text"
                      value={formData.institution || ''}
                      onChange={(e) => handleFieldChange('institution', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Column: Live 1:1 Recipe Visual Preview (6 cols) */}
          <div className="lg:col-span-6 p-4 md:p-6 bg-slate-950 flex flex-col items-center justify-start overflow-y-auto">
            <div className="w-full flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Vista Previa del Récipe en Vivo (1:1)</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Folio: {formData.folioPrefix || 'REC-'}{String(formData.folioNumber || 1).padStart(4, '0')}
              </span>
            </div>

            {/* The Actual Recipe Sheet Simulator */}
            <div 
              className="w-full max-w-[440px] rounded-xl shadow-2xl p-5 border relative overflow-hidden transition-all text-slate-900"
              style={{
                backgroundColor: formData.tonePapel || '#ffffff',
                borderColor: '#cbd5e1'
              }}
            >
              {/* Watermark in background */}
              {formData.marcaAgua && (
                <div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                  style={{ opacity: formData.watermarkOpacity || 0.16 }}
                >
                  <img 
                    src={formData.marcaAgua} 
                    alt="Watermark" 
                    className="object-contain"
                    style={{ width: `${formData.watermarkScale || 55}%`, maxHeight: '60%' }}
                  />
                </div>
              )}

              {/* Recipe Content Layer */}
              <div className="relative z-10 space-y-4">
                
                {/* Header Section */}
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: formData.primaryDocColor || '#1e3a8a' }}>
                  {/* Left Logo */}
                  {formData.headerLayout !== 'logo-der' && formData.headerLayout !== 'sin-logos' && (
                    <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                      <img src={formData.logoIzq || DIGITAL_MEDIC_OFFICIAL_LOGO_SVG} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}

                  {/* Doctor Info */}
                  <div className={`flex-1 px-3 ${formData.headerLayout === 'sin-logos' ? 'text-center' : 'text-left'}`}>
                    <h4 
                      className="font-black leading-tight"
                      style={{ 
                        color: formData.nombreColor || formData.primaryDocColor || '#1e3a8a',
                        fontSize: formData.nombreSize || '1.25rem',
                        fontFamily: formData.fuenteNombre || 'sans-serif'
                      }}
                    >
                      {formData.doctorName || 'Dr. Médico Especialista'}
                    </h4>
                    <p className="text-[11px] font-bold text-slate-700 leading-tight">
                      {formData.specialty || 'Especialista en Medicina'}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600 mt-0.5 flex-wrap">
                      <span>MPPS: {formData.mpps || '00.000'}</span>
                      <span>·</span>
                      <span>CI: {formData.ci || 'V-00.000.000'}</span>
                      {formData.collegeNumber && (
                        <>
                          <span>·</span>
                          <span>{formData.collegeNumber}</span>
                        </>
                      )}
                    </div>
                    {formData.institution && (
                      <p className="text-[9px] font-medium text-slate-500 mt-0.5">
                        🏥 {formData.institution}
                      </p>
                    )}
                  </div>

                  {/* Right Logo */}
                  {formData.headerLayout !== 'logo-izq' && formData.headerLayout !== 'sin-logos' && (
                    <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                      <img src={formData.logoDer || MEDICINE_EMBLEM_ESCULAPIO_SVG} alt="Logo Der" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Patient Bar Mock */}
                <div className="bg-slate-100/80 p-2 rounded-lg text-[10px] space-y-1 text-slate-700 border border-slate-200">
                  <div className="flex justify-between font-bold">
                    <span>Paciente: ___________________________</span>
                    <span>Fecha: 27/09/2026</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>C.I: _______________  Edad: ____</span>
                    <span className="font-mono font-bold text-indigo-700">
                      {formData.folioPrefix || 'REC-'}{String(formData.folioNumber || 1).padStart(4, '0')}
                    </span>
                  </div>
                </div>

                {/* Prescription Body Simulator */}
                <div className="py-2 min-h-[140px] space-y-2">
                  <span className="text-base font-black text-indigo-700 font-serif">
                    {formData.rxTitle || 'Rp.'}
                  </span>
                  <div className="text-[11px] text-slate-600 font-mono space-y-1.5 pt-1">
                    <p>1. Prescripción médica emitida en consulta oficial...</p>
                    <p>2. Dosis y posología personalizada...</p>
                    <p className="text-slate-400">--- [Espacio de prescripción del médico] ---</p>
                  </div>
                </div>

                {/* Footer & Signature Section */}
                <div className="pt-3 border-t border-slate-200 flex items-end justify-between">
                  <div className="text-[9px] text-slate-500 max-w-[200px] leading-tight space-y-0.5">
                    {formData.footerNotesText && (
                      <p className="font-semibold text-slate-700">{formData.footerNotesText}</p>
                    )}
                    <p>{formData.footerDisclaimer || 'Válido por 30 días.'}</p>
                  </div>

                  {/* Stamp & Signature Display */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="h-16 flex items-center justify-center gap-1">
                      {formData.firmaImg && (
                        <img src={formData.firmaImg} alt="Firma" className="max-h-14 max-w-[90px] object-contain" />
                      )}
                      {formData.selloImg && (
                        <img src={formData.selloImg} alt="Sello" className="max-h-14 max-w-[90px] object-contain" />
                      )}
                    </div>
                    <div className="w-32 border-t border-slate-400 pt-0.5 text-center">
                      <span className="text-[8px] font-bold text-slate-600 block">
                        {formData.signatureTitle || 'Firma y Sello Médico'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-[11px] text-slate-400 block">
                Al guardar, este diseño quedará activo y sincronizado en la nube para el médico.
              </span>
            </div>

          </div>

        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span>Médico: <strong className="text-white">{formData.doctorName}</strong> · C.I: <strong className="text-amber-300 font-mono">{formData.ci}</strong> · Clave: <strong className="text-emerald-300 font-mono">{formData.password || formData.ci}</strong></span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-bold text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md text-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Todo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
