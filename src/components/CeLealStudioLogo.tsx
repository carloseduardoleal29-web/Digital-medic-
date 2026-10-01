import React from 'react';
import { CARLOS_LEAL_DEVELOPER_LOGO_SVG } from '../data/defaultAssets';

interface CeLealStudioLogoProps {
  variant?: 'full-card' | 'badge' | 'compact' | 'footer';
  className?: string;
}

export const CeLealStudioLogo: React.FC<CeLealStudioLogoProps> = ({
  variant = 'badge',
  className = ''
}) => {
  if (variant === 'full-card') {
    return (
      <div className={`p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#071322] via-[#0b1d35] to-[#040a12] border border-[#1b3d66] shadow-xl relative overflow-hidden group select-none ${className}`}>
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/15 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-950/80 p-1 border border-cyan-400/30 flex items-center justify-center shrink-0 shadow-lg group-hover:border-cyan-400 transition-colors">
            <img 
              src={CARLOS_LEAL_DEVELOPER_LOGO_SVG} 
              alt="C.E. LEAL studio" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[13px] sm:text-sm font-black text-white tracking-widest uppercase">
                C.E. LEAL
              </span>
              <span className="text-[12px] font-normal text-cyan-300">studio</span>
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold text-slate-300 tracking-wider uppercase">
              SOFTWARE &amp; MEDICAL APPS
            </div>
            <div className="text-[9px] font-bold text-cyan-400 flex items-center gap-1">
              <span>★ Plataforma Certificada 2026</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 py-4 text-center select-none ${className}`}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#081220]/90 border border-cyan-500/30 shadow-md">
          <img 
            src={CARLOS_LEAL_DEVELOPER_LOGO_SVG} 
            alt="C.E. LEAL studio" 
            className="w-6 h-6 object-contain rounded"
          />
          <span className="text-xs font-black text-white tracking-wider">C.E. LEAL <span className="text-cyan-300 font-normal">studio</span></span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] font-bold text-slate-300 tracking-wider">SOFTWARE &amp; MEDICAL APPS</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          Diseñado, programado y respaldado por <strong>C.E. LEAL studio</strong> © 2026
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#091526] border border-cyan-500/40 shadow-sm select-none ${className}`}>
        <img 
          src={CARLOS_LEAL_DEVELOPER_LOGO_SVG} 
          alt="C.E. LEAL studio" 
          className="w-5 h-5 object-contain rounded"
        />
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[10px] font-black text-white tracking-wider">
            C.E. LEAL <span className="text-cyan-300 font-light">studio</span>
          </span>
          <span className="text-[7.5px] font-semibold text-slate-400 uppercase tracking-tight">
            Medical Apps
          </span>
        </div>
      </div>
    );
  }

  // default 'badge'
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#081322] border border-cyan-500/40 shadow-inner select-none ${className}`}>
      <div className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center p-0.5 border border-cyan-400/30 shrink-0">
        <img 
          src={CARLOS_LEAL_DEVELOPER_LOGO_SVG} 
          alt="C.E. LEAL studio" 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col text-left leading-tight">
        <div className="flex items-center gap-1">
          <span className="text-[10.5px] font-black text-white tracking-widest">C.E. LEAL</span>
          <span className="text-[10px] font-normal text-cyan-300">studio</span>
        </div>
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
          Software &amp; Medical Apps
        </span>
      </div>
    </div>
  );
};
