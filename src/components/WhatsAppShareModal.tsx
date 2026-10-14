import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  X, 
  Phone, 
  User, 
  FileText, 
  Download, 
  Share2, 
  Mail, 
  ShieldAlert,
  QrCode,
  Smartphone,
  Laptop,
  RefreshCw
} from 'lucide-react';
import { DoctorConfig } from '../types';
import { generatePDFBlob, exportElementAsPDF, buildDocumentPdfFilename, sharePDFViaWebShare, showWhatsAppClipAlert } from '../utils/exportDocument';

interface CountryData {
  code: string;
  name: string;
  flag: string;
  operators: { label: string; prefix: string }[];
}

const COUNTRIES: CountryData[] = [
  {
    code: '+58',
    name: 'Venezuela',
    flag: '🇻🇪',
    operators: [
      { label: 'Movistar (0414)', prefix: '0414' },
      { label: 'Movistar (0424)', prefix: '0424' },
      { label: 'Digitel (0412)', prefix: '0412' },
      { label: 'Movilnet (0416)', prefix: '0416' },
      { label: 'Movilnet (0426)', prefix: '0426' },
      { label: 'Otro / Libre', prefix: '' },
    ]
  },
  {
    code: '+57',
    name: 'Colombia',
    flag: '🇨🇴',
    operators: [
      { label: 'Claro (310)', prefix: '310' },
      { label: 'Claro (311)', prefix: '311' },
      { label: 'Claro (312)', prefix: '312' },
      { label: 'Claro (313)', prefix: '313' },
      { label: 'Movistar (315)', prefix: '315' },
      { label: 'Movistar (316)', prefix: '316' },
      { label: 'Tigo (300)', prefix: '300' },
      { label: 'Tigo (301)', prefix: '301' },
      { label: 'Otro / Libre', prefix: '' },
    ]
  },
  {
    code: '+34',
    name: 'España',
    flag: '🇪🇸',
    operators: [
      { label: 'Móvil (6)', prefix: '6' },
      { label: 'Móvil (7)', prefix: '7' },
      { label: 'Otro / Libre', prefix: '' },
    ]
  },
  {
    code: '+56',
    name: 'Chile',
    flag: '🇨🇱',
    operators: [
      { label: 'Móvil (9)', prefix: '9' },
      { label: 'Otro / Libre', prefix: '' },
    ]
  },
  {
    code: '+54',
    name: 'Argentina',
    flag: '🇦🇷',
    operators: [
      { label: 'Móvil (9)', prefix: '9' },
      { label: 'Otro / Libre', prefix: '' },
    ]
  },
  {
    code: '+1',
    name: 'USA / Otros',
    flag: '🇺🇸',
    operators: [
      { label: 'Ingreso Libre', prefix: '' },
    ]
  }
];

const parseInitialPhone = (phoneStr: string) => {
  const clean = (phoneStr || '').trim().replace(/[\s-()]/g, '');
  
  let countryCode = '+58';
  let operator = '';
  let local = '';

  if (!clean) {
    return { countryCode, operator, local };
  }

  let remaining = clean;
  if (clean.startsWith('+')) {
    const matchedCountry = COUNTRIES.find(c => clean.startsWith(c.code));
    if (matchedCountry) {
      countryCode = matchedCountry.code;
      remaining = clean.slice(matchedCountry.code.length);
    } else {
      const plusMatch = clean.match(/^\+(\d{1,3})/);
      if (plusMatch) {
        countryCode = '+' + plusMatch[1];
        remaining = clean.slice(countryCode.length);
      }
    }
  } else if (clean.startsWith('58')) {
    countryCode = '+58';
    remaining = clean.slice(2);
  } else if (clean.startsWith('57')) {
    countryCode = '+57';
    remaining = clean.slice(2);
  } else if (clean.startsWith('34')) {
    countryCode = '+34';
    remaining = clean.slice(2);
  } else if (clean.startsWith('56')) {
    countryCode = '+56';
    remaining = clean.slice(2);
  } else if (clean.startsWith('54')) {
    countryCode = '+54';
    remaining = clean.slice(2);
  }

  // Detect operator
  if (countryCode === '+58') {
    let checkStr = remaining;
    if (remaining.startsWith('0')) {
      checkStr = remaining.slice(1);
    }
    const ops = ['414', '424', '412', '416', '426'];
    const foundOp = ops.find(op => checkStr.startsWith(op));
    if (foundOp) {
      operator = '0' + foundOp;
      local = checkStr.slice(foundOp.length);
      return { countryCode, operator, local };
    }
  }

  const country = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];
  const matchedOp = country.operators.find(op => op.prefix && remaining.startsWith(op.prefix));
  if (matchedOp) {
    operator = matchedOp.prefix;
    local = remaining.slice(matchedOp.prefix.length);
  } else {
    local = remaining;
  }

  return { countryCode, operator, local };
};

const combinePhone = (cCode: string, op: string, local: string) => {
  if (!local) return '';
  if (cCode === '+58' && op) {
    const displayOp = op.startsWith('0') ? op : '0' + op;
    return `${cCode} ${displayOp} ${local}`;
  }
  if (op) {
    return `${cCode} ${op} ${local}`;
  }
  return `${cCode} ${local}`;
};

const getCleanWhatsAppNumber = (cCode: string, op: string, local: string): string => {
  const digitsCountry = cCode.replace(/\D/g, '') || '58';
  let raw = `${op || ''}${local || ''}`.replace(/\D/g, '');

  if (!raw) return '';

  // Si el usuario ya metió el código de país (ej. 58414...)
  if (raw.startsWith(digitsCountry)) {
    if (digitsCountry === '58' && raw.length >= 12 && raw[2] === '0') {
      return '58' + raw.slice(3);
    }
    return raw;
  }

  // Si empieza con 0 (ej. 0414... o 0424... en Venezuela)
  if (raw.startsWith('0')) {
    raw = raw.slice(1);
  }

  return `${digitsCountry}${raw}`;
};

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DoctorConfig;
  documentType: 'recipe' | 'report' | 'indications' | 'rest' | 'recipe-4en1' | 'history' | 'clinical-history' | string;
  patientName: string;
  patientPhone: string;
  documentTitle: string;
  contentBody: string;
  onUpdatePatientPhone?: (phone: string) => void;
  onTriggerPrintPdf?: () => void;
  onOpenEmailModal?: () => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  config,
  documentType,
  patientName,
  patientPhone,
  documentTitle,
  contentBody,
  onUpdatePatientPhone,
  onTriggerPrintPdf,
  onOpenEmailModal,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(patientPhone || '');
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState('+58');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [localNumber, setLocalNumber] = useState('');
  const [channelMode, setChannelMode] = useState<'qr-phone' | 'pc-whatsapp'>('pc-whatsapp');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Auto PDF Upload state and blob generator
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);

  // Synchronize from patientPhone on mount/open and generate PDF in background
  React.useEffect(() => {
    if (isOpen) {
      const { countryCode, operator, local } = parseInitialPhone(patientPhone || '');
      setSelectedCountry(countryCode);
      setSelectedOperator(operator);
      setLocalNumber(local);
      const combined = combinePhone(countryCode, operator, local);
      setPhoneNumber(combined);

      // Auto generate & upload PDF in background for instant cloud link
      async function autoGenerateAndUpload() {
        try {
          setIsUploading(true);
          const targetElement = document.querySelector<HTMLElement>(
            '#recipe-quarter-print-container, .recipe-size-quarter, #recipe-4en1-print-sheet, #dual-recipe-print-container, #recipe-single-print-container, #indications-print-container, #report-print-container, #rest-print-container, #history-print-container, .dual-recipe-container, .dual-recipe-sheet, .print-container, .recipe-4en1-container, .report-sheet-container, .recipe-single-container, .recipe-single-card, .indications-container, .rest-container, .clinical-history-container'
          );
          const blob = await generatePDFBlob(targetElement);
          if (blob) {
            setGeneratedBlob(blob);
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
              const base64 = reader.result as string;
              try {
                const filename = buildDocumentPdfFilename(documentType || 'récipe', patientName || 'Carlos leal', todayDateStr);
                const res = await fetch('/api/pdf/upload', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ pdfBase64: base64, filename })
                });
                const data = await res.json();
                if (data.success && data.url) {
                  setPdfUrl(data.url);
                }
              } catch (err) {
                console.warn('[WhatsApp PDF Upload Error]:', err);
              } finally {
                setIsUploading(false);
              }
            };
          } else {
            setIsUploading(false);
          }
        } catch (e) {
          console.warn('[WhatsApp PDF Generation Error]:', e);
          setIsUploading(false);
        }
      }

      setPdfUrl(null);
      autoGenerateAndUpload();
    }
  }, [isOpen, patientPhone, patientName, documentType]);

  const getDocumentTypeName = () => {
    switch (documentType) {
      case 'report':
        return 'informe médico oficial';
      case 'indications':
        return 'indicaciones y cuidados médicos';
      case 'rest':
        return 'constancia de reposo médico';
      case 'history':
      case 'clinical-history':
        return 'historia clínica oficial';
      case 'recipe-4en1':
        return 'récipe médico (4 en 1)';
      case 'recipe':
      default:
        return 'récipe y prescripción médica';
    }
  };

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    const country = COUNTRIES.find((c) => c.code === code);
    const defaultOp = country && country.operators.length > 0 ? country.operators[0].prefix : '';
    setSelectedOperator(defaultOp);
    
    const combined = combinePhone(code, defaultOp, localNumber);
    setPhoneNumber(combined);
    if (onUpdatePatientPhone) {
      onUpdatePatientPhone(combined);
    }
  };

  const handleOperatorChange = (op: string) => {
    setSelectedOperator(op);
    const combined = combinePhone(selectedCountry, op, localNumber);
    setPhoneNumber(combined);
    if (onUpdatePatientPhone) {
      onUpdatePatientPhone(combined);
    }
  };

  const handleLocalNumberChange = (val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    setLocalNumber(cleanVal);
    const combined = combinePhone(selectedCountry, selectedOperator, cleanVal);
    setPhoneNumber(combined);
    if (onUpdatePatientPhone) {
      onUpdatePatientPhone(combined);
    }
  };

  // Build professional WhatsApp markdown message with direct attachment instruction
  const todayDateStr = new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()).replace(/[/\\:]/g, '-');
  const pdfFilename = buildDocumentPdfFilename(documentType || 'Recipe', patientName, todayDateStr);

  const buildWhatsAppMessage = () => {
    const docName = getDocumentTypeName();
    const effectiveUrl = pdfUrl || `${window.location.origin}/pdf/${pdfFilename}`;
    const pdfLine = `📥 *ENLACE DE DESCARGA DIRECTA DE SU PDF OFICIAL:*\n${effectiveUrl}\n\n`;
    
    let msg = `Estimado(a) *${patientName || 'Paciente'}*,\n\n` +
      `Le saluda el/la *Dr(a). ${config.doctorName}* (${config.specialty || 'Médico Especialista'}).\n\n` +
      `📄 *${docName.toUpperCase()} OFICIAL*\n\n` +
      pdfLine +
      (contentBody ? `📋 *RESUMEN DE PRESCRIPCIÓN / INDICACIONES:*\n${contentBody.length > 450 ? contentBody.slice(0, 420) + '...' : contentBody}\n\n` : '') +
      `*M.P.P.S:* ${config.mpps || '00.000'} · *C.I:* ${config.ci || 'V-00.000.000'}\n` +
      (config.phone ? `*Contacto:* ${config.phone}\n` : '') +
      `\n_Documento legal con firma y sello digital. ¡Que tenga una pronta recuperación! ✨_`;
    return msg;
  };

  const messageText = buildWhatsAppMessage();

  // Generate QR code for mobile phone bridge
  React.useEffect(() => {
    if (!isOpen) return;
    const cleanNumber = getCleanWhatsAppNumber(selectedCountry, selectedOperator, localNumber);
    const msg = buildWhatsAppMessage();

    const waTargetUrl = cleanNumber.length > 5 
      ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    QRCode.toDataURL(waTargetUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: '#064e3b',
        light: '#ffffff'
      }
    }).then(setQrCodeDataUrl).catch(console.error);
  }, [isOpen, selectedCountry, selectedOperator, localNumber, config, patientName, contentBody, documentTitle, pdfUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendWhatsApp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanNumber = getCleanWhatsAppNumber(selectedCountry, selectedOperator, localNumber);
    if (onUpdatePatientPhone) {
      onUpdatePatientPhone(phoneNumber);
    }

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

    // Si el navegador soporta navigator.share, intentar compartir el PDF directamente
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await handleNativeShare();
        return;
      } catch (err: any) {
        if (err && err.name === 'AbortError') return;
      }
    }

    const finalMsg = buildWhatsAppMessage();
    const encoded = encodeURIComponent(finalMsg);
    
    // API universal oficial de WhatsApp compatible con Web, App Móvil y Escritorio
    const targetUrl = cleanNumber && cleanNumber.length >= 7 
      ? `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    // 1. Disparar apertura INMEDIATA de WhatsApp
    try {
      if (isMobile) {
        window.location.href = targetUrl;
      } else {
        const opened = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (!opened) {
          window.location.href = targetUrl;
        }
      }
    } catch (_) {
      window.location.href = targetUrl;
    }

    // 2. Descargar el PDF en paralelo de forma silenciosa para que el médico lo adjunte si lo desea
    const targetElement = document.querySelector<HTMLElement>(
      '#recipe-quarter-print-container, .recipe-size-quarter, #recipe-4en1-print-sheet, #dual-recipe-print-container, #recipe-single-print-container, #indications-print-container, #report-print-container, #rest-print-container, #history-print-container, .dual-recipe-container, .dual-recipe-sheet, .print-container, .recipe-4en1-container, .report-sheet-container, .recipe-single-container, .recipe-single-card, .indications-container, .rest-container, .clinical-history-container'
    );
    if (targetElement) {
      try {
        exportElementAsPDF(targetElement, pdfFilename).catch((err) => console.warn('[Auto PDF Download]:', err));
        showWhatsAppClipAlert('PDF descargado. Recuerda tocar el ícono del clip 📎 en WhatsApp para adjuntarlo al paciente');
      } catch (_) {}
    }
  };

  // Web Share API support (attaching the real PDF directly on smartphones into WhatsApp!)
  const handleNativeShare = async () => {
    try {
      setIsSharing(true);
      const cleanNumber = getCleanWhatsAppNumber(selectedCountry, selectedOperator, localNumber);
      const targetElement = document.querySelector<HTMLElement>(
        '#recipe-quarter-print-container, .recipe-size-quarter, #recipe-4en1-print-sheet, #dual-recipe-print-container, #recipe-single-print-container, #indications-print-container, #report-print-container, #rest-print-container, #history-print-container, .dual-recipe-container, .dual-recipe-sheet, .print-container, .recipe-4en1-container, .report-sheet-container, .recipe-single-container, .recipe-single-card, .indications-container, .rest-container, .clinical-history-container'
      );

      await sharePDFViaWebShare(
        targetElement,
        pdfFilename,
        `${getDocumentTypeName()} - ${patientName || 'Paciente'}`,
        messageText,
        cleanNumber
      );
    } catch (err) {
      console.warn('Native share error:', err);
    } finally {
      setIsSharing(false);
    }
  };

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 modal-overlay animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-emerald-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Enviar Documento al Paciente</h3>
              <p className="text-[11px] text-emerald-100">Prescripción y documentos para WhatsApp, PDF y Farmacia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-800">
          
          {/* STEP 1: Quick PDF Download for Pharmacies Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-emerald-950 text-xs block">Para la Farmacia: Adjunte el Documento PDF</span>
                  <span className="text-[11px] text-emerald-800">Las farmacias exigen el PDF oficial con membrete y sello médico.</span>
                </div>
              </div>

              {onTriggerPrintPdf && (
                <button
                  type="button"
                  onClick={() => {
                    onTriggerPrintPdf();
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shrink-0 flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Descargar archivo PDF para adjuntar en WhatsApp o guardar"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Guardar PDF</span>
                </button>
              )}
            </div>

            <p className="text-[10.5px] text-emerald-900 bg-white/70 p-2 rounded-lg border border-emerald-200/80">
              💡 <strong>Pasos rápidos:</strong> 1. Haga clic en <strong>Guardar PDF</strong> arriba. 2. Presione <strong>Abrir WhatsApp y Enviar</strong> abajo y adjunte el archivo PDF descargado como documento en el chat del paciente.
            </p>
          </div>

          {/* Patient details line */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Paciente:</span>
                <span className="font-bold text-slate-900 text-xs">{patientName || 'Nombre del Paciente'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenEmailModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEmailModal();
                  }}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors"
                  title="Cambiar a envío por correo electrónico"
                >
                  <Mail className="w-3 h-3" />
                  <span>Enviar por Correo</span>
                </button>
              )}
            </div>
          </div>

          {/* SELECTOR DE MODO: PC O CELULAR */}
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 grid grid-cols-2 gap-1 mb-3">
            <button
              type="button"
              onClick={() => setChannelMode('qr-phone')}
              className={`py-2 px-2.5 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                channelMode === 'qr-phone'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                  : 'text-slate-700 hover:bg-white/80'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0 text-emerald-300" />
              <span>📱 Tengo WhatsApp en Celular (QR)</span>
            </button>

            <button
              type="button"
              onClick={() => setChannelMode('pc-whatsapp')}
              className={`py-2 px-2.5 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                channelMode === 'pc-whatsapp'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                  : 'text-slate-700 hover:bg-white/80'
              }`}
            >
              <Laptop className="w-4 h-4 shrink-0 text-emerald-300" />
              <span>💻 WhatsApp Web en esta PC</span>
            </button>
          </div>

          {channelMode === 'qr-phone' && (
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-300 rounded-3xl p-4 sm:p-5 text-center space-y-3.5 shadow-sm mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Solución si estás en PC o Laptop</span>
              </div>

              <div>
                <h3 className="text-base font-black text-emerald-950 leading-tight">
                  ¡Apunta la cámara de tu teléfono a la pantalla!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  No necesitas tener WhatsApp en esta computadora. Al escanear este código con tu celular, 
                  <strong> se abrirá WhatsApp en tu teléfono</strong> con el chat de {patientName || 'Paciente'} y el saludo oficial listo.
                </p>
              </div>

              {/* QR Container */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
                <div className="bg-white p-3.5 rounded-3xl border-2 border-emerald-400 shadow-md inline-block relative overflow-hidden">
                  {isUploading ? (
                    <div className="w-44 h-44 flex flex-col items-center justify-center text-slate-500 text-xs font-bold space-y-2 p-2 bg-slate-50 rounded-2xl animate-pulse">
                      <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                      <span className="text-center text-[10px]">Generando y subiendo PDF oficial en la nube...</span>
                    </div>
                  ) : qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Código QR para celular" 
                      className="w-44 h-44 object-contain mx-auto transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs font-bold">
                      Generando Código QR...
                    </div>
                  )}
                </div>

                <div className="text-left space-y-2 max-w-[230px]">
                  <div className="bg-white p-2.5 rounded-2xl border border-emerald-200 text-[11px] shadow-2xs space-y-0.5">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Paso 1: Abre tu cámara
                    </span>
                    <p className="text-[10px] text-slate-500">
                      Apunta tu teléfono (iPhone o Android) hacia este código QR.
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xl border border-emerald-200 text-[11px] shadow-2xs space-y-0.5">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Paso 2: Toca el enlace
                    </span>
                    <p className="text-[10px] text-slate-500">
                      Tu teléfono abrirá WhatsApp con el paciente y el récipe listo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Teléfono configurado para el QR */}
              <div className="bg-white/80 border border-emerald-200 rounded-2xl p-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-600 text-[11px]">
                  Teléfono configurado: <strong className="text-emerald-950 font-black">{phoneNumber || 'Sin número'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setChannelMode('pc-whatsapp')}
                  className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] underline cursor-pointer"
                >
                  Cambiar número / operadora
                </button>
              </div>
            </div>
          )}

          {/* Form with country, operator widgets, and digits input */}
          <form onSubmit={handleSendWhatsApp} className="space-y-4">
            
            {/* Widget 1: Country picker banner */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                1. Seleccione el País (Código):
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountryChange(country.code)}
                    className={`px-2.5 py-1.5 rounded-xl border font-bold text-[11px] flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      selectedCountry === country.code
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs ring-1 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span>{country.flag}</span>
                    <span>{country.name} ({country.code})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Widget 2: Operator picker banner */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                2. Operadora / Prefijo de Origen:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0]).operators.map((op) => (
                  <button
                    key={op.label}
                    type="button"
                    onClick={() => handleOperatorChange(op.prefix)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      selectedOperator === op.prefix
                        ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-2xs ring-1 ring-teal-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span>{op.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Side-by-Side Area Code and Local Digits Input */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                3. Complete el Número de Teléfono:
              </label>
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2 font-black text-slate-800 text-xs shrink-0 select-none flex items-center gap-1 shadow-2xs">
                  <span>{selectedCountry}</span>
                  {selectedOperator && (
                    <span className="text-emerald-700">
                      {selectedOperator.startsWith('0') && selectedCountry === '+58' 
                        ? selectedOperator.slice(1) 
                        : selectedOperator}
                    </span>
                  )}
                </div>

                <div className="relative flex-1">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    value={localNumber}
                    onChange={(e) => handleLocalNumberChange(e.target.value)}
                    placeholder={selectedOperator ? "Escriba los dígitos restantes" : "Escriba número completo"}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Información sobre el Envío de PDF en WhatsApp */}
            <div className="bg-slate-50 border border-emerald-200 rounded-xl p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>¿Cómo se envía el formato PDF por WhatsApp?</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Al hacer clic en <strong>Enviar WhatsApp</strong> se abrirá el chat con el paciente y el saludo corto oficial. 
                Si está en computadora o WhatsApp Web, descargue el PDF con el botón superior y use el clip (<strong>📎</strong>) para adjuntarlo. 
                En celular, puede usar el botón <strong>Compartir en Celular</strong> para enviar el PDF directamente.
              </p>
            </div>



            {isUploading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                <span className="font-semibold text-[10.5px]">Generando y subiendo receta PDF oficial a la nube...</span>
              </div>
            )}
            {pdfUrl && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-[10.5px]">¡Enlace al PDF generado con éxito en el servidor! El paciente podrá abrir su récipe con un clic.</span>
              </div>
            )}

            {/* Message Preview */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">
                  Vista Preliminar del Mensaje:
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Texto Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap select-all border border-slate-800">
                {messageText}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex items-center justify-end gap-2 flex-wrap">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-800 border border-slate-300 hover:bg-slate-50 font-medium cursor-pointer"
              >
                Cerrar
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  disabled={isSharing}
                  className="px-4 py-2 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02] cursor-pointer text-xs border border-emerald-400/40"
                  title="Adjuntar el archivo PDF directamente en WhatsApp (Android/iOS)"
                >
                  <Share2 className="w-4 h-4 text-emerald-200" />
                  <span>{isSharing ? 'Generando PDF...' : '📎 Adjuntar PDF Directo'}</span>
                </button>
              )}

              {onOpenEmailModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEmailModal();
                  }}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
                  title="Enviar este documento por correo electrónico"
                >
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Enviar por Correo</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-850 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Texto</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-xs"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Preparando Enlace y Abriendo...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-emerald-100" />
                    <span>Abrir WhatsApp y Enviar PDF</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Footer tip */}
        <div className="px-5 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Recuerde adjuntar el PDF descargado en WhatsApp para validez en farmacias.
          </span>
        </div>

      </div>
    </div>
  );
};
