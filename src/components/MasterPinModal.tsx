import React, { useState } from 'react';
import { Palette, KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MasterPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MasterPinModal: React.FC<MasterPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pin === '2534') {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setError(false);
      if (next.length === 4) {
        if (next === '2534') {
          setError(false);
          setPin('');
          onSuccess();
        } else {
          setError(true);
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 modal-overlay animate-in fade-in duration-150 no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 text-center text-slate-800 relative">
        
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3 border-2 border-white ring-4 ring-indigo-50">
          <Palette className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
          <span>👑 Exclusivo Plan PRO & Administrador</span>
        </div>

        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Estudio de Diseño PRO
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
          Edite a su gusto todo: <strong>letras, formatos de récipes, colores, logos y membretes</strong>. Inserte su PIN de 4 dígitos de activación para desbloquear el acceso.
        </p>

        {/* PIN Indicators (4 Dots) */}
        <div className="flex justify-center items-center gap-3.5 mb-4">
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                  filled
                    ? 'bg-blue-600 border-blue-600 scale-110 shadow-sm'
                    : 'border-slate-300 bg-slate-100'
                } ${error ? 'border-rose-500 bg-rose-100' : ''}`}
              >
                {filled && <span className="w-2 h-2 rounded-full bg-white"></span>}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-bold mb-3 bg-rose-50 py-1.5 px-3 rounded-xl border border-rose-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Clave incorrecta. Intente de nuevo.</span>
          </div>
        )}

        {/* Input Form with OK Button */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(val);
                setError(false);
                if (val.length === 4) {
                  if (val === '2534') {
                    setError(false);
                    setPin('');
                    onSuccess();
                  } else {
                    setError(true);
                    setPin('');
                  }
                }
              }}
              placeholder="••••"
              className="flex-1 text-center tracking-[0.5em] text-2xl font-black py-2.5 px-3 border border-slate-300 rounded-2xl focus:border-blue-600 focus:outline-none bg-slate-50 shadow-inner"
              autoFocus
            />

            <button
              type="submit"
              disabled={pin.length < 4}
              className={`px-5 py-2.5 rounded-2xl font-black text-sm tracking-wider transition-all shadow-md ${
                pin.length === 4
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 scale-102 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              OK
            </button>
          </div>
        </form>

        {/* Numeric keypad (0-9 + Borrar + OK) */}
        <div className="grid grid-cols-3 gap-2 max-w-[250px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleDigit(n)}
              className="h-12 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 active:scale-95 text-slate-800 font-bold text-lg rounded-2xl transition-all border border-slate-200/80 shadow-2xs"
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-bold text-xs rounded-2xl transition-all border border-slate-200/80"
          >
            Borrar
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 active:scale-95 text-slate-800 font-bold text-lg rounded-2xl transition-all border border-slate-200/80 shadow-2xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="h-12 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-sm rounded-2xl transition-all shadow-md shadow-blue-500/20"
          >
            OK
          </button>
        </div>

        {/* Security Note */}
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <KeyRound className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>Ingrese el PIN de seguridad proporcionado con su suscripción PRO</span>
        </div>

      </div>
    </div>
  );
};
