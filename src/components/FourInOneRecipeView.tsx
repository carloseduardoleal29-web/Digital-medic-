import React, { useState, useRef } from 'react';
import { DoctorConfig, RecipeItem } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { Copy, RefreshCw, CheckCircle2, MessageSquare, Printer, Eye, Plus, Minus, Layers, ArrowLeft, Trash2, Save, Download } from 'lucide-react';

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
  onSavePatientOnly?: () => void;
  onDownloadPdfAndShare?: () => void;
  onSaveAndShare?: (shouldDownload?: boolean) => void;
  onOpenPreview?: () => void;
  onBackToHome?: () => void;
  onClearRecipeToBlank?: () => void;
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
  onSavePatientOnly,
  onDownloadPdfAndShare,
  onSaveAndShare,
  onOpenPreview,
  onBackToHome,
  onClearRecipeToBlank,
}) => {
  const printableSheetRef = useRef<HTMLDivElement>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  
  // Default to 1 recipe initially on the page as requested by user
  const [visibleCount, setVisibleCount] = useState<number>(1);

  const activeRecipe = recipes[activeRecipeIndex] || recipes[0];

  const handleAddRecipeBlock = () => {
    if (visibleCount < 4) {
      const nextCount = visibleCount + 1;
      setVisibleCount(nextCount);
      onSelectActiveRecipe(nextCount - 1);
    }
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
        
        {/* Left: Optional Back Button and Recipe Stack Selector */}
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

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700 px-2 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Récipes en esta hoja:</span>
            </span>

            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setVisibleCount(num);
                  if (activeRecipeIndex >= num) {
                    onSelectActiveRecipe(num - 1);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  visibleCount === num
                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {num} {num === 1 ? 'Récipe' : 'Récipes'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleAddRecipeBlock}
              disabled={visibleCount >= 4}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-lg flex items-center gap-1 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              title="Añadir otro récipe a esta hoja (Hasta máximo 4)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Récipe</span>
            </button>

            {visibleCount > 1 && (
              <button
                type="button"
                onClick={handleRemoveRecipeBlock}
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg flex items-center gap-1 transition-colors"
                title="Quitar último récipe de esta hoja"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Quitar</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Zoom controls */}
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
                title="Copiar datos del paciente del Récipe 1 a los demás"
              >
                <RefreshCw className="w-3 h-3 text-blue-600" />
                <span>Sincronizar Paciente</span>
              </button>

              <button
                onClick={onCopyRecipe1ToAll}
                className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors font-medium text-[11px]"
                title="Copiar la prescripción Rp. completa del Récipe 1 a todos"
              >
                <Copy className="w-3 h-3 text-emerald-600" />
                <span>Copiar Rp. 1</span>
              </button>
            </>
          )}

          {/* Save & Direct Send Actions (Pestañas solicitadas: Guardar Paciente) */}
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

            <button
              type="button"
              onClick={() => {
                if (onDownloadPdfAndShare) {
                  onDownloadPdfAndShare();
                } else if (onSaveAndShare) {
                  onSaveAndShare(true);
                }
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer border border-blue-400/30"
              title="Descargar PDF de la hoja completa y luego abrir opciones de envío"
            >
              <Download className="w-3.5 h-3.5 text-blue-200" />
              <span>Descargar PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black rounded-xl text-xs shadow-sm hover:shadow flex items-center gap-1.5 transform active:scale-95 transition-all cursor-pointer border border-emerald-400/30"
              title="Enviar por WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-100" />
              <span>WhatsApp 💬</span>
            </button>
          </div>

          {/* Botón Rojo: Dejar Récipe en Blanco */}
          <button
            type="button"
            onClick={() => {
              // Limpiar datos del paciente y prescripción del récipe seleccionado inmediatamente
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
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 border border-rose-500 cursor-pointer text-xs"
            title="Dejar el récipe en blanco para un nuevo paciente (limpia nombre, cédula, edad y prescripción Rp)"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>Dejar Récipe en Blanco</span>
          </button>

          {onOpenPreview && (
            <button
              onClick={onOpenPreview}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1 text-[11px] shadow-2xs transition-colors cursor-pointer"
              title="Vista previa 1:1 de la hoja con los récipes"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Vista Previa</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Letter Sheet with Zoom Scale */}
      <div 
        className="w-full flex justify-center transition-transform origin-top"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
      >
        <div
          ref={printableSheetRef}
          className={`relative w-full shadow-xl p-4 transition-all print-container ${textureClass} ${
            visibleCount === 1 ? 'max-w-[680px] min-h-[600px]' : 'max-w-[880px] min-h-[1050px]'
          } ${config.enforcePureBlackText ? 'enforce-pure-black' : ''}`}
          style={{
            backgroundColor: config.tonePapel || '#ffffff',
            border: borderStyle,
            borderRadius: config.docCornerRadius || '16px',
          }}
        >
        {/* Watermark is rendered per recipe card to avoid any doubling */}
        {/* Dynamic Grid Layout according to visibleCount */}
        <div
          className={`relative z-10 grid gap-3.5 h-full ${
            visibleCount === 1
              ? 'grid-cols-1'
              : visibleCount === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {recipes.slice(0, visibleCount).map((rec, idx) => {
            const isActive = activeRecipeIndex === idx;

            return (
              <div
                key={rec.id || idx}
                onClick={() => onSelectActiveRecipe(idx)}
                className={`relative rounded-xl p-3.5 flex flex-col justify-between transition-all overflow-hidden bg-white/50 backdrop-blur-[0.5px] cursor-pointer ${
                  isActive ? 'ring-2 ring-blue-500 shadow-sm' : 'border border-slate-200/90'
                }`}
                style={{
                  borderWidth: '1.5px',
                  borderColor: isActive ? '#3b82f6' : config.primaryDocColor,
                  minHeight: visibleCount === 1 ? '520px' : '490px',
                }}
              >
                {/* Single, Tenue Watermark in each recipe (No double watermark) */}
                {config.marcaAgua && (
                  <div className="marca-agua pointer-events-none">
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

                {/* Quadrant Badge (hidden in print) */}
                <div className="absolute top-1.5 right-2 text-[10px] font-bold text-slate-400 no-print flex items-center gap-1 z-20">
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full">
                  {/* Mini Header */}
                  <div>
                    <DocumentHeader
                      config={config}
                      compact={true}
                      editableInline={false}
                    />

                    {/* Patient Info with C.I. and Phone */}
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

                    {/* Prescription Rp. */}
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
                            title="Borrar prescripción de este récipe"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Borrar Rp</span>
                          </button>
                        )}
                      </div>

                      <textarea
                        value={rec.rp}
                        onChange={(e) => onChangeRecipeItem(idx, { rp: e.target.value })}
                        placeholder={`Indicaciones para el Récipe #${idx + 1}...\n(Haga clic para escribir o use el Banco de Fármacos arriba)`}
                        className={`w-full p-2.5 text-xs text-slate-900 bg-transparent border border-slate-200/70 rounded-lg focus:border-blue-500 focus:outline-none resize-none leading-relaxed placeholder:text-slate-300 ${
                          visibleCount === 1 ? 'h-[220px]' : 'h-[160px]'
                        }`}
                        style={{
                          fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                          fontSize: config.bodyFontSize || '12px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Mini Footer */}
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
          })}
        </div>
      </div>
    </div>

      {/* WhatsApp Modal for the active recipe / full sheet */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        config={config}
        documentType="recipe-4en1"
        patientName={activeRecipe.patientName || recipes[0]?.patientName}
        patientPhone={activeRecipe.patientPhone || recipes[0]?.patientPhone || ''}
        documentTitle={visibleCount > 1 ? `Hoja de Récipes Médicos (${visibleCount} Récipes)` : `Récipe Médico - ${activeRecipe.diagnosis || 'Prescripción'}`}
        contentBody={
          visibleCount > 1
            ? recipes
                .slice(0, visibleCount)
                .map((r, i) => {
                  const rp = (r.rp || '').trim();
                  const notes = (r.indicationsNotes || '').trim();
                  if (!rp && !notes) return null;
                  let b = `📋 *RÉCIPE #${i + 1}*${r.diagnosis ? ` (${r.diagnosis})` : ''}:\n${rp}`;
                  if (notes) b += `\nNotas: ${notes}`;
                  return b;
                })
                .filter(Boolean)
                .join('\n\n') || activeRecipe.rp
            : activeRecipe.rp + (activeRecipe.indicationsNotes ? `\n\nNotas: ${activeRecipe.indicationsNotes}` : '')
        }
        onUpdatePatientPhone={(phone) => onChangeRecipeItem(activeRecipeIndex, { patientPhone: phone })}
        onTriggerPrintPdf={onPrint}
      />

    </div>
  );
};
