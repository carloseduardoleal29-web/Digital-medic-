import React, { useState, useEffect } from 'react';
import { DoctorConfig, SingleRecipeData } from '../types';
import { 
  Sparkles, 
  CheckCircle2,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';

interface BlankRecipeWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DoctorConfig;
  recipe?: SingleRecipeData;
  onNavigateToRecipes?: () => void;
}

export const BlankRecipeWelcomeModal: React.FC<BlankRecipeWelcomeModalProps> = ({
  isOpen,
  onClose,
  config,
  recipe,
  onNavigateToRecipes
}) => {
  const [zoom, setZoom] = useState<number>(100);

  // Auto-calculate fit zoom scale on open based on screen width
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const w = window.innerWidth;
      if (w < 600) {
        const fitScale = Math.floor(((w - 32) / 540) * 100);
        setZoom(Math.min(100, Math.max(45, fitScale)));
      } else {
        setZoom(100);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const borderStyle = getDocumentBorderStyle(config.borderStyle, config.primaryDocColor);
  const textureClass = getPaperTextureClass(config.paperTexture);
  const todayFormatted = new Intl.DateTimeFormat('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).format(new Date());

  const displayDate = (recipe?.date && recipe.date !== '14/10/26') ? recipe.date : todayFormatted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-3 sm:p-6 text-slate-100 shadow-2xl relative my-auto max-h-[96vh] flex flex-col">
        
        {/* Top Header Banner with Zoom Controls & Exit Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 mb-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Vista Previa del Formato Oficial</span>
            </div>
            <h2 className="text-sm sm:text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Así queda su Récipe Médico</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(40, z - 10))}
                className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                title="Alejar"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono font-black text-[11px] text-slate-200">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(130, z + 10))}
                className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                title="Acercar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 600) {
                    setZoom(Math.floor(((window.innerWidth - 32) / 540) * 100));
                  } else {
                    setZoom(100);
                  }
                }}
                className="px-1.5 py-0.5 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-cyan-400 ml-0.5"
                title="Ajustar a la pantalla del teléfono"
              >
                Fit
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Salir de la vista previa"
            >
              <X className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* Scrollable Prescription Preview Area with Zero-Coordinate Transform Scale Auto-Fit */}
        <div className="overflow-x-auto overflow-y-auto py-2 px-1 flex-1 flex justify-center items-start min-h-[320px] touch-pan-x touch-pan-y">
          {(() => {
            const scale = zoom / 100;
            const docW = 540;
            const docH = 680;
            const scaledW = Math.round(docW * scale);
            const scaledH = Math.round(docH * scale);

            return (
              <div 
                className="relative mx-auto shrink-0 select-none transition-all duration-150"
                style={{
                  width: `${scaledW}px`,
                  height: `${scaledH}px`,
                }}
              >
                <div 
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: `${docW}px`,
                    transform: `scale(${scale})`,
                    WebkitTransform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {/* Physical White Paper Prescription Sheet */}
                  <div 
                    className={`w-[540px] max-w-[540px] text-slate-900 shadow-2xl p-4 sm:p-6 relative flex flex-col justify-between min-h-[680px] select-none ${textureClass} ${
                      config.enforcePureBlackText ? 'enforce-pure-black' : ''
                    }`}
              style={{
                backgroundColor: config.tonePapel || '#ffffff',
                border: borderStyle,
                borderRadius: config.docCornerRadius || '16px',
                fontFamily: config.fuenteHeader || "'Roboto', sans-serif"
              }}
            >
            {/* Watermark in background */}
            {config.marcaAgua && !config.marcaAgua.includes('DIGITAL') && (
              <div 
                className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 overflow-hidden z-0"
              >
                <img 
                  src={config.marcaAgua} 
                  alt="Marca de agua" 
                  className="w-48 h-48 object-contain"
                />
              </div>
            )}

            {/* 1. Header (Membrete del Médico) */}
            <div className="mb-2">
              <DocumentHeader 
                config={config} 
                compact={true} 
                editableInline={false} 
              />
            </div>

            {/* 2. Patient Demographics Fields */}
            <div className="border border-slate-200 bg-slate-50/80 rounded-xl p-2.5 my-2 text-xs space-y-1.5 text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-[160px]">
                  <span className="font-bold text-slate-900 shrink-0">Paciente:</span>{' '}
                  <span className="text-slate-900 font-bold truncate">
                    {recipe?.patientName || <span className="text-slate-400 font-normal italic">___________________________________</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-slate-900 shrink-0">Edad:</span>{' '}
                  <span className="text-slate-900 font-bold">
                    {recipe?.patientAge || <span className="text-slate-400 font-normal italic">______</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-slate-900 shrink-0">C.I.:</span>{' '}
                  <span className="text-slate-900 font-bold">
                    {recipe?.patientCI || <span className="text-slate-400 font-normal italic">____________</span>}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/70 text-xs">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-slate-900 shrink-0">Fecha:</span>{' '}
                  <span className="text-slate-900 font-bold">
                    {displayDate}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-1 min-w-[150px]">
                  <span className="font-bold text-slate-900 shrink-0">Diagnóstico:</span>{' '}
                  <span className="text-slate-800 font-medium truncate">
                    {recipe?.diagnosis || <span className="text-slate-400 font-normal italic">_____________________________</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Prescription Body */}
            <div className="my-3 flex-1 flex flex-col relative min-h-[160px]">
              {/* Rp. Title */}
              <div 
                className="text-2xl font-black font-serif italic mb-2 select-none"
                style={{ color: config.rxTitleColor || config.primaryDocColor || '#2563eb' }}
              >
                {config.rxTitle || 'Rp.'}
              </div>

              {recipe?.rp && recipe.rp.trim().length > 0 ? (
                <div 
                  className="whitespace-pre-wrap font-semibold text-slate-900 leading-relaxed text-xs sm:text-sm py-1 flex-1"
                  style={{ fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif" }}
                >
                  {recipe.rp}
                </div>
              ) : (
                /* Lined prescription ready-to-write area */
                <div className="space-y-3 flex-1">
                  <div className="border-b border-dashed border-slate-200 h-6 flex items-center">
                    <span className="text-[11px] text-slate-400 italic font-mono">1. Medicamento, concentración, presentación y vía...</span>
                  </div>
                  <div className="border-b border-dashed border-slate-200 h-6 flex items-center pl-4">
                    <span className="text-[10px] text-slate-300 italic font-mono">↳ Posología: Tomar cada X horas durante Y días...</span>
                  </div>
                  <div className="border-b border-dashed border-slate-200 h-6"></div>
                  <div className="border-b border-dashed border-slate-200 h-6"></div>
                </div>
              )}

              {/* Watermarked reminder message */}
              <div className="mt-2 text-center text-[10px] text-slate-400 font-medium">
                (Formato médico oficial listo para emitir)
              </div>
            </div>

            {/* 4. Footer with Official Stamp and Signature */}
            <div className="pt-2 border-t border-slate-200">
              <DocumentFooter 
                config={config} 
                compact={true} 
                editableInline={false} 
              />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
