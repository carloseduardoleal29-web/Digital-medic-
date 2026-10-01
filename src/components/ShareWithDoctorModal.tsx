import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Sparkles, 
  Phone, 
  Share2, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { DoctorConfig } from '../types';

interface ShareWithDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DoctorConfig;
}

export const ShareWithDoctorModal: React.FC<ShareWithDoctorModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'pasos'>('link');

  if (!isOpen) return null;

  // Safe Clean URL generation
  const getAppBaseUrl = () => {
    return window.location.origin;
  };

  const cleanAppUrl = getAppBaseUrl();

  const handleCopyCleanLink = () => {
    navigator.clipboard.writeText(cleanAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const docName = config.doctorName || 'Dr. Médico Especialista';
    const message = `*Estimado(a) ${docName}*, le hago entrega de su sistema médico digitalizado:\n\n🌐 *Enlace de su aplicación:* ${cleanAppUrl}\n\n🔑 *Cómo ingresar a su consultorio:* Al abrir el enlace toque *"Acceso Médico"* e ingrese su Cédula: *${config.ci || 'V-00.000.000'}*. Ya tiene cargados sus logos, membrete, sello y firma para empezar a prescribir.`;
    
    const cleanPhone = (config.phone || '').replace(/[^0-9]/g, '');
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs no-print animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">¿Cómo pasarle el diseño a su colega?</h3>
              <p className="text-[11px] text-blue-200">Entréguele su recetario listo para usar en su teléfono o PC</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Summary Card */}
        <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-white shadow-2xs shrink-0"
              style={{ backgroundColor: config.primaryDocColor || '#2563eb', borderColor: '#ffffff' }}
            >
              {config.doctorName?.slice(0, 2).toUpperCase() || 'DR'}
            </div>
            <div>
              <span className="font-black text-slate-900 text-sm block">
                {config.doctorName || 'Dr. Médico Colega'}
              </span>
              <span className="text-slate-600 block">{config.specialty || 'Especialista'}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                MPPS: {config.mpps} · C.I: {config.ci}
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Diseño Listo</span>
          </span>
        </div>

        {/* Tabs for sharing methods */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'link' 
                ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t-lg' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>1. Enlace por WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('pasos')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'pasos' 
                ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t-lg' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>2. ¿Cómo funciona?</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* TAB 1: ENLACE */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-950">
                <span className="font-bold flex items-center gap-1.5 text-emerald-800 text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Entrega Directa por WhatsApp</span>
                </span>
                <p className="text-slate-700 leading-relaxed text-[11.5px]">
                  Al enviar este enlace a su colega por WhatsApp, cuando él lo abra en su teléfono, tablet o computadora, el sistema <strong>cargará automáticamente todos sus datos, membretes, colores y logos ya sincronizados en la nube</strong>.
                </p>
              </div>

              {/* Botón Principal WhatsApp */}
              <button
                onClick={handleSendWhatsApp}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
              >
                <Phone className="w-4 h-4" />
                <span>Enviar Enlace Directo por WhatsApp a {config.doctorName || 'su colega'}</span>
              </button>

              {/* Copiar enlace manual */}
              <div className="space-y-1.5 pt-1">
                <label className="text-slate-600 font-semibold block">Enlace directo de la aplicación:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={cleanAppUrl}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-mono text-[11px] text-slate-700 outline-none select-all"
                  />
                  <button
                    onClick={handleCopyCleanLink}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 shrink-0 transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CÓMO FUNCIONA EL FLUJO */}
          {activeTab === 'pasos' && (
            <div className="space-y-3.5 text-slate-700">
              <h4 className="font-bold text-slate-900 text-sm">Flujo de Trabajo Sincronizado:</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Usted diseña en el Estudio:</strong>
                    <p className="text-[11px] text-slate-600">
                      Usted entra al Estudio de Diseño, sube los logos del médico, configura el membrete, sello, firma y toca <strong>[Guardar Cambios]</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Se lo envía por WhatsApp:</strong>
                    <p className="text-[11px] text-slate-600">
                      Le pasa el enlace directo por WhatsApp junto con su cédula.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-bold">El médico abre la aplicación:</strong>
                    <p className="text-[11px] text-slate-600">
                      Al abrir el enlace, el médico toca <strong>"Acceso Médico"</strong>, ingresa su cédula y ve todos sus datos listos para prescribir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Digital Medic · Mente Maestra & Colegas</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
