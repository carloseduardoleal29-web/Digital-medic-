import React, { useState, useRef } from 'react';
import { DoctorConfig, RecipeItem } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { exportAndSendWhatsAppBusiness } from '../utils/exportDocument';
import { 
  Copy, 
  RefreshCw, 
  Printer, 
  Eye, 
  Plus, 
  Layers, 
  ArrowLeft, 
  Trash2, 
  Save, 
  Download, 
  Mail, 
  Scissors, 
  Share2,
  Sparkles,
  Check,
  Grid2X2,
  FileText
} from 'lucide-react';

interface FourInOneRecipeViewProps {
  config: DoctorConfig;
  recipes: RecipeItem[];
  onChangeRecipeItem: (index: number, updated: Partial<RecipeItem>) => void;
  onSyncPatientToAll: () => void;
  onCopyRecipe1ToAll: () => void;
  activeRecipeIndex: number;
  onSelectActiveRecipe: (idx: number) => void;
  onUpdateConfig?: (updated: Partial<DoctorConfig>) => void;
  onPrint?: () => void;
  onDownloadPdf?: () => void;
  onOpenEmailModal?: () => void;
  onSavePatientOnly?: () => void;
  onDownloadPdfAndShare?: () => void;
  onInstantWhatsApp?: () => void;
  onSaveAndShare?: (shouldDownload?: boolean) => void;
  onOpenPreview?: () => void;
  onBackToHome?: () => void;
  onClearRecipeToBlank?: () => void;
  onSwitchToNormalRecipe?: () => void;
}

export const FourInOneRecipeView: React.FC<FourInOneRecipeViewProps> = ({
  config,
  recipes,
  onChangeRecipeItem,
  onSyncPatientToAll,
  onCopyRecipe1ToAll,
  activeRecipeIndex,
  onSelectActiveRecipe,
  onUpdateConfig,
  onPrint,
  onDownloadPdf,
  onOpenEmailModal,
  onSavePatientOnly,
  onSaveAndShare,
  onOpenPreview,
  onBackToHome,
  onClearRecipeToBlank,
  onSwitchToNormalRecipe,
}) => {
  const printableSheetRef = useRef<HTMLDivElement>(null);
  const printableSingleRef = useRef<HTMLDivElement>(null);
  // Modo de vista: 'single' (Solo Récipe individual editable) o 'grid' (Hoja completa 4 en 1 con cuadrantes)
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  // Tamaño en Solo Récipe:
  // 'quarter': 1/4 Hoja Carta (Pequeño, 4 caben en una hoja carta) -> POR DEFECTO como solicitó el usuario
  // 'half': Media Carta Horizontal (2 caben en una hoja carta)
  // 'letter': Hoja Carta Completa
  const [recipeSize, setRecipeSize] = useState<'quarter' | 'half' | 'letter'>('quarter');

  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [showCutGuides, setShowCutGuides] = useState<boolean>(true);

  const fallbackRecipe: RecipeItem = {
    id: 'rec-1',
    patientName: 'Carlos leal',
    patientAge: '35 años',
    patientCI: 'V-18.456.789',
    patientPhone: '',
    date: '14/10/26',
    diagnosis: 'Consulta médica general',
    rp: '',
    indicationsNotes: '',
  };

  const safeRecipes = (recipes && Array.isArray(recipes) && recipes.length > 0) 
    ? recipes 
    : [fallbackRecipe, fallbackRecipe, fallbackRecipe, fallbackRecipe];

  const activeRecipe = safeRecipes[activeRecipeIndex] || safeRecipes[0] || fallbackRecipe;

  const handleAddRecipeBlock = () => {
    if (visibleCount < 4) {
      const nextCount = visibleCount + 1;
      setVisibleCount(nextCount);
      onSelectActiveRecipe(nextCount - 1);
    }
  };

  const borderStyle = getDocumentBorderStyle(config.borderStyle, config.primaryDocColor);
  const textureClass = getPaperTextureClass(config.paperTexture);

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-150">
      
      {/* ========================================================= */}
      {/* 1. BARRA PRINCIPAL DE ACCIONES RÁPIDAS                    */}
      {/* ========================================================= */}
      <div className="w-full max-w-[920px] flex flex-wrap items-center justify-between gap-2.5 mb-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 text-xs no-print shadow-sm">
        
        {/* Izquierda: Volver y Switcher de Modo */}
        <div className="flex items-center gap-2 flex-wrap">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-300/80 cursor-pointer text-xs"
              title="Volver al Inicio"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Inicio</span>
            </button>
          )}

          {/* Selector de Modo: Solo Récipe vs Hoja 4 en 1 */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'single'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Solo Récipe</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid2X2 className="w-3.5 h-3.5" />
              <span>Hoja 4 en 1</span>
            </button>
          </div>

          {onSwitchToNormalRecipe && (
            <button
              type="button"
              onClick={onSwitchToNormalRecipe}
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center gap-1 transition-colors border border-indigo-200 cursor-pointer text-xs"
              title="Usar Asistente Guiado Paso a Paso"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Asistente Guiado</span>
            </button>
          )}
        </div>

        {/* Derecha: Botones de Acción (WhatsApp Business, Imprimir, Vista Previa, Guardar) */}
        <div className="flex items-center gap-1.5 flex-wrap">

          {/* Botón Envío por WhatsApp (Lee el récipe, envía con herramienta nativa o plan de emergencia) */}
          <button
            type="button"
            onClick={() => {
              const targetNode = printableSheetRef.current;
              const treatment = [
                activeRecipe.rp?.trim(),
                activeRecipe.indicationsNotes?.trim(),
              ].filter(Boolean).join('\n\n');

              exportAndSendWhatsAppBusiness({
                element: targetNode,
                patientName: activeRecipe.patientName || 'Carlos leal',
                documentTitle: 'Récipe Médico',
                dateStr: activeRecipe.date || '14/10/26',
                patientPhone: activeRecipe.patientPhone,
                doctorName: config.doctorName || 'Dr. Carlos Leal',
                treatmentDetails: treatment,
                documentType: 'recipe',
              });
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-500 animate-pulse hover:animate-none"
            title="Enviar récipe por WhatsApp con PDF y detalle de tratamiento"
          >
            <span className="text-sm">📱</span>
            <span>Enviar por WhatsApp</span>
          </button>

          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer border border-blue-500 shadow-xs"
              title="Descargar PDF en Hoja Carta (4 récipes idénticos)"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Descargar PDF</span>
            </button>
          )}

          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-700"
              title="Imprimir los 4 récipes en 1 sola hoja carta o guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-300" />
              <span>🖨️ Imprimir (4 en 1)</span>
            </button>
          )}

          {onOpenEmailModal && (
            <button
              type="button"
              onClick={onOpenEmailModal}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-300"
              title="Enviar por correo electrónico"
            >
              <Mail className="w-3.5 h-3.5 text-slate-600" />
              <span>Correo</span>
            </button>
          )}

          {onOpenPreview && (
            <button
              type="button"
              onClick={onOpenPreview}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-300"
              title="Vista previa 1:1 de impresión"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Vista Previa</span>
            </button>
          )}

          {onSavePatientOnly && (
            <button
              type="button"
              onClick={onSavePatientOnly}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-300"
              title="Guardar paciente en su banco clínico"
            >
              <Save className="w-3.5 h-3.5 text-emerald-600" />
              <span>Guardar</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onChangeRecipeItem(activeRecipeIndex, {
                patientName: '',
                patientAge: '',
                patientCI: '',
                patientPhone: '',
                patientEmail: '',
                diagnosis: '',
                rp: '',
                indicationsNotes: '',
              });
              if (onClearRecipeToBlank) onClearRecipeToBlank();
            }}
            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-all border border-rose-200 cursor-pointer"
            title="Dejar récipe en blanco para nuevo paciente"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>En Blanco</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SUB-BARRA: TAMAÑO EN SOLO RÉCIPE Y TABS DE RÉCIPES     */}
      {/* ========================================================= */}
      <div className="w-full max-w-[920px] bg-slate-900 text-white p-2.5 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-2.5 shadow-md border border-slate-800 no-print">
        
        {/* Selector de Pestañas de Récipes (1, 2, 3, 4) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-cyan-300 flex items-center gap-1 px-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Récipe Activo:</span>
          </span>

          {[0, 1, 2, 3].map((idx) => {
            const rec = safeRecipes[idx];
            const isActive = activeRecipeIndex === idx;
            const hasContent = Boolean(rec && (rec.rp?.trim() || rec.patientName?.trim() || rec.diagnosis?.trim()));

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectActiveRecipe(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-300'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                <span>📄 Récipe #{idx + 1}</span>
                {hasContent && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Tiene contenido guardado" />
                )}
              </button>
            );
          })}

          {visibleCount > 1 && (
            <button
              onClick={onSyncPatientToAll}
              className="px-2 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 text-[11px] font-medium border border-slate-700"
              title="Copiar datos del paciente del Récipe 1 a los demás"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>Sincronizar Paciente</span>
            </button>
          )}
        </div>

        {/* SELECTOR DE TAMAÑO EN "SOLO RÉCIPE" (1/4 Carta vs Media Carta Horizontal vs Carta Entera) */}
        {viewMode === 'single' && (
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs gap-1">
            <span className="text-[11px] font-bold text-slate-400 px-1.5">📐 Tamaño:</span>
            
            <button
              type="button"
              onClick={() => setRecipeSize('quarter')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                recipeSize === 'quarter'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="1/4 de hoja carta (pequeño - 4 caben en una hoja carta)"
            >
              1/4 Hoja (Caben 4)
            </button>

            <button
              type="button"
              onClick={() => setRecipeSize('half')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                recipeSize === 'half'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Media carta horizontal (2 caben en una hoja carta)"
            >
              Media Carta Horizontal (2)
            </button>

            <button
              type="button"
              onClick={() => setRecipeSize('letter')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                recipeSize === 'letter'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Hoja carta completa"
            >
              Carta Entera
            </button>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>4 Récipes organizados en 1 sola Hoja Carta</span>
            <button
              type="button"
              onClick={() => setShowCutGuides(!showCutGuides)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                showCutGuides 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              ✂ Líneas de Corte: {showCutGuides ? 'ON' : 'OFF'}
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. VISTA 1: SOLO RÉCIPE (TAMAÑO ADAPTABLE)                 */}
      {/* ========================================================= */}
      {viewMode === 'single' && (
        <div className="w-full flex flex-col items-center py-1 print:hidden">
          {/* Aviso informativo de formato */}
          <div className="mb-2 text-center text-xs font-semibold text-slate-500 no-print">
            {recipeSize === 'quarter' && (
              <span>📐 Formato actual: <strong>1/4 de Hoja Carta</strong> (Tamaño pequeño: 4 caben en una hoja carta).</span>
            )}
            {recipeSize === 'half' && (
              <span>📐 Formato actual: <strong>Media Carta Horizontal</strong> (2 caben en una hoja carta).</span>
            )}
            {recipeSize === 'letter' && (
              <span>📐 Formato actual: <strong>Hoja Carta Completa</strong> (1 récipe por página).</span>
            )}
          </div>

          <div
            ref={printableSingleRef}
            id={recipeSize === 'quarter' ? 'recipe-quarter-print-container' : 'recipe-single-print-container'}
            data-recipe-size={recipeSize}
            className={`relative w-full ${
              recipeSize === 'quarter'
                ? 'max-w-[420px] p-3 sm:p-4 recipe-size-quarter'
                : recipeSize === 'half'
                ? 'max-w-[800px] p-4 sm:p-6'
                : 'max-w-[800px] p-6 sm:p-8'
            } bg-white shadow-2xl rounded-2xl transition-all recipe-single-card print-container border border-slate-200/90 mb-8 ${textureClass} ${
              config.enforcePureBlackText ? 'enforce-pure-black' : ''
            }`}
            style={{
              backgroundColor: config.tonePapel || '#ffffff',
              border: borderStyle,
              borderRadius: config.docCornerRadius || '16px',
              minHeight: recipeSize === 'quarter' ? '500px' : recipeSize === 'half' ? '460px' : '820px',
              boxSizing: 'border-box',
            }}
          >
            {/* Watermark */}
            {config.marcaAgua && !config.marcaAgua.includes('DIGITAL') && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                <img
                  src={config.marcaAgua}
                  alt="Marca de agua"
                  className="marca-agua-img"
                  style={{
                    opacity: Math.min(config.watermarkOpacity ?? 0.08, 0.12),
                    width: `${Math.min(60, config.watermarkScale || 50)}%`,
                    transform: `rotate(${config.watermarkRotation || 0}deg)`,
                  }}
                />
              </div>
            )}

            <div className={`relative z-10 flex flex-col justify-between h-full ${
              recipeSize === 'quarter' ? 'min-h-[480px]' : recipeSize === 'half' ? 'min-h-[430px]' : 'min-h-[780px]'
            }`}>
              {/* Header */}
              <div>
                <DocumentHeader
                  config={config}
                  compact={recipeSize !== 'letter'}
                  editableInline={true}
                  onUpdateField={(field, val) => onUpdateConfig?.({ [field]: val })}
                />

                {/* Title & Badge */}
                <div className="my-1.5 pb-1 border-b border-slate-200 flex items-center justify-between">
                  <span 
                    className={`${recipeSize === 'quarter' ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'} font-black tracking-wide uppercase font-serif`}
                    style={{ color: config.primaryDocColor }}
                  >
                    RÉCIPE MÉDICO #{activeRecipeIndex + 1}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500">
                    Fecha: <strong className="text-slate-800">{activeRecipe.date || '14/10/26'}</strong>
                  </span>
                </div>

                {/* Patient Bar */}
                {recipeSize === 'quarter' ? (
                  /* Formato 1/4 Hoja: Barra ultracompacta */
                  <div className="p-2 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-2 text-[10px] shadow-2xs space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-700 uppercase text-[9px] shrink-0">Pac:</span>
                      <input
                        type="text"
                        value={activeRecipe.patientName}
                        onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientName: e.target.value })}
                        placeholder="Carlos leal"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-1.5 py-0.5 rounded text-slate-900 font-bold text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-700 shrink-0">C.I:</span>
                        <input
                          type="text"
                          value={activeRecipe.patientCI || ''}
                          onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientCI: e.target.value })}
                          placeholder="V-18.456.789"
                          className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5 rounded text-slate-900 font-semibold text-[10px]"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-700 shrink-0">Edad:</span>
                        <input
                          type="text"
                          value={activeRecipe.patientAge}
                          onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientAge: e.target.value })}
                          placeholder="35 años"
                          className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5 rounded text-slate-900 text-[10px]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-700 shrink-0">Telf:</span>
                        <input
                          type="text"
                          value={activeRecipe.patientPhone || ''}
                          onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientPhone: e.target.value })}
                          placeholder="0414-0000000"
                          className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5 rounded text-slate-900 text-[10px]"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-700 shrink-0">Dx:</span>
                        <input
                          type="text"
                          value={activeRecipe.diagnosis || ''}
                          onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { diagnosis: e.target.value })}
                          placeholder="Diagnóstico"
                          className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5 rounded text-slate-900 text-[10px] truncate"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Formato Media Carta y Carta Entera: Barra extendida */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-2 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-3 text-xs shadow-2xs">
                    <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2">
                      <label className="font-bold text-slate-700 text-[10px] uppercase tracking-wider shrink-0">
                        Paciente:
                      </label>
                      <input
                        type="text"
                        value={activeRecipe.patientName}
                        onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientName: e.target.value })}
                        placeholder="Carlos leal"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none px-2 py-1 rounded-md text-slate-900 font-bold text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="font-bold text-slate-700 text-[10px] uppercase tracking-wider shrink-0">
                        C.I:
                      </label>
                      <input
                        type="text"
                        value={activeRecipe.patientCI || ''}
                        onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientCI: e.target.value })}
                        placeholder="V-18.456.789"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2 py-1 rounded-md text-slate-900 font-semibold text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="font-bold text-slate-700 text-[10px] uppercase tracking-wider shrink-0">
                        Edad:
                      </label>
                      <input
                        type="text"
                        value={activeRecipe.patientAge}
                        onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientAge: e.target.value })}
                        placeholder="35 años"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2 py-1 rounded-md text-slate-900 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2">
                      <label className="font-bold text-slate-700 text-[10px] uppercase tracking-wider shrink-0">
                        Dx:
                      </label>
                      <input
                        type="text"
                        value={activeRecipe.diagnosis || ''}
                        onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { diagnosis: e.target.value })}
                        placeholder="Diagnóstico clínico"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2 py-1 rounded-md text-slate-900 font-medium text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="font-bold text-slate-700 text-[10px] uppercase tracking-wider shrink-0">
                        Telf:
                      </label>
                      <input
                        type="text"
                        value={activeRecipe.patientPhone || ''}
                        onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientPhone: e.target.value })}
                        placeholder="0414-0000000"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2 py-1 rounded-md text-slate-900 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="font-bold text-slate-700 text-[10px] uppercase tracking-wider shrink-0">
                        Fecha:
                      </label>
                      <input
                        type="text"
                        value={activeRecipe.date}
                        onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { date: e.target.value })}
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2 py-1 rounded-md text-slate-900 text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* Prescription Section (Rp) */}
                <div className="flex flex-col my-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`${recipeSize === 'quarter' ? 'text-lg' : 'text-2xl'} font-black italic tracking-wide`}
                      style={{ color: config.primaryDocColor, fontFamily: "'Playfair Display', serif" }}
                    >
                      Rp.
                    </span>

                    {activeRecipe.rp && (
                      <button
                        type="button"
                        onClick={() => onChangeRecipeItem(activeRecipeIndex, { rp: '' })}
                        className="no-print px-2 py-0.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded text-[11px] font-bold flex items-center gap-1 transition-colors border border-slate-200"
                        title="Borrar texto del Rp."
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Borrar Rp</span>
                      </button>
                    )}
                  </div>

                  <textarea
                    value={activeRecipe.rp}
                    onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { rp: e.target.value })}
                    placeholder={`Escriba la prescripción para el Récipe #${activeRecipeIndex + 1}...\n(Ejemplo: Paracetamol 500mg, tomar 1 tableta cada 8 horas)`}
                    rows={recipeSize === 'quarter' ? 4 : 6}
                    className={`w-full p-3 text-xs sm:text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-100 outline-none resize-none leading-relaxed placeholder:text-slate-400 ${
                      recipeSize === 'quarter' ? 'min-h-[140px]' : recipeSize === 'half' ? 'min-h-[180px]' : 'min-h-[260px]'
                    } shadow-inner font-semibold`}
                    style={{
                      fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                      fontSize: config.bodyFontSize || (recipeSize === 'quarter' ? '12px' : '13px'),
                    }}
                  />
                </div>
              </div>

              {/* Document Footer */}
              <div className="mt-2 pt-2 border-t border-slate-200">
                <DocumentFooter
                  config={config}
                  compact={recipeSize !== 'letter'}
                  notesText={activeRecipe.indicationsNotes || config.footerNotesText}
                  onUpdateNotes={(val) => onChangeRecipeItem(activeRecipeIndex, { indicationsNotes: val })}
                  onUpdateConfigField={(field, val) => onUpdateConfig?.({ [field]: val })}
                  editableInline={true}
                />
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. VISTA 2: HOJA CARTA 4 EN 1 COMPLETA (CUADRANTES)        */}
      {/* ========================================================= */}
      <div 
        ref={printableSheetRef}
        id="recipe-4en1-print-sheet"
        className={`w-full flex justify-center print-container ${viewMode === 'grid' ? 'block mb-8' : 'hidden print:block'}`}
      >
        {/* Contenedor principal con proporciones exactas de Hoja Carta (Letter: 8.5" x 11" / 816px x 1056px) */}
        <div
          className={`relative w-full max-w-[816px] h-[1056px] min-h-[1056px] max-h-[1056px] bg-white transition-all recipe-4en1-container shadow-2xl rounded-2xl border border-slate-200 ${textureClass} ${
            config.enforcePureBlackText ? 'enforce-pure-black' : ''
          }`}
          style={{
            backgroundColor: config.tonePapel || '#ffffff',
            border: borderStyle,
            borderRadius: config.docCornerRadius || '16px',
            width: '100%',
            maxWidth: '816px',
            height: '1056px',
            minHeight: '1056px',
            maxHeight: '1056px',
            boxSizing: 'border-box',
            padding: '15px',
            overflow: 'hidden',
          }}
        >
          {/* Cut Guides - Centrales en el gap de 15px */}
          {showCutGuides && (
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute top-1/2 left-3 right-3 border-t border-dashed border-slate-300 -translate-y-1/2 flex items-center justify-center">
                <span className="bg-white/95 px-2 py-0.5 rounded text-[9px] text-slate-400 font-mono tracking-widest flex items-center gap-1">
                  ✂ - - - - - LÍNEA DE CORTE - - - - - ✂
                </span>
              </div>
              <div className="absolute top-3 bottom-3 left-1/2 border-l border-dashed border-slate-300 -translate-x-1/2 flex items-center justify-center">
                <span className="bg-white/95 px-1 py-1 rounded text-[8px] text-slate-400 font-mono [writing-mode:vertical-lr] tracking-widest">
                  ✂ CORTE
                </span>
              </div>
            </div>
          )}

          {/* Contenedor Grid Estricto: 2 columnas x 2 filas, gap: 15px, width y height 100% */}
          <div 
            className="recipe-4en1-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: '15px',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            {[0, 1, 2, 3].map((idx) => {
              // Exactamente cuatro (4) récipes idénticos distribuidos en la cuadrícula 2 arriba y 2 abajo
              const rec = activeRecipe || safeRecipes[0] || fallbackRecipe;

              return (
                <div
                  key={`quadrant-${idx}`}
                  onClick={() => {
                    onSelectActiveRecipe(idx);
                    setViewMode('single');
                  }}
                  className="relative border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs flex flex-col justify-between overflow-hidden recipe-quadrant-card cursor-pointer hover:border-blue-400 transition-colors"
                  style={{
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                    transform: 'none',
                    margin: 0,
                  }}
                  title="Récipe idéntico (1/4 de Hoja Carta)"
                >
                  {/* Watermark inside each recipe quadrant */}
                  {config.marcaAgua && !config.marcaAgua.includes('DIGITAL') && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                      <img
                        src={config.marcaAgua}
                        alt="Marca de agua"
                        className="marca-agua-img"
                        style={{
                          opacity: config.watermarkOpacity ?? 0.08,
                          width: `${Math.min(55, config.watermarkScale || 45)}%`,
                          transform: `rotate(${config.watermarkRotation || 0}deg)`,
                        }}
                      />
                    </div>
                  )}

                  {/* Cabecera del Récipe */}
                  <div className="relative z-10">
                    <DocumentHeader config={config} compact={true} editableInline={false} />
                    
                    {/* Barra de Datos del Paciente */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 py-0.5 px-1.5 bg-slate-50/90 border border-slate-200/80 rounded-md text-[9px] my-1 leading-tight">
                      <div className="truncate">
                        <span className="font-bold text-slate-700">Pac: </span>
                        <span className="font-semibold text-slate-900">{rec?.patientName || 'Carlos leal'}</span>
                      </div>
                      <div className="text-right truncate">
                        <span className="font-bold text-slate-700">C.I: </span>
                        <span className="font-semibold text-slate-900">{rec?.patientCI || 'V-18.456.789'}</span>
                      </div>
                      <div className="truncate col-span-1">
                        <span className="font-bold text-slate-700">Dx: </span>
                        <span className="text-slate-800 font-medium">{rec?.diagnosis || 'Consulta'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-700">Fecha: </span>
                        <span className="text-slate-800">{rec?.date || '14/10/26'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo de Prescripción Médica (Rp.) */}
                  <div className="flex-1 my-1 relative z-10 overflow-hidden flex flex-col justify-start">
                    <span 
                      className="font-black text-xs block font-serif"
                      style={{ color: config.primaryDocColor || '#2563eb' }}
                    >
                      ℞ {config.rxTitle || 'Rp.'}
                    </span>
                    <p 
                      className="text-[10.5px] text-slate-900 whitespace-pre-wrap leading-relaxed mt-0.5 font-sans font-medium line-clamp-6"
                      style={{
                        fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                      }}
                    >
                      {rec?.rp || <span className="italic text-slate-400">Sin medicamentos prescritos. Haga clic para redactar.</span>}
                    </p>
                  </div>

                  {/* Pie de Documento con Sello y Firma */}
                  <div className="mt-1 pt-1 border-t border-slate-200/80 relative z-10">
                    <DocumentFooter
                      config={config}
                      compact={true}
                      notesText={rec?.indicationsNotes || config.footerNotesText}
                      editableInline={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
