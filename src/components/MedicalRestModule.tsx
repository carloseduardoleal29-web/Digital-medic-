import React, { useRef, useEffect } from 'react';
import { DoctorConfig, MedicalRestCert } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { ShieldCheck, Printer, Calendar, Eye, ArrowLeft, Trash2, Save, Clock, Download, Mail } from 'lucide-react';

interface MedicalRestModuleProps {
  config: DoctorConfig;
  certificate: MedicalRestCert;
  onChangeCertificate: (updated: Partial<MedicalRestCert>) => void;
  onPrint: () => void;
  onDownloadPdf?: () => void;
  onOpenEmailModal?: () => void;
  onSaveAndShare?: (shouldDownload?: boolean) => void;
  onOpenPreview?: () => void;
  onUpdateConfig?: (updated: Partial<DoctorConfig>) => void;
  onBackToHome?: () => void;
}

const COMMON_REST_DAYS = [1, 2, 3, 5, 7, 10, 15, 21, 30];

// Helper to calculate end date from start date and days of rest
function computeEndDate(startDateStr: string, days: number | string): string {
  const numDays = typeof days === 'string' ? parseInt(days, 10) : days;
  if (!numDays || isNaN(numDays) || numDays <= 0) return '';

  // Parse DD/MM/YYYY or YYYY-MM-DD
  let day = 0;
  let month = 0;
  let year = 0;

  if (startDateStr.includes('/')) {
    const parts = startDateStr.split('/');
    if (parts.length === 3) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
  } else if (startDateStr.includes('-')) {
    const parts = startDateStr.split('-');
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    }
  }

  if (!day || isNaN(day) || !year || isNaN(year)) {
    const now = new Date();
    day = now.getDate();
    month = now.getMonth();
    year = now.getFullYear();
  }

  const startDate = new Date(year, month, day);
  // If rest is N days, end date is startDate + (N - 1) days
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (numDays - 1));

  const dd = String(endDate.getDate()).padStart(2, '0');
  const mm = String(endDate.getMonth() + 1).padStart(2, '0');
  const yyyy = endDate.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}

export const MedicalRestModule: React.FC<MedicalRestModuleProps> = ({
  config,
  certificate,
  onChangeCertificate,
  onPrint,
  onDownloadPdf,
  onOpenEmailModal,
  onSaveAndShare,
  onOpenPreview,
  onUpdateConfig,
  onBackToHome,
}) => {
  const printableSheetRef = useRef<HTMLDivElement>(null);

  const todayFormatted = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  const safeCert = certificate || {
    id: 'REP-01',
    patientName: '',
    patientCI: '',
    patientPhone: '',
    patientAge: '',
    patientOccupation: '',
    companyName: '',
    date: todayFormatted,
    daysRest: '',
    startDate: todayFormatted,
    endDate: '',
    diagnosis: '',
    observations: '',
  };

  const safeConfig = config || {
    doctorName: 'Dr. Médico Tratante',
    specialty: 'Médico Cirujano',
    mpps: '',
    borderStyle: 'solido',
    primaryDocColor: '#2563eb',
    paperTexture: 'lisa',
  };

  // Ensure default startDate is populated
  useEffect(() => {
    if (!certificate.startDate) {
      onChangeCertificate({ startDate: todayFormatted });
    }
  }, []);

  // Update days of rest and auto-calculate end date
  const handleDaysChange = (daysVal: string | number) => {
    const start = certificate.startDate || todayFormatted;
    const computedEnd = daysVal !== '' ? computeEndDate(start, daysVal) : '';
    onChangeCertificate({
      daysRest: daysVal as any,
      startDate: start,
      endDate: computedEnd,
    });
  };

  // When start date changes, recalculate end date automatically
  const handleStartDateChange = (newStart: string) => {
    const daysVal = certificate.daysRest;
    const computedEnd = daysVal ? computeEndDate(newStart, daysVal) : certificate.endDate || '';
    onChangeCertificate({
      startDate: newStart,
      endDate: computedEnd,
    });
  };

  const borderStyle = getDocumentBorderStyle(safeConfig.borderStyle, safeConfig.primaryDocColor);
  const textureClass = getPaperTextureClass(safeConfig.paperTexture);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top action bar (no-print) */}
      <div className="w-full max-w-[780px] mb-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-center gap-2">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-300/80 cursor-pointer mr-1"
              title="Volver al menú principal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Inicio</span>
            </button>
          )}
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800">Constancia de Reposo Médico</span>

          {/* Botón: Dejar en Blanco */}
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
                observations: '',
                daysRest: '' as any,
                startDate: todayFormatted,
                endDate: '',
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
              className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border rounded text-[10px] font-bold text-slate-700 cursor-pointer"
              title="Reducir letra de la constancia"
            >
              A-
            </button>
            <button
              onClick={() => {
                const current = parseInt(config.medicalRestFontSize || '13px', 10) || 13;
                onUpdateConfig?.({ medicalRestFontSize: `${Math.min(22, current + 1)}px` });
              }}
              className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border rounded text-[10px] font-bold text-slate-700 cursor-pointer"
              title="Agrandar letra de la constancia"
            >
              A+
            </button>
          </div>

          {/* Guardar Paciente */}
          {onSaveAndShare && (
            <button
              type="button"
              onClick={() => {
                (onSaveAndShare as any)(false);
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Guardar constancia en el Banco de Pacientes."
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>💾 Guardar Paciente</span>
            </button>
          )}

          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Descargar constancia en archivo PDF con el nombre del paciente y fecha"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>📥 Descargar PDF</span>
            </button>
          )}

          {onOpenEmailModal && (
            <button
              type="button"
              onClick={onOpenEmailModal}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Enviar constancia de reposo por correo electrónico al paciente"
            >
              <Mail className="w-3.5 h-3.5 text-white" />
              <span>✉️ Enviar por Correo</span>
            </button>
          )}

          {/* Vista Previa */}
          {onOpenPreview && (
            <button
              onClick={onOpenPreview}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center gap-1 text-xs shadow-2xs transition-colors cursor-pointer"
              title="Vista previa de la constancia médica antes de imprimir"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Vista Previa</span>
            </button>
          )}

          {/* Imprimir Documento */}
          <button
            type="button"
            onClick={onPrint}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Imprimir constancia directamente o guardar como PDF del sistema"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>🖨️ Imprimir Constancia</span>
          </button>
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
              CONSTANCIA DE REPOSO MÉDICO
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

            {/* Patient Form Fields */}
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
                    className="no-print px-1.5 py-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
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

            {/* Rest Days Box with Quick Selector & Auto-Calculated Dates */}
            <div className="p-4 rounded-xl border-2 border-dashed border-blue-300/80 bg-blue-50/40 backdrop-blur-[0.5px] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-blue-900 block">DÍAS DE REPOSO PRESCRITOS:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={certificate.daysRest !== undefined && certificate.daysRest !== null ? String(certificate.daysRest) : ''}
                        onChange={(e) => handleDaysChange(e.target.value)}
                        placeholder="0"
                        className="w-20 px-2 py-1 bg-white border-2 border-blue-400 rounded-lg font-bold text-blue-900 text-center text-sm shadow-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-xs font-bold text-blue-900">
                        {Number(certificate.daysRest) === 1 ? 'día continuo de reposo' : 'días continuos de reposo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Days Selector Chips (no-print) */}
                <div className="no-print flex flex-col items-end">
                  <span className="text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600" />
                    Selección rápida de días:
                  </span>
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {COMMON_REST_DAYS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleDaysChange(d)}
                        className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          Number(certificate.daysRest) === d
                            ? 'bg-blue-600 text-white shadow-xs scale-105'
                            : 'bg-white hover:bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {d} {d === 1 ? 'día' : 'd'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Automatic Dates Calculation Display */}
              <div className="pt-2 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-bold">Desde (Inicio):</span>
                  <input
                    type="text"
                    value={certificate.startDate || todayFormatted}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 w-32 font-bold text-slate-800 text-center shadow-2xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-bold">Hasta (Culminación):</span>
                  <input
                    type="text"
                    value={certificate.endDate || ''}
                    onChange={(e) => onChangeCertificate({ endDate: e.target.value })}
                    placeholder="Automático (DD/MM/AAAA)"
                    className="bg-emerald-50/70 border border-emerald-300 rounded-lg px-2.5 py-1 w-40 font-bold text-emerald-900 text-center shadow-2xs outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded no-print">
                    ⚡ Calculado
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Closing Text */}
            <p className="text-justify text-xs text-slate-700 indent-6">
              Constancia que se expide a solicitud de la parte interesada, en la ciudad de emisión, a los{' '}
              <strong>{certificate.date || todayFormatted}</strong>, para su debida constancia y trámite reglamentario.
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
    </div>
  );
};
