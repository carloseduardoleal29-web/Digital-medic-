import React, { useState, useEffect } from 'react';
import { Download, Monitor, CheckCircle, Smartphone, X, Sparkles, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'floating' | 'header' | 'drawer' | 'inline';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'pc'>('android');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setActiveTab('ios');
      } else if (/android/.test(ua)) {
        setActiveTab('android');
      } else {
        setActiveTab('pc');
      }
    }
  }, []);

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  // If app is already installed and running standalone
  if (isInstalled) {
    if (variant === 'floating') return null;
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold shadow-xs">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">App Instalada</span>
        <span className="sm:hidden">Instalada</span>
      </span>
    );
  }

  // Floating Variant: Bottom-right floating action button (FAB)
  if (variant === 'floating') {
    return (
      <>
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 no-print animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            type="button"
            onClick={handleInstallClick}
            className={`group relative px-3.5 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 shadow-2xl hover:shadow-cyan-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-cyan-400/60 ring-4 ring-cyan-500/20 ${className}`}
            title="Instalar Aplicación en Celular o PC"
            aria-label="Instalar Aplicación"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
            </span>

            <span className="p-1 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform" />
            </span>

            <div className="flex flex-col text-left leading-tight">
              <span className="font-black text-white tracking-wide flex items-center gap-1">
                <span>Instalar Aplicación</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              </span>
              <span className="text-[10px] text-cyan-200 font-semibold hidden xs:inline">
                PWA para Móvil y PC
              </span>
            </div>
          </button>
        </div>

        {showGuideModal && renderModal()}
      </>
    );
  }

  // Drawer Variant: Full-width button inside Left Drawer
  if (variant === 'drawer') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full py-2.5 px-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 hover:from-blue-600 hover:via-indigo-600 hover:to-cyan-600 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md border border-cyan-400/50 ${className}`}
          title="Instalar Digital Médic en este dispositivo"
        >
          <Download className="w-4 h-4 text-cyan-300" />
          <span>Instalar Aplicación</span>
        </button>

        {showGuideModal && renderModal()}
      </>
    );
  }

  // Default / Header Variant: In navigation bar or menus
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`group relative px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 hover:from-blue-600 hover:via-indigo-600 hover:to-cyan-600 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer border border-cyan-400/50 shrink-0 ${className}`}
        title="Instalar Digital Médic como Aplicación en su dispositivo"
      >
        <span className="p-1 rounded-lg bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-200 group-hover:translate-y-0.5 transition-transform" />
        </span>
        <span className="font-black text-white text-xs sm:text-sm whitespace-nowrap">
          Instalar Aplicación
        </span>
      </button>

      {showGuideModal && renderModal()}
    </>
  );

  function renderModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-slate-700 p-5 sm:p-6 shadow-2xl text-slate-100 relative max-h-[92vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={() => setShowGuideModal(false)}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
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
                <span>Instalar Aplicación</span>
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-md text-[10px] font-mono">
                  PWA OFICIAL
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Acceda directamente desde su pantalla de inicio en celular o escritorio en PC.
              </p>
            </div>
          </div>

          {/* Device Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'android'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'ios'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone / iPad</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pc')}
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'pc'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PC / Mac</span>
            </button>
          </div>

          {/* Android Chrome Instructions */}
          {activeTab === 'android' && (
            <div className="space-y-3.5 text-xs text-slate-300 animate-in fade-in duration-150">
              <div className="p-3 bg-emerald-950/40 border border-emerald-700/60 rounded-2xl text-emerald-200">
                <strong>En Google Chrome para Android:</strong>
              </div>

              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    await install();
                    setShowGuideModal(false);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Ahora en Este Teléfono</span>
                </button>
              )}

              <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                <span className="font-black text-white block">Instalación manual desde el menú:</span>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                  <li>Toca los <strong>tres puntos (⋮)</strong> en la esquina superior derecha de Chrome.</li>
                  <li>Selecciona la opción <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.</li>
                  <li>Confirma tocando <strong>"Instalar"</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* iOS Safari Instructions */}
          {activeTab === 'ios' && (
            <div className="space-y-3.5 text-xs text-slate-300 animate-in fade-in duration-150">
              <div className="p-3 bg-blue-950/40 border border-blue-700/60 rounded-2xl text-blue-200">
                <strong>En Safari para iPhone / iPad:</strong>
              </div>

              <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                <ol className="list-decimal list-inside space-y-2 pl-1 leading-relaxed">
                  <li>Toca el botón <strong>Compartir</strong> (el ícono con un cuadrado y flecha hacia arriba <span className="font-bold">⎋</span> en la barra inferior de Safari).</li>
                  <li>Desliza hacia abajo en el menú de opciones.</li>
                  <li>Toca <strong>"Agregar a la pantalla de inicio"</strong>.</li>
                  <li>Toca <strong>"Agregar"</strong> en la esquina superior derecha.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Desktop PC Instructions */}
          {activeTab === 'pc' && (
            <div className="space-y-3.5 text-xs text-slate-300 animate-in fade-in duration-150">
              <div className="p-3 bg-cyan-950/40 border border-cyan-700/60 rounded-2xl text-cyan-200">
                <strong>En Google Chrome / Edge en tu Computadora:</strong>
              </div>

              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    await install();
                    setShowGuideModal(false);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Aplicación en PC</span>
                </button>
              )}

              <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                  <li>En la barra de direcciones de Chrome (arriba a la derecha), haz clic en el ícono de <strong>Instalar</strong> (un monitor con flecha hacia abajo).</li>
                  <li>Haz clic en <strong>"Instalar Digital Médic"</strong>.</li>
                  <li>Se abrirá en su propia ventana sin barras de navegación como software de escritorio.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Footer */}
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
    );
  }
};
