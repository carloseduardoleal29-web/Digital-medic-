import React, { useRef, useState } from 'react';
import { DoctorConfig } from '../types';
import { Camera, Move, RotateCcw } from 'lucide-react';

interface DocumentFooterProps {
  config: DoctorConfig;
  compact?: boolean;
  notesText?: string;
  onUpdateNotes?: (notes: string) => void;
  onUpdateConfigField?: (field: keyof DoctorConfig, value: any) => void;
  onUploadStamp?: (dataUrl: string) => void;
  editableInline?: boolean;
  onOpenSignatureModal?: () => void;
}

export const DocumentFooter: React.FC<DocumentFooterProps> = ({
  config,
  compact = false,
  notesText,
  onUpdateNotes,
  onUpdateConfigField,
  onUploadStamp,
  editableInline = true,
  onOpenSignatureModal,
}) => {
  const stampInputRef = useRef<HTMLInputElement>(null);

  const cfg = config || {
    signatureTitle: 'Firma y Sello del Médico Tratante',
    doctorName: '',
    specialty: '',
    mpps: '',
    primaryDocColor: '#2563eb',
    stampPosX: 0,
    stampPosY: 0,
    signaturePosX: 0,
    signaturePosY: 0,
  };

  // Dragging state for stamp and signature
  const [activeDrag, setActiveDrag] = useState<'stamp' | 'signature' | null>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0, hasMoved: false });

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    target: 'stamp' | 'signature'
  ) => {
    if (!editableInline) return;
    // Don't capture right click
    if (e.button !== 0) return;

    e.stopPropagation();
    const currentTarget = e.currentTarget;
    try {
      currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const initialX = target === 'stamp' ? (config.stampPosX || 0) : (config.signaturePosX || 0);
    const initialY = target === 'stamp' ? (config.stampPosY || 0) : (config.signaturePosY || 0);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX,
      initialY,
      hasMoved: false,
    };

    setActiveDrag(target);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, target: 'stamp' | 'signature') => {
    if (activeDrag !== target) return;
    e.stopPropagation();

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragStartRef.current.hasMoved = true;
    }

    // Calculate new position within ultra-wide free constraints (-550px to 550px X, -320px to 260px Y)
    const newX = Math.round(Math.max(-550, Math.min(550, dragStartRef.current.initialX + dx)));
    const newY = Math.round(Math.max(-320, Math.min(260, dragStartRef.current.initialY + dy)));

    if (target === 'stamp') {
      onUpdateConfigField?.('stampPosX', newX);
      onUpdateConfigField?.('stampPosY', newY);
    } else {
      onUpdateConfigField?.('signaturePosX', newX);
      onUpdateConfigField?.('signaturePosY', newY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>, target: 'stamp' | 'signature') => {
    if (activeDrag !== target) return;
    e.stopPropagation();

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const wasJustClicked = !dragStartRef.current.hasMoved;
    setActiveDrag(null);

    if (wasJustClicked && onOpenSignatureModal) {
      onOpenSignatureModal();
    }
  };

  // Direct Mobile Touch Listeners for finger movement
  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    target: 'stamp' | 'signature'
  ) => {
    if (!editableInline) return;
    const touch = e.touches[0];
    if (!touch) return;

    const initialX = target === 'stamp' ? (config.stampPosX || 0) : (config.signaturePosX || 0);
    const initialY = target === 'stamp' ? (config.stampPosY || 0) : (config.signaturePosY || 0);

    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX,
      initialY,
      hasMoved: false,
    };

    setActiveDrag(target);
  };

  const handleTouchMove = (
    e: React.TouchEvent<HTMLDivElement>,
    target: 'stamp' | 'signature'
  ) => {
    if (activeDrag !== target) return;
    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - dragStartRef.current.startX;
    const dy = touch.clientY - dragStartRef.current.startY;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      dragStartRef.current.hasMoved = true;
    }

    const newX = Math.round(Math.max(-550, Math.min(550, dragStartRef.current.initialX + dx)));
    const newY = Math.round(Math.max(-320, Math.min(260, dragStartRef.current.initialY + dy)));

    if (target === 'stamp') {
      onUpdateConfigField?.('stampPosX', newX);
      onUpdateConfigField?.('stampPosY', newY);
    } else {
      onUpdateConfigField?.('signaturePosX', newX);
      onUpdateConfigField?.('signaturePosY', newY);
    }
  };

  const handleTouchEnd = (
    e: React.TouchEvent<HTMLDivElement>,
    target: 'stamp' | 'signature'
  ) => {
    if (activeDrag !== target) return;
    const wasJustClicked = !dragStartRef.current.hasMoved;
    setActiveDrag(null);

    if (wasJustClicked && onOpenSignatureModal) {
      onOpenSignatureModal();
    }
  };

  const handleSignatureBoxClick = () => {
    if (!editableInline) return;
    if (dragStartRef.current.hasMoved) return;

    if (onOpenSignatureModal) {
      onOpenSignatureModal();
    } else {
      stampInputRef.current?.click();
    }
  };

  const handleStampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') {
        if (onUploadStamp) {
          onUploadStamp(evt.target.result);
        } else if (onUpdateConfigField) {
          onUpdateConfigField('selloFirma', evt.target.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetPositions = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateConfigField?.('stampPosX', 0);
    onUpdateConfigField?.('stampPosY', 0);
    onUpdateConfigField?.('signaturePosX', 0);
    onUpdateConfigField?.('signaturePosY', 0);
  };

  const currentNotes = notesText !== undefined 
    ? notesText 
    : (config.footerNotesText || config.socialHandle || `${config.phone} · ${config.email}`);

  const hasCustomPositions = 
    (config.stampPosX && config.stampPosX !== 0) || 
    (config.stampPosY && config.stampPosY !== 0) ||
    (config.signaturePosX && config.signaturePosX !== 0) ||
    (config.signaturePosY && config.signaturePosY !== 0);

  return (
    <div 
      className={`relative w-full border-t border-dashed border-slate-300 pt-2.5 mt-auto flex items-end justify-between gap-3 transition-all ${
        compact ? 'min-h-[64px] pt-1.5' : 'min-h-[85px]'
      }`}
    >
      <input
        ref={stampInputRef}
        type="file"
        accept="image/*"
        onChange={handleStampChange}
        className="hidden"
      />

      {/* Cajón Inferior Izquierdo: Redes, Contacto, Notas de Despacho (Transparente sin cuadro blanco) */}
      <div 
        className="footer-caja-libre flex-1 max-w-[58%] p-1 rounded-lg border-0 bg-transparent shadow-none text-[10px] text-slate-700 font-sans leading-tight transition-all"
      >
        <div
          contentEditable={editableInline}
          suppressContentEditableWarning
          onBlur={(e) => {
            const val = e.currentTarget.innerText;
            if (onUpdateNotes) onUpdateNotes(val);
            if (onUpdateConfigField) onUpdateConfigField('footerNotesText', val);
          }}
          className={`outline-none cursor-text ${
            editableInline ? 'hover:bg-blue-50/70 hover:ring-1 hover:ring-blue-300 rounded p-1 transition-all' : ''
          }`}
          style={{
            fontSize: config.footerNotesSize || (compact ? '8.5px' : '10px'),
            color: config.footerNotesColor || '#334155',
          }}
          title="Haga clic para editar redes, teléfonos o notas del pie"
        >
          {currentNotes}
        </div>

        {/* Legal Disclaimer / Nota al Pie */}
        {config.footerDisclaimer && !compact && (
          <div
            contentEditable={editableInline}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateConfigField?.('footerDisclaimer', e.currentTarget.innerText)}
            className={`mt-1 italic outline-none cursor-text ${
              editableInline ? 'hover:bg-blue-50/70 hover:ring-1 hover:ring-blue-300 rounded p-0.5' : ''
            }`}
            style={{
              fontSize: config.disclaimerSize || '8.5px',
              color: config.disclaimerColor || '#94a3b8',
            }}
            title="Haga clic para editar nota legal o validez"
          >
            {config.footerDisclaimer}
          </div>
        )}
      </div>

      {/* Cajón Inferior Derecho: Firma y Sello Oficial Independientes y MÓVILES POR RATÓN Y DEDO */}
      <div 
        className="mini-firma relative group flex flex-col items-center justify-end text-center shrink-0 min-w-[180px] max-w-[360px]"
      >
        {/* Reset Positions Floating Button (visible on hover) */}
        {editableInline && hasCustomPositions && (
          <button
            onClick={handleResetPositions}
            type="button"
            className="absolute -top-6 right-0 text-[9px] bg-slate-800/80 hover:bg-slate-900 text-white px-1.5 py-0.5 rounded-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print z-30 shadow-xs"
            title="Centrar sello y firma a su posición original"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Centrar</span>
          </button>
        )}

        {/* Side-by-side non-overlapping container for Signature and Stamp */}
        <div className="relative w-full flex items-end justify-center gap-3 sm:gap-4 min-h-[55px] mb-1 overflow-visible">
          
          {/* 1. Firma Real del Médico (a la izquierda de la línea) */}
          {config.firmaImg && (
            <div
              onPointerDown={(e) => handlePointerDown(e, 'signature')}
              onPointerMove={(e) => handlePointerMove(e, 'signature')}
              onPointerUp={(e) => handlePointerUp(e, 'signature')}
              onPointerCancel={(e) => handlePointerUp(e, 'signature')}
              onTouchStart={(e) => handleTouchStart(e, 'signature')}
              onTouchMove={(e) => handleTouchMove(e, 'signature')}
              onTouchEnd={(e) => handleTouchEnd(e, 'signature')}
              onTouchCancel={(e) => handleTouchEnd(e, 'signature')}
              className={`relative select-none flex flex-col items-center justify-end ${
                editableInline 
                  ? 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-indigo-400 hover:ring-dashed rounded-lg p-0.5 transition-shadow' 
                  : ''
              } ${activeDrag === 'signature' ? 'ring-2 ring-indigo-600 rounded-lg z-30 opacity-95 shadow-lg' : ''}`}
              style={{
                touchAction: 'none',
                transform: `translate(${config.signaturePosX || 0}px, ${config.signaturePosY || 0}px)`,
                zIndex: activeDrag === 'signature' ? 30 : 2,
              }}
              title={editableInline ? "Arrastre con el ratón o con el dedo para mover la firma libremente" : undefined}
            >
              <img
                src={config.firmaImg}
                alt="Firma Real del Médico"
                className="firma-digital-print object-contain pointer-events-none transition-all"
                style={{
                  width: `${(typeof config.signatureSize === 'number' ? config.signatureSize : (parseFloat(String(config.signatureSize || '')) || (compact ? 90 : 135))) * (compact ? 0.78 : 1)}px`,
                  maxWidth: '100%',
                  maxHeight: compact ? '65px' : '110px',
                  mixBlendMode: 'multiply',
                }}
              />
              {editableInline && (
                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full px-1 py-0.5 text-[8px] font-bold opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity no-print shadow-md pointer-events-none">
                  <Move className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">Mover</span>
                </div>
              )}
            </div>
          )}

          {/* 2. Sello del Médico (al lado de la firma, sin montarse encima) */}
          {(config.selloImg || (!config.firmaImg && config.selloFirma)) && (
            <div
              onPointerDown={(e) => handlePointerDown(e, 'stamp')}
              onPointerMove={(e) => handlePointerMove(e, 'stamp')}
              onPointerUp={(e) => handlePointerUp(e, 'stamp')}
              onPointerCancel={(e) => handlePointerUp(e, 'stamp')}
              onTouchStart={(e) => handleTouchStart(e, 'stamp')}
              onTouchMove={(e) => handleTouchMove(e, 'stamp')}
              onTouchEnd={(e) => handleTouchEnd(e, 'stamp')}
              onTouchCancel={(e) => handleTouchEnd(e, 'stamp')}
              className={`relative select-none flex flex-col items-center justify-end ${
                editableInline 
                  ? 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded-lg p-0.5 transition-shadow' 
                  : ''
              } ${activeDrag === 'stamp' ? 'ring-2 ring-blue-600 rounded-lg z-20 opacity-95 shadow-lg' : ''}`}
              style={{
                touchAction: 'none',
                transform: `translate(${config.stampPosX || 0}px, ${config.stampPosY || 0}px)`,
                zIndex: activeDrag === 'stamp' ? 20 : 1,
              }}
              title={editableInline ? "Arrastre con el ratón o con el dedo para mover el sello libremente" : undefined}
            >
              <img
                src={config.selloImg || config.selloFirma}
                alt="Sello Médico"
                className="sello-digital-print object-contain pointer-events-none transition-all"
                style={{
                  width: `${(typeof config.stampSize === 'number' ? config.stampSize : (parseFloat(String(config.stampSize || '')) || (compact ? 85 : 125))) * (compact ? 0.78 : 1)}px`,
                  maxWidth: '100%',
                  maxHeight: compact ? '75px' : '140px',
                  mixBlendMode: 'multiply',
                }}
              />
              {editableInline && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full px-1 py-0.5 text-[8px] font-bold opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity no-print shadow-md pointer-events-none">
                  <Move className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">Mover</span>
                </div>
              )}
            </div>
          )}

          {/* Si no hay ni sello ni firma */}
          {!config.selloImg && !config.firmaImg && !config.selloFirma && (
            <div 
              onClick={handleSignatureBoxClick}
              className="h-10 px-3 flex items-center justify-center text-[10px] text-slate-400 italic border border-dashed border-slate-300 rounded mb-1 cursor-pointer hover:bg-blue-50"
            >
              + Clic para Firma y Sello
            </div>
          )}
        </div>

        {editableInline && (
          <div 
            onClick={handleSignatureBoxClick}
            className="absolute top-0 right-0 p-1 bg-slate-900/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity no-print cursor-pointer"
            title="Abrir editor de firma y sello"
          >
            <Camera className="w-3 h-3" />
          </div>
        )}

        <div 
          className="w-full border-t pt-1 font-bold tracking-wide"
          style={{ 
            borderColor: config.primaryDocColor,
            fontSize: config.signatureTitleSize || (compact ? '8.5px' : '10px'),
            color: config.signatureTitleColor || '#1e293b',
          }}
        >
          <span
            contentEditable={editableInline}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateConfigField?.('signatureTitle', e.currentTarget.innerText)}
            className={`outline-none cursor-text ${
              editableInline ? 'hover:bg-blue-50/70 hover:ring-1 hover:ring-blue-300 rounded px-1' : ''
            }`}
            title="Haga clic para editar título de la firma"
          >
            {(!config.signatureTitle || config.signatureTitle.includes('Administrador')) ? 'Firma del médico (a)' : config.signatureTitle}
          </span>
        </div>
      </div>
    </div>
  );
};

