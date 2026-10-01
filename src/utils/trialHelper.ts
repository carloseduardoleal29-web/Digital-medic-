import { DoctorConfig } from '../types';

export interface TrialStatus {
  isTrial: boolean;
  isPaid: boolean;
  isExpired: boolean;
  daysLeft: number;
  totalDays: number;
  daysPassed: number;
  label: string;
  badgeColor: string;
}

/**
 * Calculates current trial / subscription status for a doctor profile
 */
export function getDoctorTrialStatus(doctor?: DoctorConfig | null): TrialStatus {
  if (!doctor) {
    return {
      isTrial: false,
      isPaid: false,
      isExpired: false,
      daysLeft: 0,
      totalDays: 0,
      daysPassed: 0,
      label: 'Sin perfil',
      badgeColor: 'bg-slate-700 text-slate-300',
    };
  }

  // Active paid client or Master Admin
  if (doctor.isAdmin || doctor.paymentStatus === 'activo' || (doctor.isPaidClient && doctor.paymentStatus !== 'prueba' && doctor.paymentStatus !== 'vencido')) {
    return {
      isTrial: false,
      isPaid: true,
      isExpired: false,
      daysLeft: 999,
      totalDays: 0,
      daysPassed: 0,
      label: doctor.isAdmin ? 'Acceso Administrador Master' : 'Suscripción Activa',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
  }

  // Explicitly expired
  if (doctor.paymentStatus === 'vencido') {
    return {
      isTrial: true,
      isPaid: false,
      isExpired: true,
      daysLeft: 0,
      totalDays: doctor.trialDaysTotal || 14,
      daysPassed: doctor.trialDaysTotal || 14,
      label: 'Prueba Vencida (Plazo cumplido)',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    };
  }

  // Pending activation
  if (doctor.paymentStatus === 'pendiente') {
    return {
      isTrial: false,
      isPaid: false,
      isExpired: false,
      daysLeft: 0,
      totalDays: 0,
      daysPassed: 0,
      label: 'Pago Pendiente',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    };
  }

  // Trial mode
  const totalDays = doctor.trialDaysTotal || 14;
  let startDate = doctor.trialStartDate ? new Date(doctor.trialStartDate).getTime() : null;
  let endDate = doctor.trialEndDate ? new Date(doctor.trialEndDate).getTime() : null;

  // Fallback if dates were not saved on older records
  if (!endDate) {
    if (startDate) {
      endDate = startDate + totalDays * 24 * 60 * 60 * 1000;
    } else {
      // Fallback from registration date or now
      endDate = Date.now() + totalDays * 24 * 60 * 60 * 1000;
      startDate = Date.now();
    }
  }

  const now = Date.now();
  const msRemaining = endDate - now;
  const daysLeft = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const daysPassed = Math.max(0, totalDays - daysLeft);
  const isExpired = daysLeft <= 0;

  if (isExpired) {
    return {
      isTrial: true,
      isPaid: false,
      isExpired: true,
      daysLeft: 0,
      totalDays,
      daysPassed: totalDays,
      label: 'Prueba de 14 días vencida',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    };
  }

  return {
    isTrial: true,
    isPaid: false,
    isExpired: false,
    daysLeft,
    totalDays,
    daysPassed,
    label: `${daysLeft} día(s) restante(s) de prueba`,
    badgeColor: daysLeft <= 3 
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
      : 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  };
}

/**
 * Initializes a 14-day free trial config for a new doctor registration
 */
export function createTrialConfig(days = 14) {
  const now = new Date();
  const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return {
    paymentStatus: 'prueba' as const,
    isPaidClient: false,
    subscriptionPlan: 'diseno-pro' as const, // During trial, allow Pro Design to experience all features
    paidPlanName: `Prueba Gratuita (${days} Días)`,
    trialStartDate: now.toISOString(),
    trialEndDate: endDate.toISOString(),
    trialDaysTotal: days,
  };
}
