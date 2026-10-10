import React from 'react';
import { X } from 'lucide-react';
import { DoctorOnboardingWizard } from './DoctorOnboardingWizard';
import { DoctorConfig } from '../types';

interface DoctorAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  registeredDoctors: DoctorConfig[];
  onRegisterNewDoctor: (newDoctor: DoctorConfig, autoLogin?: boolean) => void;
  onLoginDoctor: (doctor: DoctorConfig, initialEcosystem?: any) => void;
  onResetAllData?: () => void;
  onContinueAsGuest?: any;
  onOpenAdminPanel?: () => void;
}

export const DoctorAuthModal: React.FC<DoctorAuthModalProps> = ({
  isOpen,
  onClose,
  registeredDoctors,
  onRegisterNewDoctor,
  onLoginDoctor,
  onOpenAdminPanel,
  onContinueAsGuest
}) => {
  if (!isOpen) return null;

  const handleDismissOrGuest = () => {
    if (onClose) {
      onClose();
    } else if (registeredDoctors && registeredDoctors.length > 0) {
      onLoginDoctor(registeredDoctors[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#060c18]/90 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-3 sm:p-6 shadow-2xl relative max-h-[96vh] overflow-y-auto">
        {/* Close / Enter Button */}
        <button
          type="button"
          onClick={handleDismissOrGuest}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-all z-50 border border-slate-700 flex items-center gap-1.5 text-xs font-bold shadow-md"
          title="Cerrar y entrar a la app"
        >
          <span className="hidden sm:inline">Entrar a la App</span>
          <X className="w-4 h-4 text-cyan-300" />
        </button>

        <DoctorOnboardingWizard
          registeredDoctors={registeredDoctors}
          onCompleteOnboarding={onRegisterNewDoctor}
          onLoginDoctor={onLoginDoctor}
          onOpenAdminPanel={onOpenAdminPanel}
          initialViewMode="login"
        />

        {/* Bottom Quick-Access Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">
            ¿Deseas acceder inmediatamente a tus formatos médicos?
          </span>
          <button
            type="button"
            onClick={handleDismissOrGuest}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Continuar al Consultorio Médico ➜</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorAuthModal;
