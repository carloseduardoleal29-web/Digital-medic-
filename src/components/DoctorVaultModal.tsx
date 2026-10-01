import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  UserCheck, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  FolderCheck,
  Stethoscope,
  Lock
} from 'lucide-react';
import { DoctorConfig } from '../types';

interface DoctorVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: DoctorConfig[];
  activeDoctorId: string;
  onSelectDoctor: (doctorId: string) => void;
  onSavePermanentProfile: () => void;
}

export const DoctorVaultModal: React.FC<DoctorVaultModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeDoctorId,
  onSelectDoctor,
  onSavePermanentProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter profiles by name, specialty or CI
  const filteredProfiles = profiles.filter((p) => {
    const term = searchTerm.toLowerCase().replace(/[^a-z0-9]/gi, '');
    const cleanCI = (p.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
    const cleanMPPS = (p.mpps || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
    const cleanName = (p.doctorName || '').toLowerCase();
    const cleanSpec = (p.specialty || '').toLowerCase();
    
    return cleanCI.includes(term) || cleanMPPS.includes(term) || cleanName.includes(searchTerm.toLowerCase()) || cleanSpec.includes(searchTerm.toLowerCase());
  });

  const handleSelect = (docId: string, docName: string) => {
    onSelectDoctor(docId);
    setAuthSuccessMsg(`✓ Consultorio de ${docName} cargado exitosamente.`);
    setTimeout(() => {
      setAuthSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs no-print animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Bóveda de Médicos y Consultorios</h3>
              <p className="text-[11px] text-blue-200">Acceso instantáneo con Cédula, MPPS o Nombre</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {authSuccessMsg && (
          <div className="p-3 bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-inner animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{authSuccessMsg}</span>
          </div>
        )}

        {/* Search Bar / CI Input */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
            <span>Ingrese Cédula, MPPS o Nombre del Médico:</span>
            <span className="text-[10px] text-blue-600 font-mono font-normal">
              Cédula, MPPS o Nombre
            </span>
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Buscar por Cédula (Ej: 20123456), MPPS o Nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Profiles List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[360px]">
          {filteredProfiles.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-slate-600">No se encontró ningún médico con ese dato.</p>
              <p className="text-[11px] text-slate-400 mt-1">Verifique la cédula o seleccione de la lista.</p>
            </div>
          ) : (
            filteredProfiles.map((prof) => {
              const isActive = prof.id === activeDoctorId;
              return (
                <div
                  key={prof.id}
                  onClick={() => handleSelect(prof.id, prof.doctorName)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-400'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-white shadow-2xs shrink-0 text-xs"
                      style={{ backgroundColor: prof.primaryDocColor || '#2563eb', borderColor: '#ffffff' }}
                    >
                      {prof.doctorName?.slice(0, 2).toUpperCase() || 'DR'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {prof.doctorName || 'Dr. Médico Colega'}
                        </h4>
                        {isActive && (
                          <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded text-[9px] font-bold">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-blue-700 font-medium">{prof.specialty}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>C.I: <strong>{prof.ci}</strong></span>
                        <span>•</span>
                        <span>MPPS: <strong>{prof.mpps}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(prof.id, prof.doctorName);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                    }`}
                  >
                    {isActive ? 'En Uso' : 'Cargar'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <button
            onClick={() => {
              onSavePermanentProfile();
              setAuthSuccessMsg('✓ ¡Datos del médico grabados permanentemente!');
              setTimeout(() => setAuthSuccessMsg(null), 2000);
            }}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
            title="Graba todos los datos actuales del médico en la memoria permanente"
          >
            <FolderCheck className="w-4 h-4" />
            <span>💾 Grabar Datos de este Médico</span>
          </button>

          <span className="text-[10px] text-slate-500 font-mono text-center sm:text-right">
            {profiles.length} médicos registrados
          </span>
        </div>

      </div>
    </div>
  );
};
