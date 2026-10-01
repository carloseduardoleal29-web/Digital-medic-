import React from 'react';
import { DoctorConfig } from '../types';
import { 
  EyeOff, 
  Sparkles, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';

interface BlankRecipeWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DoctorConfig;
  onNavigateToRecipes?: () => void;
}

export const BlankRecipeWelcomeModal: React.FC<BlankRecipeWelcomeModalProps> = ({
  isOpen,
  onClose,
  config,
  onNavigateToRecipes
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-4 sm:p-6 text-slate-100 shadow-2xl relative my-auto max-h-[94vh] flex flex-col">
        
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Registro Exitoso · Récipe Armado</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Así quedó su Récipe Médico en Blanco</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hemos armado su formato oficial con los datos, membrete, sello y firma que nos proporcionó.
            </p>
          </div>

          {/* Prominent "Ocultar vista" button */}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 shrink-0 self-end sm:self-auto"
          >
            <EyeOff className="w-4 h-4" />
            <span>Ocultar Vista y Entrar</span>
          </button>
        </div>

        {/* Scrollable Prescription Preview Area */}
        <div className="overflow-y-auto py-4 px-1 flex-1 flex justify-center">
          {/* Physical White Paper Prescription Sheet (A5 Ratio) */}
          <div 
            className="w-full max-w-[560px] bg-white text-slate-900 rounded-2xl shadow-xl p-5 sm:p-7 border border-slate-200 relative flex flex-col justify-between min-h-[580px] select-none"
            style={{
              fontFamily: config.fuenteHeader || "'Roboto', sans-serif"
            }}
          >
            {/* Watermark in background */}
            {config.marcaAgua && (
              <div 
                className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 overflow-hidden"
              >
                <img 
                  src={config.marcaAgua} 
                  alt="Marca de agua" 
                  className="w-48 h-48 object-contain"
                />
              </div>
            )}

            {/* 1. Header (Membrete del Médico) */}
            <DocumentHeader 
              config={config} 
              compact={false} 
              editableInline={false} 
            />

            {/* 2. Patient Demographics Blank Fields */}
            <div className="border border-slate-200 bg-slate-50/70 rounded-xl p-2.5 my-2 text-xs space-y-1 text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900">Paciente:</span>{' '}
                  <span className="text-slate-400 italic">___________________________________</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Edad:</span>{' '}
                  <span className="text-slate-400 italic">______</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">C.I:</span>{' '}
                  <span className="text-slate-400 italic">____________</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 border-t border-slate-200/60">
                <span><strong>Fecha de Consulta:</strong> {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date())}</span>
                <span><strong>Diagnóstico:</strong> _____________________________</span>
              </div>
            </div>

            {/* 3. Prescription Blank Body */}
            <div className="my-3 flex-1 flex flex-col relative min-h-[170px]">
              {/* Rp. Title */}
              <div 
                className="text-2xl font-black font-serif italic mb-2 select-none"
                style={{ color: config.rxTitleColor || config.primaryDocColor || '#2563eb' }}
              >
                {config.rxTitle || 'Rp.'}
              </div>

              {/* Lined prescription ready-to-write area */}
              <div className="space-y-3 flex-1">
                <div className="border-b border-dashed border-slate-200 h-6 flex items-center">
                  <span className="text-[11px] text-slate-400 italic font-mono">1. Medicamento, concentración, presentación y vía...</span>
                </div>
                <div className="border-b border-dashed border-slate-200 h-6 flex items-center pl-4">
                  <span className="text-[10px] text-slate-300 italic font-mono">↳ Posología: Tomar cada X horas durante Y días...</span>
                </div>
                <div className="border-b border-dashed border-slate-200 h-6"></div>
                <div className="border-b border-dashed border-slate-200 h-6"></div>
                <div className="border-b border-dashed border-slate-200 h-6"></div>
              </div>

              {/* Watermarked reminder message */}
              <div className="mt-2 text-center text-[10px] text-slate-400 font-medium">
                (Formato médico listo y habilitado para redactar prescripciones)
              </div>
            </div>

            {/* 4. Footer with Official Stamp and Signature */}
            <DocumentFooter 
              config={config} 
              compact={false} 
              editableInline={false} 
            />
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Membrete válido para récipes impresos y envíos por WhatsApp.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <EyeOff className="w-4 h-4" />
              <span>Ocultar Vista y Continuar a mi Portal</span>
            </button>
            
            {onNavigateToRecipes && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToRecipes();
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto border border-slate-700"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Emitir Récipe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
