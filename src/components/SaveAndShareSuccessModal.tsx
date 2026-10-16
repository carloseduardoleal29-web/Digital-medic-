import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  CheckCircle2, 
  MessageSquare, 
  Download, 
  Mail, 
  Users, 
  Copy, 
  Check, 
  X, 
  FileText, 
  Phone, 
  Calendar, 
  Clock, 
  ExternalLink,
  Share2,
  Sparkles,
  ShieldCheck,
  QrCode,
  Smartphone,
  Laptop,
  Printer,
  RefreshCw
} from 'lucide-react';
import { DoctorConfig } from '../types';
import { generatePDFBlob, buildDocumentPdfFilename, sharePDFViaWebShare, buildWhatsAppPharmacologicalMessage } from '../utils/exportDocument';

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

const getCleanWhatsAppNumber = (cCode: string, op: string, local: string) => {
  const digitsCountry = cCode.replace(/\D/g, '');
  let digitsOp = op.replace(/\D/g, '');
  const digitsLocal = local.replace(/\D/g, '');

  if (!digitsLocal) return '';

  if (digitsCountry === '58' && digitsOp.startsWith('0')) {
    digitsOp = digitsOp.slice(1);
  }

  return `${digitsCountry}${digitsOp}${digitsLocal}`;
};

export interface SavedDocumentRecord {
  id: string;
  documentType: 'recipe-4en1' | 'recipe-master' | 'informe' | 'indicaciones' | 'reposo' | 'historia';
  documentTitle: string;
  patientName: string;
  patientCI: string;
  patientAge: string;
  patientPhone: string;
  patientEmail?: string;
  date: string;
  time: string;
  timestamp: number;
  diagnosis: string;
  contentBody: string;
  pdfFileName: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorMPPS: string;
  doctorCI: string;
  institution?: string;
  pdfUrl?: string;
  rawPayload?: any;
}

interface SaveAndShareSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DoctorConfig;
  record: SavedDocumentRecord | null;
  onDownloadPdf: () => void;
  onPrint?: () => void;
  onOpenEmailModal: () => void;
  onOpenPatientBank: () => void;
  onUpdatePatientPhone?: (phone: string) => void;
}

export const SaveAndShareSuccessModal: React.FC<SaveAndShareSuccessModalProps> = ({
  isOpen,
  onClose,
  config,
  record,
  onDownloadPdf,
  onPrint,
  onOpenEmailModal,
  onOpenPatientBank,
  onUpdatePatientPhone,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(record?.patientPhone || '');
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState('+58');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [localNumber, setLocalNumber] = useState('');
  const [channelMode, setChannelMode] = useState<'qr-phone' | 'pc-whatsapp' | 'email'>('pc-whatsapp');
  const [patientEmailInput, setPatientEmailInput] = useState(record?.patientEmail || '');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [phoneDownloadQrUrl, setPhoneDownloadQrUrl] = useState<string>('');
  const [qrType, setQrType] = useState<'whatsapp' | 'pdf'>('whatsapp');

  // Auto PDF Upload state
  const [pdfUrl, setPdfUrl] = useState<string | null>(record?.pdfUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [useShortMessage, setUseShortMessage] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  // Auto generate & upload PDF in background for instant cloud link
  React.useEffect(() => {
    if (!isOpen || !record) return;

    const activeRec = record;
    async function autoGenerateAndUpload() {
      try {
        setIsUploading(true);
        const targetElement = document.querySelector<HTMLElement>(
          '#dual-recipe-print-container, #recipe-single-print-container, #indications-print-container, .dual-recipe-container, .dual-recipe-sheet, .print-container, .recipe-4en1-container, .report-sheet-container, .recipe-single-container, .recipe-single-card, .indications-container, .rest-container, .clinical-history-container'
        );
        const blob = await generatePDFBlob(targetElement);
        if (blob) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            if (!activeRec) return;
            const base64 = reader.result as string;
            try {
              const cleanPatient = (activeRec.patientName || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
              const cleanDoc = (activeRec.documentType || 'Recipe').replace(/[^a-zA-Z0-9]/g, '_');
              const filename = `${cleanDoc}_${cleanPatient}.pdf`;
              const res = await fetch('/api/pdf/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdfBase64: base64, filename })
              });
              const data = await res.json();
              if (data.success && data.url) {
                setPdfUrl(data.url);
                activeRec.pdfUrl = data.url;
              }
            } catch (err) {
              console.warn('[SaveModal Upload Error]:', err);
            } finally {
              setIsUploading(false);
            }
          };
        } else {
          setIsUploading(false);
        }
      } catch (e) {
        console.warn('[SaveModal PDF Blob Error]:', e);
        setIsUploading(false);
      }
    }

    if (!pdfUrl) {
      autoGenerateAndUpload();
    }
  }, [isOpen, record]);

  // Sync phone and email if record changes
  React.useEffect(() => {
    if (isOpen && record) {
      const { countryCode, operator, local } = parseInitialPhone(record.patientPhone || '');
      setSelectedCountry(countryCode);
      setSelectedOperator(operator);
      setLocalNumber(local);
      const combined = combinePhone(countryCode, operator, local);
      setPhoneNumber(combined);
      setPatientEmailInput(record.patientEmail || '');
    }
  }, [isOpen, record]);

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getDocTypeHeader = () => {
    if (!record) return '📋 *RÉCIPE Y ORDEN MÉDICA*';
    switch (record.documentType) {
      case 'informe':
        return '📑 *INFORME MÉDICO OFICIAL*';
      case 'indicaciones':
        return '📝 *INDICACIONES Y POSOLOGÍA MÉDICA*';
      case 'reposo':
        return '🛡️ *CONSTANCIA DE REPOSO MÉDICO*';
      case 'historia':
        return '📁 *HISTORIA CLÍNICA Y TRATAMIENTO*';
      case 'recipe-4en1':
      case 'recipe-master':
      default:
        return '📋 *RÉCIPE Y ORDEN MÉDICA*';
    }
  };

  const getDocumentTypeName = () => {
    if (!record) return 'récipe y orden médica';
    switch (record.documentType) {
      case 'informe':
        return 'informe médico oficial';
      case 'indicaciones':
        return 'indicaciones y cuidados médicos';
      case 'reposo':
        return 'constancia de reposo médico';
      case 'historia':
        return 'historia clínica de consulta';
      case 'recipe-4en1':
        return 'récipe médico oficial';
      case 'recipe-master':
      default:
        return 'récipe y orden médica';
    }
  };

  const buildWhatsAppMessage = () => {
    if (!record) return '';
    const cleanDate = record.date || new Intl.DateTimeFormat('es-VE').format(new Date());

    return buildWhatsAppPharmacologicalMessage({
      patientName: record.patientName,
      patientCI: record.patientCI,
      dateStr: cleanDate,
      doctorName: record.doctorName || config.doctorName,
      doctorSpecialty: record.doctorSpecialty || config.specialty,
      rpText: record.contentBody,
      documentType: record.documentType,
    });
  };

  const messageText = buildWhatsAppMessage();

  // Generate dynamic QR codes for mobile bridge
  React.useEffect(() => {
    if (!isOpen || !record) return;
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

    const docTargetUrl = `${window.location.origin}/?doc=${record.id}`;
    QRCode.toDataURL(docTargetUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff'
      }
    }).then(setPhoneDownloadQrUrl).catch(console.error);
  }, [isOpen, record, selectedCountry, selectedOperator, localNumber, config]);

  if (!isOpen || !record) return null;

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

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Force local download of the PDF file
    if (onDownloadPdf) {
      try {
        onDownloadPdf();
      } catch (err) {
        console.warn('PDF download error:', err);
      }
    }

    const cleanNumber = getCleanWhatsAppNumber(selectedCountry, selectedOperator, localNumber);
    if (onUpdatePatientPhone) {
      onUpdatePatientPhone(phoneNumber);
    }
    const finalMsg = buildWhatsAppMessage();
    const encoded = encodeURIComponent(finalMsg);
    const targetUrl = cleanNumber.length > 6 
      ? `https://wa.me/${cleanNumber}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    const link = document.createElement('a');
    link.href = targetUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 150);
  };

  const handleSendEmailDirectly = () => {
    if (onDownloadPdf) {
      onDownloadPdf();
    }
    const docName = getDocumentTypeName();
    const subject = `${record.documentTitle || docName} - ${record.patientName} - Dr(a). ${config.doctorName}`;

    let body = `Estimado(a) ${record.patientName},\n\n` +
      `Le saluda el/la Dr(a). ${record.doctorName || config.doctorName} (${record.doctorSpecialty || config.specialty || 'Médico Cirujano'}).\n\n` +
      `Le enviamos adjunto su ${docName} oficial emitido en fecha ${record.date} en formato PDF de alta gama digital. 📄🩺\n\n` +
      `Este es un documento médico legal firmado y sellado digitalmente por el especialista con plena validez legal para su presentación en farmacias, empresas o centros asistenciales.\n\n` +
      `DOCUMENTO: ${record.documentTitle || docName.toUpperCase()}\n` +
      (record.patientCI ? `C.I. / IDENTIFICACIÓN: ${record.patientCI}\n` : '') +
      (record.diagnosis ? `DIAGNÓSTICO CLÍNICO: ${record.diagnosis}\n` : '') +
      (pdfUrl ? `🔗 ENLACE DE DESCARGA DIRECTA:\n${pdfUrl}\n\n` : '') +
      `📄 ARCHIVO ADJUNTO: Por favor verifique el archivo PDF adjunto a este correo.\n\n` +
      `Siga rigurosamente las indicaciones médicas especificadas en el archivo PDF adjunto.\n\n` +
      `M.P.P.S: ${record.doctorMPPS || config.mpps || '00.000'} · C.I: ${record.doctorCI || config.ci || 'V-00.000.000'}\n` +
      (config.phone ? `Contacto / Consultas: ${config.phone}\n` : '') +
      `\nLe deseamos una pronta y satisfactoria recuperación. ✨\n\n` +
      `Atentamente,\n` +
      `Dr(a). ${record.doctorName || config.doctorName}\n` +
      `${record.doctorSpecialty || config.specialty || 'Médico Cirujano'}`;

    const mailto = `mailto:${encodeURIComponent(patientEmailInput.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const link = document.createElement('a');
    link.href = mailto;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNativeShare = async () => {
    try {
      setIsSharing(true);
      const cleanDate = record.date || new Intl.DateTimeFormat('es-VE').format(new Date());
      const pdfFilename = record.pdfFileName || buildDocumentPdfFilename(record.documentType || 'Recipe', record.patientName, cleanDate);

      const targetElement = document.querySelector<HTMLElement>(
        '#recipe-quarter-print-container, .recipe-size-quarter, #recipe-4en1-print-sheet, #dual-recipe-print-container, #recipe-single-print-container, #indications-print-container, #report-print-container, #rest-print-container, #history-print-container, .dual-recipe-container, .dual-recipe-sheet, .print-container, .recipe-4en1-container, .report-sheet-container, .recipe-single-container, .recipe-single-card, .indications-container, .rest-container, .clinical-history-container'
      );

      await sharePDFViaWebShare(
        targetElement,
        pdfFilename,
        record.documentTitle || `${record.documentType} - ${record.patientName || 'Paciente'}`,
        messageText,
        record.patientPhone
      );
    } catch (err) {
      console.warn('Native share error:', err);
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen || !record) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full text-slate-800 shadow-2xl relative my-auto max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner text-white">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider bg-emerald-800/60 px-2 py-0.5 rounded-md border border-emerald-400/30">
                  Guardado en Banco
                </span>
                <span className="text-xs text-emerald-100 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {record.time}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                ¡Documento y PDF Guardados!
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs flex-1">
          
          {/* Card Summary */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Paciente Registrado
                </span>
                <span className="text-sm font-black text-slate-900">
                  {record.patientName || 'Paciente General'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Documento Oficial
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  {record.documentTitle}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Cédula / Documento:</span>
                <strong className="text-slate-800">{record.patientCI || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Fecha de Emisión:</span>
                <strong className="text-slate-800">{record.date}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Documento:</span>
                <strong className="text-slate-800">{record.documentTitle}</strong>
              </div>
            </div>

            {record.diagnosis && (
              <div className="pt-1 text-[11px]">
                <span className="text-slate-400 block text-[10px]">Diagnóstico Clínico:</span>
                <span className="font-semibold text-slate-700">{record.diagnosis}</span>
              </div>
            )}

            {record.contentBody && (
              <div className="pt-2 border-t border-slate-200/80 space-y-2">
                <div className="p-3 bg-slate-900 border border-slate-700/80 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-black text-white text-[11px] uppercase tracking-wider">🔒 Enlace PDF de Seguridad Médica</div>
                      <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[240px]">
                        {pdfUrl || 'Generando enlace cifrado seguro...'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {pdfUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(pdfUrl);
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2500);
                          }}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-all flex items-center gap-1 shrink-0"
                          title="Copiar enlace directo de descarga del PDF"
                        >
                          {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                          <span>{linkCopied ? '¡Copiado!' : 'Copiar Enlace'}</span>
                        </button>
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white font-bold text-[10px] rounded-lg cursor-pointer transition-all flex items-center gap-1 shrink-0 border border-slate-700"
                          title="Abrir PDF en pestaña nueva"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Ver PDF</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-bold flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Si el PDF no se descargó automáticamente, haga clic en el botón azul de arriba.</span>
          </div>

          <div className="text-center py-1">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">AHORA ELIJA CÓMO ENVIARLO:</h3>
          </div>

          {/* Formato de Mensaje Informativo (Legal PDF Exclusivo) */}
          <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 animate-pulse shrink-0"></span>
            <div className="space-y-0.5">
              <span className="block font-black text-emerald-800 text-[10.5px] uppercase tracking-wider">
                Formato Legal Exclusivo en PDF
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Por motivos de confidencialidad médica y regulación de documentos oficiales, el envío se realiza de forma exclusiva en formato PDF para garantizar la validez legal del membrete, sello y firma del especialista.
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
              <span className="font-semibold text-[10.5px]">Generando y subiendo receta PDF oficial a la nube para envío automático...</span>
            </div>
          )}
          {pdfUrl && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-[10.5px]">¡Enlace al PDF generado con éxito en el servidor! El paciente podrá abrir su récipe con un clic.</span>
            </div>
          )}





          {/* CANAL 2: WHATSAPP WEB EN ESTA PC / LAPTOP (SIN INSTALAR NADA) */}
          {channelMode === 'pc-whatsapp' && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-950 text-xs sm:text-sm">
                      WhatsApp Web en esta Computadora (Sin instalar nada)
                    </h4>
                    <p className="text-[10.5px] text-emerald-700">
                      Se abre directamente en tu navegador con el mensaje corto oficial
                    </p>
                  </div>
                </div>
              </div>

              {/* Widget 1: Country picker banner */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-750 text-[10px] uppercase tracking-wider">
                  Seleccione el País (Código):
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountryChange(country.code)}
                      className={`px-2 py-1 rounded-lg border font-bold text-[10px] flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                        selectedCountry === country.code
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900 shadow-2xs ring-1 ring-emerald-500/10'
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
                <label className="block font-bold text-slate-755 text-[10px] uppercase tracking-wider">
                  Operadora / Prefijo de Origen:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0]).operators.map((op) => (
                    <button
                      key={op.label}
                      type="button"
                      onClick={() => handleOperatorChange(op.prefix)}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                        selectedOperator === op.prefix
                          ? 'bg-teal-100 border-teal-500 text-teal-900 shadow-2xs ring-1 ring-teal-500/10'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <span>{op.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Area Code and Local Digits Input */}
              <form onSubmit={handleOpenWhatsApp} className="space-y-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-[10.5px]">
                    Complete el Número de Teléfono:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 font-black text-slate-800 text-[11px] shrink-0 select-none flex items-center gap-1">
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
                        className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>Preparando y Abriendo...</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-100" />
                          <span>Abrir WhatsApp y Enviar PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* RECORDATORIO VISUAL OBLIGATORIO: ADJUNTAR PDF CON EL CLIP EN WHATSAPP */}
              <div className="bg-amber-50 border-2 border-amber-400/90 rounded-2xl p-3.5 space-y-2 shadow-sm text-slate-800">
                <div className="flex items-center gap-2 font-black text-amber-900 text-xs sm:text-sm">
                  <span className="text-lg">📎</span>
                  <span>IMPORTANTE: RECUERDA ADJUNTAR EL PDF EN WHATSAPP</span>
                </div>
                <p className="text-[11px] text-amber-950/90 leading-relaxed font-medium">
                  Por seguridad de WhatsApp, los navegadores no pueden adjuntar archivos automáticamente.
                </p>
                <div className="bg-white/95 rounded-xl p-2.5 border border-amber-300/80 text-[11px] text-slate-700 space-y-1.5 font-semibold">
                  <div className="flex items-start gap-2">
                    <span className="bg-amber-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">1</span>
                    <span>El PDF oficial con firma y sello ya fue generado y descargado en tu dispositivo.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-amber-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">2</span>
                    <span>En WhatsApp, toca el ícono del <strong>CLIP (📎)</strong> en el chat del paciente.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-amber-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Selecciona <strong>Documento</strong> y adjunta el PDF. El mensaje ya contiene los fármacos prescritos.</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions for WhatsApp */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-200/60 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Mensaje Copiado' : 'Copiar Texto y Enlace'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Adjuntar el archivo PDF directamente en WhatsApp (Celulares Android / iPhone)"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>📲 Adjuntar PDF Directo (Móvil)</span>
                </button>
              </div>
            </div>
          )}

          {/* CANAL 3: ENVIAR POR CORREO ELECTRÓNICO DIRECTO CON PDF */}
          {channelMode === 'email' && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-indigo-950 text-xs sm:text-sm">
                    Enviar Documento por Correo Electrónico
                  </h4>
                  <p className="text-[10.5px] text-indigo-700">
                    Envío oficial del PDF al paciente con mensaje médico pre-redactado
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block font-bold text-slate-700 text-[10.5px] mb-1">
                    Correo Electrónico del Paciente:
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={patientEmailInput}
                      onChange={(e) => setPatientEmailInput(e.target.value)}
                      placeholder="paciente@correo.com"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="bg-white/90 border border-indigo-200 rounded-xl p-2.5 text-xs text-slate-700 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Envío con archivo PDF adjunto</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-snug">
                    Al pulsar <strong>Abrir Correo y Enviar</strong>, se descargará el archivo PDF (<strong>{record.pdfFileName}</strong>) en su equipo y se abrirá su aplicación de correo (Gmail, Outlook, Mail) con el destinatario, asunto y mensaje ya redactados. Solo presione adjuntar y seleccione el PDF descargado.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEmailModal();
                    }}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer transform hover:scale-[1.01] active:scale-95 min-w-[200px]"
                    title="Enviar la receta o informe médico directamente en formato PDF al correo del paciente"
                  >
                    <Mail className="w-4 h-4 text-cyan-300 animate-pulse" />
                    <span>📧 ENVIAR CORREO DIRECTO (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendEmailDirectly}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-350 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Abrir su gestor de correo predeterminado (Gmail, Outlook, Apple Mail, etc.)"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Abrir en mi Correo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECONDARY ACTION: PATIENT BANK */}
          <div className="w-full">
            {/* View in Patient Bank */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPatientBank();
              }}
              className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-2xl font-bold flex items-center justify-center gap-2 text-center transition-all hover:shadow-xs active:scale-95 cursor-pointer"
              title="Ver el historial completo del paciente en el Banco"
            >
              <Users className="w-5 h-5 text-slate-700 shrink-0" />
              <div className="text-left">
                <span className="text-xs font-black block">Ir al Banco de Pacientes</span>
                <span className="text-[10px] text-slate-600 font-normal block">Consultar historial clínico y documentos emitidos</span>
              </div>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Almacenado seguro en memoria médica</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Listo / Continuar
          </button>
        </div>

      </div>
    </div>
  );
};
