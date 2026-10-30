import React, { useState, useRef, useMemo } from 'react';
import { DoctorConfig, LabOrder } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { EmailShareModal } from './EmailShareModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { exportAndSendWhatsAppBusiness, exportElementAsPDF, buildDocumentPdfFilename } from '../utils/exportDocument';
import { 
  LAB_CATEGORIES, 
  DEFAULT_LAB_EXAMS, 
  PREPARATION_PRESETS,
  LabExamItem,
  LabCategoryKey,
  searchLabExams 
} from '../data/labExamDatabase';
import {
  FlaskConical,
  Eye,
  Plus,
  Trash2,
  Check,
  Search,
  Download,
  Mail,
  Save,
  ArrowLeft,
  Sparkles,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Info,
  Calendar,
  User,
  Share2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface LabExamsModuleProps {
  config: DoctorConfig;
  labOrder: LabOrder;
  onChangeLabOrder: (updated: Partial<LabOrder>) => void;
  onPrint: () => void;
  onDownloadPdf?: () => void;
  onInstantWhatsApp?: () => void;
  onOpenEmailModal?: () => void;
  onSaveAndShare?: (shouldDownload?: boolean) => void;
  onOpenPreview?: () => void;
  onUpdateConfig?: (updated: Partial<DoctorConfig>) => void;
  onBackToHome?: () => void;
  onSwitchToRecipe?: () => void;
}

export const LabExamsModule: React.FC<LabExamsModuleProps> = ({
  config,
  labOrder,
  onChangeLabOrder,
  onPrint,
  onDownloadPdf,
  onInstantWhatsApp,
  onOpenEmailModal,
  onSaveAndShare,
  onOpenPreview,
  onUpdateConfig,
  onBackToHome,
  onSwitchToRecipe,
}) => {
  const printableSheetRef = useRef<HTMLDivElement>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Zoom state with mobile auto-fit for 660px sheet
  const [zoom, setZoom] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      if (w < 480) return Math.max(48, Math.min(60, Math.floor(((w - 24) / 660) * 100)));
      if (w < 720) return Math.max(60, Math.min(90, Math.floor(((w - 32) / 660) * 100)));
    }
    return 100;
  });

  // Search filter across all categories
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown / Accordion open states (categories folded/collapsed by default)
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    heces: false,
    orina: false,
    sangre_quimica: false,
    hematologia: false,
    rx: false,
    ecografia: false,
    especiales: false,
    agregar: false,
  });

  // Custom exam form states
  const [customExamName, setCustomExamName] = useState('');
  const [customExamPrep, setCustomExamPrep] = useState('');

  // Custom exams saved in localStorage
  const [savedCustomExams, setSavedCustomExams] = useState<LabExamItem[]>(() => {
    try {
      const saved = localStorage.getItem('digital_medic_custom_lab_exams_v1');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const safeConfig = config || {};
  const safeOrder: LabOrder = {
    id: labOrder?.id || 'ORD-LAB-01',
    patientName: labOrder?.patientName || '',
    patientCI: labOrder?.patientCI || '',
    patientAge: labOrder?.patientAge || '',
    patientPhone: labOrder?.patientPhone || '',
    patientEmail: labOrder?.patientEmail || '',
    patientAddress: labOrder?.patientAddress || '',
    date: labOrder?.date || new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()),
    diagnosis: labOrder?.diagnosis || '',
    clinicalSummary: labOrder?.clinicalSummary || '',
    selectedExams: Array.isArray(labOrder?.selectedExams) ? labOrder.selectedExams : [],
    customExams: Array.isArray(labOrder?.customExams) ? labOrder.customExams : [],
    patientInstructions: labOrder?.patientInstructions || '',
    notes: labOrder?.notes || '',
  };

  const selectedCount = (safeOrder.selectedExams?.length || 0) + (safeOrder.customExams?.length || 0);

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3200);
  };

  // Toggle category dropdown open/closed
  const toggleDropdown = (categoryId: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Expand all or Collapse all
  const handleExpandAll = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    LAB_CATEGORIES.forEach((cat) => {
      updated[cat.id] = expand;
    });
    setOpenDropdowns(updated);
    showNotification(expand ? 'Todos los menús desplegados' : 'Menús contraídos');
  };

  // Toggle regular catalog exam
  const handleToggleExam = (examName: string) => {
    const current = safeOrder.selectedExams || [];
    const exists = current.includes(examName);
    const updated = exists 
      ? current.filter((x) => x !== examName) 
      : [...current, examName];
    
    onChangeLabOrder({ selectedExams: updated });
    showNotification(exists ? `Removido: ${examName}` : `Agregado a la orden: ${examName}`);
  };

  // Select all popular exams in a category
  const handleSelectPopularInCategory = (categoryKey: LabCategoryKey) => {
    const categoryPopularExams = DEFAULT_LAB_EXAMS
      .filter((e) => e.category === categoryKey && e.popular)
      .map((e) => e.name);
    
    const current = safeOrder.selectedExams || [];
    const newItems = categoryPopularExams.filter((name) => !current.includes(name));
    
    if (newItems.length === 0) {
      showNotification('Los exámenes frecuentes de esta sección ya están agregados');
      return;
    }

    onChangeLabOrder({ selectedExams: [...current, ...newItems] });
    showNotification(`✓ ${newItems.length} exámenes frecuentes agregados`);
  };

  // Deselect all exams in a specific category
  const handleDeselectCategory = (categoryKey: LabCategoryKey) => {
    const categoryExams = DEFAULT_LAB_EXAMS.filter((e) => e.category === categoryKey).map((e) => e.name);
    const current = safeOrder.selectedExams || [];
    const updated = current.filter((name) => !categoryExams.includes(name));
    onChangeLabOrder({ selectedExams: updated });
    showNotification(`Exámenes de esta categoría desmarcados`);
  };

  // Add custom exam
  const handleAddCustomExam = (saveForFuture = false) => {
    const trimmed = customExamName.trim();
    if (!trimmed) {
      alert('Por favor escriba el nombre del estudio o examen médico');
      return;
    }

    const currentCustoms = safeOrder.customExams || [];
    if (!currentCustoms.includes(trimmed)) {
      onChangeLabOrder({ customExams: [...currentCustoms, trimmed] });
    }

    if (customExamPrep.trim() && !safeOrder.patientInstructions?.includes(customExamPrep.trim())) {
      const currentInst = safeOrder.patientInstructions?.trim() || '';
      const updatedInst = currentInst 
        ? `${currentInst}\n• ${trimmed}: ${customExamPrep.trim()}` 
        : `• ${trimmed}: ${customExamPrep.trim()}`;
      onChangeLabOrder({ patientInstructions: updatedInst });
    }

    if (saveForFuture) {
      const newItem: LabExamItem = {
        id: `custom-${Date.now()}`,
        name: trimmed,
        category: 'especiales',
        preparation: customExamPrep.trim() || undefined,
      };
      const updatedSaved = [newItem, ...savedCustomExams.filter(x => x.name.toLowerCase() !== trimmed.toLowerCase())];
      setSavedCustomExams(updatedSaved);
      try {
        localStorage.setItem('digital_medic_custom_lab_exams_v1', JSON.stringify(updatedSaved));
      } catch (_) {}
      showNotification(`✓ "${trimmed}" guardado en su catálogo permanente`);
    } else {
      showNotification(`✓ "${trimmed}" agregado al récipe de exámenes`);
    }

    setCustomExamName('');
    setCustomExamPrep('');
  };

  // Remove custom exam
  const handleRemoveCustomExam = (name: string) => {
    const updated = (safeOrder.customExams || []).filter((x) => x !== name);
    onChangeLabOrder({ customExams: updated });
    showNotification(`Removido: ${name}`);
  };

  // Clear all selected exams
  const handleClearAllExams = () => {
    if (window.confirm('¿Desea desmarcar todos los exámenes seleccionados de la orden?')) {
      onChangeLabOrder({ selectedExams: [], customExams: [] });
      showNotification('Lista de exámenes vaciada');
    }
  };

  // Append preparation preset
  const handleAppendPreparation = (preset: string) => {
    const current = safeOrder.patientInstructions?.trim() || '';
    if (current.includes(preset)) return;
    const updated = current ? `${current}\n• ${preset}` : `• ${preset}`;
    onChangeLabOrder({ patientInstructions: updated });
    showNotification('Indicación de preparación añadida');
  };

  // Scroll to Document Preview
  const handleScrollToPreview = () => {
    if (printableSheetRef.current) {
      printableSheetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // PDF Download - Formato Carta Horizontal 2-en-1 Oficial Exclusivo de Laboratorio
  const handleDownloadLabPdf = async () => {
    showNotification('Generando PDF oficial de Exámenes (Carta Horizontal 2-en-1)...');
    
    // Obtener molde dual horizontal de medidas fijas (1056 x 816) o contenedor individual
    const dualMold = document.getElementById('dual-lab-order-print-sheet');
    const singleContainer = printableSheetRef.current;
    
    const examsListText = allOrderExams.length > 0
      ? allOrderExams.map((e, idx) => `${idx + 1}. ${e}`).join('\n')
      : '1. Exámenes paraclínicos solicitados en consulta médica.';

    const customDatos = {
      documentType: 'examenes' as any,
      nombrePaciente: safeOrder.patientName || 'Paciente',
      cedulaPaciente: safeOrder.patientCI || '',
      edadPaciente: safeOrder.patientAge || '',
      telefonoPaciente: safeOrder.patientPhone || '',
      fecha: safeOrder.date,
      diagnostico: safeOrder.diagnosis || '',
      textoRp: examsListText,
      textoIndicaciones: safeOrder.patientInstructions || '',
      tituloRecipe1: 'ORDEN DE EXÁMENES Y ESTUDIOS PARACLÍNICOS',
      tituloRecipe2: 'ORDEN DE EXÁMENES Y ESTUDIOS PARACLÍNICOS (COPIA)',
    };

    const filename = buildDocumentPdfFilename(
      'orden_examenes',
      safeOrder.patientName || 'Paciente',
      safeOrder.date
    );

    if (onDownloadPdf) {
      await onDownloadPdf();
      return;
    }

    if (dualMold) {
      await exportElementAsPDF(dualMold, filename, customDatos);
    } else if (singleContainer) {
      await exportElementAsPDF(singleContainer, filename, customDatos);
    }
  };

  // WhatsApp Send - Directo, rápido e instantáneo al WhatsApp del paciente
  const handleSendWhatsApp = () => {
    const examsFormatted = allOrderExams.length > 0
      ? allOrderExams.map((e, i) => `${i + 1}. ${e}`).join('\n')
      : '• Estudios paraclínicos y exámenes solicitados en consulta médica.';

    const prepFormatted = safeOrder.patientInstructions?.trim()
      ? `\n📌 *INSTRUCCIONES Y PREPARACIÓN:*\n${safeOrder.patientInstructions.trim()}\n`
      : '';

    const diagFormatted = safeOrder.diagnosis?.trim()
      ? `📋 *Diagnóstico / Motivo:* ${safeOrder.diagnosis.trim()}\n`
      : '';

    const patientCIFormatted = safeOrder.patientCI ? `🆔 *C.I.:* ${safeOrder.patientCI} ` : '';
    const patientAgeFormatted = safeOrder.patientAge ? `| *Edad:* ${safeOrder.patientAge}` : '';

    const msg =
      `🔬 *ORDEN DE EXÁMENES Y ESTUDIOS PARACLÍNICOS*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👨‍⚕️ *Médico:* ${safeConfig.doctorName || 'Dr. Carlos Leal'}\n` +
      (safeConfig.specialty ? `🏥 *Especialidad:* ${safeConfig.specialty}\n` : '') +
      `📅 *Fecha de Emisión:* ${safeOrder.date}\n\n` +
      `👤 *PACIENTE:* ${safeOrder.patientName || 'Paciente'}\n` +
      (patientCIFormatted || patientAgeFormatted ? `${patientCIFormatted}${patientAgeFormatted}\n` : '') +
      diagFormatted + `\n` +
      `🧪 *ESTUDIOS SOLICITADOS (${allOrderExams.length}):*\n` +
      `${examsFormatted}\n` +
      prepFormatted + `\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Emitido mediante *Digital Médic* · Sistema Médico Oficial`;

    // Normalizar teléfono celular (Venezuela 0414/0424/0412/0416/0426 o internacional)
    const rawDigits = (safeOrder.patientPhone || '').replace(/\D/g, '');
    let cleanPhone = '';
    if (rawDigits.startsWith('58') && rawDigits.length >= 11) {
      cleanPhone = rawDigits;
    } else if (rawDigits.startsWith('0414') || rawDigits.startsWith('0424') || rawDigits.startsWith('0412') || rawDigits.startsWith('0416') || rawDigits.startsWith('0426')) {
      cleanPhone = '58' + rawDigits.slice(1);
    } else if (rawDigits.length === 10 && (rawDigits.startsWith('414') || rawDigits.startsWith('424') || rawDigits.startsWith('412') || rawDigits.startsWith('416') || rawDigits.startsWith('426'))) {
      cleanPhone = '58' + rawDigits;
    } else if (rawDigits.length >= 8) {
      cleanPhone = rawDigits;
    }

    // Copiar mensaje al portapapeles
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(msg).catch(() => {});
      }
    } catch (_) {}

    // Guardar silenciosamente en el banco de pacientes
    try {
      const patientEntry = {
        id: `patient-${Date.now()}`,
        patientName: safeOrder.patientName || 'Paciente',
        patientCI: safeOrder.patientCI || '',
        patientAge: safeOrder.patientAge || '',
        patientPhone: safeOrder.patientPhone || '',
        patientEmail: safeOrder.patientEmail || '',
        date: safeOrder.date,
        diagnosis: safeOrder.diagnosis || 'Orden de laboratorio',
        rp: examsFormatted,
        sourceModule: 'examenes',
      };
      const savedBank = localStorage.getItem('digital_medic_patient_bank_v1');
      const list = savedBank ? JSON.parse(savedBank) : [];
      const updated = [patientEntry, ...list.filter((x: any) => x && x.patientName !== patientEntry.patientName)];
      localStorage.setItem('digital_medic_patient_bank_v1', JSON.stringify(updated));
    } catch (_) {}

    showNotification('✓ ¡Abriendo WhatsApp con la orden médica!');

    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
    if (isMobile) {
      window.location.href = waUrl;
    } else {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Filtered exams according to search
  const isSearching = searchQuery.trim().length > 0;
  const filteredExams = useMemo(() => {
    return isSearching ? searchLabExams(searchQuery) : [];
  }, [searchQuery, isSearching]);

  const borderStyle = getDocumentBorderStyle(safeConfig.borderStyle, safeConfig.primaryDocColor);
  const textureClass = getPaperTextureClass(safeConfig.paperTexture);

  // All combined exams for the printable sheet
  const allOrderExams = useMemo(() => {
    return [...(safeOrder.selectedExams || []), ...(safeOrder.customExams || [])];
  }, [safeOrder.selectedExams, safeOrder.customExams]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 text-xs sm:text-sm font-black flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. TOP HEADER TITLE CARD                                   */}
      {/* ========================================================= */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 no-print">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Exámenes y Laboratorios
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-100 text-cyan-800 border border-cyan-200">
                  Orden Médica
                </span>
                {selectedCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {selectedCount} {selectedCount === 1 ? 'estudio listo' : 'estudios listos'}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Menús desplegables por especialidad (heces, orina, sangre, Rx, ecos) con vista previa del récipe en vivo abajo
              </p>
            </div>
          </div>

          {/* Quick Jump to Preview Button */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Inicio</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleScrollToPreview}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Récipe Abajo ↓</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PATIENT DATA BAR (COMPACT & INTUITIVE)                 */}
      {/* ========================================================= */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-3 no-print">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Datos del Paciente (Se reflejan en la orden médica abajo)</span>
          </span>
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Fecha: <strong>{safeOrder.date}</strong></span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Completo: *</label>
            <input
              type="text"
              value={safeOrder.patientName}
              onChange={(e) => onChangeLabOrder({ patientName: e.target.value })}
              placeholder="Ej: Carmen Elena Rodríguez"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Cédula / Documento:</label>
            <input
              type="text"
              value={safeOrder.patientCI}
              onChange={(e) => onChangeLabOrder({ patientCI: e.target.value })}
              placeholder="Ej: V-14.890.321"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Edad:</label>
            <input
              type="text"
              value={safeOrder.patientAge}
              onChange={(e) => onChangeLabOrder({ patientAge: e.target.value })}
              placeholder="Ej: 42 años"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono / WhatsApp:</label>
            <input
              type="text"
              value={safeOrder.patientPhone}
              onChange={(e) => onChangeLabOrder({ patientPhone: e.target.value })}
              placeholder="Ej: 0414-1234567"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Diagnosis / Motivo Clínico */}
        <div className="pt-1">
          <label className="block text-xs font-bold text-slate-600 mb-1">Diagnóstico / Motivo Clínico de Solicitud:</label>
          <input
            type="text"
            value={safeOrder.diagnosis}
            onChange={(e) => onChangeLabOrder({ diagnosis: e.target.value })}
            placeholder="Ej: Dolor en fosa ilíaca derecha / Evaluación preoperatoria / Control metabólico / Sangrado digestivo"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SEARCH & ACCORDION CONTROL BAR                         */}
      {/* ========================================================= */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 space-y-3 no-print">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Búsqueda rápida de exámenes (ej: heces, orina, sangre oculta, perfil 20, ecografía, tórax)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-slate-700 px-1 py-0.5 rounded cursor-pointer"
              >
                ✕ Limpiar
              </button>
            )}
          </div>

          {/* Expand / Collapse All Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExpandAll(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Expandir Todos</span>
            </button>
            <button
              type="button"
              onClick={() => handleExpandAll(false)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Contraer Todos</span>
            </button>
          </div>
        </div>

        {/* Search Results Direct View */}
        {isSearching && (
          <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-900 uppercase">
                Resultados coincidentes para "{searchQuery}" ({filteredExams.length}):
              </span>
              <span className="text-xs text-slate-500">Haga clic en cualquiera para marcar o desmarcar</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredExams.map((exam) => {
                const isSelected = (safeOrder.selectedExams || []).includes(exam.name);
                return (
                  <div
                    key={exam.id}
                    onClick={() => handleToggleExam(exam.name)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 text-blue-950 shadow-xs'
                        : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-black leading-tight block">
                        {exam.name}
                      </span>
                      {exam.preparation && (
                        <span className="block text-[11px] font-medium text-amber-700 mt-0.5">
                          ⚠️ Prep: {exam.preparation}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredExams.length === 0 && (
                <div className="col-span-2 py-6 text-center text-slate-500 text-sm">
                  No se encontraron exámenes con "{searchQuery}". Puede agregarlo en la sección de <strong>"➕ Agregar Estudio Personalizado"</strong> abajo.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. COLORFUL COLLAPSIBLE DROPDOWN MENUS (MENÚS DESPLEGABLES)*/}
      {/* ========================================================= */}
      <div className="space-y-3.5 no-print">
        {LAB_CATEGORIES.map((category) => {
          const isOpen = !!openDropdowns[category.id];
          const isCustomTab = category.id === 'agregar';
          
          // Get exams in this category
          const categoryExams = DEFAULT_LAB_EXAMS.filter((e) => e.category === category.id);
          
          // Count selected in this category
          const selectedInCategoryCount = isCustomTab
            ? (safeOrder.customExams?.length || 0)
            : categoryExams.filter((e) => (safeOrder.selectedExams || []).includes(e.name)).length;

          return (
            <div
              key={category.id}
              className={`rounded-3xl border transition-all overflow-hidden bg-white shadow-sm ${
                isOpen ? `${category.theme.borderActive} ring-2 ring-slate-100` : `${category.theme.border} hover:border-slate-400`
              }`}
            >
              {/* Colorful Header Button (Toggle Dropdown) */}
              <button
                type="button"
                onClick={() => toggleDropdown(category.id)}
                className={`w-full p-3.5 sm:p-4 text-left transition-all flex items-center justify-between cursor-pointer ${category.theme.headerBg} ${category.theme.headerText}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl sm:text-3xl shrink-0 p-1.5 bg-white/20 backdrop-blur-xs rounded-2xl shadow-xs">
                    {category.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base font-black tracking-tight drop-shadow-xs">
                        {category.label}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/25 text-white/95 border border-white/20">
                        {category.badge}
                      </span>
                      {selectedInCategoryCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white text-slate-900 shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                          <span>{selectedInCategoryCount} en el récipe</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-white/80 font-medium truncate mt-0.5">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Chevron indicator */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-xs transition-transform">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </button>

              {/* Dropdown Content Area (When Expanded) */}
              {isOpen && (
                <div className={`p-4 sm:p-5 ${category.theme.bgLight} border-t ${category.theme.border} space-y-4`}>
                  
                  {/* Category Action Sub-bar */}
                  {!isCustomTab && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-600">
                        Seleccione los estudios que desea solicitar:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectPopularInCategory(category.id as LabCategoryKey)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer shadow-xs"
                        >
                          + Marcar Frecuentes
                        </button>
                        {selectedInCategoryCount > 0 && (
                          <button
                            type="button"
                            onClick={() => handleDeselectCategory(category.id as LabCategoryKey)}
                            className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer shadow-xs"
                          >
                            ✕ Desmarcar Esta Sección
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Regular Exam Checkbox Grid */}
                  {!isCustomTab && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {categoryExams.map((exam) => {
                        const isSelected = (safeOrder.selectedExams || []).includes(exam.name);
                        return (
                          <div
                            key={exam.id}
                            onClick={() => handleToggleExam(exam.name)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 select-none bg-white ${
                              isSelected
                                ? `${category.theme.borderActive} ring-2 ring-offset-1 ${category.theme.tagBorder} bg-gradient-to-r ${category.theme.cardGradient} shadow-sm`
                                : 'border-slate-200/90 hover:border-slate-400 hover:bg-slate-50/80'
                            }`}
                          >
                            <div className="pt-0.5 shrink-0">
                              {isSelected ? (
                                <CheckSquare className={`w-5 h-5 ${category.theme.checkboxActive}`} />
                              ) : (
                                <Square className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs sm:text-sm font-black text-slate-900 leading-snug block">
                                {exam.name}
                              </span>
                              {exam.preparation && (
                                <span className="block text-[11px] font-semibold text-amber-800 mt-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70 inline-block">
                                  ⚠️ Prep: {exam.preparation}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Custom Exam Creation Form */}
                  {isCustomTab && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nombre del Estudio o Examen Médico: *
                          </label>
                          <input
                            type="text"
                            value={customExamName}
                            onChange={(e) => setCustomExamName(e.target.value)}
                            placeholder="Ej: Calprotectina fecal cuantitativa / Angio-TAC / Dosaje de litio"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-fuchsia-500 shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Preparación o Indicación Especial (Opcional):
                          </label>
                          <input
                            type="text"
                            value={customExamPrep}
                            onChange={(e) => setCustomExamPrep(e.target.value)}
                            placeholder="Ej: Ayuno de 8 horas / Muestra seriada / Traer creatinina sérica"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-fuchsia-500 shadow-xs"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddCustomExam(false)}
                          className="px-5 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-fuchsia-600/20 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Agregar a la Orden</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddCustomExam(true)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Guardar en su navegador para usarlo en futuras consultas"
                        >
                          <Save className="w-4 h-4" />
                          <span>Agregar y Guardar en Catálogo</span>
                        </button>
                      </div>

                      {/* Saved custom catalog items */}
                      {savedCustomExams.length > 0 && (
                        <div className="pt-3 border-t border-slate-200">
                          <span className="block text-xs font-black text-slate-700 mb-2 uppercase">
                            Estudios Personalizados Guardados:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {savedCustomExams.map((saved) => {
                              const isAdded = (safeOrder.customExams || []).includes(saved.name);
                              return (
                                <button
                                  key={saved.id}
                                  type="button"
                                  onClick={() => {
                                    if (isAdded) {
                                      handleRemoveCustomExam(saved.name);
                                    } else {
                                      const curr = safeOrder.customExams || [];
                                      onChangeLabOrder({ customExams: [...curr, saved.name] });
                                      showNotification(`Agregado: ${saved.name}`);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    isAdded
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                                  }`}
                                >
                                  <span>{isAdded ? '✓' : '+'}</span>
                                  <span>{saved.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 5. PATIENT PREPARATION INSTRUCTIONS & ACTIVE CHIPS TRAY  */}
      {/* ========================================================= */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4 no-print">
        
        {/* Active Selected Exams Tray */}
        {allOrderExams.length > 0 && (
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                <span>Estudios Seleccionados en esta Orden ({allOrderExams.length}):</span>
              </span>
              <button
                type="button"
                onClick={handleClearAllExams}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Desmarcar Todos</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
              {allOrderExams.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded-xl shadow-xs"
                >
                  <span className="text-blue-600">•</span>
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if ((safeOrder.selectedExams || []).includes(item)) {
                        handleToggleExam(item);
                      } else {
                        handleRemoveCustomExam(item);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 ml-1 font-black cursor-pointer text-sm"
                    title="Quitar de la orden"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preparation Notes Box */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Instrucciones y Preparación para el Paciente:</span>
            </label>

            {/* Quick Presets Buttons */}
            <div className="flex flex-wrap items-center gap-1 text-[11px]">
              <span className="text-slate-400 font-bold mr-1">Rápidos:</span>
              <button
                type="button"
                onClick={() => handleAppendPreparation('Ayuno estricto de 12 horas (solo agua pura permitida)')}
                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 cursor-pointer"
              >
                + Ayuno 12h
              </button>
              <button
                type="button"
                onClick={() => handleAppendPreparation('Para sangre oculta en heces: No ingerir carnes rojas, embutidos ni remolacha 3 días antes')}
                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 cursor-pointer"
              >
                + Dieta Sangre Oculta
              </button>
              <button
                type="button"
                onClick={() => handleAppendPreparation('Primera orina de la mañana (chorro medio) previo aseo genital')}
                className="px-2 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-900 font-bold rounded-lg border border-yellow-200 cursor-pointer"
              >
                + Orina Mañana
              </button>
              <button
                type="button"
                onClick={() => handleAppendPreparation('Vejiga llena (tomar 4 a 6 vasos de agua 1h antes)')}
                className="px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold rounded-lg border border-cyan-200 cursor-pointer"
              >
                + Vejiga Llena
              </button>
            </div>
          </div>

          <textarea
            rows={3}
            value={safeOrder.patientInstructions}
            onChange={(e) => onChangeLabOrder({ patientInstructions: e.target.value })}
            placeholder="• Ayuno estricto de 12 horas.&#10;• Muestra de heces fresca en recolector estéril.&#10;• Primera orina de la mañana en frasco de laboratorio..."
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. ACTION TOOLBAR DIRECTLY ABOVE THE SHEET ("ARRIBITA DEL RECIPE") */}
      {/* ========================================================= */}
      <div className="w-full bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3 no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
              Vista Previa y Emisión de Orden Médica de Laboratorio
            </h2>
          </div>
          <span className="text-xs text-cyan-300 font-semibold">
            {allOrderExams.length} {allOrderExams.length === 1 ? 'estudio seleccionado' : 'estudios seleccionados'}
          </span>
        </div>

        {/* Action Buttons Toolbar placed RIGHT ABOVE the recipe sheet */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={handleDownloadLabPdf}
            className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-95 cursor-pointer border border-blue-400/40"
            title="Descargar PDF oficial firmado y sellado (Formato Carta Horizontal 2-en-1)"
          >
            <Download className="w-4 h-4 text-cyan-200 shrink-0" />
            <span className="truncate">Descargar PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-95 cursor-pointer border border-emerald-400/40"
            title="Enviar orden al paciente por WhatsApp"
          >
            <span className="text-base shrink-0">📱</span>
            <span className="truncate">Enviar por WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEmailModalOpen(true)}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-95 cursor-pointer border border-indigo-400/40"
            title="Enviar orden por Correo Electrónico"
          >
            <Mail className="w-4 h-4 text-indigo-200 shrink-0" />
            <span className="truncate">Enviar por Correo</span>
          </button>
        </div>

        {/* Zoom controls toolbar for mobile */}
        <div className="flex items-center justify-between bg-slate-950/80 text-white px-3 py-2 rounded-xl text-xs border border-slate-800">
          <span className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px] sm:text-xs">
            <span>📐</span>
            <span className="hidden sm:inline">Escala de Orden:</span>
            <span className="font-mono text-cyan-400 font-bold">{zoom}%</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(30, z - 5))}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 cursor-pointer"
              title="Alejar"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-colors border border-slate-700 cursor-pointer"
              title="Tamaño Real 100%"
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(130, z + 5))}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 cursor-pointer"
              title="Acercar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const w = window.innerWidth;
                  const fit = Math.floor(((w - 24) / 660) * 100);
                  setZoom(Math.min(100, Math.max(45, fit)));
                }
              }}
              className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-black transition-colors shadow-xs ml-1 cursor-pointer"
              title="Ajustar a pantalla del teléfono"
            >
              📱 Fit Móvil
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. LIVE RÉCIPE / LAB ORDER SHEET (MEDIA CARTA HORIZONTAL)   */}
      {/* ========================================================= */}
      {(() => {
        const docW = 660;
        const docH = 640;
        const scale = zoom / 100;
        const scaledW = Math.round(docW * scale);
        const scaledH = Math.round(docH * scale);

        return (
          <div className="w-full overflow-x-auto touch-pan-x pb-6 flex justify-center py-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div
              style={{
                width: `${scaledW}px`,
                height: `${scaledH}px`,
                position: 'relative',
                margin: '0 auto',
                flexShrink: 0,
              }}
            >
              <div
                ref={printableSheetRef}
                id="lab-order-print-container"
                className={`report-sheet-container print-container recipe-single-container flex flex-col justify-between shadow-2xl p-6 sm:p-7 rounded-2xl ${textureClass} ${
                  safeConfig.enforcePureBlackText ? 'enforce-pure-black' : ''
                } preview-mode`}
                style={{
                  backgroundColor: safeConfig.tonePapel || '#ffffff',
                  border: borderStyle,
                  borderRadius: safeConfig.docCornerRadius || '16px',
                  width: `${docW}px`,
                  minHeight: `${docH}px`,
                  boxSizing: 'border-box',
                  transformOrigin: 'top left',
                  transform: `scale(${scale})`,
                  WebkitTransform: `scale(${scale})`,
                  position: 'absolute',
                  left: 0,
                  top: 0,
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

          {/* Printable Body Content */}
          <div className="relative z-10 flex flex-col h-full justify-between flex-1 min-h-[580px]">
            
            {/* 1. Official Doctor Header (Compact for Media Carta) */}
            <div>
              <DocumentHeader
                config={safeConfig}
                compact={true}
                hideHeader={false}
                onUpdateField={(field, val) => onUpdateConfig?.({ [field]: val })}
                editableInline={true}
              />

              {/* Document Title */}
              <div className="text-center my-2 pb-1.5 border-b border-slate-200">
                <h2
                  className="text-xs sm:text-sm font-black uppercase tracking-wider"
                  style={{ color: safeConfig.headerColor, fontFamily: safeConfig.fuenteHeader }}
                >
                  ORDEN DE EXÁMENES Y ESTUDIOS PARACLÍNICOS
                </h2>
              </div>

              {/* 2. Patient Information Bar */}
              <div
                className="py-2 px-3 bg-slate-50/70 border border-slate-200 rounded-xl mb-3 space-y-1.5 text-xs shadow-2xs"
                style={{ fontSize: safeConfig.patientBarSize || '11.5px' }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] mr-1">Paciente:</span>
                    <strong className="font-black text-slate-900 text-xs sm:text-sm">
                      {safeOrder.patientName || '___________________________'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] mr-1">C.I. / Doc:</span>
                    <strong className="font-black text-slate-900 text-xs sm:text-sm">
                      {safeOrder.patientCI || '____________'}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] mr-1">Edad:</span>
                    <span className="font-bold text-slate-800">{safeOrder.patientAge || '____ años'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] mr-1">Teléfono:</span>
                    <span className="font-bold text-slate-800">{safeOrder.patientPhone || '____________'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-bold uppercase text-[10px] mr-1">Fecha:</span>
                    <span className="font-bold text-slate-800">{safeOrder.date}</span>
                  </div>
                </div>

                {safeOrder.diagnosis && (
                  <div className="pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500 font-bold uppercase text-[10px] mr-1">Diagnóstico / Motivo:</span>
                    <span className="font-bold text-slate-900">{safeOrder.diagnosis}</span>
                  </div>
                )}
              </div>

              {/* 3. Requisition Body: Requested Exams List */}
              <div className="space-y-3 my-2">
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                    <span className="text-[11px] font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                      <span>SOLICITUD DE ESTUDIOS PARACLÍNICOS:</span>
                    </span>
                    <span className="text-[10px] font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                      {allOrderExams.length} {allOrderExams.length === 1 ? 'estudio' : 'estudios'}
                    </span>
                  </div>

                  {allOrderExams.length > 0 ? (
                    <ol className="space-y-1.5 text-xs font-semibold text-slate-900 pl-1">
                      {allOrderExams.map((exam, i) => (
                        <li key={i} className="flex items-start gap-2 py-0.5 border-b border-slate-100 last:border-0">
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="font-black text-slate-950 text-xs sm:text-sm leading-snug">
                            {exam}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="py-6 text-center text-slate-400 italic text-xs">
                      (Despliegue los menús en la parte superior para seleccionar los exámenes de heces, orina, sangre, Rx o ecos)
                    </div>
                  )}
                </div>

                {/* 4. Patient Instructions & Preparation */}
                {safeOrder.patientInstructions && (
                  <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs">
                    <span className="block text-[10px] font-black uppercase text-amber-900 tracking-wider mb-0.5 flex items-center gap-1">
                      <Info className="w-3 h-3 text-amber-700" />
                      <span>INSTRUCCIONES Y PREPARACIÓN PARA EL PACIENTE:</span>
                    </span>
                    <p className="text-slate-800 font-semibold whitespace-pre-line leading-relaxed text-[11px]">
                      {safeOrder.patientInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Official Doctor Footer (Stamp, Signature, Disclaimer) */}
            <div className="mt-4 pt-2">
              <DocumentFooter config={safeConfig} compact={true} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 8. DUAL 2-IN-1 LETTER HORIZONTAL MOLD (EXCLUSIVO LABORATORIO) */}
      {/* Garantiza dos formatos completos de laboratorio en una hoja carta horizontal */}
      {/* ========================================================= */}
      <div
        id="dual-lab-order-print-sheet"
        className="hidden"
        style={{
          width: '1056px',
          minWidth: '1056px',
          maxWidth: '1056px',
          height: '816px',
          minHeight: '816px',
          maxHeight: '816px',
          backgroundColor: safeConfig.tonePapel || '#ffffff',
          display: 'none',
          flexDirection: 'row',
          boxSizing: 'border-box',
          overflow: 'hidden',
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* LADO IZQUIERDO: COPIA 1 - ORIGINAL / LABORATORIO */}
        <div style={{ width: '50%', height: '100%', borderRight: '1.5px dashed #94a3b8', padding: '24px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', backgroundColor: safeConfig.tonePapel || '#ffffff' }}>
          <div>
            <DocumentHeader config={safeConfig} compact={true} hideHeader={false} />
            <div style={{ textAlign: 'center', margin: '6px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: safeConfig.headerColor || '#1e3a8a' }}>
                  🔬 ORDEN DE EXÁMENES Y ESTUDIOS
                </span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#1e40af', backgroundColor: '#dbeafe', padding: '2px 7px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                  ORIGINAL / LABORATORIO
                </span>
              </div>
            </div>

            <div style={{ padding: '6px 10px', backgroundColor: 'rgba(248, 250, 252, 0.95)', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>Paciente: </span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{safeOrder.patientName || '________________________'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>C.I.: </span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{safeOrder.patientCI || '___________'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>Edad: </span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{safeOrder.patientAge || '____'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '3px' }}>
                <div>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>Fecha: </span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{safeOrder.date}</span>
                </div>
                {safeOrder.diagnosis && (
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: '#1e293b' }}>Diag: </span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{safeOrder.diagnosis}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '8px 10px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', minHeight: '170px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                🧪 Estudios Paraclínicos Solicitados ({allOrderExams.length}):
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                {allOrderExams.length > 0
                  ? allOrderExams.map((e, i) => `${i + 1}. ${e}`).join('\n')
                  : '1. Exámenes paraclínicos solicitados en consulta.'}
              </div>
            </div>

            {safeOrder.patientInstructions && (
              <div style={{ marginTop: '6px', padding: '6px 8px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', fontSize: '10.5px' }}>
                <span style={{ fontWeight: 800, color: '#92400e', textTransform: 'uppercase', display: 'block', marginBottom: '1px' }}>
                  ⚠️ Indicaciones de Preparación:
                </span>
                <span style={{ fontWeight: 600, color: '#78350f', whiteSpace: 'pre-line', lineHeight: 1.35 }}>
                  {safeOrder.patientInstructions}
                </span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '6px' }}>
            <DocumentFooter config={safeConfig} compact={true} />
          </div>
        </div>

        {/* LADO DERECHO: COPIA 2 - COPIA PACIENTE / ARCHIVO */}
        <div style={{ width: '50%', height: '100%', padding: '24px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', backgroundColor: safeConfig.tonePapel || '#ffffff' }}>
          <div>
            <DocumentHeader config={safeConfig} compact={true} hideHeader={false} />
            <div style={{ textAlign: 'center', margin: '6px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: safeConfig.headerColor || '#1e3a8a' }}>
                  🔬 ORDEN DE EXÁMENES Y ESTUDIOS
                </span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#166534', backgroundColor: '#dcfce7', padding: '2px 7px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                  COPIA PACIENTE / ARCHIVO
                </span>
              </div>
            </div>

            <div style={{ padding: '6px 10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>Paciente: </span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{safeOrder.patientName || '________________________'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>C.I.: </span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{safeOrder.patientCI || '___________'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>Edad: </span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{safeOrder.patientAge || '____'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', borderTop: '1px solid #bbf7d0', paddingTop: '3px' }}>
                <div>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>Fecha: </span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{safeOrder.date}</span>
                </div>
                {safeOrder.diagnosis && (
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: '#1e293b' }}>Diag: </span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{safeOrder.diagnosis}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '8px 10px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', minHeight: '170px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                🧪 Estudios Paraclínicos Solicitados ({allOrderExams.length}):
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                {allOrderExams.length > 0
                  ? allOrderExams.map((e, i) => `${i + 1}. ${e}`).join('\n')
                  : '1. Exámenes paraclínicos solicitados en consulta.'}
              </div>
            </div>

            {safeOrder.patientInstructions && (
              <div style={{ marginTop: '6px', padding: '6px 8px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', fontSize: '10.5px' }}>
                <span style={{ fontWeight: 800, color: '#92400e', textTransform: 'uppercase', display: 'block', marginBottom: '1px' }}>
                  ⚠️ Indicaciones de Preparación:
                </span>
                <span style={{ fontWeight: 600, color: '#78350f', whiteSpace: 'pre-line', lineHeight: 1.35 }}>
                  {safeOrder.patientInstructions}
                </span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '6px' }}>
            <DocumentFooter config={safeConfig} compact={true} />
          </div>
        </div>
      </div>
    </div>
  );
})()}

      {/* Email Share Modal */}
      {isEmailModalOpen && (
        <EmailShareModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          config={safeConfig}
          documentType="report"
          patientName={safeOrder.patientName || 'Paciente'}
          patientEmail={safeOrder.patientEmail || ''}
          documentTitle="Orden de Exámenes y Estudios Médicos"
          contentBody={
            `Estimado(a) Paciente ${safeOrder.patientName || ''},\n\n` +
            `Se adjunta su orden de Exámenes y Estudios Paraclínicos emitida el ${safeOrder.date}.\n\n` +
            `Por favor, acuda al laboratorio o centro de imágenes con las indicaciones y preparación descritas.`
          }
          onTriggerPrintPdf={handleDownloadLabPdf}
        />
      )}
    </div>
  );
};
