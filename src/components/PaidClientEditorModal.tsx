import React, { useState, useRef } from 'react';
import { 
  X, 
  Save, 
  Upload, 
  Trash2, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Award, 
  FileText, 
  Camera, 
  Crown, 
  Hash, 
  CreditCard, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { DoctorConfig } from '../types';
import { 
  BASIC_MEDICAL_LOGOS, 
  BasicMedicalLogo,
  createDoctorStampSVG,
  DoctorStampStyle,
  getMedicalSymbolSVG
} from '../data/defaultAssets';

interface PaidClientEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorConfig;
  onSaveDoctor: (updatedDoctor: DoctorConfig) => void;
}

export const PaidClientEditorModal: React.FC<PaidClientEditorModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onSaveDoctor,
}) => {
  const [formData, setFormData] = useState<DoctorConfig>({
    ...doctor,
    showMedicalSymbols: doctor.showMedicalSymbols !== false,
    medicalSymbolType: doctor.medicalSymbolType || 'esculapio',
    medicalSymbolColor: doctor.medicalSymbolColor || doctor.primaryDocColor || '#2563eb',
    folioPrefix: doctor.folioPrefix || 'REC-',
    folioNumber: doctor.folioNumber || 1,
    isPaidClient: doctor.isPaidClient !== false,
    paidPlanName: doctor.paidPlanName || 'Plan Digital Medic Pro',
    paymentStatus: doctor.paymentStatus || 'activo',
  });

  const [activeTab, setActiveTab] = useState<'fotos' | 'simbolos' | 'folios' | 'datos'>('fotos');
  const [stampStyle, setStampStyle] = useState<DoctorStampStyle>('oval');
  const [stampColor, setStampColor] = useState('#1e3a8a');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const leftLogoInputRef = useRef<HTMLInputElement>(null);
  const rightLogoInputRef = useRef<HTMLInputElement>(null);
  const doctorPhotoInputRef = useRef<HTMLInputElement>(null);
  const customStampInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof DoctorConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoIzq' | 'logoDer' | 'doctorPhoto' | 'selloImg' | 'firmaImg'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') {
        handleFieldChange(field, evt.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegenerateStamp = () => {
    const newStamp = createDoctorStampSVG(
      formData.doctorName || 'Dr. Médico',
      formData.mpps || '00.000',
      formData.ci || 'V-00.000.000',
      stampColor,
      formData.specialty || 'MEDICINA GENERAL',
      stampStyle,
      formData.collegeNumber || ''
    );
    handleFieldChange('selloImg', newStamp);
    handleFieldChange('selloFirma', newStamp);
  };

  const handleSave = () => {
    onSaveDoctor(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  // Preview medical symbol
  const currentSymbolSvg = getMedicalSymbolSVG(
    formData.medicalSymbolType || 'esculapio',
    formData.medicalSymbolColor || formData.nombreColor || '#2563eb'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 md:p-6 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">Editor de Clientes Pagos &amp; Fotos</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  {formData.paidPlanName || 'Plan Pro'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestión directa de fotos, logos básicos, folios y credenciales para {formData.doctorName || 'Médico'}
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/50 px-6 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('fotos')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'fotos'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>1. Logos, Fotos &amp; Sello</span>
          </button>

          <button
            onClick={() => setActiveTab('simbolos')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'simbolos'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>2. Símbolos al lado del Nombre</span>
          </button>

          <button
            onClick={() => setActiveTab('folios')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'folios'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash className="w-4 h-4 text-emerald-400" />
            <span>3. Folios &amp; Facturación</span>
          </button>

          <button
            onClick={() => setActiveTab('datos')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'datos'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>4. Datos Profesionales</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: LOGOS, FOTOS & SELLO */}
          {activeTab === 'fotos' && (
            <div className="space-y-6">
              
              {/* Logos Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Logo Izquierdo */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-400" />
                      Logo Izquierdo
                    </span>
                    {formData.logoIzq && (
                      <button
                        onClick={() => handleFieldChange('logoIzq', '')}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Quitar
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-700 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-inner">
                      {formData.logoIzq ? (
                        <img src={formData.logoIzq} alt="Logo Izquierdo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 text-center font-medium">Sin Logo</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input
                        ref={leftLogoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'logoIzq')}
                        className="hidden"
                      />
                      <button
                        onClick={() => leftLogoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Foto / Logo</span>
                      </button>
                      <span className="text-[10px] text-slate-400 block">O seleccione un logo médico básico abajo</span>
                    </div>
                  </div>

                  {/* Basic Medical Logos Selector for Left Logo */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                      Elegir de Logos Básicos:
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                      {BASIC_MEDICAL_LOGOS.map((bLogo: BasicMedicalLogo) => (
                        <button
                          key={bLogo.id}
                          onClick={() => handleFieldChange('logoIzq', bLogo.svgDataUri)}
                          className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                            formData.logoIzq === bLogo.svgDataUri
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                          }`}
                          title={bLogo.name}
                        >
                          <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
                            <img src={bLogo.svgDataUri} alt={bLogo.name} className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[9px] text-slate-300 truncate w-full text-center">
                            {bLogo.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Logo Derecho */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      Logo Derecho
                    </span>
                    {formData.logoDer && (
                      <button
                        onClick={() => handleFieldChange('logoDer', '')}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Quitar
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-700 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-inner">
                      {formData.logoDer ? (
                        <img src={formData.logoDer} alt="Logo Derecho" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 text-center font-medium">Sin Logo</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input
                        ref={rightLogoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'logoDer')}
                        className="hidden"
                      />
                      <button
                        onClick={() => rightLogoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Foto / Logo</span>
                      </button>
                      <span className="text-[10px] text-slate-400 block">O seleccione un logo médico básico abajo</span>
                    </div>
                  </div>

                  {/* Basic Medical Logos Selector for Right Logo */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                      Elegir de Logos Básicos:
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                      {BASIC_MEDICAL_LOGOS.map((bLogo: BasicMedicalLogo) => (
                        <button
                          key={bLogo.id}
                          onClick={() => handleFieldChange('logoDer', bLogo.svgDataUri)}
                          className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                            formData.logoDer === bLogo.svgDataUri
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                          }`}
                          title={bLogo.name}
                        >
                          <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
                            <img src={bLogo.svgDataUri} alt={bLogo.name} className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[9px] text-slate-300 truncate w-full text-center">
                            {bLogo.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Avatar / Photo & Digital Stamp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Doctor Portrait Photo */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      Foto de Perfil del Médico
                    </span>
                    {formData.doctorPhoto && (
                      <button
                        onClick={() => handleFieldChange('doctorPhoto', '')}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Quitar
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                      {formData.doctorPhoto ? (
                        <img src={formData.doctorPhoto} alt="Doctor" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-slate-500" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <input
                        ref={doctorPhotoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'doctorPhoto')}
                        className="hidden"
                      />
                      <button
                        onClick={() => doctorPhotoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Foto del Médico</span>
                      </button>
                      <span className="text-[10px] text-slate-400 block">Fotografía para perfil y ficha del cliente</span>
                    </div>
                  </div>
                </div>

                {/* Sello y Firma Digital */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Sello Oficial &amp; Firma Autorizada
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="w-24 h-16 rounded-xl bg-white border border-slate-700 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-xs">
                      {formData.selloImg || formData.selloFirma ? (
                        <img 
                          src={formData.selloImg || formData.selloFirma} 
                          alt="Sello" 
                          className="w-full h-full object-contain" 
                        />
                      ) : (
                        <span className="text-[9px] text-slate-400 text-center font-medium">Sin Sello</span>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <select
                          value={stampStyle}
                          onChange={(e) => setStampStyle(e.target.value as DoctorStampStyle)}
                          className="bg-slate-800 border border-slate-700 rounded-lg text-xs py-1 px-2 text-white"
                        >
                          <option value="oval">Ovalado Clásico</option>
                          <option value="circular">Circular Médico</option>
                          <option value="rectangular">Rectangular</option>
                          <option value="con-firma">Con Firma Manuscrita</option>
                        </select>

                        <button
                          onClick={handleRegenerateStamp}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Generar sello con los datos actuales"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Generar</span>
                        </button>
                      </div>

                      <input
                        ref={customStampInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'selloImg')}
                        className="hidden"
                      />
                      <button
                        onClick={() => customStampInputRef.current?.click()}
                        className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3 text-slate-400" />
                        <span>O subir imagen de sello escaneado</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: DOS SÍMBOLOS AL LADO DEL NOMBRE */}
          {activeTab === 'simbolos' && (
            <div className="space-y-6">
              
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Dos Símbolos Básicos de la Medicina al lado del Nombre
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adorna y da distinción médica al nombre del profesional con dos símbolos simétricos en el récipe
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showMedicalSymbols !== false}
                      onChange={(e) => handleFieldChange('showMedicalSymbols', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-white">Activar Símbolos</span>
                  </label>
                </div>

                {/* Live Real-time Preview */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Vista Previa en el Récipe Médico:
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    {formData.showMedicalSymbols !== false && (
                      <img 
                        src={currentSymbolSvg} 
                        alt="Símbolo Izquierdo" 
                        className="w-5 h-5 object-contain" 
                      />
                    )}
                    <span 
                      className="font-bold text-lg tracking-tight"
                      style={{ color: formData.nombreColor || '#1e3a8a' }}
                    >
                      {formData.doctorName || 'Dr. Médico Especialista'}
                    </span>
                    {formData.showMedicalSymbols !== false && (
                      <img 
                        src={currentSymbolSvg} 
                        alt="Símbolo Derecho" 
                        className="w-5 h-5 object-contain" 
                      />
                    )}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {formData.specialty || 'Medicina General'}
                  </span>
                </div>

                {/* Symbol Type Selector */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                    Seleccione el Tipo de Símbolo Médico:
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'esculapio', name: 'Vara de Esculapio', desc: 'Símbolo oficial de la medicina (Serpiente y Vara)', preview: getMedicalSymbolSVG('esculapio', formData.medicalSymbolColor || '#2563eb') },
                      { id: 'cruz', name: 'Cruz Médica Clásica', desc: 'Cruz médica griega equilátera', preview: getMedicalSymbolSVG('cruz', formData.medicalSymbolColor || '#2563eb') },
                      { id: 'estetoscopio', name: 'Estetoscopio Clínico', desc: 'Símbolo clínico de auscultación', preview: getMedicalSymbolSVG('estetoscopio', formData.medicalSymbolColor || '#2563eb') },
                      { id: 'pulso', name: 'Pulso Cardíaco ECG', desc: 'Onda de ritmo y vida cardíaca', preview: getMedicalSymbolSVG('pulso', formData.medicalSymbolColor || '#2563eb') },
                      { id: 'caduceo', name: 'Caduceo de Hermes', desc: 'Doble serpiente entrelazada con alas', preview: getMedicalSymbolSVG('caduceo', formData.medicalSymbolColor || '#2563eb') },
                      { id: 'rx', name: 'Prescripción Rp', desc: 'Símbolo tradicional de prescripción', preview: getMedicalSymbolSVG('rx', formData.medicalSymbolColor || '#2563eb') },
                    ].map((sym) => {
                      const isSelected = (formData.medicalSymbolType || 'esculapio') === sym.id;
                      return (
                        <button
                          key={sym.id}
                          onClick={() => handleFieldChange('medicalSymbolType', sym.id)}
                          className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/30'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center p-1.5 shrink-0">
                            <img src={sym.preview} alt={sym.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{sym.name}</span>
                            <span className="text-[10px] text-slate-400 leading-tight block">{sym.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Symbol Color */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
                  <span className="text-xs font-semibold text-slate-300">
                    Color de los Símbolos:
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.medicalSymbolColor || '#2563eb'}
                      onChange={(e) => handleFieldChange('medicalSymbolColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <button
                      onClick={() => handleFieldChange('medicalSymbolColor', formData.nombreColor || '#1e3a8a')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Sincronizar con color del nombre
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: FOLIOS & FACTURACIÓN */}
          {activeTab === 'folios' && (
            <div className="space-y-6">
              
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-emerald-400" />
                  Correlativo y Folios de Recetas para Clientes Pagos
                </h3>
                <p className="text-xs text-slate-400">
                  Configure la numeración y prefijo de folios oficiales para las recetas de este cliente
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Prefijo de Folio (Ej. REC-, MED-, DRA-)
                    </label>
                    <input
                      type="text"
                      value={formData.folioPrefix || 'REC-'}
                      onChange={(e) => handleFieldChange('folioPrefix', e.target.value)}
                      placeholder="REC-"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Número Correlativo Actual / Inicial
                    </label>
                    <input
                      type="number"
                      value={formData.folioNumber || 1}
                      onChange={(e) => handleFieldChange('folioNumber', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Próximo folio a imprimir:</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {formData.folioPrefix || 'REC-'}{String(formData.folioNumber || 1).padStart(4, '0')}
                  </span>
                </div>
              </div>

              {/* Subscription Status */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Estado de Suscripción del Cliente Pago
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Nombre del Plan
                    </label>
                    <select
                      value={formData.paidPlanName || 'Plan Mensual Pro'}
                      onChange={(e) => {
                        const val = e.target.value;
                        const isEliteSelected = val.toLowerCase().includes('élite') || val.toLowerCase().includes('elite');
                        handleFieldChange('paidPlanName', val);
                        if (isEliteSelected) {
                          handleFieldChange('isElite', true);
                          handleFieldChange('isVip', true);
                          handleFieldChange('subscriptionPlan', 'elite');
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Plan Mensual Pro">Plan Mensual Pro ($10 USD)</option>
                      <option value="Plan Trimestral Pro">Plan Trimestral Pro ($28 USD)</option>
                      <option value="Plan Anual VIP">Plan Anual VIP ($95 USD)</option>
                      <option value="Plan Élite Autorizado">Plan Élite Autorizado (Administrador)</option>
                      <option value="Prueba Gratuita (14 Días)">Prueba Gratuita (14 Días)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Estado de Pago
                    </label>
                    <select
                      value={formData.paymentStatus || 'activo'}
                      onChange={(e) => handleFieldChange('paymentStatus', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="activo">✓ Pagado / Activo</option>
                      <option value="prueba">En Período de Prueba</option>
                      <option value="pendiente">Pendiente de Pago</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Vencimiento / Renovación
                    </label>
                    <input
                      type="date"
                      value={formData.paidUntilDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0,10)}
                      onChange={(e) => handleFieldChange('paidUntilDate', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: DATOS PROFESIONALES */}
          {activeTab === 'datos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nombre del Médico
                  </label>
                  <input
                    type="text"
                    value={formData.doctorName || ''}
                    onChange={(e) => handleFieldChange('doctorName', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Cédula de Identidad (Clave de Acceso)
                  </label>
                  <input
                    type="text"
                    value={formData.ci || ''}
                    onChange={(e) => handleFieldChange('ci', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Especialidad Médica
                  </label>
                  <input
                    type="text"
                    value={formData.specialty || ''}
                    onChange={(e) => handleFieldChange('specialty', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    M.P.P.S.
                  </label>
                  <input
                    type="text"
                    value={formData.mpps || ''}
                    onChange={(e) => handleFieldChange('mpps', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Colegio de Médicos
                  </label>
                  <input
                    type="text"
                    value={formData.collegeNumber || ''}
                    onChange={(e) => handleFieldChange('collegeNumber', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    R.I.F.
                  </label>
                  <input
                    type="text"
                    value={formData.rif || ''}
                    onChange={(e) => handleFieldChange('rif', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Institución / Clínica / Consultorio
                  </label>
                  <input
                    type="text"
                    value={formData.institution || ''}
                    onChange={(e) => handleFieldChange('institution', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Educación Médica Continua / Postgrados / Cursos
                  </label>
                  <input
                    type="text"
                    value={formData.educacionContinua || ''}
                    onChange={(e) => handleFieldChange('educacionContinua', e.target.value)}
                    placeholder="Ej: Diplomado en Dolor / Fellow Cuidados Intensivos"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Dirección o Detalles de Consulta
                  </label>
                  <input
                    type="text"
                    value={formData.institutionDetails || ''}
                    onChange={(e) => handleFieldChange('institutionDetails', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={saveSuccess}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>¡Cambios Guardados!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios del Cliente</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
