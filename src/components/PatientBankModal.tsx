import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Users, 
  FileText, 
  ClipboardList, 
  Calendar, 
  ArrowRight, 
  Plus, 
  Check, 
  Clock, 
  Eye, 
  Printer, 
  UserCheck, 
  Stethoscope, 
  Pill,
  Trash2,
  Share2,
  MessageSquare,
  Download,
  Copy
} from 'lucide-react';
import { DoctorConfig, RecipeItem, ClinicalRecord, MedicalReport, MedicalRestCert, SavedPatientEntry } from '../types';
import { exportElementAsPDF } from '../utils/exportDocument';

export type { SavedPatientEntry };

interface PatientBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: DoctorConfig;
  recipes: RecipeItem[];
  records: ClinicalRecord[];
  currentReport?: MedicalReport;
  restCert?: MedicalRestCert;
  sessionPatients: SavedPatientEntry[];
  setSessionPatients: React.Dispatch<React.SetStateAction<SavedPatientEntry[]>>;
  onLoadRecipeToDoctor: (patient: SavedPatientEntry) => void;
  onLoadRecordToDoctor: (recordId: string) => void;
  onAddNewPatientToSession: (patient: SavedPatientEntry) => void;
  onDeletePatient?: (patient: SavedPatientEntry) => void;
  onTriggerPrintPdf?: () => void;
}

export const PatientBankModal: React.FC<PatientBankModalProps> = ({
  isOpen,
  onClose,
  config,
  recipes,
  records,
  currentReport,
  restCert,
  sessionPatients,
  setSessionPatients,
  onLoadRecipeToDoctor,
  onLoadRecordToDoctor,
  onAddNewPatientToSession,
  onDeletePatient,
  onTriggerPrintPdf,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'recipe' | 'historia'>('all');
  const [selectedPatient, setSelectedPatient] = useState<SavedPatientEntry | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [bankFeedbackToast, setBankFeedbackToast] = useState<string | null>(null);

  // New patient form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientCI, setNewPatientCI] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newRp, setNewRp] = useState('');

  // Phone helper states for structured country & operator selector
  const [newPhoneCountry, setNewPhoneCountry] = useState('+58');
  const [newPhoneOperator, setNewPhoneOperator] = useState('0414');
  const [newPhoneLocal, setNewPhoneLocal] = useState('');

  // Auto-sync newPatientPhone when structured helper fields change
  React.useEffect(() => {
    if (newPhoneLocal) {
      const displayOp = newPhoneOperator ? (newPhoneOperator.startsWith('0') ? newPhoneOperator : '0' + newPhoneOperator) : '';
      const formatted = displayOp 
        ? `${newPhoneCountry} ${displayOp} ${newPhoneLocal}`
        : `${newPhoneCountry} ${newPhoneLocal}`;
      setNewPatientPhone(formatted);
    } else {
      setNewPatientPhone('');
    }
  }, [newPhoneCountry, newPhoneOperator, newPhoneLocal]);

  // Deleted patients blacklist to prevent re-appearance from session history
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('digital_medic_deleted_patient_ids_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [deletedNames, setDeletedNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('digital_medic_deleted_patient_names_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Aggregate all unique patients and recipes recorded in the doctor's session
  const allEntries: SavedPatientEntry[] = useMemo(() => {
    const list: SavedPatientEntry[] = [...sessionPatients];

    // From active recipes
    recipes.forEach((rec, idx) => {
      if (rec.patientName && rec.patientName.trim()) {
        const cleanName = rec.patientName.toLowerCase().trim();
        const existing = list.some((p) => p.patientName.toLowerCase().trim() === cleanName);
        if (!existing) {
          list.push({
            id: rec.id || `rec-${idx}-${Date.now()}`,
            patientName: rec.patientName,
            patientCI: rec.patientCI || 'N/A',
            patientAge: rec.patientAge || '',
            patientPhone: rec.patientPhone || '',
            patientEmail: rec.patientEmail || '',
            date: rec.date || new Date().toLocaleDateString('es-ES'),
            diagnosis: rec.diagnosis || 'Consulta médica general',
            rp: rec.rp || 'Récipe médico',
            indicationsNotes: rec.indicationsNotes,
            sourceModule: 'recipe',
          });
        }
      }
    });

    // From clinical records (historias)
    records.forEach((rec) => {
      if (rec.patientName && rec.patientName.trim()) {
        const cleanName = rec.patientName.toLowerCase().trim();
        const existing = list.some((p) => p.patientName.toLowerCase().trim() === cleanName);
        if (!existing) {
          list.push({
            id: rec.id,
            patientName: rec.patientName,
            patientCI: rec.patientCI || 'N/A',
            patientAge: `${rec.patientAge} años`,
            patientPhone: rec.patientPhone || '',
            date: rec.date || new Date().toLocaleDateString('es-ES'),
            diagnosis: rec.diagnoses || rec.reason || 'Historia clínica de consulta',
            rp: rec.treatmentPlan || 'Plan de tratamiento registrado',
            sourceModule: 'historia',
          });
        }
      }
    });

    // From current report if available
    if (currentReport?.patientName && currentReport.patientName.trim()) {
      const cleanName = currentReport.patientName.toLowerCase().trim();
      const existing = list.some((p) => p.patientName.toLowerCase().trim() === cleanName);
      if (!existing) {
        list.push({
          id: currentReport.id || `rep-${Date.now()}`,
          patientName: currentReport.patientName,
          patientCI: currentReport.patientCI || 'N/A',
          patientAge: currentReport.patientAge || '',
          patientPhone: currentReport.patientPhone || '',
          date: currentReport.date || new Date().toLocaleDateString('es-ES'),
          diagnosis: currentReport.diagnosticImpression || currentReport.title || 'Informe médico',
          rp: currentReport.treatmentPlan || '',
          sourceModule: 'informe',
        });
      }
    }

    // Filter out deleted IDs and deleted names
    return list.filter((p) => {
      const isIdDeleted = deletedIds.includes(p.id);
      const isNameDeleted = deletedNames.includes(p.patientName.toLowerCase().trim());
      return !isIdDeleted && !isNameDeleted;
    });
  }, [recipes, records, currentReport, sessionPatients, deletedIds, deletedNames]);

  if (!isOpen) return null;

  // Filtered patients based on search and module filter
  const filteredPatients = allEntries.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term || 
      p.patientName.toLowerCase().includes(term) || 
      p.patientCI.toLowerCase().includes(term) || 
      p.diagnosis.toLowerCase().includes(term) ||
      p.rp.toLowerCase().includes(term);

    const matchesSource = 
      filterSource === 'all' || 
      p.sourceModule === filterSource;

    return matchesSearch && matchesSource;
  });

  const handleCreateNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    const newEntry: SavedPatientEntry = {
      id: `patient-custom-${Date.now()}`,
      patientName: newPatientName.trim(),
      patientCI: newPatientCI.trim() || 'S/C',
      patientAge: newPatientAge.trim() || 'N/A',
      patientPhone: newPatientPhone.trim() || '',
      date: new Date().toLocaleDateString('es-ES'),
      diagnosis: newDiagnosis.trim() || 'Consulta médica',
      rp: newRp.trim() || 'Indicaciones pendientes',
      sourceModule: 'recipe',
    };

    const nextList = [newEntry, ...sessionPatients];
    setSessionPatients(nextList);
    try {
      localStorage.setItem('digital_medic_patient_bank_v1', JSON.stringify(nextList));
    } catch (e) {}

    onAddNewPatientToSession(newEntry);
    setIsAddingNew(false);
    setSelectedPatient(newEntry);

    // Reset inputs
    setNewPatientName('');
    setNewPatientCI('');
    setNewPatientAge('');
    setNewPatientPhone('');
    setNewDiagnosis('');
    setNewRp('');
    setNewPhoneCountry('+58');
    setNewPhoneOperator('0414');
    setNewPhoneLocal('');
  };

  const handleSelectAndLoad = (patient: SavedPatientEntry) => {
    onLoadRecipeToDoctor(patient);
    onClose();
  };

  const handleExecuteDelete = (patient: SavedPatientEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    // 1. Remove from session patients in local memory and localStorage
    const remaining = sessionPatients.filter(
      (p) => p.id !== patient.id && p.patientName.toLowerCase().trim() !== patient.patientName.toLowerCase().trim()
    );
    setSessionPatients(remaining);
    try {
      localStorage.setItem('digital_medic_patient_bank_v1', JSON.stringify(remaining));
    } catch (err) {}

    // 2. Blacklist ID and Name so it will not reappear from active recipes or records
    const newDeletedIds = [...deletedIds, patient.id];
    const newDeletedNames = [...deletedNames, patient.patientName.toLowerCase().trim()];
    setDeletedIds(newDeletedIds);
    setDeletedNames(newDeletedNames);
    try {
      localStorage.setItem('digital_medic_deleted_patient_ids_v1', JSON.stringify(newDeletedIds));
      localStorage.setItem('digital_medic_deleted_patient_names_v1', JSON.stringify(newDeletedNames));
    } catch (err) {}

    // 3. Clear selected state if this patient was selected
    if (selectedPatient?.id === patient.id) {
      setSelectedPatient(null);
    }
    setConfirmDeleteId(null);

    // 4. Notify parent component to update active records and recipes
    onDeletePatient?.(patient);

    // 5. User feedback
    setBankFeedbackToast(`✓ Paciente "${patient.patientName}" eliminado del banco.`);
    setTimeout(() => {
      setBankFeedbackToast(null);
    }, 3500);
  };

  const handleSendWhatsAppForPatient = (patient: SavedPatientEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    const docName = config?.doctorName || 'Médico Tratante';
    const specialty = config?.specialty || 'Especialista';
    const mpps = config?.mpps || '00.000';
    const ci = config?.ci || 'V-00.000.000';
    const phone = config?.phone || '';

    const text = 
      `*DIGITAL MEDIC - CONSULTORIO MÉDICO DIGITAL*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 *RÉCIPE Y DOCUMENTO MÉDICO OFICIAL*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `*Médico Tratante:* Dr(a). ${docName}\n` +
      `*Especialidad:* ${specialty}\n` +
      `*M.P.P.S:* ${mpps} · *C.I:* ${ci}\n\n` +
      `👤 *Paciente:* ${patient.patientName} (C.I: ${patient.patientCI})\n` +
      `📅 *Fecha de Emisión:* ${patient.date}\n` +
      `📌 *Diagnóstico:* ${patient.diagnosis}\n\n` +
      `*DETALLE DE MEDICAMENTOS E INDICACIONES:*\n` +
      `------------------------------------------\n` +
      `${patient.rp}\n` +
      `------------------------------------------\n\n` +
      `📄 *DOCUMENTO OFICIAL EN PDF:* \n` +
      `_El Dr(a). ${docName} ha emitido su archivo oficial en PDF: "Recipe_${patient.patientName.trim().replace(/\s+/g, '_')}_${patient.date.replace(/\//g, '-')}.pdf". Puede descargarlo o presentarlo en farmacias autorizadas._\n\n` +
      (phone ? `📞 *Contacto del Médico:* ${phone}\n` : '') +
      `⚖️ _Documento legal emitido digitalmente. Siga rigurosamente las indicaciones._`;

    const cleanNumber = (patient.patientPhone || '').replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(text);
    if (cleanNumber.length > 6) {
      window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  const handleDownloadPdfForPatient = async (patient: SavedPatientEntry, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Load patient to current doctor format
    onLoadRecipeToDoctor(patient);
    const cleanDate = (patient.date || new Date().toLocaleDateString('es-ES')).replace(/\//g, '-');
    const safePatient = patient.patientName.trim().replace(/[/\\?%*:|"<>]/g, '').replace(/\s+/g, '_');
    const filename = `Recipe_${safePatient}_${cleanDate}.pdf`;

    onClose();

    // Give DOM 150ms to mount loaded recipe into printable container
    setTimeout(async () => {
      const container = document.querySelector('.print-container, .recipe-single-container, .recipe-4en1-container, .report-sheet-container') as HTMLElement;
      if (container) {
        await exportElementAsPDF(container, filename);
      } else {
        try {
          window.print();
        } catch (_) {}
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs no-print animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-teal-300 shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white tracking-tight">
                  Banco de Pacientes & Récipes
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-400/30">
                  {allEntries.length} Registrados en Sesión
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Historial de pacientes atendidos, récipes grabados y consultas de su sesión
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{isAddingNew ? 'Ver Lista' : 'Nuevo Paciente'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {bankFeedbackToast && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shrink-0 shadow-sm animate-in fade-in duration-200">
            <span>{bankFeedbackToast}</span>
            <button
              onClick={() => setBankFeedbackToast(null)}
              className="text-white/80 hover:text-white text-xs underline font-normal cursor-pointer ml-3"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Search Bar & Module Tabs */}
        {!isAddingNew && (
          <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Buscar por Nombre, Cédula de Identidad, Diagnóstico o Fármaco..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0 bg-slate-200/80 p-1 rounded-xl text-xs">
              <button
                onClick={() => setFilterSource('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  filterSource === 'all'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({allEntries.length})
              </button>
              <button
                onClick={() => setFilterSource('recipe')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                  filterSource === 'recipe'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Récipes</span>
              </button>
              <button
                onClick={() => setFilterSource('historia')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                  filterSource === 'historia'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-3 h-3" />
                <span>Historias</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* Form to Add New Patient directly */}
          {isAddingNew ? (
            <form onSubmit={handleCreateNewPatient} className="max-w-xl mx-auto space-y-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Registrar Nuevo Paciente en Sesión</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: María Valentina Ramírez"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cédula de Identidad:</label>
                  <input
                    type="text"
                    placeholder="V-24.580.123"
                    value={newPatientCI}
                    onChange={(e) => setNewPatientCI(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Edad:</label>
                  <input
                    type="text"
                    placeholder="Ej: 32 años"
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono:</label>
                  <div className="flex gap-1.5">
                    {/* Country Selector */}
                    <select
                      value={newPhoneCountry}
                      onChange={(e) => {
                        const code = e.target.value;
                        setNewPhoneCountry(code);
                        if (code === '+58') setNewPhoneOperator('0414');
                        else if (code === '+57') setNewPhoneOperator('310');
                        else if (code === '+34') setNewPhoneOperator('6');
                        else if (code === '+56') setNewPhoneOperator('9');
                        else if (code === '+54') setNewPhoneOperator('9');
                        else setNewPhoneOperator('');
                      }}
                      className="w-[100px] px-1.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 shrink-0 cursor-pointer"
                    >
                      <option value="+58">🇻🇪 +58</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+54">🇦🇷 +54</option>
                    </select>

                    {/* Operator Selector */}
                    {['+58', '+57', '+34', '+56', '+54'].includes(newPhoneCountry) && (
                      <select
                        value={newPhoneOperator}
                        onChange={(e) => setNewPhoneOperator(e.target.value)}
                        className="w-[90px] px-1 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 shrink-0 cursor-pointer"
                      >
                        {newPhoneCountry === '+58' && (
                          <>
                            <option value="0414">0414</option>
                            <option value="0424">0424</option>
                            <option value="0412">0412</option>
                            <option value="0416">0416</option>
                            <option value="0426">0426</option>
                            <option value="">Libre</option>
                          </>
                        )}
                        {newPhoneCountry === '+57' && (
                          <>
                            <option value="310">310</option>
                            <option value="311">311</option>
                            <option value="312">312</option>
                            <option value="313">313</option>
                            <option value="315">315</option>
                            <option value="316">316</option>
                            <option value="300">300</option>
                            <option value="301">301</option>
                            <option value="">Libre</option>
                          </>
                        )}
                        {newPhoneCountry === '+34' && (
                          <>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="">Libre</option>
                          </>
                        )}
                        {['+56', '+54'].includes(newPhoneCountry) && (
                          <>
                            <option value="9">9</option>
                            <option value="">Libre</option>
                          </>
                        )}
                      </select>
                    )}

                    {/* Number input */}
                    <input
                      type="text"
                      value={newPhoneLocal}
                      onChange={(e) => setNewPhoneLocal(e.target.value.replace(/\D/g, ''))}
                      placeholder="Número"
                      maxLength={10}
                      className="flex-1 min-w-0 px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diagnóstico:</label>
                <input
                  type="text"
                  placeholder="Ej: Faringitis aguda / Dolor lumbar"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Indicaciones / Fármacos (Rp):</label>
                <textarea
                  rows={3}
                  placeholder="1. Amoxicilina 875mg: 1 tableta cada 12 horas por 7 días..."
                  value={newRp}
                  onChange={(e) => setNewRp(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar en Banco de Pacientes</span>
                </button>
              </div>
            </form>
          ) : (
            /* Patient List View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredPatients.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-bold text-slate-700">No se encontraron pacientes en este filtro</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Haga clic en "+ Nuevo Paciente" para registrar un paciente o emita un récipe en el consultorio.
                  </p>
                </div>
              ) : (
                filteredPatients.map((patient) => {
                  const isSelected = selectedPatient?.id === patient.id;
                  return (
                    <div
                      key={patient.id}
                      className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md ${
                        isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-300/60 bg-blue-50/20' 
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Top row: Name & Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0">
                              {patient.patientName?.slice(0, 2).toUpperCase() || 'PA'}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm leading-tight">
                                {patient.patientName}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                <span><strong>C.I:</strong> {patient.patientCI}</span>
                                {patient.patientAge && <span>· {patient.patientAge}</span>}
                              </div>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            patient.sourceModule === 'recipe'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {patient.sourceModule === 'recipe' ? 'Récipe' : 'Historia'}
                          </span>
                        </div>

                        {/* Date & Diagnosis */}
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-semibold flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {patient.date}
                            </span>
                            {patient.patientPhone && (
                              <span className="font-mono text-slate-600">{patient.patientPhone}</span>
                            )}
                          </div>
                          <p className="font-bold text-slate-800 text-xs truncate">
                            Dx: {patient.diagnosis}
                          </p>
                          {patient.rp && (
                            <p className="text-[11px] text-slate-600 font-mono line-clamp-2 bg-white p-1.5 rounded-lg border border-slate-200/80">
                              {patient.rp}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleSendWhatsAppForPatient(patient, e)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Enviar récipe por WhatsApp con mensaje oficial"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDownloadPdfForPatient(patient, e)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Descargar este documento en formato PDF"
                          >
                            <Download className="w-3 h-3 text-blue-600" />
                            <span>PDF</span>
                          </button>

                          {confirmDeleteId === patient.id ? (
                            <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-lg border border-rose-300">
                              <span className="text-[10px] font-black text-rose-800">¿Borrar?</span>
                              <button
                                type="button"
                                onClick={(e) => handleExecuteDelete(patient, e)}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[10px] shadow-xs cursor-pointer"
                                title="Confirmar eliminación permanente"
                              >
                                Sí, Borrar
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(null);
                                }}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded text-[10px] border border-slate-300 cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(patient.id);
                              }}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Borrar a este paciente del banco de datos"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Borrar Paciente</span>
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleSelectAndLoad(patient)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs ml-auto cursor-pointer"
                          title="Cargar los datos de este paciente al consultorio de récipes"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Cargar</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Los pacientes y récipes se mantienen memorizados durante su sesión clínica activa.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
};
