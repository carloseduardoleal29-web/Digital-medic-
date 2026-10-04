import React, { useState, useRef } from 'react';
import { DoctorConfig, MedicalReport } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { FileText, Printer, MessageSquare, Eye, ArrowLeft, Trash2, Save, Download, Calendar, Mail } from 'lucide-react';

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
}

const TEMPLATES: Record<string, Partial<MedicalReport>> = {
  quirurgico: {
    title: "INFORME MÉDICO",
    reasonForConsultation: "Intervención quirúrgica programada bajo anestesia general balanceada / regional.",
    clinicalSummary: "Paciente acude para procedimiento quirúrgico electivo. Se realiza valoración preanestésica constatando vía aérea permeable Mallampati II, estabilidad hemodinámica basal. Sin antecedentes alérgicos reportados.",
    procedures: "Se induce técnica anestésica sin complicaciones. Mantenimiento con ventilación mecánica protectora, analgesia multimodal intravenosa y antiemesis profiláctica. Procedimiento quirúrgico transcurre dentro de parámetros esperados sin eventualidades.",
    paraclinicalStudies: "Hematología completa: Hemoglobina 13.8 g/dL, Plaquetas 245.000/mm3. TP 12.5 seg (Control 12 seg), TPT 29 seg. Glicemia 88 mg/dL, Creatinina 0.8 mg/dL. EKG: Ritmo sinusal normal.",
    diagnosticImpression: "1. Estado posoperatorio mediato sin complicaciones.\n2. Recuperación anestésica Aldrete 10/10.",
    treatmentPlan: "Terapia analgésica posoperatoria pautada. Cuidado estricto de herida quirúrgica. Deambulación asistida precoz.",
    recommendations: "Mantener hidratación oral adecuada. Cuidado estricto de herida quirúrgica. Acudir a control por consulta externa en 7 días para retiro de puntos.",
    daysRest: "10 días",
  },
  consulta: {
    title: "INFORME MÉDICO",
    reasonForConsultation: "Evaluación clínica integral y control médico periódico.",
    clinicalSummary: "Paciente acude a consulta refiriendo cuadro clínico caracterizado por síntomas de evolución progresiva. Se encuentra orientado en tiempo, espacio y persona, hidratado y afebril.",
    procedures: "Examen físico segmentario exhaustivo sin signos de focalización neurológica. Ruidos cardíacos rítmicos normofonéticos. Murmullo vesicular conservado en ambos campos pulmonares.",
    paraclinicalStudies: "Perfil lipídico: Colesterol total 195 mg/dL, Triglicéridos 140 mg/dL, HDL 48 mg/dL. Química sanguínea dentro de rangos de normalidad.",
    diagnosticImpression: "1. Síndrome metabólico en estadio inicial compensado.\n2. Trastorno funcional gastrointestinal leve.",
    treatmentPlan: "Ajuste de hábitos higiénico-dietéticos. Plan farmacológico según récipe adjunto.",
    recommendations: "Realizar actividad física aeróbica 30 minutos al día. Disminuir ingesta de sodio y azúcares refinados. Cita de control en 4 semanas.",
    daysRest: "",
  },
  alta: {
    title: "INFORME MÉDICO",
    reasonForConsultation: "Hospitalización para compensación clínica y tratamiento intravenoso.",
    clinicalSummary: "Paciente ingresó presentando cuadro infeccioso/inflamatorio agudo. Recibió cobertura terapéutica protocolizada con adecuada tolerancia oral y evolución clínica francamente favorable.",
    procedures: "Hospitalización en sala general con monitorización continua de signos vitales, administración de fármacos por vía parenteral y balance hídrico neutro.",
    paraclinicalStudies: "Control de laboratorio al egreso muestra normalización de reactantes de fase aguda (PCR y leucograma normal).",
    diagnosticImpression: "1. Cuadro clínico resuelto satisfactoriamente.\n2. Paciente en condiciones clínicas estables para egreso domiciliario.",
    treatmentPlan: "Completar tratamiento antimicrobiano y analgésico por vía oral según récipe médico adjunto.",
    recommendations: "Dieta blanda adecuada, reposo relativo en domicilio. Consultar a emergencia ante fiebre superior a 38.5°C o disnea.",
    daysRest: "5 días",
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
}) => {
  const printableReportRef = useRef<HTMLDivElement>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const applyTemplate = (key: string) => {
    const tmpl = TEMPLATES[key];
    if (tmpl) {
      onChangeReport({
        ...tmpl,
        reportType: key as any,
      });
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
    doctorName: 'Dr. Médico Tratante',
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

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Templates & Actions Bar (no-print) */}
      <div className="w-full max-w-[800px] mb-4 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs no-print">
        <div className="flex items-center gap-1.5 flex-wrap">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-300/80 cursor-pointer mr-1"
              title="Volver a la pantalla principal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-teal-600" />
              <span>Inicio</span>
            </button>
          )}
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800">Plantillas:</span>
          <button
            onClick={() => applyTemplate('quirurgico')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg transition-colors font-medium"
          >
            Quirúrgico
          </button>
          <button
            onClick={() => applyTemplate('consulta')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg transition-colors font-medium"
          >
            Consulta Externa
          </button>
          <button
            onClick={() => applyTemplate('alta')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg transition-colors font-medium"
          >
            Alta Médica
          </button>

          {/* Botón Rojo: Dejar en Blanco */}
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
            }}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Dejar informe médico completamente en blanco para un nuevo paciente"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>Dejar en Blanco</span>
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Quick font size adjustment */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium px-1">Letra:</span>
            <button
              onClick={() => {
                const current = parseInt(config.reportFontSize || '12px', 10) || 12;
                onUpdateConfig?.({ reportFontSize: `${Math.max(10, current - 1)}px` });
              }}
              className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border rounded text-[10px] font-bold text-slate-700"
              title="Reducir letra del informe"
            >
              A-
            </button>
            <button
              onClick={() => {
                const current = parseInt(config.reportFontSize || '12px', 10) || 12;
                onUpdateConfig?.({ reportFontSize: `${Math.min(20, current + 1)}px` });
              }}
              className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border rounded text-[10px] font-bold text-slate-700"
              title="Agrandar letra del informe"
            >
              A+
            </button>
          </div>

          {/* Actions: Guardar Paciente, Vista Previa & Imprimir */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {onSaveAndShare && (
              <button
                type="button"
                onClick={() => {
                  (onSaveAndShare as any)(false);
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Guardar informe en el Banco de Pacientes."
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
                title="Descargar informe en archivo PDF con el nombre del paciente y fecha"
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
                title="Enviar informe por correo electrónico al paciente"
              >
                <Mail className="w-3.5 h-3.5 text-white" />
                <span>✉️ Enviar por Correo</span>
              </button>
            )}

            {onOpenPreview && (
              <button
                type="button"
                onClick={onOpenPreview}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center gap-1 text-xs shadow-2xs transition-colors cursor-pointer"
                title="Ver cómo queda el informe médico en 1 sola hoja carta completa antes de imprimir"
              >
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Vista Previa</span>
              </button>
            )}

            <button
              type="button"
              onClick={onPrint}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Imprimir informe directamente o guardar como PDF del sistema"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>🖨️ Imprimir Informe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet (1 Single Letter format Sheet) */}
      <div
        ref={printableReportRef}
        className={`relative w-full max-w-[800px] min-h-[960px] shadow-xl p-6 sm:p-7 transition-all print-container report-sheet-container flex flex-col justify-between ${textureClass} ${
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
          {/* Header */}
          <DocumentHeader
            config={config}
            onUpdateField={(field, val) => onUpdateConfig?.({ [field]: val })}
          />

          {/* Document Title */}
          <div className="text-center my-2 pb-1.5 border-b border-slate-200">
            <input
              type="text"
              value={currentReport.title}
              onChange={(e) => onChangeReport({ title: e.target.value })}
              className="text-center font-bold text-base uppercase tracking-wider w-full bg-transparent outline-none focus:border-b-2"
              style={{ color: config.headerColor, fontFamily: config.fuenteHeader }}
            />
          </div>

          {/* Patient Details Row - Clean 3-Line Layout with Age next to Cédula */}
          <div 
            className="py-1.5 px-3 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-2.5 space-y-1.5 shadow-2xs text-xs"
            style={{ fontSize: config.patientBarSize || '12px' }}
          >
            {/* Line 1: Paciente */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-slate-800 shrink-0">Paciente:</span>
              <input
                type="text"
                value={currentReport.patientName}
                onChange={(e) => onChangeReport({ patientName: e.target.value })}
                placeholder="Nombre y Apellidos del Paciente"
                className="flex-1 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900 min-w-[150px]"
              />
            </div>

            {/* Line 2: Cédula y Edad al lado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 items-center">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-slate-800 shrink-0">C.I. / Doc:</span>
                <input
                  type="text"
                  value={currentReport.patientCI}
                  onChange={(e) => onChangeReport({ patientCI: e.target.value })}
                  placeholder="V-00.000.000"
                  className="flex-1 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-slate-800 shrink-0">Edad:</span>
                <input
                  type="text"
                  value={currentReport.patientAge}
                  onChange={(e) => onChangeReport({ patientAge: e.target.value })}
                  placeholder="42 años"
                  className="flex-1 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Line 3: Teléfono y Fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 items-center">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-slate-800 shrink-0">Teléfono:</span>
                <input
                  type="text"
                  value={currentReport.patientPhone || ''}
                  onChange={(e) => onChangeReport({ patientPhone: e.target.value })}
                  placeholder="+58 414-0000000"
                  className="flex-1 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-slate-800 shrink-0">Fecha:</span>
                <input
                  type="text"
                  value={currentReport.date}
                  onChange={(e) => onChangeReport({ date: e.target.value })}
                  placeholder="Fecha"
                  className="flex-1 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Report Sections with Customizable Font Size & Family */}
          <div 
            className="space-y-2 sm:space-y-2.5 flex-1"
            style={{
              fontSize: config.reportFontSize || '12px',
              fontFamily: config.reportFontFamily || 'inherit',
            }}
          >
            
            {/* 1. Motivo de Consulta & Resumen Clínico */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="font-bold text-slate-800 text-[11.5px]" style={{ color: config.headerColor }}>
                  1. MOTIVO DE CONSULTA Y RESUMEN CLÍNICO:
                </label>
                {currentReport.clinicalSummary && (
                  <button
                    type="button"
                    onClick={() => onChangeReport({ clinicalSummary: '' })}
                    className="no-print px-1.5 py-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[10px] font-bold flex items-center gap-0.5"
                    title="Borrar resumen clínico"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Borrar</span>
                  </button>
                )}
              </div>
              <textarea
                value={currentReport.clinicalSummary}
                onChange={(e) => onChangeReport({ clinicalSummary: e.target.value })}
                placeholder="Describa la evolución clínica, antecedentes pertinentes y motivo de atención..."
                className="w-full min-h-[50px] p-2 bg-transparent border border-slate-200 rounded focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* 2. Procedimientos / Examen Físico */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="font-bold text-slate-800 text-[11.5px]" style={{ color: config.headerColor }}>
                  2. EXAMEN FÍSICO Y PROCEDIMIENTOS REALIZADOS:
                </label>
                {currentReport.procedures && (
                  <button
                    type="button"
                    onClick={() => onChangeReport({ procedures: '' })}
                    className="no-print px-1.5 py-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[10px] font-bold flex items-center gap-0.5"
                    title="Borrar procedimientos"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Borrar</span>
                  </button>
                )}
              </div>
              <textarea
                value={currentReport.procedures}
                onChange={(e) => onChangeReport({ procedures: e.target.value })}
                placeholder="Detalle el examen segmentario, procedimiento quirúrgico, anestésico o médico efectuado..."
                className="w-full min-h-[46px] p-2 bg-transparent border border-slate-200 rounded focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* 3. Estudios Paraclínicos y Complementarios */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="font-bold text-slate-800 text-[11.5px]" style={{ color: config.headerColor }}>
                  3. ESTUDIOS PARACLÍNICOS Y DE APOYO DIAGNÓSTICO:
                </label>
                {currentReport.paraclinicalStudies && (
                  <button
                    type="button"
                    onClick={() => onChangeReport({ paraclinicalStudies: '' })}
                    className="no-print px-1.5 py-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[10px] font-bold flex items-center gap-0.5"
                    title="Borrar estudios paraclínicos"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Borrar</span>
                  </button>
                )}
              </div>
              <textarea
                value={currentReport.paraclinicalStudies}
                onChange={(e) => onChangeReport({ paraclinicalStudies: e.target.value })}
                placeholder="Laboratorios relevantes, estudios de imagen (Rayos X, TAC, Ecosonografía), electrocardiograma..."
                className="w-full min-h-[42px] p-2 bg-transparent border border-slate-200 rounded focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* 4. Impresión Diagnóstica */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="font-bold text-slate-800 text-[11.5px]" style={{ color: config.headerColor }}>
                  4. IMPRESIÓN DIAGNÓSTICA (CIE-10):
                </label>
                {currentReport.diagnosticImpression && (
                  <button
                    type="button"
                    onClick={() => onChangeReport({ diagnosticImpression: '' })}
                    className="no-print px-1.5 py-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[10px] font-bold flex items-center gap-0.5"
                    title="Borrar diagnósticos"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Borrar</span>
                  </button>
                )}
              </div>
              <textarea
                value={currentReport.diagnosticImpression}
                onChange={(e) => onChangeReport({ diagnosticImpression: e.target.value })}
                placeholder="1. Diagnóstico principal&#10;2. Diagnósticos secundarios o comorbilidades"
                className="w-full min-h-[44px] p-2 bg-transparent border border-slate-200 rounded focus:border-blue-500 focus:outline-none resize-none leading-relaxed font-semibold text-slate-900"
              />
            </div>

            {/* 5. Plan Terapéutico y Recomendaciones */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="font-bold text-slate-800 text-[11.5px]" style={{ color: config.headerColor }}>
                  5. CONDUCTA, TRATAMIENTO Y RECOMENDACIONES:
                </label>
                {currentReport.recommendations && (
                  <button
                    type="button"
                    onClick={() => onChangeReport({ recommendations: '' })}
                    className="no-print px-1.5 py-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[10px] font-bold flex items-center gap-0.5"
                    title="Borrar recomendaciones"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Borrar</span>
                  </button>
                )}
              </div>
              <textarea
                value={currentReport.recommendations}
                onChange={(e) => onChangeReport({ recommendations: e.target.value })}
                placeholder="Plan farmacológico pautado, signos de alarma, régimen dietético y fecha de control..."
                className="w-full min-h-[48px] p-2 bg-transparent border border-slate-200 rounded focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* 6. Reposo Médico Pautado */}
            <div className="p-2 sm:p-2.5 bg-blue-50/80 border border-blue-200/90 rounded-xl space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-wide" style={{ color: config.headerColor }}>
                    6. Reposo Médico Sugerido:
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-slate-700">Días continuos:</span>
                  <input
                    type="text"
                    value={currentReport.daysRest ?? ''}
                    onChange={(e) => onChangeReport({ daysRest: e.target.value })}
                    placeholder="Ej: 5 días"
                    className="w-24 px-2 py-0.5 bg-white border border-blue-300 rounded font-bold text-blue-900 text-center outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                  {currentReport.daysRest && (
                    <button
                      type="button"
                      onClick={() => onChangeReport({ daysRest: '', restStartDate: '', restEndDate: '' })}
                      className="no-print p-0.5 text-slate-400 hover:text-rose-600 rounded text-[10px]"
                      title="Quitar reposo del informe"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-blue-200/60">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-slate-700 shrink-0">Desde:</span>
                  <input
                    type="text"
                    value={currentReport.restStartDate || currentReport.date || ''}
                    onChange={(e) => onChangeReport({ restStartDate: e.target.value })}
                    placeholder="Fecha de inicio"
                    className="flex-1 bg-white/90 border border-blue-200 rounded px-2 py-0.5 outline-none text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-slate-700 shrink-0">Hasta:</span>
                  <input
                    type="text"
                    value={currentReport.restEndDate || ''}
                    onChange={(e) => onChangeReport({ restEndDate: e.target.value })}
                    placeholder="Fecha de culminación"
                    className="flex-1 bg-white/90 border border-blue-200 rounded px-2 py-0.5 outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="mt-3">
            <DocumentFooter
              config={config}
              notesText="Informe médico expedido a solicitud de la parte interesada para los fines pertinentes."
              onUpdateConfigField={(field, val) => onUpdateConfig?.({ [field]: val })}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
