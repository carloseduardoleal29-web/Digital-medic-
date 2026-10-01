import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, ArrowRight, X, AlertCircle } from 'lucide-react';

interface SecretAdminPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SecretAdminPromptModal: React.FC<SecretAdminPromptModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toUpperCase();

    // Accepted Administrator Master Passwords:
    if (clean === 'ADMIN2026' || clean === '2534' || clean === 'ADMIN' || clean === 'DIGITALMEDIC2026') {
      setErrorMsg(false);
      setPasscode('');
      onSuccess();
    } else {
      setErrorMsg(true);
      setPasscode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 modal-overlay animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-slate-100 w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-white">Acceso a Administración Central</h3>
          <p className="text-xs text-slate-400 mt-1">
            Módulo restringido. Ingrese la clave maestra de Administrador:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                autoFocus
                required
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setErrorMsg(false);
                }}
                placeholder="Clave maestra..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500 text-center tracking-widest placeholder:tracking-normal placeholder:text-slate-600"
              />
            </div>
            {errorMsg && (
              <p className="text-[11px] text-rose-400 font-semibold text-center mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Clave incorrecta. Acceso denegado.</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Verificar e Ingresar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
