import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Download, 
  Paperclip, 
  ExternalLink, 
  Check, 
  X, 
  Phone, 
  User, 
  FileText, 
  Share2, 
  AlertCircle,
  Copy
} from 'lucide-react';
import { DoctorConfig } from '../types';
import { 
  generatePDFBlob, 
  downloadBlobAsFile, 
  buildDocumentPdfFilename, 
  buildWhatsAppTreatmentMessage, 
  showWhatsAppClipAlert 
} from '../utils/exportDocument';

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
      { label: '0414', prefix: '0414' },
      { label: '0424', prefix: '0424' },
      { label: '0412', prefix: '0412' },
      { label: '0416', prefix: '0416' },
      { label: '0426', prefix: '0426' },
    ]
  },
  {
    code: '+57',
    name: 'Colombia',
    flag: '🇨🇴',
    operators: [{ label: '300-320', prefix: '3' }]
  },
  {
    code: '+34',
    name: 'España',
    flag: '🇪🇸',
    operators: [{ label: '6/7', prefix: '6' }]
  },
  {
    code: '+1',
    name: 'USA/Otros',
    flag: '🇺🇸',
    operators: []
  }
];

interface WhatsAppSendGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DoctorConfig;
  patientName: string;
  patientPhone: string;
  documentTitle?: string;
  documentType?: string;
  treatmentDetails: string;
  targetElement: HTMLElement | null;
  onUpdatePhone?: (phone: string) => void;
}

export const WhatsAppSendGuideModal: React.FC<WhatsAppSendGuideModalProps> = ({
  isOpen,
  onClose,
  config,
  patientName,
  patientPhone,
  documentTitle = 'Récipe Médico',
  documentType = 'recipe',
  treatmentDetails,
  targetElement,
  onUpdatePhone
}) => {
  const [phoneNumber, setPhoneNumber] = useState(patientPhone || '');
  const [countryCode, setCountryCode] = useState('+58');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadCompleted, setDownloadCompleted] = useState(false);

  useEffect(() => {
    if (patientPhone) {
      setPhoneNumber(patientPhone);
    }
  }, [patientPhone]);

  if (!isOpen) return null;

  const todayStr = new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date())
    .replace(/[/\\:]/g, '-');
  const pdfFilename = buildDocumentPdfFilename(documentTitle, patientName || 'Paciente', todayStr);

  const messageText = buildWhatsAppTreatmentMessage({
    doctorName: config.doctorName || 'Dr. Carlos Leal',
    documentType,
    patientName,
    treatmentDetails,
  });

  const getCleanPhoneForWhatsApp = (): string => {
    const raw = (phoneNumber || '').replace(/\D/g, '');
    if (!raw) return '';
    if (raw.startsWith('58') && raw.length >= 11) return raw;
    if (raw.startsWith('0')) return '58' + raw.slice(1);
    if (raw.length === 10 && (raw.startsWith('414') || raw.startsWith('424') || raw.startsWith('412') || raw.startsWith('416') || raw.startsWith('426'))) {
      return '58' + raw;
    }
    const cleanCountry = countryCode.replace(/\D/g, '');
    if (raw.startsWith(cleanCountry)) return raw;
    return `${cleanCountry}${raw}`;
  };

  const handleDownloadAndOpenWhatsApp = async () => {
    try {
      setIsProcessing(true);

      // 1. PRIMERO: Generar y descargar el PDF en el dispositivo
      const element = targetElement || document.querySelector<HTMLElement>(
        '#recipe-4en1-print-sheet, .recipe-4en1-container, #recipe-quarter-print-container, .print-container'
      );
      const blob = await generatePDFBlob(element);
      if (blob) {
        downloadBlobAsFile(blob, pdfFilename);
        setDownloadCompleted(true);
      }

      // 2. Mostrar alerta explicativa en pantalla
      showWhatsAppClipAlert('PDF descargado. Recuerda tocar el ícono del clip 📎 en WhatsApp para adjuntarlo al paciente');

      // 3. SEGUNDO: Abrir WhatsApp con el texto y teléfono
      const cleanPhone = getCleanPhoneForWhatsApp();
      const encodedMsg = encodeURIComponent(messageText);
      const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

      const waUrl = cleanPhone && cleanPhone.length >= 8
        ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
        : (isMobile ? `https://wa.me/?text=${encodedMsg}` : `https://web.whatsapp.com/send?text=${encodedMsg}`);

      setTimeout(() => {
        try {
          if (isMobile) {
            window.location.href = waUrl;
          } else {
            const link = document.createElement('a');
            link.href = waUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              if (document.body.contains(link)) document.body.removeChild(link);
            }, 300);
          }
        } catch (_) {
          window.location.href = waUrl;
        }
        setIsProcessing(false);
      }, 450);

    } catch (err) {
      console.error('[WhatsApp Guide Error]:', err);
      setIsProcessing(false);
    }
  };

  const handleNativeShare = async () => {
    try {
      setIsProcessing(true);
      const element = targetElement || document.querySelector<HTMLElement>(
        '#recipe-4en1-print-sheet, .recipe-4en1-container, #recipe-quarter-print-container, .print-container'
      );
      const blob = await generatePDFBlob(element);
      if (blob && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        const file = new File([blob], pdfFilename, { type: 'application/pdf' });
        if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${documentTitle} - ${patientName}`,
            text: messageText,
          });
          setIsProcessing(false);
          onClose();
          return;
        }
      }
      // Fallback si no admite archivos nativos
      handleDownloadAndOpenWhatsApp();
    } catch (err: any) {
      if (err && err.name === 'AbortError') {
        setIsProcessing(false);
        return;
      }
      handleDownloadAndOpenWhatsApp();
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl shadow-inner">
              📱
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight">Enviar Récipe por WhatsApp</h3>
              <p className="text-[11px] text-emerald-100 font-medium">Guía de descarga y adjunto del PDF oficial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-emerald-700/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-800">
          
          {/* EXPLICACIÓN PASO A PASO EXIGIDA POR EL USUARIO */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-black text-xs uppercase tracking-wide">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">📌</span>
              <span>¿Cómo funciona el envío del récipe a WhatsApp?</span>
            </div>

            <p className="text-[11px] text-slate-700 leading-relaxed">
              WhatsApp no permite adjuntar archivos automáticamente mediante enlaces. Por eso, el sistema realiza este proceso en <strong>3 sencillos pasos</strong>:
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
              <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-slate-900 block font-bold">Primero se descarga el PDF</strong>
                  <span className="text-[11px] text-slate-500">Se guardará en tu dispositivo el archivo <strong>{pdfFilename}</strong>.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-slate-900 block font-bold">Se abre WhatsApp con el mensaje listo</strong>
                  <span className="text-[11px] text-slate-500">Con el saludo del médico y el detalle completo de los medicamentos.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-amber-50 p-2.5 rounded-xl border border-amber-300 shadow-2xs">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-amber-950 block font-bold">Toca el ícono del clip 📎 para adjuntar el PDF</strong>
                  <span className="text-[11px] text-amber-800">En el chat, toca <strong>📎 Documento</strong> y selecciona el PDF recién descargado.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Details & Phone Input */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Paciente: <strong className="text-slate-900">{patientName || 'Carlos leal'}</strong></span>
              </span>
              <span className="text-[10.5px] text-slate-500 font-mono">{todayStr}</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Número de WhatsApp del Paciente:
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-2 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (onUpdatePhone) onUpdatePhone(e.target.value);
                    }}
                    placeholder="Ej. 04141234567 o 4141234567"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Mensaje Automático para el Paciente:
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-900 text-emerald-300 rounded-2xl font-mono text-[11px] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
              {messageText}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            
            {/* BOTÓN PRINCIPAL: Descargar PDF y Abrir WhatsApp */}
            <button
              type="button"
              onClick={handleDownloadAndOpenWhatsApp}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer border border-emerald-400/50"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>{isProcessing ? 'Generando PDF...' : '1. Descargar PDF y 2. Abrir WhatsApp 📲'}</span>
            </button>

            {/* Opción en Celular: Compartir directo con archivo adjunto si el navegador móvil lo soporta */}
            {isMobile && typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={handleNativeShare}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-300" />
                <span>Intentar Menú Nativo del Celular (Compartir archivo)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-slate-500 hover:text-slate-800 font-bold text-xs cursor-pointer text-center"
            >
              Cancelar y volver
            </button>
          </div>

        </div>

        {/* Footer Reminder */}
        <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200 text-[10.5px] text-slate-600 flex items-center gap-1.5 font-medium">
          <Paperclip className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Recuerda: En WhatsApp toca el clip 📎 ➔ Documento para adjuntar el PDF al paciente.</span>
        </div>

      </div>
    </div>
  );
};
