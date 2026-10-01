import React, { useState, useRef } from 'react';
import { DoctorConfig, MedicalRestCert } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { ShieldCheck, Printer, Calendar, MessageSquare, Eye, ArrowLeft, Trash2, Save, Download } from 'lucide-react';

interface MedicalRestModuleProps {
  config: DoctorConfig;
  certificate: MedicalRestCert;
  onChangeCertificate: (updated: Partial<MedicalRestCert>) => void;
  onPrint: () => void;
  onSaveAndShare?: (shouldDownload?: boolean) => void;
  onOpenPreview?: () => void;
  onUpdateConfig?: (updated: Partial<DoctorConfig>) => void;
  onBackToHome?: () => void;
}

export const MedicalRestModule: React.FC<MedicalRestModuleProps> = ({
  config,
  certificate,
  onChangeCertificate,
  onPrint,
  onSaveAndShare,
  onOpenPreview,
  onUpdateConfig,
  onBackToHome,
}) => {
  const printableSheetRef = useRef<HTMLDivElement>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const restBodyForWhatsApp =
    `Quien suscribe, ${config.doctorName} (${config.specialty}, MPPS: ${config.mpps}), hace constar haber evaluado en consulta a:\n\n` +
    `👤 Paciente: ${certificate.patientName} (CI: ${certificate.patientCI})\n` +
    `🏢 Empresa/Receptor: ${certificate.companyName || 'A quien corresponda'}\n` +
    `📌 Diagnóstico: ${certificate.diagnosis}\n` +
    `📅 Reposo Prescrito: ${certificate.daysRest} días continuos\n` +
    `🗓️ Vigencia: Desde ${certificate.startDate} hasta ${certificate.endDate}`;

  const borderStyle = getDocumentBorderStyle(config.borderStyle, config.primaryDocColor);
  const textureClass = getPaperTextureClass(config.paperTexture);

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top bar (no-print) */}
      <div className="w-full max-w-[780px] mb-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-center gap-2">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-300/80 cursor-pointer mr-1"
              title="Volver a la pantalla principal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-600" />
              <span>Inicio</span>
            </button>
          )}
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800">Constancia Médica Oficial</span>
          {/* Botón Rojo: Dejar en Blanco */}
          <button
            type="button"
            onClick={() => {
              onChangeCertificate({
                patientName: '',
                patientCI: '',
                patientPhone: '',
                patientAge: '',
                patientOccupation: '',
                companyName: '',
                diagnosis: '',
                observations: ''
              });
            }}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Dejar constancia y reposo médico en blanco para un nuevo paciente"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>Dejar en Blanco</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick font size adjustment */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium px-1">Letra:</span>
            <button
              onClick={() => {
                const current = parseInt(config.medicalRestFontSize || '13px', 10) || 13;
                onUpdateConfig?.({ medicalRestFontSize: `${Math.max(10, current - 1)}px` });
              }}
              className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border rounded text-[10px] font-bold text-slate-700"
              title="Reducir letra de la constancia"
            >
              A-
            </button>
            <button
              onClick={() => {
                const current = parseInt(config.medicalRestFontSize || '13px', 10) || 13;
                onUpdateConfig?.({ medicalRestFontSize: `${Math.min(22, current + 1)}px` });
              }}
              className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border rounded text-[10px] font-bold text-slate-700"
              title="Agrandar letra de la constancia"
            >
              A+
            </button>
          </div>

          {/* Prominent Save Patient Button */}
          {onSaveAndShare && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (onSaveAndShare) {
                    (onSaveAndShare as any)(false);
                  }
                }}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Guardar constancia en el Banco de Pacientes."
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>💾 Guardar Paciente</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSaveAndShare) {
                    (onSaveAndShare as any)(true);
                  }
                }}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs shadow-md hover:shadow-lg flex items-center gap-1.5 transform hover:scale-[1.02] active:scale-95 transition-all border border-emerald-400/40 cursor-pointer"
                title="Descargar PDF de la constancia y luego abrir opciones de envío"
              >
                <Download className="w-4 h-4 text-emerald-100" />
                <span>Descargar PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black rounded-xl text-xs shadow-sm hover:shadow flex items-center gap-1.5 transform active:scale-95 transition-all cursor-pointer border border-emerald-400/30"
                title="Enviar por WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5 text-teal-100" />
                <span>WhatsApp 💬</span>
              </button>
            </div>
          )}

          {onOpenPreview && (
            <button
              onClick={onOpenPreview}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1 text-[11px] shadow-2xs transition-colors cursor-pointer"
              title="Vista previa fiel de la constancia médica antes de imprimir"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Vista Previa</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable Sheet */}
      <div
        ref={printableSheetRef}
        className={`relative w-full max-w-[780px] min-h-[920px] shadow-xl p-8 transition-all print-container flex flex-col justify-between ${textureClass} ${
          config.enforcePureBlackText ? 'enforce-pure-black' : ''
        }`}
        style={{
          backgroundColor: config.tonePapel || '#ffffff',
          border: borderStyle,
          borderRadius: config.docCornerRadius || '16px',
        }}
      >
        {/* Watermark */}
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

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full flex-1">
          <DocumentHeader
            config={config}
            onUpdateField={(field, val) => onUpdateConfig?.({ [field]: val })}
          />

          <div className="text-center my-4 pb-2 border-b border-slate-200">
            <h2
              className="text-lg font-bold uppercase tracking-wider"
              style={{ color: config.headerColor, fontFamily: config.fuenteHeader }}
            >
              CONSTANCIA MÉDICA
            </h2>
          </div>

          {/* Body Content with Dynamic Font Size & Family */}
          <div 
            className="text-slate-800 space-y-5 flex-1 leading-relaxed mt-2"
            style={{
              fontSize: config.medicalRestFontSize || '13px',
              fontFamily: config.medicalRestFontFamily || "'Merriweather', serif",
            }}
          >
            <p className="text-justify indent-6">
              Por medio de la presente, quien suscribe,{' '}
              <strong>{config.doctorName}</strong>, titular de la Cédula de Identidad{' '}
              <strong>{config.ci}</strong>, con registro del Ministerio del Poder Popular para la Salud{' '}
              <strong>M.P.P.S: {config.mpps}</strong> y{' '}
              <strong>{config.collegeNumber}</strong>, en mi condición de{' '}
              <strong>{config.specialty}</strong>, hace constar haber evaluado en consulta médica al ciudadano(a):
            </p>

            {/* Patient Form Fields - Translucent & Non-occluding for Watermark */}
            <div className="bg-slate-50/30 backdrop-blur-[0.5px] border border-slate-200/80 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs shadow-2xs">
              <div>
                <span className="font-bold text-slate-700">Nombre del Paciente:</span>
                <input
                  type="text"
                  value={certificate.patientName}
                  onChange={(e) => onChangeCertificate({ patientName: e.target.value })}
                  placeholder="Nombre y Apellidos completos"
                  className="w-full bg-transparent border-b border-dashed border-slate-300 font-bold text-slate-900 outline-none mt-1 py-0.5"
                />
              </div>

              <div>
                <span className="font-bold text-slate-700">Cédula de Identidad:</span>
                <input
                  type="text"
                  value={certificate.patientCI}
                  onChange={(e) => onChangeCertificate({ patientCI: e.target.value })}
                  placeholder="V-00.000.000"
                  className="w-full bg-transparent border-b border-dashed border-slate-300 font-medium text-slate-900 outline-none mt-1 py-0.5"
                />
              </div>

              <div>
                <span className="font-bold text-slate-700">Empresa / Institución Receptora:</span>
                <input
                  type="text"
                  value={certificate.companyName}
                  onChange={(e) => onChangeCertificate({ companyName: e.target.value })}
                  placeholder="A quien corresponda / Nombre de empresa"
                  className="w-full bg-transparent border-b border-dashed border-slate-300 text-slate-900 outline-none mt-1 py-0.5"
                />
              </div>

              <div>
                <span className="font-bold text-slate-700">Cargo u Ocupación:</span>
                <input
                  type="text"
                  value={certificate.patientOccupation}
                  onChange={(e) => onChangeCertificate({ patientOccupation: e.target.value })}
                  placeholder="Ocupación del paciente"
                  className="w-full bg-transparent border-b border-dashed border-slate-300 text-slate-900 outline-none mt-1 py-0.5"
                />
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-xs text-slate-800" style={{ color: config.headerColor }}>
                  DIAGNÓSTICO MÉDICO (CIE-10):
                </label>
                {certificate.diagnosis && (
                  <button
                    type="button"
                    onClick={() => onChangeCertificate({ diagnosis: '' })}
                    className="no-print px-1.5 py-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[10px] font-bold flex items-center gap-0.5"
                    title="Borrar diagnóstico"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Borrar</span>
                  </button>
                )}
              </div>
              <textarea
                value={certificate.diagnosis}
                onChange={(e) => onChangeCertificate({ diagnosis: e.target.value })}
                placeholder="Diagnóstico clínico causante de la incapacidad temporal..."
                className="w-full min-h-[60px] p-2.5 bg-white/20 backdrop-blur-[0.5px] border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Rest Days Box */}
            <div className="p-4 rounded-xl border-2 border-dashed border-blue-300/80 bg-blue-50/30 backdrop-blur-[0.5px] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <span className="text-xs font-bold text-blue-900 block">DÍAS DE REPOSO PRESCRITOS:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={certificate.daysRest}
                      onChange={(e) => onChangeCertificate({ daysRest: parseInt(e.target.value) || 1 })}
                      className="w-16 px-2 py-1 bg-white/90 border border-blue-300 rounded font-bold text-blue-900 text-center text-sm shadow-2xs"
                    />
                    <span className="text-xs font-bold text-blue-900">días continuos de reposo absoluto / relativo</span>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <div>
                  <span className="text-slate-600 font-medium">Desde: </span>
                  <input
                    type="text"
                    value={certificate.startDate}
                    onChange={(e) => onChangeCertificate({ startDate: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className="bg-white/90 border border-slate-300 rounded px-2 py-0.5 w-28 text-center"
                  />
                </div>
                <div>
                  <span className="text-slate-600 font-medium">Hasta: </span>
                  <input
                    type="text"
                    value={certificate.endDate}
                    onChange={(e) => onChangeCertificate({ endDate: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className="bg-white/90 border border-slate-300 rounded px-2 py-0.5 w-28 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Legal Closing Text */}
            <p className="text-justify text-xs text-slate-700 indent-6">
              Constancia que se expide a solicitud de la parte interesada, en la ciudad de emisión, a los{' '}
              <strong>{certificate.date}</strong>, para su debida constancia y trámite reglamentario.
            </p>
          </div>

          {/* Footer with Signature & Stamp */}
          <div className="mt-6">
            <DocumentFooter
              config={config}
              onUpdateConfigField={(field, val) => onUpdateConfig?.({ [field]: val })}
            />
          </div>
        </div>

      </div>

      {/* WhatsApp Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        config={config}
        documentType="rest"
        patientName={certificate.patientName}
        patientPhone={certificate.patientPhone || ''}
        documentTitle="Constancia de Reposo Médico"
        contentBody={restBodyForWhatsApp}
        onUpdatePatientPhone={(phone) => onChangeCertificate({ patientPhone: phone })}
        onTriggerPrintPdf={onPrint}
      />

    </div>
  );
};
