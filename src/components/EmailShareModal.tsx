import React, { useState } from 'react';
import { Mail, Send, Copy, Check, X, User, FileText, Download, ShieldCheck, Printer } from 'lucide-react';
import { DoctorConfig } from '../types';
import { generatePDFBlob } from '../utils/exportDocument';

interface EmailShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DoctorConfig;
  documentType: 'recipe' | 'report' | 'indications' | 'rest' | 'recipe-4en1';
  patientName: string;
  patientEmail?: string;
  documentTitle: string;
  contentBody: string;
  onTriggerPrintPdf?: () => void;
}

export const EmailShareModal: React.FC<EmailShareModalProps> = ({
  isOpen,
  onClose,
  config,
  documentType,
  patientName,
  patientEmail = '',
  documentTitle,
  contentBody,
  onTriggerPrintPdf,
}) => {
  const [emailAddress, setEmailAddress] = useState(patientEmail);
  const [copied, setCopied] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [directSending, setDirectSending] = useState(false);
  const [directSuccess, setDirectSuccess] = useState(false);
  const [directError, setDirectError] = useState<string | null>(null);
  const [directPreviewUrl, setDirectPreviewUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setEmailAddress(patientEmail || '');
      setDirectSuccess(false);
      setDirectError(null);
      setDirectPreviewUrl(null);
    }
  }, [isOpen, patientEmail]);

  // Generate and Upload PDF in the background
  React.useEffect(() => {
    if (!isOpen) return;

    async function autoUploadPdf() {
      try {
        setIsUploading(true);
        // Find visible active sheet container
        const targetElement = document.querySelector<HTMLElement>(
          '.print-container, .report-sheet-container, .recipe-single-container, .indications-container, .rest-container, .recipe-4en1-container, .clinical-history-container'
        );
        const blob = await generatePDFBlob(targetElement);
        if (!blob) {
          console.warn('[Auto Upload Email] Could not generate PDF blob');
          setIsUploading(false);
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          try {
            const cleanPatientName = (patientName || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `${documentType}_${cleanPatientName}.pdf`;

            const res = await fetch('/api/pdf/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pdfBase64: base64, filename })
            });
            const data = await res.json();
            if (data.success && data.url) {
              setPdfUrl(data.url);
              console.log('[Auto Upload Email] PDF uploaded successfully:', data.url);
            }
          } catch (err) {
            console.error('[Auto Upload Email] Error calling upload API:', err);
          } finally {
            setIsUploading(false);
          }
        };
      } catch (err) {
        console.error('[Auto Upload Email] Failed PDF generation:', err);
        setIsUploading(false);
      }
    }

    setPdfUrl(null);
    autoUploadPdf();
  }, [isOpen, documentType, patientName]);

  if (!isOpen) return null;

  // Title translation
  let docTypeHeader = 'RÉCIPE MÉDICO OFICIAL';
  if (documentType === 'report') docTypeHeader = 'INFORME MÉDICO OFICIAL';
  if (documentType === 'indications') docTypeHeader = 'INDICACIONES Y CUIDADOS AL PACIENTE';
  if (documentType === 'rest') docTypeHeader = 'CONSTANCIA DE REPOSO MÉDICO';
  if (documentType === 'recipe-4en1') docTypeHeader = 'HOJA DE RÉCIPES MÉDICOS';

  const emailSubject = `${docTypeHeader} - ${patientName || 'Paciente'} - Dr. ${config.doctorName}`;

  const buildEmailBody = () => {
    let pdfLine = '';
    if (pdfUrl) {
      pdfLine = `🔗 ENLACE DE DESCARGA DIRECTA DEL PDF:\n${pdfUrl}\n\n`;
    }

    return `Estimado(a) ${patientName || 'Paciente'},\n\n` +
      `Le adjuntamos el documento médico emitido por Dr(a). ${config.doctorName} (${config.specialty || 'Médico Cirujano'}).\n\n` +
      `DOCUMENTO: ${docTypeHeader}\n` +
      `MÉDICO TRATANTE: Dr(a). ${config.doctorName}\n` +
      `MPPS: ${config.mpps || '00.000'} · C.I.: ${config.ci || 'V-00.000.000'}\n` +
      (config.collegeNumber ? `COLEGIO MÉDICO: ${config.collegeNumber}\n` : '') +
      `FECHA DE EMISIÓN: ${new Intl.DateTimeFormat('es-ES').format(new Date())}\n` +
      (documentTitle ? `ASUNTO / DIAGNÓSTICO: ${documentTitle}\n` : '') +
      `\n` +
      `------------------------------------------\n` +
      `DETALLE DEL DOCUMENTO Y PRESCRIPCIÓN:\n` +
      `------------------------------------------\n` +
      `${(contentBody || '').trim()}\n` +
      `------------------------------------------\n\n` +
      pdfLine +
      `📄 DOCUMENTO PDF OFICIAL: Le enviamos adjunto su archivo PDF oficial emitido con membrete, firma y sello médico con plena validez para su presentación en farmacias y centros de salud.\n\n` +
      `Siga rigurosamente las indicaciones pautadas por su médico.\n\n` +
      `Atentamente,\n` +
      `Dr(a). ${config.doctorName}\n` +
      `${config.specialty || 'Médico Cirujano'}\n` +
      `${config.phone ? 'Contacto: ' + config.phone + '\n' : ''}` +
      `${config.institution ? config.institution : ''}`;
  };

  const emailBodyText = buildEmailBody();

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBodyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenEmailClient = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const mailtoUrl = `mailto:${encodeURIComponent(emailAddress)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendDirectEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress) {
      alert('Por favor ingrese una dirección de correo válida');
      return;
    }

    try {
      setDirectSending(true);
      setDirectSuccess(false);
      setDirectError(null);
      setDirectPreviewUrl(null);

      // Find visible active sheet container
      const targetElement = document.querySelector<HTMLElement>(
        '.print-container, .report-sheet-container, .recipe-single-container, .indications-container, .rest-container, .recipe-4en1-container, .clinical-history-container'
      );
      const blob = await generatePDFBlob(targetElement);
      if (!blob) {
        throw new Error('No se pudo generar el archivo PDF para adjuntar');
      }

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const cleanPatientName = (patientName || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${documentType}_${cleanPatientName}.pdf`;

        try {
          const res = await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: emailAddress,
              subject: emailSubject,
              body: emailBodyText,
              pdfBase64: base64,
              filename,
            })
          });

          const data = await res.json();
          if (data.success) {
            setDirectSuccess(true);
            if (data.previewUrl) {
              setDirectPreviewUrl(data.previewUrl);
            }
          } else {
            setDirectError(data.message || 'Error al enviar el correo');
          }
        } catch (fetchErr) {
          setDirectError('Error de red al conectar con el servidor de correos');
        } finally {
          setDirectSending(false);
        }
      };
    } catch (err) {
      setDirectError(err instanceof Error ? err.message : String(err));
      setDirectSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 modal-overlay animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-indigo-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Enviar Documento por Correo Electrónico</h3>
              <p className="text-[11px] text-indigo-100">Transmisión de récipes e informes en formato PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-800">
          
          {/* Fast PDF Helper Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-blue-950 block text-xs">Descargar archivo PDF antes de enviar</span>
                <span className="text-[11px] text-blue-800">Guarde el PDF oficial con un clic para adjuntarlo en su correo</span>
              </div>
            </div>
            {onTriggerPrintPdf && (
              <button
                type="button"
                onClick={() => {
                  onTriggerPrintPdf();
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shrink-0 flex items-center gap-1 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </button>
            )}
          </div>

          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-pulse text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
              <span className="font-semibold">Generando y subiendo receta PDF oficial a la nube...</span>
            </div>
          )}
          {pdfUrl && !directSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span className="font-semibold">¡Enlace de descarga directa generado! Se incluirá automáticamente en el cuerpo del correo.</span>
            </div>
          )}

          {/* Direct Send Status Banners */}
          {directSending && (
            <div className="bg-indigo-50 border-2 border-indigo-200 text-indigo-950 p-3.5 rounded-xl flex items-center gap-2.5 animate-pulse text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
              <span className="font-bold">Enviando correo directo con PDF adjunto al paciente...</span>
            </div>
          )}

          {directSuccess && (
            <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-950 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="font-black text-sm">¡Correo Enviado con Éxito!</span>
              </div>
              <p className="text-[11.5px] text-slate-700">
                La prescripción médica ha sido enviada con el formato oficial en formato PDF adjunto a: <strong>{emailAddress}</strong>.
              </p>
              {directPreviewUrl && (
                <div className="pt-1.5">
                  <a 
                    href={directPreviewUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition-transform hover:scale-102"
                  >
                    <span>🔍 Ver Bandeja de Salida (Prueba Sandbox)</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {directError && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-950 p-3.5 rounded-xl space-y-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <X className="w-4 h-4 text-rose-600" />
                <span>Error en el envío directo</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-snug">
                {directError}. Puede usar la opción de abajo <strong>"Abrir en mi Correo"</strong> como alternativa instantánea.
              </p>
            </div>
          )}

          {/* Patient details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-700 shrink-0" />
              <div>
                <span className="text-[10px] text-indigo-700 font-bold block uppercase tracking-wider">Paciente:</span>
                <span className="font-bold text-slate-900 text-sm">{patientName || 'Nombre del Paciente'}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Médico emisor:</span>
              <span className="font-semibold text-slate-800 text-xs">Dr(a). {config.doctorName}</span>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Correo Electrónico del Paciente o Farmacia:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            {/* Message Preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  Vista Preliminar del Correo:
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Texto Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-all border border-slate-800">
                <div className="text-indigo-300 font-bold border-b border-slate-800 pb-1 mb-2">
                  Asunto: {emailSubject}
                </div>
                {emailBodyText}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex flex-col gap-2.5">
              
              {/* PRIMARY HIGHLY VISIBLE ACTION: DIRECT EMAIL WITH PDF */}
              <button
                type="button"
                onClick={handleSendDirectEmail}
                disabled={directSending}
                className="w-full py-2.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl font-black text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-cyan-300" />
                <span>📧 ENVIAR CORREO DIRECTO CON PDF ADJUNTO</span>
              </button>

              <div className="flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-center rounded-xl text-slate-600 hover:text-slate-800 border border-slate-300 hover:bg-slate-50 font-medium"
                >
                  Cerrar Ventana
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEmailClient()}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Abrir tu aplicación local de correo (Gmail, Outlook, etc.) con los datos rellenados"
                >
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>Abrir en mi Correo (Mailto)</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Footer tip */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Documentos válidos para farmacias. Adjunte siempre el archivo PDF descargado.
          </span>
        </div>

      </div>
    </div>
  );
};
