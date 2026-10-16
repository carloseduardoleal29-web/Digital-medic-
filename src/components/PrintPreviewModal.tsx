import React, { useState } from 'react';
import { X, Printer, Eye, ZoomIn, ZoomOut, CheckCircle2, Download } from 'lucide-react';
import { DoctorConfig, RecipeItem } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DoctorConfig;
  recipe: RecipeItem;
  onConfirmPrint: () => void;
  onUpdateRecipe?: (updated: Partial<RecipeItem>) => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  config,
  recipe,
  onConfirmPrint,
  onUpdateRecipe,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [isEditingInline, setIsEditingInline] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    onConfirmPrint();
  };

  const borderStyle = getDocumentBorderStyle(config.borderStyle, config.primaryDocColor);
  const textureClass = getPaperTextureClass(config.paperTexture);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Top Action Bar */}
      <div className="min-h-16 px-3 sm:px-6 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white shrink-0 shadow-lg flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm flex items-center gap-2">
              <span>Vista Previa de Impresión y PDF (Hoja Real)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Fiel al Papel 1:1
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Revise que los datos, sello y márgenes estén perfectos antes de enviar a imprimir
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Toggle Edit Directly in Preview */}
          {onUpdateRecipe && (
            <button
              onClick={() => setIsEditingInline(!isEditingInline)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
                isEditingInline
                  ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
              title="Permite modificar medicamentos o datos del paciente directamente aquí"
            >
              <span>{isEditingInline ? '✎ Modo Edición Activo' : '✎ Editar en Vista Previa'}</span>
            </button>
          )}

          {/* Zoom */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs text-slate-300">
            <button
              onClick={() => setZoom((z) => Math.max(60, z - 10))}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
              title="Reducir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-bold text-xs">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(140, z + 10))}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="px-2 py-1 ml-1 hover:bg-slate-700 rounded-lg text-[10px] font-semibold text-slate-400"
            >
              100%
            </button>
          </div>

          {/* Confirm & Download Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4 text-cyan-200" />
            <span>Descargar / Guardar PDF</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Cerrar vista previa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sheet Canvas Area */}
      <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-slate-950/60">
        <div 
          className="transition-transform origin-top my-4"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Exact Real Paper Sheet */}
          <div
            className={`relative w-full max-w-[640px] min-h-[860px] bg-white shadow-2xl p-4 sm:p-7 transition-all flex flex-col justify-between print-container recipe-single-container ${textureClass}`}
            style={{
              backgroundColor: config.tonePapel || '#ffffff',
              border: borderStyle,
              borderRadius: config.docCornerRadius || '16px',
            }}
          >
            {/* Watermark */}
            {config.marcaAgua && (
              <div
                className="marca-agua"
                style={{
                  backgroundImage: `url(${config.marcaAgua})`,
                  opacity: config.watermarkOpacity,
                  backgroundSize: `${config.watermarkScale || 55}% auto`,
                  transform: `rotate(${config.watermarkRotation || 0}deg)`,
                }}
              />
            )}

            {/* Document Content */}
            <div className="relative z-10 flex flex-col h-full justify-between flex-1">
              
              {/* Header */}
              <div>
                <DocumentHeader config={config} compact={false} editableInline={false} />
                
                {/* Patient Bar with CI, Phone, Age and Date - Clean 2-Line Layout */}
                <div 
                  className="py-2 px-3 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-2.5 space-y-1.5 shadow-2xs"
                  style={{ fontSize: config.patientBarSize || '11.5px' }}
                >
                  {/* Line 1: Paciente y Cédula */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-slate-800 shrink-0">Paciente:</span>
                      {isEditingInline && onUpdateRecipe ? (
                        <input
                          type="text"
                          value={recipe.patientName}
                          onChange={(e) => onUpdateRecipe({ patientName: e.target.value })}
                          placeholder="Nombre del Paciente"
                          className="bg-white px-2 py-0.5 border border-blue-300 rounded font-semibold text-slate-900 w-full outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-semibold text-slate-900 truncate">{recipe.patientName || '—'}</span>
                      )}
                    </div>
                    <div className="min-w-[150px] flex items-center gap-1.5 shrink-0">
                      <span className="font-bold text-slate-800 shrink-0">C.I. / Doc:</span>
                      {isEditingInline && onUpdateRecipe ? (
                        <input
                          type="text"
                          value={recipe.patientCI || ''}
                          onChange={(e) => onUpdateRecipe({ patientCI: e.target.value })}
                          placeholder="C.I."
                          className="bg-white px-2 py-0.5 border border-blue-300 rounded font-semibold text-slate-900 w-full outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-semibold text-slate-900">{recipe.patientCI || '—'}</span>
                      )}
                    </div>
                  </div>

                  {/* Line 2: Edad, Teléfono y Fecha */}
                  <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-200/60 items-center">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-slate-800 shrink-0">Edad:</span>
                      {isEditingInline && onUpdateRecipe ? (
                        <input
                          type="text"
                          value={recipe.patientAge}
                          onChange={(e) => onUpdateRecipe({ patientAge: e.target.value })}
                          placeholder="Edad"
                          className="bg-white px-2 py-0.5 border border-blue-300 rounded font-semibold text-slate-900 w-full outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-semibold text-slate-900">{recipe.patientAge || '—'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-slate-800 shrink-0">Teléfono:</span>
                      {isEditingInline && onUpdateRecipe ? (
                        <input
                          type="text"
                          value={recipe.patientPhone || ''}
                          onChange={(e) => onUpdateRecipe({ patientPhone: e.target.value })}
                          placeholder="Teléfono"
                          className="bg-white px-2 py-0.5 border border-blue-300 rounded font-semibold text-slate-900 w-full outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-semibold text-slate-900">{recipe.patientPhone || '—'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-slate-800 shrink-0">Fecha:</span>
                      {isEditingInline && onUpdateRecipe ? (
                        <input
                          type="text"
                          value={recipe.date}
                          onChange={(e) => onUpdateRecipe({ date: e.target.value })}
                          placeholder="Fecha"
                          className="bg-white px-2 py-0.5 border border-blue-300 rounded font-semibold text-slate-900 w-full outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-semibold text-slate-900">{recipe.date || '—'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                {(recipe.diagnosis || isEditingInline) && (
                  <div className="mb-2 px-1 text-xs flex items-center gap-2">
                    <span className="font-bold text-slate-700 shrink-0">Dx / Diagnóstico:</span>
                    {isEditingInline && onUpdateRecipe ? (
                      <input
                        type="text"
                        value={recipe.diagnosis}
                        onChange={(e) => onUpdateRecipe({ diagnosis: e.target.value })}
                        placeholder="Diagnóstico clínico"
                        className="bg-white px-2 py-0.5 border border-blue-300 rounded text-slate-800 font-medium w-full outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-slate-800 font-medium">{recipe.diagnosis}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Prescription Body (Rp.) */}
              <div className="flex-1 my-2 flex flex-col">
                <div 
                  className="font-bold text-base mb-1 flex items-center gap-2"
                  style={{ 
                    color: config.rxTitleColor || config.primaryDocColor,
                    fontFamily: "'Playfair Display', serif"
                  }}
                >
                  <span className="text-2xl font-black italic">{config.rxTitle || 'Rp.'}</span>
                  {isEditingInline && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-normal">
                      Edite directamente abajo
                    </span>
                  )}
                </div>

                {isEditingInline && onUpdateRecipe ? (
                  <textarea
                    value={recipe.rp}
                    onChange={(e) => onUpdateRecipe({ rp: e.target.value })}
                    rows={10}
                    placeholder="Escriba medicamentos, dosis y posología..."
                    className="w-full flex-1 p-2 border-2 border-blue-400 rounded-lg text-slate-900 font-medium leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-blue-50/20"
                    style={{ fontSize: config.bodyFontSize || '13px' }}
                  />
                ) : (
                  <div
                    className="w-full flex-1 whitespace-pre-wrap leading-relaxed text-slate-800 font-medium"
                    style={{
                      fontSize: config.bodyFontSize || '13px',
                      minHeight: '260px',
                    }}
                  >
                    {recipe.rp || (
                      <span className="italic text-slate-400">
                        Sin medicamentos o indicaciones asignadas todavía.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer with Seal & Stamp */}
              <div className="mt-3">
                <DocumentFooter
                  config={config}
                  compact={false}
                  notesText={recipe.indicationsNotes || config.footerNotesText}
                  editableInline={false}
                />
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
