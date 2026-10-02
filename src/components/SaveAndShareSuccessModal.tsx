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
import { generatePDFBlob } from '../utils/exportDocument';

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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [useShortMessage, setUseShortMessage] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

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

  // Generate and Upload PDF in the background
  React.useEffect(() => {
    if (!isOpen || !record) return;

    const capturedPatientName = record.patientName || 'Paciente';
    const capturedDocumentType = record.documentType || 'Documento';

    async function autoUploadPdf() {
      try {
        setIsUploading(true);
        // Find visible active sheet container
        const targetElement = document.querySelector<HTMLElement>(
          '.print-container, .report-sheet-container, .recipe-single-container, .indications-container, .rest-container, .recipe-4en1-container, .clinical-history-container'
        );
        const blob = await generatePDFBlob(targetElement);
        if (!blob) {
          console.warn('[Auto Upload Success] Could not generate PDF blob');
          setIsUploading(false);
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          try {
            const cleanPatientName = capturedPatientName.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `${capturedDocumentType}_${cleanPatientName}.pdf`;

            const res = await fetch('/api/pdf/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pdfBase64: base64, filename })
            });
            const data = await res.json();
            if (data.success && data.url) {
              setPdfUrl(data.url);
              console.log('[Auto Upload Success] PDF uploaded successfully:', data.url);
            }
          } catch (err) {
            console.error('[Auto Upload Success] Error calling upload API:', err);
          } finally {
            setIsUploading(false);
          }
        };
      } catch (err) {
        console.error('[Auto Upload Success] Failed PDF generation:', err);
        setIsUploading(false);
      }
    }

    setPdfUrl(null);
    autoUploadPdf();
  }, [isOpen, record]);

  const buildWhatsAppMessage = (overrideUrl?: string | null) => {
    if (!record) return '';
    const docName = getDocumentTypeName();
    const cleanDate = record.date || new Intl.DateTimeFormat('es-ES').format(new Date());
    const effectiveUrl = overrideUrl !== undefined ? overrideUrl : pdfUrl;

    let msg = `Estimado(a) *${record.patientName}*,\n\n` +
      `Le saluda el/la *Dr(a). ${record.doctorName || config.doctorName}* (${record.doctorSpecialty || config.specialty || 'Médico Especialista'}).\n\n` +
      `📌 Se ha emitido su *${docName.toUpperCase()}* oficial con fecha de emisión *${cleanDate}* en formato PDF digital con firma y sello legal autorizados.\n\n`;

    if (effectiveUrl) {
      msg += `📥 *VER / DESCARGAR PDF OFICIAL:* ${effectiveUrl}\n\n`;
    } else {
      msg += `📄 *PDF oficial adjunto a este mensaje.*\n\n`;
    }

    msg += `*M.P.P.S:* ${record.doctorMPPS || config.mpps || '00.000'} · *C.I:* ${record.doctorCI || config.ci || 'V-00.000.000'}\n` +
      (config.phone ? `*Contacto / Consultas:* ${config.phone}\n` : '') +
      `\n*Indicación:* Cumpla las indicaciones especificadas en su documento oficial en PDF. ¡Que tenga una pronta y satisfactoria recuperación! ✨`;

    return msg;
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

  const getDocTypeHeader = () => {
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
        return 'récipe médico (formato 4 en 1)';
      case 'recipe-master':
      default:
        return 'récipe y orden médica';
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    let currentPdfUrl = pdfUrl;

    if (!currentPdfUrl) {
      setIsUploading(true);
      try {
        const targetElement = document.querySelector<HTMLElement>(
          '.print-container, .recipe-4en1-container, .recipe-single-container, .report-sheet-container, .indications-container, .rest-container, .clinical-history-container'
        );
        const blob = await generatePDFBlob(targetElement);
        if (blob) {
          const cleanPatientName = (record.patientName || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
          const filename = `${record.documentType}_${cleanPatientName}.pdf`;
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const res = await fetch('/api/pdf/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfBase64: base64, filename })
          });
          const data = await res.json();
          if (data.success && data.url) {
            currentPdfUrl = data.url;
            setPdfUrl(data.url);
          }
        }
      } catch (err) {
        console.error('[PDF Fast Upload Error]:', err);
      } finally {
        setIsUploading(false);
      }
    }

    const cleanNumber = getCleanWhatsAppNumber(selectedCountry, selectedOperator, localNumber);
    if (onUpdatePatientPhone) {
      onUpdatePatientPhone(phoneNumber);
    }
    const finalMsg = buildWhatsAppMessage(currentPdfUrl);
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
    }, 100);
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
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        setIsSharing(true);
        const blob = await generatePDFBlob(null);
        if (blob) {
          const cleanPatient = (record.patientName || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
          const pdfFile = new File([blob], record.pdfFileName || `${cleanPatient}_Documento.pdf`, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
              files: [pdfFile],
              title: record.documentTitle,
              text: messageText,
            });
            return;
          }
        }
        await navigator.share({
          title: record.documentTitle,
          text: messageText,
        });
      } catch (err) {
        console.log('Share error or cancelled:', err);
      } finally {
        setIsSharing(false);
      }
    } else {
      handleCopyMessage();
    }
  };

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
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 block text-[10px]">Archivo PDF:</span>
                <button
                  onClick={onDownloadPdf}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-xs w-fit"
                >
                  <Download className="w-3 h-3" />
                  <span>Descargar de nuevo</span>
                </button>
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

          {/* SELECTOR DE CANAL: SOLUCIÓN PARA MÉDICOS EN PC / LAPTOP Y CELULAR */}
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setChannelMode('qr-phone')}
              className={`py-2 px-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                channelMode === 'qr-phone'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                  : 'text-slate-700 hover:bg-white/80'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
              <span>📱 Celular (QR)</span>
            </button>

            <button
              type="button"
              onClick={() => setChannelMode('pc-whatsapp')}
              className={`py-2 px-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                channelMode === 'pc-whatsapp'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                  : 'text-slate-700 hover:bg-white/80'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
              <span>💻 WhatsApp Web</span>
            </button>

            <button
              type="button"
              onClick={() => setChannelMode('email')}
              className={`py-2 px-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                channelMode === 'email'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                  : 'text-slate-700 hover:bg-white/80'
              }`}
            >
              <Mail className="w-3.5 h-3.5 shrink-0 text-indigo-300" />
              <span>📧 Correo Paciente</span>
            </button>
          </div>

          {/* CANAL 1: CÓDIGO QR PARA ESCANEAR CON EL CELULAR DEL MÉDICO */}
          {channelMode === 'qr-phone' && (
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-300 rounded-3xl p-4 sm:p-5 text-center space-y-3.5 shadow-sm">
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
                  <strong> se abrirá WhatsApp en tu teléfono</strong> con el chat de {record.patientName} y el saludo formal listo.
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
                      src={qrType === 'whatsapp' ? qrCodeDataUrl : phoneDownloadQrUrl} 
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

                  {/* Selector de modo QR */}
                  <div className="pt-1 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQrType('whatsapp')}
                      className={`flex-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        qrType === 'whatsapp'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      QR WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrType('pdf')}
                      className={`flex-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        qrType === 'pdf'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                      title="Escanear para ver y descargar el documento en tu teléfono"
                    >
                      QR Ver PDF
                    </button>
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

              {/* Información y Envío de PDF en WhatsApp */}
              <div className="bg-white/90 border border-emerald-200 rounded-xl p-2.5 text-xs text-slate-700 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>¿Cómo adjuntar el PDF en WhatsApp Web?</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-snug">
                  El archivo PDF oficial (<strong>{record.pdfFileName}</strong>) ya se descargó en esta computadora. 
                  Al presionar <strong>Abrir WhatsApp Web</strong> se abrirá el chat con el saludo oficial. 
                  Luego presione el icono del clip (<strong>📎</strong>) en WhatsApp para adjuntar el PDF ya descargado.
                </p>
              </div>

              {/* Quick Actions for WhatsApp */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-200/60">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Mensaje Copiado' : 'Copiar Saludo Corto'}</span>
                </button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    title="Compartir directamente en el celular"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir en Celular</span>
                  </button>
                )}
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

          {/* SECONDARY ACTIONS: PRINT & PATIENT BANK */}
          <div className="grid grid-cols-2 gap-2.5">
            
            {/* Print Document */}
            <button
              type="button"
              onClick={() => {
                if (onPrint) onPrint();
              }}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 text-center transition-all hover:shadow-xs active:scale-95 cursor-pointer"
              title="Abrir diálogo nativo de impresión (Óptimo para cuartillas/hoja carta)"
            >
              <Printer className="w-5 h-5 text-emerald-600 mx-auto" />
              <span className="text-xs font-black block mt-1">Imprimir</span>
              <span className="text-[9px] text-emerald-600 font-normal block mt-0.5">Físico / Cuartillas</span>
            </button>

            {/* View in Patient Bank */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPatientBank();
              }}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 text-center transition-all hover:shadow-xs active:scale-95 cursor-pointer"
              title="Ver el historial completo del paciente en el Banco"
            >
              <Users className="w-5 h-5 text-slate-700 mx-auto" />
              <span className="text-xs font-black block mt-1">Banco de Pacientes</span>
              <span className="text-[9px] text-slate-600 font-normal block mt-0.5">Historial clínico</span>
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
