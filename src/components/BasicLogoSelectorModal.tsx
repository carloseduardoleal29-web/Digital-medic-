import React, { useRef } from 'react';
import { X, Upload, Trash2, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { BASIC_MEDICAL_LOGOS, BasicMedicalLogo } from '../data/defaultAssets';

interface BasicLogoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  side: 'logoIzq' | 'logoDer';
  currentLogo?: string;
  onSelectLogo: (side: 'logoIzq' | 'logoDer', dataUrl: string) => void;
  onRemoveLogo?: (side: 'logoIzq' | 'logoDer') => void;
}

export const BasicLogoSelectorModal: React.FC<BasicLogoSelectorModalProps> = ({
  isOpen,
  onClose,
  side,
  currentLogo,
  onSelectLogo,
  onRemoveLogo
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') {
        onSelectLogo(side, evt.target.result);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const title = side === 'logoIzq' ? 'Logo Médico Izquierdo' : 'Logo Médico Derecho';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">Seleccione un logo médico básico o suba su archivo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Option A: Upload custom logo */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Subir desde mi computadora</span>
                <span className="text-[10px] text-slate-400">Formatos recomendados: PNG, JPG o SVG</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Examinar</span>
            </button>
          </div>

          {/* Option B: Choose from Basic Medical Logos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Logos Médicos Básicos (Listos para usar)
              </span>
              <span className="text-[10px] text-slate-400">1 clic para aplicar</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BASIC_MEDICAL_LOGOS.map((logo: BasicMedicalLogo) => {
                const isSelected = currentLogo === logo.svgDataUri;
                return (
                  <button
                    key={logo.id}
                    onClick={() => {
                      onSelectLogo(side, logo.svgDataUri);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all group relative ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                    <div className="w-14 h-14 rounded-xl bg-white p-2 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <img src={logo.svgDataUri} alt={logo.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                      {logo.name}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {logo.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option C: Remove Logo */}
          {currentLogo && onRemoveLogo && (
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  onRemoveLogo(side);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Quitar logo de este lado</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
