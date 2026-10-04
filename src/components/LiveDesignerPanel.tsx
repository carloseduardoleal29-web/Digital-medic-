import React, { useRef, useState } from 'react';
import { 
  Palette, 
  Type, 
  Upload, 
  Trash2, 
  PenTool, 
  RotateCcw, 
  Save, 
  Building2, 
  UserCheck, 
  Image as ImageIcon,
  Sliders,
  Check,
  Lock,
  Plus,
  Copy,
  Download,
  UploadCloud,
  Send,
  Sparkles,
  Layers,
  Square,
  Circle,
  FileText
} from 'lucide-react';
import { DoctorConfig } from '../types';
import { 
  CADUCEUS_SVG, 
  MEDICAL_SHIELD_SVG, 
  HOSPITAL_EMBLEM_SVG, 
  STETHOSCOPE_HEART_SVG,
  createDoctorStampSVG,
  DoctorStampStyle
} from '../data/defaultAssets';
import { removeDarkBackgroundAndEnhanceInk } from '../utils/imageCleanup';

interface LiveDesignerPanelProps {
  config: DoctorConfig;
  colleagueProfiles: DoctorConfig[];
  onSelectColleague: (profileId: string) => void;
  onAddNewColleague: () => void;
  onDuplicateColleague: () => void;
  onUpdateConfig: (updated: Partial<DoctorConfig>) => void;
  onSaveConfig: () => void;
  onResetDefaults: () => void;
  onOpenSignatureModal: () => void;
  onLockDesigner: () => void;
  onPassToDoctor?: () => void;
  onImportConfig?: (imported: DoctorConfig) => void;
  activePreviewDoc?: 'recipe' | 'recipe-4en1' | 'indicaciones' | 'reposo' | 'informes';
  onSelectPreviewDoc?: (doc: 'recipe' | 'recipe-4en1' | 'indicaciones' | 'reposo' | 'informes') => void;
}

export const LiveDesignerPanel: React.FC<LiveDesignerPanelProps> = ({
  config,
  colleagueProfiles,
  onSelectColleague,
  onAddNewColleague,
  onDuplicateColleague,
  onUpdateConfig,
  onSaveConfig,
  onResetDefaults,
  onOpenSignatureModal,
  onLockDesigner,
  onPassToDoctor,
  onImportConfig,
  activePreviewDoc = 'recipe',
  onSelectPreviewDoc,
}) => {
  const leftLogoInputRef = useRef<HTMLInputElement>(null);
  const rightLogoInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  const importJsonInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState<'colores' | 'letras' | 'recipes' | 'logos' | 'marcaAgua' | 'firma' | 'perfil'>('colores');
  const [saveToast, setSaveToast] = useState(false);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoIzq' | 'logoDer' | 'marcaAgua' | 'selloFirma' | 'selloImg' | 'firmaImg'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      if (typeof evt.target?.result === 'string') {
        let finalData = evt.target.result;
        // Clean dark/shadow background automatically for stamps and signatures
        if (field === 'selloImg' || field === 'firmaImg' || field === 'selloFirma') {
          finalData = await removeDarkBackgroundAndEnhanceInk(finalData, 215, true);
        }
        onUpdateConfig({ [field]: finalData });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCleanCurrentStamp = async () => {
    const current = config.selloImg || config.selloFirma;
    if (!current) return;
    const cleaned = await removeDarkBackgroundAndEnhanceInk(current, 205, true);
    onUpdateConfig({ selloImg: cleaned });
  };

  const handleApplyPresetStamp = (style: DoctorStampStyle) => {
    const cleanStampSvg = createDoctorStampSVG(
      config.doctorName || 'Dr. Médico Especialista',
      config.mpps || '00.000',
      config.ci || 'V-00.000.000',
      config.primaryDocColor || '#1e3a8a',
      config.specialty || 'MEDICINA GENERAL',
      style,
      config.collegeNumber || 'CMD: 00.000'
    );
    onUpdateConfig({ selloImg: cleanStampSvg });
  };

  const triggerSaveWithFeedback = () => {
    onSaveConfig();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-slate-800 flex flex-col">
      
      {/* Header bar: Studio Mastermind */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-tight">Estudio de Diseño (Editor Maestro)</h2>
            </div>
            <p className="text-[11px] text-slate-400">Personalice cada aspecto visual antes de pasarlo al médico</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLockDesigner}
            className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer border border-rose-400/40"
            title="Salir del Estudio de Diseño y bloquear el acceso (se requerirá el PIN para volver a ingresar)"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Salir del Estudio</span>
          </button>
        </div>
      </div>

      {/* Colleague Profile Selector & Actions */}
      <div className="p-3 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="font-black text-black shrink-0">Colega:</span>
          <select
            value={config.id}
            onChange={(e) => onSelectColleague(e.target.value)}
            className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-black font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
          >
            {colleagueProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.doctorName || p.profileName} — {p.specialty || 'Sin especialidad'}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onAddNewColleague}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 transition-colors shadow-2xs"
            title="Crear un nuevo colega desde cero"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo</span>
          </button>

          <button
            onClick={onDuplicateColleague}
            className="px-2 py-1 bg-white hover:bg-slate-100 text-black border border-slate-300 rounded-lg font-bold flex items-center gap-1 transition-colors"
            title="Duplicar este diseño para otro colega"
          >
            <Copy className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Duplicar</span>
          </button>
        </div>
      </div>

      {/* Document View Switcher (Récipe, Indicaciones, Reposo, Informes) */}
      {onSelectPreviewDoc && (
        <div className="p-2.5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] font-black text-white shrink-0">Ver en Pantalla:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => onSelectPreviewDoc('recipe')}
              className={`px-2 py-1 rounded-md text-[11px] font-black transition-colors whitespace-nowrap ${
                activePreviewDoc === 'recipe'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              📄 Récipe
            </button>
            <button
              type="button"
              onClick={() => onSelectPreviewDoc('recipe-4en1')}
              className={`px-2 py-1 rounded-md text-[11px] font-black transition-colors whitespace-nowrap ${
                activePreviewDoc === 'recipe-4en1'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              📦 Récipes
            </button>
            <button
              type="button"
              onClick={() => onSelectPreviewDoc('indicaciones')}
              className={`px-2 py-1 rounded-md text-[11px] font-black transition-colors whitespace-nowrap ${
                activePreviewDoc === 'indicaciones'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              📋 Indicaciones
            </button>
            <button
              type="button"
              onClick={() => onSelectPreviewDoc('reposo')}
              className={`px-2 py-1 rounded-md text-[11px] font-black transition-colors whitespace-nowrap ${
                activePreviewDoc === 'reposo'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              🛏️ Reposo
            </button>
            <button
              type="button"
              onClick={() => onSelectPreviewDoc('informes')}
              className={`px-2 py-1 rounded-md text-[11px] font-black transition-colors whitespace-nowrap ${
                activePreviewDoc === 'informes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              📑 Informe
            </button>
          </div>
        </div>
      )}

      {/* Prominent Call to Action: Pasar al Médico */}
      {onPassToDoctor && (
        <div className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-200 animate-spin" />
            <span className="text-xs font-black">¿Listo el diseño para su colega?</span>
          </div>
          <button
            onClick={() => {
              triggerSaveWithFeedback();
              onPassToDoctor();
            }}
            className="px-3.5 py-1 bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-black rounded-lg shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Guardar diseño y pasar a la pantalla del médico lista para prescribir"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pasar al Médico Ahora</span>
          </button>
        </div>
      )}

      {/* Studio Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-bold px-2 pt-2 bg-slate-50 gap-1">
        <button
          onClick={() => setActiveSection('colores')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'colores' ? 'border-indigo-600 text-black font-black bg-white rounded-t-lg shadow-2xs' : 'border-transparent text-slate-800 hover:text-black font-bold'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-indigo-600" />
          <span>1. Colores & Paletas PRO</span>
        </button>

        <button
          onClick={() => setActiveSection('letras')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'letras' ? 'border-indigo-600 text-black font-black bg-white rounded-t-lg shadow-2xs' : 'border-transparent text-slate-800 hover:text-black font-bold'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-blue-600" />
          <span>2. Letras & Tipografías</span>
        </button>

        <button
          onClick={() => setActiveSection('recipes')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'recipes' ? 'border-indigo-600 text-black font-black bg-white rounded-t-lg shadow-2xs' : 'border-transparent text-slate-800 hover:text-black font-bold'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>3. Récipes & Formatos</span>
        </button>

        <button
          onClick={() => setActiveSection('logos')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'logos' ? 'border-indigo-600 text-black font-black bg-white rounded-t-lg shadow-2xs' : 'border-transparent text-slate-800 hover:text-black font-bold'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-cyan-600" />
          <span>4. Logos & Layout</span>
        </button>

        <button
          onClick={() => setActiveSection('marcaAgua')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'marcaAgua' ? 'border-indigo-600 text-black font-black bg-white rounded-t-lg shadow-2xs' : 'border-transparent text-slate-800 hover:text-black font-bold'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>5. Marca de Agua</span>
        </button>

        <button
          onClick={() => setActiveSection('firma')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'firma' ? 'border-indigo-600 text-black font-black bg-white rounded-t-lg shadow-2xs' : 'border-transparent text-slate-800 hover:text-black font-bold'
          }`}
        >
          <PenTool className="w-3.5 h-3.5 text-rose-600" />
          <span>6. Firma & Sello</span>
        </button>

        <button
          onClick={() => setActiveSection('perfil')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'perfil' ? 'border-indigo-600 text-black font-black bg-white rounded-t-lg shadow-2xs' : 'border-transparent text-slate-800 hover:text-black font-bold'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>7. Datos Médico</span>
        </button>
      </div>

      {/* Tab Panels Body */}
      <div className="p-4 space-y-4 text-xs max-h-[580px] overflow-y-auto">
        
        {/* TAB 1: COLORES, PALETAS PRO & PAPEL */}
        {activeSection === 'colores' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>Colores, Paletas PRO & Hoja</span>
              </span>
              <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                👑 Plan PRO
              </span>
            </div>

            {/* Presets de Paletas de Colores PRO en 1 Clic */}
            <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 p-3.5 border-2 border-indigo-200/90 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  <span>Paletas de Colores PRO (1 Clic)</span>
                </span>
                <span className="text-[10px] font-bold bg-white text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                  8 Combinaciones
                </span>
              </div>
              <p className="text-[11px] text-black font-semibold leading-snug">
                Aplique al instante una combinación armónica de color primario, fondo y marco a todos sus formatos:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { id: 'clinico', name: 'Azul Clínico', primary: '#1e40af', bg: '#ffffff', border: 'solido' },
                  { id: 'quirurgico', name: 'Verde Quirúrgico', primary: '#059669', bg: '#f0fdf4', border: 'fino' },
                  { id: 'esmeralda', name: 'Teal Esmeralda', primary: '#0f766e', bg: '#f0fdfa', border: 'elegante' },
                  { id: 'imperial', name: 'Púrpura Médico', primary: '#7e22ce', bg: '#faf5ff', border: 'doble' },
                  { id: 'borgona', name: 'Borgoña / Vino', primary: '#881337', bg: '#fff1f2', border: 'doble' },
                  { id: 'grafito', name: 'Grafito Minimal', primary: '#334155', bg: '#f8fafc', border: 'guilloche' },
                  { id: 'zafiro', name: 'Azul Zafiro', primary: '#0369a1', bg: '#f0f9ff', border: 'solido' },
                  { id: 'ambar', name: 'Dorado Clínico', primary: '#b45309', bg: '#fffbeb', border: 'elegante' },
                ].map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => {
                      onUpdateConfig({
                        primaryDocColor: pal.primary,
                        tonePapel: pal.bg,
                        borderStyle: pal.border as any,
                        headerColor: pal.primary,
                        nombreColor: pal.primary,
                        medicalSymbolColor: pal.primary,
                        colorPalettePreset: pal.id,
                      });
                    }}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      config.primaryDocColor?.toLowerCase() === pal.primary.toLowerCase()
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-white shadow-xs font-black'
                        : 'border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[11px] text-black truncate mr-1 font-bold">{pal.name}</span>
                    <span
                      className="w-4 h-4 rounded-full border shadow-2xs shrink-0"
                      style={{ backgroundColor: pal.primary }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Presets de Tono de Papel */}
            {/* Texturas de Papel Médico */}
            <div>
              <label className="block text-black font-bold mb-1.5 flex items-center justify-between">
                <span>Textura de Seguridad del Papel:</span>
                <span className="text-[10px] text-blue-900 bg-blue-100 px-2 py-0.5 rounded font-bold">Anti-Falsificación</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'lisa', label: 'Liso Clínico Puro', desc: 'Blanco uniforme nítido' },
                  { id: 'verjurado', label: 'Papel Verjurado', desc: 'Finas líneas horizontales' },
                  { id: 'seguridad', label: 'Micro-trama Seguridad', desc: 'Puntos anti-copia' },
                  { id: 'lino', label: 'Lino Texturizado', desc: 'Trama cruzada fina' },
                  { id: 'milimetrado', label: 'Cuadrícula Fina', desc: 'Guía milimétrica sutil' },
                  { id: 'filigrana', label: 'Filigrana Suave', desc: 'Sombreado perimetral' },
                ].map((tex) => (
                  <button
                    key={tex.id}
                    type="button"
                    onClick={() => onUpdateConfig({ paperTexture: tex.id as any })}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      (config.paperTexture || 'lisa') === tex.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className={`block font-bold text-[11px] ${(config.paperTexture || 'lisa') === tex.id ? 'text-blue-950 font-black' : 'text-black'}`}>
                      {tex.label}
                    </span>
                    <span className="text-[10px] text-black font-medium block truncate">{tex.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tonos de Fondo del Papel */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-black font-bold text-xs">
                  Color / Tono de Fondo de la Hoja:
                </label>
                <span className="text-[10px] text-black font-bold font-mono">
                  Actual: <strong className="text-blue-900">{config.tonePapel || '#ffffff'}</strong>
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Blanco Puro', val: '#ffffff', border: '#e2e8f0' },
                  { label: 'Blanco Hueso / Perla', val: '#f8fafc', border: '#cbd5e1' },
                  { label: 'Marfil Clínico', val: '#fefcf6', border: '#fef08a' },
                  { label: 'Crema Cálido', val: '#fef3c7', border: '#fde68a' },
                  { label: 'Pergamino Receta', val: '#f5ebe0', border: '#e6ccb2' },
                  { label: 'Celeste Suave', val: '#e0f2fe', border: '#bae6fd' },
                  { label: 'Azul Glaciar', val: '#dbeafe', border: '#bfdbfe' },
                  { label: 'Verde Menta', val: '#dcfce7', border: '#bbf7d0' },
                  { label: 'Rosa Cuarzo', val: '#ffe4e6', border: '#fecdd3' },
                  { label: 'Lavanda Clínico', val: '#f3e8ff', border: '#e9d5ff' },
                  { label: 'Gris Papel Prensa', val: '#f1f5f9', border: '#cbd5e1' },
                  { label: 'Amarillo Recetario', val: '#fef9c3', border: '#fef08a' },
                ].map((t) => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => onUpdateConfig({ tonePapel: t.val })}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                      (config.tonePapel || '#ffffff').toLowerCase() === t.val.toLowerCase()
                        ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-xs font-black text-black bg-white'
                        : 'border-slate-300 bg-white hover:bg-slate-100 hover:border-slate-400'
                    }`}
                  >
                    <span className="truncate mr-1 text-[11px] text-black font-bold">{t.label}</span>
                    <span 
                      className="w-5 h-5 rounded-md border shadow-xs shrink-0" 
                      style={{ 
                        backgroundColor: t.val,
                        borderColor: t.border || '#cbd5e1'
                      }}
                      title={t.val}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Color de Fondo Libre (Color Picker + Hex) */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-black block text-xs">Color de Fondo Libre de la Hoja:</span>
                <span className="text-[11px] text-black font-medium">Cualquier tono exacto que su colega solicite</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.tonePapel.startsWith('#') ? config.tonePapel : '#ffffff'}
                  onChange={(e) => onUpdateConfig({ tonePapel: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={config.tonePapel}
                  onChange={(e) => onUpdateConfig({ tonePapel: e.target.value })}
                  className="w-20 px-2 py-1 border border-slate-300 rounded font-mono text-xs text-black font-bold uppercase bg-white"
                />
              </div>
            </div>

            {/* Estilo de Bordes y Esquinas del Documento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-black font-bold text-xs">Marco y Borde de la Hoja:</label>
                  <button
                    type="button"
                    onClick={() => onUpdateConfig({ borderStyle: config.borderStyle === 'ninguno' ? 'solido' : 'ninguno' })}
                    className="text-[10px] text-blue-800 hover:text-blue-950 font-bold"
                  >
                    {config.borderStyle === 'ninguno' ? '+ Poner Borde' : '✕ Quitar Borde'}
                  </button>
                </div>
                <select
                  value={config.borderStyle || 'solido'}
                  onChange={(e) => onUpdateConfig({ borderStyle: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-black font-bold text-xs"
                >
                  <option value="ninguno">Sin Borde (A Sangre / Hoja Libre)</option>
                  <option value="fino">Borde Fino Discreto (1px)</option>
                  <option value="solido">Borde Sólido (2px Clásico)</option>
                  <option value="doble">Borde Doble Elegante (4px)</option>
                  <option value="elegante">Doble Filete Médico (3px)</option>
                  <option value="guilloche">Marco Guilloché Seguridad</option>
                  <option value="marco-clinico">Marco Clínico con Relieve</option>
                  <option value="ornamentado">Marco con Pespunte</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
                <label className="block text-black font-bold mb-1 text-xs">Esquinas del Documento:</label>
                <select
                  value={config.docCornerRadius || '16px'}
                  onChange={(e) => onUpdateConfig({ docCornerRadius: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-black font-bold text-xs"
                >
                  <option value="0px">Rectas Clásicas (0px - Estándar Papel)</option>
                  <option value="4px">Sutiles (4px)</option>
                  <option value="8px">Levemente Redondeadas (8px)</option>
                  <option value="16px">Redondeadas Modernas (16px)</option>
                </select>
              </div>
            </div>

            {/* Color Primario de Líneas y Encabezados */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between">
              <div>
                <label className="block text-black font-bold">Color Primario de Acentos y Líneas:</label>
                <span className="text-[11px] text-black font-medium">Color usado para divisores, bordes y el símbolo Rp.</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.primaryDocColor}
                  onChange={(e) => onUpdateConfig({ primaryDocColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                />
                <span className="font-mono text-xs text-black font-black">{config.primaryDocColor}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LOGOS Y DISPOSICIÓN ("SOLO TEXTO" / LOGOS A GUSTO) */}
        {activeSection === 'logos' && (
          <div className="space-y-4">
            <span className="font-black text-black uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>Disposición de Membrete y Logos</span>
            </span>

            {/* Modo de Membrete: ¡Solo Texto o con Logos! */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
              <label className="block text-black font-black mb-2">
                Modo de Cabecera / Disposición de Logos:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ambos-logos', label: 'Ambos Logos (Izq & Der)' },
                  { id: 'solo-logo-izq', label: 'Solo Logo Izquierdo' },
                  { id: 'solo-logo-der', label: 'Solo Logo Derecho' },
                  { id: 'solo-texto', label: 'Solo Texto (Sin Logos)' },
                ].map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => onUpdateConfig({ headerLayout: mod.id as any })}
                    className={`p-2 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                      (config.headerLayout || 'ambos-logos') === mod.id
                        ? 'border-blue-600 bg-blue-600 text-white shadow-2xs font-black'
                        : 'border-slate-300 bg-white text-black hover:bg-slate-50'
                    }`}
                  >
                    {mod.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-black font-semibold mt-2 italic">
                * Seleccione "Solo Texto" si el médico desea un récipe tipográfico limpio sin logotipos.
              </p>
            </div>

            {/* Ajustes de forma y tamaño de logos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-xl">
              <div>
                <label className="block text-black font-bold mb-1">
                  Tamaño de Logos: <span className="text-blue-900 font-mono font-black">{config.logoSize}px</span>
                </label>
                <input
                  type="range"
                  min="32"
                  max="90"
                  value={config.logoSize}
                  onChange={(e) => onUpdateConfig({ logoSize: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-black font-bold mb-1">Forma del Contorno:</label>
                <select
                  value={config.formaLogo}
                  onChange={(e) => onUpdateConfig({ formaLogo: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-black font-bold"
                >
                  <option value="logo-redondo">Circular Redondeado</option>
                  <option value="logo-cuadrado">Cuadrado con Esquinas</option>
                </select>
              </div>
            </div>

            {/* Subir / Cambiar Logo Izquierdo */}
            <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-black">Logo Izquierdo:</span>
                {config.logoIzq && (
                  <button
                    onClick={() => onUpdateConfig({ logoIzq: '' })}
                    className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Quitar
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {config.logoIzq ? (
                  <img 
                    src={config.logoIzq} 
                    alt="Logo Izq" 
                    className="w-12 h-12 object-contain rounded-lg border border-slate-300 p-0.5 bg-slate-50 shrink-0" 
                  />
                ) : (
                  <div className="w-12 h-12 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-black font-bold shrink-0">
                    Sin logo
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <input
                    ref={leftLogoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logoIzq')}
                    className="hidden"
                  />
                  <button
                    onClick={() => leftLogoInputRef.current?.click()}
                    className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300 rounded-lg flex items-center justify-center gap-1.5 font-black transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" /> Subir Logo Personalizado
                  </button>

                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className="text-black font-bold self-center">Presets:</span>
                    <button
                      onClick={() => onUpdateConfig({ logoIzq: CADUCEUS_SVG })}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-black font-bold border border-slate-300"
                    >
                      Caduceo
                    </button>
                    <button
                      onClick={() => onUpdateConfig({ logoIzq: MEDICAL_SHIELD_SVG })}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-black font-bold border border-slate-300"
                    >
                      Cruz
                    </button>
                    <button
                      onClick={() => onUpdateConfig({ logoIzq: HOSPITAL_EMBLEM_SVG })}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-black font-bold border border-slate-300"
                    >
                      Clínica
                    </button>
                    <button
                      onClick={() => onUpdateConfig({ logoIzq: STETHOSCOPE_HEART_SVG })}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-black font-bold border border-slate-300"
                    >
                      Corazón
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subir / Cambiar Logo Derecho */}
            <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-black">Logo Derecho:</span>
                {config.logoDer && (
                  <button
                    onClick={() => onUpdateConfig({ logoDer: '' })}
                    className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Quitar
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {config.logoDer ? (
                  <img 
                    src={config.logoDer} 
                    alt="Logo Der" 
                    className="w-12 h-12 object-contain rounded-lg border border-slate-300 p-0.5 bg-slate-50 shrink-0" 
                  />
                ) : (
                  <div className="w-12 h-12 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-black font-bold shrink-0">
                    Sin logo
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <input
                    ref={rightLogoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logoDer')}
                    className="hidden"
                  />
                  <button
                    onClick={() => rightLogoInputRef.current?.click()}
                    className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300 rounded-lg flex items-center justify-center gap-1.5 font-black transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" /> Subir Logo Personalizado
                  </button>

                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className="text-black font-bold self-center">Presets:</span>
                    <button
                      onClick={() => onUpdateConfig({ logoDer: MEDICAL_SHIELD_SVG })}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-black font-bold border border-slate-300"
                    >
                      Cruz
                    </button>
                    <button
                      onClick={() => onUpdateConfig({ logoDer: CADUCEUS_SVG })}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-black font-bold border border-slate-300"
                    >
                      Caduceo
                    </button>
                    <button
                      onClick={() => onUpdateConfig({ logoDer: HOSPITAL_EMBLEM_SVG })}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-black font-bold border border-slate-300"
                    >
                      Clínica
                    </button>
                    <button
                      onClick={() => onUpdateConfig({ logoDer: STETHOSCOPE_HEART_SVG })}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-black font-bold border border-slate-300"
                    >
                      Corazón
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MARCA DE AGUA CENTRAL (FOTO UNA VEZ) */}
        {activeSection === 'marcaAgua' && (
          <div className="space-y-4">
            <span className="font-black text-black uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Marca de Agua Central (Foto del Consultorio o Sello)</span>
            </span>

            {/* Subir Foto Central de una vez */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-black text-black block">Foto / Imagen de Marca de Agua:</span>
                  <span className="text-[11px] text-black font-medium">Suba cualquier imagen central (foto de clínica, escudo, caduceo o sello)</span>
                </div>
                {config.marcaAgua && (
                  <button
                    onClick={() => onUpdateConfig({ marcaAgua: '' })}
                    className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Quitar
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                {config.marcaAgua ? (
                  <div className="w-16 h-16 rounded-xl border border-blue-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    <img
                      src={config.marcaAgua}
                      alt="Marca de Agua"
                      className="w-full h-full object-contain"
                      style={{ opacity: Math.max(0.3, config.watermarkOpacity) }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-blue-300 bg-white flex items-center justify-center text-[10px] text-black font-bold shrink-0">
                    Sin foto
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <input
                    ref={watermarkInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'marcaAgua')}
                    className="hidden"
                  />
                  <button
                    onClick={() => watermarkInputRef.current?.click()}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> Subir Foto de una vez (Central)
                  </button>

                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="text-black font-bold self-center">Presets:</span>
                    <button
                      onClick={() => onUpdateConfig({ marcaAgua: CADUCEUS_SVG })}
                      className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-black font-bold"
                    >
                      Caduceo
                    </button>
                    <button
                      onClick={() => onUpdateConfig({ marcaAgua: MEDICAL_SHIELD_SVG })}
                      className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-black font-bold"
                    >
                      Escudo Cruz
                    </button>
                    <button
                      onClick={() => onUpdateConfig({ marcaAgua: HOSPITAL_EMBLEM_SVG })}
                      className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-black font-bold"
                    >
                      Clínica
                    </button>
                    <button
                      onClick={() => onUpdateConfig({ marcaAgua: STETHOSCOPE_HEART_SVG })}
                      className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-black font-bold"
                    >
                      Estetoscopio
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sliders de Opacidad, Escala y Rotación de la marca de agua */}
            <div className="space-y-3 p-3 bg-slate-50 border border-slate-300 rounded-xl">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <label className="text-black font-black block">Claridad / Trasfondo de Marca de Agua:</label>
                    <span className="text-[10px] text-black font-medium">Debe ser tenue para que no tape las letras del récipe</span>
                  </div>
                  <span className="text-blue-900 font-mono font-black text-sm">{Math.round((config.watermarkOpacity || 0.05) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.25"
                  step="0.005"
                  value={config.watermarkOpacity || 0.05}
                  onChange={(e) => onUpdateConfig({ watermarkOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />

                {/* 1-Click Opacity Presets for Doctor */}
                <div className="flex flex-wrap gap-1.5 mt-2 text-[10px]">
                  <span className="text-black font-bold self-center">Ajustes Rápidos de Claridad:</span>
                  {[
                    { label: '✦ Ecléctica / Casi Invisible (1.5%)', val: 0.015 },
                    { label: '✦ Ultra Clara (3%)', val: 0.03 },
                    { label: '⭐ Tenue Fondo Ideal (5%)', val: 0.05 },
                    { label: '✦ Suave Clásica (8%)', val: 0.08 },
                    { label: '✦ Visible (12%)', val: 0.12 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => onUpdateConfig({ watermarkOpacity: p.val })}
                      className={`px-2 py-0.5 rounded-lg border transition-all cursor-pointer font-bold ${
                        Math.abs((config.watermarkOpacity || 0.05) - p.val) < 0.012
                          ? 'bg-blue-600 text-white border-blue-600 font-black shadow-2xs'
                          : 'bg-white text-black hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-black font-black">Tamaño / Escala Central:</label>
                  <span className="text-blue-900 font-mono font-black">{config.watermarkScale || 55}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="110"
                  step="5"
                  value={config.watermarkScale || 55}
                  onChange={(e) => onUpdateConfig({ watermarkScale: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-black font-black">Ángulo de Inclinación:</label>
                  <span className="text-blue-900 font-mono font-black">{config.watermarkRotation || 0}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="5"
                  value={config.watermarkRotation || 0}
                  onChange={(e) => onUpdateConfig({ watermarkRotation: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LETRAS & TIPOGRAFÍAS */}
        {activeSection === 'letras' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-4 h-4 text-blue-600" />
                <span>Tipografías, Fuentes & Tamaños de Letra</span>
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-950 px-2 py-0.5 rounded font-black border border-blue-300">
                Personalización Total
              </span>
            </div>

            {/* Tipografía Global del Cuerpo de Récipe y Prescripción */}
            <div className="p-3.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-300 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-black text-xs flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-indigo-600" />
                  <span>Fuente Global del Cuerpo del Récipe & Medicamentos:</span>
                </span>
                <span className="text-[10px] font-mono font-black text-blue-950 bg-white px-2 py-0.5 rounded border border-blue-300">
                  {config.rxBodyFontFamily || 'Roboto'}
                </span>
              </div>
              <p className="text-[11px] text-black font-semibold leading-snug">
                Seleccione el estilo de letra para el texto de fármacos, dosis, indicaciones y notas clínicas:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-black block mb-0.5 font-black">Familia Tipográfica:</label>
                  <select
                    value={config.rxBodyFontFamily || "'Roboto', sans-serif"}
                    onChange={(e) => onUpdateConfig({ rxBodyFontFamily: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-black font-bold"
                  >
                    <option value="'Roboto', sans-serif">Roboto (Sans Moderna y Limpia)</option>
                    <option value="'Montserrat', sans-serif">Montserrat (Geométrica Elegante)</option>
                    <option value="'Playfair Display', serif">Playfair Display (Serif Formal Médica)</option>
                    <option value="'Merriweather', serif">Merriweather (Clásica de Alta Legibilidad)</option>
                    <option value="'Cinzel', serif">Cinzel (Distinguida / Solemne)</option>
                    <option value="'Lora', serif">Lora (Editorial Refinada)</option>
                    <option value="'Poppins', sans-serif">Poppins (Amigable y Clara)</option>
                    <option value="'Courier Prime', monospace">Courier Prime (Tipo Máquina Médica)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black block mb-0.5 font-black">Tamaño de Letra del Cuerpo:</label>
                  <select
                    value={config.bodyFontSize || '13.5px'}
                    onChange={(e) => onUpdateConfig({ bodyFontSize: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-black font-bold"
                  >
                    <option value="11.5px">Pequeña (11.5px - Más contenido)</option>
                    <option value="12.5px">Normal (12.5px)</option>
                    <option value="13.5px">Estándar Médica (13.5px - Recomendada)</option>
                    <option value="15px">Destacada (15px)</option>
                    <option value="16.5px">Grande (16.5px - Fácil Lectura)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Línea 1: Institución / Clínica */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-black text-xs">Línea 1: Institución / Clínica / Hospital</span>
                <span className="text-[10px] text-black font-bold">Superior</span>
              </div>
              <input
                type="text"
                value={config.institution}
                onChange={(e) => onUpdateConfig({ institution: e.target.value })}
                placeholder="Ej: Centro Médico Quirúrgico / Clínica El Ávila..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none text-xs bg-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Fuente Tipográfica:</label>
                  <select
                    value={config.fuenteInstitution || config.fuenteHeader}
                    onChange={(e) => onUpdateConfig({ fuenteInstitution: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="'Roboto', sans-serif">Roboto (Sans)</option>
                    <option value="'Montserrat', sans-serif">Montserrat (Moderna)</option>
                    <option value="'Playfair Display', serif">Playfair Display (Serif)</option>
                    <option value="'Merriweather', serif">Merriweather (Clásica)</option>
                    <option value="'Cinzel', serif">Cinzel (Formal)</option>
                    <option value="'Lora', serif">Lora (Elegante)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Tamaño de letra:</label>
                  <select
                    value={config.institutionSize || '12px'}
                    onChange={(e) => onUpdateConfig({ institutionSize: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="9px">Muy Pequeña (9px)</option>
                    <option value="10px">Pequeña (10px)</option>
                    <option value="11px">Normal (11px)</option>
                    <option value="12px">Mediana (12px Estándar)</option>
                    <option value="14px">Destacada (14px)</option>
                    <option value="16px">Grande (16px)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Color:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.institutionColor || config.headerColor}
                      onChange={(e) => onUpdateConfig({ institutionColor: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <span className="font-mono text-[10px] text-black font-bold truncate">{config.institutionColor || config.headerColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Línea 2: Nombre del Médico */}
            <div className="p-3 bg-blue-50/70 border border-blue-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-black text-xs">Línea 2: Nombre del Médico / Profesional</span>
                <span className="text-[10px] text-blue-950 font-black">Principal</span>
              </div>
              <input
                type="text"
                value={config.doctorName}
                onChange={(e) => onUpdateConfig({ doctorName: e.target.value })}
                placeholder="Dr. / Dra. Nombre del Médico"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-black font-black focus:ring-2 focus:ring-blue-500 outline-none text-xs bg-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Fuente Tipográfica:</label>
                  <select
                    value={config.fuenteNombre}
                    onChange={(e) => onUpdateConfig({ fuenteNombre: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="'Roboto', sans-serif">Roboto</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                    <option value="'Merriweather', serif">Merriweather</option>
                    <option value="'Cinzel', serif">Cinzel</option>
                    <option value="'Lora', serif">Lora</option>
                    <option value="'Dancing Script', cursive">Dancing Script</option>
                    <option value="'Great Vibes', cursive">Great Vibes</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Tamaño de letra:</label>
                  <select
                    value={config.nombreSize}
                    onChange={(e) => onUpdateConfig({ nombreSize: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="1.05rem">Pequeño (1.05rem)</option>
                    <option value="1.2rem">Normal (1.2rem)</option>
                    <option value="1.35rem">Grande (1.35rem Estándar)</option>
                    <option value="1.55rem">Muy Grande (1.55rem)</option>
                    <option value="1.8rem">Gigante (1.8rem)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Color:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.nombreColor}
                      onChange={(e) => onUpdateConfig({ nombreColor: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <span className="font-mono text-[10px] text-black font-bold truncate">{config.nombreColor}</span>
                  </div>
                </div>
              </div>

              {/* Ajuste de escala en vistas múltiples / compactas */}
              <div className="pt-2 border-t border-blue-200 mt-2">
                <label className="text-[10px] font-black text-black block mb-1">
                  📐 Escala de Encabezado en Formatos Compactos (Evita solapamientos): <span className="font-mono text-blue-900 font-black">{Math.round((config.headerScaleCompact ?? 0.78) * 100)}%</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.6"
                    max="1.0"
                    step="0.02"
                    value={config.headerScaleCompact ?? 0.78}
                    onChange={(e) => onUpdateConfig({ headerScaleCompact: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-black font-bold shrink-0">60% - 100%</span>
                </div>
              </div>

              {/* Controles de 2 símbolos médicos al lado del nombre */}
              <div className="pt-2 border-t border-blue-200 mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-black text-black">
                    <input
                      type="checkbox"
                      checked={config.showMedicalSymbols !== false}
                      onChange={(e) => onUpdateConfig({ showMedicalSymbols: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span>Mostrar 2 símbolos de la medicina al lado del nombre</span>
                  </label>
                  <span className="text-[10px] text-blue-950 bg-blue-100 px-1.5 py-0.5 rounded font-black border border-blue-300">
                    ⚕️ Distinción médica
                  </span>
                </div>

                {config.showMedicalSymbols !== false && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-black font-bold block mb-0.5">Tipo de Símbolo Médico:</label>
                      <select
                        value={config.medicalSymbolType || 'esculapio'}
                        onChange={(e) => onUpdateConfig({ medicalSymbolType: e.target.value as any })}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                      >
                        <option value="esculapio">⚕️ Vara de Esculapio (Oficial)</option>
                        <option value="cruz">✚ Cruz Médica Clásica</option>
                        <option value="estetoscopio">🩺 Estetoscopio Clínico</option>
                        <option value="pulso">⚡ Pulso Cardíaco ECG</option>
                        <option value="caduceo">⚚ Caduceo de Hermes</option>
                        <option value="rx">℞ Prescripción Rp</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-black font-bold block mb-0.5">Color del Símbolo:</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={config.medicalSymbolColor || config.nombreColor || '#2563eb'}
                          onChange={(e) => onUpdateConfig({ medicalSymbolColor: e.target.value })}
                          className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                        />
                        <button
                          type="button"
                          onClick={() => onUpdateConfig({ medicalSymbolColor: config.nombreColor })}
                          className="text-[10px] text-blue-900 font-bold hover:underline"
                        >
                          Igualar al nombre
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Línea 3: Especialidad Médica */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-black text-xs">Línea 3: Especialidad Médica</span>
                <span className="text-[10px] text-black font-bold">Sub-encabezado</span>
              </div>
              <input
                type="text"
                value={config.specialty}
                onChange={(e) => onUpdateConfig({ specialty: e.target.value })}
                placeholder="Ej: Médico Cirujano / Pediatra / Traumatólogo"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none text-xs bg-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Fuente Tipográfica:</label>
                  <select
                    value={config.fuenteSpecialty || config.fuenteHeader}
                    onChange={(e) => onUpdateConfig({ fuenteSpecialty: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="'Roboto', sans-serif">Roboto</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                    <option value="'Merriweather', serif">Merriweather</option>
                    <option value="'Cinzel', serif">Cinzel</option>
                    <option value="'Lora', serif">Lora</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Tamaño de letra:</label>
                  <select
                    value={config.specialtySize || '12px'}
                    onChange={(e) => onUpdateConfig({ specialtySize: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="9px">Muy Pequeña (9px)</option>
                    <option value="10.5px">Pequeña (10.5px)</option>
                    <option value="12px">Mediana (12px Estándar)</option>
                    <option value="13.5px">Destacada (13.5px)</option>
                    <option value="15px">Grande (15px)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Color:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.specialtyColor || config.headerColor}
                      onChange={(e) => onUpdateConfig({ specialtyColor: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <span className="font-mono text-[10px] text-black font-bold truncate">{config.specialtyColor || config.headerColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Línea 4: Credenciales Legales (MPPS, C.I., Colegio) */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-black text-xs">Línea 4: Credenciales Legales (MPPS · C.I. · Colegio)</span>
                <span className="text-[10px] text-black font-bold">Identificación</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={config.mpps}
                  onChange={(e) => onUpdateConfig({ mpps: e.target.value })}
                  placeholder="MPPS"
                  className="px-2 py-1 border border-slate-300 rounded text-xs text-black font-bold bg-white"
                  title="MPPS"
                />
                <input
                  type="text"
                  value={config.ci}
                  onChange={(e) => onUpdateConfig({ ci: e.target.value })}
                  placeholder="C.I."
                  className="px-2 py-1 border border-slate-300 rounded text-xs text-black font-bold bg-white"
                  title="Cédula"
                />
                <input
                  type="text"
                  value={config.collegeNumber}
                  onChange={(e) => onUpdateConfig({ collegeNumber: e.target.value })}
                  placeholder="CMD"
                  className="px-2 py-1 border border-slate-300 rounded text-xs text-black font-bold bg-white"
                  title="Colegio Médico"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Fuente:</label>
                  <select
                    value={config.fuenteCredentials || config.fuenteHeader}
                    onChange={(e) => onUpdateConfig({ fuenteCredentials: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="'Roboto', sans-serif">Roboto</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                    <option value="'Merriweather', serif">Merriweather</option>
                    <option value="'Cinzel', serif">Cinzel</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Tamaño de letra:</label>
                  <select
                    value={config.credentialsSize || '11px'}
                    onChange={(e) => onUpdateConfig({ credentialsSize: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="8.5px">Mini (8.5px)</option>
                    <option value="9.5px">Pequeña (9.5px)</option>
                    <option value="11px">Normal (11px Estándar)</option>
                    <option value="12px">Mediana (12px)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Color:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.credentialsColor || '#475569'}
                      onChange={(e) => onUpdateConfig({ credentialsColor: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <span className="font-mono text-[10px] text-black font-bold truncate">{config.credentialsColor || '#475569'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Línea 5: Dirección, Piso o Horarios */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-black text-xs">Línea 5: Dirección / Consultorio / Horario</span>
                <span className="text-[10px] text-black font-bold">Subtexto</span>
              </div>
              <input
                type="text"
                value={config.institutionDetails}
                onChange={(e) => onUpdateConfig({ institutionDetails: e.target.value })}
                placeholder="Ej: Torre B, Piso 4, Consultorio 402 · Citas: (0212) 123-4567"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none text-xs bg-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Fuente:</label>
                  <select
                    value={config.fuenteDetails || config.fuenteHeader}
                    onChange={(e) => onUpdateConfig({ fuenteDetails: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="'Roboto', sans-serif">Roboto</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                    <option value="'Merriweather', serif">Merriweather</option>
                    <option value="'Lora', serif">Lora</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Tamaño de letra:</label>
                  <select
                    value={config.detailsSize || '9.5px'}
                    onChange={(e) => onUpdateConfig({ detailsSize: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="8px">Muy Fina (8px)</option>
                    <option value="9px">Fina (9px)</option>
                    <option value="9.5px">Normal (9.5px Estándar)</option>
                    <option value="11px">Mediana (11px)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Color:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.detailsColor || '#64748b'}
                      onChange={(e) => onUpdateConfig({ detailsColor: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <span className="font-mono text-[10px] text-black font-bold truncate">{config.detailsColor || '#64748b'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Línea 6: Contacto / Teléfono / Redes Sociales */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-black text-xs">Línea 6: Contacto / Teléfono / Redes (Opcional)</span>
                <span className="text-[10px] text-black font-bold">Contacto</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={config.phone}
                  onChange={(e) => onUpdateConfig({ phone: e.target.value })}
                  placeholder="Tel: +58 414-1234567"
                  className="px-2 py-1 border border-slate-300 rounded text-xs text-black font-bold bg-white"
                />
                <input
                  type="text"
                  value={config.email}
                  onChange={(e) => onUpdateConfig({ email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="px-2 py-1 border border-slate-300 rounded text-xs text-black font-bold bg-white"
                />
                <input
                  type="text"
                  value={config.socialHandle}
                  onChange={(e) => onUpdateConfig({ socialHandle: e.target.value })}
                  placeholder="@dr.ejemplo"
                  className="px-2 py-1 border border-slate-300 rounded text-xs text-black font-bold bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Fuente:</label>
                  <select
                    value={config.fuenteContact || config.fuenteHeader}
                    onChange={(e) => onUpdateConfig({ fuenteContact: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="'Roboto', sans-serif">Roboto</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Tamaño:</label>
                  <select
                    value={config.contactSize || '9px'}
                    onChange={(e) => onUpdateConfig({ contactSize: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="8px">8px</option>
                    <option value="9px">9px (Normal)</option>
                    <option value="10px">10px</option>
                    <option value="11px">11px</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Color:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.contactColor || '#64748b'}
                      onChange={(e) => onUpdateConfig({ contactColor: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <span className="font-mono text-[10px] text-black font-bold truncate">{config.contactColor || '#64748b'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Símbolo Rp. y Fuente General */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-black font-bold mb-1">Símbolo de Prescripción (Rp. / Rx):</label>
                <input
                  type="text"
                  value={config.rxTitle || 'Rp.'}
                  onChange={(e) => onUpdateConfig({ rxTitle: e.target.value })}
                  placeholder="Rp."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-black font-black focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-black font-bold mb-1">Color del Símbolo Rp.:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.rxTitleColor || config.primaryDocColor}
                    onChange={(e) => onUpdateConfig({ rxTitleColor: e.target.value })}
                    className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0"
                  />
                  <span className="font-mono text-xs text-black font-black">{config.rxTitleColor || config.primaryDocColor}</span>
                </div>
              </div>
            </div>

            {/* SECCIÓN ESPECIAL: TIPOGRAFÍA Y LETRAS DE OTROS DOCUMENTOS CLÍNICOS */}
            <div className="p-3.5 bg-blue-50/80 border border-blue-300 rounded-xl space-y-3">
              <span className="font-black text-black text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-800" />
                <span>Letras y Tipografías de Informes, Indicaciones, Constancias y Paciente:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Datos del Paciente */}
                <div className="bg-white p-2.5 rounded-lg border border-blue-300">
                  <span className="font-black text-black block mb-1">Barra de Paciente:</span>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Tamaño de letra:</label>
                  <select
                    value={config.patientBarSize || '10.5px'}
                    onChange={(e) => onUpdateConfig({ patientBarSize: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="9.5px">Fina (9.5px)</option>
                    <option value="10.5px">Estándar (10.5px)</option>
                    <option value="11.5px">Mediana (11.5px)</option>
                    <option value="12.5px">Grande (12.5px)</option>
                  </select>
                </div>

                {/* Informes Médicos */}
                <div className="bg-white p-2.5 rounded-lg border border-blue-300 space-y-1">
                  <span className="font-black text-black block mb-0.5">Informe Médico:</span>
                  <div>
                    <label className="text-[10px] text-black font-bold block">Tamaño:</label>
                    <select
                      value={config.reportFontSize || '12px'}
                      onChange={(e) => onUpdateConfig({ reportFontSize: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                    >
                      <option value="11px">11px (Compacto)</option>
                      <option value="12px">12px (Estándar)</option>
                      <option value="13px">13px (Mediano)</option>
                      <option value="14px">14px (Grande)</option>
                      <option value="15px">15px (Maxi)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-black font-bold block">Fuente:</label>
                    <select
                      value={config.reportFontFamily || "'Roboto', sans-serif"}
                      onChange={(e) => onUpdateConfig({ reportFontFamily: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                    >
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'Montserrat', sans-serif">Montserrat</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="'Merriweather', serif">Merriweather</option>
                      <option value="'Lora', serif">Lora</option>
                    </select>
                  </div>
                </div>

                {/* Hoja de Indicaciones */}
                <div className="bg-white p-2.5 rounded-lg border border-blue-300 space-y-1">
                  <span className="font-black text-black block mb-0.5">Indicaciones:</span>
                  <div>
                    <label className="text-[10px] text-black font-bold block">Tamaño:</label>
                    <select
                      value={config.indicationsFontSize || '12.5px'}
                      onChange={(e) => onUpdateConfig({ indicationsFontSize: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                    >
                      <option value="11px">11px</option>
                      <option value="12.5px">12.5px (Estándar)</option>
                      <option value="13.5px">13.5px (Mediano)</option>
                      <option value="15px">15px (Grande)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-black font-bold block">Fuente:</label>
                    <select
                      value={config.indicationsFontFamily || "'Roboto', sans-serif"}
                      onChange={(e) => onUpdateConfig({ indicationsFontFamily: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                    >
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'Montserrat', sans-serif">Montserrat</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="'Merriweather', serif">Merriweather</option>
                    </select>
                  </div>
                </div>

                {/* Constancia / Reposo */}
                <div className="bg-white p-2.5 rounded-lg border border-blue-300 space-y-1">
                  <span className="font-black text-black block mb-0.5">Constancia / Reposo:</span>
                  <div>
                    <label className="text-[10px] text-black font-bold block">Tamaño:</label>
                    <select
                      value={config.medicalRestFontSize || '13px'}
                      onChange={(e) => onUpdateConfig({ medicalRestFontSize: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                    >
                      <option value="11.5px">11.5px</option>
                      <option value="13px">13px (Estándar)</option>
                      <option value="14px">14px (Mediano)</option>
                      <option value="15.5px">15.5px (Grande)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-black font-bold block">Fuente:</label>
                    <select
                      value={config.medicalRestFontFamily || "'Merriweather', serif"}
                      onChange={(e) => onUpdateConfig({ medicalRestFontFamily: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                    >
                      <option value="'Merriweather', serif">Merriweather (Clásica)</option>
                      <option value="'Roboto', sans-serif">Roboto (Sans)</option>
                      <option value="'Montserrat', sans-serif">Montserrat</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="'Lora', serif">Lora (Elegante)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RÉCIPES & FORMATOS */}
        {activeSection === 'recipes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Formatos de Récipe & Prescripción</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-full font-black">
                👑 Plan PRO
              </span>
            </div>

            {/* Selector Rápido del Formato a Diseñar */}
            {onSelectPreviewDoc && (
              <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-2xl space-y-2 shadow-2xs">
                <label className="block text-black font-black text-xs flex items-center justify-between">
                  <span>Seleccionar Formato en Pantalla para Diseñar:</span>
                  <span className="text-[10px] text-blue-900 font-bold">Cambia la vista del documento</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'recipe', label: '📄 Récipe Individual Carta / 1/2' },
                    { id: 'recipe-4en1', label: '📦 Récipe Múltiple 4 en 1' },
                    { id: 'indicaciones', label: '📋 Hoja Indicaciones' },
                    { id: 'reposo', label: '⏱️ Reposo Médico' },
                    { id: 'informes', label: '📑 Informe Clínico' },
                  ].map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => onSelectPreviewDoc(doc.id as any)}
                      className={`p-2 rounded-xl border text-left text-xs font-black transition-all cursor-pointer ${
                        activePreviewDoc === doc.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-black border-slate-300'
                      }`}
                    >
                      {doc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Estilo de Línea Divisoria del Récipe */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
              <label className="block text-black font-black text-xs">
                Línea Divisoria / Corte del Récipe:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'tijera', label: '✂️ Línea con Tijera', desc: 'Punteado para cortar con tijera' },
                  { id: 'solido', label: '― Línea Fina Sólida', desc: 'Divisoria discreta y limpia' },
                  { id: 'doble', label: '═ Doble Filete', desc: 'Elegante y formal' },
                  { id: 'ninguno', label: '✕ Sin Divisores', desc: 'Espacio limpio sin líneas' },
                ].map((div) => (
                  <button
                    key={div.id}
                    type="button"
                    onClick={() => onUpdateConfig({ rxDividerStyle: div.id as any })}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      (config.rxDividerStyle || 'tijera') === div.id
                        ? 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-500/20 shadow-xs text-black font-black'
                        : 'border-slate-300 bg-white hover:bg-slate-50 text-black'
                    }`}
                  >
                    <span className="block text-xs font-black">{div.label}</span>
                    <span className="text-[10px] text-black font-medium block truncate">{div.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Símbolo de Prescripción (Rp / Rx / Tratamiento) */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-black text-xs">Símbolo de Prescripción Médica:</span>
                <span className="text-[10px] text-black font-bold">Título del cuerpo</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Texto del Símbolo:</label>
                  <input
                    type="text"
                    value={config.rxTitle || 'Rp.'}
                    onChange={(e) => onUpdateConfig({ rxTitle: e.target.value })}
                    placeholder="Ej: Rp., Rx., Tratamiento:"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-black font-black text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Color del Símbolo:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.rxTitleColor || config.primaryDocColor}
                      onChange={(e) => onUpdateConfig({ rxTitleColor: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <span className="font-mono text-xs text-black font-black">{config.rxTitleColor || config.primaryDocColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disposición de la Firma y Sello en el Récipe */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
              <label className="block text-black font-black text-xs">
                Alineación de Firma y Sello en el Pie del Récipe:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'derecha', label: 'Derecha' },
                  { id: 'centro', label: 'Centro' },
                  { id: 'izquierda', label: 'Izquierda' },
                  { id: 'superpuesto', label: 'Superpuesto' },
                ].map((al) => (
                  <button
                    key={al.id}
                    type="button"
                    onClick={() => onUpdateConfig({ stampAlign: al.id as any })}
                    className={`p-1.5 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                      (config.stampAlign || 'derecha') === al.id
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs font-black'
                        : 'border-slate-300 bg-white text-black hover:bg-slate-50'
                    }`}
                  >
                    {al.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Texto de Leyenda / Disclaimer del Récipe */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
              <label className="block text-black font-black text-xs">
                Texto Legal / Validez del Récipe:
              </label>
              <input
                type="text"
                value={config.footerDisclaimer}
                onChange={(e) => onUpdateConfig({ footerDisclaimer: e.target.value })}
                placeholder="Ej: Válido por 30 días a partir de su fecha de emisión."
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-black font-bold text-xs bg-white"
              />
            </div>

            {/* Notas del Pie de Página */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
              <label className="block text-black font-black text-xs">
                Notas Predeterminadas en Pie de Página:
              </label>
              <textarea
                value={config.footerNotesText}
                onChange={(e) => onUpdateConfig({ footerNotesText: e.target.value })}
                placeholder="Notas de consulta, advertencias o teléfonos para emergencias..."
                rows={2}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-black font-bold text-xs bg-white"
              />
            </div>
          </div>
        )}

        {/* TAB 6: FIRMA, SELLO Y CAJÓN INFERIOR */}
        {activeSection === 'firma' && (
          <div className="space-y-4">
            <span className="font-black text-black uppercase tracking-wider flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-blue-600" />
              <span>Sello Digitalizado, Firma y Cajón Inferior</span>
            </span>

            {/* Sello y Firma Upload & Controls Separados */}
            <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl space-y-4">
              
              {/* SECCIÓN 1: SELLO MÉDICO OFICIAL */}
              <div className="p-3 bg-white border border-slate-300 rounded-xl space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {config.selloImg || config.selloFirma ? (
                      <img
                        src={config.selloImg || config.selloFirma}
                        alt="Sello Médico"
                        className="h-16 w-32 object-contain bg-slate-50 rounded-lg border border-slate-300 p-1"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                    ) : (
                      <div className="h-16 w-32 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-black font-bold">
                        Sin Sello
                      </div>
                    )}
                    <div>
                      <span className="font-black text-black block text-xs">1. Sello Oficial del Médico</span>
                      <span className="text-[11px] text-black font-medium">Sello húmedo o digital independiente</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={stampInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'selloImg')}
                      className="hidden"
                    />
                    <button
                      onClick={() => stampInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-black font-black flex items-center gap-1 transition-colors text-xs cursor-pointer"
                      title="Subir foto o PNG de tu sello"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" /> Subir Mi Sello
                    </button>

                    {(config.selloImg || config.selloFirma) && (
                      <>
                        <button
                          onClick={handleCleanCurrentStamp}
                          className="px-2.5 py-1.5 bg-blue-50 border border-blue-300 hover:bg-blue-100 text-blue-950 rounded-lg text-xs font-black flex items-center gap-1 transition-colors cursor-pointer"
                          title="Remover fondo oscuro y sombras de la foto del sello"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>Limpiar Fondo</span>
                        </button>

                        <button
                          onClick={() => onUpdateConfig({ selloImg: '', selloFirma: '' })}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Quitar sello"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Estilos Predefinidos de Sello Nítido Vectorial (Sin Fondo Oscuro) */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-300 space-y-1.5">
                  <span className="text-[11px] font-black text-black block">
                    💎 Opciones de Sello Nítido Vectorial (100% Transparente y Sin Fondo):
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetStamp('oval')}
                      className="px-2 py-1.5 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 rounded-lg text-black text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      🔵 Ovalado Oficial
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetStamp('rectangular')}
                      className="px-2 py-1.5 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 rounded-lg text-black text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      🏢 Rectangular Clásico
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetStamp('circular')}
                      className="px-2 py-1.5 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 rounded-lg text-black text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      ⭕ Circular Médico
                    </button>
                  </div>
                </div>

                {/* Controles de Tamaño y Posición del Sello */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-black block">
                      Ajustar Tamaño y Posición del Sello (1 Clic):
                    </span>
                    {/* 1-click size presets */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ stampSize: Math.max(50, (Number(config.stampSize) || 110) - 15) })}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[10px] font-black text-black cursor-pointer"
                        title="Reducir tamaño del sello"
                      >
                        -15px
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ stampSize: Math.min(240, (Number(config.stampSize) || 110) + 15) })}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[10px] font-black text-black cursor-pointer"
                        title="Agrandar tamaño del sello"
                      >
                        +15px
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className="text-black font-bold self-center">Tamaños Rápidos:</span>
                    {[
                      { l: 'Estándar (110px)', s: 110 },
                      { l: 'Mediano (140px)', s: 140 },
                      { l: 'Grande Legible (180px)', s: 180 },
                      { l: 'Extra Grande (220px)', s: 220 },
                      { l: 'Máximo (260px)', s: 260 },
                    ].map((sz) => (
                      <button
                        key={sz.s}
                        type="button"
                        onClick={() => onUpdateConfig({ stampSize: sz.s })}
                        className={`px-2 py-0.5 rounded border transition-colors cursor-pointer font-bold ${
                          (config.stampSize || 110) === sz.s
                            ? 'bg-blue-600 text-white border-blue-600 font-black'
                            : 'bg-white hover:bg-slate-50 text-black border-slate-300'
                        }`}
                      >
                        {sz.l}
                      </button>
                    ))}
                  </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div>
                      <div className="flex justify-between text-[10px] text-black font-bold mb-0.5">
                        <span>Tamaño del Sello:</span>
                        <span className="font-black text-blue-900">{config.stampSize || 110}px</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="320"
                        step="5"
                        value={config.stampSize || 110}
                        onChange={(e) => onUpdateConfig({ stampSize: Number(e.target.value) })}
                        className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-black font-bold mb-0.5">
                        <span>Mover Horizontal (X):</span>
                        <span className="font-black text-blue-900">{config.stampPosX || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-350"
                        max="350"
                        step="2"
                        value={config.stampPosX || 0}
                        onChange={(e) => onUpdateConfig({ stampPosX: Number(e.target.value) })}
                        className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-black font-bold mb-0.5">
                        <span>Mover Vertical (Y):</span>
                        <span className="font-black text-blue-900">{config.stampPosY || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-200"
                        max="200"
                        step="2"
                        value={config.stampPosY || 0}
                        onChange={(e) => onUpdateConfig({ stampPosY: Number(e.target.value) })}
                        className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Nudge Buttons for Stamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] bg-blue-50/70 p-2 rounded-lg border border-blue-200">
                    <span className="font-black text-black">Mover Sello con 1 Clic:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ stampPosX: (config.stampPosX || 0) - 10 })}
                        className="px-2 py-0.5 bg-white border border-slate-300 text-black rounded hover:bg-blue-100 font-bold cursor-pointer"
                        title="Mover Sello a la Izquierda"
                      >
                        ← Izq (-10px)
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ stampPosX: (config.stampPosX || 0) + 10 })}
                        className="px-2 py-0.5 bg-white border border-slate-300 text-black rounded hover:bg-blue-100 font-bold cursor-pointer"
                        title="Mover Sello a la Derecha"
                      >
                        Der (+10px) →
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ stampPosY: (config.stampPosY || 0) - 10 })}
                        className="px-2 py-0.5 bg-white border border-slate-300 text-black rounded hover:bg-blue-100 font-bold cursor-pointer"
                        title="Subir Sello"
                      >
                        ↑ Arriba (-10px)
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ stampPosY: (config.stampPosY || 0) + 10 })}
                        className="px-2 py-0.5 bg-white border border-slate-300 text-black rounded hover:bg-blue-100 font-bold cursor-pointer"
                        title="Bajar Sello"
                      >
                        ↓ Abajo (+10px)
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ stampPosX: 0, stampPosY: 0 })}
                        className="px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow-2xs cursor-pointer"
                        title="Centrar Sello"
                      >
                        ↺ Centrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: FIRMA REAL DEL MÉDICO */}
              <div className="p-3 bg-white border border-slate-300 rounded-xl space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {config.firmaImg ? (
                      <img
                        src={config.firmaImg}
                        alt="Firma Real"
                        className="h-16 w-32 object-contain bg-slate-50 rounded-lg border border-slate-300 p-1"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                    ) : (
                      <div className="h-16 w-32 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-black font-bold">
                        Sin Firma Real
                      </div>
                    )}
                    <div>
                      <span className="font-black text-black block text-xs">2. Firma Real del Médico</span>
                      <span className="text-[11px] text-black font-medium">Suba foto de su firma en papel blanco</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenSignatureModal}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black flex items-center gap-1.5 shadow-2xs transition-colors text-xs cursor-pointer"
                      title="Subir foto de firma real, elegir caligrafía o trazar"
                    >
                      <PenTool className="w-3.5 h-3.5" /> Gestionar Firma / Subir Foto
                    </button>

                    {config.firmaImg && (
                      <button
                        onClick={() => onUpdateConfig({ firmaImg: '' })}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Quitar firma"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Controles de Tamaño y Posición de la Firma */}
                {config.firmaImg && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-black block">
                        Ajustar Tamaño y Posición de la Firma (1 Clic):
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateConfig({ signatureSize: Math.max(50, (Number(config.signatureSize) || 120) - 15) })}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[10px] font-black text-black cursor-pointer"
                          title="Reducir tamaño de la firma"
                        >
                          -15px
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateConfig({ signatureSize: Math.min(240, (Number(config.signatureSize) || 120) + 15) })}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[10px] font-black text-black cursor-pointer"
                          title="Agrandar tamaño de la firma"
                        >
                          +15px
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[10px]">
                      <span className="text-black font-bold self-center">Tamaños Rápidos:</span>
                      {[
                        { l: 'Pequeña (80px)', s: 80 },
                        { l: 'Estándar (120px)', s: 120 },
                        { l: 'Mediana (150px)', s: 150 },
                        { l: 'Grande (180px)', s: 180 },
                      ].map((sz) => (
                        <button
                          key={sz.s}
                          type="button"
                          onClick={() => onUpdateConfig({ signatureSize: sz.s })}
                          className={`px-2 py-0.5 rounded border transition-colors cursor-pointer font-bold ${
                            (config.signatureSize || 120) === sz.s
                              ? 'bg-emerald-600 text-white border-emerald-600 font-black'
                              : 'bg-white hover:bg-slate-50 text-black border-slate-300'
                          }`}
                        >
                          {sz.l}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <div>
                        <div className="flex justify-between text-[10px] text-black font-bold mb-0.5">
                          <span>Tamaño de la Firma:</span>
                          <span className="font-black text-emerald-900">{config.signatureSize || 120}px</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="300"
                          step="5"
                          value={config.signatureSize || 120}
                          onChange={(e) => onUpdateConfig({ signatureSize: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-black font-bold mb-0.5">
                          <span>Mover Horizontal (X):</span>
                          <span className="font-black text-emerald-900">{config.signaturePosX || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-350"
                          max="350"
                          step="2"
                          value={config.signaturePosX || 0}
                          onChange={(e) => onUpdateConfig({ signaturePosX: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-black font-bold mb-0.5">
                          <span>Mover Vertical (Y):</span>
                          <span className="font-black text-emerald-900">{config.signaturePosY || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          step="2"
                          value={config.signaturePosY || 0}
                          onChange={(e) => onUpdateConfig({ signaturePosY: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Nudge Buttons for Signature */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                      <span className="font-black text-black">Mover Firma con 1 Clic:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateConfig({ signaturePosX: (config.signaturePosX || 0) - 10 })}
                          className="px-2 py-0.5 bg-white border border-slate-300 text-black rounded hover:bg-emerald-100 font-bold cursor-pointer"
                          title="Mover Firma a la Izquierda"
                        >
                          ← Izq (-10px)
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateConfig({ signaturePosX: (config.signaturePosX || 0) + 10 })}
                          className="px-2 py-0.5 bg-white border border-slate-300 text-black rounded hover:bg-emerald-100 font-bold cursor-pointer"
                          title="Mover Firma a la Derecha"
                        >
                          Der (+10px) →
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateConfig({ signaturePosY: (config.signaturePosY || 0) - 10 })}
                          className="px-2 py-0.5 bg-white border border-slate-300 text-black rounded hover:bg-emerald-100 font-bold cursor-pointer"
                          title="Subir Firma"
                        >
                          ↑ Arriba (-10px)
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateConfig({ signaturePosY: (config.signaturePosY || 0) + 10 })}
                          className="px-2 py-0.5 bg-white border border-slate-300 text-black rounded hover:bg-emerald-100 font-bold cursor-pointer"
                          title="Bajar Firma"
                        >
                          ↓ Abajo (+10px)
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateConfig({ signaturePosX: 0, signaturePosY: 0 })}
                          className="px-2 py-0.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-bold shadow-2xs cursor-pointer"
                          title="Centrar Firma"
                        >
                          ↺ Centrar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Presets Rápidos de Sellos Oficiales de Emergencia */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-black text-black block mb-1.5">
                  Generar Sello Oficial Automático (Opcional si aún no tiene foto de su sello físico):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onUpdateConfig({
                      selloImg: createDoctorStampSVG(
                        config.doctorName, 
                        config.mpps, 
                        config.ci, 
                        config.primaryDocColor || '#1e3a8a', 
                        config.specialty, 
                        'oval',
                        config.collegeNumber
                      )
                    })}
                    className="p-2 bg-white rounded-lg border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all group cursor-pointer"
                  >
                    <span className="font-black text-black text-[11px] block group-hover:text-blue-700">
                      ✦ Sello Ovalado Reglamentario
                    </span>
                    <span className="text-[10px] text-black font-medium">Doble elipse oficial con estrellas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateConfig({
                      selloImg: createDoctorStampSVG(
                        config.doctorName, 
                        config.mpps, 
                        config.ci, 
                        config.primaryDocColor || '#1e3a8a', 
                        config.specialty, 
                        'rectangular',
                        config.collegeNumber
                      )
                    })}
                    className="p-2 bg-white rounded-lg border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all group cursor-pointer"
                  >
                    <span className="font-black text-black text-[11px] block group-hover:text-blue-700">
                      ✦ Sello Rectangular Clásico
                    </span>
                    <span className="text-[10px] text-black font-medium">Borde punteado y datos centrados</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Textos del Cajón Inferior */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
              <span className="font-black text-black text-xs block">Línea Inferior Izquierda: Redes Sociales, Teléfonos, Emergencias</span>
              <textarea
                value={config.footerNotesText}
                onChange={(e) => onUpdateConfig({ footerNotesText: e.target.value })}
                rows={2}
                placeholder="@anestesiapro2026 · Citas y Consultas: +58 414-1234567"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none resize-none text-xs bg-white"
              />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Tamaño de letra:</label>
                  <select
                    value={config.footerNotesSize || '10px'}
                    onChange={(e) => onUpdateConfig({ footerNotesSize: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs text-black font-bold"
                  >
                    <option value="8.5px">Mini (8.5px)</option>
                    <option value="9.5px">Pequeña (9.5px)</option>
                    <option value="10px">Normal (10px Estándar)</option>
                    <option value="11px">Mediana (11px)</option>
                    <option value="12px">Grande (12px)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black font-bold block mb-0.5">Color de letra:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.footerNotesColor || '#475569'}
                      onChange={(e) => onUpdateConfig({ footerNotesColor: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <span className="font-mono text-[10px] text-black font-bold truncate">{config.footerNotesColor || '#475569'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nota Legal / Validez */}
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
                <label className="block text-black font-black text-xs">Nota Legal / Validez:</label>
                <input
                  type="text"
                  value={config.footerDisclaimer}
                  onChange={(e) => onUpdateConfig({ footerDisclaimer: e.target.value })}
                  placeholder="Válido por 30 días..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none text-xs bg-white"
                />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-black font-bold block mb-0.5">Tamaño:</label>
                    <select
                      value={config.footerDisclaimerSize || '9px'}
                      onChange={(e) => onUpdateConfig({ footerDisclaimerSize: e.target.value })}
                      className="w-full px-1.5 py-1 border border-slate-300 rounded bg-white text-[11px] text-black font-bold"
                    >
                      <option value="7.5px">Mini (7.5px)</option>
                      <option value="8.5px">Fina (8.5px)</option>
                      <option value="9px">Normal (9px)</option>
                      <option value="10px">Mediana (10px)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-black font-bold block mb-0.5">Color:</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={config.footerDisclaimerColor || '#475569'}
                        onChange={(e) => onUpdateConfig({ footerDisclaimerColor: e.target.value })}
                        className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0"
                      />
                      <span className="font-mono text-[9px] text-black font-bold truncate">{config.footerDisclaimerColor || '#475569'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Título de la Firma */}
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
                <label className="block text-black font-black text-xs">Título de la Firma:</label>
                <input
                  type="text"
                  value={config.signatureTitle}
                  onChange={(e) => onUpdateConfig({ signatureTitle: e.target.value })}
                  placeholder="Firma y Sello del Médico Tratante"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-black font-black focus:ring-2 focus:ring-blue-500 outline-none text-xs bg-white"
                />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-black font-bold block mb-0.5">Tamaño:</label>
                    <select
                      value={config.signatureTitleSize || '10px'}
                      onChange={(e) => onUpdateConfig({ signatureTitleSize: e.target.value })}
                      className="w-full px-1.5 py-1 border border-slate-300 rounded bg-white text-[11px] text-black font-bold"
                    >
                      <option value="8px">Fina (8px)</option>
                      <option value="9px">Sutil (9px)</option>
                      <option value="10px">Normal (10px)</option>
                      <option value="11px">Mediana (11px)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-black font-bold block mb-0.5">Color:</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={config.signatureTitleColor || '#475569'}
                        onChange={(e) => onUpdateConfig({ signatureTitleColor: e.target.value })}
                        className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0"
                      />
                      <span className="font-mono text-[9px] text-black font-bold truncate">{config.signatureTitleColor || '#475569'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: DATOS DEL MÉDICO / COLEGA */}
        {activeSection === 'perfil' && (
          <div className="space-y-3.5">
            <span className="font-black text-black uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Identificación Profesional del Colega</span>
            </span>

            <div className="space-y-3">
              <div>
                <label className="block text-black font-black mb-1">Nombre que aparecerá en el Récipe:</label>
                <input
                  type="text"
                  value={config.doctorName}
                  onChange={(e) => onUpdateConfig({ doctorName: e.target.value })}
                  placeholder="Dr. / Dra. Nombre del Médico"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-black font-black focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-black font-bold mb-1">Especialidad Médica:</label>
                  <input
                    type="text"
                    value={config.specialty}
                    onChange={(e) => onUpdateConfig({ specialty: e.target.value })}
                    placeholder="Especialista en..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-black font-bold mb-1">C.I. / Documento de Identidad:</label>
                  <input
                    type="text"
                    value={config.ci}
                    onChange={(e) => onUpdateConfig({ ci: e.target.value })}
                    placeholder="V-20.123.456"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-black font-bold mb-1">M.P.P.S / Matrícula Sanitaria:</label>
                  <input
                    type="text"
                    value={config.mpps}
                    onChange={(e) => onUpdateConfig({ mpps: e.target.value })}
                    placeholder="54.321"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-black font-bold mb-1">Colegio de Médicos / Registro:</label>
                  <input
                    type="text"
                    value={config.collegeNumber}
                    onChange={(e) => onUpdateConfig({ collegeNumber: e.target.value })}
                    placeholder="CMD: 24.891"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-black font-bold mb-1">Teléfono para WhatsApp / Citas:</label>
                  <input
                    type="text"
                    value={config.phone}
                    onChange={(e) => onUpdateConfig({ phone: e.target.value })}
                    placeholder="+58 414-1234567"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-black font-bold mb-1">Correo Electrónico:</label>
                  <input
                    type="text"
                    value={config.email}
                    onChange={(e) => onUpdateConfig({ email: e.target.value })}
                    placeholder="dr@email.com"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Action Footer */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onResetDefaults}
            className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Predeterminado</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLockDesigner}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Salir del Estudio de Diseño y bloquear el acceso"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Salir del Estudio</span>
          </button>

          {saveToast && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" /> Guardado
            </span>
          )}

          <button
            onClick={triggerSaveWithFeedback}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Guardar Diseño</span>
          </button>
        </div>
      </div>

    </div>
  );
};
