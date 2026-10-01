import { DoctorConfig, RecipeItem, MedicalReport, IndicationsSheet, MedicalRestCert, ClinicalRecord, SavedPatientEntry } from '../types';

export interface UserEcosystem {
  identifier: string;
  email?: string;
  ci?: string;
  doctorConfig: DoctorConfig;
  colleagueProfiles?: DoctorConfig[];
  patientBank?: SavedPatientEntry[];
  recipes?: RecipeItem[];
  report?: MedicalReport;
  indications?: IndicationsSheet;
  rest?: MedicalRestCert;
  records?: ClinicalRecord[];
  customDrugs?: any[];
  updatedAt?: number;
}

/**
 * Guarda el ecosistema completo del usuario en el servidor en la nube.
 * Se asocia al correo o cédula del médico para que pueda acceder desde cualquier PC o teléfono.
 */
export async function saveEcosystemToCloud(ecosystem: Partial<UserEcosystem>): Promise<boolean> {
  if (!ecosystem) return false;
  try {
    const res = await fetch('/api/ecosystem/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ecosystem),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data && data.success;
  } catch (err) {
    console.error('[EcosystemSync] Error guardando ecosistema en la nube:', err);
    return false;
  }
}

/**
 * Obtiene el ecosistema completo del usuario desde el servidor en la nube.
 */
export async function fetchEcosystemFromCloud(identifier: string): Promise<UserEcosystem | null> {
  if (!identifier) return null;
  try {
    const res = await fetch(`/api/ecosystem/${encodeURIComponent(identifier.trim())}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.success && data.ecosystem) {
      return data.ecosystem as UserEcosystem;
    }
  } catch (err) {
    console.warn('[EcosystemSync] No se pudo obtener ecosistema en la nube:', err);
  }
  return null;
}

/**
 * Lee todo lo que está almacenado actualmente en el localStorage del dispositivo actual.
 */
export function exportAllLocalData(activeColleagueId?: string): Partial<UserEcosystem> {
  let colleagueProfiles: DoctorConfig[] = [];
  try {
    const saved = localStorage.getItem('digital_medic_colleagues_v2');
    if (saved) colleagueProfiles = JSON.parse(saved);
  } catch (_) {}

  const activeDoc = colleagueProfiles.find(p => p.id === activeColleagueId) || colleagueProfiles[0];

  let patientBank: SavedPatientEntry[] = [];
  try {
    const saved = localStorage.getItem('digital_medic_patient_bank_v1');
    if (saved) patientBank = JSON.parse(saved);
  } catch (_) {}

  let recipes: RecipeItem[] = [];
  try {
    const saved = localStorage.getItem('digital_medic_recipes_v2');
    if (saved) recipes = JSON.parse(saved);
  } catch (_) {}

  let report: MedicalReport | undefined;
  try {
    const saved = localStorage.getItem('digital_medic_report_v2');
    if (saved) report = JSON.parse(saved);
  } catch (_) {}

  let indications: IndicationsSheet | undefined;
  try {
    const saved = localStorage.getItem('digital_medic_indications_v2');
    if (saved) indications = JSON.parse(saved);
  } catch (_) {}

  let rest: MedicalRestCert | undefined;
  try {
    const saved = localStorage.getItem('digital_medic_rest_v2');
    if (saved) rest = JSON.parse(saved);
  } catch (_) {}

  let records: ClinicalRecord[] = [];
  try {
    const saved = localStorage.getItem('digital_medic_records_v2');
    if (saved) records = JSON.parse(saved);
  } catch (_) {}

  let customDrugs: any[] = [];
  try {
    const saved = localStorage.getItem('digital_medic_custom_drugs_v2');
    if (saved) customDrugs = JSON.parse(saved);
  } catch (_) {}

  const email = activeDoc?.email || 'admin@digitalmedic.com';
  const ci = activeDoc?.ci || '';

  return {
    identifier: email,
    email,
    ci,
    doctorConfig: activeDoc,
    colleagueProfiles,
    patientBank,
    recipes,
    report,
    indications,
    rest,
    records,
    customDrugs,
    updatedAt: Date.now(),
  };
}

/**
 * Guarda los datos de un ecosistema de la nube en el localStorage de este dispositivo.
 */
export function applyEcosystemToLocalStorage(ecosystem: UserEcosystem): void {
  try {
    if (ecosystem.colleagueProfiles && Array.isArray(ecosystem.colleagueProfiles) && ecosystem.colleagueProfiles.length > 0) {
      localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(ecosystem.colleagueProfiles));
    } else if (ecosystem.doctorConfig) {
      localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify([ecosystem.doctorConfig]));
    }

    if (ecosystem.doctorConfig?.id) {
      localStorage.setItem('digital_medic_active_colleague', ecosystem.doctorConfig.id);
      localStorage.setItem('digital_medic_active_doctor_session', ecosystem.doctorConfig.id);
    }

    if (ecosystem.patientBank && Array.isArray(ecosystem.patientBank)) {
      localStorage.setItem('digital_medic_patient_bank_v1', JSON.stringify(ecosystem.patientBank));
    }

    if (ecosystem.recipes && Array.isArray(ecosystem.recipes) && ecosystem.recipes.length > 0) {
      localStorage.setItem('digital_medic_recipes_v2', JSON.stringify(ecosystem.recipes));
    }

    if (ecosystem.report) {
      localStorage.setItem('digital_medic_report_v2', JSON.stringify(ecosystem.report));
    }

    if (ecosystem.indications) {
      localStorage.setItem('digital_medic_indications_v2', JSON.stringify(ecosystem.indications));
    }

    if (ecosystem.rest) {
      localStorage.setItem('digital_medic_rest_v2', JSON.stringify(ecosystem.rest));
    }

    if (ecosystem.records && Array.isArray(ecosystem.records) && ecosystem.records.length > 0) {
      localStorage.setItem('digital_medic_records_v2', JSON.stringify(ecosystem.records));
    }

    if (ecosystem.customDrugs && Array.isArray(ecosystem.customDrugs)) {
      localStorage.setItem('digital_medic_custom_drugs_v2', JSON.stringify(ecosystem.customDrugs));
    }
  } catch (err) {
    console.warn('[EcosystemSync] Error al escribir en localStorage:', err);
  }
}
