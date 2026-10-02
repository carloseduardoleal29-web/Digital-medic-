import React, { useRef, useState } from 'react';
import { DoctorConfig, RecipeItem } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { CheckCircle2, MessageSquare, Printer, Download, Save, Trash2, Plus, ArrowLeft, Scissors } from 'lucide-react';

interface MasterRecipeViewProps {
  config: DoctorConfig;
  recipe?: RecipeItem;
  onChangeRecipe: (updated: Partial<RecipeItem>) => void;
  onUpdateConfig?: (updated: Partial<DoctorConfig>) => void;
  isLiveEditing?: boolean;
  onPrint?: () => void;
  onSavePatientOnly?: () => void;
  onDownloadPdfAndShare?: () => void;
  onSaveAndShare?: (shouldDownload?: boolean) => void;
  onOpenSignatureModal?: () => void;
  onClearRecipeToBlank?: () => void;
  onBackToHome?: () => void;
}

export const MasterRecipeView: React.FC<MasterRecipeViewProps> = ({
  config,
  recipe = {
    id: 'rec-1',
    patientName: '',
    patientAge: '',
    patientCI: '',
    patientPhone: '',
    date: new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()),
    diagnosis: '',
    rp: '',
    indicationsNotes: '',
  },
  onChangeRecipe,
  onUpdateConfig,
  isLiveEditing = false,
  onPrint,
  onSavePatientOnly,
  onDownloadPdfAndShare,
  onSaveAndShare,
  onClearRecipeToBlank,
  onBackToHome,
}) => {
  const printableSheetRef = useRef<HTMLDivElement>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [showCutGuides, setShowCutGuides] = useState(true);

  const borderStyle = getDocumentBorderStyle(config.borderStyle, config.primaryDocColor);
  const textureClass = getPaperTextureClass(config.paperTexture);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Action Bar */}
      <div className="w-full max-w-[850px] flex flex-wrap items-center justify-between gap-2 mb-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs no-print shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-300/80 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Inicio</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200 text-blue-900">
            <span className="font-bold text-[11px]">
              📄 Formato Hoja Carta · 1 Récipe (Cuadrante 1)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowCutGuides(!showCutGuides)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
              showCutGuides ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <span>✂ Guías de corte</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (onSavePatientOnly) onSavePatientOnly();
              else if (onSaveAndShare) onSaveAndShare(false);
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>💾 Guardar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onDownloadPdfAndShare) onDownloadPdfAndShare();
              else if (onSaveAndShare) onSaveAndShare(true);
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer border border-blue-400/30"
          >
            <Download className="w-3.5 h-3.5 text-blue-200" />
            <span>Descargar PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer border border-emerald-400/30"
            title="Enviar automáticamente el récipe oficial en PDF al paciente por WhatsApp o correo"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-100" />
            <span>⚡ Enviar PDF (WhatsApp)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeRecipe({
                patientName: '',
                patientAge: '',
                patientCI: '',
                patientPhone: '',
                diagnosis: '',
                rp: '',
                indicationsNotes: '',
              });
              if (onClearRecipeToBlank) onClearRecipeToBlank();
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Main Printable Letter Sheet with Recipe in Quadrant 1 */}
      <div className="w-full flex justify-center">
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
          {/* Subtle Cut Lines / Guías de corte centrales en la hoja carta */}
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

          {/* 2x2 Grid representing the Letter sheet */}
          <div className="relative z-10 grid grid-cols-2 grid-rows-2 gap-3.5 h-full min-h-[1040px]">
            {/* Quadrant 1: The Active Recipe */}
            <div
              className="relative rounded-xl p-3.5 flex flex-col justify-between transition-all overflow-hidden bg-white/50 backdrop-blur-[0.5px] border border-blue-500 shadow-sm"
              style={{
                borderWidth: '1.5px',
                borderColor: config.primaryDocColor || '#2563eb',
                minHeight: '490px',
              }}
            >
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

              <div className="absolute top-1.5 right-2 text-[10px] font-bold text-slate-400 no-print flex items-center gap-1 z-20">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  Cuadrante 1
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              </div>

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <DocumentHeader config={config} compact={true} editableInline={false} />

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 py-1 px-1.5 rounded-lg bg-transparent border-0 mb-1 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-700">Pac:</span>
                      <input
                        type="text"
                        value={recipe.patientName}
                        onChange={(e) => onChangeRecipe({ patientName: e.target.value })}
                        placeholder="Paciente"
                        className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none px-0.5 text-slate-900 font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-700">C.I:</span>
                      <input
                        type="text"
                        value={recipe.patientCI || ''}
                        onChange={(e) => onChangeRecipe({ patientCI: e.target.value })}
                        placeholder="Cédula"
                        className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none px-0.5 text-slate-900 font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-700">Tel:</span>
                      <input
                        type="text"
                        value={recipe.patientPhone || ''}
                        onChange={(e) => onChangeRecipe({ patientPhone: e.target.value })}
                        placeholder="Teléfono"
                        className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none px-0.5 text-slate-900"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-700">Edad:</span>
                      <input
                        type="text"
                        value={recipe.patientAge}
                        onChange={(e) => onChangeRecipe({ patientAge: e.target.value })}
                        placeholder="Edad"
                        className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none px-0.5 text-slate-900"
                      />
                    </div>
                    <div className="flex items-center gap-1 col-span-2 border-t border-slate-100/80 pt-1 mt-0.5">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="font-semibold text-slate-700 shrink-0">Dx:</span>
                        <input
                          type="text"
                          value={recipe.diagnosis || ''}
                          onChange={(e) => onChangeRecipe({ diagnosis: e.target.value })}
                          placeholder="Diagnóstico (opcional)"
                          className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none px-0.5 text-slate-900 font-medium truncate"
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0 min-w-[95px]">
                        <span className="font-semibold text-slate-700 shrink-0">Fecha:</span>
                        <input
                          type="text"
                          value={recipe.date}
                          onChange={(e) => onChangeRecipe({ date: e.target.value })}
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
                    </div>

                    <textarea
                      value={recipe.rp}
                      onChange={(e) => onChangeRecipe({ rp: e.target.value })}
                      placeholder="Prescripción e indicaciones del récipe..."
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
                  notesText={recipe.indicationsNotes || config.footerNotesText}
                  onUpdateNotes={(val) => onChangeRecipe({ indicationsNotes: val })}
                  onUpdateConfigField={(field, val) => onUpdateConfig?.({ [field]: val })}
                  editableInline={true}
                />
              </div>
            </div>

            {/* Quadrants 2, 3, 4: Empty Quadrants with Cut Guides */}
            {[2, 3, 4].map((quadrantNum) => (
              <div
                key={`empty-quadrant-${quadrantNum}`}
                className="relative rounded-xl p-4 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-300/80 bg-slate-50/40 min-h-[490px]"
              >
                <div className="no-print flex flex-col items-center">
                  <span className="font-bold text-slate-600 text-xs mb-1">
                    Cuadrante #{quadrantNum} Libre
                  </span>
                  <p className="text-[11px] text-slate-400 max-w-[200px] leading-tight">
                    Espacio disponible en la hoja tamaño carta.
                  </p>
                </div>
                <div className="text-[9px] text-slate-400 font-mono tracking-wider flex items-center gap-1 opacity-70 mt-2">
                  <span>✂ Guía de corte · Espacio libre</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        config={config}
        documentType="recipe"
        patientName={recipe.patientName}
        patientPhone={recipe.patientPhone || ''}
        documentTitle={`Récipe Médico - ${recipe.diagnosis || 'Prescripción'}`}
        contentBody={recipe.rp + (recipe.indicationsNotes ? `\n\nNotas: ${recipe.indicationsNotes}` : '')}
        onUpdatePatientPhone={(phone) => onChangeRecipe({ patientPhone: phone })}
        onTriggerPrintPdf={onPrint}
      />
    </div>
  );
};

export default MasterRecipeView;
