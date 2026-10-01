import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DoctorConfig, IndicationsSheet, RecipeItem } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
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
  RefreshCw,
  Zap,
  ChevronDown,
  ChevronUp,
  Search,
  BookmarkPlus,
  X,
  Save,
  Download
} from 'lucide-react';

interface IndicationsModuleProps {
  config: DoctorConfig;
  indications: IndicationsSheet;
  onChangeIndications: (updated: Partial<IndicationsSheet>) => void;
  onPrint: () => void;
  onSaveAndShare?: (shouldDownload?: boolean) => void;
  onOpenPreview?: () => void;
  onUpdateConfig?: (updated: Partial<DoctorConfig>) => void;
  onBackToHome?: () => void;
  recipes?: RecipeItem[];
  activeRecipeIndex?: number;
}

export const IndicationsModule: React.FC<IndicationsModuleProps> = ({
  config,
  indications,
  onChangeIndications,
  onPrint,
  onSaveAndShare,
  onOpenPreview,
  onUpdateConfig,
  onBackToHome,
  recipes = [],
  activeRecipeIndex = 0,
}) => {
  const printableSheetRef = useRef<HTMLDivElement>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  
  // Collapsible Dropdown Menu Panel for Drugs & Hours
  const [isDrugMenuOpen, setIsDrugMenuOpen] = useState(false);

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

  const [syncToast, setSyncToast] = useState<string | null>(null);

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

  // Auto-sync new prescribed drugs from recipes into indications schedule seamlessly
  useEffect(() => {
    if (!detectedRecipeDrugs || detectedRecipeDrugs.length === 0) return;

    const current = indications.medicationSchedule || '';
    const currentLower = current.toLowerCase();
    const newItems: string[] = [];

    detectedRecipeDrugs.forEach(drug => {
      const cleanDrug = drug.replace(/^(\d+[\.\)]|\•|\-|\*)\s*/, '').trim();
      if (!cleanDrug) return;
      const drugKey = cleanDrug.split(/[\(\,\-]/)[0].trim().toLowerCase();
      if (!currentLower.includes(cleanDrug.toLowerCase()) && (drugKey.length < 3 || !currentLower.includes(drugKey))) {
        const isFull = cleanDrug.toLowerCase().includes('tomar') || cleanDrug.toLowerCase().includes('cada') || cleanDrug.toLowerCase().includes('aplicar') || cleanDrug.toLowerCase().includes('vía');
        const formatted = isFull
          ? `• ${cleanDrug}`
          : `• ${cleanDrug}: Tomar 1 dosis vía oral cada 12 horas (8:00 AM - 8:00 PM) por 7 días con alimentos.`;
        newItems.push(formatted);
      }
    });

    if (newItems.length > 0) {
      const updated = current.trim()
        ? `${current.trim()}\n${newItems.join('\n')}`
        : newItems.join('\n');
      onChangeIndications({ medicationSchedule: updated });
    }
  }, [detectedRecipeDrugs]);

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

    setSyncToast(`✓ ¡Agregado: ${name}!`);
    setTimeout(() => setSyncToast(null), 2500);

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
      setSyncToast('⚠️ Escriba o seleccione un nombre de fármaco válido.');
      setTimeout(() => setSyncToast(null), 2500);
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

    setSyncToast(`✓ ¡Fármaco "${name}" guardado en el Banco Global del Sistema!`);
    setTimeout(() => setSyncToast(null), 3000);
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

  const indicationsBodyForWhatsApp = 
    `*INDICACIONES MÉDICAS Y POSOLOGÍA*\n` +
    `Paciente: ${indications.patientName || 'Paciente'} (C.I: ${indications.patientCI || 'N/A'})\n` +
    `Fecha: ${indications.date}\n\n` +
    `1. HORARIO Y MEDICAMENTOS:\n${indications.medicationSchedule}\n\n` +
    `2. DIETA Y REPOSO:\n${indications.dietAndRest}\n\n` +
    `3. SIGNOS DE ALARMA (URGENCIAS):\n${indications.alarmSigns}\n\n` +
    `4. PRÓXIMA CITA DE CONTROL:\n${indications.nextAppointment}`;

  const borderStyle = getDocumentBorderStyle(config.borderStyle, config.primaryDocColor);
  const textureClass = getPaperTextureClass(config.paperTexture);

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. TOP ACTION & NAVIGATION BAR (no-print) */}
      <div className="w-full max-w-[840px] mb-3 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs no-print">
        <div className="flex items-center gap-2 flex-wrap">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-300/80 cursor-pointer"
              title="Volver a la pantalla principal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
              <span>Inicio</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            <span>Indicaciones Médicas</span>
          </div>

          {/* Botón Rojo: Dejar en Blanco */}
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
              setSyncToast('✓ Hoja de indicaciones dejada en blanco.');
              setTimeout(() => setSyncToast(null), 2500);
            }}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Dejar hoja de indicaciones completamente en blanco para un nuevo paciente (limpia nombre, cédula, edad y horarios)"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>Dejar en Blanco</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Quick font size adjustment */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium px-1">Letra:</span>
            <button
              onClick={() => {
                const current = parseInt(config.indicationsFontSize || '12.5px', 10) || 12;
                onUpdateConfig?.({ indicationsFontSize: `${Math.max(10, current - 1)}px` });
              }}
              className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border rounded text-[10px] font-bold text-slate-700"
              title="Reducir letra"
            >
              A-
            </button>
            <button
              onClick={() => {
                const current = parseInt(config.indicationsFontSize || '12.5px', 10) || 12;
                onUpdateConfig?.({ indicationsFontSize: `${Math.min(22, current + 1)}px` });
              }}
              className="px-1.5 py-0.5 bg-white hover:bg-slate-200 border rounded text-[10px] font-bold text-slate-700"
              title="Agrandar letra"
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
                  // Pass false to onSaveAndShare or handle it directly
                  if (onSaveAndShare) {
                    (onSaveAndShare as any)(false);
                  }
                }}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Guardar indicaciones en el Banco de Pacientes."
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
                title="Descargar PDF del documento y luego abrir opciones de envío"
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
              title="Vista previa"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Vista Previa</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MENÚS DESPLEGABLES SELECCIONABLES: FÁRMACOS, HORARIOS Y SINCRONIZACIÓN (NO-PRINT) */}
      <div className="w-full max-w-[840px] mb-3 bg-white border border-blue-200 rounded-2xl shadow-xs overflow-hidden no-print transition-all">
        
        {/* Toggle Bar / Header for Dropdown Menu */}
        <div 
          onClick={() => setIsDrugMenuOpen(!isDrugMenuOpen)}
          className="p-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 cursor-pointer hover:from-blue-700 hover:to-teal-700 transition-all flex items-center justify-between gap-3 text-xs text-white shadow-md rounded-2xl group"
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 bg-white/20 text-white rounded-xl shadow-xs group-hover:scale-110 transition-transform">
              <Pill className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="font-black text-white text-xs sm:text-sm flex items-center gap-2">
                <span>💊 Catálogo de Fármacos, Posología y Horarios (Toca para Abrir / Cerrar)</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                  {isDrugMenuOpen ? '▲ Ocultar Catálogo' : '▼ ¡Abrir Catálogo y Elegir!'}
                </span>
              </span>
              <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                Toque aquí para desplegar recetas por especialidad, medicamentos, vías, frecuencias y duraciones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="p-1.5 bg-white/20 text-white rounded-xl font-bold group-hover:bg-white/30 transition-colors">
              {isDrugMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </div>
        </div>

        {/* EXPANDED SELECTABLE MENUS (CUANDO EL MÉDICO LO DESPLIEGA) */}
        {isDrugMenuOpen && (
          <div className="p-4 bg-slate-50/80 border-t border-blue-200/80 space-y-3.5 text-xs animate-in fade-in duration-150">
            
            {/* ROW 1: DESPLEGABLES DE ESPECIALIDAD Y FÁRMACO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              
              {/* Menú Desplegable: Especialidad */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Menú Especialidad:
                </label>
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

              {/* Menú Desplegable: Selector de Fármaco de la Especialidad */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Menú Fármacos de la Especialidad:
                </label>
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
                  <option value="">-- Seleccione del Menú --</option>
                  {specialtyDrugs.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.presentation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Buscador o Entrada Libre de Fármaco */}
              <div className="relative">
                <label className="font-bold text-slate-700 block mb-1">
                  3. O Escriba Cualquier Medicamento Libre:
                </label>
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
                    placeholder="Escriba aquí (ej: Gotas, Jarabe, etc.)..."
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

                {/* Autocomplete Dropdown popup if typing */}
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
                        className="p-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-bold text-slate-900 text-xs">{d.name}</span>
                        <span className="text-[10px] text-slate-500">{d.presentation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* ROW 2: MENÚS DESPLEGABLES DE VÍA, DOSIS, HORARIOS Y DURACIÓN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              
              {/* Desplegable Vía */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vía de Administración:</label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-slate-900 outline-none"
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

              {/* Dosis / Cantidad */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Dosis / Cantidad:</label>
                <input
                  type="text"
                  value={selectedDosage}
                  onChange={(e) => setSelectedDosage(e.target.value)}
                  placeholder="Ej: 1 tableta, 5ml, 2 puff"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 outline-none"
                />
              </div>

              {/* Desplegable Horario / Frecuencia */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Menú Horario / Frecuencia:</label>
                <select
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-slate-900 outline-none"
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

              {/* Desplegable Duración */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Menú Duración:</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-slate-900 outline-none"
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

            {/* Instrucción Especial y Botón de Inserción */}
            <div className="flex flex-col sm:flex-row items-end gap-2.5 pt-1">
              <div className="flex-1 w-full">
                <label className="font-bold text-slate-700 block mb-1">Instrucción Especial / Forma de Tomar (Opcional):</label>
                <input
                  type="text"
                  value={selectedNote}
                  onChange={(e) => setSelectedNote(e.target.value)}
                  placeholder="Ej: Tomar con abundante agua 30 min antes del desayuno / No suspender bruscamente..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleAddNewSystemDrug}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all text-xs cursor-pointer"
                  title="Guardar este nuevo fármaco en el Banco Global del Sistema para todos los médicos"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>💾 Guardar Fármaco Global</span>
                </button>

                <button
                  type="button"
                  onClick={handleInsertConfiguredDrug}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all shrink-0 hover:scale-[1.01] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar a Hoja</span>
                </button>
              </div>
            </div>

            {/* Atajos Rápidos de Dieta y Alarma */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-600">Pautas rápidas:</span>
                <button
                  type="button"
                  onClick={() => handleAppendDiet('Dieta blanda e hidratación oral abundante (>2 litros/día)')}
                  className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-medium"
                >
                  + Dieta Blanda
                </button>
                <button
                  type="button"
                  onClick={() => handleAppendDiet('Reposo físico relativo en casa')}
                  className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-medium"
                >
                  + Reposo Relativo
                </button>
                <button
                  type="button"
                  onClick={() => handleAppendAlarm('Fiebre > 38.5°C persistente o vómitos repetidos')}
                  className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded font-medium"
                >
                  + Signos Alarma
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsDrugMenuOpen(false)}
                className="text-slate-500 hover:text-slate-800 underline font-semibold"
              >
                Cerrar Menú
              </button>
            </div>

          </div>
        )}

      </div>

      {/* SYNC NOTIFICATION TOAST */}
      {syncToast && (
        <div className="w-full max-w-[840px] mb-2 p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-1.5 animate-in fade-in duration-200 no-print">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* 3. MAIN PRINTABLE SHEET */}
      <div
        ref={printableSheetRef}
        className={`relative w-full max-w-[840px] min-h-[960px] shadow-xl p-8 transition-all print-container flex flex-col justify-between ${textureClass} ${
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
          <div className="marca-agua pointer-events-none">
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

          <div className="text-center my-3 pb-1 border-b border-slate-200">
            <h2
              className="text-base font-bold uppercase tracking-wider"
              style={{ color: config.headerColor, fontFamily: config.fuenteHeader }}
            >
              INDICACIONES MÉDICAS Y POSOLOGÍA
            </h2>
          </div>

          {/* Patient Info Row - Clean 2-Line Layout with Small Clear Button */}
          <div 
            className="py-2.5 px-3.5 bg-slate-50/90 border border-slate-200/90 rounded-xl mb-3.5 space-y-2 shadow-2xs text-xs relative group"
            style={{ fontSize: config.patientBarSize || '12px' }}
          >
            {/* Line 1: Paciente y Cédula */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-slate-800 shrink-0">Paciente:</span>
                <input
                  type="text"
                  value={indications.patientName}
                  onChange={(e) => onChangeIndications({ patientName: e.target.value })}
                  placeholder="Nombre y Apellidos del Paciente"
                  className="flex-1 bg-transparent border-b border-dashed border-slate-300 outline-none text-slate-900 font-semibold min-w-[150px]"
                />
              </div>
              <div className="w-full sm:w-auto sm:min-w-[170px] flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-slate-800 shrink-0">C.I. / Doc:</span>
                <input
                  type="text"
                  value={indications.patientCI}
                  onChange={(e) => onChangeIndications({ patientCI: e.target.value })}
                  placeholder="V-00.000.000"
                  className="flex-1 bg-transparent border-b border-dashed border-slate-300 outline-none text-slate-900 font-semibold"
                />
              </div>

              {/* Small Clear Patient Button (no-print) */}
              {(indications.patientName || indications.patientCI) && (
                <button
                  type="button"
                  onClick={() => onChangeIndications({ patientName: '', patientCI: '', patientAge: '', patientPhone: '' })}
                  className="no-print px-1.5 py-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[10px] font-bold transition-colors shrink-0"
                  title="Borrar datos del paciente"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Line 2: Edad, Teléfono y Fecha */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 border-t border-slate-200/60 items-center">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-slate-800 shrink-0">Edad:</span>
                <input
                  type="text"
                  value={indications.patientAge || ''}
                  onChange={(e) => onChangeIndications({ patientAge: e.target.value })}
                  placeholder="35 años"
                  className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none text-slate-900 font-semibold"
                />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-slate-800 shrink-0">Teléfono:</span>
                <input
                  type="text"
                  value={indications.patientPhone || ''}
                  onChange={(e) => onChangeIndications({ patientPhone: e.target.value })}
                  placeholder="+58 414-0000000"
                  className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none text-slate-900 font-semibold"
                />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-slate-800 shrink-0">Fecha:</span>
                <input
                  type="text"
                  value={indications.date}
                  onChange={(e) => onChangeIndications({ date: e.target.value })}
                  placeholder="Fecha"
                  className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none text-slate-900 font-semibold"
                />
              </div>
            </div>

            {/* Line 3: Diagnóstico Clínico */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60 min-w-0">
              <span className="font-bold text-slate-800 shrink-0">Dx / Diagnóstico:</span>
              <input
                type="text"
                value={indications.diagnosis || ''}
                onChange={(e) => onChangeIndications({ diagnosis: e.target.value })}
                placeholder="Diagnóstico clínico (opcional)"
                className="flex-1 bg-transparent border-b border-dashed border-slate-300 outline-none text-slate-900 font-semibold"
              />
            </div>
          </div>

          {/* Main Indications Textareas with Clear / Borrar Buttons in Each Header */}
          <div 
            className="space-y-4 flex-1"
            style={{
              fontSize: config.indicationsFontSize || '12.5px',
              fontFamily: config.indicationsFontFamily || 'inherit',
            }}
          >
            {/* 1. Medication & Schedule */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5" style={{ color: config.headerColor }}>
                  <span>1. HORARIO Y CUMPLIMIENTO DE MEDICAMENTOS:</span>
                </label>
                <div className="flex items-center gap-1.5 no-print text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      const current = indications.medicationSchedule || '';
                      const updated = current.trim() ? `${current.trim()}\n• ` : '• ';
                      onChangeIndications({ medicationSchedule: updated });
                    }}
                    className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded border border-blue-200 transition-colors"
                    title="Insertar nueva fila"
                  >
                    + Fila
                  </button>
                  
                  {/* Small Clear Button for Medication Schedule */}
                  {indications.medicationSchedule && (
                    <button
                      type="button"
                      onClick={() => onChangeIndications({ medicationSchedule: '' })}
                      className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold transition-colors flex items-center gap-0.5"
                      title="Borrar todo el horario de medicamentos"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>Borrar</span>
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={indications.medicationSchedule}
                onChange={(e) => onChangeIndications({ medicationSchedule: e.target.value })}
                placeholder="Escriba libremente aquí o utilice el 'Menú Desplegable' arriba para seleccionar fármacos y horarios...&#10;• Omeprazol 20mg: 1 cápsula VO en ayunas (7:00 AM) por 14 días.&#10;• Sertralina 50mg: 1 comprimido VO cada mañana con el desayuno.&#10;• Amoxicilina 875mg: 1 comprimido VO cada 12 horas por 7 días..."
                className="w-full min-h-[175px] p-3 bg-transparent border border-slate-200/90 rounded-xl focus:border-blue-500 focus:outline-none resize-none leading-relaxed font-sans shadow-2xs text-slate-900"
              />
            </div>

            {/* 2. Diet & Physical Rest */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800" style={{ color: config.headerColor }}>
                  2. RÉGIMEN DIETÉTICO Y REPOSO FÍSICO:
                </label>
                {indications.dietAndRest && (
                  <button
                    type="button"
                    onClick={() => onChangeIndications({ dietAndRest: '' })}
                    className="no-print px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold transition-colors flex items-center gap-0.5"
                    title="Borrar pautas de dieta y reposo"
                  >
                    <Trash2 className="w-3 h-3 text-rose-600" />
                    <span>Borrar</span>
                  </button>
                )}
              </div>
              <textarea
                value={indications.dietAndRest}
                onChange={(e) => onChangeIndications({ dietAndRest: e.target.value })}
                placeholder="• Dieta blanda e hidratación oral abundante (mínimo 2 litros de agua al día).&#10;• Reposo físico relativo en casa..."
                className="w-full min-h-[85px] p-2.5 bg-transparent border border-slate-200/90 rounded-xl focus:border-blue-500 focus:outline-none resize-none leading-relaxed shadow-2xs text-slate-900"
              />
            </div>

            {/* 3. Alarm Signs */}
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40">
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-amber-900">
                  3. SIGNOS DE ALARMA (CONSULTAR DE INMEDIATO AL SERVICIO DE URGENCIAS):
                </label>
                {indications.alarmSigns && (
                  <button
                    type="button"
                    onClick={() => onChangeIndications({ alarmSigns: '' })}
                    className="no-print px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded text-[10px] font-bold transition-colors flex items-center gap-0.5"
                    title="Borrar signos de alarma"
                  >
                    <Trash2 className="w-3 h-3 text-amber-800" />
                    <span>Borrar</span>
                  </button>
                )}
              </div>
              <textarea
                value={indications.alarmSigns}
                onChange={(e) => onChangeIndications({ alarmSigns: e.target.value })}
                placeholder="• Fiebre persistente > 38.5°C que no ceda a antitérmicos.&#10;• Dificultad respiratoria, dolor torácico o vómitos incoercibles..."
                className="w-full min-h-[70px] p-2 bg-transparent border border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none resize-none leading-relaxed text-slate-900"
              />
            </div>

            {/* 4. Next Appointment */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800" style={{ color: config.headerColor }}>
                  4. PRÓXIMA CITA DE CONTROL:
                </label>
                {indications.nextAppointment && (
                  <button
                    type="button"
                    onClick={() => onChangeIndications({ nextAppointment: '' })}
                    className="no-print px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold transition-colors flex items-center gap-0.5"
                    title="Borrar próxima cita"
                  >
                    <Trash2 className="w-3 h-3 text-rose-600" />
                    <span>Borrar</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={indications.nextAppointment}
                onChange={(e) => onChangeIndications({ nextAppointment: e.target.value })}
                placeholder="Ej: Acudir a control en 7 días / Fecha: 30 de Septiembre a las 9:00 AM."
                className="w-full p-2.5 bg-transparent border border-slate-200/90 rounded-xl focus:border-blue-500 focus:outline-none font-semibold text-slate-900 shadow-2xs"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4">
            <DocumentFooter
              config={config}
              notesText="Siga estrictamente las indicaciones médicas. Ante cualquier duda comuníquese a los teléfonos autorizados."
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
        documentType="indications"
        patientName={indications.patientName}
        patientPhone={indications.patientPhone || ''}
        documentTitle="Indicaciones Médicas y Posología"
        contentBody={indicationsBodyForWhatsApp}
        onUpdatePatientPhone={(phone) => onChangeIndications({ patientPhone: phone })}
        onTriggerPrintPdf={onPrint}
      />

    </div>
  );
};
