import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DoctorConfig, IndicationsSheet, RecipeItem, SavedPatientEntry } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { EmailShareModal } from './EmailShareModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { exportAndSendWhatsAppBusiness } from '../utils/exportDocument';
import { DEFAULT_DRUGS, SPECIALTY_LABELS, DrugItem, getAllDrugs, searchDrugs } from '../data/drugDatabase';
import { 
  ClipboardList, 
  Printer, 
  MessageSquare, 
  Eye, 
  Pill,
  Plus,
  Trash2,
  Check,
  Utensils,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Zap,
  ChevronDown,
  ChevronUp,
  Search,
  BookmarkPlus,
  X,
  Save,
  Download,
  Mail,
  Sparkles,
  User,
  Activity,
  HeartPulse,
  Share2,
  Calendar
} from 'lucide-react';
import { exportElementAsPDF, buildDocumentPdfFilename } from '../utils/exportDocument';

interface IndicationsModuleProps {
  config: DoctorConfig;
  indications: IndicationsSheet;
  onChangeIndications: (updated: Partial<IndicationsSheet>) => void;
  onPrint: () => void;
  onDownloadPdf?: () => void;
  onOpenEmailModal?: () => void;
  onSaveAndShare?: (shouldDownload?: boolean) => void;
  onInstantWhatsApp?: () => void;
  onOpenPreview?: () => void;
  onUpdateConfig?: (updated: Partial<DoctorConfig>) => void;
  onBackToHome?: () => void;
  onSwitchToRecipe?: () => void;
  recipes?: RecipeItem[];
  activeRecipeIndex?: number;
}

export const IndicationsModule: React.FC<IndicationsModuleProps> = ({
  config,
  indications,
  onChangeIndications,
  onPrint,
  onDownloadPdf,
  onOpenEmailModal,
  onSaveAndShare,
  onInstantWhatsApp,
  onOpenPreview,
  onUpdateConfig,
  onBackToHome,
  onSwitchToRecipe,
  recipes = [],
  activeRecipeIndex = 0,
}) => {
  const printableSheetRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Form State inside the Dropdown Menu
  const [selectedSpecialty, setSelectedSpecialty] = useState('todas');
  const [selectedDrugName, setSelectedDrugName] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('Vía Oral (VO)');
  const [selectedDosage, setSelectedDosage] = useState('1 tableta / cápsula');
  const [selectedFrequency, setSelectedFrequency] = useState('cada 12 horas (8:00 AM - 8:00 PM)');
  const [selectedDuration, setSelectedDuration] = useState('por 7 días');
  const [selectedNote, setSelectedNote] = useState('');

  // Search in dropdown
  const [searchDrugQuery, setSearchDrugQuery] = useState('');
  const [isSearchListOpen, setIsSearchListOpen] = useState(false);

  // Custom system drugs in localStorage
  const [customDrugs, setCustomDrugs] = useState<DrugItem[]>(() => {
    try {
      const saved = localStorage.getItem('digital_medic_custom_drugs_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // All combined drugs
  const allDrugs = useMemo(() => getAllDrugs(customDrugs), [customDrugs]);

  // Filtered by specialty
  const specialtyDrugs = useMemo(() => {
    if (selectedSpecialty === 'todas') return allDrugs;
    if (selectedSpecialty === 'personalizados') return customDrugs;
    return DEFAULT_DRUGS[selectedSpecialty] || [];
  }, [selectedSpecialty, allDrugs, customDrugs]);

  // Filtered by search
  const filteredSearchResults = useMemo(() => {
    if (!searchDrugQuery.trim()) return specialtyDrugs.slice(0, 15);
    return searchDrugs(searchDrugQuery, customDrugs).slice(0, 15);
  }, [searchDrugQuery, specialtyDrugs, customDrugs]);

  // Extract all prescribed medications from the recipes
  const detectedRecipeDrugs = useMemo(() => {
    const list: string[] = [];
    recipes.forEach((rec) => {
      if (rec.rp && rec.rp.trim()) {
        const lines = rec.rp.split('\n');
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed && trimmed.length > 2) {
            const clean = trimmed.replace(/^(\d+[\.\)]|\•|\-)\s*/, '').trim();
            if (clean && !list.includes(clean)) {
              list.push(clean);
            }
          }
        });
      }
    });
    return list;
  }, [recipes]);

  // Auto-sync all prescribed drugs from recipes into indications with full posology
  const handleSyncAllFromRecipe = () => {
    const recs = recipes && recipes.length > 0 ? recipes : [];
    const activeRec = recs[activeRecipeIndex] || recs[0];
    const linesToProcess: string[] = [];

    recs.forEach((r) => {
      if (r.rp && r.rp.trim()) {
        const lines = r.rp.split('\n').map((l) => l.trim()).filter((l) => l.length > 2);
        lines.forEach((l) => {
          if (!linesToProcess.includes(l)) {
            linesToProcess.push(l);
          }
        });
      }
    });

    if (linesToProcess.length === 0) {
      setFeedbackMsg('⚠️ No hay fármacos redactados en el Récipe Médico todavía.');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    const formattedSchedule = linesToProcess
      .map((rawLine, idx) => {
        const clean = rawLine.replace(/^(\d+[\.\)]|\•|\-|\*)\s*/, '').trim();
        const isAlreadyDetailed =
          clean.toLowerCase().includes('tomar') ||
          clean.toLowerCase().includes('cada') ||
          clean.toLowerCase().includes('aplicar') ||
          clean.toLowerCase().includes('vía') ||
          clean.toLowerCase().includes('dosis');
        if (isAlreadyDetailed) {
          return `${idx + 1}. ${clean}`;
        }
        return `${idx + 1}. ${clean}: `;
      })
      .join('\n');

    const updates: Partial<IndicationsSheet> = {
      medicationSchedule: formattedSchedule,
    };

    if (activeRec) {
      if (activeRec.patientName && !indications.patientName) updates.patientName = activeRec.patientName;
      if (activeRec.patientCI && !indications.patientCI) updates.patientCI = activeRec.patientCI;
      if (activeRec.patientAge && !indications.patientAge) updates.patientAge = activeRec.patientAge;
      if (activeRec.patientPhone && !indications.patientPhone) updates.patientPhone = activeRec.patientPhone;
      if (activeRec.diagnosis && !indications.diagnosis) updates.diagnosis = activeRec.diagnosis;
      if (activeRec.date && !indications.date) updates.date = activeRec.date;
    }

    onChangeIndications(updates);
    setFeedbackMsg('✓ ¡Fármacos y posología sincronizados con éxito!');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Insert configured drug from dropdown menu into schedule
  const handleInsertConfiguredDrug = () => {
    const name = selectedDrugName.trim() || searchDrugQuery.trim();
    if (!name) return;

    let line = `• ${name}: ${selectedDosage ? `${selectedDosage}, ` : ''}${selectedRoute ? `${selectedRoute}, ` : ''}${selectedFrequency}, ${selectedDuration}.`;
    if (selectedNote.trim()) {
      line += ` (${selectedNote.trim()})`;
    }

    const current = indications.medicationSchedule || '';
    const updated = current.trim() ? `${current.trim()}\n${line}` : line;
    onChangeIndications({ medicationSchedule: updated });

    setFeedbackMsg(`✓ ¡Agregado: ${name}!`);
    setTimeout(() => setFeedbackMsg(null), 2500);

    // Reset fields
    setSelectedDrugName('');
    setSearchDrugQuery('');
    setSelectedNote('');
    setIsSearchListOpen(false);
  };

  // Save new drug into system custom drugs database for all users
  const handleAddNewSystemDrug = () => {
    const name = searchDrugQuery.trim() || selectedDrugName.trim();
    if (!name) {
      setFeedbackMsg('⚠️ Escriba o seleccione un nombre de fármaco válido.');
      setTimeout(() => setFeedbackMsg(null), 2500);
      return;
    }

    const newDrug: DrugItem = {
      id: `custom-sys-${Date.now()}`,
      name: name,
      presentation: selectedDosage || 'Tableta / Cápsula',
      dosage: selectedDosage || '1 tableta',
      instructions: selectedNote || 'Según indicación médica',
      specialty: selectedSpecialty || 'general',
    };

    const updated = [newDrug, ...customDrugs];
    setCustomDrugs(updated);
    try {
      localStorage.setItem('digital_medic_custom_drugs_v2', JSON.stringify(updated));
    } catch (e) {}

    setFeedbackMsg(`✓ ¡Fármaco "${name}" guardado en el Banco Global!`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Quick append helper for Diet and Alarms
  const handleAppendDiet = (text: string) => {
    const current = indications.dietAndRest || '';
    const updated = current.trim() ? `${current.trim()}\n• ${text}` : `• ${text}`;
    onChangeIndications({ dietAndRest: updated });
  };

  const handleAppendAlarm = (text: string) => {
    const current = indications.alarmSigns || '';
    const updated = current.trim() ? `${current.trim()}\n• ${text}` : `• ${text}`;
    onChangeIndications({ alarmSigns: updated });
  };

  const safeIndications = indications || {
    id: 'IND-01',
    patientName: '',
    patientCI: '',
    patientPhone: '',
    patientAge: '',
    date: new Date().toLocaleDateString('es-VE'),
    diagnosis: '',
    generalInstructions: '',
    medicationSchedule: '',
    dietAndRest: '',
    alarmSigns: '',
    nextAppointment: '',
  };

  const safeConfig = config || {
    doctorName: 'Dr. Carlos Leal',
    specialty: 'Médico Cirujano',
    borderStyle: 'solido',
    primaryDocColor: '#2563eb',
    paperTexture: 'lisa',
  };

  const borderStyle = getDocumentBorderStyle(safeConfig.borderStyle, safeConfig.primaryDocColor);
  const textureClass = getPaperTextureClass(safeConfig.paperTexture);

  const todayDateStr = new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()).replace(/[/\\:]/g, '-');
  const pdfFilename = buildDocumentPdfFilename('Indicaciones_Medicas', safeIndications.patientName, todayDateStr);

  const handleDownloadIndicationsPdf = async () => {
    if (currentStep !== 4) {
      setCurrentStep(4);
      await new Promise(r => setTimeout(r, 200));
    }
    await exportElementAsPDF(printableSheetRef.current, pdfFilename);
  };

  const handlePrintSpecificIndications = () => {
    setCurrentStep(4);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center pb-12 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* TOP BANNER & PROGRESS NAVIGATION                          */}
      {/* ========================================================= */}
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-3 sm:p-4 mb-4 no-print">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
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
            {onSwitchToRecipe && (
              <button
                type="button"
                onClick={onSwitchToRecipe}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors cursor-pointer border border-blue-200"
              >
                <Pill className="w-3.5 h-3.5 text-blue-600" />
                <span>Volver al Récipe</span>
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Indicaciones Médicas</span>
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
                  const current = parseInt(safeConfig.indicationsFontSize || '12.5px', 10) || 12;
                  onUpdateConfig?.({ indicationsFontSize: `${Math.max(10, current - 1)}px` });
                }}
                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold text-slate-700 cursor-pointer"
              >
                A-
              </button>
              <button
                onClick={() => {
                  const current = parseInt(safeConfig.indicationsFontSize || '12.5px', 10) || 12;
                  onUpdateConfig?.({ indicationsFontSize: `${Math.min(22, current + 1)}px` });
                }}
                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold text-slate-700 cursor-pointer"
              >
                A+
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onChangeIndications({
                  patientName: '',
                  patientCI: '',
                  patientPhone: '',
                  patientAge: '',
                  diagnosis: '',
                  generalInstructions: '',
                  medicationSchedule: '',
                  dietAndRest: '',
                  alarmSigns: '',
                  nextAppointment: ''
                });
                setCurrentStep(1);
                setFeedbackMsg('✓ Formulario limpiado');
                setTimeout(() => setFeedbackMsg(null), 2000);
              }}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer border border-rose-200"
              title="Vaciar datos y empezar nueva pauta"
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
                {safeIndications.patientName ? safeIndications.patientName.split(' ')[0] : 'Datos'}
              </span>
            </div>
          </button>

          {/* Paso 2: Medicamentos */}
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
                2. Horarios
              </span>
              <span className={`text-[9px] sm:text-[10px] block truncate ${currentStep === 2 ? 'text-blue-100' : 'text-slate-500'}`}>
                Catálogo Fármacos
              </span>
            </div>
          </button>

          {/* Paso 3: Dieta y Alarma */}
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
                3. Recomendaciones
              </span>
              <span className={`text-[9px] sm:text-[10px] block truncate ${currentStep === 3 ? 'text-blue-100' : 'text-slate-500'}`}>
                Dieta y Alarma
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
                : 'bg-slate-50 text-slate-400'
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
                Ingrese la información básica del paciente para sus indicaciones médicas:
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
                value={safeIndications.patientName}
                onChange={(e) => onChangeIndications({ patientName: e.target.value })}
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
                value={safeIndications.patientCI}
                onChange={(e) => onChangeIndications({ patientCI: e.target.value })}
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
                value={safeIndications.patientAge}
                onChange={(e) => onChangeIndications({ patientAge: e.target.value })}
                placeholder="Ej: 34 años"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Teléfono WhatsApp:
              </label>
              <input
                type="tel"
                value={safeIndications.patientPhone || ''}
                onChange={(e) => onChangeIndications({ patientPhone: e.target.value })}
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
                value={safeIndications.date}
                onChange={(e) => onChangeIndications({ date: e.target.value })}
                placeholder="DD/MM/AAAA"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Diagnóstico de Egreso / Control:
              </label>
              <input
                type="text"
                value={safeIndications.diagnosis || ''}
                onChange={(e) => onChangeIndications({ diagnosis: e.target.value })}
                placeholder="Ej: Postoperatorio de Colecistectomía / Infección Respiratoria Aguda"
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
              <span>Siguiente: Medicamentos y Horarios</span>
              <ArrowRight className="w-5 h-5 text-cyan-200" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 2: MEDICAMENTOS Y HORARIOS                           */}
      {/* ========================================================= */}
      {currentStep === 2 && (
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 space-y-6 animate-in fade-in no-print">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Pill className="w-6 h-6 text-blue-600 animate-pulse" />
                <span>Paso 2: Medicamentos y Posología Sincronizada</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Redacte o sincronice los fármacos con su respectivo horario de administración:
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncAllFromRecipe}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/10 border border-teal-500/20"
              title="Copiar medicamentos redactados en el récipe a la hoja de indicaciones"
            >
              <RefreshCw className="w-4 h-4 text-white" />
              <span>Sincronizar con Récipe</span>
            </button>
          </div>

          {/* DRUG BANK AND CATALOG SELECTORS */}
          <div className="bg-slate-50 border-2 border-slate-200/80 rounded-3xl p-4 space-y-4 shadow-inner">
            <span className="text-xs font-black text-slate-700 flex items-center gap-2 uppercase tracking-wide">
              <BookmarkPlus className="w-4 h-4 text-blue-600" />
              <span>Inserción Rápida desde Catálogo de Fármacos y Posología</span>
            </span>

            {/* Row 1: Specialty & Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Especialidad:</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => {
                    setSelectedSpecialty(e.target.value);
                    setSelectedDrugName('');
                    setSearchDrugQuery('');
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 font-semibold text-slate-800 outline-none focus:border-blue-600 shadow-2xs"
                >
                  <option value="todas">📚 Todas las Especialidades ({allDrugs.length})</option>
                  <option value="psicologia">🧠 Psicología, Psiquiatría y Salud Mental</option>
                  <option value="general">🩺 Medicina General e Interna</option>
                  <option value="cardiologia">❤️ Cardiología</option>
                  <option value="gastroenterologia">🧬 Gastroenterología</option>
                  <option value="ginecologia">🌸 Ginecología y Obstetricia</option>
                  <option value="pediatria">👶 Pediatría</option>
                  <option value="traumatologia">🦴 Traumatología y Ortopedia</option>
                  <option value="respiratorio">🫁 Neumonología y Respiratorio</option>
                  <option value="anestesia">💉 Anestesiología y Cirugía</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Seleccionar Fármaco del Catálogo:</label>
                <select
                  value={selectedDrugName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedDrugName(val);
                    setSearchDrugQuery(val);
                    const found = specialtyDrugs.find(d => d.name === val);
                    if (found && found.dosage) {
                      setSelectedDosage(found.dosage);
                    }
                    if (found && found.instructions) {
                      setSelectedNote(found.instructions);
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 font-bold text-slate-900 outline-none focus:border-blue-600 shadow-2xs truncate"
                >
                  <option value="">-- Seleccionar Fármaco --</option>
                  {specialtyDrugs.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.presentation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="font-bold text-slate-600 block mb-1">O Escriba y busque libremente:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchDrugQuery}
                    onChange={(e) => {
                      setSearchDrugQuery(e.target.value);
                      setSelectedDrugName(e.target.value);
                      setIsSearchListOpen(true);
                    }}
                    onFocus={() => setIsSearchListOpen(true)}
                    placeholder="Escriba medicamento..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:border-blue-600 shadow-2xs"
                  />
                  {searchDrugQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchDrugQuery('');
                        setSelectedDrugName('');
                        setIsSearchListOpen(false);
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isSearchListOpen && searchDrugQuery.trim().length > 1 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-blue-400 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredSearchResults.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setSelectedDrugName(d.name);
                          setSearchDrugQuery(d.name);
                          if (d.dosage) setSelectedDosage(d.dosage);
                          if (d.instructions) setSelectedNote(d.instructions);
                          setIsSearchListOpen(false);
                        }}
                        className="p-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-900">{d.name}</span>
                        <span className="text-[10px] text-slate-500">{d.presentation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Dosage, Route, Frequency, Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Vía de Administración:</label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 font-semibold text-slate-900 outline-none"
                >
                  <option value="Vía Oral (VO)">Vía Oral (VO)</option>
                  <option value="Sublingual (SL)">Sublingual (SL)</option>
                  <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                  <option value="Intravenosa (IV)">Intravenosa (IV)</option>
                  <option value="Inhalatoria">Inhalatoria (Puffs / Aerosol)</option>
                  <option value="Tópica">Tópica (Crema / Gel)</option>
                  <option value="Oftálmica">Oftálmica (Gotas en ojos)</option>
                  <option value="Ótica">Ótica (Gotas en oídos)</option>
                  <option value="Nasal">Nasal (Spray / Gotas)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Dosis / Cantidad:</label>
                <input
                  type="text"
                  value={selectedDosage}
                  onChange={(e) => setSelectedDosage(e.target.value)}
                  placeholder="Ej: 1 tableta, 5ml, 2 puff"
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 font-medium text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Horario / Frecuencia:</label>
                <select
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 font-semibold text-slate-900 outline-none"
                >
                  <option value="cada 8 horas (8:00 AM - 4:00 PM - 12:00 MN)">Cada 8 horas (8am - 4pm - 12mn)</option>
                  <option value="cada 8 horas (6:00 AM - 2:00 PM - 10:00 PM)">Cada 8 horas (6am - 2pm - 10pm)</option>
                  <option value="cada 12 horas (8:00 AM - 8:00 PM)">Cada 12 horas (8am - 8pm)</option>
                  <option value="cada 12 horas (7:00 AM - 7:00 PM)">Cada 12 horas (7am - 7pm)</option>
                  <option value="cada 6 horas (6:00 AM - 12:00 PM - 6:00 PM - 12:00 MN)">Cada 6 horas (6am - 12pm - 6pm - 12mn)</option>
                  <option value="cada 4 horas">Cada 4 horas</option>
                  <option value="cada 24 horas en ayunas (7:00 AM)">Cada 24 horas en ayunas (7:00 AM)</option>
                  <option value="cada 24 horas en la mañana (8:00 AM)">Cada 24 horas en la mañana (8:00 AM)</option>
                  <option value="en la noche antes de acostarse (9:30 PM)">En la noche antes de acostarse (9:30 PM)</option>
                  <option value="con las comidas principales (Desayuno, Almuerzo, Cena)">Con las comidas principales</option>
                  <option value="cada 6 a 8 horas condicionado a dolor o fiebre (SOS)">SOS / Si presenta dolor o fiebre</option>
                  <option value="dosis única estricta">Dosis única estricta</option>
                  <option value="1 vez por semana">1 vez por semana</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Duración del Tratamiento:</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 font-semibold text-slate-900 outline-none"
                >
                  <option value="por 3 días">por 3 días</option>
                  <option value="por 5 días">por 5 días</option>
                  <option value="por 7 días">por 7 días</option>
                  <option value="por 10 días">por 10 días</option>
                  <option value="por 14 días">por 14 días</option>
                  <option value="por 30 días">por 30 días</option>
                  <option value="tratamiento continuo">tratamiento continuo</option>
                  <option value="según indicación médica">según indicación médica</option>
                </select>
              </div>
            </div>

            {/* Row 3: Special Notes & Insert buttons */}
            <div className="flex flex-col sm:flex-row items-end gap-3 text-xs pt-1">
              <div className="flex-1 w-full">
                <label className="font-bold text-slate-600 block mb-1">Instrucciones de Toma Especial (Opcional):</label>
                <input
                  type="text"
                  value={selectedNote}
                  onChange={(e) => setSelectedNote(e.target.value)}
                  placeholder="Ej: Tomar con abundante agua 30 minutos antes del desayuno..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleAddNewSystemDrug}
                  className="flex-1 sm:flex-none px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Guardar este fármaco en el Banco Global para futuros usos"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Fármaco</span>
                </button>

                <button
                  type="button"
                  onClick={handleInsertConfiguredDrug}
                  className="flex-1 sm:flex-none px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.01] active:scale-95 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar a la Hoja</span>
                </button>
              </div>
            </div>

          </div>

          {/* EDITABLE MEDICATIONS TEXTAREA */}
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1 flex items-center justify-between">
              <span>LISTA COMPLETA DE MEDICAMENTOS Y CUMPLIMIENTO: *</span>
              <button
                type="button"
                onClick={() => {
                  const current = safeIndications.medicationSchedule || '';
                  const updated = current.trim() ? `${current.trim()}\n• ` : '• ';
                  onChangeIndications({ medicationSchedule: updated });
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>+ Añadir Fila Rápida</span>
              </button>
            </label>
            <textarea
              rows={8}
              value={safeIndications.medicationSchedule}
              onChange={(e) => onChangeIndications({ medicationSchedule: e.target.value })}
              placeholder="• Fármaco A: Tomar 1 tableta cada 8 horas (8 AM - 4 PM - 12 MN) por 5 días con alimentos.&#10;• Fármaco B: ..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-3xl text-sm sm:text-base font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all leading-relaxed shadow-inner placeholder:text-slate-400"
            />
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
              <span>Siguiente: Dieta y Alarma</span>
              <ArrowRight className="w-5 h-5 text-cyan-200" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 3: DIETA, ALARMA Y CONTROL                           */}
      {/* ========================================================= */}
      {currentStep === 3 && (
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 space-y-6 animate-in fade-in no-print">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Utensils className="w-6 h-6 text-blue-600" />
                <span>Paso 3: Dieta, Alarmas y Próxima Cita</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Redacte las pautas generales de alimentación, cuidados, reposo físico y signos de alerta:
              </p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* 1. Dieta, Reposo e Hidratación */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <label className="block text-xs sm:text-sm font-black text-slate-800">
                  1. DIETA, REPOSO E HIDRATACIÓN:
                </label>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleAppendDiet('Dieta blanda baja en grasas y condimentos, hidratación oral abundante (mínimo 2 litros de agua/día)')}
                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200"
                  >
                    + Dieta Blanda
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAppendDiet('Reposo físico relativo en domicilio por 5 a 7 días, evitar levantar peso o esfuerzos intensos')}
                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200"
                  >
                    + Reposo Relativo
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={safeIndications.dietAndRest}
                onChange={(e) => onChangeIndications({ dietAndRest: e.target.value })}
                placeholder="• Dieta blanda e hidratación oral abundante (mínimo 2.5 litros de agua/día).&#10;• Reposo relativo en casa, evitar bipedestación prolongada o carga de peso..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all leading-relaxed shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 2. Signos de Alarma */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <label className="block text-xs sm:text-sm font-black text-slate-800">
                  2. SIGNOS DE ALARMA (MOTIVOS PARA CONSULTAR A EMERGENCIA):
                </label>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleAppendAlarm('Fiebre superior a 38.5°C persistente de difícil control farmacológico')}
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-200"
                  >
                    + Fiebre Alta
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAppendAlarm('Dolor abdominal agudo intenso, vómitos repetitivos, náuseas incoercibles o sangrado visible')}
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-200"
                  >
                    + Dolor / Vómitos
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={safeIndications.alarmSigns}
                onChange={(e) => onChangeIndications({ alarmSigns: e.target.value })}
                placeholder="• Fiebre superior a 38.5°C persistente.&#10;• Dolor abdominal intenso o intolerancia total a la vía oral por vómitos repetidos..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all leading-relaxed shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 3. Próxima Cita de Control */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                3. PRÓXIMA CITA DE CONTROL:
              </label>
              <input
                type="text"
                value={safeIndications.nextAppointment}
                onChange={(e) => onChangeIndications({ nextAppointment: e.target.value })}
                placeholder="Ej: Acudir a control por consulta externa en 7 días para retiro de puntos"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
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
      {/* PASO 4: VISTA FINAL & ACCIONES                            */}
      {/* ========================================================= */}
      {currentStep === 4 && (
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
                    Indicaciones Médicas Listas
                  </h3>
                  <span className="text-xs text-emerald-300 font-medium">
                    Paciente: <strong>{safeIndications.patientName || 'Sin nombre'}</strong> · {safeIndications.date || 'Hoy'}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Instant Action Buttons */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 w-full">
              
              {/* Botón Descargar PDF */}
              <button
                type="button"
                onClick={handleDownloadIndicationsPdf}
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
                  const treatment = [
                    safeIndications.medicationSchedule?.trim(),
                    safeIndications.dietAndRest?.trim(),
                  ].filter(Boolean).join('\n\n');

                  exportAndSendWhatsAppBusiness({
                    element: printableSheetRef.current,
                    patientName: safeIndications.patientName || 'Carlos leal',
                    documentTitle: 'Indicaciones Médicas',
                    dateStr: safeIndications.date || '14/10/26',
                    patientPhone: safeIndications.patientPhone,
                    doctorName: config.doctorName || 'Dr. Carlos Leal',
                    treatmentDetails: treatment,
                    documentType: 'indications',
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
      {/* VISTA PREVIA REAL DE INDICACIONES EN FORMATO CARTA        */}
      {/* ========================================================= */}
      <div className={`w-full flex justify-center py-2 ${currentStep === 4 ? 'block' : 'hidden print:block'}`}>
        <div
          ref={printableSheetRef}
          id="indications-print-container"
          className={`relative w-full max-w-[816px] bg-white shadow-2xl p-6 sm:p-8 rounded-2xl transition-all report-sheet-container indications-container print-container border border-slate-200/90 ${textureClass} ${
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
            <div className="text-center my-4 pb-2 border-b border-slate-200">
              <h2
                className="text-base sm:text-lg font-black uppercase tracking-wider"
                style={{ color: safeConfig.headerColor, fontFamily: safeConfig.fuenteHeader }}
              >
                INDICACIONES MÉDICAS Y POSOLOGÍA
              </h2>
            </div>

            {/* Patient Info Row */}
            <div 
              className="py-2.5 px-4 bg-slate-50/50 border border-slate-200 rounded-xl mb-4 space-y-2 text-xs sm:text-sm"
              style={{ fontSize: safeConfig.patientBarSize || '12px' }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px]">Paciente:</span>
                  <span className="font-black text-slate-900 text-sm sm:text-base">{safeIndications.patientName || '___________________________'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px] sm:text-right">Cédula de Identidad / Doc:</span>
                  <span className="font-black text-slate-900 text-sm sm:text-base sm:text-right block">{safeIndications.patientCI || '____________'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Edad:</span>
                  <span className="font-bold text-slate-800">{safeIndications.patientAge || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Fecha:</span>
                  <span className="font-bold text-slate-800">{safeIndications.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Teléfono:</span>
                  <span className="font-bold text-slate-800">{safeIndications.patientPhone || '—'}</span>
                </div>
              </div>

              {safeIndications.diagnosis && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Diagnóstico Clínico (Dx):</span>
                  <span className="font-bold text-slate-800 text-xs">{safeIndications.diagnosis}</span>
                </div>
              )}
            </div>

            {/* Main Indications Content */}
            <div
              className="text-slate-900 space-y-5 flex-1 leading-relaxed mt-2"
              style={{
                fontSize: safeConfig.indicationsFontSize || '12.5px',
                fontFamily: safeConfig.indicationsFontFamily || "'Merriweather', serif",
              }}
            >
              
              {/* 1. Medication & Schedule */}
              {safeIndications.medicationSchedule && (
                <div className="space-y-1.5">
                  <h4 className="font-black text-xs sm:text-sm uppercase tracking-wide" style={{ color: safeConfig.headerColor }}>
                    1. HORARIO Y CUMPLIMIENTO DE MEDICAMENTOS:
                  </h4>
                  <div className="p-4 bg-slate-50/20 border border-slate-200 rounded-2xl whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-800 font-medium">
                    {safeIndications.medicationSchedule}
                  </div>
                </div>
              )}

              {/* 2. Diet & Rest */}
              {safeIndications.dietAndRest && (
                <div className="space-y-1.5">
                  <h4 className="font-black text-xs sm:text-sm uppercase tracking-wide" style={{ color: safeConfig.headerColor }}>
                    2. DIETA, REPOSO Y PLAN NUTRICIONAL:
                  </h4>
                  <div className="p-4 bg-slate-50/20 border border-slate-200 rounded-2xl whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-800 font-medium">
                    {safeIndications.dietAndRest}
                  </div>
                </div>
              )}

              {/* 3. Alarm Signs */}
              {safeIndications.alarmSigns && (
                <div className="space-y-1.5">
                  <h4 className="font-black text-xs sm:text-sm uppercase tracking-wide text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>3. SIGNOS DE ALERTA O ALARMA (URGENCIAS):</span>
                  </h4>
                  <div className="p-4 bg-rose-50/20 border border-rose-200 rounded-2xl whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-rose-900 font-semibold">
                    {safeIndications.alarmSigns}
                  </div>
                </div>
              )}

              {/* 4. Next Appointment */}
              {safeIndications.nextAppointment && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-700 bg-slate-50/30 p-3 rounded-xl border border-slate-100">
                  <span className="uppercase text-[10px] tracking-wider text-slate-500 font-bold block shrink-0">Próximo Control:</span>
                  <span className="text-slate-900 font-black">{safeIndications.nextAppointment}</span>
                </div>
              )}

            </div>

            {/* Footer Stamp & Signature */}
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
        documentType="indications"
        patientName={safeIndications.patientName}
        patientEmail={indications.patientEmail || ''}
        documentTitle="Indicaciones Médicas y Posología"
        contentBody={
          `Estimado(a) Paciente ${safeIndications.patientName},\n\n` +
          `Se adjunta su hoja de Indicaciones Médicas y Posología Oficial emitida el ${safeIndications.date}.\n\n` +
          `Por favor, siga con riguroso cumplimiento las tomas de medicamentos descritas.`
        }
        onTriggerPrintPdf={handleDownloadIndicationsPdf}
      />

    </div>
  );
};
