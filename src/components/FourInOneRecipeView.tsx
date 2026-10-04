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
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  
  // Default mode: 'single' (Un solo récipe normal en pantalla principal)
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
        
        {/* Left: Navigation and Mode Switcher */}
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

          {/* Selector de Modo de Vista en Edición */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Mostrar un solo récipe normal en pantalla para editar con comodidad"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Récipe Único (Normal)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Mostrar los 4 cuadrantes de la hoja carta completa"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Hoja Completa (4 Cuadrantes)</span>
            </button>
          </div>

          {viewMode === 'grid' && (
            <button
              type="button"
              onClick={() => setShowCutGuides(!showCutGuides)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                showCutGuides 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              }`}
              title="Mostrar u ocultar líneas guía de corte con tijera"
            >
              <span>✂ Guías de corte</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Reducir zoom"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1 text-slate-700 min-w-[30px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Aumentar zoom"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

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

      {/* MODE 1: UN SOLO RÉCIPE NORMAL EN PANTALLA PRINCIPAL (DEFAULT) */}
      {viewMode === 'single' && (
        <div 
          className="w-full flex justify-center transition-transform origin-top mb-8"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          <div
            ref={printableSheetRef}
            className={`relative w-full max-w-[800px] bg-white shadow-2xl p-6 sm:p-8 rounded-2xl transition-all print-container recipe-single-card border border-slate-200/90 ${textureClass} ${
              config.enforcePureBlackText ? 'enforce-pure-black' : ''
            }`}
            style={{
              backgroundColor: config.tonePapel || '#ffffff',
              border: borderStyle,
              borderRadius: config.docCornerRadius || '16px',
              minHeight: '880px',
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
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      Edición Normal Única
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 font-medium">
                    <span>Cuadrante {activeRecipeIndex + 1} de la Hoja Carta</span>
                  </div>
                </div>

                {/* Patient Bar - Clean Full Size Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-4 text-xs shadow-2xs">
                  <div className="flex flex-col gap-1 col-span-1 sm:col-span-2">
                    <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Nombre del Paciente:
                    </label>
                    <input
                      type="text"
                      value={activeRecipe.patientName}
                      onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientName: e.target.value })}
                      placeholder="Nombre y Apellido del Paciente"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none px-2.5 py-1.5 rounded-lg text-slate-900 font-bold text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      C.I. / Documento:
                    </label>
                    <input
                      type="text"
                      value={activeRecipe.patientCI || ''}
                      onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientCI: e.target.value })}
                      placeholder="V-00.000.000"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2.5 py-1.5 rounded-lg text-slate-900 font-semibold text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Teléfono:
                    </label>
                    <input
                      type="text"
                      value={activeRecipe.patientPhone || ''}
                      onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientPhone: e.target.value })}
                      placeholder="0412-0000000"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2.5 py-1.5 rounded-lg text-slate-900 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Edad:
                    </label>
                    <input
                      type="text"
                      value={activeRecipe.patientAge}
                      onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { patientAge: e.target.value })}
                      placeholder="Ej: 35 años"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2.5 py-1.5 rounded-lg text-slate-900 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1 col-span-1 sm:col-span-2">
                    <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Diagnóstico (Dx):
                    </label>
                    <input
                      type="text"
                      value={activeRecipe.diagnosis || ''}
                      onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { diagnosis: e.target.value })}
                      placeholder="Diagnóstico médico (opcional)"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2.5 py-1.5 rounded-lg text-slate-900 font-medium text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Fecha:
                    </label>
                    <input
                      type="text"
                      value={activeRecipe.date}
                      onChange={(e) => onChangeRecipeItem(activeRecipeIndex, { date: e.target.value })}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 outline-none px-2.5 py-1.5 rounded-lg text-slate-900 text-xs font-semibold"
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
                      Rp. Prescripción Médica:
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
      )}

      {/* MODE 2: HOJA CARTA COMPLETA CON LOS 4 CUADRANTES */}
      {viewMode === 'grid' && (
        <div 
          className="w-full flex justify-center transition-transform origin-top mb-8"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          <div
            ref={printableSheetRef}
            className={`relative w-full shadow-2xl p-4 transition-all print-container recipe-4en1-container ${textureClass} max-w-[850px] min-h-[1090px] ${
              config.enforcePureBlackText ? 'enforce-pure-black' : ''
            }`}
            style={{
              backgroundColor: config.tonePapel || '#ffffff',
              border: borderStyle,
              borderRadius: config.docCornerRadius || '16px',
              aspectRatio: '8.5 / 11',
            }}
          >
            {/* Cut Guides */}
            {showCutGuides && (
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/2 left-3 right-3 border-t border-dashed border-slate-300 -translate-y-1/2 flex items-center justify-center">
                  <span className="bg-white/90 px-2 py-0.5 rounded text-[9px] text-slate-400 font-mono tracking-widest flex items-center gap-1 shadow-2xs">
                    ✂ - - - - - LÍNEA DE CORTE - - - - - ✂
                  </span>
                </div>
                <div className="absolute top-3 bottom-3 left-1/2 border-l border-dashed border-slate-300 -translate-x-1/2 flex items-center justify-center">
                  <span className="bg-white/90 px-1 py-1 rounded text-[8px] text-slate-400 font-mono [writing-mode:vertical-lr] tracking-widest shadow-2xs">
                    ✂ CORTE
                  </span>
                </div>
              </div>
            )}

            {/* 2x2 Grid */}
            <div className="relative z-10 grid grid-cols-2 grid-rows-2 gap-3.5 h-full min-h-[1040px] recipe-4en1-grid">
              {[0, 1, 2, 3].map((idx) => {
                if (idx < visibleCount) {
                  const rec = safeRecipes[idx] || safeRecipes[0];
                  const isActive = activeRecipeIndex === idx;

                  return (
                    <div
                      key={rec.id || idx}
                      onClick={() => onSelectActiveRecipe(idx)}
                      className={`relative rounded-xl p-3.5 flex flex-col justify-between transition-all overflow-hidden bg-white/50 backdrop-blur-[0.5px] cursor-pointer recipe-quadrant-card ${
                        isActive ? 'ring-2 ring-blue-500 shadow-sm' : 'border border-slate-200/90'
                      }`}
                      style={{
                        borderWidth: '1.5px',
                        borderColor: isActive ? '#3b82f6' : config.primaryDocColor,
                        minHeight: '490px',
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
                              opacity: Math.min(config.watermarkOpacity ?? 0.05, 0.08),
                              width: `${Math.min(50, config.watermarkScale || 45)}%`,
                              transform: `rotate(${config.watermarkRotation || 0}deg)`,
                            }}
                          />
                        </div>
                      )}

                      {/* Quadrant Badge */}
                      <div className="absolute top-1.5 right-2 text-[10px] font-bold text-slate-400 no-print flex items-center gap-1 z-20">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100/90 text-slate-500">
                          Cuadrante {idx + 1}
                        </span>
                        {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                      </div>

                      {/* Quadrant Content */}
                      <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                          <DocumentHeader
                            config={config}
                            compact={true}
                            editableInline={false}
                          />

                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 py-1 px-1.5 rounded-lg bg-transparent border-0 mb-1 text-[11px]">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-700">Pac:</span>
                              <input
                                type="text"
                                value={rec.patientName}
                                onChange={(e) => onChangeRecipeItem(idx, { patientName: e.target.value })}
                                placeholder="Paciente"
                                className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none px-0.5 text-slate-900 font-medium"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-700">C.I:</span>
                              <input
                                type="text"
                                value={rec.patientCI || ''}
                                onChange={(e) => onChangeRecipeItem(idx, { patientCI: e.target.value })}
                                placeholder="Cédula"
                                className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none px-0.5 text-slate-900 font-medium"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-700">Tel:</span>
                              <input
                                type="text"
                                value={rec.patientPhone || ''}
                                onChange={(e) => onChangeRecipeItem(idx, { patientPhone: e.target.value })}
                                placeholder="Teléfono"
                                className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none px-0.5 text-slate-900"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-700">Edad:</span>
                              <input
                                type="text"
                                value={rec.patientAge}
                                onChange={(e) => onChangeRecipeItem(idx, { patientAge: e.target.value })}
                                placeholder="Edad"
                                className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none px-0.5 text-slate-900"
                              />
                            </div>
                            <div className="flex items-center gap-1 col-span-2 border-t border-slate-100/80 pt-1 mt-0.5">
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                <span className="font-semibold text-slate-700 shrink-0">Dx:</span>
                                <input
                                  type="text"
                                  value={rec.diagnosis || ''}
                                  onChange={(e) => onChangeRecipeItem(idx, { diagnosis: e.target.value })}
                                  placeholder="Diagnóstico (opcional)"
                                  className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none px-0.5 text-slate-900 font-medium truncate"
                                />
                              </div>
                              <div className="flex items-center gap-1 shrink-0 min-w-[95px]">
                                <span className="font-semibold text-slate-700 shrink-0">Fecha:</span>
                                <input
                                  type="text"
                                  value={rec.date}
                                  onChange={(e) => onChangeRecipeItem(idx, { date: e.target.value })}
                                  className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none px-0.5 text-slate-900 text-right"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className="text-base font-black italic"
                                style={{ color: config.primaryDocColor, fontFamily: "'Playfair Display', serif" }}
                              >
                                Rp.
                              </span>
                              {rec.rp && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onChangeRecipeItem(idx, { rp: '' });
                                  }}
                                  className="no-print px-1.5 py-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[10px] font-bold flex items-center gap-0.5 transition-colors"
                                  title="Borrar prescripción"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Borrar Rp</span>
                                </button>
                              )}
                            </div>

                            <textarea
                              value={rec.rp}
                              onChange={(e) => onChangeRecipeItem(idx, { rp: e.target.value })}
                              placeholder={`Indicaciones para Récipe #${idx + 1}...`}
                              className="w-full p-2.5 text-xs text-slate-900 bg-transparent border border-slate-200/70 rounded-lg focus:border-blue-500 focus:outline-none resize-none leading-relaxed placeholder:text-slate-300 h-[160px]"
                              style={{
                                fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                                fontSize: config.bodyFontSize || '12px',
                              }}
                            />
                          </div>
                        </div>

                        <DocumentFooter
                          config={config}
                          compact={true}
                          notesText={rec.indicationsNotes || config.footerNotesText}
                          onUpdateNotes={(val) => onChangeRecipeItem(idx, { indicationsNotes: val })}
                          onUpdateConfigField={(field, val) => onUpdateConfig?.({ [field]: val })}
                          editableInline={true}
                        />

                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={`empty-${idx}`}
                      onClick={() => handleAddSpecificRecipe(idx)}
                      className="relative rounded-xl p-4 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-300/80 hover:border-blue-500 bg-slate-50/40 hover:bg-blue-50/30 transition-all cursor-pointer group min-h-[490px] recipe-quadrant-empty"
                      title={`Cuadrante #${idx + 1} libre. Haga clic para añadir otro récipe.`}
                    >
                      <div className="no-print flex flex-col items-center">
                        <div className="w-11 h-11 rounded-2xl bg-blue-100 group-hover:bg-blue-600 text-blue-700 group-hover:text-white flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-all">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-700 text-xs mb-1">
                          Cuadrante #{idx + 1} Libre
                        </span>
                        <p className="text-[11px] text-slate-500 max-w-[210px] mb-2.5 leading-snug">
                          Espacio disponible. Toque aquí si desea redactar el Récipe #{idx + 1}.
                        </p>
                        <span className="text-[10px] font-bold text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                          + Añadir Récipe #{idx + 1}
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center text-slate-400 opacity-60 p-4 text-center">
                        <Scissors className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                          Cuadrante {idx + 1} Libre
                        </span>
                        <span className="text-[10px] text-slate-400 max-w-[190px] leading-relaxed block">
                          Espacio disponible para corte de hoja carta (1/4 Carta)
                        </span>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
