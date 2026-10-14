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
  registeredDoctors,
  onRegisterNewDoctor,
  onLoginDoctor,
  onOpenAdminPanel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#060c18]/95 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-3 sm:p-6 shadow-2xl relative max-h-[96vh] overflow-y-auto">
        {/* Security Header Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/30">
              🔒
            </span>
            <div>
              <span className="font-black text-white block text-xs">
                Acceso Confidencial Seguro · Digital Médic
              </span>
              <span className="text-[11px] text-blue-200/90 font-medium">
                Por confidencialidad médica y resguardo de datos sensibles de pacientes, ingrese su correo y clave.
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 font-mono text-[10px] border border-blue-500/20 font-bold shrink-0">
            SSL 256-Bit Encrypted
          </span>
        </div>

        <DoctorOnboardingWizard
          registeredDoctors={registeredDoctors}
          onCompleteOnboarding={onRegisterNewDoctor}
          onLoginDoctor={onLoginDoctor}
          onOpenAdminPanel={onOpenAdminPanel}
          initialViewMode="login"
        />
      </div>
    </div>
  );
};

export default DoctorAuthModal;
