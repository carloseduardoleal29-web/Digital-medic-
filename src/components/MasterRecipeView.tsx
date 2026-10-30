import React, { useRef, useState } from 'react';
import { DoctorConfig, RecipeItem } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { exportAndSendWhatsAppBusiness, exportElementAsPDF, buildDocumentPdfFilename, exportElementAsImage } from '../utils/exportDocument';
import { CheckCircle2, MessageSquare, Printer, Download, Save, Trash2, Plus, ArrowLeft, ArrowRight, Scissors, Eye, Mail, Camera } from 'lucide-react';

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
      {/* Minimalist Floating / Top Toolbar */}
      <div className="w-full max-w-[850px] flex items-center justify-between gap-3 mb-3 bg-slate-900 text-white px-4 py-2.5 rounded-2xl border border-slate-800 text-xs no-print shadow-xl">
        <div className="flex items-center gap-2">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>Inicio</span>
            </button>
          )}
          <span className="font-bold text-xs text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-800">💊 Récipe</span>
          {onNavigateToIndications && (
            <button
              type="button"
              onClick={onNavigateToIndications}
              className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-900 text-slate-300 hover:text-indigo-200 font-bold rounded-lg border border-slate-700 hover:border-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
              title="Ir a Hoja de Indicaciones"
            >
              <span>🕐 Indicaciones</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              if (onDownloadPdf) {
                onDownloadPdf();
              } else {
                const el = printableSheetRef.current || document.getElementById('recipe-medico') || document.getElementById('recibo-medico');
                const filename = buildDocumentPdfFilename('Récipe', recipe.patientName || 'Carlos Pérez', recipe.date || new Date().toLocaleDateString('es-VE'));
                await exportElementAsPDF(el, filename, {
                  nombrePaciente: recipe.patientName,
                  cedulaPaciente: recipe.patientCI,
                  edadPaciente: recipe.patientAge,
                  fecha: recipe.date,
                  telefonoPaciente: recipe.patientPhone,
                  diagnostico: recipe.diagnosis,
                  textoRp: recipe.rp,
                  textoIndicaciones: recipe.indicationsNotes,
                  nombreMedico: config.doctorName,
                  especialidad: config.specialty,
                  mpps: config.mpps,
                  cm: config.ci || config.collegeNumber,
                  primaryColor: config.primaryDocColor,
                  logoIzq: config.logoIzq,
                  logoDer: config.logoDer,
                  marcaAgua: config.marcaAgua,
                  selloBase64: config.selloImg,
                  firmaBase64: config.firmaImg,
                });
              }
            }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer border border-blue-400/40"
            title="Descargar PDF"
          >
            <span>📥 Descargar PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const treatment = [
                recipe.rp?.trim(),
                recipe.indicationsNotes?.trim(),
              ].filter(Boolean).join('\n\n');

              exportAndSendWhatsAppBusiness({
                element: printableSheetRef.current,
                patientName: recipe.patientName || 'Carlos Pérez',
                documentTitle: 'Récipe Médico',
                dateStr: recipe.date || new Date().toLocaleDateString('es-VE'),
                patientPhone: recipe.patientPhone,
                doctorName: config.doctorName || 'Dr. Carlos Leal',
                treatmentDetails: treatment,
                documentType: 'recipe',
              });
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer border border-emerald-400/40"
            title="Enviar por WhatsApp"
          >
            <span>📱 WhatsApp</span>
          </button>

          {onOpenEmailModal && (
            <button
              type="button"
              onClick={onOpenEmailModal}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer border border-indigo-400/40"
              title="Enviar por Correo"
            >
              <span>✉️ Correo</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Single Recipe Sheet */}
      <div className="w-full flex justify-center">
        <div
          ref={printableSheetRef}
          id="recipe-medico"
          data-testid="recibo-medico"
          className={`relative w-full max-w-[660px] min-h-[680px] bg-white shadow-xl p-6 sm:p-7 rounded-2xl transition-all print-container recipe-single-container flex flex-col justify-between ${textureClass} ${
            config.enforcePureBlackText ? 'enforce-pure-black' : ''
          } preview-mode`}
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
                  opacity: config.watermarkOpacity ?? 0.16,
                  width: `${config.watermarkScale || 50}%`,
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
                className="py-1.5 px-3 bg-slate-50/30 border border-slate-200/60 rounded-xl mb-3 space-y-1.5 text-xs"
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
