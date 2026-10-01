import React, { useState } from 'react';
import { Key, Lock, Mail, UserCheck, CheckCircle2, X, Eye, EyeOff } from 'lucide-react';
import { DoctorConfig } from '../types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredDoctors: DoctorConfig[];
  currentDoctor?: DoctorConfig | null;
  onPasswordChanged: (updatedDoctor: DoctorConfig) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  registeredDoctors,
  currentDoctor,
  onPasswordChanged,
}) => {
  const [identifier, setIdentifier] = useState(currentDoctor?.email || currentDoctor?.ci || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanId = identifier.trim().toLowerCase().replace(/[^a-z0-9]/gi, '');
    const cleanNewPass = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanId) {
      setErrorMsg('Por favor ingrese su Correo Electrónico o Cédula de Identidad.');
      return;
    }

    if (cleanNewPass.length < 4) {
      setErrorMsg('La nueva clave debe tener al menos 4 caracteres.');
      return;
    }

    if (cleanNewPass !== cleanConfirm) {
      setErrorMsg('La confirmación de la clave no coincide con la nueva clave.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Find doctor locally or remotely
      let docs = registeredDoctors;
      let target = currentDoctor || docs.find((d) => {
        const dCi = (d.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
        const dEmail = (d.email || '').toLowerCase().trim();
        return dCi === cleanId || dEmail === identifier.trim().toLowerCase() || dCi.includes(cleanId);
      });

      if (!target) {
        // Query cloud
        try {
          const res = await fetch('/api/doctors');
          if (res.ok) {
            const data = await res.json();
            if (data?.doctors && Array.isArray(data.doctors)) {
              docs = data.doctors;
              target = docs.find((d: any) => {
                const dCi = (d.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
                const dEmail = (d.email || '').toLowerCase().trim();
                return dCi === cleanId || dEmail === identifier.trim().toLowerCase() || dCi.includes(cleanId);
              });
            }
          }
        } catch (fetchErr) {
          console.warn('Error fetching doctors from cloud:', fetchErr);
        }
      }

      if (!target) {
        setErrorMsg('No encontramos un médico registrado con ese Correo o Cédula.');
        setIsSubmitting(false);
        return;
      }

      // If doctor has an existing password and user is not already logged in, verify current password or MPPS
      if (!currentDoctor && target.password && currentPassword.trim()) {
        const expectedPass = (target.password || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
        const inputPass = currentPassword.trim().toLowerCase().replace(/[^a-z0-9]/gi, '');
        const expectedCi = (target.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
        const expectedMpps = (target.mpps || '').toLowerCase().replace(/[^a-z0-9]/gi, '');

        if (inputPass !== expectedPass && inputPass !== expectedCi && inputPass !== expectedMpps) {
          setErrorMsg('La clave actual o código de verificación no coincide. Ingrese su clave anterior o su Cédula/MPPS.');
          setIsSubmitting(false);
          return;
        }
      }

      // Update doctor with new password
      const updatedDoctor: DoctorConfig = {
        ...target,
        password: cleanNewPass,
      };

      // Sync to cloud
      try {
        await fetch('/api/doctors/save-one', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDoctor),
        });
      } catch (cloudErr) {
        console.warn('Error syncing updated password to cloud:', cloudErr);
      }

      setSuccessMsg(`✓ Clave de acceso actualizada exitosamente para ${updatedDoctor.doctorName}.`);
      onPasswordChanged(updatedDoctor);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg('Ocurrió un error al actualizar la clave. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-lg text-white">Cambiar Clave de Acceso</h3>
            <p className="text-xs text-slate-400">Actualice la clave para entrar a su consultorio</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs font-semibold text-rose-300">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Correo Electrónico o Cédula: *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                disabled={Boolean(currentDoctor)}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ejemplo@correo.com o V-12.345.678"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
              />
            </div>
          </div>

          {!currentDoctor && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Clave Actual o Cédula de Verificación:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Clave inicial dada por el admin o Cédula"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                💡 Si el administrador le dio de alta con una clave temporal, escríbala aquí.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Nueva Clave de Acceso: *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Escriba su nueva clave secreta"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Confirmar Nueva Clave: *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita su nueva clave"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Guardando...' : 'Actualizar Clave'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
