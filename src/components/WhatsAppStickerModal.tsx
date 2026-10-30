import React, { useState, useRef } from 'react';
import { Sparkles, Download, X, Check, Share2, Smartphone, Image as ImageIcon } from 'lucide-react';
import { DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, MEDICINE_EMBLEM_ESCULAPIO_SVG, CARLOS_LEAL_DEVELOPER_BADGE_SVG } from '../data/defaultAssets';
import { safeFormatSrcUrl } from '../utils/exportDocument';

interface WhatsAppStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
  specialty?: string;
}

export const WhatsAppStickerModal: React.FC<WhatsAppStickerModalProps> = ({
  isOpen,
  onClose,
  doctorName = 'Dr. Carlos Leal',
  specialty = 'Médico Especialista',
}) => {
  const [downloadingIdx, setDownloadingIdx] = useState<number | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  // Custom 512x512 WhatsApp Sticker Vector Canvas SVG Wrappers
  const sticker1Svg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
    <defs>
      <filter id="stickerShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="%230f172a" flood-opacity="0.25"/>
      </filter>
      <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%230284C7"/>
        <stop offset="100%" stop-color="%230F172A"/>
      </linearGradient>
    </defs>
    <!-- Outer Sticker White Die-Cut Border -->
    <rect x="24" y="24" width="464" height="464" rx="90" fill="%23FFFFFF" filter="url(%23stickerShadow)" />
    <rect x="36" y="36" width="440" height="440" rx="78" fill="url(%23bgGrad1)" />
    <!-- Sticker Header Badge -->
    <circle cx="256" cy="180" r="100" fill="%23FFFFFF" opacity="0.15" />
    <g transform="translate(256, 170) scale(0.65)">
      <circle cx="0" cy="0" r="120" fill="%23FFFFFF" />
      <path d="M-50 -20 L50 -20 L50 20 L-50 20 Z M-20 -50 L20 -50 L20 50 L-20 50 Z" fill="%230D7C52" />
      <path d="M-10 -80 C-40 -80, -70 -50, -70 -10 C-70 50, 0 80, 0 80 C0 80, 70 50, 70 -10 C70 -50, 40 -80, -10 -80 Z" stroke="%23002B49" stroke-width="12" fill="none" />
    </g>
    <!-- Typography -->
    <text x="256" y="340" text-anchor="middle" font-family="'Impact', Arial, sans-serif" font-weight="900" font-size="52" fill="%23FFFFFF" letter-spacing="2">DIGITAL MÉDIC</text>
    <text x="256" y="380" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="22" fill="%2338BDF8" letter-spacing="1">FORMATOS MÉDICOS DIGITALES</text>
    <rect x="156" y="405" width="200" height="32" rx="16" fill="%230D7C52" />
    <text x="256" y="426" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="16" fill="%23FFFFFF">VERIFICADO ⚕️</text>
  </svg>`;

  const sticker2Svg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
    <defs>
      <filter id="stickerShadow2" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="%230284c7" flood-opacity="0.3"/>
      </filter>
    </defs>
    <!-- White Circular Sticker Border -->
    <circle cx="256" cy="256" r="236" fill="%23FFFFFF" filter="url(%23stickerShadow2)"/>
    <circle cx="256" cy="256" r="220" fill="%23EFF6FF"/>
    <circle cx="256" cy="256" r="200" stroke="%232563EB" stroke-width="6" stroke-dasharray="16 10"/>
    <!-- Esculapio Rod -->
    <line x1="256" y1="100" x2="256" y2="390" stroke="%231E3A8A" stroke-width="18" stroke-linecap="round"/>
    <circle cx="256" cy="90" r="22" fill="%232563EB"/>
    <path d="M210 160 C320 160, 320 220, 256 250 C192 280, 192 340, 300 360" stroke="%23059669" stroke-width="18" stroke-linecap="round" fill="none"/>
    <!-- Banner -->
    <rect x="76" y="380" width="360" height="60" rx="30" fill="%231E3A8A"/>
    <text x="256" y="418" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="24" fill="%23FFFFFF" letter-spacing="1">CONSULTA MÉDICA ⚕️</text>
  </svg>`;

  const stickers = [
    {
      title: 'Sticker 1: App Logo Digital Médic',
      desc: 'Logo oficial troquelado para WhatsApp con marco blanco de sticker',
      svg: sticker1Svg,
    },
    {
      title: 'Sticker 2: Emblema Médico Esculapio ⚕️',
      desc: 'Insignia médica con vara de Esculapio y bandera de consulta',
      svg: sticker2Svg,
    },
    {
      title: 'Sticker 3: Marca C.E. LEAL studio',
      desc: 'Badge oficial de desarrollo de aplicaciones médicas',
      svg: CARLOS_LEAL_DEVELOPER_BADGE_SVG,
    },
  ];

  const handleDownloadSticker = (svgDataUri: string, index: number) => {
    try {
      setDownloadingIdx(index);
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = safeFormatSrcUrl(svgDataUri);

      img.onload = () => {
        ctx.clearRect(0, 0, 512, 512);
        ctx.drawImage(img, 0, 0, 512, 512);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Sticker_DigitalMedic_${index + 1}_512x512.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 10000);

          setDownloadingIdx(null);
          setCopiedToast(`✓ Sticker ${index + 1} descargado (512x512px). ¡Listo para WhatsApp!`);
          setTimeout(() => setCopiedToast(null), 3500);
        }, 'image/png');
      };
    } catch (err) {
      console.error('Error al descargar sticker:', err);
      setDownloadingIdx(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <Sparkles className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Stickers Oficiales para WhatsApp</h3>
              <p className="text-xs text-emerald-100 font-semibold">Formato cuadrado 512x512px listo para agregar a WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto text-slate-800">
          
          {copiedToast && (
            <div className="p-3 bg-emerald-600 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-md animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-200" />
              <span>{copiedToast}</span>
            </div>
          )}

          {/* Quick Tip Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-black text-emerald-950 block">¿Cómo agregar los stickers a tu WhatsApp?</span>
              <p className="text-slate-700 leading-relaxed font-semibold">
                1. Toca <strong>"Descargar Sticker (512x512)"</strong> en el diseño que prefieras.<br/>
                2. En WhatsApp, abre un chat, toca el ícono de <strong>Stickers (😀)</strong> -&gt; botón <strong>"+" (Crear)</strong> o usa una app gratuita de stickers y selecciona la imagen de tu galería.
              </p>
            </div>
          </div>

          {/* Sticker Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stickers.map((stk, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col items-center text-center space-y-3 shadow-xs hover:border-emerald-300 transition-all">
                
                {/* 512x512 Sticker Preview Box */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-2xl border border-slate-200 p-2 flex items-center justify-center shadow-inner relative group">
                  <img
                    src={stk.svg}
                    alt={stk.title}
                    className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-900/80 text-white rounded-md text-[9px] font-mono">
                    512x512
                  </span>
                </div>

                <div className="flex-1 space-y-1">
                  <span className="font-black text-xs text-slate-900 block leading-tight">
                    {stk.title}
                  </span>
                  <p className="text-[10px] text-slate-500 font-semibold leading-tight">
                    {stk.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadSticker(stk.svg, idx)}
                  disabled={downloadingIdx === idx}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{downloadingIdx === idx ? 'Descargando...' : 'Descargar'}</span>
                </button>

              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-[11px]">
            Digital Médic · Stickers e insignias vectoriales para médicos
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
