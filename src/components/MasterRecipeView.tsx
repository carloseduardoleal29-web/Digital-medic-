import React, { useRef, useState } from 'react';
import { DoctorConfig, RecipeItem } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { CheckCircle2, MessageSquare, Printer, Download, Save, Trash2, Plus, ArrowLeft, ArrowRight, Scissors, Eye, Mail } from 'lucide-react';

interface MasterRecipeViewProps {
  config: DoctorConfig;
  recipe?: RecipeItem;
  onChangeRecipe: (updated: Partial<RecipeItem>) => void;
  onUpdateConfig?: (updated: Partial<DoctorConfig>) => void;
  isLiveEditing?: boolean;
  onPrint?: () => void;
  onDownloadPdf?: () => void;
  onOpenEmailModal?: () => void;
  onSavePatientOnly?: () => void;
  onDownloadPdfAndShare?: () => void;
  onInstantWhatsApp?: () => void;
  onSaveAndShare?: (shouldDownload?: boolean) => void;
  onOpenSignatureModal?: () => void;
  onClearRecipeToBlank?: () => void;
  onBackToHome?: () => void;
  onSwitchTo4In1?: () => void;
  onOpenPreview?: () => void;
  onNavigateToIndications?: () => void;
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
  onDownloadPdf,
  onOpenEmailModal,
  onSavePatientOnly,
  onDownloadPdfAndShare,
  onInstantWhatsApp,
  onSaveAndShare,
  onClearRecipeToBlank,
  onBackToHome,
  onSwitchTo4In1,
  onOpenPreview,
  onNavigateToIndications,
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
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer text-xs"
            title="Borrar todos los campos y dejar el récipe en blanco"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>🧹 Dejar en Blanco / Borrar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSavePatientOnly) onSavePatientOnly();
              else if (onSaveAndShare) onSaveAndShare(false);
            }}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300"
            title="Guardar paciente en su banco de datos"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
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
              title="Enviar récipe por correo electrónico al paciente"
            >
              <Mail className="w-3.5 h-3.5 text-white" />
              <span>✉️ Enviar por Correo</span>
            </button>
          )}

          {onOpenPreview && (
            <button
              type="button"
              onClick={onOpenPreview}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs cursor-pointer shadow-xs border border-slate-700"
              title="Ver vista previa de cómo saldrá en la hoja carta impresa"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-300" />
              <span>👁️ Vista Previa</span>
            </button>
          )}

          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Imprimir récipe directamente o guardar como PDF del sistema"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>🖨️ Imprimir Récipe</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Single Recipe Sheet */}
      <div className="w-full flex justify-center">
        <div
          ref={printableSheetRef}
          className={`relative w-full max-w-[660px] min-h-[680px] bg-white shadow-xl p-6 sm:p-7 rounded-2xl transition-all print-container recipe-single-container flex flex-col justify-between ${textureClass} ${
            config.enforcePureBlackText ? 'enforce-pure-black' : ''
          }`}
          style={{
            backgroundColor: config.tonePapel || '#ffffff',
            border: borderStyle,
            borderRadius: config.docCornerRadius || '16px',
          }}
        >
          {config.marcaAgua && !config.marcaAgua.includes('DIGITAL') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
              <img
                src={config.marcaAgua}
                alt="Marca de agua"
                className="marca-agua-img"
                style={{
                  opacity: Math.min(config.watermarkOpacity ?? 0.08, 0.12),
                  width: `${Math.min(50, config.watermarkScale || 40)}%`,
                  transform: `rotate(${config.watermarkRotation || 0}deg)`,
                }}
              />
            </div>
          )}

          <div className="relative z-10 flex flex-col justify-between h-full flex-1">
            <div>
              <DocumentHeader
                config={config}
                compact={true}
                hideHeader={false}
                onUpdateField={(field, val) => onUpdateConfig?.({ [field]: val })}
                editableInline={true}
              />

              <div className="flex justify-end mt-2 no-print">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToIndications) {
                      onNavigateToIndications();
                    } else if (onBackToHome) {
                      onBackToHome();
                    }
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continuar con Indicaciones</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Patient Bar */}
              <div 
                className="py-2 px-3 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-3 space-y-2 shadow-2xs text-xs"
                style={{ fontSize: config.patientBarSize || '12px' }}
              >
                {/* Line 1: Paciente y Cédula */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-slate-800 shrink-0">Paciente:</span>
                    <input
                      type="text"
                      value={recipe.patientName}
                      onChange={(e) => onChangeRecipe({ patientName: e.target.value })}
                      placeholder="Nombre y Apellidos del Paciente"
                      className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-slate-800 shrink-0">C.I. / Doc:</span>
                    <input
                      type="text"
                      value={recipe.patientCI || ''}
                      onChange={(e) => onChangeRecipe({ patientCI: e.target.value })}
                      placeholder="V-00.000.000"
                      className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                    />
                  </div>
                </div>

                {/* Line 2: Edad, Teléfono y Fecha */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 items-center">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-slate-800 shrink-0">Edad:</span>
                    <input
                      type="text"
                      value={recipe.patientAge}
                      onChange={(e) => onChangeRecipe({ patientAge: e.target.value })}
                      placeholder="Edad"
                      className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-slate-800 shrink-0">Teléfono:</span>
                    <input
                      type="text"
                      value={recipe.patientPhone || ''}
                      onChange={(e) => onChangeRecipe({ patientPhone: e.target.value })}
                      placeholder="Teléfono"
                      className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-slate-800 shrink-0">Fecha:</span>
                    <input
                      type="text"
                      value={recipe.date}
                      onChange={(e) => onChangeRecipe({ date: e.target.value })}
                      className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900 text-right"
                    />
                  </div>
                </div>

                {/* Line 3: Diagnóstico */}
                <div className="pt-1 border-t border-slate-200/60 flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-slate-800 shrink-0">Dx / Diagnóstico:</span>
                  <input
                    type="text"
                    value={recipe.diagnosis || ''}
                    onChange={(e) => onChangeRecipe({ diagnosis: e.target.value })}
                    placeholder="Diagnóstico médico principal (opcional)"
                    className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Rp Prescription Area */}
              <div className="flex-1 my-3 flex flex-col min-h-[220px]">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className="text-2xl font-black italic"
                    style={{ color: config.rxTitleColor || config.primaryDocColor, fontFamily: "'Playfair Display', serif" }}
                  >
                    {config.rxTitle || 'Rp.'}
                  </span>
                </div>

                <textarea
                  value={recipe.rp}
                  onChange={(e) => onChangeRecipe({ rp: e.target.value })}
                  placeholder="Escriba la prescripción médica, medicamentos, dosis y posología..."
                  className="w-full p-3 text-sm text-slate-900 bg-transparent border border-slate-200/80 rounded-xl focus:border-blue-500 focus:outline-none resize-none leading-relaxed placeholder:text-slate-300 flex-1 min-h-[200px]"
                  style={{
                    fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                    fontSize: config.bodyFontSize || '13px',
                  }}
                />
              </div>
            </div>

            {/* Document Footer */}
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
      </div>
    </div>
  );
};

export default MasterRecipeView;
