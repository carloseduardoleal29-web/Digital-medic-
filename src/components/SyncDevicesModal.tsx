import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Laptop, 
  Copy, 
  Check, 
  RefreshCw, 
  Cloud, 
  CheckCircle2, 
  QrCode, 
  ExternalLink,
  ShieldCheck,
  Users,
  Palette
} from 'lucide-react';
import QRCode from 'qrcode';
import { DoctorConfig } from '../types';

interface SyncDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DoctorConfig;
  patientCount: number;
  onForceSync: () => Promise<void>;
  isSyncing: boolean;
}

export const CANONICAL_SHARED_APP_URL = 'https://ais-pre-5vfzjnoghrk53xcg3gkzzl-65009198887.us-east1.run.app';
export const DEVELOPMENT_APP_URL = 'https://ais-dev-5vfzjnoghrk53xcg3gkzzl-65009198887.us-east1.run.app';

export const SyncDevicesModal: React.FC<SyncDevicesModalProps> = ({
  isOpen,
  onClose,
  config,
  patientCount,
  onForceSync,
  isSyncing,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState<'shared' | 'browser'>('shared');

  const browserUrl = typeof window !== 'undefined' ? window.location.origin || window.location.href : '';
  const activeUrl = urlMode === 'shared' ? CANONICAL_SHARED_APP_URL : browserUrl;

  useEffect(() => {
    if (activeUrl) {
      QRCode.toDataURL(activeUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.warn('QR code generation error:', err));
    }
  }, [activeUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard && activeUrl) {
      navigator.clipboard.writeText(activeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleManualSyncClick = async () => {
    try {
      setSyncFeedback('Sincronizando con la nube...');
      await onForceSync();
      setSyncFeedback('✓ ¡Sincronizado con éxito! Todos los pacientes y diseños están al día.');
      setTimeout(() => setSyncFeedback(null), 3500);
    } catch (e) {
      setSyncFeedback('Error sincronizando. Intente nuevamente.');
      setTimeout(() => setSyncFeedback(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs no-print animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner">
              <Smartphone className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg leading-tight">Enlace & Sincronización Móvil / PC</h3>
                <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Nube Activa
                </span>
              </div>
              <p className="text-xs text-blue-100">Abra su consultorio médico simultáneamente en su teléfono y en su computadora</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          
          {/* Active Doctor Session & Cloud Status Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                {config.doctorName?.slice(0, 2).toUpperCase() || 'DR'}
              </div>
              <div>
                <span className="font-black text-slate-900 text-sm block">
                  {config.doctorName || 'Dr. Médico Especialista'}
                </span>
                <span className="text-[11px] text-slate-600 block">
                  {config.email || 'carloseduardoleal29@gmail.com'} · C.I: {config.ci || '15.489.288'}
                </span>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{patientCount} pacientes guardados en la nube</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleManualSyncClick}
              disabled={isSyncing}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
            </button>
          </div>

          {syncFeedback && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold text-center animate-in fade-in">
              {syncFeedback}
            </div>
          )}

          {/* Direct Link Section with 1-Click Copy */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
              <span className="font-black text-slate-700">🌐 Enlace directo para abrir en celular o PC:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setUrlMode('shared')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    urlMode === 'shared' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Público / Celular
                </button>
                <button
                  type="button"
                  onClick={() => setUrlMode('browser')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    urlMode === 'browser' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Navegador Actual
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-300">
              <input
                type="text"
                readOnly
                value={activeUrl}
                className="flex-1 bg-transparent px-2 py-1 font-mono text-[11px] text-slate-800 outline-none select-all truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
              </button>
            </div>
          </div>

          {/* QR Code Section for Scanning directly with Phone Camera */}
          <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 border border-slate-800 shadow-xl">
            <div className="bg-white p-2.5 rounded-2xl shadow-lg shrink-0 flex items-center justify-center">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="Código QR de la Aplicación Médica" 
                  className="w-36 h-36 rounded-lg object-contain"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-slate-400">
                  <QrCode className="w-12 h-12 animate-pulse" />
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-cyan-300 font-black text-sm">
                <QrCode className="w-4 h-4" />
                <h4>Escanee con la cámara de su teléfono</h4>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Abra la cámara o el lector de QR en su celular y apunte hacia la pantalla. La aplicación se abrirá en su teléfono con su sesión, pacientes, formatos y membretes sincronizados automáticamente.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" /> Android / iPhone
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5 text-indigo-400" /> PC / Tablet
                </span>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-blue-600 font-black">
                <Users className="w-4 h-4" />
                <span>Banco de Pacientes</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Si agrega un paciente en el teléfono, se guarda en la nube y aparece en su PC automáticamente.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-600 font-black">
                <Palette className="w-4 h-4" />
                <span>Estudio de Diseño</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Tus membretes, sellos, firmas y logos guardados están disponibles en cualquier equipo donde abras el enlace.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 font-black">
                <Cloud className="w-4 h-4" />
                <span>Auto-Sincronización</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Al volver a la pestaña de su computadora, la app detecta los cambios del teléfono y los actualiza en vivo.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Digital Medic · Sincronización Cloud Activa</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-xl font-black text-xs transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
