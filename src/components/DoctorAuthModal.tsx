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
  onOpenAdminPanel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#060c18]/90 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-5 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all z-50"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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
