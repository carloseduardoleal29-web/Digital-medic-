import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  ClipboardList, 
  Grid2X2,
  FileCheck2,
  Download
} from 'lucide-react';
import { 
  DoctorConfig, 
  RecipeItem, 
  MedicalReport, 
  MedicalRestCert, 
  IndicationsSheet, 
  ClinicalRecord,
  ActiveModule 
} from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';

interface UniversalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DoctorConfig;
  activeModule: ActiveModule;
  onSelectModule?: (mod: ActiveModule) => void;
  recipe: RecipeItem;
  recipes4en1?: RecipeItem[];
  currentReport: MedicalReport;
  medicalRestCert: MedicalRestCert;
  indicationsSheet: IndicationsSheet;
  clinicalRecord?: ClinicalRecord;
  onConfirmPrint: () => void;
  onConfirmDownloadPdf?: () => void;
}

export const UniversalPreviewModal: React.FC<UniversalPreviewModalProps> = ({
  isOpen,
  onClose,
  config,
  activeModule,
  onSelectModule,
  recipe,
  recipes4en1 = [],
  currentReport,
  medicalRestCert,
  indicationsSheet,
  clinicalRecord,
  onConfirmPrint,
  onConfirmDownloadPdf,
}) => {
  const previewSheetRef = useRef<HTMLDivElement>(null);
  const [selectedPreviewModule, setSelectedPreviewModule] = useState<ActiveModule>(activeModule);
  const [zoom, setZoom] = useState<number>(100);

  // Sync with prop when opened and auto-scale zoom based on screen width to avoid massive text/borders
  React.useEffect(() => {
    if (isOpen) {
      setSelectedPreviewModule(activeModule);
      
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const isMobile = screenWidth < 768;

      if (activeModule === 'recipe-master' || activeModule === 'diseno') {
        setZoom(isMobile ? 45 : 80);
      } else if (activeModule === 'recipe-4en1') {
        setZoom(isMobile ? 30 : 40);
      } else if (activeModule === 'informes') {
        setZoom(isMobile ? 28 : 38); // Scaled slightly down to prevent text overflowing
      } else {
        setZoom(isMobile ? 30 : 40); // Scaled slightly down to prevent text overflowing
      }
    }
  }, [activeModule, isOpen]);

  // Adjust zoom automatically as they switch format tabs in the preview modal
  React.useEffect(() => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const isMobile = screenWidth < 768;

    if (selectedPreviewModule === 'recipe-master' || selectedPreviewModule === 'diseno') {
      setZoom(isMobile ? 45 : 80);
    } else if (selectedPreviewModule === 'recipe-4en1') {
      setZoom(isMobile ? 30 : 40);
    } else if (selectedPreviewModule === 'informes') {
      setZoom(isMobile ? 28 : 38);
    } else {
      setZoom(isMobile ? 30 : 40);
    }
  }, [selectedPreviewModule]);

  if (!isOpen) return null;

  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      onConfirmPrint();
    }, 150);
  };

  const borderStyle = getDocumentBorderStyle(config.borderStyle, config.primaryDocColor);
  const textureClass = getPaperTextureClass(config.paperTexture);

  // Specifications based on module
  const getFormatSpecs = () => {
    switch (selectedPreviewModule) {
      case 'recipe-master':
      case 'diseno':
        return {
          name: 'Récipe Médico Individual',
          sizeName: 'Media Carta (14 x 21.5 cm) - Formato Pequeño Estándar',
          widthClass: 'w-[560px] min-h-[790px]',
          sheetBadge: 'Récipe Pequeño Clínico',
        };
      case 'recipe-4en1':
        return {
          name: 'Récipes Múltiples',
          sizeName: 'Hoja Carta (21.6 x 27.9 cm) con 4 Récipes de Bolsillo',
          widthClass: 'w-[840px] min-h-[1050px]',
          sheetBadge: 'Récipes en Cuadrantes',
        };
      case 'informes':
        return {
          name: 'Informe Médico Oficial',
          sizeName: 'Hoja Carta Completa (1 Sola Página Oficial 21.6 x 27.9 cm)',
          widthClass: 'w-[780px] min-h-[1050px]',
          sheetBadge: '1 Sola Hoja Carta Completa',
        };
      case 'reposo':
        return {
          name: 'Certificado de Reposo Médico (Constancia)',
          sizeName: 'Media Carta o Carta (Formato Oficial con Diagnóstico y Días)',
          widthClass: 'w-[680px] min-h-[880px]',
          sheetBadge: 'Constancia Oficial con Sello',
        };
      case 'indicaciones':
        return {
          name: 'Hoja de Indicaciones al Paciente',
          sizeName: 'Media Carta / Formato Tratamiento y Dieta',
          widthClass: 'w-[680px] min-h-[900px]',
          sheetBadge: 'Indicaciones Médicas Claras',
        };
      case 'historias':
      default:
        return {
          name: 'Historia Clínica',
          sizeName: 'Hoja Carta Expediente',
          widthClass: 'w-[780px] min-h-[1000px]',
          sheetBadge: 'Expediente Clínico',
        };
    }
  };

  const specs = getFormatSpecs();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Top Header & Document Switcher */}
      <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white shrink-0 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">Vista Previa Fiel 1:1 de Impresión y PDF</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {specs.sheetBadge.replace('4 en 1', 'Récipes')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Formato exacto: <span className="text-slate-200 font-semibold">{specs.sizeName}</span>
            </p>
          </div>
        </div>

        {/* Switch between Documents */}
        <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/80 gap-1 overflow-x-auto max-w-full">
          {[
            { id: 'recipe-master', label: 'Récipe', icon: FileCheck2 },
            { id: 'recipe-4en1', label: 'Récipes', icon: Grid2X2 },
            { id: 'informes', label: 'Informe (1 Hoja)', icon: FileText },
            { id: 'reposo', label: 'Reposo / Constancia', icon: ShieldCheck },
            { id: 'indicaciones', label: 'Indicaciones', icon: ClipboardList },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedPreviewModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedPreviewModule(item.id as ActiveModule);
                  onSelectModule?.(item.id as ActiveModule);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions & Zoom */}
        <div className="flex items-center gap-2.5">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs text-slate-300">
            <button
              onClick={() => setZoom((z) => Math.max(20, z - 5))}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
              title="Reducir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono font-bold text-xs">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(130, z + 5))}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="px-2 py-1 ml-0.5 hover:bg-slate-700 rounded-lg text-[10px] font-semibold text-slate-400"
            >
              100%
            </button>
          </div>

          <button
            onClick={async () => {
              if (onConfirmDownloadPdf) {
                await onConfirmDownloadPdf();
              } else {
                onConfirmPrint();
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            title="Descargar archivo PDF directamente a su equipo"
          >
            <Download className="w-4 h-4 text-emerald-100" />
            <span>Descargar PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            title="Imprimir en impresora física conectada"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>

          {/* Prominent Red Exit Button requested by the user */}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            title="Salir de Vista Previa"
          >
            <X className="w-4 h-4" />
            <span>Salir de Vista Previa</span>
          </button>
        </div>
      </div>

      {/* Main Canvas with the exact sheet rendered */}
      <div className="flex-1 overflow-auto p-3 sm:p-6 flex justify-center items-start bg-slate-950/70">
        <div 
          ref={previewSheetRef}
          className="my-4 transition-all"
          style={{ 
            zoom: zoom / 100,
            transformOrigin: 'top center'
          }}
        >

          {/* ========================================================= */}
          {/* CASE 1: RÉCIPE MÉDICO INDIVIDUAL (MEDIA CARTA / PEQUEÑO) */}
          {/* ========================================================= */}
          {(selectedPreviewModule === 'recipe-master' || selectedPreviewModule === 'diseno') && (
            <div
              className={`relative ${specs.widthClass} bg-white shadow-2xl p-7 transition-all flex flex-col justify-between print-container recipe-single-container ${textureClass} ${
                config.enforcePureBlackText ? 'enforce-pure-black' : ''
              }`}
              style={{
                backgroundColor: config.tonePapel || '#ffffff',
                border: borderStyle,
                borderRadius: config.docCornerRadius || '16px',
              }}
            >
              {config.marcaAgua && (
                <div className="marca-agua">
                  <img
                    src={config.marcaAgua}
                    alt="Marca de agua"
                    className="marca-agua-img"
                    style={{
                      opacity: config.watermarkOpacity ?? 0.12,
                      width: `${config.watermarkScale || 55}%`,
                      transform: `rotate(${config.watermarkRotation || 0}deg)`,
                    }}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col h-full justify-between flex-1">
                <div>
                  <DocumentHeader config={config} compact={false} editableInline={false} />
                  
                  {/* Patient Bar - Clean 2-Line Layout */}
                  <div 
                    className="py-2 px-3 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-2.5 space-y-1.5 shadow-2xs text-xs"
                    style={{ fontSize: config.patientBarSize || '11.5px' }}
                  >
                    {/* Line 1: Paciente y Cédula */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-800 shrink-0">Paciente:</span>
                        <span className="font-semibold text-slate-900 truncate">{recipe.patientName || '—'}</span>
                      </div>
                      <div className="min-w-[140px] flex items-center gap-1.5 shrink-0">
                        <span className="font-bold text-slate-800 shrink-0">C.I. / Doc:</span>
                        <span className="font-semibold text-slate-900">{recipe.patientCI || '—'}</span>
                      </div>
                    </div>

                    {/* Line 2: Edad, Teléfono y Fecha */}
                    <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-200/60 items-center">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-800 shrink-0">Edad:</span>
                        <span className="font-semibold text-slate-900">{recipe.patientAge || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-800 shrink-0">Teléfono:</span>
                        <span className="font-semibold text-slate-900">{recipe.patientPhone || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-800 shrink-0">Fecha:</span>
                        <span className="font-semibold text-slate-900">{recipe.date || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {recipe.diagnosis && (
                    <div className="mb-2 px-1 text-xs flex items-center gap-2">
                      <span className="font-bold text-slate-700 shrink-0">Dx / Diagnóstico:</span>
                      <span className="text-slate-800 font-medium">{recipe.diagnosis}</span>
                    </div>
                  )}
                </div>

                {/* Prescription Body (Rp.) */}
                <div className="flex-1 my-2 flex flex-col">
                  <div 
                    className="font-bold text-base mb-1 flex items-center gap-2"
                    style={{ 
                      color: config.rxTitleColor || config.primaryDocColor,
                      fontFamily: "'Playfair Display', serif"
                    }}
                  >
                    <span className="text-2xl font-black italic">{config.rxTitle || 'Rp.'}</span>
                  </div>

                  <div
                    className="w-full flex-1 whitespace-pre-wrap leading-relaxed text-slate-800 font-medium"
                    style={{
                      fontSize: config.bodyFontSize || '13px',
                      minHeight: '260px',
                    }}
                  >
                    {recipe.rp || (
                      <span className="italic text-slate-400">
                        Sin medicamentos o indicaciones asignadas todavía.
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer with Seal & Stamp */}
                <div className="mt-2">
                  <DocumentFooter
                    config={config}
                    compact={false}
                    notesText={recipe.indicationsNotes || config.footerNotesText}
                    editableInline={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CASE 2: 4 EN 1 (HOJA CARTA DIVIDIDA EN 4 RÉCIPES DE BOLSILLO) */}
          {/* ========================================================= */}
          {selectedPreviewModule === 'recipe-4en1' && (
            <div
              className={`relative ${specs.widthClass} bg-white shadow-2xl p-4 transition-all print-container recipe-4en1-container ${textureClass} ${
                config.enforcePureBlackText ? 'enforce-pure-black' : ''
              }`}
              style={{
                backgroundColor: config.tonePapel || '#ffffff',
                border: borderStyle,
                borderRadius: config.docCornerRadius || '16px',
              }}
            >
              <div className="grid grid-cols-2 grid-rows-2 gap-3 relative z-10">
                {(recipes4en1.length === 4 ? recipes4en1 : [recipe, recipe, recipe, recipe]).map((rec, idx) => (
                  <div
                    key={idx}
                    className="relative border border-dashed border-slate-300 rounded-xl p-3 bg-white/40 backdrop-blur-[0.5px] flex flex-col justify-between min-h-[500px] overflow-hidden"
                  >
                    {/* Watermark inside each recipe quadrant */}
                    {config.marcaAgua && (
                      <div className="marca-agua pointer-events-none">
                        <img
                          src={config.marcaAgua}
                          alt="Marca de agua"
                          className="marca-agua-img"
                          style={{
                            opacity: config.watermarkOpacity ?? 0.12,
                            width: `${Math.min(65, config.watermarkScale || 55)}%`,
                            transform: `rotate(${config.watermarkRotation || 0}deg)`,
                          }}
                        />
                      </div>
                    )}

                    <div className="relative z-10">
                      <DocumentHeader config={config} compact={true} editableInline={false} />
                      <div className="grid grid-cols-2 gap-1 py-1 px-2 bg-slate-50/60 border border-slate-200/80 rounded-lg text-[10px] my-1.5">
                        <div className="truncate">
                          <span className="font-bold text-slate-700">Pac: </span>
                          <span className="font-semibold text-slate-900">{rec.patientName || '—'}</span>
                        </div>
                        <div className="text-right truncate">
                          <span className="font-bold text-slate-700">C.I: </span>
                          <span className="font-semibold text-slate-900">{rec.patientCI || '—'}</span>
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-700">Dx: </span>
                          <span className="text-slate-800">{rec.diagnosis || '—'}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-700">Fecha: </span>
                          <span>{rec.date || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 my-1 relative z-10">
                      <span className="font-bold text-xs block text-blue-700 font-serif">℞ Rp.</span>
                      <p className="text-[11px] text-slate-800 whitespace-pre-wrap leading-tight mt-1 font-sans">
                        {rec.rp || 'Sin prescripción'}
                      </p>
                    </div>

                    <div className="mt-1 pt-1 border-t border-slate-200/80 relative z-10">
                      <DocumentFooter
                        config={config}
                        compact={true}
                        notesText={rec.indicationsNotes}
                        editableInline={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CASE 3: INFORME MÉDICO (1 SOLA HOJA CARTA COMPLETA) */}
          {/* ========================================================= */}
          {selectedPreviewModule === 'informes' && (
            <div
              className={`relative ${specs.widthClass} bg-white shadow-2xl p-6 sm:p-7 transition-all flex flex-col justify-between print-container report-sheet-container ${textureClass} ${
                config.enforcePureBlackText ? 'enforce-pure-black' : ''
              }`}
              style={{
                backgroundColor: config.tonePapel || '#ffffff',
                border: borderStyle,
                borderRadius: config.docCornerRadius || '16px',
              }}
            >
              {config.marcaAgua && (
                <div className="marca-agua">
                  <img
                    src={config.marcaAgua}
                    alt="Marca de agua"
                    className="marca-agua-img"
                    style={{
                      opacity: config.watermarkOpacity ?? 0.12,
                      width: `${config.watermarkScale || 55}%`,
                      transform: `rotate(${config.watermarkRotation || 0}deg)`,
                    }}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col h-full flex-1">
                <DocumentHeader config={config} compact={false} editableInline={false} />

                {/* Title */}
                <div className="text-center my-2 pb-1.5 border-b border-slate-200">
                  <h1 
                    className="text-base font-black tracking-wide uppercase"
                    style={{ color: config.primaryDocColor }}
                  >
                    INFORME MÉDICO
                  </h1>
                </div>

                {/* Patient Bar - Clean 2-Line Layout */}
                <div 
                  className="py-2 px-3 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-3 space-y-1.5 shadow-2xs text-xs"
                  style={{ fontSize: config.patientBarSize || '11.5px' }}
                >
                  {/* Line 1: Paciente y Cédula */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-slate-800 shrink-0">Paciente:</span>
                      <span className="font-bold text-slate-900 truncate">{currentReport.patientName || '—'}</span>
                    </div>
                    <div className="min-w-[140px] flex items-center gap-1.5 shrink-0">
                      <span className="font-bold text-slate-800 shrink-0">C.I. / Doc:</span>
                      <span className="font-semibold text-slate-900">{currentReport.patientCI || '—'}</span>
                    </div>
                  </div>

                  {/* Line 2: Edad, Teléfono y Fecha */}
                  <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-200/60 items-center">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-slate-800 shrink-0">Edad:</span>
                      <span className="font-semibold text-slate-900">{currentReport.patientAge || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-slate-800 shrink-0">Teléfono:</span>
                      <span className="font-semibold text-slate-900">{currentReport.patientPhone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-slate-800 shrink-0">Fecha:</span>
                      <span className="font-semibold text-slate-900">{currentReport.date || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div 
                  className="space-y-3 flex-1"
                  style={{
                    fontSize: config.reportFontSize || '12px',
                    fontFamily: config.reportFontFamily || 'inherit',
                  }}
                >
                  <div>
                    <span className="font-bold text-slate-800 uppercase block tracking-wider mb-0.5" style={{ color: config.primaryDocColor }}>
                      1. Resumen Clínico / Motivo de Consulta:
                    </span>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100">
                      {currentReport.clinicalSummary || 'Sin resumen registrado.'}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 uppercase block tracking-wider mb-0.5" style={{ color: config.primaryDocColor }}>
                      2. Procedimientos / Examen Físico:
                    </span>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100">
                      {currentReport.procedures || 'Sin procedimientos reportados.'}
                    </p>
                  </div>

                  {currentReport.paraclinicalStudies && (
                    <div>
                      <span className="font-bold text-slate-800 uppercase block tracking-wider mb-0.5" style={{ color: config.primaryDocColor }}>
                        3. Estudios Paraclínicos y Exámenes:
                      </span>
                      <p className="text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100">
                        {currentReport.paraclinicalStudies}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="font-bold text-slate-800 uppercase block tracking-wider mb-0.5" style={{ color: config.primaryDocColor }}>
                      4. Impresión Diagnóstica (CIE):
                    </span>
                    <p className="text-slate-900 font-semibold whitespace-pre-wrap leading-relaxed bg-blue-50/40 p-2 rounded border border-blue-100">
                      {currentReport.diagnosticImpression || 'Sin diagnóstico pautado.'}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 uppercase block tracking-wider mb-0.5" style={{ color: config.primaryDocColor }}>
                      5. Plan Terapéutico y Recomendaciones:
                    </span>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100">
                      {currentReport.treatmentPlan || currentReport.recommendations || 'Sin recomendaciones registradas.'}
                    </p>
                  </div>

                  {/* 6. Reposo Médico Pautado si fue indicado */}
                  {currentReport.daysRest && (
                    <div className="p-2 sm:p-2.5 bg-blue-50/80 border border-blue-200/90 rounded-xl text-center font-sans mt-2 shadow-2xs">
                      <span className="text-blue-950 font-bold block text-xs">
                        REPOSO MÉDICO SUGERIDO: {currentReport.daysRest} CONTINUOS
                      </span>
                      {(currentReport.restStartDate || currentReport.restEndDate) && (
                        <span className="text-blue-800 text-[11px] block mt-0.5">
                          Vigencia: Desde el <strong>{currentReport.restStartDate || currentReport.date}</strong> hasta el <strong>{currentReport.restEndDate || '—'}</strong> inclusive.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-3 pt-1">
                  <DocumentFooter config={config} compact={false} editableInline={false} />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CASE 4: CERTIFICADO DE REPOSO MÉDICO (CONSTANCIA OFICIAL) */}
          {/* ========================================================= */}
          {selectedPreviewModule === 'reposo' && (
            <div
              className={`relative ${specs.widthClass} bg-white shadow-2xl p-8 transition-all flex flex-col justify-between print-container rest-container ${textureClass} ${
                config.enforcePureBlackText ? 'enforce-pure-black' : ''
              }`}
              style={{
                backgroundColor: config.tonePapel || '#ffffff',
                border: borderStyle,
                borderRadius: config.docCornerRadius || '16px',
              }}
            >
              {config.marcaAgua && (
                <div className="marca-agua">
                  <img
                    src={config.marcaAgua}
                    alt="Marca de agua"
                    className="marca-agua-img"
                    style={{
                      opacity: config.watermarkOpacity ?? 0.12,
                      width: `${config.watermarkScale || 55}%`,
                      transform: `rotate(${config.watermarkRotation || 0}deg)`,
                    }}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col h-full flex-1 justify-between">
                <div>
                  <DocumentHeader config={config} compact={false} editableInline={false} />

                  <div className="text-center my-4 pb-2 border-b border-slate-200">
                    <h1 
                      className="text-base font-black tracking-widest uppercase"
                      style={{ color: config.primaryDocColor }}
                    >
                      CONSTANCIA MÉDICA
                    </h1>
                  </div>

                  {/* Body Text */}
                  <div 
                    className="my-6 p-4 bg-slate-50/40 backdrop-blur-[0.5px] border border-slate-200/90 rounded-xl leading-relaxed text-slate-800 space-y-3"
                    style={{
                      fontSize: config.medicalRestFontSize || '13px',
                      fontFamily: config.medicalRestFontFamily || "'Merriweather', serif",
                    }}
                  >
                    <p>
                      Quien suscribe, <strong className="text-slate-900">{config.doctorName}</strong>, médico especialista en{' '}
                      <strong>{config.specialty}</strong>, portador del Registro Sanitario MPPS Nº <strong>{config.mpps}</strong> y Colegio de Médicos Nº <strong>{config.collegeNumber}</strong>, certifica haber evaluado clínicamente a:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-white/40 backdrop-blur-[0.5px] border border-slate-200/90 rounded-lg text-xs font-sans">
                      <div>
                        <span className="text-slate-500 block">Paciente:</span>
                        <strong className="text-slate-900">{medicalRestCert.patientName || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Cédula de Identidad / Doc:</span>
                        <strong className="text-slate-900">{medicalRestCert.patientCI || '—'}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 block">Empresa / Destinatario:</span>
                        <strong className="text-slate-800">{medicalRestCert.companyName || 'A quien corresponda'}</strong>
                      </div>
                    </div>

                    <p>
                      Presentando cuadro clínico compatible con: <strong className="text-blue-900 font-sans">{medicalRestCert.diagnosis || 'Evaluación médica'}</strong>.
                    </p>

                    <div className="p-3 bg-blue-50/40 backdrop-blur-[0.5px] border border-blue-200/90 rounded-lg text-center font-sans">
                      <span className="text-blue-950 font-bold block text-sm">
                        REPOSO MÉDICO RECOMENDADO: {medicalRestCert.daysRest} DÍAS CONTINUOS
                      </span>
                      <span className="text-blue-800 text-xs">
                        Vigencia: Desde el <strong>{medicalRestCert.startDate}</strong> hasta el <strong>{medicalRestCert.endDate}</strong> inclusive.
                      </span>
                    </div>

                    {medicalRestCert.observations && (
                      <p className="text-[11px] text-slate-600 font-sans">
                        <strong>Observaciones:</strong> {medicalRestCert.observations}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <DocumentFooter config={config} compact={false} editableInline={false} />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CASE 5: HOJA DE INDICACIONES MÉDICAS AL PACIENTE */}
          {/* ========================================================= */}
          {selectedPreviewModule === 'indicaciones' && (
            <div
              className={`relative ${specs.widthClass} bg-white shadow-2xl p-8 transition-all flex flex-col justify-between print-container indications-container ${textureClass} ${
                config.enforcePureBlackText ? 'enforce-pure-black' : ''
              }`}
              style={{
                backgroundColor: config.tonePapel || '#ffffff',
                border: borderStyle,
                borderRadius: config.docCornerRadius || '16px',
              }}
            >
              {config.marcaAgua && (
                <div className="marca-agua">
                  <img
                    src={config.marcaAgua}
                    alt="Marca de agua"
                    className="marca-agua-img"
                    style={{
                      opacity: config.watermarkOpacity ?? 0.12,
                      width: `${config.watermarkScale || 55}%`,
                      transform: `rotate(${config.watermarkRotation || 0}deg)`,
                    }}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col h-full flex-1 justify-between">
                <div>
                  <DocumentHeader config={config} compact={false} editableInline={false} />

                  <div className="text-center my-3 pb-2 border-b border-slate-200">
                    <h1 
                      className="text-base font-black tracking-wide uppercase"
                      style={{ color: config.primaryDocColor }}
                    >
                      INDICACIONES
                    </h1>
                  </div>

                  {/* Patient Bar - Clean 2-Line Layout */}
                  <div 
                    className="py-2 px-3 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-3 space-y-1.5 shadow-2xs text-xs"
                    style={{ fontSize: config.patientBarSize || '11.5px' }}
                  >
                    {/* Line 1: Paciente y Cédula */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-800 shrink-0">Paciente:</span>
                        <strong className="text-slate-900 truncate">{indicationsSheet.patientName || '—'}</strong>
                      </div>
                      <div className="min-w-[140px] flex items-center gap-1.5 shrink-0">
                        <span className="font-bold text-slate-800 shrink-0">C.I. / Doc:</span>
                        <span className="font-semibold text-slate-900">{indicationsSheet.patientCI || '—'}</span>
                      </div>
                    </div>

                    {/* Line 2: Edad, Teléfono y Fecha */}
                    <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-200/60 items-center">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-800 shrink-0">Edad:</span>
                        <span className="font-semibold text-slate-900">{indicationsSheet.patientAge || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-800 shrink-0">Teléfono:</span>
                        <span className="font-semibold text-slate-900">{indicationsSheet.patientPhone || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-800 shrink-0">Fecha:</span>
                        <span className="font-semibold text-slate-900">{indicationsSheet.date || '—'}</span>
                      </div>
                    </div>

                    {/* Line 3: Diagnóstico Clínico */}
                    {indicationsSheet.diagnosis && (
                      <div className="pt-1 border-t border-slate-200/60 text-[11px] flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 shrink-0">Dx:</span>
                        <span className="font-semibold text-slate-900 truncate">{indicationsSheet.diagnosis}</span>
                      </div>
                    )}
                  </div>

                  {/* Indications Content */}
                  <div 
                    className="space-y-3"
                    style={{
                      fontSize: config.indicationsFontSize || '12.5px',
                      fontFamily: config.indicationsFontFamily || 'inherit',
                    }}
                  >
                    <div>
                      <span className="font-bold text-slate-800 uppercase block tracking-wider mb-0.5" style={{ color: config.primaryDocColor }}>
                        1. Horario y Posología de Medicamentos:
                      </span>
                      <div className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg whitespace-pre-wrap leading-relaxed text-slate-900 font-medium">
                        {indicationsSheet.medicationSchedule || 'Sin horarios registrados.'}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 uppercase block tracking-wider mb-0.5" style={{ color: config.primaryDocColor }}>
                        2. Dieta y Cuidados Especiales:
                      </span>
                      <div className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg whitespace-pre-wrap leading-relaxed text-slate-900">
                        {indicationsSheet.dietAndRest || 'Sin dieta especial.'}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-red-700 uppercase block tracking-wider mb-0.5">
                        3. Signos de Alarma (Acudir a Emergencia si presenta):
                      </span>
                      <div className="p-2.5 bg-red-50/40 border border-red-200 rounded-lg whitespace-pre-wrap leading-relaxed text-red-950 font-medium">
                        {indicationsSheet.alarmSigns || 'Fiebre persistente > 38.5°C, dificultad respiratoria o dolor intenso.'}
                      </div>
                    </div>

                    {indicationsSheet.nextAppointment && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-semibold">
                        📅 Próxima Consulta de Control: {indicationsSheet.nextAppointment}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <DocumentFooter config={config} compact={false} editableInline={false} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
