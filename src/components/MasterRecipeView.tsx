import React, { useState, useRef } from 'react';
import { DoctorConfig, RecipeItem } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { EmailShareModal } from './EmailShareModal';
import { PrintPreviewModal } from './PrintPreviewModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { Copy, Check, MessageSquare, Mail, ZoomIn, ZoomOut, Maximize2, Sparkles, Printer, Eye, Trash2, Save, Download } from 'lucide-react';

interface MasterRecipeViewProps {
  config: DoctorConfig;
  recipe: RecipeItem;
  onChangeRecipe: (updated: Partial<RecipeItem>) => void;
  onUpdateConfig?: (updated: Partial<DoctorConfig>) => void;
  isLiveEditing?: boolean;
  onPrint?: () => void;
  onSavePatientOnly?: () => void;
  onDownloadPdfAndShare?: () => void;
  onSaveAndShare?: (shouldDownload?: boolean) => void;
  onOpenSignatureModal?: () => void;
  onClearRecipeToBlank?: () => void;
}

export const MasterRecipeView: React.FC<MasterRecipeViewProps> = ({
  config,
  recipe,
  onChangeRecipe,
  onUpdateConfig,
  isLiveEditing = false,
  onPrint,
  onSavePatientOnly,
  onDownloadPdfAndShare,
  onSaveAndShare,
  onOpenSignatureModal,
  onClearRecipeToBlank,
}) => {
  const printableSheetRef = useRef<HTMLDivElement>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [cleanViewMode, setCleanViewMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleCopyRp = () => {
    navigator.clipboard.writeText(recipe.rp || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const borderStyle = getDocumentBorderStyle(config.borderStyle, config.primaryDocColor);
  const textureClass = getPaperTextureClass(config.paperTexture);

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Action & Zoom Bar (hidden in print) */}
      <div className="w-full max-w-[660px] flex flex-wrap items-center justify-between gap-2 mb-3 bg-white p-2.5 rounded-xl border border-slate-200 text-xs shadow-2xs no-print">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            {isLiveEditing ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Vista Real de Récipe (Editor Activo)</span>
              </>
            ) : (
              <span>Récipe Individual Médico</span>
            )}
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            · {config.doctorName || 'Dr. Médico'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Zoom controls for comfortable inspection */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 mr-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Reducir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1 text-slate-700 min-w-[34px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1 hover:bg-white rounded text-slate-500 hover:text-blue-600 transition-colors text-[10px] font-semibold"
              title="Restablecer 100%"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleCopyRp}
            className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium flex items-center gap-1 transition-colors"
            title="Copiar texto de prescripción al portapapeles"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          {/* Letter size controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium px-1">Letra Rp:</span>
            <button
              onClick={() => {
                const current = parseInt(config.bodyFontSize || '13.5px', 10) || 13;
                onUpdateConfig?.({ bodyFontSize: `${Math.max(10, current - 1)}px` });
              }}
              className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border rounded text-[10px] font-bold text-slate-700"
              title="Reducir tamaño de letra del récipe"
            >
              A-
            </button>
            <button
              onClick={() => {
                const current = parseInt(config.bodyFontSize || '13.5px', 10) || 13;
                onUpdateConfig?.({ bodyFontSize: `${Math.min(22, current + 1)}px` });
              }}
              className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border rounded text-[10px] font-bold text-slate-700"
              title="Aumentar tamaño de letra del récipe"
            >
              A+
            </button>
          </div>

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
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300"
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
              className="px-3 py-1 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer border border-blue-400/30"
              title="Descargar PDF del documento y luego abrir opciones de envío"
            >
              <Download className="w-3.5 h-3.5 text-blue-200" />
              <span>Descargar PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="px-3 py-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black rounded-xl text-xs shadow-sm hover:shadow flex items-center gap-1.5 transform active:scale-95 transition-all cursor-pointer border border-emerald-400/30"
              title="Enviar por WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-100" />
              <span>WhatsApp 💬</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEmailModalOpen(true)}
              className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-black rounded-xl text-xs shadow-sm hover:shadow flex items-center gap-1.5 transform active:scale-95 transition-all cursor-pointer border border-indigo-400/30"
              title="Enviar por Correo Electrónico"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-100" />
              <span>Correo ✉️</span>
            </button>
          </div>

          {/* Botón Rojo: Dejar Récipe en Blanco */}
          <button
            type="button"
            onClick={() => {
              // Limpiar datos del paciente y prescripción inmediatamente
              onChangeRecipe({
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
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer border border-rose-500 text-xs"
            title="Dejar el récipe completamente en blanco para un nuevo paciente (limpia nombre, cédula, edad y Rp)"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>Dejar Récipe en Blanco</span>
          </button>

          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
            title="Abrir Vista Previa Fiel 1:1 de Impresión y PDF antes de imprimir"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Vista Previa</span>
          </button>


        </div>
      </div>

      {/* Live Editor Guidance Tip & Clean Mode Toggle */}
      {isLiveEditing && (
        <div className="w-full max-w-[660px] mb-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-[11px] text-blue-900 font-medium no-print">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>
              {cleanViewMode
                ? 'Modo Hoja Limpia activo (sin guías de edición). Haga clic en el botón de la derecha para volver a editar.'
                : 'Edite en tiempo real haciendo clic sobre los textos, logos, membretes o firma directamente en esta hoja.'}
            </span>
          </div>
          <button
            onClick={() => setCleanViewMode(!cleanViewMode)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors shrink-0 ml-2 ${
              cleanViewMode
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            {cleanViewMode ? '✎ Modo Edición' : '👁 Vista Hoja Limpia'}
          </button>
        </div>
      )}

      {/* Main Printable Prescription Sheet with Zoom Scale */}
      <div 
        className="w-full flex justify-center transition-transform origin-top"
        style={{ transform: `scale(${zoomLevel / 100})` }}
      >
        <div
          ref={printableSheetRef}
          className={`relative w-full max-w-[640px] min-h-[850px] shadow-2xl p-7 transition-all print-container recipe-single-container flex flex-col justify-between ${textureClass} ${
            config.enforcePureBlackText ? 'enforce-pure-black' : ''
          }`}
          style={{
            backgroundColor: config.tonePapel || '#ffffff',
            border: borderStyle,
            borderRadius: config.docCornerRadius || '16px',
          }}
        >
          {/* Watermark with custom scale, opacity and rotation */}
          {config.marcaAgua && (
            <div className="marca-agua">
              <img
                src={config.marcaAgua}
                alt="Marca de agua"
                className="marca-agua-img"
                style={{
                  opacity: config.watermarkOpacity ?? 0.12,
                  width: `${config.watermarkScale || 55}%`,
                  transform: `rotate(${config.watermarkRotation || 0}deg)`,
                }}
              />
            </div>
          )}

          {/* Content Container */}
          <div className="relative z-10 flex flex-col h-full flex-1">
            
            {/* Header (Membrete, Logos y Clínicas) */}
            <DocumentHeader
              config={config}
              compact={false}
              editableInline={isLiveEditing}
              onUpdateField={(field, val) => onUpdateConfig?.({ [field]: val })}
              onUploadLogo={(side, dataUrl) => onUpdateConfig?.({ [side]: dataUrl })}
            />

            {/* Patient Data Bar - Clean 2-Line Layout with ample spacing */}
            <div 
              className="py-1 px-2 bg-transparent border-0 mb-1.5 transition-colors space-y-1"
              style={{ fontSize: config.patientBarSize || '12px' }}
            >
              {/* Line 1: Paciente y Cédula */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-slate-800 shrink-0">Paciente:</span>
                  <input
                    type="text"
                    value={recipe.patientName}
                    onChange={(e) => onChangeRecipe({ patientName: e.target.value })}
                    placeholder="Nombre y Apellidos del Paciente"
                    className="flex-1 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900 min-w-[150px]"
                  />
                </div>
                <div className="w-full sm:w-auto sm:min-w-[170px] flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-slate-800 shrink-0">C.I. / Doc:</span>
                  <input
                    type="text"
                    value={recipe.patientCI || ''}
                    onChange={(e) => onChangeRecipe({ patientCI: e.target.value })}
                    placeholder="V-00.000.000"
                    className="flex-1 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Line 2: Edad, Teléfono y Fecha (Responsive columns to prevent cutoff on mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-1 border-t border-slate-200/60 items-center">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-slate-800 shrink-0">Edad:</span>
                  <input
                    type="text"
                    value={recipe.patientAge}
                    onChange={(e) => onChangeRecipe({ patientAge: e.target.value })}
                    placeholder="35 años"
                    className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                  />
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-slate-800 shrink-0">Teléfono:</span>
                  <input
                    type="text"
                    value={recipe.patientPhone || ''}
                    onChange={(e) => onChangeRecipe({ patientPhone: e.target.value })}
                    placeholder="+58 414-0000000"
                    className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                  />
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-slate-800 shrink-0">Fecha:</span>
                  <input
                    type="text"
                    value={recipe.date}
                    onChange={(e) => onChangeRecipe({ date: e.target.value })}
                    placeholder="Fecha"
                    className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Diagnosis Row */}
            <div className="mb-3 px-1 text-xs flex items-center gap-2">
              <span className="font-bold text-slate-700 shrink-0">Dx / Diagnóstico:</span>
              <input
                type="text"
                value={recipe.diagnosis}
                onChange={(e) => onChangeRecipe({ diagnosis: e.target.value })}
                placeholder="Diagnóstico clínico (opcional)"
                className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none text-slate-800 font-medium"
              />
            </div>

            {/* Prescription Body Rp. */}
            <div className="flex-1 flex flex-col my-1">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    contentEditable={isLiveEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateConfig?.({ rxTitle: e.currentTarget.innerText })}
                    className={`text-2xl font-black italic tracking-wide select-none outline-none ${
                      isLiveEditing ? 'hover:bg-blue-50/70 hover:ring-1 hover:ring-blue-300 rounded px-1 cursor-text' : ''
                    }`}
                    style={{
                      color: config.rxTitleColor || config.primaryDocColor,
                      fontFamily: "'Playfair Display', serif",
                    }}
                    title="Haga clic para editar símbolo de prescripción (Rp., Rx, etc.)"
                  >
                    {config.rxTitle || 'Rp.'}
                  </span>
                  <span className="text-[10.5px] text-slate-400 italic">
                    (Indicaciones médicas)
                  </span>
                </div>

                {recipe.rp && (
                  <button
                    type="button"
                    onClick={() => onChangeRecipe({ rp: '' })}
                    className="no-print px-2 py-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Borrar indicaciones Rp"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Borrar Rp</span>
                  </button>
                )}
              </div>

              <textarea
                value={recipe.rp}
                onChange={(e) => onChangeRecipe({ rp: e.target.value })}
                placeholder="Escriba aquí los medicamentos prescritos, dosis, posología y duración del tratamiento...&#10;O utilice el 'Banco de Fármacos' de la barra superior para insertarlos rápidamente con un clic."
                className="w-full flex-1 min-h-[300px] p-3 text-slate-900 bg-transparent border border-slate-200/80 rounded-xl focus:border-blue-500 focus:outline-none resize-none leading-relaxed placeholder:text-slate-300 font-sans shadow-2xs"
                style={{
                  fontSize: config.bodyFontSize || '13.5px',
                  fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                }}
              />
            </div>

            {/* Footer */}
            <div className="mt-3">
              <DocumentFooter
                config={config}
                compact={false}
                notesText={recipe.indicationsNotes || config.footerNotesText}
                onUpdateNotes={(val) => onChangeRecipe({ indicationsNotes: val })}
                onUpdateConfigField={(field, val) => onUpdateConfig?.({ [field]: val })}
                onUploadStamp={(dataUrl) => onUpdateConfig?.({ selloFirma: dataUrl })}
                editableInline={true}
                onOpenSignatureModal={onOpenSignatureModal}
              />
            </div>

          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        config={config}
        documentType="recipe"
        patientName={recipe.patientName}
        patientPhone={recipe.patientPhone || ''}
        documentTitle={recipe.diagnosis || 'Récipe Médico'}
        contentBody={recipe.rp}
        onUpdatePatientPhone={(phone) => onChangeRecipe({ patientPhone: phone })}
        onTriggerPrintPdf={onPrint}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
      />

      {/* Email Modal */}
      <EmailShareModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        config={config}
        documentType="recipe"
        patientName={recipe.patientName}
        patientEmail={recipe.patientEmail || ''}
        documentTitle={recipe.diagnosis || 'Récipe Médico'}
        contentBody={recipe.rp}
        onTriggerPrintPdf={onPrint}
      />

      {/* Real Sheet Print Preview Modal */}
      <PrintPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        config={config}
        recipe={recipe}
        onConfirmPrint={onPrint || (() => window.print())}
        onUpdateRecipe={onChangeRecipe}
      />

    </div>
  );
};
