import React from 'react';
import { Sparkles, Stethoscope, MessageSquare, ShieldCheck, HeartPulse } from 'lucide-react';

export const CintilloTopRibbon: React.FC<{ className?: string }> = ({ className = '' }) => {
  const content = (
    <>
      <span className="flex items-center gap-1.5 text-cyan-200">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
        <span className="font-black tracking-wide">DIGITAL MÉDIC</span>
      </span>
      <span className="text-white/60">·</span>
      <span className="flex items-center gap-1 text-white">
        <Stethoscope className="w-3 h-3 text-cyan-300" />
        <span>Récipes Oficiales</span>
      </span>
      <span className="text-white/60">·</span>
      <span className="text-white">Informes Médicos</span>
      <span className="text-white/60">·</span>
      <span className="text-white">Historias Clínicas</span>
      <span className="text-white/60">·</span>
      <span className="flex items-center gap-1 text-emerald-200">
        <MessageSquare className="w-3 h-3 text-emerald-300" />
        <span>Envío Directo por WhatsApp</span>
      </span>
      <span className="text-white/60">·</span>
      <span className="flex items-center gap-1 text-amber-200">
        <ShieldCheck className="w-3 h-3 text-amber-300" />
        <span>Sello y Firma Digital 100% Legal</span>
      </span>
      <span className="text-white/60">·</span>
      <span className="flex items-center gap-1 text-teal-200">
        <HeartPulse className="w-3 h-3 text-rose-400" />
        <span>Tasa Binance P2P del Día</span>
      </span>
      <span className="text-cyan-300 font-bold ml-2">✦</span>
    </>
  );

  return (
    <div className={`cintillo-animado no-print ${className}`} aria-label="Cintillo informativo Digital Médic">
      <div className="cintillo-track">
        <div className="cintillo-item">{content}</div>
        <div className="cintillo-item">{content}</div>
        <div className="cintillo-item">{content}</div>
        <div className="cintillo-item">{content}</div>
      </div>
    </div>
  );
};
