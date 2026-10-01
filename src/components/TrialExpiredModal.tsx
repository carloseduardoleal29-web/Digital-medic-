import React from 'react';
import { ShieldAlert, MessageCircle, LogOut, CheckCircle, Sparkles } from 'lucide-react';
import { DoctorConfig } from '../types';

interface TrialExpiredModalProps {
  isOpen: boolean;
  doctor: DoctorConfig;
  onLogout: () => void;
  onRefreshStatus?: () => void;
}

export const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({
  isOpen,
  doctor,
  onLogout,
  onRefreshStatus,
}) => {
  if (!isOpen) return null;

  const whatsappMessage = encodeURIComponent(
    `Hola, soy el Dr(a). ${doctor.doctorName} (C.I: ${doctor.ci}, Correo: ${doctor.email}). Mis 14 días de prueba gratuita en Digital Médic han finalizado y deseo activar mi suscripción a la plataforma. ¿Cuáles son los planes y métodos de pago disponibles?`
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-900/30">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-white mb-2 tracking-wide">
          Período de Prueba Finalizado
        </h2>
        
        <p className="text-sm text-slate-300 font-medium mb-4">
          Estimado(a) <strong className="text-white">{doctor.doctorName}</strong>: sus <span className="text-amber-400 font-bold">14 días de prueba gratuita</span> en Digital Médic han concluido satisfactoriamente.
        </p>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left mb-6 space-y-2.5 text-xs text-slate-300">
          <p className="font-bold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Al activar su membresía oficial usted continuará disfrutando de:</span>
          </p>
          <ul className="space-y-1.5 pl-2 text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Emisión ilimitada de récipes 4 en 1 e individuales con folios correlativos.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Membretes médicos personalizados con sellos y firmas digitales de alta definición.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Historias clínicas, informes médicos y constancias de reposo digitalizadas.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sincronización en la nube y descarga instantánea en PDF.</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={`https://wa.me/?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Contactar al Administrador por WhatsApp</span>
          </a>

          <div className="flex items-center gap-2 pt-1">
            {onRefreshStatus && (
              <button
                type="button"
                onClick={onRefreshStatus}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
              >
                Verificar Activación
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="flex-1 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
