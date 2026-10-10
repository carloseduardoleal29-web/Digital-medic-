import React, { useState, useRef } from 'react';
import { DoctorConfig, RecipeItem } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { 
  Copy, 
  RefreshCw, 
  CheckCircle2, 
  MessageSquare, 
  Printer, 
  Eye, 
  Plus, 
  Minus, 
  Layers, 
  ArrowLeft, 
  Trash2, 
  Save, 
  Download, 
  Mail, 
  Scissors, 
  Layout, 
  FileText,
  Sparkles,
  Check
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
  onDownloadPdfAndShare,
  onInstantWhatsApp,
  onSaveAndShare,
  onOpenPreview,
  onBackToHome,
  onClearRecipeToBlank,
  onSwitchToNormalRecipe,
}) => {
  const printableSheetRef = useRef<HTMLDivElement>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  
  // Default mode: 'single' (En pantalla se muestra el récipe individual normal, cómodo y grande)
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [visibleCount, setVisibleCount] = useState<number>(1);
  const [showCutGuides, setShowCutGuides] = useState<boolean>(true);

  const fallbackRecipe: RecipeItem = {
    id: 'rec-1',
    patientName: '',
    patientAge: '',
    patientCI: '',
    patientPhone: '',
    date: new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()),
    diagnosis: '',
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

  const handleAddSpecificRecipe = (idx: number) => {
    if (idx >= visibleCount) {
      setVisibleCount(idx + 1);
    }
    onSelectActiveRecipe(idx);
  };

  const handleRemoveRecipeBlock = () => {
    if (visibleCount > 1) {
      const nextCount = visibleCount - 1;
      setVisibleCount(nextCount);
      if (activeRecipeIndex >= nextCount) {
        onSelectActiveRecipe(nextCount - 1);
      }
    }
  };

  const borderStyle = getDocumentBorderStyle(config.borderStyle, config.primaryDocColor);
  const textureClass = getPaperTextureClass(config.paperTexture);

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Quick Action Toolbar */}
      <div className="w-full max-w-[880px] flex flex-wrap items-center justify-between gap-2.5 mb-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs no-print shadow-xs">
        
        {/* Left: Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-300/80 cursor-pointer"
              title="Volver a la pantalla principal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Inicio</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {visibleCount > 1 && (
            <>
              <button
                onClick={onSyncPatientToAll}
                className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors font-medium text-[11px]"
                title="Copiar datos del paciente del Récipe 1 a los demás récipes"
              >
                <RefreshCw className="w-3 h-3 text-blue-600" />
                <span>Sincronizar Paciente</span>
              </button>

              <button
                onClick={onCopyRecipe1ToAll}
                className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors font-medium text-[11px]"
                title="Copiar la prescripción Rp. del Récipe 1 a todos los récipes"
              >
                <Copy className="w-3 h-3 text-emerald-600" />
                <span>Copiar Rp. 1</span>
              </button>
            </>
          )}

          {/* Action Buttons: Guardar, Descargar PDF, Imprimir, Vista Previa */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (onSavePatientOnly) {
                  onSavePatientOnly();
                } else if (onSaveAndShare) {
                  onSaveAndShare(false);
                }
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300"
              title="Guardar paciente en su banco de pacientes"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>💾 Guardar Paciente</span>
            </button>

            {onDownloadPdf && (
              <button
                type="button"
                onClick={onDownloadPdf}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Descargar archivo PDF con el nombre del paciente y fecha"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>📥 Descargar PDF</span>
              </button>
            )}

            {onOpenEmailModal && (
              <button
                type="button"
                onClick={onOpenEmailModal}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Enviar récipes por correo electrónico al paciente"
              >
                <Mail className="w-3.5 h-3.5 text-white" />
                <span>✉️ Enviar por Correo</span>
              </button>
            )}

            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer border border-blue-400/30"
                title="Imprimir récipes directamente o guardar como PDF del sistema"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>🖨️ Imprimir Récipes</span>
              </button>
            )}

            {onOpenPreview && (
              <button
                type="button"
                onClick={onOpenPreview}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer border border-slate-700"
                title="Vista previa 1:1 de la hoja carta con los récipes organizados"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>👁️ Vista Previa</span>
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
                if (onClearRecipeToBlank) {
                  onClearRecipeToBlank();
                }
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95 border border-rose-500 cursor-pointer text-xs"
              title="Dejar el récipe activo en blanco"
            >
              <Trash2 className="w-3.5 h-3.5 text-white" />
              <span>Dejar en Blanco</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Selector for Recipes (Récipe 1, Récipe 2, Récipe 3, Récipe 4) */}
      <div className="w-full max-w-[880px] bg-slate-900 text-white p-2 sm:p-2.5 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-2 shadow-lg border border-slate-800 no-print">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 px-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Seleccionar Récipe:</span>
          </span>

          {[0, 1, 2, 3].map((idx) => {
            const rec = safeRecipes[idx];
            const isActive = activeRecipeIndex === idx;
            const hasContent = Boolean(rec && (rec.rp?.trim() || rec.patientName?.trim() || rec.diagnosis?.trim()));
            const isVisible = idx < visibleCount;

            if (!isVisible && idx >= visibleCount) {
              return null;
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectActiveRecipe(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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

          {visibleCount < 4 && (
            <button
              type="button"
              onClick={handleAddRecipeBlock}
              className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all shadow-xs cursor-pointer border border-emerald-400/40"
              title="Añadir otro récipe a esta hoja carta (Hasta 4 récipes)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Añadir Récipe #{visibleCount + 1}</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-medium px-2">
          <span>{visibleCount} de 4 Récipes Activos en Hoja Carta</span>
        </div>
      </div>

      {/* MODE 1: UN SOLO RÉCIPE NORMAL EN PANTALLA PRINCIPAL (VISTA NORMAL EN PANTALLA) */}
      <div className="w-full max-w-full flex justify-center py-1">
        <div className="w-full max-w-[840px] mb-8 no-print">
          <div
            className={`relative w-full bg-white shadow-2xl p-3.5 sm:p-7 md:p-8 rounded-2xl transition-all recipe-single-card border border-slate-200/90 ${textureClass} ${
              config.enforcePureBlackText ? 'enforce-pure-black' : ''
            }`}
            style={{
              backgroundColor: config.tonePapel || '#ffffff',
              border: borderStyle,
              borderRadius: config.docCornerRadius || '16px',
              minHeight: '760px',
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

            {/* Content Container */}
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[820px]">
              
              {/* Header */}
              <div>
                <DocumentHeader
                  config={config}
                  compact={false}
                  editableInline={true}
                  onUpdateField={(field, val) => onUpdateConfig?.({ [field]: val })}
                />

                {/* Single Recipe Title Bar */}
                <div className="my-3 pb-1 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-lg font-black tracking-wide uppercase font-serif"
                      style={{ color: config.primaryDocColor }}
                    >
                      RÉCIPE MÉDICO #{activeRecipeIndex + 1}
                    </span>
                  </div>
                </div>

                {/* Patient Bar - Compact & Space-Efficient */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-2 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2">
                    <label className="font-bold text-slate-700 text-[10px] uppercase tracking-wider shrink-0">
                      Paciente:
                    </label>
                    <input
                      type="text"
                      value={activeRecipe.patientName}
                      onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientName: e.target.value })}
                      placeholder="Nombre y Apellido del Paciente"
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
                      placeholder="V-00.000.000"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2 py-1 rounded-md text-slate-900 font-semibold text-xs"
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
                      placeholder="0412-0000000"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2 py-1 rounded-md text-slate-900 text-xs"
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
                      placeholder="Diagnóstico médico (opcional)"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2 py-1 rounded-md text-slate-900 font-medium text-xs"
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

                {/* Prescription Section (Rp) */}
                <div className="flex flex-col my-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="text-2xl font-black italic tracking-wide"
                      style={{ color: config.primaryDocColor, fontFamily: "'Playfair Display', serif" }}
                    >
                      Rp.
                    </span>

                    {activeRecipe.rp && (
                      <button
                        type="button"
                        onClick={() => onChangeRecipeItem(activeRecipeIndex, { rp: '' })}
                        className="no-print px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-slate-200"
                        title="Borrar texto del Rp."
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Borrar Rp</span>
                      </button>
                    )}
                  </div>

                  <textarea
                    value={activeRecipe.rp}
                    onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { rp: e.target.value })}
                    placeholder={`Escriba la prescripción para el Récipe #${activeRecipeIndex + 1}...\n(Ejemplo: Paracetamol 500mg, tomar 1 tableta cada 8 horas por 5 días)`}
                    className="w-full p-4 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none resize-none leading-relaxed placeholder:text-slate-400 min-h-[260px] shadow-2xs"
                    style={{
                      fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                      fontSize: config.bodyFontSize || '13px',
                    }}
                  />
                </div>
              </div>

              {/* Document Footer */}
              <div className="mt-4 pt-2 border-t border-slate-200">
                <DocumentFooter
                  config={config}
                  compact={false}
                  notesText={activeRecipe.indicationsNotes || config.footerNotesText}
                  onUpdateNotes={(val) => onChangeRecipeItem(activeRecipeIndex, { indicationsNotes: val })}
                  onUpdateConfigField={(field, val) => onUpdateConfig?.({ [field]: val })}
                  editableInline={true}
                />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* HOJA CARTA 4 EN 1 OFICIAL (IMPRESIÓN Y DESCARGA PDF) */}
      <div 
        ref={printableSheetRef}
        id="recipe-4en1-print-sheet"
        className="w-full flex justify-center print-container hidden print:block"
      >
        <div
          className={`relative w-[816px] max-w-[816px] min-h-[1056px] bg-white p-4 transition-all recipe-4en1-container ${textureClass} ${
            config.enforcePureBlackText ? 'enforce-pure-black' : ''
          }`}
          style={{
            backgroundColor: config.tonePapel || '#ffffff',
            border: borderStyle,
            borderRadius: config.docCornerRadius || '16px',
            width: '816px',
            minHeight: '1056px',
            boxSizing: 'border-box',
          }}
        >
          {/* Cut Guides */}
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

          {/* 2x2 Grid: 4 Quadrants */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 relative z-10 min-h-[1020px] recipe-4en1-grid">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = idx < visibleCount;
              const rec = safeRecipes[idx] || safeRecipes[0];

              if (!isFilled) {
                // Quadrant remains clean blank paper for future use / physical cutting
                return (
                  <div
                    key={`blank-${idx}`}
                    className="relative border-2 border-dashed border-slate-200/80 rounded-xl p-4 bg-slate-50/20 flex flex-col items-center justify-center text-center text-slate-400 min-h-[490px] recipe-quadrant-empty"
                  >
                    <div className="space-y-1 opacity-50 no-print">
                      <Scissors className="w-5 h-5 mx-auto text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Cuadrante #{idx + 1} Libre (1/4 Carta)
                      </span>
                      <span className="text-[9px] text-slate-400 block max-w-[170px]">
                        Espacio libre para corte de hoja carta.
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`quadrant-${idx}`}
                  className="relative border border-slate-200/90 rounded-xl p-3.5 bg-white shadow-2xs flex flex-col justify-between min-h-[490px] overflow-hidden recipe-quadrant-card"
                >
                  {/* Watermark inside each recipe quadrant */}
                  {config.marcaAgua && !config.marcaAgua.includes('DIGITAL') && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                      <img
                        src={config.marcaAgua}
                        alt="Marca de agua"
                        className="marca-agua-img"
                        style={{
                          opacity: config.watermarkOpacity ?? 0.1,
                          width: `${Math.min(65, config.watermarkScale || 55)}%`,
                          transform: `rotate(${config.watermarkRotation || 0}deg)`,
                        }}
                      />
                    </div>
                  )}

                  <div className="relative z-10">
                    <DocumentHeader config={config} compact={true} editableInline={false} />
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 py-0.5 px-1.5 bg-slate-50/90 border border-slate-200/80 rounded-md text-[9px] my-1 leading-tight">
                      <div className="truncate">
                        <span className="font-bold text-slate-700">Pac: </span>
                        <span className="font-semibold text-slate-900">{rec?.patientName || '—'}</span>
                      </div>
                      <div className="text-right truncate">
                        <span className="font-bold text-slate-700">C.I: </span>
                        <span className="font-semibold text-slate-900">{rec?.patientCI || '—'}</span>
                      </div>
                      <div className="truncate col-span-1">
                        <span className="font-bold text-slate-700">Dx: </span>
                        <span className="text-slate-800 font-medium">{rec?.diagnosis || '—'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-700">Fecha: </span>
                        <span className="text-slate-800">{rec?.date || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 my-1 relative z-10">
                    <span className="font-bold text-xs block text-blue-700 font-serif">℞ Rp.</span>
                    <p className="text-[11.5px] text-slate-900 whitespace-pre-wrap leading-relaxed mt-1 font-sans font-medium">
                      {rec?.rp || <span className="italic text-slate-400">Sin medicamentos prescritos.</span>}
                    </p>
                  </div>

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
