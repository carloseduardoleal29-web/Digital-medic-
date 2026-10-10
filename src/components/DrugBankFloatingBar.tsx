import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Pill, Plus, Search, BookmarkPlus, Sparkles, X, Check, Database } from 'lucide-react';
import { DEFAULT_DRUGS, SPECIALTY_LABELS, DrugItem, getAllDrugs, searchDrugs } from '../data/drugDatabase';

interface DrugBankFloatingBarProps {
  onAddDrugToRecipe: (drugText: string, targetRecipeIndex: number) => void;
  recipesCount: number;
  activeRecipeIndex: number;
  isIndicationsMode?: boolean;
}

export const DrugBankFloatingBar: React.FC<DrugBankFloatingBarProps> = ({
  onAddDrugToRecipe,
  recipesCount,
  activeRecipeIndex,
  isIndicationsMode = false,
}) => {
  // Custom drugs stored locally so new additions persist
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

  const [fastSearchQuery, setFastSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('todas');
  const [selectedDrugId, setSelectedDrugId] = useState('');
  const [targetIndex, setTargetIndex] = useState(activeRecipeIndex);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customDrugName, setCustomDrugName] = useState('');
  const [customPresentation, setCustomPresentation] = useState('');
  const [justInsertedMessage, setJustInsertedMessage] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync targetIndex when activeRecipeIndex changes from parent
  useEffect(() => {
    setTargetIndex(activeRecipeIndex);
  }, [activeRecipeIndex]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // All combined drugs (system + custom)
  const allDrugs = useMemo(() => {
    return getAllDrugs(customDrugs);
  }, [customDrugs]);

  // Fast search results (instant autocomplete e.g. "aspi" -> "Aspirina")
  const fastSearchResults = useMemo(() => {
    if (!fastSearchQuery.trim()) return [];
    return searchDrugs(fastSearchQuery, customDrugs);
  }, [fastSearchQuery, customDrugs]);

  // Drugs filtered by specialty dropdown
  const specialtyDrugs = useMemo(() => {
    if (selectedSpecialty === 'todas') {
      return allDrugs;
    }
    if (selectedSpecialty === 'personalizados') {
      return customDrugs;
    }
    return DEFAULT_DRUGS[selectedSpecialty] || [];
  }, [selectedSpecialty, allDrugs, customDrugs]);

  // Current selected drug in traditional dropdown
  const currentSelectedDrug = useMemo(() => {
    return specialtyDrugs.find((d) => d.id === selectedDrugId) || specialtyDrugs[0];
  }, [specialtyDrugs, selectedDrugId]);

  // Format and insert drug: ONLY Drug Name and Presentation
  const insertDrugIntoTarget = (drugName: string, presentation: string) => {
    const cleanName = drugName.trim();
    const cleanPres = presentation.trim();
    // En el banco de fármacos solo deja el fármaco y la presentación. La descripción la hace el médico en las indicaciones médicas.
    const formattedText = cleanPres ? `${cleanName} (${cleanPres})` : cleanName;
    
    onAddDrugToRecipe(formattedText, targetIndex);
    
    setJustInsertedMessage(`✓ Insertado: ${formattedText}`);
    setTimeout(() => {
      setJustInsertedMessage(null);
    }, 2500);

    setIsSearchDropdownOpen(false);
  };

  // Handle traditional insert button click
  const handleInsertFromSelector = () => {
    if (!currentSelectedDrug) return;
    insertDrugIntoTarget(currentSelectedDrug.name, currentSelectedDrug.presentation);
  };

  // Handle quick search Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (fastSearchResults.length > 0) {
        const top = fastSearchResults[0];
        insertDrugIntoTarget(top.name, top.presentation);
        setFastSearchQuery('');
      } else if (fastSearchQuery.trim()) {
        // Quick add custom if not found
        setCustomDrugName(fastSearchQuery.trim());
        setShowAddCustom(true);
        setIsSearchDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsSearchDropdownOpen(false);
    }
  };

  // Handle add custom drug form submit
  const handleSaveCustomDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDrugName.trim()) return;

    const newDrug: DrugItem = {
      id: `custom-${Date.now()}`,
      name: customDrugName.trim(),
      presentation: customPresentation.trim() || 'Presentación personalizada',
      dosage: '',
      instructions: '',
      specialty: 'personalizados',
    };

    const updatedCustom = [newDrug, ...customDrugs];
    setCustomDrugs(updatedCustom);
    try {
      localStorage.setItem('digital_medic_custom_drugs_v2', JSON.stringify(updatedCustom));
    } catch (err) {
      console.error(err);
    }

    insertDrugIntoTarget(newDrug.name, newDrug.presentation);

    setCustomDrugName('');
    setCustomPresentation('');
    setShowAddCustom(false);
  };

  // Collapsible state so Drug Bank doesn't clutter patient data entry
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Quick suggestion tags
  const quickSearchPills = [
    { label: 'aspi', drug: 'Aspirina 100mg' },
    { label: 'ibu', drug: 'Ibuprofeno' },
    { label: 'amox', drug: 'Amoxicilina' },
    { label: 'omep', drug: 'Omeprazol' },
    { label: 'aceta', drug: 'Acetaminofén' },
    { label: 'losar', drug: 'Losartán' },
  ];

  return (
    <div className="w-full bg-white border border-blue-200 rounded-2xl p-3 sm:p-3.5 shadow-sm text-xs mb-4 no-print transition-all">
      
      {/* Top Title & Collapsible Header Zone */}
      <div className="flex flex-col gap-2.5">
        
        {/* Main Row: Header + Collapsible Toggle + Fast Search Bar + Destination Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Bank Badge with Toggle Collapsed Button */}
          <div className="flex items-center gap-2 font-bold text-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all flex items-center gap-1 cursor-pointer"
              title={isCollapsed ? "Desplegar banco de fármacos para colocar medicamentos" : "Ocultar banco de fármacos para colocar datos del paciente"}
            >
              <Pill className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-black">{isCollapsed ? '▼ Desplegar Fármacos' : '▲ Ocultar'}</span>
            </button>

            <div>
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-extrabold text-slate-900 text-[13px]">Banco de Fármacos</span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-full">
                  Fármacos & Presentaciones
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-normal hidden sm:block">
                {isIndicationsMode 
                  ? 'Inserte el fármaco directamente a las indicaciones' 
                  : 'Desplegable solo al prescribir medicamentos'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Destination Selector (when 4-in-1 or multiple recipes) */}
            {recipesCount > 1 && !isIndicationsMode && (
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 shrink-0">
                <span className="text-[11px] font-bold text-slate-600">Destino:</span>
                <select
                  value={targetIndex}
                  onChange={(e) => setTargetIndex(parseInt(e.target.value))}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {Array.from({ length: recipesCount }).map((_, idx) => (
                    <option key={idx} value={idx}>
                      Récipe #{idx + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* PROMINENT ACTION: Add Custom Drug Button (Si no aparece en la lista) */}
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setShowAddCustom(!showAddCustom);
                if (!showAddCustom && fastSearchQuery) {
                  setCustomDrugName(fastSearchQuery);
                }
              }}
              className={`px-3.5 py-1.5 rounded-full font-black flex items-center gap-1.5 border transition-all text-xs shrink-0 cursor-pointer shadow-xs ${
                showAddCustom
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 hover:scale-105 active:scale-95'
              }`}
              title="Agregar fármaco personalizado si no aparece en el listado"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Agregar Fármaco (si no aparece en la lista)</span>
            </button>
          </div>
        </div>

        {/* IF COLLAPSED: SHOW MINIMAL QUICK BAR OR CLICK TO EXPAND */}
        {!isCollapsed && (
          <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">

        {/* PROMINENT LIVE SEARCH BAR (Búsqueda Rápida Instantánea) */}
        <div ref={searchContainerRef} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-blue-600 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={fastSearchQuery}
              onChange={(e) => {
                setFastSearchQuery(e.target.value);
                setIsSearchDropdownOpen(true);
              }}
              onFocus={() => {
                if (fastSearchQuery.trim()) {
                  setIsSearchDropdownOpen(true);
                }
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="🔍 Búsqueda rápida instantánea... (ej: escriba 'aspi' para autocompletar Aspirina, 'ibu', 'amox')"
              className="w-full pl-10 pr-24 py-2 bg-blue-50/40 hover:bg-blue-50/60 focus:bg-white border-2 border-blue-300 focus:border-blue-600 rounded-xl text-slate-900 font-medium text-xs placeholder:text-slate-400 outline-none transition-all shadow-2xs"
            />
            
            {/* Clear button or Enter reminder */}
            <div className="absolute right-2 flex items-center gap-1.5">
              {fastSearchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setFastSearchQuery('');
                    setIsSearchDropdownOpen(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded">
                  Presione Enter
                </span>
              )}
            </div>
          </div>

          {/* Quick Filter Shortcuts (Pills: aspi, ibu, amox, omep...) */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-500 text-[10.5px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Atajos rápidos:
            </span>
            {quickSearchPills.map((pill) => (
              <button
                key={pill.label}
                type="button"
                onClick={() => {
                  setFastSearchQuery(pill.label);
                  setIsSearchDropdownOpen(true);
                }}
                className={`px-2 py-0.5 rounded-lg border font-medium transition-all ${
                  fastSearchQuery.toLowerCase() === pill.label.toLowerCase()
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                    : 'bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                ⚡ {pill.label} <span className="text-[9.5px] opacity-75 font-normal">({pill.drug})</span>
              </button>
            ))}
          </div>

          {/* INSTANT SEARCH RESULTS DROPDOWN */}
          {isSearchDropdownOpen && fastSearchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border-2 border-blue-500 rounded-xl shadow-2xl overflow-hidden max-h-[320px] flex flex-col animate-in fade-in-50 duration-100">
              {/* Header of results */}
              <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-[11px] text-blue-900 font-bold">
                <span>
                  Resultados encontrados para "{fastSearchQuery}" ({fastSearchResults.length})
                </span>
                <span className="text-[10px] text-blue-600 font-normal">
                  Haga clic en "+ Insertar" o presione Enter
                </span>
              </div>

              {/* Results List */}
              <div className="overflow-y-auto divide-y divide-slate-100">
                {fastSearchResults.length > 0 ? (
                  fastSearchResults.map((drug) => (
                    <div
                      key={drug.id}
                      onClick={() => insertDrugIntoTarget(drug.name, drug.presentation)}
                      className="px-3.5 py-2.5 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between gap-3 group transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-700">
                            {drug.name}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold border border-slate-200 shrink-0">
                            {drug.presentation}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-slate-400 mt-0.5 truncate">
                          Especialidad: {SPECIALTY_LABELS[drug.specialty] || drug.specialty || 'General'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          insertDrugIntoTarget(drug.name, drug.presentation);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs shrink-0 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insertar</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-slate-600 font-medium mb-2">
                      No se encontró ningún fármaco grabado con "{fastSearchQuery}".
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomDrugName(fastSearchQuery.trim());
                        setShowAddCustom(true);
                        setIsSearchDropdownOpen(false);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg inline-flex items-center gap-1.5 text-xs transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Registrar "{fastSearchQuery.trim()}" en el sistema ahora</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FEEDBACK BANNER WHEN INSERTED */}
        {justInsertedMessage && (
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{justInsertedMessage}</span>
          </div>
        )}

        {/* CUSTOM DRUG FORM (ONLY FÁRMACO + PRESENTACIÓN) */}
        {showAddCustom && (
          <form
            onSubmit={handleSaveCustomDrug}
            className="p-3 bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-200 rounded-xl flex flex-wrap items-end gap-2.5 mt-1"
          >
            <div className="flex-1 min-w-[220px]">
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Nombre del Fármaco (Comercial o Genérico):
              </label>
              <input
                type="text"
                placeholder="ej: Aspirina 100mg, Omeprazol 40mg, etc."
                value={customDrugName}
                onChange={(e) => setCustomDrugName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                required
                autoFocus
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Presentación del Fármaco:
              </label>
              <input
                type="text"
                placeholder="ej: Tabletas, Cápsulas, Ampollas, Jarabe 120ml..."
                value={customPresentation}
                onChange={(e) => setCustomPresentation(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Guardar e Insertar</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
            
            <div className="w-full text-[10.5px] text-slate-500 italic">
              ℹ El fármaco quedará guardado permanentemente en el sistema para que al buscarlo de nuevo con búsqueda rápida aparezca al instante.
            </div>
          </form>
        )}

        {/* TRADITIONAL SELECTOR (POR ESPECIALIDAD O CATÁLOGO COMPLETO) */}
        <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1 font-semibold text-slate-600 shrink-0">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Explorar catálogo:</span>
          </div>

          {/* 1. Specialty Dropdown (including "Todas las Especialidades") */}
          <div className="min-w-[160px] flex-1">
            <select
              value={selectedSpecialty}
              onChange={(e) => {
                setSelectedSpecialty(e.target.value);
                setSelectedDrugId('');
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="todas">📚 Todas las Especialidades ({allDrugs.length} fármacos)</option>
              {customDrugs.length > 0 && (
                <option value="personalizados">⭐ Mis Fármacos Guardados ({customDrugs.length})</option>
              )}
              {Object.entries(SPECIALTY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Drug Selector (Shows Drug and Presentation) */}
          <div className="min-w-[240px] flex-[1.8]">
            <select
              value={currentSelectedDrug?.id || ''}
              onChange={(e) => setSelectedDrugId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 outline-none truncate"
            >
              {specialtyDrugs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.presentation}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Insert Button */}
          <button
            type="button"
            onClick={handleInsertFromSelector}
            disabled={!currentSelectedDrug}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 disabled:opacity-50"
            title="Inyectar al récipe activo"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insertar al Récipe</span>
          </button>
        </div>
          </div>
        )}

      </div>

    </div>
  );
};
