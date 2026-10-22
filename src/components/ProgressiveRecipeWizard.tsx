import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  User, 
  Pill, 
  FileCheck2, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  Users, 
  Plus, 
  Download, 
  Share2, 
  Printer, 
  Save, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Phone, 
  FileText, 
  Eye, 
  Grid2X2,
  BookOpen,
  ClipboardList,
  Edit3,
  Heart,
  Clock,
  AlertCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  Check,
  X,
  Scissors,
  Mail
} from 'lucide-react';
import { 
  DoctorConfig, 
  SingleRecipeData, 
  IndicationsSheet, 
  SavedPatientEntry 
} from '../types';
import { 
  DEFAULT_DRUGS, 
  SPECIALTY_LABELS, 
  DrugItem, 
  getAllDrugs, 
  searchDrugs 
} from '../data/drugDatabase';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { 
  exportElementAsPDF, 
  exportMultipleElementsAsPDF, 
  buildDocumentPdfFilename,
  exportAndSendWhatsAppBusiness,
  validateDoctorFormatForExport
} from '../utils/exportDocument';
import { EmailShareModal } from './EmailShareModal';

interface ProgressiveRecipeWizardProps {
  config: DoctorConfig;
  recipe: SingleRecipeData;
  onChangeRecipe: (updated: Partial<SingleRecipeData>) => void;
  indications?: IndicationsSheet;
  onChangeIndications?: (updated: Partial<IndicationsSheet>) => void;
  onUpdateConfig?: (updated: Partial<DoctorConfig>) => void;
  onPrint?: () => void;
  onDownloadPdf?: () => void;
  onOpenEmailModal?: () => void;
  onSavePatientOnly?: () => void;
  onOpenPatientBank?: () => void;
  onOpenPreviewModal?: () => void;
  onSwitchTo4In1?: () => void;
  onClearRecipeToBlank?: () => void;
  onBackToHome?: () => void;
  existingPatients?: SavedPatientEntry[];
  onSelectExistingPatient?: (patient: SavedPatientEntry) => void;
}

export const ProgressiveRecipeWizard: React.FC<ProgressiveRecipeWizardProps> = ({
  config,
  recipe,
  onChangeRecipe,
  indications,
  onChangeIndications,
  onUpdateConfig,
  onPrint,
  onDownloadPdf,
  onOpenEmailModal,
  onSavePatientOnly,
  onOpenPatientBank,
  onOpenPreviewModal,
  onSwitchTo4In1,
  onClearRecipeToBlank,
  onBackToHome,
  existingPatients = [],
  onSelectExistingPatient,
}) => {
  // 4 Pasos del Asistente Guiado:
  // Paso 1 = Datos del Paciente
  // Paso 2 = Prescripción de Fármacos (Rp.)
  // Paso 3 = Hoja de Indicaciones (Revisión y Ajuste con Catálogo y Posologías)
  // Paso 4 = Vista Final & Descarga / Impresión Inmediata (1 Sola Hoja 2 en 1 o Individual)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Vista activa en el Paso 4: 'recipe' | 'indications'
  const [finalPreviewTab, setFinalPreviewTab] = useState<'recipe' | 'indications'>('recipe');

  // Tamaño del récipe en formato solo récipe:
  // 'quarter': 1/4 Hoja Carta (Pequeño, 4 caben en una hoja carta) -> Activo por defecto como pidió el usuario
  // 'half': Media Carta Horizontal (2 caben en una hoja carta)
  // 'letter': Hoja Carta Completa
  const [recipeSize, setRecipeSize] = useState<'quarter' | 'half' | 'letter'>('half');
  const [printFourInSheet, setPrintFourInSheet] = useState<boolean>(false);
  const printableFourInSheetRef = useRef<HTMLDivElement>(null);

  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isStep2CatalogOpen, setIsStep2CatalogOpen] = useState(true);
  const [step2CatalogTab, setStep2CatalogTab] = useState<'drugs' | 'schedules' | 'diet' | 'alarms'>('drugs');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activePrintMode, setActivePrintMode] = useState<'recipe' | 'fourInSheet' | 'indications' | 'dual'>('recipe');
  const [step4QuickDrugText, setStep4QuickDrugText] = useState('');

  // Custom drugs persistentes en localStorage (mismo banco que el sistema general)
  const [customDrugs, setCustomDrugs] = useState<DrugItem[]>(() => {
    try {
      const saved = localStorage.getItem('digital_medic_custom_drugs_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Modal para agregar fármaco personalizado al catálogo
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customDrugName, setCustomDrugName] = useState('');
  const [customDrugPresentation, setCustomDrugPresentation] = useState('');
  const [customDrugDosage, setCustomDrugDosage] = useState('');
  const [customDrugInstructions, setCustomDrugInstructions] = useState('');
  const [customDrugSpecialty, setCustomDrugSpecialty] = useState('general');

  // Guardar fármaco nuevo en localStorage
  const handleSaveCustomDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDrugName.trim()) return;

    const newDrug: DrugItem = {
      id: `custom-${Date.now()}`,
      name: customDrugName.trim(),
      presentation: customDrugPresentation.trim() || 'Presentación personalizada',
      dosage: customDrugDosage.trim() || 'Dosis según criterio médico',
      instructions: customDrugInstructions.trim() || 'Tomar según prescripción médica.',
      specialty: customDrugSpecialty || 'general',
    };

    const updated = [newDrug, ...customDrugs];
    setCustomDrugs(updated);
    try {
      localStorage.setItem('digital_medic_custom_drugs_v2', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setShowAddCustomModal(false);
    setCustomDrugName('');
    setCustomDrugPresentation('');
    setCustomDrugDosage('');
    setCustomDrugInstructions('');
    
    setCopyFeedback(`✓ Fármaco "${newDrug.name}" guardado en su catálogo`);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Local state for indications if parent doesn't provide
  const [localIndications, setLocalIndications] = useState<IndicationsSheet>(() => {
    return indications || {
      id: `ind-${Date.now()}`,
      patientName: recipe.patientName || '',
      patientCI: recipe.patientCI || '',
      patientPhone: recipe.patientPhone || '',
      patientAge: recipe.patientAge || '',
      date: recipe.date || new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()),
      diagnosis: recipe.diagnosis || '',
      generalInstructions: '',
      medicationSchedule: '',
      dietAndRest: 'Dieta balanceada e hidratación abundante (2 a 3 litros de agua diarios). Reposo relativo.',
      alarmSigns: 'Fiebre persistente >38.5°C, dificultad respiratoria o mareo severo -> Acudir a emergencias.',
      nextAppointment: 'Control en consulta médica según evolución.'
    };
  });

  // Sincronizar localIndications cuando cambian los datos del paciente y asegurar fecha válida
  useEffect(() => {
    if (!recipe.date) {
      const todayFormatted = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      onChangeRecipe({ date: todayFormatted });
    }
    setLocalIndications((prev) => ({
      ...prev,
      patientName: recipe.patientName || prev.patientName,
      patientCI: recipe.patientCI || prev.patientCI,
      patientPhone: recipe.patientPhone || prev.patientPhone,
      patientAge: recipe.patientAge || prev.patientAge,
      date: recipe.date || prev.date,
      diagnosis: recipe.diagnosis || prev.diagnosis,
    }));
  }, [recipe.patientName, recipe.patientCI, recipe.patientPhone, recipe.patientAge, recipe.date, recipe.diagnosis]);

  const updateIndicationsField = (field: keyof IndicationsSheet, value: any) => {
    const updated = { ...localIndications, [field]: value };
    setLocalIndications(updated);
    if (onChangeIndications) {
      onChangeIndications(updated);
    }
  };

  // Auto-sincronizar indicaciones con los fármacos del récipe si las indicaciones están vacías
  useEffect(() => {
    if (recipe.rp && recipe.rp.trim() && (!localIndications.generalInstructions || !localIndications.generalInstructions.trim())) {
      const lines = recipe.rp.split('\n').filter((l: string) => l.trim().length > 0);
      const generated: string[] = [];
      lines.forEach((line: string) => {
        const cleanLine = line.replace(/^\d+[\.\-\)]\s*/, '').trim();
        if (!cleanLine) return;
        const matches = searchDrugs(cleanLine.split(' ')[0] || cleanLine, customDrugs);
        if (matches.length > 0) {
          generated.push(`• ${cleanLine}: ${matches[0].instructions}`);
        } else {
          generated.push(`• ${cleanLine}: Tomar según posología médica indicada.`);
        }
      });
      if (generated.length > 0) {
        updateIndicationsField('generalInstructions', generated.join('\n'));
      }
    }
  }, [recipe.rp]);

  // Referencias a los contenedores de captura e impresión
  const printableDualRef = useRef<HTMLDivElement>(null);
  const printableRecipeRef = useRef<HTMLDivElement>(null);
  const printableIndicationsRef = useRef<HTMLDivElement>(null);

  const borderStyle = getDocumentBorderStyle(config.borderStyle, config.primaryDocColor);
  const textureClass = getPaperTextureClass(config.paperTexture);

  // Estado para validación estricta de membrete
  const [validationErrorModal, setValidationErrorModal] = useState<string | null>(null);

  const validateDoctorProfileAsync = async (): Promise<string | null> => {
    // 1. Validar longitud del nombre del médico
    if (config.doctorName && config.doctorName.length > 55) {
      return "Atención: El nombre del médico excede los límites permitidos para el diseño de la cuadrícula. Por favor, ajuste su formato en la configuración de perfil antes de imprimir.";
    }
    // 2. Validar longitud de especialidad / credenciales
    if (config.specialty && config.specialty.length > 60) {
      return "Atención: La especialidad o credenciales exceden los límites. Por favor, ajuste su formato en la configuración de perfil antes de imprimir.";
    }
    // 3. Validar dimensiones del logo si está configurado
    const logoToCheck = config.logoIzq || config.logoDer;
    if (logoToCheck && logoToCheck.startsWith('data:image')) {
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = logoToCheck;
        });
        if ((img as HTMLImageElement).width > 800 || (img as HTMLImageElement).height > 800) {
          return "Atención: El tamaño de la imagen del logo excede las dimensiones máximas permitidas para el contenedor del membrete. Por favor, ajuste su formato en la configuración de perfil antes de imprimir.";
        }
      } catch {
        // Ignorar error de carga de imagen de prueba
      }
    }
    return null;
  };

  // Estado para categoría de medicamentos seleccionada en Paso 2
  const [selectedDrugCategory, setSelectedDrugCategory] = useState<string>('todas');

  // Estado para el panel desplegable de posologías y catálogo en Indicaciones
  const [isIndicationsCatalogOpen, setIsIndicationsCatalogOpen] = useState(true);
  const [indicationsCatalogTab, setIndicationsCatalogTab] = useState<'drugs' | 'schedules' | 'diet' | 'alarms'>('drugs');
  const [indicationsDrugSearch, setIndicationsDrugSearch] = useState('');
  const [indicationsDrugCategory, setIndicationsDrugCategory] = useState<string>('todas');

  // Filter existing patients for fast autocomplete
  const matchingPatients = useMemo(() => {
    if (!patientSearchQuery.trim()) return [];
    const q = patientSearchQuery.toLowerCase();
    return existingPatients.filter(
      (p) =>
        p.patientName.toLowerCase().includes(q) ||
        p.patientCI.toLowerCase().includes(q) ||
        (p.patientPhone && p.patientPhone.includes(q))
    ).slice(0, 5);
  }, [existingPatients, patientSearchQuery]);

  // All combined drugs (system + custom)
  const allCombinedDrugs = useMemo(() => {
    return getAllDrugs(customDrugs);
  }, [customDrugs]);

  // Step 2: Drugs list filtered by category and search
  const step2SearchedDrugs = useMemo(() => {
    if (!drugSearchQuery.trim()) return [];
    return searchDrugs(drugSearchQuery, customDrugs).slice(0, 16);
  }, [drugSearchQuery, customDrugs]);

  const step2CategoryDrugs = useMemo(() => {
    if (selectedDrugCategory === 'todas') return allCombinedDrugs.slice(0, 30);
    if (selectedDrugCategory === 'personalizados') return customDrugs;
    return DEFAULT_DRUGS[selectedDrugCategory] || [];
  }, [selectedDrugCategory, allCombinedDrugs, customDrugs]);

  // Step 3: Indications drugs search & category
  const indicationsSearchedDrugs = useMemo(() => {
    if (!indicationsDrugSearch.trim()) return [];
    return searchDrugs(indicationsDrugSearch, customDrugs).slice(0, 16);
  }, [indicationsDrugSearch, customDrugs]);

  const indicationsCategoryDrugs = useMemo(() => {
    if (indicationsDrugCategory === 'todas') return allCombinedDrugs.slice(0, 30);
    if (indicationsDrugCategory === 'personalizados') return customDrugs;
    return DEFAULT_DRUGS[indicationsDrugCategory] || [];
  }, [indicationsDrugCategory, allCombinedDrugs, customDrugs]);

  // Inserción de fármaco en Paso 2 (Récipe): Agrega solo el fármaco al récipe y su posología prefijada a indicaciones
  const handleInsertDrug = (drug: DrugItem) => {
    const currentRp = recipe.rp ? recipe.rp.trim() : '';
    const lines = currentRp ? currentRp.split('\n').filter((l: string) => l.trim().length > 0) : [];
    const nextNumber = lines.length + 1;
    
    // En el récipe: Solo el fármaco y su presentación
    const newRpEntry = `${nextNumber}. ${drug.name} (${drug.presentation})`;
    const updatedRp = currentRp ? `${currentRp}\n${newRpEntry}` : newRpEntry;
    onChangeRecipe({ rp: updatedRp });

    // En las indicaciones: Prefijamos la posología detallada
    const newIndication = `• ${drug.name}: ${drug.instructions}`;
    const currentInd = localIndications.generalInstructions ? localIndications.generalInstructions.trim() : '';
    const updatedInd = currentInd ? `${currentInd}\n${newIndication}` : newIndication;
    updateIndicationsField('generalInstructions', updatedInd);

    setCopyFeedback(`✓ ${drug.name} añadido al récipe e indicaciones`);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Inserción directa de medicamento en Paso 4 (Final del Récipe)
  const handleQuickAddDrugInStep4 = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const currentRp = recipe.rp ? recipe.rp.trim() : '';
    const lines = currentRp ? currentRp.split('\n').filter((l: string) => l.trim().length > 0) : [];
    const nextNumber = lines.length + 1;
    const newEntry = `${nextNumber}. ${clean}`;
    const updatedRp = currentRp ? `${currentRp}\n${newEntry}` : newEntry;
    onChangeRecipe({ rp: updatedRp });

    // Sincronizar automáticamente con las indicaciones
    const currentInd = localIndications.generalInstructions ? localIndications.generalInstructions.trim() : '';
    const newInd = `• ${clean}: Tomar según posología médica indicada.`;
    const updatedInd = currentInd ? `${currentInd}\n${newInd}` : newInd;
    updateIndicationsField('generalInstructions', updatedInd);

    setCopyFeedback(`✓ "${clean}" añadido al récipe e indicaciones`);
    setTimeout(() => setCopyFeedback(null), 2500);
    setStep4QuickDrugText('');
  };

  // Inserción de posología directa en Paso 3 (Indicaciones)
  const handleInsertPosologyToIndications = (text: string) => {
    const current = localIndications.generalInstructions ? localIndications.generalInstructions.trim() : '';
    const updated = current ? `${current}\n${text}` : text;
    updateIndicationsField('generalInstructions', updated);
    setCopyFeedback('✓ Posología añadida a indicaciones');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Inserción de dieta o reposo rápido
  const handleInsertDietOrRest = (text: string) => {
    const current = localIndications.dietAndRest ? localIndications.dietAndRest.trim() : '';
    const updated = current ? `${current} ${text}` : text;
    updateIndicationsField('dietAndRest', updated);
    setCopyFeedback('✓ Recomendación añadida');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Inserción de signo de alarma rápido
  const handleInsertAlarmSign = (text: string) => {
    const current = localIndications.alarmSigns ? localIndications.alarmSigns.trim() : '';
    const updated = current ? `${current} ${text}` : text;
    updateIndicationsField('alarmSigns', updated);
    setCopyFeedback('✓ Signo de alarma añadido');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Sincronizar automáticamente los fármacos de Rp con la hoja de indicaciones
  const syncIndicationsWithRecipeText = (rpText: string, forceOverwrite = false) => {
    if (!rpText || !rpText.trim()) return;

    const lines = rpText.split('\n').filter((l: string) => l.trim().length > 0);
    if (lines.length === 0) return;

    const currentInstructions = localIndications.generalInstructions?.trim() || '';

    // Si está vacío o se pide forzar sobrescritura completa:
    if (!currentInstructions || forceOverwrite) {
      const generated: string[] = [];
      lines.forEach((line: string) => {
        const cleanLine = line.replace(/^\d+[\.\-\)]\s*/, '').trim();
        if (!cleanLine) return;
        const matches = searchDrugs(cleanLine.split(' ')[0] || cleanLine, customDrugs);
        if (matches.length > 0) {
          generated.push(`• ${cleanLine}: ${matches[0].instructions}`);
        } else {
          generated.push(`• ${cleanLine}: Tomar según posología médica indicada.`);
        }
      });
      if (generated.length > 0) {
        updateIndicationsField('generalInstructions', generated.join('\n'));
      }
      return;
    }

    // Si el médico ya escribió o modificó texto, respetar sus cambios y añadir solo los nuevos:
    const newItems: string[] = [];
    lines.forEach((line: string) => {
      const cleanLine = line.replace(/^\d+[\.\-\)]\s*/, '').trim();
      if (!cleanLine) return;
      const drugKey = cleanLine.split(' ')[0].toLowerCase();
      if (!currentInstructions.toLowerCase().includes(drugKey)) {
        const matches = searchDrugs(cleanLine.split(' ')[0] || cleanLine, customDrugs);
        if (matches.length > 0) {
          newItems.push(`• ${cleanLine}: ${matches[0].instructions}`);
        } else {
          newItems.push(`• ${cleanLine}: Tomar según posología médica indicada.`);
        }
      }
    });

    if (newItems.length > 0) {
      const merged = `${currentInstructions}\n${newItems.join('\n')}`;
      updateIndicationsField('generalInstructions', merged);
    }
  };

  // Generar instrucciones sugeridas basadas en el Rp con búsqueda inteligente en el catálogo
  const handleAutoFillIndicationsFromRp = () => {
    if (!recipe.rp || !recipe.rp.trim()) {
      setCopyFeedback('⚠️ Escriba primero fármacos en el récipe');
      setTimeout(() => setCopyFeedback(null), 2500);
      return;
    }
    syncIndicationsWithRecipeText(recipe.rp, true);
    setCopyFeedback('✓ Fármacos e indicaciones sincronizados');
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // =========================================================
  // EXPORTACIONES Y DESCARGAS
  // =========================================================

  // 1. Descarga en 1 Sola Hoja (Landscape Letter 2 en 1: Caso A o Caso B)
  const handleDownloadDualPdfDirect = async () => {
    try {
      const errorMsg = await validateDoctorProfileAsync();
      if (errorMsg) {
        setValidationErrorModal(errorMsg);
        return;
      }
      setIsExporting(true);
      setActivePrintMode('dual');
      const filename = buildDocumentPdfFilename(
        'récipe e indicaciones',
        recipe.patientName || 'Paciente',
        recipe.date || new Date().toLocaleDateString('es-ES')
      );
      const success = await exportElementAsPDF(printableDualRef.current, filename);
      if (!success) {
        window.print();
      }
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Descarga directa del Récipe individual (1 Hoja o 1/2 Hoja)
  const handleDownloadRecipePdfDirect = async () => {
    try {
      if (onDownloadPdf) {
        await onDownloadPdf();
        return;
      }
      setIsExporting(true);
      setActivePrintMode('recipe');
      const filename = buildDocumentPdfFilename('récipe', recipe.patientName || 'Paciente', recipe.date || new Date().toLocaleDateString('es-ES'));
      const success = await exportElementAsPDF(printableRecipeRef.current, filename);
      if (!success) {
        window.print();
      }
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // 2-B. Descarga directa de Hoja Carta Completa con 4 copias del récipe (para recortar)
  const handleDownloadFourInSheetDirect = async () => {
    try {
      setIsExporting(true);
      setActivePrintMode('fourInSheet');
      const filename = buildDocumentPdfFilename('récipe 4 en 1', recipe.patientName || 'Paciente', recipe.date || new Date().toLocaleDateString('es-ES'));
      const success = await exportElementAsPDF(printableFourInSheetRef.current, filename);
      if (!success) {
        window.print();
      }
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Descarga directa de las Indicaciones individuales (1 Hoja)
  const handleDownloadIndicationsPdfDirect = async () => {
    try {
      if (onDownloadPdf) {
        await onDownloadPdf();
        return;
      }
      setIsExporting(true);
      setActivePrintMode('indications');
      const filename = buildDocumentPdfFilename('indicaciones', recipe.patientName || 'Paciente', recipe.date || new Date().toLocaleDateString('es-ES'));
      const success = await exportElementAsPDF(printableIndicationsRef.current, filename);
      if (!success) {
        window.print();
      }
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // 4. Impresión física inmediata con asignación garantizada de título para 'Guardar como PDF'
  const handlePrintSpecific = (tab: 'recipe' | 'indications', printFourCopies: boolean = false) => {
    setFinalPreviewTab(tab);
    setPrintFourInSheet(printFourCopies);
    if (printFourCopies) {
      setActivePrintMode('fourInSheet');
    } else if (tab === 'recipe') {
      setActivePrintMode('recipe');
    } else {
      setActivePrintMode('indications');
    }

    const pName = recipe.patientName || 'Carlos leal';
    const pDate = recipe.date || '14/10/26';
    const docName = tab === 'recipe' ? (printFourCopies ? 'récipe 4 en 1' : 'récipe') : 'indicaciones';
    const cleanTitle = buildDocumentPdfFilename(docName, pName, pDate).replace(/\.pdf$/i, '');
    const oldTitle = document.title;
    document.title = cleanTitle;

    const restoreTitle = () => {
      document.title = oldTitle;
      setPrintFourInSheet(false);
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);

    setTimeout(() => {
      window.print();
    }, 180);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center pb-12 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* TOP BANNER & PROGRESS NAVIGATION */}
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
                <span className="hidden sm:inline">Inicio</span>
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Asistente Guiado Progresivo</span>
              </span>
              <span className="text-xs text-slate-500 font-bold hidden md:inline">
                {config.doctorName || 'Dr. Carlos Leal'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {onOpenPreviewModal && (
              <button
                type="button"
                onClick={onOpenPreviewModal}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-slate-700"
                title="Ver plantilla y formato con membrete, firma y sellos"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ver Formato Base</span>
              </button>
            )}



            {onClearRecipeToBlank && (
              <button
                type="button"
                onClick={onClearRecipeToBlank}
                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer border border-rose-200"
                title="Limpiar datos y empezar de nuevo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 4-Step Visual Progress Bar */}
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
                {recipe.patientName ? recipe.patientName.split(' ')[0] : 'Datos'}
              </span>
            </div>
          </button>

          {/* Paso 2: Prescripción (Rp.) */}
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
                2. Récipe (Rp.)
              </span>
              <span className={`text-[9px] sm:text-[10px] block truncate ${currentStep === 2 ? 'text-blue-100' : 'text-slate-500'}`}>
                Fármacos
              </span>
            </div>
          </button>

          {/* Paso 3: Indicaciones */}
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
                3. Indicaciones
              </span>
              <span className={`text-[9px] sm:text-[10px] block truncate ${currentStep === 3 ? 'text-blue-100' : 'text-slate-500'}`}>
                Posología
              </span>
            </div>
          </button>

          {/* Paso 4: Descarga / Impresión */}
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
                4. Final
              </span>
              <span className={`text-[9px] sm:text-[10px] block truncate ${currentStep === 4 ? 'text-emerald-100' : 'text-slate-500'}`}>
                PDF / Imprimir
              </span>
            </div>
          </button>

        </div>
      </div>

      {/* Floating Copy Feedback Banner */}
      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-2 text-xs font-black animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 1: DATOS DEL PACIENTE                                */}
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
                Ingrese la información del paciente o búsquelo en su banco registrado:
              </p>
            </div>

            {onOpenPatientBank && (
              <button
                type="button"
                onClick={onOpenPatientBank}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition-colors border border-blue-200 cursor-pointer"
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span>Ver Banco de Pacientes</span>
              </button>
            )}
          </div>

          {/* Fast Search & Autocomplete from Existing Patients */}
          {existingPatients.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-4 space-y-2">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Búsqueda Rápida de Paciente Existente:</span>
              </span>

              <div className="relative">
                <input
                  type="text"
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  placeholder="Escriba nombre, apellido, cédula o teléfono..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 shadow-2xs"
                />
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                {patientSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPatientSearchQuery('')}
                    className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {matchingPatients.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {matchingPatients.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (onSelectExistingPatient) {
                          onSelectExistingPatient(p);
                        } else {
                          onChangeRecipe({
                            patientName: p.patientName,
                            patientCI: p.patientCI,
                            patientAge: p.patientAge,
                            patientPhone: p.patientPhone,
                            diagnosis: p.diagnosis || recipe.diagnosis,
                          });
                        }
                        setPatientSearchQuery('');
                        setCopyFeedback(`✓ Paciente "${p.patientName}" cargado`);
                        setTimeout(() => setCopyFeedback(null), 2000);
                      }}
                      className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div>
                        <span className="font-black text-xs text-slate-900 group-hover:text-blue-700 block truncate">
                          {p.patientName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          C.I.: {p.patientCI || 'S/C'} · {p.patientAge || '--'} · 📞 {p.patientPhone || 'S/T'}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg">
                        Cargar
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Fields: Grandes y Cómodos para Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            
            {/* 1. Nombre y Apellido */}
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Nombre y Apellido del Paciente: *
              </label>
              <input
                type="text"
                value={recipe.patientName}
                onChange={(e) => onChangeRecipe({ patientName: e.target.value })}
                placeholder="Ej: María Elena Rodríguez"
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base sm:text-lg font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 2. Cédula de Identidad */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Cédula de Identidad (C.I.):
              </label>
              <input
                type="text"
                value={recipe.patientCI}
                onChange={(e) => onChangeRecipe({ patientCI: e.target.value })}
                placeholder="Ej: V-18.456.789"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 3. Edad */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Edad del Paciente:
              </label>
              <input
                type="text"
                value={recipe.patientAge}
                onChange={(e) => onChangeRecipe({ patientAge: e.target.value })}
                placeholder="Ej: 34 años / 5 meses"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 4. Teléfono WhatsApp */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1 flex items-center gap-1 text-emerald-700">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Teléfono WhatsApp (para envío directo):</span>
              </label>
              <input
                type="tel"
                value={recipe.patientPhone || ''}
                onChange={(e) => onChangeRecipe({ patientPhone: e.target.value })}
                placeholder="Ej: +58 412 1234567"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 5. Fecha de Consulta */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Fecha del Récipe:</span>
              </label>
              <input
                type="text"
                value={recipe.date}
                onChange={(e) => onChangeRecipe({ date: e.target.value })}
                placeholder="DD/MM/AAAA"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 6. Diagnóstico Clínico */}
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Diagnóstico / Motivo de Consulta:
              </label>
              <input
                type="text"
                value={recipe.diagnosis || ''}
                onChange={(e) => onChangeRecipe({ diagnosis: e.target.value })}
                placeholder="Ej: Faringoamigdalitis aguda bacteriana / Lumbalgia mecánica"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

          </div>

          {/* Action Button: Continuar a Prescripción */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>Continuar a Prescripción del Récipe (Rp.)</span>
              <ArrowRight className="w-5 h-5 text-cyan-200" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 2: PRESCRIPCIÓN DE FÁRMACOS (Rp.)                    */}
      {/* ========================================================= */}
      {currentStep === 2 && (
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 space-y-5 animate-in fade-in">
          
          {/* Patient Quick Reminder Bar */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                👤
              </span>
              <div>
                <span className="font-black text-sm text-slate-900 block leading-tight">
                  {recipe.patientName || 'Paciente sin nombre'}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  CI: {recipe.patientCI || 'S/C'} · {recipe.patientAge || 'Edad no ind.'} · {recipe.diagnosis || 'Consulta'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-3 py-1 bg-white hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors cursor-pointer"
            >
              ✏️ Editar Datos
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Pill className="w-6 h-6 text-blue-600" />
                <span>Paso 2: Prescripción de Fármacos (Rp.)</span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Escriba los medicamentos o elija directamente de su catálogo de fármacos con 1 toque:
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddCustomModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Medicamento</span>
            </button>
          </div>

          {/* Desplegable de Posologías y Catálogo de Fármacos en Paso 2 */}
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            
            {/* Header / Toggle Button */}
            <button
              type="button"
              onClick={() => setIsStep2CatalogOpen(!isStep2CatalogOpen)}
              className="w-full p-3.5 flex items-center justify-between bg-slate-900 hover:bg-slate-850 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  💊
                </span>
                <div>
                  <span className="font-black text-xs sm:text-sm text-white block">
                    Catálogo de Fármacos, Posologías y Fórmulas
                  </span>
                  <span className="text-[11px] text-blue-300 font-medium">
                    Toque para abrir el banco de posologías predefinidas e insertarlas en 1 clic
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  {isStep2CatalogOpen ? 'Ocultar' : 'Ver Catálogo'}
                </span>
                {isStep2CatalogOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Collapsible Panel Content */}
            {isStep2CatalogOpen && (
              <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 space-y-3">
                
                {/* Sub-tabs Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setStep2CatalogTab('drugs')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      step2CatalogTab === 'drugs'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Pill className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Catálogo y Posología</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep2CatalogTab('schedules')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      step2CatalogTab === 'schedules'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Horarios / Fórmulas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep2CatalogTab('diet')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      step2CatalogTab === 'diet'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>🥗 Dieta y Reposo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep2CatalogTab('alarms')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      step2CatalogTab === 'alarms'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>⚠️ Signos de Alarma</span>
                  </button>
                </div>

                {/* Sub-tab 1: Catálogo de Fármacos con Posología */}
                {step2CatalogTab === 'drugs' && (
                  <div className="space-y-2.5">
                    
                    {/* Specialty Category Selector */}
                    <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => { setSelectedDrugCategory('todas'); setDrugSearchQuery(''); }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                          selectedDrugCategory === 'todas' && !drugSearchQuery
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        🌟 Todas ({allCombinedDrugs.length})
                      </button>

                      {customDrugs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => { setSelectedDrugCategory('personalizados'); setDrugSearchQuery(''); }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                            selectedDrugCategory === 'personalizados' && !drugSearchQuery
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                          }`}
                        >
                          ⭐ Mis Fármacos ({customDrugs.length})
                        </button>
                      )}

                      {Object.keys(SPECIALTY_LABELS).map((cat) => (
                        <button
                          key={`step2-cat-${cat}`}
                          type="button"
                          onClick={() => { setSelectedDrugCategory(cat); setDrugSearchQuery(''); }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                            selectedDrugCategory === cat && !drugSearchQuery
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {SPECIALTY_LABELS[cat] || cat}
                        </button>
                      ))}
                    </div>

                    {/* Drug Search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={drugSearchQuery}
                        onChange={(e) => setDrugSearchQuery(e.target.value)}
                        placeholder="🔍 Buscar medicamento por nombre o principio activo en su catálogo..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                      />
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    </div>

                    {/* Drug List with direct insert buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                      {(drugSearchQuery ? step2SearchedDrugs : step2CategoryDrugs).map((drug, i) => (
                        <div
                          key={`step2-drug-${drug.name}-${i}`}
                          className="p-2.5 bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-xl flex flex-col justify-between gap-1.5 transition-colors"
                        >
                          <div>
                            <span className="font-black text-xs text-white block truncate">
                              {drug.name} ({drug.presentation})
                            </span>
                            <span className="text-[11px] text-blue-300 block line-clamp-2 mt-0.5 leading-snug">
                              ↳ {drug.instructions}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => handleInsertDrug(drug)}
                              className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Añadir medicamento al récipe y preconfigurar indicación"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Añadir al Récipe (Rp)</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

                {/* Sub-tab 2: Horarios / Fórmulas de Posología Frecuentes */}
                {step2CatalogTab === 'schedules' && (
                  <div className="space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold block">
                      Toque para agregar fórmulas de horarios o textos recomendados al récipe:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto">
                      {[
                        'Tomar 1 cápsula vía oral cada 8 horas por 7 días con las comidas.',
                        'Tomar 1 comprimido vía oral cada 12 horas por 5 días.',
                        'Tomar 1 tableta diaria en ayunas, 30 minutos antes del desayuno por 30 días.',
                        'Tomar 1 tableta diaria en la noche antes de acostarse a dormir.',
                        'Tomar 1 tableta cada 8 horas condicionado a dolor moderado a intenso o fiebre.',
                        'Aplicar una capa fina en la zona afectada cada 12 horas por 7 a 10 días.',
                        'Disolver 1 comprimido bucodispersable sobre la lengua cada 8 horas si presenta náuseas.',
                        'Inhalar 2 puff cada 8 horas con cámara espaciadora por 7 días.',
                        'Tomar 5 ml por vía oral cada 8 horas por 5 días (agitar antes de usar).'
                      ].map((formula, i) => (
                        <button
                          key={`sched2-${i}`}
                          type="button"
                          onClick={() => {
                            const current = recipe.rp ? recipe.rp.trim() : '';
                            onChangeRecipe({ rp: current ? `${current}\n↳ ${formula}` : `↳ ${formula}` });
                            setCopyFeedback('✓ Horario añadido al cuerpo de Rp.');
                            setTimeout(() => setCopyFeedback(null), 2000);
                          }}
                          className="p-2 bg-slate-900 hover:bg-blue-950/80 border border-slate-800 hover:border-blue-500 rounded-xl text-left text-xs text-slate-200 hover:text-white font-medium transition-all cursor-pointer flex items-start gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{formula}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-tab 3: Dieta y Reposo Rápidos */}
                {step2CatalogTab === 'diet' && (
                  <div className="space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold block">
                      Toque para agregar recomendaciones rápidas de dieta o reposo:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        'Dieta blanda baja en grasas y condimentos irritantes.',
                        'Abundante consumo de líquidos (2 a 3 litros de agua diarios).',
                        'Dieta hiposódica (baja en sal, embutidos y alimentos procesados).',
                        'Dieta para paciente diabético (evitar azúcares refinados y harinas).',
                        'Reposo relativo en el hogar por 48 a 72 horas. Evitar esfuerzos físicos.',
                        'Reposo absoluto en cama por indicación médica estricta.'
                      ].map((dietItem, i) => (
                        <button
                          key={`diet2-${i}`}
                          type="button"
                          onClick={() => handleInsertDietOrRest(dietItem)}
                          className="p-2 bg-slate-900 hover:bg-blue-950/80 border border-slate-800 hover:border-blue-500 rounded-xl text-left text-xs text-slate-200 hover:text-white font-medium transition-all cursor-pointer flex items-start gap-1.5"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{dietItem}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-tab 4: Signos de Alarma Rápidos */}
                {step2CatalogTab === 'alarms' && (
                  <div className="space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold block">
                      Toque para configurar signos de alarma de inmediato:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        'Fiebre persistente >38.5°C que no cede tras 48 horas de medicación.',
                        'Dificultad respiratoria, dolor torácico opresivo o falta de aire.',
                        'Vómitos incoercibles o intolerancia total a la vía oral.',
                        'Mareo severo, confusión, pérdida del conocimiento o sangrado inusual.',
                        'Reacción alérgica: erupción cutánea, picazón intensa o hinchazón facial.'
                      ].map((alarmItem, i) => (
                        <button
                          key={`alarm2-${i}`}
                          type="button"
                          onClick={() => handleInsertAlarmSign(alarmItem)}
                          className="p-2 bg-slate-900 hover:bg-amber-950/80 border border-slate-800 hover:border-amber-500 rounded-xl text-left text-xs text-slate-200 hover:text-white font-medium transition-all cursor-pointer flex items-start gap-1.5"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{alarmItem}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Rp Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
                <span className="text-base text-blue-600 font-serif font-black">{config.rxTitle || 'Rp.'}</span>
                <span>Cuerpo de la Prescripción Médica (Medicamentos y Presentación): *</span>
              </label>
              <button
                type="button"
                onClick={() => onChangeRecipe({ rp: '' })}
                className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
              >
                Vaciar texto
              </button>
            </div>
            <textarea
              rows={7}
              value={recipe.rp}
              onChange={(e) => onChangeRecipe({ rp: e.target.value })}
              placeholder="1. Amoxicilina + Ácido Clavulánico 875/125mg (Comprimidos)&#10;2. Ibuprofeno 600mg (Tabletas recubiertas)&#10;3. Omeprazol 20mg (Cápsulas)"
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all leading-relaxed shadow-inner placeholder:text-slate-400"
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
              <span>Volver a Paciente</span>
            </button>

            {/* Continúa directamente a Indicaciones */}
            <button
              type="button"
              onClick={() => {
                if (recipe.rp && recipe.rp.trim()) {
                  handleAutoFillIndicationsFromRp();
                }
                setCurrentStep(3);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-600/25 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>Continuar a Indicaciones Médicas</span>
              <ArrowRight className="w-5 h-5 text-cyan-200" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 3: HOJA DE INDICACIONES (Revisión y Ajuste)          */}
      {/* ========================================================= */}
      {currentStep === 3 && (
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 space-y-5 animate-in fade-in">
          
          {/* Patient Quick Reminder Bar */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                📋
              </span>
              <div>
                <span className="font-black text-sm text-slate-900 block leading-tight">
                  Indicaciones para: {localIndications.patientName || 'Paciente sin nombre'}
                </span>
                <span className="text-xs text-indigo-700 font-semibold">
                  Fecha: {localIndications.date || 'Hoy'} · Dx: {localIndications.diagnosis || 'Consulta Médica'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoFillIndicationsFromRp}
              className="px-3 py-1.5 bg-white hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Generar posologías automáticas basadas en el récipe redactado"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sincronizar con Rp</span>
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-indigo-600" />
                <span>Paso 3: Indicaciones Médicas y Posología</span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Revise o ajuste las instrucciones de medicación, horarios, dieta y signos de alarma:
              </p>
            </div>
          </div>

          {/* Desplegable de Posologías y Catálogo de Fármacos */}
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            
            {/* Header / Toggle Button */}
            <button
              type="button"
              onClick={() => setIsIndicationsCatalogOpen(!isIndicationsCatalogOpen)}
              className="w-full p-3.5 flex items-center justify-between bg-slate-900 hover:bg-slate-850 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                  💊
                </span>
                <div>
                  <span className="font-black text-xs sm:text-sm text-white block">
                    Catálogo de Fármacos, Posologías y Fórmulas
                  </span>
                  <span className="text-[11px] text-indigo-300 font-medium">
                    Toque para abrir el banco de posologías predefinidas e insertarlas en 1 clic
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  {isIndicationsCatalogOpen ? 'Ocultar' : 'Ver Catálogo'}
                </span>
                {isIndicationsCatalogOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Collapsible Panel Content */}
            {isIndicationsCatalogOpen && (
              <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 space-y-3">
                
                {/* Sub-tabs Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setIndicationsCatalogTab('drugs')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      indicationsCatalogTab === 'drugs'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Pill className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Catálogo y Posología</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIndicationsCatalogTab('schedules')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      indicationsCatalogTab === 'schedules'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Horarios / Fórmulas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIndicationsCatalogTab('diet')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      indicationsCatalogTab === 'diet'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>🥗 Dieta y Reposo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIndicationsCatalogTab('alarms')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      indicationsCatalogTab === 'alarms'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>⚠️ Signos de Alarma</span>
                  </button>
                </div>

                {/* Sub-tab 1: Catálogo de Fármacos con Posología */}
                {indicationsCatalogTab === 'drugs' && (
                  <div className="space-y-2.5">
                    
                    {/* Specialty Category Selector */}
                    <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => { setIndicationsDrugCategory('todas'); setIndicationsDrugSearch(''); }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                          indicationsDrugCategory === 'todas' && !indicationsDrugSearch
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        🌟 Todas ({allCombinedDrugs.length})
                      </button>

                      {customDrugs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => { setIndicationsDrugCategory('personalizados'); setIndicationsDrugSearch(''); }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                            indicationsDrugCategory === 'personalizados' && !indicationsDrugSearch
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                          }`}
                        >
                          ⭐ Mis Fármacos ({customDrugs.length})
                        </button>
                      )}

                      {Object.keys(SPECIALTY_LABELS).map((cat) => (
                        <button
                          key={`ind-${cat}`}
                          type="button"
                          onClick={() => { setIndicationsDrugCategory(cat); setIndicationsDrugSearch(''); }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                            indicationsDrugCategory === cat && !indicationsDrugSearch
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {SPECIALTY_LABELS[cat] || cat}
                        </button>
                      ))}
                    </div>

                    {/* Drug Search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={indicationsDrugSearch}
                        onChange={(e) => setIndicationsDrugSearch(e.target.value)}
                        placeholder="🔍 Buscar posología por medicamento o principio activo..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
                      />
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    </div>

                    {/* Drug List with direct posology buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                      {(indicationsDrugSearch ? indicationsSearchedDrugs : indicationsCategoryDrugs).map((drug, i) => (
                        <div
                          key={`ind-drug-${drug.name}-${i}`}
                          className="p-2.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-xl flex flex-col justify-between gap-1.5 transition-colors"
                        >
                          <div>
                            <span className="font-black text-xs text-white block truncate">
                              {drug.name} ({drug.presentation})
                            </span>
                            <span className="text-[11px] text-indigo-300 block line-clamp-2 mt-0.5 leading-snug">
                              ↳ {drug.instructions}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => handleInsertPosologyToIndications(`• ${drug.name}: ${drug.instructions}`)}
                              className="flex-1 py-1 px-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Añadir esta posología a las indicaciones"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Añadir Posología</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateIndicationsField('generalInstructions', `• ${drug.name}: ${drug.instructions}`);
                                setCopyFeedback(`✓ Posología de ${drug.name} asignada`);
                                setTimeout(() => setCopyFeedback(null), 2000);
                              }}
                              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                              title="Usar solo esta posología"
                            >
                              Solo este
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

                {/* Sub-tab 2: Horarios / Fórmulas de Posología Frecuentes */}
                {indicationsCatalogTab === 'schedules' && (
                  <div className="space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold block">
                      Toque cualquier fórmula para insertarla al texto de indicaciones:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto">
                      {[
                        'Tomar 1 cápsula vía oral cada 8 horas por 7 días con las comidas.',
                        'Tomar 1 comprimido vía oral cada 12 horas por 5 días.',
                        'Tomar 1 tableta diaria en ayunas, 30 minutos antes del desayuno por 30 días.',
                        'Tomar 1 tableta diaria en la noche antes de acostarse a dormir.',
                        'Tomar 1 tableta cada 8 horas condicionado a dolor moderado a intenso o fiebre.',
                        'Aplicar una capa fina en la zona afectada cada 12 horas por 7 a 10 días.',
                        'Disolver 1 comprimido bucodispersable sobre la lengua cada 8 horas si presenta náuseas.',
                        'Inhalar 2 puff cada 8 horas con cámara espaciadora por 7 días.',
                        'Tomar 5 ml por vía oral cada 8 horas por 5 días (agitar antes de usar).'
                      ].map((formula, i) => (
                        <button
                          key={`sched-${i}`}
                          type="button"
                          onClick={() => handleInsertPosologyToIndications(`• ${formula}`)}
                          className="p-2 bg-slate-900 hover:bg-indigo-950/80 border border-slate-800 hover:border-indigo-500 rounded-xl text-left text-xs text-slate-200 hover:text-white font-medium transition-all cursor-pointer flex items-start gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{formula}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-tab 3: Dieta y Reposo Rápidos */}
                {indicationsCatalogTab === 'diet' && (
                  <div className="space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold block">
                      Toque para agregar a las recomendaciones de dieta y reposo:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        'Dieta blanda baja en grasas y condimentos irritantes.',
                        'Abundante consumo de líquidos (2 a 3 litros de agua diarios).',
                        'Dieta hiposódica (baja en sal, embutidos y alimentos procesados).',
                        'Dieta para paciente diabético (evitar azúcares refinados y harinas).',
                        'Reposo relativo en el hogar por 48 a 72 horas. Evitar esfuerzos físicos.',
                        'Reposo absoluto en cama por indicación médica estricta.'
                      ].map((dietItem, i) => (
                        <button
                          key={`diet-${i}`}
                          type="button"
                          onClick={() => handleInsertDietOrRest(dietItem)}
                          className="p-2 bg-slate-900 hover:bg-indigo-950/80 border border-slate-800 hover:border-indigo-500 rounded-xl text-left text-xs text-slate-200 hover:text-white font-medium transition-all cursor-pointer flex items-start gap-1.5"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{dietItem}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-tab 4: Signos de Alarma Rápidos */}
                {indicationsCatalogTab === 'alarms' && (
                  <div className="space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold block">
                      Toque para agregar a los signos de alarma y advertencias:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        'Fiebre persistente >38.5°C que no cede tras 48 horas de medicación.',
                        'Dificultad respiratoria, dolor torácico opresivo o falta de aire.',
                        'Vómitos incoercibles o intolerancia total a la vía oral.',
                        'Mareo severo, confusión, pérdida del conocimiento o sangrado inusual.',
                        'Reacción alérgica: erupción cutánea, picazón intensa o hinchazón facial.'
                      ].map((alarmItem, i) => (
                        <button
                          key={`alarm-${i}`}
                          type="button"
                          onClick={() => handleInsertAlarmSign(alarmItem)}
                          className="p-2 bg-slate-900 hover:bg-amber-950/80 border border-slate-800 hover:border-amber-500 rounded-xl text-left text-xs text-slate-200 hover:text-white font-medium transition-all cursor-pointer flex items-start gap-1.5"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{alarmItem}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Form Indicaciones */}
          <div className="space-y-4">
            
            {/* 1. Instrucciones de Medicación */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1">
                Instrucciones de Medicación y Horarios: *
              </label>
              <textarea
                rows={6}
                value={localIndications.generalInstructions}
                onChange={(e) => updateIndicationsField('generalInstructions', e.target.value)}
                placeholder="• Amoxicilina + Ác. Clavulánico: Tomar 1 comprimido a las 8:00 AM y 8:00 PM por 7 días.&#10;• Ibuprofeno: Tomar 1 tableta cada 8 horas solo en caso de presentar dolor o fiebre."
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all leading-relaxed shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 2. Dieta, Hidratación y Reposo */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Recomendaciones de Dieta, Hidratación y Reposo:</span>
              </label>
              <textarea
                rows={3}
                value={localIndications.dietAndRest}
                onChange={(e) => updateIndicationsField('dietAndRest', e.target.value)}
                placeholder="Dieta blanda baja en grasas y condimentos. Consumo de 2 a 3 litros de agua diarios. Reposo relativo por 48 horas."
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 3. Signos de Alarma */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1 flex items-center gap-1.5 text-amber-700">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Signos de Alarma y Advertencias al Paciente:</span>
              </label>
              <input
                type="text"
                value={localIndications.alarmSigns}
                onChange={(e) => updateIndicationsField('alarmSigns', e.target.value)}
                placeholder="Fiebre >38.5°C, dificultad respiratoria, vómitos incoercibles o mareo severo -> Acudir a emergencias."
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
              />
            </div>

            {/* 4. Próxima Cita / Control */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1 flex items-center gap-1.5 text-teal-700">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Próximo Control / Cita Médica:</span>
              </label>
              <input
                type="text"
                value={localIndications.nextAppointment}
                onChange={(e) => updateIndicationsField('nextAppointment', e.target.value)}
                placeholder="Control en consulta médica en 7 días para reevaluación clínica."
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner placeholder:text-slate-400"
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
              <span>Volver a Prescripción</span>
            </button>

            {/* Continúa a la Vista Final & Descarga de PDF */}
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-7 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>Ver Formatos y Descargar PDF</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* PASO 4: VISTA FINAL & DESCARGA DIRECTA DE PDF             */}
      {/* ========================================================= */}
      {currentStep === 4 && (
        <div className="w-full space-y-4 animate-in fade-in">
          
          {/* Main Action Control Center Bar: SOLO los 3 íconos y la pestaña a indicaciones */}
          <div className="w-full bg-slate-900 text-white rounded-2xl border border-slate-800 p-2.5 sm:p-3 shadow-xl no-print flex flex-wrap items-center justify-between gap-2.5 text-xs">
            {/* Pestaña de Seguir a Indicaciones / Volver al Récipe */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFinalPreviewTab(finalPreviewTab === 'recipe' ? 'indications' : 'recipe')}
                className={`px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                  finalPreviewTab === 'recipe'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
                    : 'bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white'
                }`}
                title={finalPreviewTab === 'recipe' ? "Pasar a la hoja de indicaciones" : "Volver a ver el récipe"}
              >
                {finalPreviewTab === 'recipe' ? (
                  <>
                    <span>Seguir a Indicaciones</span>
                    <ArrowRight className="w-4 h-4 text-cyan-200" />
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4 text-cyan-200" />
                    <span>Volver a Récipe</span>
                  </>
                )}
              </button>
            </div>

            {/* Los 3 Íconos Esenciales: [📥 PDF] [💬 WhatsApp] [✉️ Correo] */}
            <div className="flex items-center gap-2">
              {/* [📥 PDF] */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    if (onDownloadPdf) {
                      await onDownloadPdf();
                    } else if (finalPreviewTab === 'recipe') {
                      await handleDownloadRecipePdfDirect();
                    } else {
                      await handleDownloadIndicationsPdfDirect();
                    }
                  } catch (err) {
                    console.error('Error al descargar PDF:', err);
                    window.print();
                  }
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border border-blue-400/30"
                title="Descargar PDF oficial"
              >
                <Download className="w-4 h-4 text-white" />
                <span>PDF</span>
              </button>

              {/* [💬 WhatsApp] */}
              <button
                type="button"
                onClick={() => {
                  exportAndSendWhatsAppBusiness({
                    element: finalPreviewTab === 'recipe' ? printableRecipeRef.current : printableIndicationsRef.current,
                    patientName: recipe.patientName || 'Paciente',
                    documentTitle: finalPreviewTab === 'recipe' ? 'Récipe Médico' : 'Indicaciones Médicas',
                    dateStr: recipe.date || new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    patientPhone: recipe.patientPhone,
                    doctorName: config.doctorName || 'Dr. Carlos Leal',
                    treatmentDetails: finalPreviewTab === 'recipe' ? (recipe.rp?.trim() || '') : (localIndications.generalInstructions?.trim() || ''),
                    documentType: finalPreviewTab === 'recipe' ? 'recipe' : 'indications',
                    recipe,
                    indications: localIndications,
                    config
                  });
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border border-emerald-400/40"
                title="Enviar por WhatsApp"
              >
                <span className="text-sm">📱</span>
                <span>WhatsApp</span>
              </button>

              {/* [✉️ Correo] */}
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border border-indigo-400/30"
                title="Enviar por Correo Electrónico"
              >
                <Mail className="w-4 h-4 text-white" />
                <span>Correo</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* VISTA 2: DOCUMENTO DE RÉCIPE INDIVIDUAL                   */}
          {/* ========================================================= */}
          <div className={`w-full flex flex-col items-center py-2 ${finalPreviewTab === 'recipe' ? 'block' : 'hidden'}`}>
            


            {/* Tarjeta del Récipe */}
            <div
              ref={printableRecipeRef}
              id="recipe-medico"
              data-testid="recibo-medico"
              className={`relative w-full max-w-[660px] min-h-[680px] p-5 sm:p-7 bg-white shadow-2xl rounded-2xl transition-all recipe-single-card recipe-single-container print-container border border-slate-200/90 ${textureClass} ${
                config.enforcePureBlackText ? 'enforce-pure-black' : ''
              } ${activePrintMode === 'recipe' && !printFourInSheet ? 'print:block' : 'print:hidden'}`}
              style={{
                backgroundColor: config.tonePapel || '#ffffff',
                border: borderStyle,
                borderRadius: config.docCornerRadius || '16px',
                boxSizing: 'border-box',
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
                      opacity: config.watermarkOpacity ?? 0.16,
                      width: `${config.watermarkScale || 50}%`,
                      transform: `rotate(${config.watermarkRotation || 0}deg)`,
                    }}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col justify-between h-full min-h-[640px]">
                <div>
                  <DocumentHeader
                    config={config}
                    compact={false}
                    hideHeader={false}
                    editableInline={true}
                    onUpdateField={(field, val) => onUpdateConfig?.({ [field]: val })}
                  />

                  {/* Barra Oficial de Paciente y Fecha */}
                  <div className="my-2.5 p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/90 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5 flex items-center gap-1.5">
                        <span className="font-bold text-slate-700 uppercase text-[10px] shrink-0">Paciente:</span>
                        <input
                          type="text"
                          value={recipe.patientName || ''}
                          onChange={(e) => onChangeRecipe({ patientName: e.target.value })}
                          placeholder="Nombre del Paciente"
                          className="w-full bg-transparent font-black text-slate-900 border-b border-dashed border-slate-300 focus:border-blue-600 outline-none text-xs sm:text-sm"
                        />
                      </div>
                      <div className="sm:col-span-3 flex items-center gap-1.5">
                        <span className="font-bold text-slate-700 uppercase text-[10px] shrink-0">C.I.:</span>
                        <input
                          type="text"
                          value={recipe.patientCI || ''}
                          onChange={(e) => onChangeRecipe({ patientCI: e.target.value })}
                          placeholder="Cédula"
                          className="w-full bg-transparent font-bold text-slate-900 border-b border-dashed border-slate-300 focus:border-blue-600 outline-none text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-1.5">
                        <span className="font-bold text-slate-700 uppercase text-[10px] shrink-0">Edad:</span>
                        <input
                          type="text"
                          value={recipe.patientAge || ''}
                          onChange={(e) => onChangeRecipe({ patientAge: e.target.value })}
                          placeholder="Edad"
                          className="w-full bg-transparent font-bold text-slate-900 border-b border-dashed border-slate-300 focus:border-blue-600 outline-none text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-1.5">
                        <span className="font-bold text-slate-700 uppercase text-[10px] shrink-0">Fecha:</span>
                        <input
                          type="text"
                          value={recipe.date || ''}
                          onChange={(e) => onChangeRecipe({ date: e.target.value })}
                          placeholder="DD/MM/AAAA"
                          className="w-full bg-transparent font-black text-slate-900 border-b border-dashed border-slate-300 focus:border-blue-600 outline-none text-xs text-right"
                        />
                      </div>
                      {recipe.diagnosis && (
                        <div className="sm:col-span-12 pt-1.5 mt-1 border-t border-slate-200/60 flex items-center gap-1.5">
                          <span className="text-slate-500 font-bold text-[10px] uppercase shrink-0">Diagnóstico:</span>
                          <input
                            type="text"
                            value={recipe.diagnosis || ''}
                            onChange={(e) => onChangeRecipe({ diagnosis: e.target.value })}
                            placeholder="Diagnóstico clínico (opcional)"
                            className="w-full bg-transparent font-semibold text-slate-800 border-b border-dashed border-slate-300 focus:border-blue-600 outline-none text-xs truncate"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span 
                        className={`${recipeSize === 'quarter' ? 'text-lg' : 'text-2xl'} font-serif font-black`}
                        style={{ color: config.rxTitleColor || config.primaryDocColor }}
                      >
                        {config.rxTitle || 'Rp.'}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Prescripción Facultativa
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onChangeRecipe({ rp: '' })}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-bold no-print cursor-pointer"
                      title="Borrar medicamentos"
                    >
                      Vaciar
                    </button>
                  </div>

                  {/* Edición directa en pantalla */}
                  <textarea
                    value={recipe.rp || ''}
                    onChange={(e) => {
                      const newRp = e.target.value;
                      onChangeRecipe({ rp: newRp });
                      syncIndicationsWithRecipeText(newRp);
                    }}
                    placeholder="1. Amoxicilina 875mg (Comprimidos)&#10;2. Ibuprofeno 600mg (Tabletas)&#10;Escriba o agregue los medicamentos..."
                    rows={Math.max(6, (recipe.rp?.split('\n').length || 1) + 2)}
                    className="w-full p-3 bg-white/80 rounded-xl border border-slate-300 focus:border-blue-600 focus:bg-white min-h-[160px] text-xs sm:text-sm font-semibold text-slate-900 outline-none leading-relaxed resize-y shadow-inner print:hidden transition-all focus:ring-2 focus:ring-blue-100"
                    style={{
                      fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                    }}
                  />

                  {/* Botón directo en el formato para agregar más medicamentos sin bloqueos */}
                  <div className="mt-2 flex items-center justify-between no-print gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = recipe.rp ? recipe.rp.trim() : '';
                        const lines = cur ? cur.split('\n').filter((l: string) => l.trim().length > 0) : [];
                        const nextNum = lines.length + 1;
                        const updated = cur ? `${cur}\n${nextNum}. ` : `${nextNum}. `;
                        onChangeRecipe({ rp: updated });
                        syncIndicationsWithRecipeText(updated);
                      }}
                      className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="Añadir una nueva línea de medicamento"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>+ Agregar Medicamento</span>
                    </button>

                    {recipe.rp && (
                      <span className="text-[11px] font-bold text-slate-500">
                        ✓ {recipe.rp.split('\n').filter((l: string) => l.trim().length > 0).length} fármaco(s) listados
                      </span>
                    )}
                  </div>

                  {/* Vista 100% fiel para PDF e Impresión (Garantiza que ningún medicamento se corte) */}
                  <div 
                    className="hidden print:block whitespace-pre-wrap font-semibold text-slate-900 leading-relaxed text-xs sm:text-sm py-1.5"
                    style={{
                      fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                    }}
                  >
                    {recipe.rp || 'Prescripción médica.'}
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-200">
                  <DocumentFooter
                    config={config}
                    compact={true}
                  />
                </div>
              </div>
            </div>

            {/* HOJA CARTA COMPLETA CON 4 COPIAS EN CUADRANTES (PARA IMPRIMIR Y RECORTAR EN 4) */}
            <div
              ref={printableFourInSheetRef}
              id="recipe-4copies-print-sheet"
              className={`w-full flex justify-center print-container ${printFourInSheet ? 'block' : 'hidden'} ${activePrintMode === 'fourInSheet' || printFourInSheet ? 'print:block' : 'print:hidden'} mt-4`}
            >
               <div
                className={`relative w-full max-w-[816px] h-[1056px] min-h-[1056px] max-h-[1056px] bg-white transition-all recipe-4en1-container shadow-2xl rounded-2xl border border-slate-200 ${textureClass}`}
                style={{
                  backgroundColor: config.tonePapel || '#ffffff',
                  border: borderStyle,
                  borderRadius: config.docCornerRadius || '16px',
                  width: '100%',
                  maxWidth: '816px',
                  height: '1056px',
                  minHeight: '1056px',
                  maxHeight: '1056px',
                  boxSizing: 'border-box',
                  padding: '10px',
                  overflow: 'hidden',
                }}
              >
                <div 
                  className="recipe-4en1-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
                    gap: '8px',
                    width: '100%',
                    height: 'calc(1056px - 20px)',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  {[0, 1, 2, 3].map((quadrantIdx) => (
                    <div
                      key={quadrantIdx}
                      className="relative border border-slate-200/90 rounded-xl p-2 bg-white shadow-2xs flex flex-col justify-between overflow-hidden recipe-quadrant-card"
                      style={{
                        width: '100%',
                        height: '100%',
                        maxHeight: '100%',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        transform: 'none',
                        margin: 0,
                      }}
                    >
                      <div className="relative z-10">
                        <DocumentHeader config={config} compact={true} editableInline={false} />
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 py-0.5 px-1.5 bg-slate-50/90 border border-slate-200/80 rounded-md text-[9px] my-1 leading-tight">
                          <div className="truncate">
                            <span className="font-bold text-slate-700">Pac: </span>
                            <span className="font-semibold text-slate-900">{recipe.patientName || 'Carlos leal'}</span>
                          </div>
                          <div className="text-right truncate">
                            <span className="font-bold text-slate-700">C.I: </span>
                            <span className="font-semibold text-slate-900">{recipe.patientCI || 'S/C'}</span>
                          </div>
                          <div className="truncate col-span-1">
                            <span className="font-bold text-slate-700">Dx: </span>
                            <span className="text-slate-800 font-medium">{recipe.diagnosis || '—'}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-700">Fecha: </span>
                            <span className="text-slate-800">{recipe.date || '14/10/26'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 my-1 relative z-10 overflow-hidden flex flex-col justify-start">
                        <span 
                          className="font-black text-xs block font-serif"
                          style={{ color: config.primaryDocColor || '#2563eb' }}
                        >
                          ℞ {config.rxTitle || 'Rp.'}
                        </span>
                        <p 
                          className="text-[10.5px] text-slate-900 whitespace-pre-wrap leading-relaxed mt-0.5 font-sans font-medium line-clamp-6"
                          style={{
                            fontFamily: config.rxBodyFontFamily || "'Roboto', sans-serif",
                          }}
                        >
                          {recipe.rp || <span className="italic text-slate-400">Sin medicamentos asignados.</span>}
                        </p>
                      </div>

                      <div className="mt-1 pt-1 border-t border-slate-200/80 relative z-10">
                        <DocumentFooter
                          config={config}
                          compact={true}
                          editableInline={false}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* VISTA 3: DOCUMENTO DE HOJA DE INDICACIONES INDIVIDUAL     */}
          {/* ========================================================= */}
          <div className={`w-full flex justify-center py-2 ${finalPreviewTab === 'indications' ? 'block' : 'hidden'}`}>
            <div
              ref={printableIndicationsRef}
              id="indications-print-container"
              className={`relative w-full max-w-[816px] bg-white shadow-2xl p-4 sm:p-7 md:p-8 rounded-2xl transition-all indications-container print-container border border-slate-200/90 ${textureClass} ${
                config.enforcePureBlackText ? 'enforce-pure-black' : ''
              } ${activePrintMode === 'indications' && finalPreviewTab === 'indications' ? 'print:block' : 'print:hidden'}`}
              style={{
                backgroundColor: config.tonePapel || '#ffffff',
                border: borderStyle,
                borderRadius: config.docCornerRadius || '16px',
                minHeight: '880px',
                boxSizing: 'border-box',
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
                      opacity: config.watermarkOpacity ?? 0.16,
                      width: `${config.watermarkScale || 50}%`,
                      transform: `rotate(${config.watermarkRotation || 0}deg)`,
                    }}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col justify-between h-full min-h-[820px]">
                <div>
                  <DocumentHeader
                    config={config}
                    compact={false}
                    editableInline={false}
                  />

                  <div className="my-2.5 pb-1 border-b border-slate-200 flex items-center justify-between">
                    <span 
                      className="text-base sm:text-lg font-black tracking-wide uppercase font-serif"
                      style={{ color: config.primaryDocColor }}
                    >
                      INDICACIONES MÉDICAS Y TRATAMIENTO
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Fecha: {localIndications.date || recipe.date || new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-2.5 mb-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <span className="text-indigo-950 font-bold block text-[10px] uppercase">Paciente:</span>
                        <strong className="text-slate-900 text-xs sm:text-sm truncate block">{localIndications.patientName || recipe.patientName || 'Nombre del Paciente'}</strong>
                      </div>
                      <div>
                        <span className="text-indigo-950 font-bold block text-[10px] uppercase">C.I.:</span>
                        <span className="text-slate-900 font-bold">{localIndications.patientCI || 'S/C'}</span>
                      </div>
                      <div>
                        <span className="text-indigo-950 font-bold block text-[10px] uppercase">Edad:</span>
                        <span className="text-slate-900 font-bold">{localIndications.patientAge || '--'}</span>
                      </div>
                    </div>
                    {localIndications.diagnosis && (
                      <div className="mt-1.5 pt-1.5 border-t border-indigo-200/60 flex items-center gap-1.5">
                        <span className="text-indigo-950 font-bold text-[10px] uppercase">Diagnóstico:</span>
                        <span className="text-slate-800 font-semibold truncate">{localIndications.diagnosis}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3.5 my-3">
                    <div className="p-3 bg-white/70 rounded-xl border border-slate-200 min-h-[160px]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                          💊 Instrucciones de Medicación y Horarios (Editable):
                        </span>
                        <button
                          type="button"
                          onClick={handleAutoFillIndicationsFromRp}
                          className="no-print px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Sincronizar fármacos del récipe automáticamente"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>Sincronizar del Récipe</span>
                        </button>
                      </div>

                      {/* Textarea para edición directa por el médico */}
                      <textarea
                        value={localIndications.generalInstructions || ''}
                        onChange={(e) => updateIndicationsField('generalInstructions', e.target.value)}
                        rows={Math.max(5, (localIndications.generalInstructions?.split('\n').length || 1) + 1)}
                        placeholder="Instrucciones de medicación y horarios..."
                        className="w-full p-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-colors print:hidden leading-relaxed resize-y shadow-inner"
                      />

                      {/* Div visible para PDF e Impresión */}
                      <div className="hidden print:block text-xs sm:text-sm font-semibold text-slate-900 whitespace-pre-wrap leading-relaxed py-1">
                        {localIndications.generalInstructions || 'Continuar medicación según prescripción del récipe adjunto.'}
                      </div>
                    </div>

                    {localIndications.dietAndRest && (
                      <div className="p-2.5 bg-white/70 rounded-xl border border-slate-200">
                        <span className="text-xs font-black text-slate-900 block mb-0.5 uppercase tracking-wide">
                          🥗 Recomendaciones de Dieta y Reposo:
                        </span>
                        <p className="text-xs font-semibold text-slate-800 leading-normal">
                          {localIndications.dietAndRest}
                        </p>
                      </div>
                    )}

                    {localIndications.alarmSigns && (
                      <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200">
                        <span className="text-xs font-black text-amber-900 block mb-0.5 uppercase tracking-wide">
                          ⚠️ Signos de Alarma:
                        </span>
                        <p className="text-xs font-semibold text-slate-800 leading-normal">
                          {localIndications.alarmSigns}
                        </p>
                      </div>
                    )}

                    {localIndications.nextAppointment && (
                      <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-200 flex items-center justify-between text-xs">
                        <span className="font-black text-teal-900 uppercase">Próximo Control:</span>
                        <span className="font-bold text-slate-800">{localIndications.nextAppointment}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200">
                  <DocumentFooter
                    config={config}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CONTENEDOR AISLADO DE IMPRESIÓN (1056x816px - LANDSCAPE)  */}
          {/* ========================================================= */}
          <div
            ref={printableDualRef}
            id="recipe-indications-dual-sheet"
            className="print-container"
            style={{
              position: 'fixed',
              left: '0px',
              top: '0px',
              width: '1056px',
              height: '816px',
              opacity: isExporting ? 0.01 : 0,
              pointerEvents: 'none',
              zIndex: isExporting ? 99999 : -9999,
              backgroundColor: config.tonePapel || '#ffffff',
              display: 'flex',
              flexDirection: 'row',
              boxSizing: 'border-box',
              overflow: 'hidden',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {/* Marca de agua opcional */}
            {config.marcaAgua && !config.marcaAgua.includes('DIGITAL') && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
                <img
                  src={config.marcaAgua}
                  alt="Marca de agua"
                  style={{
                    opacity: config.watermarkOpacity ?? 0.16,
                    width: `${config.watermarkScale || 50}%`,
                    transform: `rotate(${config.watermarkRotation || 0}deg)`,
                  }}
                />
              </div>
            )}

            {/* COLUMNA IZQUIERDA: RÉCIPE MÉDICO OFICIAL (528px x 816px, padding 40px) */}
            <div style={{ width: '528px', height: '816px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '2px dashed #94a3b8', boxSizing: 'border-box', position: 'relative', zIndex: 10 }}>
              <div>
                {/* Membrete del Médico con anchos fijos en px */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '2px solid ' + (config.primaryDocColor || '#1e3a8a'), paddingBottom: '12px' }}>
                  {config.logoIzq ? (
                    <img src={config.logoIzq} alt="Logo Izq" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                  ) : <div style={{ width: '70px' }} />}

                  <div style={{ textAlign: 'center', flex: 1, padding: '0 10px' }}>
                    <h1 style={{ fontSize: '18px', fontWeight: 900, color: config.primaryDocColor || '#1e3a8a', margin: 0, lineHeight: 1.2 }}>
                      {config.doctorName || 'Dr. Carlos Leal'}
                    </h1>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#475569', margin: '3px 0' }}>
                      {config.specialty || 'Médico Cirujano'} · MPPS: {config.mpps || '---'}
                    </p>
                    {config.collegeNumber && (
                      <p style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', margin: 0 }}>
                        C.M.C.: {config.collegeNumber} {config.ci ? `| C.I.: ${config.ci}` : ''}
                      </p>
                    )}
                  </div>

                  {config.logoDer ? (
                    <img src={config.logoDer} alt="Logo Der" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                  ) : <div style={{ width: '70px' }} />}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: config.primaryDocColor || '#1e3a8a', letterSpacing: '0.5px' }}>
                    RÉCIPE MÉDICO OFICIAL
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                    Fecha: {recipe.date || new Date().toLocaleDateString('es-ES')}
                  </span>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '11px', marginBottom: '16px' }}>
                  <div style={{ marginBottom: '4px' }}><strong>Paciente:</strong> {recipe.patientName || 'Paciente'}</div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div><strong>C.I.:</strong> {recipe.patientCI || 'V-00.000.000'}</div>
                    <div><strong>Edad:</strong> {recipe.patientAge || '—'}</div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'serif', color: config.rxTitleColor || config.primaryDocColor || '#1e3a8a', display: 'block', marginBottom: '6px' }}>
                    {config.rxTitle || 'Rp.'}
                  </span>
                  <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'pre-wrap', lineHeight: 1.6, minHeight: '180px' }}>
                    {recipe.rp || 'Prescripción médica.'}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', textAlign: 'center' }}>
                {config.selloImg ? (
                  <img src={config.selloImg} alt="Sello y Firma" style={{ maxHeight: '60px', margin: '0 auto 4px auto', display: 'block' }} />
                ) : null}
                <div style={{ borderTop: '1px solid #475569', width: '180px', margin: '8px auto 4px auto' }}></div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', margin: 0 }}>Firma y Sello del Médico</p>
                <p style={{ fontSize: '9px', color: '#94a3b8', margin: '2px 0 0 0' }}>{config.phone ? `Tel: ${config.phone}` : ''} {config.email ? `| ${config.email}` : ''}</p>
              </div>
            </div>

            {/* COLUMNA DERECHA: INDICACIONES MÉDICAS Y POSOLOGÍA (528px x 816px, padding 40px) */}
            <div style={{ width: '528px', height: '816px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', position: 'relative', zIndex: 10 }}>
              <div>
                {/* Membrete del Médico (Columna Derecha) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '2px solid ' + (config.primaryDocColor || '#1e3a8a'), paddingBottom: '12px' }}>
                  {config.logoIzq ? (
                    <img src={config.logoIzq} alt="Logo Izq" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                  ) : <div style={{ width: '70px' }} />}

                  <div style={{ textAlign: 'center', flex: 1, padding: '0 10px' }}>
                    <h1 style={{ fontSize: '18px', fontWeight: 900, color: config.primaryDocColor || '#1e3a8a', margin: 0, lineHeight: 1.2 }}>
                      {config.doctorName || 'Dr. Carlos Leal'}
                    </h1>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#475569', margin: '3px 0' }}>
                      {config.specialty || 'Médico Cirujano'} · MPPS: {config.mpps || '---'}
                    </p>
                    {config.collegeNumber && (
                      <p style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', margin: 0 }}>
                        C.M.C.: {config.collegeNumber} {config.ci ? `| C.I.: ${config.ci}` : ''}
                      </p>
                    )}
                  </div>

                  {config.logoDer ? (
                    <img src={config.logoDer} alt="Logo Der" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                  ) : <div style={{ width: '70px' }} />}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: '#312e81', letterSpacing: '0.5px' }}>
                    INDICACIONES Y POSOLOGÍA MÉDICA
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                    Fecha: {localIndications.date || recipe.date || new Date().toLocaleDateString('es-ES')}
                  </span>
                </div>

                <div style={{ backgroundColor: '#eef2ff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #c7d2fe', fontSize: '11px', marginBottom: '16px' }}>
                  <strong>Indicaciones para el paciente:</strong> {localIndications.patientName || recipe.patientName || 'Paciente'}
                </div>

                <div>
                  <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'pre-wrap', lineHeight: 1.6, minHeight: '180px' }}>
                    {localIndications.generalInstructions || 'Tomar medicamentos indicados en el récipe según horarios.'}
                  </div>

                  {localIndications.dietAndRest && (
                    <div style={{ marginTop: '12px', fontSize: '11px', color: '#334155', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <strong>Dieta y Reposo:</strong> {localIndications.dietAndRest}
                    </div>
                  )}

                  {localIndications.alarmSigns && (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#991b1b', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      <strong>Signos de Alarma:</strong> {localIndications.alarmSigns}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', textAlign: 'center' }}>
                {config.selloImg ? (
                  <img src={config.selloImg} alt="Sello y Firma" style={{ maxHeight: '60px', margin: '0 auto 4px auto', display: 'block' }} />
                ) : null}
                <div style={{ borderTop: '1px solid #475569', width: '180px', margin: '8px auto 4px auto' }}></div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', margin: 0 }}>Firma y Sello del Médico</p>
                <p style={{ fontSize: '9px', color: '#94a3b8', margin: '2px 0 0 0' }}>{config.phone ? `Tel: ${config.phone}` : ''} {config.email ? `| ${config.email}` : ''}</p>
              </div>
            </div>
          </div>

        </div>
      )}



      {/* Email Share Modal */}
      <EmailShareModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        config={config}
        documentType={finalPreviewTab === 'indications' ? 'indications' : 'recipe'}
        patientName={recipe.patientName || 'Paciente'}
        patientEmail={recipe.patientEmail || ''}
        documentTitle={finalPreviewTab === 'indications' ? 'Hoja de Indicaciones' : 'Récipe Médico'}
        contentBody={finalPreviewTab === 'indications' ? (localIndications.generalInstructions || '') : (recipe.rp || '')}
        onTriggerPrintPdf={() => {
          if (finalPreviewTab === 'indications') {
            handleDownloadIndicationsPdfDirect();
          } else {
            handleDownloadRecipePdfDirect();
          }
        }}
      />

      {/* Modal para Agregar Nuevo Fármaco Personalizado al Catálogo */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Pill className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900">Agregar Medicamento</h3>
                  <p className="text-xs text-slate-500 font-semibold">Guardar en su catálogo personal permanente</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomDrug} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Nombre del Medicamento / Principio Activo: *
                </label>
                <input
                  type="text"
                  required
                  value={customDrugName}
                  onChange={(e) => setCustomDrugName(e.target.value)}
                  placeholder="Ej: Ciprofloxacino 500mg"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Presentación:
                </label>
                <input
                  type="text"
                  value={customDrugPresentation}
                  onChange={(e) => setCustomDrugPresentation(e.target.value)}
                  placeholder="Ej: Comprimidos recubiertos / Frasco jarabe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Posología / Instrucciones Sugeridas:
                </label>
                <textarea
                  rows={3}
                  value={customDrugInstructions}
                  onChange={(e) => setCustomDrugInstructions(e.target.value)}
                  placeholder="Ej: Tomar 1 comprimido cada 12 horas por 7 días vía oral después de las comidas."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Especialidad / Categoría:
                </label>
                <select
                  value={customDrugSpecialty}
                  onChange={(e) => setCustomDrugSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                >
                  <option value="general">Medicina General e Interna</option>
                  <option value="anestesia">Anestesiología / Cirugía / Dolor</option>
                  <option value="gastroenterologia">Gastroenterología</option>
                  <option value="cardiologia">Cardiología</option>
                  <option value="pediatria">Pediatría</option>
                  <option value="ginecologia">Ginecología y Obstetricia</option>
                  <option value="respiratorio">Neumonología / Respiratorio</option>
                  <option value="traumatologia">Traumatología</option>
                  <option value="psicologia">Psicología / Psiquiatría</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Guardar Fármaco</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal de Validación de Formato de Membrete */}
      {validationErrorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <AlertCircle className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-black text-base text-slate-900">Validación de Formato Requerida</h3>
                <p className="text-xs text-red-600 font-bold">Impresión detenida por el sistema</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed bg-red-50/70 p-4 rounded-2xl border border-red-100">
              {validationErrorModal}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setValidationErrorModal(null)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProgressiveRecipeWizard;
