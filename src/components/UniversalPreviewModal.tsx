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
  Download,
  Scissors,
  Share2
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
import { sharePDFViaWebShare, exportElementAsPDF, buildDocumentPdfFilename } from '../utils/exportDocument';

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
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [shareSuccessNotice, setShareSuccessNotice] = useState<string>('');

  const calculateMobileFitZoom = () => {
    if (typeof window === 'undefined') return 100;
    const w = window.innerWidth;
    if (w < 860) {
      const fit = Math.floor(((w - 24) / 816) * 100);
      return Math.min(100, Math.max(32, fit));
    }
    return 100;
  };

  const getDocumentPatientAndDate = () => {
    let patientName = '';
    let docDate = '';
    let patientPhone = '';
    let prefix = 'Recipe';

    switch (selectedPreviewModule) {
      case 'informes':
        patientName = currentReport?.patientName || '';
        docDate = currentReport?.date || '';
        patientPhone = currentReport?.patientPhone || '';
        prefix = 'Informe';
        break;
      case 'reposo':
        patientName = medicalRestCert?.patientName || '';
        docDate = medicalRestCert?.date || '';
        patientPhone = medicalRestCert?.patientPhone || '';
        prefix = 'Reposo';
        break;
      case 'indicaciones':
        patientName = indicationsSheet?.patientName || '';
        docDate = indicationsSheet?.date || '';
        patientPhone = indicationsSheet?.patientPhone || '';
        prefix = 'Indicaciones';
        break;
      case 'historias':
        patientName = clinicalRecord?.patientName || '';
        docDate = clinicalRecord?.date || '';
        patientPhone = clinicalRecord?.patientPhone || '';
        prefix = 'Historia';
        break;
      case 'recipe-master':
      case 'recipe-4en1':
      case 'diseno':
      default:
        const firstRec = (recipes4en1 && recipes4en1.length > 0 ? recipes4en1[0] : null) || recipe;
        patientName = firstRec?.patientName || '';
        docDate = firstRec?.date || '';
        patientPhone = firstRec?.patientPhone || '';
        prefix = selectedPreviewModule === 'recipe-4en1' ? 'Recipes_4en1' : 'Recipe';
        break;
    }

    let docName = 'documento médico';
    switch (selectedPreviewModule) {
      case 'informes':
        docName = 'informe médico';
        break;
      case 'reposo':
        docName = 'certificado de reposo médico';
        break;
      case 'indicaciones':
        docName = 'hoja de indicaciones';
        break;
      case 'historias':
        docName = 'historia clínica';
        break;
      case 'recipe-4en1':
        docName = 'récipes médicos 4 en 1';
        break;
      default:
        docName = 'récipe médico';
        break;
    }

    const fileName = buildDocumentPdfFilename(prefix, patientName, docDate);
    const shareTitle = `${prefix} - ${patientName || 'Paciente'}`;
    const shareText = `Hola ${patientName || 'estimado paciente'}, le envío su ${docName} oficial en formato PDF adjunto con fecha ${docDate || 'de hoy'}.`;

    return { patientName, docDate, patientPhone, fileName, shareTitle, shareText };
  };

  const handleShareNative = async () => {
    if (!previewSheetRef.current) return;
    try {
      setIsSharing(true);
      const info = getDocumentPatientAndDate();
      const targetSheet = previewSheetRef.current.querySelector<HTMLElement>(
        '.print-container, .recipe-4en1-container, .report-sheet-container, .indications-container, .rest-container, .clinical-history-container'
      ) || previewSheetRef.current;

      const res = await sharePDFViaWebShare(
        targetSheet,
        info.fileName,
        info.shareTitle,
        info.shareText,
        info.patientPhone
      );

      if (res.success) {
        if (res.method === 'webshare') {
          setShareSuccessNotice(`✓ PDF "${info.fileName}" compartido directamente a WhatsApp.`);
        } else {
          setShareSuccessNotice(`✓ PDF "${info.fileName}" descargado en su dispositivo y abierto en WhatsApp.`);
        }
        setTimeout(() => setShareSuccessNotice(''), 5000);
      }
    } catch (err) {
      console.warn('Share error:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadDirectPDF = async () => {
    if (onConfirmDownloadPdf) {
      onConfirmDownloadPdf();
      return;
    }
    if (!previewSheetRef.current) return;
    const info = getDocumentPatientAndDate();
    const targetSheet = previewSheetRef.current.querySelector<HTMLElement>(
      '.print-container, .recipe-4en1-container, .report-sheet-container, .indications-container, .rest-container, .clinical-history-container'
    ) || previewSheetRef.current;
    await exportElementAsPDF(targetSheet, info.fileName);
    setShareSuccessNotice(`✓ Descargado: ${info.fileName}`);
    setTimeout(() => setShareSuccessNotice(''), 4000);
  };

  // Sync with prop when opened and auto-scale zoom based on screen width
  React.useEffect(() => {
    if (isOpen) {
      setSelectedPreviewModule(activeModule);
      setZoom(calculateMobileFitZoom());
    }
  }, [activeModule, isOpen]);

  // Adjust zoom automatically as they switch format tabs in the preview modal
  React.useEffect(() => {
    setZoom(calculateMobileFitZoom());
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
        return {
          name: 'Récipe Médico Normal',
          sizeName: 'Formato Normal de Récipe (Hoja Completa / Media Carta)',
          widthClass: 'w-[780px] min-h-[960px]',
          sheetBadge: 'Récipe Normal Oficial',
        };
      case 'recipe-4en1':
      case 'diseno':
        return {
          name: 'Hoja Carta de Récipes Médicos (4 en 1)',
          sizeName: 'Hoja Carta Real (21.6 x 27.9 cm) con 4 Récipes en Cuadrantes',
          widthClass: 'w-[816px] min-h-[1056px]',
          sheetBadge: 'Récipes 4 en 1',
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
        <div className="flex items-center bg-slate-800/90 rounded-2xl p-1.5 border border-slate-700/80 gap-1.5 overflow-x-auto max-w-full shadow-inner">
          {[
            { id: 'recipe-master', label: '💊 Récipe', icon: FileCheck2 },
            { id: 'recipe-4en1', label: '📦 Récipes 4en1', icon: Grid2X2 },
            { id: 'indicaciones', label: '🕐 Indicaciones', icon: ClipboardList },
            { id: 'informes', label: '📋 Informe Médico', icon: FileText },
            { id: 'reposo', label: '⏱️ Reposo / Constancia', icon: ShieldCheck },
          ].map((item) => {
            const isSelected = selectedPreviewModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedPreviewModule(item.id as ActiveModule);
                  onSelectModule?.(item.id as ActiveModule);
                }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400 scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/80'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions & Zoom */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Controls with Mobile Fit & Desktop Toggle */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs text-slate-300">
            <button
              onClick={() => setZoom((z) => Math.max(25, z - 5))}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Reducir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono font-bold text-xs min-w-[36px] text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(130, z + 5))}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(calculateMobileFitZoom())}
              className="px-2 py-1 ml-0.5 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-cyan-300 transition-colors cursor-pointer border-l border-slate-700"
              title="Ajustar toda la hoja a la pantalla del teléfono sin que se corte nada"
            >
              📱 Ajustar
            </button>
            <button
              onClick={() => setZoom(100)}
              className="px-2 py-1 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
              title="Ver en tamaño real de escritorio (100%)"
            >
              🖥️ 100%
            </button>
          </div>

          <button
            onClick={handleDownloadDirectPDF}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            title="Descargar archivo PDF con el nombre del paciente y fecha"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Descargar PDF</span>
          </button>

          <button
            onClick={handleShareNative}
            disabled={isSharing}
            className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            title="Compartir el PDF directamente a WhatsApp o aplicaciones del teléfono"
          >
            <Share2 className="w-4 h-4 text-emerald-200" />
            <span>{isSharing ? 'Generando...' : '📱 Enviar a WhatsApp'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            title="Imprimir en impresora física o guardar como PDF del sistema"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ Imprimir</span>
          </button>

          {/* Prominent Red Exit Button requested by the user */}
          <button
            onClick={onClose}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            title="Salir de Vista Previa"
          >
            <X className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Floating Notice Banner when PDF is downloaded or shared */}
      {shareSuccessNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{shareSuccessNotice}</span>
        </div>
      )}

      {/* Main Canvas with the exact sheet rendered */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-6 flex justify-center items-start bg-slate-950/70">
        <div 
          ref={previewSheetRef}
          className="my-3 transition-all"
          style={{ 
            zoom: zoom / 100,
            transformOrigin: 'top center'
          }}
        >

          {/* ========================================================= */}
          {/* CASE 1: RÉCIPE MÉDICO NORMAL (1 SOLO RÉCIPE EN HOJA COMPLETA) */}
          {/* ========================================================= */}
          {selectedPreviewModule === 'recipe-master' && (() => {
            const currentRec = recipe || (recipes4en1 && recipes4en1.length > 0 ? recipes4en1[0] : null) || {
              id: 'rec-default',
              patientName: '',
              patientCI: '',
              patientAge: '',
              date: '',
              diagnosis: '',
              rp: '',
              indicationsNotes: '',
            };

            return (
              <div
                className={`relative ${specs.widthClass} bg-white shadow-2xl p-6 sm:p-8 rounded-2xl transition-all print-container recipe-single-card flex flex-col justify-between ${textureClass} ${
                  config.enforcePureBlackText ? 'enforce-pure-black' : ''
                }`}
                style={{
                  backgroundColor: config.tonePapel || '#ffffff',
                  border: borderStyle,
                  borderRadius: config.docCornerRadius || '16px',
                  boxSizing: 'border-box',
                }}
              >
                {/* Watermark */}
                {config.marcaAgua && !config.marcaAgua.includes('DIGITAL') && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                    <img
                      src={config.marcaAgua}
                      alt="Marca de agua"
                      className="marca-agua-img"
                      style={{
                        opacity: config.watermarkOpacity ?? 0.1,
                        width: `${Math.min(60, config.watermarkScale || 50)}%`,
                        transform: `rotate(${config.watermarkRotation || 0}deg)`,
                      }}
                    />
                  </div>
                )}

                <div className="relative z-10 flex flex-col justify-between h-full flex-1">
                  <div>
                    <DocumentHeader config={config} compact={false} editableInline={false} />

                    {/* Title */}
                    <div className="my-2.5 pb-1 border-b border-slate-200 flex items-center justify-between">
                      <span 
                        className="text-base sm:text-lg font-black tracking-wide uppercase font-serif"
                        style={{ color: config.primaryDocColor }}
                      >
                        RÉCIPE MÉDICO OFICIAL
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Fecha: <strong className="text-slate-800">{currentRec.date || '—'}</strong>
                      </span>
                    </div>

                    {/* Patient Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-3 text-xs shadow-2xs">
                      <div className="col-span-2">
                        <span className="font-bold text-slate-700">Paciente: </span>
                        <strong className="text-slate-900">{currentRec.patientName || '—'}</strong>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">C.I.: </span>
                        <span className="text-slate-900 font-semibold">{currentRec.patientCI || '—'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Edad: </span>
                        <span className="text-slate-900 font-semibold">{currentRec.patientAge || '—'}</span>
                      </div>
                      {currentRec.diagnosis && (
                        <div className="col-span-2 sm:col-span-4 pt-1 border-t border-slate-200/60">
                          <span className="font-bold text-slate-700">Diagnóstico (CIE): </span>
                          <span className="text-slate-900 font-medium">{currentRec.diagnosis}</span>
                        </div>
                      )}
                    </div>

                    {/* Rp Section */}
                    <div className="my-3 flex flex-col">
                      <span 
                        className="text-2xl sm:text-3xl font-black italic tracking-wide mb-2"
                        style={{ color: config.primaryDocColor, fontFamily: "'Playfair Display', serif" }}
                      >
                        Rp.
                      </span>
                      <div 
                        className="p-4 rounded-xl bg-slate-50/40 border border-slate-200 text-slate-900 whitespace-pre-wrap leading-relaxed min-h-[300px]"
                        style={{
                          fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                          fontSize: config.bodyFontSize || '14px',
                        }}
                      >
                        {currentRec.rp || <span className="text-slate-400 italic">Sin prescripción médica registrada.</span>}
                      </div>
                    </div>
                  </div>

                  {/* Document Footer */}
                  <div className="mt-4 pt-2 border-t border-slate-200">
                    <DocumentFooter
                      config={config}
                      compact={false}
                      notesText={currentRec.indicationsNotes || config.footerNotesText}
                      editableInline={false}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* CASE 2: RÉCIPES MÉDICOS 4 EN 1 (HOJA CARTA 4 CUADRANTES) */}
          {/* ========================================================= */}
          {(selectedPreviewModule === 'recipe-4en1' || selectedPreviewModule === 'diseno') && (
            <div
              className={`relative w-[816px] max-w-[816px] min-h-[1056px] bg-white shadow-2xl p-4 transition-all print-container recipe-4en1-container ${textureClass} ${
                config.enforcePureBlackText ? 'enforce-pure-black' : ''
              }`}
              style={{
                backgroundColor: config.tonePapel || '#ffffff',
                border: borderStyle,
                borderRadius: config.docCornerRadius || '16px',
                width: '816px',
                minHeight: '1056px',
                boxSizing: 'border-box',
              }}
            >
              <div className="grid grid-cols-2 grid-rows-2 gap-3 relative z-10 min-h-[1020px] recipe-4en1-grid">
                {[0, 1, 2, 3].map((idx) => {
                  const rec = recipes4en1[idx] || (idx === 0 ? recipe : null);
                  const isSlotFilled = rec && Boolean(rec.rp?.trim() || rec.patientName?.trim() || rec.diagnosis?.trim());

                  // Always show Slot 0 if recipe is present, or if rec has content
                  const shouldRenderContent = idx === 0 ? true : isSlotFilled;

                  if (!shouldRenderContent) {
                    return (
                      <div
                        key={idx}
                        className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/30 flex flex-col items-center justify-center text-center text-slate-400 min-h-[490px] recipe-quadrant-empty"
                      >
                        <div className="space-y-1.5 opacity-60 no-print">
                          <Scissors className="w-5 h-5 mx-auto text-slate-300" />
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Cuadrante {idx + 1} Libre (1/4 Carta)
                          </span>
                          <span className="text-[10px] text-slate-400 block max-w-[180px]">
                            Espacio libre para corte de hoja carta.
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className="relative border border-slate-200/90 rounded-xl p-3.5 bg-white shadow-2xs flex flex-col justify-between min-h-[490px] overflow-hidden recipe-quadrant-card"
                    >
                      {/* Watermark inside each recipe quadrant */}
                      {config.marcaAgua && !config.marcaAgua.includes('DIGITAL') && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
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
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 py-0.5 px-1.5 bg-slate-50/90 border border-slate-200/80 rounded-md text-[9px] my-1 leading-tight">
                          <div className="truncate">
                            <span className="font-bold text-slate-700">Pac: </span>
                            <span className="font-semibold text-slate-900">{rec?.patientName || '—'}</span>
                          </div>
                          <div className="text-right truncate">
                            <span className="font-bold text-slate-700">C.I: </span>
                            <span className="font-semibold text-slate-900">{rec?.patientCI || '—'}</span>
                          </div>
                          <div className="truncate col-span-1">
                            <span className="font-bold text-slate-700">Dx: </span>
                            <span className="text-slate-800 font-medium">{rec?.diagnosis || '—'}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-700">Fecha: </span>
                            <span className="text-slate-800">{rec?.date || '—'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 my-1 relative z-10">
                        <span className="font-bold text-xs block text-blue-700 font-serif">℞ Rp.</span>
                        <p className="text-[11.5px] text-slate-900 whitespace-pre-wrap leading-relaxed mt-1 font-sans font-medium">
                          {rec?.rp || <span className="italic text-slate-400">Sin medicamentos asignados.</span>}
                        </p>
                      </div>

                      <div className="mt-1 pt-1 border-t border-slate-200/80 relative z-10">
                        <DocumentFooter
                          config={config}
                          compact={true}
                          notesText={rec?.indicationsNotes || config.footerNotesText}
                          editableInline={false}
                        />
                      </div>
                    </div>
                  );
                })}
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
              {config.marcaAgua && !config.marcaAgua.includes('DIGITAL') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
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
              {config.marcaAgua && !config.marcaAgua.includes('DIGITAL') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
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
              {config.marcaAgua && !config.marcaAgua.includes('DIGITAL') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
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
