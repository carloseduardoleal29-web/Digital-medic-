import React, { useRef, useState, useEffect } from 'react';
import { DoctorConfig, MedicalRestCert } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { EmailShareModal } from './EmailShareModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { exportAndSendWhatsAppBusiness } from '../utils/exportDocument';
import { 
  ShieldCheck, 
  Printer, 
  Calendar, 
  Eye, 
  ArrowLeft, 
  ArrowRight, 
  Trash2, 
  Save, 
  Clock, 
  Download, 
  Mail, 
  Check, 
  Sparkles, 
  User, 
  FileText,
  Briefcase,
  AlertCircle,
  Share2
} from 'lucide-react';
import { exportElementAsPDF, buildDocumentPdfFilename } from '../utils/exportDocument';

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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

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

  const todayDateStr = new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()).replace(/[/\\:]/g, '-');
  const pdfFilename = buildDocumentPdfFilename('Reposo_Medico', safeCert.patientName, todayDateStr);

  const handleDownloadRestPdf = async () => {
    await exportElementAsPDF(printableSheetRef.current, pdfFilename);
  };

  const handlePrintSpecificRest = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center pb-12 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* TOP BANNER & PROGRESS NAVIGATION                          */}
      {/* ========================================================= */}
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-3 sm:p-4 mb-4 no-print">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Inicio</span>
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Asistente de Reposo Médico</span>
              </span>
              <span className="text-xs text-slate-500 font-bold hidden md:inline">
                {safeConfig.doctorName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Font Size Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold px-1">Letra:</span>
              <button
                onClick={() => {
                  const current = parseInt(safeConfig.medicalRestFontSize || '13px', 10) || 13;
                  onUpdateConfig?.({ medicalRestFontSize: `${Math.max(10, current - 1)}px` });
                }}
                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold text-slate-700 cursor-pointer"
              >
                A-
              </button>
              <button
                onClick={() => {
                  const current = parseInt(safeConfig.medicalRestFontSize || '13px', 10) || 13;
                  onUpdateConfig?.({ medicalRestFontSize: `${Math.min(22, current + 1)}px` });
                }}
                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold text-slate-700 cursor-pointer"
              >
                A+
              </button>
            </div>

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
                setCurrentStep(1);
                setFeedbackMsg('✓ Formulario limpiado');
                setTimeout(() => setFeedbackMsg(null), 2000);
              }}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer border border-rose-200"
              title="Vaciar datos y empezar nuevo reposo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Visual Progress Bar */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-3">
          
          {/* Paso 1: Paciente */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-2xl transition-all text-left cursor-pointer ${
              currentStep === 1
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                : currentStep > 1
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-400'
            }`}
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
              currentStep === 1
                ? 'bg-white text-blue-600 shadow-xs'
                : currentStep > 1
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {currentStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-black block leading-tight truncate">
                1. Paciente
              </span>
              <span className={`text-[9px] sm:text-[10px] block truncate ${currentStep === 1 ? 'text-blue-100' : 'text-slate-500'}`}>
                {safeCert.patientName ? safeCert.patientName.split(' ')[0] : 'Datos'}
              </span>
            </div>
          </button>

          {/* Paso 2: Diagnóstico y Reposo */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-2xl transition-all text-left cursor-pointer ${
              currentStep === 2
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                : currentStep > 2
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-400'
            }`}
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
              currentStep === 2
                ? 'bg-white text-blue-600 shadow-xs'
                : currentStep > 2
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {currentStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-black block leading-tight truncate">
                2. Reposo
              </span>
              <span className={`text-[9px] sm:text-[10px] block truncate ${currentStep === 2 ? 'text-blue-100' : 'text-slate-500'}`}>
                Días y Diagnóstico
              </span>
            </div>
          </button>

          {/* Paso 3: Final listo */}
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-2xl transition-all text-left cursor-pointer ${
              currentStep === 3
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
              currentStep === 3
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'bg-slate-200 text-slate-600'
            }`}>
              3
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-black block leading-tight truncate">
                3. Listo
              </span>
              <span className={`text-[9px] sm:text-[10px] block truncate ${currentStep === 3 ? 'text-emerald-100' : 'text-slate-500'}`}>
                Descargar PDF
              </span>
            </div>
          </button>

        </div>
      </div>

      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-2 text-xs font-black animate-in fade-in no-print">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 1: DATOS DEL PACIENTE                                */}
      {/* ========================================================= */}
      {currentStep === 1 && (
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 space-y-6 animate-in fade-in no-print">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                <span>Paso 1: Datos del Paciente</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Ingrese la información de filiación del paciente y la institución receptora:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Nombre y Apellido del Paciente: *
              </label>
              <input
                type="text"
                value={safeCert.patientName}
                onChange={(e) => onChangeCertificate({ patientName: e.target.value })}
                placeholder="Ej: Juan Carlos Pérez"
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base sm:text-lg font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Cédula de Identidad (C.I.):
              </label>
              <input
                type="text"
                value={safeCert.patientCI}
                onChange={(e) => onChangeCertificate({ patientCI: e.target.value })}
                placeholder="Ej: V-18.456.789"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Edad del Paciente:
              </label>
              <input
                type="text"
                value={safeCert.patientAge}
                onChange={(e) => onChangeCertificate({ patientAge: e.target.value })}
                placeholder="Ej: 42 años"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Empresa / Institución Receptora:
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={safeCert.companyName}
                  onChange={(e) => onChangeCertificate({ companyName: e.target.value })}
                  placeholder="Ej: A quien corresponda / Empresa S.A."
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Cargo u Ocupación:
              </label>
              <input
                type="text"
                value={safeCert.patientOccupation}
                onChange={(e) => onChangeCertificate({ patientOccupation: e.target.value })}
                placeholder="Ej: Analista de Sistemas"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Teléfono WhatsApp:
              </label>
              <input
                type="tel"
                value={safeCert.patientPhone || ''}
                onChange={(e) => onChangeCertificate({ patientPhone: e.target.value })}
                placeholder="Ej: +58 412 1234567"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Fecha de Emisión:</span>
              </label>
              <input
                type="text"
                value={safeCert.date}
                onChange={(e) => onChangeCertificate({ date: e.target.value })}
                placeholder="DD/MM/AAAA"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

          </div>

          {/* Action Button: Continuar */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>Siguiente: Pauta de Reposo</span>
              <ArrowRight className="w-5 h-5 text-cyan-200" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 2: DIAGNÓSTICO Y REPOSO                              */}
      {/* ========================================================= */}
      {currentStep === 2 && (
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 space-y-6 animate-in fade-in no-print">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                <span>Paso 2: Diagnóstico y Días de Reposo</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Especifique la causa médica y la duración del reposo temporal:
              </p>
            </div>
          </div>

          <div className="space-y-5">
            
            {/* 1. Diagnóstico Médico */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Diagnóstico Médico (CIE-10): *
              </label>
              <textarea
                rows={4}
                value={safeCert.diagnosis}
                onChange={(e) => onChangeCertificate({ diagnosis: e.target.value })}
                placeholder="Escriba el diagnóstico de incapacidad temporal del paciente..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all leading-relaxed shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 2. Reposo Days and Dates */}
            <div className="p-5 bg-gradient-to-br from-blue-50/50 via-indigo-50/20 to-white border-2 border-blue-100 rounded-3xl space-y-4">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-blue-950 block">DÍAS DE REPOSO PRESCRITOS:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={safeCert.daysRest !== undefined && safeCert.daysRest !== null ? String(safeCert.daysRest) : ''}
                        onChange={(e) => handleDaysChange(e.target.value)}
                        placeholder="0"
                        className="w-20 px-3 py-1.5 bg-white border-2 border-blue-400 rounded-xl font-black text-blue-900 text-center text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-xs sm:text-sm font-bold text-blue-900">
                        {Number(safeCert.daysRest) === 1 ? 'día continuo de reposo' : 'días continuos de reposo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Chips */}
                <div className="flex flex-col items-start md:items-end">
                  <span className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600" />
                    Selección rápida de días:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {COMMON_REST_DAYS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleDaysChange(d)}
                        className={`px-3 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                          Number(safeCert.daysRest) === d
                            ? 'bg-blue-600 text-white shadow-md scale-105'
                            : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {d} {d === 1 ? 'día' : 'd'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Automatic Dates Calculation */}
              <div className="pt-4 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-slate-700 font-bold shrink-0">Desde (Inicio):</span>
                  <input
                    type="text"
                    value={safeCert.startDate || todayFormatted}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="bg-white border-2 border-slate-200 rounded-xl px-3 py-2 w-full sm:w-36 font-bold text-slate-800 text-center shadow-2xs outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-slate-700 font-bold shrink-0">Hasta (Fin):</span>
                  <input
                    type="text"
                    value={safeCert.endDate || ''}
                    onChange={(e) => onChangeCertificate({ endDate: e.target.value })}
                    placeholder="Automático (DD/MM/AAAA)"
                    className="bg-emerald-50/70 border-2 border-emerald-300 rounded-xl px-3 py-2 w-full sm:w-44 font-bold text-emerald-950 text-center shadow-2xs outline-none focus:border-emerald-500 text-sm"
                  />
                  <span className="text-[10px] text-emerald-700 font-black bg-emerald-100 px-2 py-1 rounded-lg shrink-0">
                    ⚡ Calculado
                  </span>
                </div>
              </div>

            </div>

            {/* Observations / Comentarios */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Observaciones Médicas Adicionales (Opcional):
              </label>
              <textarea
                rows={3}
                value={safeCert.observations || ''}
                onChange={(e) => onChangeCertificate({ observations: e.target.value })}
                placeholder="Ej: Se sugiere reposo absoluto, evitar bipedestación prolongada..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>Ver Formato y Descargar PDF</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 3: VISTA FINAL & ACCIONES                            */}
      {/* ========================================================= */}
      {currentStep === 3 && (
        <div className="w-full space-y-4 animate-in fade-in">
          
          {/* Main Action Control Center Bar */}
          <div className="w-full bg-slate-900 text-white rounded-3xl border border-slate-800 p-4 sm:p-5 shadow-2xl space-y-4 no-print">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center">
                  ✓
                </span>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                    Constancia de Reposo Lista
                  </h3>
                  <span className="text-xs text-emerald-300 font-medium">
                    Paciente: <strong>{safeCert.patientName || 'Sin nombre'}</strong> · {safeCert.daysRest || '0'} Días de Reposo
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Instant Action Buttons */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 w-full">
              
              {/* Botón Descargar PDF */}
              <button
                type="button"
                onClick={handleDownloadRestPdf}
                className="w-full min-h-[46px] p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-95 cursor-pointer border border-blue-400/40"
                title="Descargar PDF oficial firmado y sellado"
              >
                <Download className="w-4 h-4 text-cyan-200 shrink-0" />
                <span className="truncate">Descargar / Guardar PDF</span>
              </button>

              {/* Botón WhatsApp */}
              <button
                type="button"
                onClick={() => {
                  const restDetails = `Reposo por ${safeCert.daysRest || 1} días continuos (Desde ${safeCert.startDate || safeCert.date} hasta ${safeCert.endDate || 'cumplimiento'}). Diagnóstico: ${safeCert.diagnosis || 'Reposo médico'}`;

                  exportAndSendWhatsAppBusiness({
                    element: printableSheetRef.current,
                    patientName: safeCert.patientName || 'Carlos leal',
                    documentTitle: 'Constancia de Reposo',
                    dateStr: safeCert.date || '14/10/26',
                    patientPhone: safeCert.patientPhone,
                    doctorName: config.doctorName || 'Dr. Carlos Leal',
                    treatmentDetails: restDetails,
                    documentType: 'rest',
                  });
                }}
                className="w-full min-h-[46px] p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-95 cursor-pointer border border-emerald-400/40"
              >
                <span className="text-base shrink-0">📱</span>
                <span className="truncate">Enviar por WhatsApp</span>
              </button>

              {/* Enviar por Correo */}
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="w-full min-h-[46px] p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-95 cursor-pointer border border-indigo-400/40"
              >
                <Mail className="w-4 h-4 text-indigo-200 shrink-0" />
                <span className="truncate">Enviar por Correo</span>
              </button>

            </div>

            {/* Extra Row: Guardar Paciente y Edición */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs w-full">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onSaveAndShare && (
                  <button
                    type="button"
                    onClick={() => (onSaveAndShare as any)(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
                  >
                    <Save className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Guardar Paciente</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Volver a Editar</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA PREVIA REAL DEL REPOSO EN FORMATO CARTA             */}
      {/* ========================================================= */}
      <div className={currentStep === 3 ? "w-full flex justify-center py-2" : "hidden"}>
            <div
              ref={printableSheetRef}
              id="rest-print-container"
              className={`relative w-full max-w-[816px] bg-white shadow-2xl p-6 sm:p-8 rounded-2xl transition-all report-sheet-container print-container border border-slate-200/90 ${textureClass} ${
                safeConfig.enforcePureBlackText ? 'enforce-pure-black' : ''
              }`}
              style={{
                backgroundColor: safeConfig.tonePapel || '#ffffff',
                border: borderStyle,
                borderRadius: safeConfig.docCornerRadius || '16px',
                minHeight: '1056px',
                boxSizing: 'border-box',
              }}
            >
              {/* Watermark */}
              {safeConfig.marcaAgua && !safeConfig.marcaAgua.includes('DIGITAL') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                  <img
                    src={safeConfig.marcaAgua}
                    alt="Marca de agua"
                    className="marca-agua-img"
                    style={{
                      opacity: safeConfig.watermarkOpacity ?? 0.16,
                      width: `${safeConfig.watermarkScale || 55}%`,
                      transform: `rotate(${safeConfig.watermarkRotation || 0}deg)`,
                    }}
                  />
                </div>
              )}

              {/* Printable Body */}
              <div className="relative z-10 flex flex-col h-full justify-between min-h-[960px]">
                
                {/* Header */}
                <DocumentHeader
                  config={safeConfig}
                  onUpdateField={(field, val) => onUpdateConfig?.({ [field]: val })}
                />

                {/* Document Title */}
                <div className="text-center my-6 pb-2 border-b border-slate-200">
                  <h2
                    className="text-lg sm:text-xl font-black uppercase tracking-wider"
                    style={{ color: safeConfig.headerColor, fontFamily: safeConfig.fuenteHeader }}
                  >
                    CONSTANCIA DE REPOSO MÉDICO
                  </h2>
                </div>

                {/* Certificate Body Text */}
                <div
                  className="text-slate-900 space-y-6 flex-1 leading-relaxed mt-4"
                  style={{
                    fontSize: safeConfig.medicalRestFontSize || '13px',
                    fontFamily: safeConfig.medicalRestFontFamily || "'Merriweather', serif",
                  }}
                >
                  <p className="text-justify indent-8 text-sm sm:text-base leading-loose">
                    Por medio de la presente, quien suscribe,{' '}
                    <strong>{safeConfig.doctorName}</strong>, titular de la Cédula de Identidad{' '}
                    <strong>{safeConfig.ci}</strong>, con registro del Ministerio del Poder Popular para la Salud{' '}
                    <strong>M.P.P.S: {safeConfig.mpps}</strong>
                    {safeConfig.collegeNumber ? ` y Colegio de Médicos: ${safeConfig.collegeNumber}` : ''}, 
                    en mi condición de <strong>{safeConfig.specialty}</strong>, hace constar haber evaluado clínicamente al ciudadano(a):
                  </p>

                  {/* Patient details container */}
                  <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[10px]">Nombre del Paciente:</span>
                      <span className="font-black text-slate-900 text-sm sm:text-base">{safeCert.patientName || 'Paciente'}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[10px]">Cédula de Identidad:</span>
                      <span className="font-black text-slate-900 text-sm sm:text-base">{safeCert.patientCI || 'S/C'}</span>
                    </div>

                    {safeCert.patientAge && (
                      <div>
                        <span className="text-slate-500 font-bold block uppercase text-[10px]">Edad del Paciente:</span>
                        <span className="font-bold text-slate-800">{safeCert.patientAge}</span>
                      </div>
                    )}

                    {safeCert.patientOccupation && (
                      <div>
                        <span className="text-slate-500 font-bold block uppercase text-[10px]">Cargo u Ocupación:</span>
                        <span className="font-bold text-slate-800">{safeCert.patientOccupation}</span>
                      </div>
                    )}

                    {safeCert.companyName && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 font-bold block uppercase text-[10px]">Empresa / Institución Receptora:</span>
                        <span className="font-bold text-slate-800">{safeCert.companyName}</span>
                      </div>
                    )}
                  </div>

                  {/* Diagnosis Display */}
                  {safeCert.diagnosis && (
                    <div className="space-y-1.5">
                      <h4 className="font-black text-xs uppercase tracking-wide" style={{ color: safeConfig.headerColor }}>
                        Diagnóstico Médico (CIE-10):
                      </h4>
                      <div className="p-4 bg-slate-50/30 border border-slate-200 rounded-xl whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-800">
                        {safeCert.diagnosis}
                      </div>
                    </div>
                  )}

                  {/* Rest Days Details Display */}
                  <div className="border-2 border-dashed border-blue-200 bg-blue-50/10 rounded-2xl p-4 sm:p-5 space-y-2">
                    <span className="text-xs font-black text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Incapacidad Temporal y Duración del Reposo:</span>
                    </span>
                    <p className="text-sm leading-relaxed text-slate-800">
                      Debido a la condición clínica descrita, se indica que el paciente requiere obligatoriamente{' '}
                      <strong className="text-blue-950 font-black text-base">
                        {safeCert.daysRest || '___'} días continuos
                      </strong> de reposo físico laboral, comprendidos:
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-center text-xs font-bold pt-1.5">
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                        <span className="text-slate-500 block uppercase text-[9px] mb-0.5">Fecha de Inicio (Desde):</span>
                        <span className="text-slate-900 text-sm">{safeCert.startDate || todayFormatted}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                        <span className="text-slate-500 block uppercase text-[9px] mb-0.5">Fecha de Culminación (Hasta):</span>
                        <span className="text-emerald-800 font-black text-sm">{safeCert.endDate || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Observations */}
                  {safeCert.observations && (
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-slate-500 uppercase">Observaciones:</span>
                      <p className="text-slate-700 italic bg-slate-50/40 p-3 rounded-xl border border-slate-100 text-xs leading-relaxed">
                        "{safeCert.observations}"
                      </p>
                    </div>
                  )}

                  {/* Legal Closing Statement */}
                  <p className="text-justify text-xs text-slate-600 indent-6 pt-3 leading-relaxed border-t border-slate-100">
                    Constancia legal que se emite a petición de la parte interesada, en la ciudad de emisión, a los{' '}
                    <strong>{safeCert.date || todayFormatted}</strong>, dando plena fe de los hallazgos clínicos descritos para los fines legales que correspondan.
                  </p>

                </div>

                {/* Footer Signature Canvas */}
                <div className="pt-6">
                  <DocumentFooter
                    config={safeConfig}
                    onUpdateConfigField={(field, val) => onUpdateConfig?.({ [field]: val })}
                  />
                </div>

              </div>
            </div>
          </div>

      {/* ========================================================= */}
      {/* SHARING MODALS                                            */}
      {/* ========================================================= */}


      <EmailShareModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        config={safeConfig}
        documentType="rest"
        patientName={safeCert.patientName}
        patientEmail={certificate.patientEmail || ''}
        documentTitle={safeCert.diagnosis || 'Constancia de Reposo'}
        contentBody={
          `Estimado(a) Paciente ${safeCert.patientName},\n\n` +
          `Se emite constancia formal de reposo de ${safeCert.daysRest || '0'} días continuos, desde el ${safeCert.startDate} hasta el ${safeCert.endDate || '—'}.\n\n` +
          `Diagnóstico: ${safeCert.diagnosis || 'Consulta General'}`
        }
        onTriggerPrintPdf={handleDownloadRestPdf}
      />

    </div>
  );
};
