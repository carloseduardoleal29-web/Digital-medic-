import React, { useState, useEffect } from 'react';
import { Download, Monitor, CheckCircle, Info, X, ExternalLink, ShieldCheck, Sparkles, Laptop } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'firefox' | 'chromium'>('firefox');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Detect user's current browser on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('firefox')) {
        setActiveTab('firefox');
      } else {
        setActiveTab('chromium');
      }
    }
  }, []);

  // Download Windows Internet Shortcut with official logo
  const handleDownloadWindowsShortcut = () => {
    try {
      const appUrl = window.location.href;
      const origin = window.location.origin;
      const shortcutContent = `[InternetShortcut]\r\nURL=${appUrl}\r\nIconFile=${origin}/favicon-32x32.png\r\nIconIndex=0\r\nHotKey=0\r\n[{000214A0-0000-0000-C000-000000000046}]\r\nProp3=19,11\r\n`;
      const blob = new Blob([shortcutContent], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Digital Medic - Consultorio.url';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error('Error downloading shortcut:', e);
    }
  };

  // If already running in standalone desktop app mode
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold shadow-xs">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>App en PC Lista</span>
      </span>
    );
  }

  return (
    <>
      {/* Botón Principal Elegante y Atractivo */}
      <button
        type="button"
        onClick={async () => {
          if (isInstallable && activeTab === 'chromium') {
            await install();
          } else {
            setShowGuideModal(true);
          }
        }}
        className="group relative px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 hover:from-blue-600 hover:via-indigo-600 hover:to-cyan-600 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer border border-cyan-400/50 shrink-0"
        title="Instalar Digital Médic como aplicación en tu PC con su logo oficial"
      >
        <span className="p-1 rounded-lg bg-white/20 border border-white/25 flex items-center justify-center">
          <Monitor className="w-4 h-4 text-cyan-200" />
        </span>
        <div className="flex flex-col text-left leading-none">
          <span className="font-black text-white text-xs sm:text-sm flex items-center gap-1">
            <span>Instalar en PC</span>
            <Sparkles className="w-3 h-3 text-cyan-300" />
          </span>
          <span className="text-[10px] text-cyan-200 font-semibold mt-0.5 hidden sm:inline">
            Con Logo Oficial
          </span>
        </div>
        <Download className="w-3.5 h-3.5 text-cyan-200 ml-1 group-hover:translate-y-0.5 transition-transform" />
      </button>

      {/* Modal Guía Completa de Instalación Especialmente Adaptada a Mozilla Firefox y Chromium */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-slate-700 p-5 sm:p-6 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Official Logo */}
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-xl border-2 border-cyan-500/40 shrink-0 flex items-center justify-center">
                <img
                  src="/pwa-192x192.png"
                  alt="Digital Médic Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>Instalar en PC</span>
                  <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-md text-[10px] font-mono">
                    LOGO OFICIAL
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tenga su consultorio médico accesible directamente en su Escritorio y Barra de Tareas.
                </p>
              </div>
            </div>

            {/* Selector de Navegador (Pestañas) */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('firefox')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'firefox'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🦊 Mozilla Firefox</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chromium')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'chromium'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🌐 Chrome / Edge / Brave</span>
              </button>
            </div>

            {/* CONTENIDO PARA MOZILLA FIREFOX */}
            {activeTab === 'firefox' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3.5 bg-orange-950/40 border border-orange-700/60 rounded-2xl text-xs text-orange-200">
                  <strong>Nota para Mozilla Firefox:</strong> Firefox en PC no usa la ventana emergente de Chrome, pero permite crear el acceso directo al instante de dos maneras sencillas:
                </div>

                {/* Opción A: Descarga Directa del Acceso Directo */}
                <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] font-bold">1</span>
                      Descargar Acceso Directo para Windows:
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">Recomendado</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Descargue el archivo de acceso directo ya configurado con el logo de Digital Médic. Solo guárdelo en su Escritorio:
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadWindowsShortcut}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Acceso Directo al Escritorio (.url)</span>
                  </button>
                  {downloadSuccess && (
                    <div className="text-[11px] text-emerald-300 font-bold flex items-center gap-1.5 pt-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>¡Descargado con éxito! Mueva el archivo a su Escritorio para abrir la app cuando guste.</span>
                    </div>
                  )}
                </div>

                {/* Opción B: Arrastrar el Candado */}
                <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                  <span className="text-xs font-black text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-300 flex items-center justify-center text-[11px] font-bold">2</span>
                    Método Clásico de Firefox (Arrastrar Candado):
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pl-1 leading-relaxed">
                    <li>
                      Haz clic sostenido en el <strong>candado 🔒</strong> que está en la barra superior de direcciones de Firefox.
                    </li>
                    <li>
                      <strong>Arrastra el candado</strong> hacia el Escritorio de tu PC y suéltalo.
                    </li>
                    <li>
                      ¡Listo! Quedará creado el acceso directo a Digital Médic.
                    </li>
                  </ol>
                </div>

                {/* Opción C: Fijar Pestaña */}
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2.5">
                  <Laptop className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <strong>Consejo:</strong> Haz clic derecho en la pestaña de Digital Médic y elige <strong>"Fijar pestaña"</strong> para tenerla siempre a mano al abrir Firefox.
                  </span>
                </div>
              </div>
            )}

            {/* CONTENIDO PARA CHROME / EDGE / BRAVE */}
            {activeTab === 'chromium' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3.5 bg-blue-950/40 border border-blue-700/60 rounded-2xl text-xs text-blue-200">
                  <strong>Instalación Nativa Automática:</strong> En navegadores Chromium se crea una ventana independiente con su propio ícono en la barra de tareas de Windows/Mac.
                </div>

                {isInstallable && (
                  <button
                    type="button"
                    onClick={async () => {
                      await install();
                      setShowGuideModal(false);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar Ahora Directamente en PC</span>
                  </button>
                )}

                <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                  <div className="font-bold text-xs text-white">Pasos manuales si la ventana no aparece:</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pl-1 leading-relaxed">
                    <li>
                      En la barra de direcciones superior de tu navegador, busca el ícono de <strong>Instalar</strong> (un monitor con flecha <Download className="inline w-3 h-3 text-cyan-400" /> o tres puntos ⋮).
                    </li>
                    <li>
                      Haz clic en <strong>"Instalar Digital Médic"</strong>.
                    </li>
                    <li>
                      Confirma haciendo clic en <strong>"Instalar"</strong>.
                    </li>
                  </ol>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    El acceso directo se guardará en tu Escritorio y Menú Inicio con el logo oficial en ultra alta resolución.
                  </span>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Digital Médic Oficial
              </span>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
