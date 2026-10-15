import React, { useRef, useState } from 'react';
import { DoctorConfig } from '../types';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { getMedicalSymbolSVG, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, MEDICINE_EMBLEM_ESCULAPIO_SVG } from '../data/defaultAssets';
import { BasicLogoSelectorModal } from './BasicLogoSelectorModal';

interface DocumentHeaderProps {
  config: DoctorConfig;
  compact?: boolean;
  hideHeader?: boolean;
  title?: string;
  onUpdateField?: (field: keyof DoctorConfig, value: string) => void;
  onUploadLogo?: (side: 'logoIzq' | 'logoDer', dataUrl: string) => void;
  editableInline?: boolean;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  config,
  compact = false,
  hideHeader = false,
  title,
  onUpdateField,
  onUploadLogo,
  editableInline = true,
}) => {
  if (hideHeader) return null;
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const [logoModalSide, setLogoModalSide] = useState<'logoIzq' | 'logoDer' | null>(null);

  const cfg = config || {
    doctorName: '',
    specialty: '',
    mpps: '',
    ci: '',
    collegeNumber: '',
    phone: '',
    email: '',
    headerStyle: 'clasico',
    headerLayout: 'ambos-logos',
    primaryDocColor: '#2563eb',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'logoIzq' | 'logoDer') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') {
        if (onUploadLogo) {
          onUploadLogo(side, evt.target.result);
        } else if (onUpdateField) {
          onUpdateField(side, evt.target.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectLogo = (side: 'logoIzq' | 'logoDer', dataUrl: string) => {
    if (onUploadLogo) {
      onUploadLogo(side, dataUrl);
    } else if (onUpdateField) {
      onUpdateField(side, dataUrl);
    }
  };

  const handleRemoveLogo = (side: 'logoIzq' | 'logoDer') => {
    if (onUploadLogo) {
      onUploadLogo(side, '');
    } else if (onUpdateField) {
      onUpdateField(side, '');
    }
  };

  const layout = (cfg.headerLayout || 'ambos-logos') as string;
  const showLeft = layout !== 'sin-logos' && layout !== 'logo-der';
  const showRight = layout !== 'sin-logos' && layout !== 'logo-izq';

  const logoClasses = cfg.formaLogo === 'logo-redondo'
    ? 'rounded-full object-contain bg-transparent transition-transform'
    : 'rounded-lg object-contain bg-transparent transition-transform';

  const logoBorderColor = cfg.primaryDocColor || '#2563eb';

  // Medical symbols flanking the doctor's name
  const showSymbols = cfg.showMedicalSymbols !== false;
  const symbolType = cfg.medicalSymbolType || 'esculapio';
  const symbolColor = cfg.medicalSymbolColor || cfg.nombreColor || cfg.primaryDocColor || '#2563eb';
  const symbolSvg = getMedicalSymbolSVG(symbolType, symbolColor);

  const leftLogo = cfg.logoIzq !== undefined ? cfg.logoIzq : DIGITAL_MEDIC_OFFICIAL_LOGO_SVG;
  const rightLogo = cfg.logoDer || '';

  const scaleCompact = cfg.headerScaleCompact ?? 0.78;

  return (
    <div 
      className={`relative w-full border-b-2 flex items-center justify-between gap-3 pb-3 mb-3 transition-all ${
        compact ? 'pb-2 mb-2' : 'pb-3.5 mb-3.5'
      } ${
        (config.headerStyle as string) === 'destacado' 
          ? 'bg-slate-50/80 p-3 rounded-xl border-2' 
          : ''
      } ${layout === 'sin-logos' ? 'justify-center text-center' : ''}`}
      style={{ borderColor: config.primaryDocColor }}
    >
      {/* Basic Logo Selector Modal */}
      {logoModalSide && (
        <BasicLogoSelectorModal
          isOpen={!!logoModalSide}
          onClose={() => setLogoModalSide(null)}
          side={logoModalSide}
          currentLogo={logoModalSide === 'logoIzq' ? config.logoIzq : config.logoDer}
          onSelectLogo={handleSelectLogo}
          onRemoveLogo={handleRemoveLogo}
        />
      )}

      {/* Hidden file pickers for direct file input */}
      <input
        ref={leftInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'logoIzq')}
        className="hidden"
      />
      <input
        ref={rightInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'logoDer')}
        className="hidden"
      />

      {/* Left Logo */}
      {showLeft && (leftLogo || editableInline) && (
        <div 
          onClick={() => editableInline && setLogoModalSide('logoIzq')}
          className={`shrink-0 flex items-center justify-center relative group ${
            editableInline ? 'cursor-pointer' : ''
          }`}
          title={editableInline ? "Haga clic para cambiar, elegir logo básico o subir el Logo Izquierdo" : undefined}
        >
          {leftLogo ? (
            <img
              src={leftLogo}
              alt="Logo Izquierdo"
              className={`${logoClasses} transition-transform group-hover:scale-105`}
              style={{
                width: compact ? Math.max(32, (config.logoSize || 52) * 0.75) + 'px' : (config.logoSize || 52) + 'px',
                height: compact ? Math.max(32, (config.logoSize || 52) * 0.75) + 'px' : (config.logoSize || 52) + 'px',
                maxHeight: compact ? Math.max(48, (config.logoSize || 52) * 0.85) + 'px' : Math.max(80, (config.logoSize || 52) * 1.3) + 'px',
                maxWidth: compact ? '80px' : '160px',
                objectFit: 'contain',
                borderColor: logoBorderColor,
              }}
            />
          ) : editableInline ? (
            <div 
              style={{ 
                width: (compact ? 32 : Math.min(48, config.logoSize)) + 'px', 
                height: (compact ? 32 : Math.min(48, config.logoSize)) + 'px',
                borderColor: logoBorderColor
              }}
              className="rounded-xl bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center text-[9px] text-slate-400 no-print hover:border-blue-500 hover:text-blue-600 transition-colors p-1 text-center"
            >
              <ImageIcon className="w-3.5 h-3.5 mb-0.5 opacity-60" />
              <span>+ Logo</span>
            </div>
          ) : null}

          {editableInline && leftLogo && (
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white no-print">
              <Camera className="w-3.5 h-3.5 drop-shadow" />
            </div>
          )}
        </div>
      )}

      {/* Central Medical Text Header Box */}
      <div className={`flex-1 text-center px-1 ${layout === 'sin-logos' ? 'max-w-xl mx-auto py-1' : ''}`}>
        
        {/* Cajón 1: Institución / Clínica / Hospital (Solo si el médico definió una institución) */}
        {config.institution && config.institution.trim() !== '' && (
          <div
            contentEditable={editableInline}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField?.('institution', e.currentTarget.innerText.trim())}
            className={`font-bold uppercase tracking-wider transition-colors outline-none cursor-text ${
              compact ? 'mb-0.5' : 'mb-0.5'
            } ${editableInline ? 'hover:bg-blue-50/70 hover:ring-1 hover:ring-blue-300 rounded px-1' : ''}`}
            style={{
              color: config.institutionColor || config.headerColor,
              fontFamily: config.fuenteInstitution || config.fuenteHeader,
              fontSize: config.institutionSize ? (compact ? `calc(${config.institutionSize} * ${scaleCompact})` : config.institutionSize) : (compact ? '10px' : '11px'),
            }}
            title="Haga clic para editar nombre de la Institución o Clínica"
          >
            {config.institution}
          </div>
        )}

        {/* Cajón 2: Nombre del Médico / Colega Flanqueado por 2 Símbolos de la Medicina */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 my-0.5">
          {showSymbols && (
            <span 
              className="shrink-0 inline-flex items-center justify-center opacity-85 select-none print:opacity-100"
              title="Símbolo Médico Oficial"
            >
              <img 
                src={symbolSvg} 
                alt="Símbolo de la Medicina" 
                className="inline-block transition-transform hover:scale-110"
                style={{ 
                  width: compact ? '13px' : '17px', 
                  height: compact ? '13px' : '17px' 
                }} 
              />
            </span>
          )}

          <div
            contentEditable={editableInline}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField?.('doctorName', e.currentTarget.innerText)}
            className={`font-bold tracking-normal transition-all outline-none cursor-text break-words inline-block text-center ${
              editableInline ? 'hover:bg-blue-50/70 hover:ring-1 hover:ring-blue-300 rounded px-1.5' : ''
            }`}
            style={{
              color: config.nombreColor,
              fontFamily: config.fuenteNombre,
              fontSize: compact ? `calc(${config.nombreSize} * ${scaleCompact})` : config.nombreSize,
              letterSpacing: '0.015em',
              lineHeight: '1.35',
              whiteSpace: 'normal',
            }}
            title="Haga clic para editar el Nombre del Médico"
          >
            {config.doctorName || (editableInline ? 'Dr. [Nombre del Médico]' : '')}
          </div>

          {showSymbols && (
            <span 
              className="shrink-0 inline-flex items-center justify-center opacity-85 select-none print:opacity-100"
              title="Símbolo Médico Oficial"
            >
              <img 
                src={symbolSvg} 
                alt="Símbolo de la Medicina" 
                className="inline-block transition-transform hover:scale-110"
                style={{ 
                  width: compact ? '13px' : '17px', 
                  height: compact ? '13px' : '17px' 
                }} 
              />
            </span>
          )}
        </div>

        {/* Cajón 3: Especialidad Médica */}
        {(() => {
          const rawSpecialty = (config.specialty || '').trim();
          const cleanSpecialty = rawSpecialty === 'Administración del Sistema' ? '' : rawSpecialty;
          if (!cleanSpecialty && !editableInline) return null;
          return (
            <div
              contentEditable={editableInline}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.('specialty', e.currentTarget.innerText)}
              className={`font-semibold transition-colors leading-tight outline-none cursor-text ${
                compact ? 'mt-0.5' : 'mt-1'
              } ${editableInline ? 'hover:bg-blue-50/70 hover:ring-1 hover:ring-blue-300 rounded px-1' : ''}`}
              style={{
                color: config.specialtyColor || config.headerColor,
                fontFamily: config.fuenteSpecialty || config.fuenteHeader,
                fontSize: config.specialtySize ? (compact ? `calc(${config.specialtySize} * ${scaleCompact})` : config.specialtySize) : (compact ? '10px' : '12px'),
              }}
              title="Haga clic para editar Especialidad Médica"
            >
              {cleanSpecialty || (editableInline ? 'Especialista en [Especialidad]' : '')}
            </div>
          );
        })()}

        {/* Cajón 3B: Educación Médica Continua / Postgrados / Diplomados */}
        {(() => {
          const rawEducacion = (config.educacionContinua || '').trim();
          if (!rawEducacion) return null;
          return (
            <div
              contentEditable={editableInline}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.('educacionContinua', e.currentTarget.innerText.trim())}
              className={`font-medium transition-colors leading-tight outline-none cursor-text ${
                compact ? 'mt-0.5' : 'mt-1'
              } ${editableInline ? 'hover:bg-blue-50/70 hover:ring-1 hover:ring-blue-300 rounded px-1' : ''}`}
              style={{
                color: config.educacionColor || config.specialtyColor || config.headerColor,
                fontFamily: config.fuenteEducacion || config.fuenteSpecialty || config.fuenteHeader,
                fontSize: config.educacionSize ? (compact ? `calc(${config.educacionSize} * ${scaleCompact})` : config.educacionSize) : (compact ? '8.5px' : '10.5px'),
              }}
              title="Educación Continua / Postgrados / Diplomados"
            >
              {rawEducacion}
            </div>
          );
        })()}

        {/* Cajón 4: Credenciales Legales (MPPS, C.I., Colegio) */}
        <div
          className={`transition-colors leading-tight flex items-center justify-center flex-wrap gap-1.5 ${
            compact ? 'mt-0.5' : 'mt-1'
          }`}
          style={{ 
            fontFamily: config.fuenteCredentials || config.fuenteHeader,
            color: config.credentialsColor || '#475569',
            fontSize: config.credentialsSize ? (compact ? `calc(${config.credentialsSize} * ${scaleCompact})` : config.credentialsSize) : (compact ? '9px' : '11px'),
          }}
        >
          <span>
            MPPS:{' '}
            <span
              contentEditable={editableInline}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.('mpps', e.currentTarget.innerText)}
              className={`outline-none font-medium ${
                editableInline ? 'hover:bg-blue-50/70 rounded px-0.5' : ''
              }`}
            >
              {config.mpps}
            </span>
          </span>
          <span className="opacity-40">·</span>
          <span>
            C.I:{' '}
            <span
              contentEditable={editableInline}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.('ci', e.currentTarget.innerText)}
              className={`outline-none font-medium ${
                editableInline ? 'hover:bg-blue-50/70 rounded px-0.5' : ''
              }`}
            >
              {config.ci}
            </span>
          </span>
          {config.rif && (
            <>
              <span className="opacity-40">·</span>
              <span>
                RIF:{' '}
                <span
                  contentEditable={editableInline}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.('rif', e.currentTarget.innerText)}
                  className={`outline-none font-medium ${
                    editableInline ? 'hover:bg-blue-50/70 rounded px-0.5' : ''
                  }`}
                >
                  {config.rif}
                </span>
              </span>
            </>
          )}
          {config.collegeNumber && config.collegeNumber.trim() !== '' && (
            <>
              <span className="opacity-40">·</span>
              <span
                contentEditable={editableInline}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField?.('collegeNumber', e.currentTarget.innerText.trim())}
                className={`outline-none font-medium ${
                  editableInline ? 'hover:bg-blue-50/70 rounded px-0.5' : ''
                }`}
              >
                {config.collegeNumber}
              </span>
            </>
          )}
        </div>

        {/* Cajón 5: Sub-detalles (Ubicación de consultorio, horarios - Solo si existen) */}
        {!compact && config.institutionDetails && config.institutionDetails.trim() !== '' && (
          <div 
            contentEditable={editableInline}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField?.('institutionDetails', e.currentTarget.innerText.trim())}
            className={`mt-1 italic leading-tight outline-none cursor-text ${
              editableInline ? 'hover:bg-blue-50/70 hover:ring-1 hover:ring-blue-300 rounded px-1' : ''
            }`}
            style={{ 
              fontFamily: config.fuenteDetails || config.fuenteHeader,
              color: config.detailsColor || '#64748b',
              fontSize: config.detailsSize || '9.5px',
            }}
            title="Haga clic para editar dirección, piso o consultorio"
          >
            {config.institutionDetails}
          </div>
        )}

        {/* Cajón 6: Contacto / Teléfono / Redes / Correo (Editable Inline) */}
        {(config.phone || config.email || config.socialHandle || config.socialHandle2 || editableInline) && (
          <div 
            className="mt-1 text-[9px] flex items-center justify-center flex-wrap gap-2 text-slate-500"
            style={{
              fontFamily: config.fuenteContact || config.fuenteHeader,
              color: config.contactColor || '#64748b',
              fontSize: config.contactSize || '9px',
            }}
          >
            {(config.phone || editableInline) && (
              <span>
                Tel:{' '}
                <span
                  contentEditable={editableInline}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.('phone', e.currentTarget.innerText)}
                  className={`outline-none font-medium ${editableInline ? 'hover:bg-blue-50/70 rounded px-0.5 cursor-text' : ''}`}
                  title="Haga clic para editar Teléfono"
                >
                  {config.phone || (editableInline ? '[Teléfono]' : '')}
                </span>
              </span>
            )}
            {(config.email || editableInline) && (
              <span>
                <span
                  contentEditable={editableInline}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.('email', e.currentTarget.innerText)}
                  className={`outline-none font-medium ${editableInline ? 'hover:bg-blue-50/70 rounded px-0.5 cursor-text' : ''}`}
                  title="Haga clic para editar Correo"
                >
                  {config.email || (editableInline ? '[Correo Electrónico]' : '')}
                </span>
              </span>
            )}
            {(config.socialHandle || editableInline) && (
              <span>
                <span
                  contentEditable={editableInline}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.('socialHandle', e.currentTarget.innerText)}
                  className={`outline-none font-medium ${editableInline ? 'hover:bg-blue-50/70 rounded px-0.5 cursor-text' : ''}`}
                  title="Haga clic para editar Redes Sociales"
                >
                  {config.socialHandle || (editableInline ? '[@Redes]' : '')}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right Logo */}
      {showRight && (rightLogo || editableInline) && (
        <div 
          onClick={() => editableInline && setLogoModalSide('logoDer')}
          className={`shrink-0 flex items-center justify-center relative group ${
            editableInline ? 'cursor-pointer' : ''
          }`}
          title={editableInline ? "Haga clic para cambiar, elegir logo básico o subir el Logo Derecho" : undefined}
        >
          {rightLogo ? (
            <img
              src={rightLogo}
              alt="Logo Derecho"
              className={`${logoClasses} transition-transform group-hover:scale-105`}
              style={{
                width: compact ? Math.max(32, (config.logoSize || 52) * 0.75) + 'px' : (config.logoSize || 52) + 'px',
                height: compact ? Math.max(32, (config.logoSize || 52) * 0.75) + 'px' : (config.logoSize || 52) + 'px',
                maxHeight: compact ? Math.max(48, (config.logoSize || 52) * 0.85) + 'px' : Math.max(80, (config.logoSize || 52) * 1.3) + 'px',
                maxWidth: compact ? '80px' : '160px',
                objectFit: 'contain',
                borderColor: logoBorderColor,
              }}
            />
          ) : editableInline ? (
            <div 
              style={{ 
                width: (compact ? 32 : Math.min(48, config.logoSize)) + 'px', 
                height: (compact ? 32 : Math.min(48, config.logoSize)) + 'px',
                borderColor: logoBorderColor
              }}
              className="rounded-xl bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center text-[9px] text-slate-400 no-print hover:border-blue-500 hover:text-blue-600 transition-colors p-1 text-center"
            >
              <ImageIcon className="w-3.5 h-3.5 mb-0.5 opacity-60" />
              <span>+ Logo</span>
            </div>
          ) : null}

          {editableInline && rightLogo && (
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white no-print">
              <Camera className="w-3.5 h-3.5 drop-shadow" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
