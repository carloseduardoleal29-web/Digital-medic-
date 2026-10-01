import React, { useState } from 'react';
import { Palette, Crown, Lock, Key, ArrowRight, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface SubscriptionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlans: () => void;
  onUnlockWithPin: () => void;
}

export const SubscriptionRequiredModal: React.FC<SubscriptionRequiredModalProps> = ({
  isOpen,
  onClose,
  onOpenPlans,
  onUnlockWithPin,
}) => {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '2534' || pinInput.trim().toUpperCase() === 'ADMIN2026') {
      setPinError(false);
      onUnlockWithPin();
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4 modal-overlay animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-slate-100 w-full max-w-md relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Palette className="w-7 h-7" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Exclusivo para Suscriptores</span>
          </div>

          <h3 className="font-black text-lg text-white">Estudio de Diseño PRO</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Para ingresar al editor de diseño (personalización de tipografías, formato de membretes, logos y colores de récipe) se requiere una <strong className="text-amber-200">Suscripción Activa</strong>.
          </p>
        </div>

        {!showPinInput ? (
          <div className="space-y-3 relative z-10">
            <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/80 text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2 text-white font-bold">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>¿Qué incluye el Estudio de Diseño PRO?</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                <li>Personalización completa de membrete y encabezados</li>
                <li>Digitalización oficial de firma y sello médico</li>
                <li>Subida de logotipos propios y marca de agua institucional</li>
                <li>Elección libre de tipografías y paletas cromáticas</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenPlans();
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Ver Planes y Activar Suscripción</span>
              </button>

              <button
                onClick={() => setShowPinInput(true)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ya tengo mi PIN de Desbloqueo</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerifyPin} className="space-y-3 relative z-10">
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Ingrese su PIN de Seguridad de Diseño (PIN 2534):
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  autoFocus
                  required
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="PIN..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white text-center tracking-widest focus:outline-none focus:border-indigo-400"
                />
              </div>
              {pinError && (
                <p className="text-[10px] text-rose-400 font-semibold mt-1.5 text-center">
                  PIN incorrecto. Ingrese el PIN autorizado (2534) o contacte a administración.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPinInput(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Volver
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Desbloquear</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
