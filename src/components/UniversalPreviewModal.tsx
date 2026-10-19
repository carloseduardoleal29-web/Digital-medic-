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
import { sharePDFViaWebShare, exportElementAsPDF, buildDocumentPdfFilename, exportAndSendWhatsAppBusiness } from '../utils/exportDocument';

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
  const [recipePreviewSize, setRecipePreviewSize] = useState<'quarter' | 'half' | 'letter'>('quarter');
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
        '#recipe-quarter-print-container, .recipe-size-quarter, #recipe-4en1-print-sheet, #dual-recipe-print-container, #recipe-single-print-container, #indications-print-container, #report-print-container, #rest-print-container, #history-print-container, .dual-recipe-container, .dual-recipe-sheet, .print-container, .recipe-4en1-container, .report-sheet-container, .recipe-single-container, .recipe-single-card, .indications-container, .rest-container, .clinical-history-container'
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
      document.body.classList.add('modo-preview');
      setSelectedPreviewModule(activeModule);
      setZoom(calculateMobileFitZoom());
    } else {
      document.body.classList.remove('modo-preview');
    }
    return () => {
      document.body.classList.remove('modo-preview');
    };
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
          name: 'Récipe Médico Oficial',
          sizeName: recipePreviewSize === 'quarter'
            ? '1/4 de Hoja Carta (Pequeño - 4 caben en una hoja)'
            : recipePreviewSize === 'half'
            ? 'Media Carta Horizontal (2 caben en una hoja)'
            : 'Hoja Carta Completa',
          widthClass: recipePreviewSize === 'quarter' ? 'w-[420px] max-w-[420px]' : 'w-[780px]',
          sheetBadge: recipePreviewSize === 'quarter' ? '1/4 Hoja (4 por Hoja)' : 'Récipe Normal',
        };
      case 'recipe-4en1':
      case 'diseno':
        return {
          name: 'Hoja Carta de Récipes Médicos (4 en 1)',
          sizeName: 'Hoja Carta Real (21.6 x 27.9 cm) con 4 Récipes en Cuadrantes',
          widthClass: 'w-full max-w-[816px] min-h-[1056px]',
          sheetBadge: 'Récipes 4 en 1',
        };
      case 'informes':
        return {
          name: 'Informe Médico Oficial',
          sizeName: 'Hoja Carta Completa (1 Sola Página Oficial 21.6 x 27.9 cm)',
          widthClass: 'w-full max-w-[780px] min-h-[1050px]',
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
      <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white shrink-0 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-white">Vista Previa del Formato Oficial</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {specs.sheetBadge.replace('4 en 1', 'Récipes')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Formato exacto: <span className="text-slate-200 font-semibold">{specs.sizeName}</span> · Vista previa fiel de cómo queda
            </p>
          </div>
        </div>

        {/* UN SOLO BOTÓN PARA SALIR DE ALLÍ */}
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          title="Salir de la Vista Previa"
        >
          <X className="w-4 h-4" />
          <span>Salir de la Vista Previa</span>
        </button>
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
                id="recipe-medico"
                data-recipe-size={recipePreviewSize}
                className={`relative ${
                  recipePreviewSize === 'quarter' 
                    ? 'w-[420px] max-w-[420px] p-3.5 sm:p-4 recipe-size-quarter' 
                    : `${specs.widthClass} p-6 sm:p-8`
                } bg-white shadow-2xl rounded-2xl transition-all print-container recipe-single-card flex flex-col justify-between ${textureClass} ${
                  config.enforcePureBlackText ? 'enforce-pure-black' : ''
                }`}
                style={{
                  backgroundColor: config.tonePapel || '#ffffff',
                  border: borderStyle,
                  borderRadius: config.docCornerRadius || '16px',
                  minHeight: recipePreviewSize === 'quarter' ? '520px' : '860px',
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
                        opacity: config.watermarkOpacity ?? 0.16,
                        width: `${config.watermarkScale || 50}%`,
                        transform: `rotate(${config.watermarkRotation || 0}deg)`,
                      }}
                    />
                  </div>
                )}

                <div className={`relative z-10 flex flex-col justify-between h-full flex-1 ${recipePreviewSize === 'quarter' ? 'min-h-[490px]' : ''}`}>
                  <div>
                    <DocumentHeader config={config} compact={recipePreviewSize === 'quarter'} editableInline={false} />

                    {/* Title */}
                    <div className="my-2 pb-1 border-b border-slate-200 flex items-center justify-between">
                      <span 
                        className={`${recipePreviewSize === 'quarter' ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'} font-black tracking-wide uppercase font-serif`}
                        style={{ color: config.primaryDocColor }}
                      >
                        RÉCIPE MÉDICO OFICIAL
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-500">
                        Fecha: <strong className="text-slate-800">{currentRec.date || '—'}</strong>
                      </span>
                    </div>

                    {/* Patient Bar */}
                    {recipePreviewSize === 'quarter' ? (
                      <div className="p-2 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-2 text-[10px] shadow-2xs space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-700">Pac: </span>
                          <strong className="text-slate-900 truncate">{currentRec.patientName || 'Carlos leal'}</strong>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                          <div>
                            <span className="font-bold text-slate-700">C.I: </span>
                            <span className="text-slate-900 font-semibold">{currentRec.patientCI || '—'}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-700">Edad: </span>
                            <span className="text-slate-900 font-semibold">{currentRec.patientAge || '—'}</span>
                          </div>
                        </div>
                        {currentRec.diagnosis && (
                          <div className="pt-0.5 border-t border-slate-200/60 truncate">
                            <span className="font-bold text-slate-700">Dx: </span>
                            <span className="text-slate-900">{currentRec.diagnosis}</span>
                          </div>
                        )}
                      </div>
                    ) : (
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
                    )}

                    {/* Rp Section */}
                    <div className="my-2 flex flex-col">
                      <span 
                        className={`${recipePreviewSize === 'quarter' ? 'text-xl' : 'text-2xl sm:text-3xl'} font-black italic tracking-wide mb-1`}
                        style={{ color: config.primaryDocColor, fontFamily: "'Playfair Display', serif" }}
                      >
                        Rp.
                      </span>
                      <div 
                        className={`p-3 rounded-xl bg-slate-50/40 border border-slate-200 text-slate-900 whitespace-pre-wrap leading-relaxed ${
                          recipePreviewSize === 'quarter' ? 'min-h-[140px] text-xs' : 'min-h-[300px] text-sm'
                        }`}
                        style={{
                          fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                          fontSize: recipePreviewSize === 'quarter' ? '12px' : (config.bodyFontSize || '14px'),
                        }}
                      >
                        {currentRec.rp || <span className="text-slate-400 italic">Sin prescripción médica registrada.</span>}
                      </div>
                    </div>
                  </div>

                  {/* Document Footer */}
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <DocumentFooter
                      config={config}
                      compact={recipePreviewSize === 'quarter'}
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
          {/* ========================================================= */}
          {/* CASE 2: RÉCIPES MÉDICOS 4 EN 1 (HOJA CARTA 4 CUADRANTES) */}
          {/* ========================================================= */}
          {(selectedPreviewModule === 'recipe-4en1' || selectedPreviewModule === 'diseno') && (
            <div
              className={`relative w-full max-w-[816px] h-[1056px] min-h-[1056px] max-h-[1056px] bg-white shadow-2xl transition-all print-container recipe-4en1-container ${textureClass} ${
                config.enforcePureBlackText ? 'enforce-pure-black' : ''
              }`}
              style={{
                backgroundColor: config.tonePapel || '#ffffff',
                border: borderStyle,
                borderRadius: config.docCornerRadius || '16px',
                width: '100%',
                maxWidth: '816px',
                height: '1056px',
                minHeight: '1056px',
                maxHeight: '1056px',
                boxSizing: 'border-box',
                padding: '15px',
                overflow: 'hidden',
              }}
            >
              {/* Central Cut Guides */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/2 left-3 right-3 border-t border-dashed border-slate-300 -translate-y-1/2 flex items-center justify-center">
                  <span className="bg-white/95 px-2 py-0.5 rounded text-[9px] text-slate-400 font-mono tracking-widest flex items-center gap-1">
                    ✂ - - - - - LÍNEA DE CORTE - - - - - ✂
                  </span>
                </div>
                <div className="absolute top-3 bottom-3 left-1/2 border-l border-dashed border-slate-300 -translate-x-1/2 flex items-center justify-center">
                  <span className="bg-white/95 px-1 py-1 rounded text-[8px] text-slate-400 font-mono [writing-mode:vertical-lr] tracking-widest">
                    ✂ CORTE
                  </span>
                </div>
              </div>

              {/* Contenedor Grid Estricto: repeat(2, 1fr), repeat(2, 1fr), gap: 15px, 100% width/height */}
              <div 
                className="recipe-4en1-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gridTemplateRows: 'repeat(2, 1fr)',
                  gap: '15px',
                  width: '100%',
                  height: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {[0, 1, 2, 3].map((idx) => {
                  const targetRec = (recipes4en1 && recipes4en1.length > 0 && recipes4en1[0]?.rp?.trim()) 
                    ? recipes4en1[0] 
                    : (recipe || {
                        id: 'rec-1',
                        patientName: 'Carlos leal',
                        patientAge: '35 años',
                        patientCI: 'V-18.456.789',
                        date: '14/10/26',
                        diagnosis: 'Consulta médica general',
                        rp: '',
                        indicationsNotes: '',
                      });

                  return (
                    <div
                      key={`quadrant-${idx}`}
                      className="relative border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs flex flex-col justify-between overflow-hidden recipe-quadrant-card"
                      style={{
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        transform: 'none',
                        margin: 0,
                      }}
                    >
                      {/* Watermark inside each recipe quadrant */}
                      {config.marcaAgua && !config.marcaAgua.includes('DIGITAL') && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                          <img
                            src={config.marcaAgua}
                            alt="Marca de agua"
                            className="marca-agua-img"
                            style={{
                              opacity: config.watermarkOpacity ?? 0.16,
                              width: `${config.watermarkScale || 50}%`,
                              transform: `rotate(${config.watermarkRotation || 0}deg)`,
                            }}
                          />
                        </div>
                      )}

                      {/* Header */}
                      <div className="relative z-10">
                        <DocumentHeader config={config} compact={true} editableInline={false} />
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 py-0.5 px-1.5 bg-slate-50/90 border border-slate-200/80 rounded-md text-[9px] my-1 leading-tight">
                          <div className="truncate">
                            <span className="font-bold text-slate-700">Pac: </span>
                            <span className="font-semibold text-slate-900">{targetRec?.patientName || 'Carlos leal'}</span>
                          </div>
                          <div className="text-right truncate">
                            <span className="font-bold text-slate-700">C.I: </span>
                            <span className="font-semibold text-slate-900">{targetRec?.patientCI || 'V-18.456.789'}</span>
                          </div>
                          <div className="truncate col-span-1">
                            <span className="font-bold text-slate-700">Dx: </span>
                            <span className="text-slate-800 font-medium">{targetRec?.diagnosis || 'Consulta'}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-700">Fecha: </span>
                            <span className="text-slate-800">{targetRec?.date || '14/10/26'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Prescription Body */}
                      <div className="flex-1 my-1 relative z-10 overflow-hidden flex flex-col justify-start">
                        <span 
                          className="font-black text-xs block font-serif"
                          style={{ color: config.primaryDocColor || '#2563eb' }}
                        >
                          ℞ {config.rxTitle || 'Rp.'}
                        </span>
                        <p 
                          className="text-[10.5px] text-slate-900 whitespace-pre-wrap leading-relaxed mt-0.5 font-sans font-medium line-clamp-6"
                          style={{
                            fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                          }}
                        >
                          {targetRec?.rp || <span className="italic text-slate-400">Sin medicamentos asignados.</span>}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="mt-1 pt-1 border-t border-slate-200/80 relative z-10">
                        <DocumentFooter
                          config={config}
                          compact={true}
                          notesText={targetRec?.indicationsNotes || config.footerNotesText}
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
