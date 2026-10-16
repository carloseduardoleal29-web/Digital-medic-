import React, { useState, useRef, useEffect } from 'react';
import { DoctorConfig, MedicalReport, SavedPatientEntry } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { EmailShareModal } from './EmailShareModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { exportAndSendWhatsAppBusiness } from '../utils/exportDocument';
import { 
  FileText, 
  Printer, 
  Eye, 
  ArrowLeft, 
  ArrowRight, 
  Trash2, 
  Save, 
  Download, 
  Calendar, 
  Mail, 
  User, 
  Clock, 
  Check, 
  ClipboardCheck, 
  Plus, 
  Sparkles,
  Layers,
  Activity,
  HeartPulse,
  Stethoscope,
  Share2
} from 'lucide-react';
import { exportElementAsPDF, buildDocumentPdfFilename } from '../utils/exportDocument';

interface ReportsModuleProps {
  config: DoctorConfig;
  currentReport: MedicalReport;
  onChangeReport: (updated: Partial<MedicalReport>) => void;
  onPrint: () => void;
  onDownloadPdf?: () => void;
  onOpenEmailModal?: () => void;
  onSaveAndShare?: (shouldDownload?: boolean) => void;
  onInstantWhatsApp?: () => void;
  onOpenPreview?: () => void;
  onUpdateConfig?: (updated: Partial<DoctorConfig>) => void;
  onBackToHome?: () => void;
  existingPatients?: SavedPatientEntry[];
}

const TEMPLATES: Record<string, Partial<MedicalReport>> = {
  quirurgico: {
    title: "INFORME MÉDICO DE EVALUACIÓN QUIRÚRGICA",
    reasonForConsultation: "",
    clinicalSummary: "",
    procedures: "",
    paraclinicalStudies: "",
    diagnosticImpression: "",
    treatmentPlan: "",
    recommendations: "",
    daysRest: "",
  },
  consulta: {
    title: "INFORME MÉDICO DE CONSULTA EXTERNA",
    reasonForConsultation: "",
    clinicalSummary: "",
    procedures: "",
    paraclinicalStudies: "",
    diagnosticImpression: "",
    treatmentPlan: "",
    recommendations: "",
    daysRest: "",
  },
  alta: {
    title: "INFORME MÉDICO DE ALTA DE HOSPITALIZACIÓN",
    reasonForConsultation: "",
    clinicalSummary: "",
    procedures: "",
    paraclinicalStudies: "",
    diagnosticImpression: "",
    treatmentPlan: "",
    recommendations: "",
    daysRest: "",
  }
};

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  config,
  currentReport,
  onChangeReport,
  onPrint,
  onDownloadPdf,
  onOpenEmailModal,
  onSaveAndShare,
  onInstantWhatsApp,
  onOpenPreview,
  onUpdateConfig,
  onBackToHome,
  existingPatients = [],
}) => {
  const printableReportRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const applyTemplate = (key: string) => {
    const tmpl = TEMPLATES[key];
    if (tmpl) {
      onChangeReport({
        ...tmpl,
        reportType: key as any,
      });
      setFeedbackMsg(`✓ Plantilla "${key.toUpperCase()}" aplicada con éxito`);
      setTimeout(() => setFeedbackMsg(null), 2000);
    }
  };

  const safeReport = currentReport || {
    id: 'INF-01',
    patientName: '',
    patientAge: '',
    patientCI: '',
    patientPhone: '',
    patientGender: 'M',
    date: new Date().toLocaleDateString('es-VE'),
    reportType: 'consulta',
    title: 'INFORME MÉDICO',
    reasonForConsultation: '',
    clinicalSummary: '',
    procedures: '',
    paraclinicalStudies: '',
    diagnosticImpression: '',
    treatmentPlan: '',
    recommendations: '',
    daysRest: '',
    restStartDate: new Date().toLocaleDateString('es-VE'),
    restEndDate: '',
  };

  const safeConfig = config || {
    doctorName: 'Dr. Carlos Leal',
    specialty: 'Médico Cirujano',
    borderStyle: 'solido',
    primaryDocColor: '#2563eb',
    paperTexture: 'lisa',
  };

  const reportBodyForWhatsApp = 
    `1. RESUMEN CLÍNICO:\n${safeReport.clinicalSummary || ''}\n\n` +
    `2. PROCEDIMIENTOS / EXAMEN:\n${safeReport.procedures || ''}\n\n` +
    `3. ESTUDIOS PARACLÍNICOS:\n${safeReport.paraclinicalStudies || ''}\n\n` +
    `4. IMPRESIÓN DIAGNÓSTICA:\n${safeReport.diagnosticImpression || ''}\n\n` +
    `5. CONDUCTA Y RECOMENDACIONES:\n${safeReport.recommendations || ''}` +
    (safeReport.daysRest ? `\n\n6. REPOSO MÉDICO: ${safeReport.daysRest} continuos` + (safeReport.restStartDate ? ` (Desde: ${safeReport.restStartDate} Hasta: ${safeReport.restEndDate || '—'})` : '') : '');

  const borderStyle = getDocumentBorderStyle(safeConfig.borderStyle, safeConfig.primaryDocColor);
  const textureClass = getPaperTextureClass(safeConfig.paperTexture);

  const todayDateStr = new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()).replace(/[/\\:]/g, '-');
  const pdfFilename = buildDocumentPdfFilename('Informe_Medico', safeReport.patientName, todayDateStr);

  const handleDownloadReportPdf = async () => {
    await exportElementAsPDF(printableReportRef.current, pdfFilename);
  };

  const handlePrintSpecificReport = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center pb-12 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* TOP BANNER & PROGRESS NAVIGATION                          */}
      {/* ========================================================= */}
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-3 sm:p-4 mb-4">
        
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
                <span>Asistente de Informe Médico</span>
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
                  const current = parseInt(safeConfig.reportFontSize || '12px', 10) || 12;
                  onUpdateConfig?.({ reportFontSize: `${Math.max(10, current - 1)}px` });
                }}
                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold text-slate-700 cursor-pointer"
              >
                A-
              </button>
              <button
                onClick={() => {
                  const current = parseInt(safeConfig.reportFontSize || '12px', 10) || 12;
                  onUpdateConfig?.({ reportFontSize: `${Math.min(20, current + 1)}px` });
                }}
                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold text-slate-700 cursor-pointer"
              >
                A+
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onChangeReport({
                  patientName: '',
                  patientCI: '',
                  patientPhone: '',
                  patientAge: '',
                  clinicalSummary: '',
                  procedures: '',
                  paraclinicalStudies: '',
                  diagnosticImpression: '',
                  treatmentPlan: '',
                  recommendations: '',
                  daysRest: '',
                  restStartDate: '',
                  restEndDate: ''
                });
                setCurrentStep(1);
                setFeedbackMsg('✓ Formulario limpiado');
                setTimeout(() => setFeedbackMsg(null), 2000);
              }}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer border border-rose-200"
              title="Vaciar datos y empezar nuevo informe"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Visual Progress Bar */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3 pt-3">
          
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
                {safeReport.patientName ? safeReport.patientName.split(' ')[0] : 'Datos'}
              </span>
            </div>
          </button>

          {/* Paso 2: Clínico */}
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
                2. Evaluación
              </span>
              <span className={`text-[9px] sm:text-[10px] block truncate ${currentStep === 2 ? 'text-blue-100' : 'text-slate-500'}`}>
                Resumen y Examen
              </span>
            </div>
          </button>

          {/* Paso 3: Plan y Diagnósticos */}
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-2xl transition-all text-left cursor-pointer ${
              currentStep === 3
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                : currentStep > 3
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-400'
            }`}
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
              currentStep === 3
                ? 'bg-white text-blue-600 shadow-xs'
                : currentStep > 3
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {currentStep > 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-black block leading-tight truncate">
                3. Conducta
              </span>
              <span className={`text-[9px] sm:text-[10px] block truncate ${currentStep === 3 ? 'text-blue-100' : 'text-slate-500'}`}>
                Tratamiento
              </span>
            </div>
          </button>

          {/* Paso 4: Final listo */}
          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-2xl transition-all text-left cursor-pointer ${
              currentStep === 4
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
              currentStep === 4
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'bg-slate-200 text-slate-600'
            }`}>
              4
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-black block leading-tight truncate">
                4. Listo
              </span>
              <span className={`text-[9px] sm:text-[10px] block truncate ${currentStep === 4 ? 'text-emerald-100' : 'text-slate-500'}`}>
                Descargar PDF
              </span>
            </div>
          </button>

        </div>
      </div>

      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-2 text-xs font-black animate-in fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 1: DATOS DEL PACIENTE & PLANTILLAS                   */}
      {/* ========================================================= */}
      {currentStep === 1 && (
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 space-y-6 animate-in fade-in">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                <span>Paso 1: Datos del Paciente</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Seleccione una plantilla médica o ingrese los datos de filiación del paciente:
              </p>
            </div>
          </div>

          {/* Quick Template Cards */}
          <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Plantillas de Redacción Rápida:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1.5">
              <button
                type="button"
                onClick={() => applyTemplate('quirurgico')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  safeReport.reportType === 'quirurgico'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <span className="font-black text-xs block mb-0.5">📂 Quirúrgico</span>
                <span className="text-[10px] opacity-90 block leading-tight">Valoración anestésica e intervención programada.</span>
              </button>

              <button
                type="button"
                onClick={() => applyTemplate('consulta')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  safeReport.reportType === 'consulta'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <span className="font-black text-xs block mb-0.5">📋 Consulta Externa</span>
                <span className="text-[10px] opacity-90 block leading-tight">Evaluación clínica integral y control médico general.</span>
              </button>

              <button
                type="button"
                onClick={() => applyTemplate('alta')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  safeReport.reportType === 'alta'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <span className="font-black text-xs block mb-0.5">🏥 Alta Médica</span>
                <span className="text-[10px] opacity-90 block leading-tight">Condiciones estables al egreso domiciliario pos-ingreso.</span>
              </button>
            </div>
          </div>

          {/* Form Fields: Grandes y Cómodos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Título del Informe: *
              </label>
              <input
                type="text"
                value={safeReport.title}
                onChange={(e) => onChangeReport({ title: e.target.value })}
                placeholder="Ej: INFORME MÉDICO OFICIAL"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Nombre y Apellido del Paciente: *
              </label>
              <input
                type="text"
                value={safeReport.patientName}
                onChange={(e) => onChangeReport({ patientName: e.target.value })}
                placeholder="Ej: María Elena Rodríguez"
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base sm:text-lg font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Cédula de Identidad (C.I.):
              </label>
              <input
                type="text"
                value={safeReport.patientCI}
                onChange={(e) => onChangeReport({ patientCI: e.target.value })}
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
                value={safeReport.patientAge}
                onChange={(e) => onChangeReport({ patientAge: e.target.value })}
                placeholder="Ej: 34 años / 5 meses"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Teléfono WhatsApp:
              </label>
              <input
                type="tel"
                value={safeReport.patientPhone || ''}
                onChange={(e) => onChangeReport({ patientPhone: e.target.value })}
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
                value={safeReport.date}
                onChange={(e) => onChangeReport({ date: e.target.value })}
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
              <span>Siguiente: Evaluación Clínica</span>
              <ArrowRight className="w-5 h-5 text-cyan-200" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 2: EVALUACIÓN CLÍNICA (Resumen y Examen)             */}
      {/* ========================================================= */}
      {currentStep === 2 && (
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 space-y-6 animate-in fade-in">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-blue-600" />
                <span>Paso 2: Resumen Clínico y Examen Físico</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Describa los hallazgos clínicos y procedimientos realizados al paciente:
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Motivo de Consulta & Resumen Clínico */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1 flex items-center justify-between">
                <span>1. MOTIVO DE CONSULTA Y RESUMEN CLÍNICO: *</span>
              </label>
              <textarea
                rows={6}
                value={safeReport.clinicalSummary}
                onChange={(e) => onChangeReport({ clinicalSummary: e.target.value })}
                placeholder="Paciente masculino/femenino que acude refiriendo síntomas caracterizados por..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all leading-relaxed shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 2. Procedimientos / Examen Físico */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1 flex items-center justify-between">
                <span>2. EXAMEN FÍSICO Y PROCEDIMIENTOS REALIZADOS:</span>
              </label>
              <textarea
                rows={6}
                value={safeReport.procedures}
                onChange={(e) => onChangeReport({ procedures: e.target.value })}
                placeholder="Ruidos cardíacos rítmicos sin soplos, murmullo vesicular conservado en ambos hemitórax..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all leading-relaxed shadow-inner placeholder:text-slate-400"
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
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-600/25 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>Siguiente: Conducta y Diagnóstico</span>
              <ArrowRight className="w-5 h-5 text-cyan-200" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 3: DIAGNÓSTICO Y TRATAMIENTO                         */}
      {/* ========================================================= */}
      {currentStep === 3 && (
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 space-y-6 animate-in fade-in">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-blue-600" />
                <span>Paso 3: Diagnósticos y Conducta</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Defina los paraclínicos, diagnósticos CIE-10 y el reposo médico:
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 3. Estudios Paraclínicos y Complementarios */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                3. ESTUDIOS PARACLÍNICOS Y DE APOYO DIAGNÓSTICO:
              </label>
              <textarea
                rows={3}
                value={safeReport.paraclinicalStudies}
                onChange={(e) => onChangeReport({ paraclinicalStudies: e.target.value })}
                placeholder="Laboratorios dentro de límites normales, TP/TPT adecuados, EKG sin hallazgos patológicos..."
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 4. Impresión Diagnóstica */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                4. IMPRESIÓN DIAGNÓSTICA (CIE-10): *
              </label>
              <textarea
                rows={3}
                value={safeReport.diagnosticImpression}
                onChange={(e) => onChangeReport({ diagnosticImpression: e.target.value })}
                placeholder="1. Lumbalgia mecánica crónica.&#10;2. Hipertensión arterial esencial estadio I."
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400 font-mono"
              />
            </div>

            {/* 5. Plan Terapéutico y Recomendaciones */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                5. CONDUCTA, TRATAMIENTO Y RECOMENDACIONES:
              </label>
              <textarea
                rows={4}
                value={safeReport.recommendations}
                onChange={(e) => onChangeReport({ recommendations: e.target.value })}
                placeholder="Se prescribe analgésico por vía oral, evitar esfuerzos físicos por 5 días, control en consulta externa..."
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 6. Reposo Médico Pautado */}
            <div className="p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl space-y-3">
              <span className="text-xs font-black text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar className="w-4 h-4" />
                <span>6. Reposo Médico Sugerido (Opcional):</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Días continuos:</label>
                  <input
                    type="text"
                    value={safeReport.daysRest ?? ''}
                    onChange={(e) => onChangeReport({ daysRest: e.target.value })}
                    placeholder="Ej: 5 días"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-blue-900 outline-none focus:border-blue-600 shadow-2xs text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Desde (Inicio):</label>
                  <input
                    type="text"
                    value={safeReport.restStartDate || safeReport.date || ''}
                    onChange={(e) => onChangeReport({ restStartDate: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 shadow-2xs text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Hasta (Fin):</label>
                  <input
                    type="text"
                    value={safeReport.restEndDate || ''}
                    onChange={(e) => onChangeReport({ restEndDate: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 shadow-2xs text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>Ver Formato y Descargar PDF</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 4: VISTA FINAL & DESCARGA / IMPRESIÓN DIRECTA        */}
      {/* ========================================================= */}
      {currentStep === 4 && (
        <div className="w-full space-y-4 animate-in fade-in">
          
          {/* Main Action Control Center Bar */}
          <div className="w-full bg-slate-900 text-white rounded-3xl border border-slate-800 p-4 sm:p-5 shadow-2xl space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center">
                  ✓
                </span>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                    Informe Médico Listo para Emisión
                  </h3>
                  <span className="text-xs text-emerald-300 font-medium">
                    Paciente: <strong>{safeReport.patientName || 'Sin nombre'}</strong> · {safeReport.date || 'Hoy'}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Instant Action Buttons */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 w-full">
              
              {/* Botón Descargar PDF */}
              <button
                type="button"
                onClick={handleDownloadReportPdf}
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
                  const reportDetails = [
                    safeReport.diagnosticImpression ? `Diagnóstico: ${safeReport.diagnosticImpression}` : '',
                    safeReport.treatmentPlan ? `Plan/Tratamiento: ${safeReport.treatmentPlan}` : '',
                  ].filter(Boolean).join('\n\n');

                  exportAndSendWhatsAppBusiness({
                    element: printableReportRef.current,
                    patientName: safeReport.patientName || 'Carlos leal',
                    documentTitle: 'Informe Médico',
                    dateStr: safeReport.date || '14/10/26',
                    patientPhone: safeReport.patientPhone,
                    doctorName: config.doctorName || 'Dr. Carlos Leal',
                    treatmentDetails: reportDetails,
                    documentType: 'report',
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

            {/* Extra Row: WhatsApp, Guardar Paciente y Edición */}
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
      {/* VISTA PREVIA REAL DEL INFORME MÉDICO EN FORMATO CARTA     */}
      {/* ========================================================= */}
      <div className={currentStep === 4 ? "w-full flex justify-center py-2" : "hidden"}>
            <div
              ref={printableReportRef}
              id="report-print-container"
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
                      width: `${safeConfig.watermarkScale || 50}%`,
                      transform: `rotate(${safeConfig.watermarkRotation || 0}deg)`,
                    }}
                  />
                </div>
              )}

              {/* Main Content Container */}
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[920px]">
                
                {/* Header */}
                <div>
                  <DocumentHeader
                    config={safeConfig}
                    compact={false}
                    editableInline={false}
                  />

                  {/* Title Bar */}
                  <div className="my-2.5 pb-1 border-b border-slate-200 text-center">
                    <span 
                      className="text-base sm:text-lg font-black tracking-wide uppercase font-serif"
                      style={{ color: safeConfig.primaryDocColor }}
                    >
                      {safeReport.title || 'INFORME MÉDICO'}
                    </span>
                  </div>

                  {/* Patient Bar */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 mb-4 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Paciente:</span>
                        <strong className="text-slate-900 text-xs sm:text-sm truncate block">{safeReport.patientName || 'Paciente'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">C.I. / Doc:</span>
                        <span className="text-slate-900 font-bold">{safeReport.patientCI || 'S/C'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Edad:</span>
                        <span className="text-slate-900 font-bold">{safeReport.patientAge || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Teléfono:</span>
                        <span className="text-slate-900 font-bold">{safeReport.patientPhone || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Fecha Emisión:</span>
                        <span className="text-slate-900 font-bold">{safeReport.date || new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date())}</span>
                      </div>
                    </div>
                  </div>

                  {/* Report Body Sections */}
                  <div 
                    className="space-y-4 my-2"
                    style={{
                      fontFamily: safeConfig.reportFontFamily || 'inherit',
                      fontSize: safeConfig.reportFontSize || '12px'
                    }}
                  >
                    {/* Section 1 */}
                    {safeReport.clinicalSummary && (
                      <div className="bg-white/50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-black text-xs block mb-1 uppercase tracking-wider" style={{ color: safeConfig.primaryDocColor }}>
                          1. MOTIVO DE CONSULTA Y RESUMEN CLÍNICO
                        </span>
                        <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                          {safeReport.clinicalSummary}
                        </p>
                      </div>
                    )}

                    {/* Section 2 */}
                    {safeReport.procedures && (
                      <div className="bg-white/50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-black text-xs block mb-1 uppercase tracking-wider" style={{ color: safeConfig.primaryDocColor }}>
                          2. EXAMEN FÍSICO Y PROCEDIMIENTOS REALIZADOS
                        </span>
                        <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                          {safeReport.procedures}
                        </p>
                      </div>
                    )}

                    {/* Section 3 */}
                    {safeReport.paraclinicalStudies && (
                      <div className="bg-white/50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-black text-xs block mb-1 uppercase tracking-wider" style={{ color: safeConfig.primaryDocColor }}>
                          3. ESTUDIOS PARACLÍNICOS Y DE APOYO DIAGNÓSTICO
                        </span>
                        <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                          {safeReport.paraclinicalStudies}
                        </p>
                      </div>
                    )}

                    {/* Section 4 */}
                    {safeReport.diagnosticImpression && (
                      <div className="bg-white/50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-black text-xs block mb-1 uppercase tracking-wider" style={{ color: safeConfig.primaryDocColor }}>
                          4. IMPRESIÓN DIAGNÓSTICA (CIE-10)
                        </span>
                        <p className="text-slate-950 font-bold whitespace-pre-wrap leading-relaxed">
                          {safeReport.diagnosticImpression}
                        </p>
                      </div>
                    )}

                    {/* Section 5 */}
                    {safeReport.recommendations && (
                      <div className="bg-white/50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-black text-xs block mb-1 uppercase tracking-wider" style={{ color: safeConfig.primaryDocColor }}>
                          5. PLAN TERAPÉUTICO CONDUCTA Y RECOMENDACIONES
                        </span>
                        <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                          {safeReport.recommendations}
                        </p>
                      </div>
                    )}

                    {/* Section 6 (Reposo) */}
                    {safeReport.daysRest && (
                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-black text-xs block text-blue-900 uppercase">
                            6. REPOSO MÉDICO SUGERIDO
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            Se prescribe reposo clínico de {safeReport.daysRest} continuos.
                          </span>
                        </div>
                        {(safeReport.restStartDate || safeReport.restEndDate) && (
                          <div className="text-right text-[11px] font-bold text-slate-700">
                            {safeReport.restStartDate && <span>Desde: {safeReport.restStartDate}</span>}
                            {safeReport.restEndDate && <span className="block">Hasta: {safeReport.restEndDate}</span>}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>

                {/* Footer with Seal and Signature */}
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <DocumentFooter
                    config={safeConfig}
                    compact={true}
                    notesText="Informe médico expedido a solicitud de la parte interesada para los fines pertinentes."
                  />
                </div>

              </div>
            </div>
          </div>

      {/* Email Share Modal */}
      <EmailShareModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        config={safeConfig}
        documentType="report"
        patientName={safeReport.patientName || 'Paciente'}
        patientEmail=""
        documentTitle="Informe Médico"
        contentBody={reportBodyForWhatsApp}
        onTriggerPrintPdf={handleDownloadReportPdf}
      />

    </div>
  );
};

export default ReportsModule;
