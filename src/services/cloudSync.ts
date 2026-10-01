import { DoctorConfig } from '../types';

const STORAGE_KEY = 'digital_medic_doctors_cache';

export async function fetchDoctorsFromCloud(): Promise<DoctorConfig[] | null> {
  try {
    const res = await fetch('/api/doctors');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.doctors)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.doctors));
        return data.doctors;
      }
    }
  } catch (err) {
    console.warn('[CloudSync] Could not fetch doctors from cloud API, using local cache:', err);
  }

  // Fallback to local storage cache
  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      return JSON.parse(localData);
    }
  } catch (err) {
    console.warn('[CloudSync] Could not read local doctors cache:', err);
  }
  return null;
}

export async function saveDoctorsToCloud(doctors: DoctorConfig[]): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doctors));
  } catch (e) {
    console.warn('[CloudSync] Local cache write error:', e);
  }

  try {
    const res = await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctors }),
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data && data.success);
    }
  } catch (err) {
    console.error('[CloudSync] Error saving doctors to cloud API:', err);
  }
  return false;
}

export async function saveSingleDoctorToCloud(doctor: DoctorConfig): Promise<boolean> {
  // Update local cache first for instant responsiveness
  try {
    const existing = (await fetchDoctorsFromCloud()) || [];
    const index = existing.findIndex(d => d.id === doctor.id || (d.email && d.email.toLowerCase() === (doctor.email || '').toLowerCase()));
    if (index >= 0) {
      existing[index] = doctor;
    } else {
      existing.push(doctor);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn('[CloudSync] Error updating local cache:', e);
  }

  try {
    const res = await fetch('/api/doctors/save-one', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctor),
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data && data.success);
    }
  } catch (err) {
    console.error('[CloudSync] Error saving single doctor to cloud:', err);
  }
  return false;
}

export async function deleteDoctorFromCloud(id: string): Promise<boolean> {
  try {
    const existing = (await fetchDoctorsFromCloud()) || [];
    const filtered = existing.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('[CloudSync] Error deleting from local cache:', e);
  }

  try {
    const res = await fetch(`/api/doctors/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data && data.success);
    }
  } catch (err) {
    console.error('[CloudSync] Error deleting doctor from cloud:', err);
  }
  return false;
}

export async function fetchDoctorByIdentifier(identifier: string): Promise<DoctorConfig | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();

  try {
    const res = await fetch(`/api/doctors/${encodeURIComponent(clean)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.doctor) {
        return data.doctor;
      }
    }
  } catch (err) {
    console.warn('[CloudSync] Could not fetch doctor by identifier from cloud:', err);
  }

  // Fallback to local cache
  try {
    const existing = (await fetchDoctorsFromCloud()) || [];
    const cleanDigits = clean.replace(/[^a-z0-9]/gi, '');
    const found = existing.find(d => {
      const dId = (d.id || '').toLowerCase();
      const dEmail = (d.email || '').toLowerCase();
      const dCI = (d.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
      const dName = (d.doctorName || d.profileName || '').toLowerCase();
      return dId === clean || dEmail === clean || (cleanDigits && dCI === cleanDigits) || dName.includes(clean);
    });
    return found || null;
  } catch (err) {
    console.warn('[CloudSync] Could not search local doctor cache:', err);
  }
  return null;
}

export async function syncDoctorsWithCloud(doctors: DoctorConfig[]): Promise<DoctorConfig[] | null> {
  try {
    const res = await fetch('/api/doctors/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctors }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.doctors)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.doctors));
        return data.doctors;
      }
    }
  } catch (err) {
    console.error('[CloudSync] Error syncing doctors with cloud:', err);
  }
  await saveDoctorsToCloud(doctors);
  return doctors;
}

export async function resetAllDoctorsInCloud(): Promise<boolean> {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}

  try {
    const res = await fetch('/api/doctors/reset-all', {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data && data.success);
    }
  } catch (err) {
    console.error('[CloudSync] Error resetting doctors in cloud:', err);
  }
  return true;
}