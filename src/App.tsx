import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, 
  FileText, 
  Grid2X2, 
  FileCheck2, 
  Users, 
  ClipboardList, 
  ShieldCheck, 
  Printer, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  Menu, 
  X, 
  Check,
  AlertCircle,
  Sparkles, 
  Stethoscope, 
  Pill, 
  RotateCcw, 
  Lock, 
  Unlock, 
  KeyRound, 
  UserCheck, 
  Share2, 
  FolderOpen, 
  Coins, 
  Home, 
  Trash2, 
  LogOut,
  ArrowLeft,
  ChevronRight,
  Clock,
  Key,
  Cloud,
  CreditCard,
  Crown,
  Monitor,
  Smartphone
} from 'lucide-react';

import { 
  DoctorConfig, 
  RecipeItem, 
  ClinicalRecord, 
  MedicalReport, 
  IndicationsSheet, 
  MedicalRestCert, 
  ActiveModule 
} from './types';

import { DEFAULT_DOCTOR_CONFIG, createDoctorStampSVG, createCalligraphicSignatureSVG, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, MEDICINE_EMBLEM_ESCULAPIO_SVG, CARLOS_LEAL_DEVELOPER_BADGE_SVG, CARLOS_LEAL_DEVELOPER_LOGO_SVG } from './data/defaultAssets';
import { LiveDesignerPanel } from './components/LiveDesignerPanel';
import { CintilloTopRibbon } from './components/CintilloTopRibbon';
import MasterRecipeView from './components/MasterRecipeView';
import { ProgressiveRecipeWizard } from './components/ProgressiveRecipeWizard';
import { FourInOneRecipeView } from './components/FourInOneRecipeView';
import { DrugBankFloatingBar } from './components/DrugBankFloatingBar';
import { ReportsModule } from './components/ReportsModule';
import ClinicalHistoryModule from './components/ClinicalHistoryModule';
import { IndicationsModule } from './components/IndicationsModule';
import { MedicalRestModule } from './components/MedicalRestModule';
import { SignatureCanvasModal } from './components/SignatureCanvasModal';
import { MasterPinModal } from './components/MasterPinModal';
import { ShareWithDoctorModal } from './components/ShareWithDoctorModal';
import { UniversalPreviewModal } from './components/UniversalPreviewModal';
import { DoctorVaultModal } from './components/DoctorVaultModal';
import { SubscriptionBillingPanel } from './components/SubscriptionBillingPanel';
import DoctorAuthModal from './components/DoctorAuthModal';
import { DoctorOnboardingWizard } from './components/DoctorOnboardingWizard';
import { WelcomeInicioModule } from './components/WelcomeInicioModule';
import { AdminPanelModal } from './components/AdminPanelModal';
import { SecretAdminPromptModal } from './components/SecretAdminPromptModal';
import { SubscriptionRequiredModal } from './components/SubscriptionRequiredModal';
import { BlankRecipeWelcomeModal } from './components/BlankRecipeWelcomeModal';
import { DoctorLeftDrawer } from './components/DoctorLeftDrawer';
import { CeLealStudioLogo } from './components/CeLealStudioLogo';
import { PatientBankModal, SavedPatientEntry } from './components/PatientBankModal';
import { SaveAndShareSuccessModal, SavedDocumentRecord } from './components/SaveAndShareSuccessModal';
import { EmailShareModal } from './components/EmailShareModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { TrialExpiredModal } from './components/TrialExpiredModal';
import { PendingPaymentNotice } from './components/PendingPaymentNotice';
import { PWAInstallButton } from './components/PWAInstallButton';
import { SyncDevicesModal } from './components/SyncDevicesModal';
import { EditPaymentConfigModal } from './components/EditPaymentConfigModal';
import { getDoctorTrialStatus, createTrialConfig } from './utils/trialHelper';
import { getStoredDoctorSessionId, storeDoctorSessionId, clearDoctorSessionId } from './utils/sessionHelper';
import { fetchDoctorsFromCloud, saveDoctorsToCloud, saveSingleDoctorToCloud, deleteDoctorFromCloud, resetAllDoctorsInCloud, syncDoctorsWithCloud } from './services/cloudSync';
import { 
  UserEcosystem, 
  fetchEcosystemFromCloud, 
  saveEcosystemToCloud, 
  exportAllLocalData, 
  applyEcosystemToLocalStorage 
} from './services/ecosystemSync';
import { saveDirectToFirestore, subscribeToPaymentConfig, subscribeToUserEcosystem } from './services/firebaseClient';
import { fetchPaymentConfig } from './services/paymentConfigService';
import { exportElementAsPDF, sharePDFViaWebShare, generatePDFBlob, buildDocumentPdfFilename, showWhatsAppClipAlert, buildWhatsAppTreatmentMessage } from './utils/exportDocument';
import { compressDoctorConfigImages } from './utils/imageCompressor';

/**
 * Helper de Fusión Inmutable No Destructiva para Diseños Médicos
 * Garantiza que logos, colores, letras, marcas de agua y firmas NUNCA se borren
 * ni sean sobreescritos por cadenas vacías o plantillas por defecto.
 */
export const mergeDoctorConfigs = (base: DoctorConfig, incoming: Partial<DoctorConfig>): DoctorConfig => {
  const result: DoctorConfig = { ...base, ...incoming };

  const preserveNonEmpty = (key: keyof DoctorConfig) => {
    const baseVal = base[key];
    const incomingVal = incoming[key];
    if (baseVal && typeof baseVal === 'string' && baseVal.trim().length > 0) {
      if (!incomingVal || (typeof incomingVal === 'string' && incomingVal.trim().length === 0)) {
        (result as any)[key] = baseVal;
      }
    }
  };

  // Preservación estricta de activos del estudio de diseño
  preserveNonEmpty('logoIzq');
  preserveNonEmpty('logoDer');
  preserveNonEmpty('marcaAgua');
  preserveNonEmpty('selloImg');
  preserveNonEmpty('firmaImg');
  preserveNonEmpty('selloFirma');
  preserveNonEmpty('primaryDocColor');
  preserveNonEmpty('headerColor');
  preserveNonEmpty('fuenteHeader');
  preserveNonEmpty('fuenteNombre');
  preserveNonEmpty('specialty');
  preserveNonEmpty('specialtyColor');
  preserveNonEmpty('fuenteSpecialty');
  preserveNonEmpty('doctorName');
  preserveNonEmpty('ci');
  preserveNonEmpty('mpps');
  preserveNonEmpty('phone');
  preserveNonEmpty('email');
  preserveNonEmpty('rxTitle');
  preserveNonEmpty('rxTitleColor');
  preserveNonEmpty('rxBodyFontFamily');
  preserveNonEmpty('bodyFontSize');

  if (incoming.watermarkOpacity !== undefined && incoming.watermarkOpacity !== null) {
    result.watermarkOpacity = incoming.watermarkOpacity;
  } else if (base.watermarkOpacity !== undefined) {
    result.watermarkOpacity = base.watermarkOpacity;
  }

  if (incoming.watermarkScale !== undefined && incoming.watermarkScale !== null) {
    result.watermarkScale = incoming.watermarkScale;
  } else if (base.watermarkScale !== undefined) {
    result.watermarkScale = base.watermarkScale;
  }

  if (incoming.watermarkRotation !== undefined && incoming.watermarkRotation !== null) {
    result.watermarkRotation = incoming.watermarkRotation;
  } else if (base.watermarkRotation !== undefined) {
    result.watermarkRotation = base.watermarkRotation;
  }

  return result;
};

export default function App() {
  // 1. Colleagues Profiles Management - Robust persistent profile state
  const [colleagueProfiles, setColleagueProfiles] = useState<DoctorConfig[]>(() => {
    let masterAdminDefault: DoctorConfig = {
      ...DEFAULT_DOCTOR_CONFIG,
      id: 'doc-admin-master',
      profileName: 'Dr. Carlos E. Leal S.',
      doctorName: 'Dr. Carlos E. Leal S.',
      specialty: 'Especialista en Anestesiología y Reanimación',
      mpps: '94.228',
      ci: '15.489.288',
      collegeNumber: '',
      phone: '+584243291438',
      email: 'carloseduardoleal29@gmail.com',
      password: '2534',
      paymentStatus: 'activo',
      isPaidClient: true,
      paidPlanName: 'Acceso Master Administrador',
      isAdmin: true,
      isVip: true,
      socialHandle: '',
      socialHandle2: '',
      institution: '',
      institutionDetails: '',
      headerStyle: 'clasico',
      headerLayout: 'ambos-logos',
      primaryDocColor: '#2563eb',
      headerColor: '#1e3a8a',
    };

    // Si hay un diseño guardado directamente en digital_medic_current_config, cargarlo primero
    try {
      const savedCurrent = localStorage.getItem('digital_medic_current_config');
      if (savedCurrent) {
        const parsedCurrent = JSON.parse(savedCurrent);
        if (parsedCurrent && typeof parsedCurrent === 'object') {
          masterAdminDefault = mergeDoctorConfigs(masterAdminDefault, parsedCurrent);
        }
      }
    } catch (_) {}

    const saved = localStorage.getItem('digital_medic_colleagues_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map((d: DoctorConfig): DoctorConfig => {
            let cleanDoc = { ...d };
            if (cleanDoc.id === 'doc-admin-master' || cleanDoc.email === 'carloseduardoleal29@gmail.com') {
              cleanDoc = mergeDoctorConfigs(masterAdminDefault, cleanDoc);
              return {
                ...cleanDoc,
                doctorName: cleanDoc.doctorName || 'Dr. Carlos E. Leal S.',
                profileName: cleanDoc.profileName || 'Dr. Carlos E. Leal S.',
                specialty: cleanDoc.specialty || 'Especialista en Anestesiología y Reanimación',
                mpps: cleanDoc.mpps || '94.228',
                ci: cleanDoc.ci || '15.489.288',
                collegeNumber: cleanDoc.collegeNumber !== undefined ? cleanDoc.collegeNumber : '',
                phone: cleanDoc.phone || '+584243291438',
                email: cleanDoc.email || 'carloseduardoleal29@gmail.com',
                socialHandle: cleanDoc.socialHandle !== undefined ? cleanDoc.socialHandle : '',
                socialHandle2: cleanDoc.socialHandle2 !== undefined ? cleanDoc.socialHandle2 : '',
                institution: cleanDoc.institution !== undefined ? cleanDoc.institution : '',
                institutionDetails: cleanDoc.institutionDetails !== undefined ? cleanDoc.institutionDetails : '',
                isAdmin: true,
                isPaidClient: true,
                isVip: true,
                paymentStatus: 'activo' as const,
              };
            }
            return cleanDoc as DoctorConfig;
          });
          
          const hasMaster = cleaned.some(d => d.email === 'carloseduardoleal29@gmail.com' || d.id === 'doc-admin-master' || d.isAdmin);
          if (!hasMaster) {
            cleaned.unshift(masterAdminDefault);
          }
          if (cleaned.length > 0) return cleaned;
        }
      } catch (e) {}
    }
    return [masterAdminDefault];
  });

  // 1.1 Patient Bank State for real-time synchronization
  const [patientBank, setPatientBank] = useState<SavedPatientEntry[]>(() => {
    try {
      const saved = localStorage.getItem('digital_medic_patient_bank_v1');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const [activeColleagueId, setActiveColleagueId] = useState<string>(() => {
    const storedSession = getStoredDoctorSessionId();
    if (storedSession) return storedSession;
    try {
      const storedActive = localStorage.getItem('digital_medic_active_colleague');
      if (storedActive) return storedActive;
    } catch (_) {}
    return 'doc-admin-master';
  });

  // User Identity & Sync Safety Helpers
  const normalizeUserKey = (str?: string | null): string => {
    if (!str) return '';
    return str.toLowerCase().trim().replace(/[^a-z0-9]/gi, '');
  };

  const isUserLoaded = (_ident?: string | null): boolean => {
    // True security check: Allow all sync and saves unconditionally so edits are never lost
    return true;
  };

  // Current active doctor configuration (con respaldo de digital_medic_current_config)
  const config = (() => {
    const found = colleagueProfiles.find((p) => p.id === activeColleagueId || (p.email && activeColleagueId && p.email.toLowerCase() === activeColleagueId.toLowerCase())) || colleagueProfiles[0] || DEFAULT_DOCTOR_CONFIG;
    try {
      const directSaved = localStorage.getItem('digital_medic_current_config');
      if (directSaved) {
        const parsed = JSON.parse(directSaved);
        if (parsed && (parsed.id === found.id || parsed.email === found.email)) {
          return mergeDoctorConfigs(found, parsed);
        }
      }
    } catch (_) {}
    return found;
  })();

  const updateCurrentConfig = (updated: Partial<DoctorConfig>) => {
    hasUserEditedStateRef.current = true;
    const updatedFull = mergeDoctorConfigs(config, { ...updated, updatedAt: Date.now() });

    setColleagueProfiles((prev) => {
      const exists = prev.some((p) => p.id === config.id || (p.email && config.email && p.email.toLowerCase() === config.email.toLowerCase()));
      const nextProfiles = exists
        ? prev.map((p) => (p.id === config.id || (p.email && config.email && p.email.toLowerCase() === config.email.toLowerCase()) ? updatedFull : p))
        : [updatedFull, ...prev];

      try {
        localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(nextProfiles));
        localStorage.setItem('digital_medic_current_config', JSON.stringify(updatedFull));
        localStorage.setItem('digital_medic_active_colleague', updatedFull.id);
      } catch (lsErr) {
        console.warn('LocalStorage error in updateCurrentConfig:', lsErr);
      }

      return nextProfiles;
    });

    const ident = updatedFull.email || updatedFull.ci || updatedFull.id || 'carloseduardoleal29@gmail.com';

    // Debounce save al servidor y Firestore backend
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await saveSingleDoctorToCloud(updatedFull);
      
      let paymentConfig: any = null;
      try {
        const pmSaved = localStorage.getItem('digital_medic_payment_config_v4');
        if (pmSaved) paymentConfig = JSON.parse(pmSaved);
      } catch (_) {}

      await saveEcosystemToCloud({
        identifier: ident,
        email: updatedFull.email,
        ci: updatedFull.ci,
        doctorConfig: updatedFull,
        patientBank,
        recipes,
        report: currentReport,
        indications,
        rest: restCert,
        records,
        paymentConfig,
      }).catch((e) => console.warn('Cloud save error in updateCurrentConfig:', e));
    }, 400);
  };

  // Doctor Session & Authentication State
  // SEGURIDAD MÉDICA: En la web, cada vez que se entra o se abre la página, la sesión inicia CERRADA
  // a menos que el médico ya haya iniciado sesión con su correo y clave en este navegador.
  const [activeDoctorSessionId, setActiveDoctorSessionId] = useState<string | null>(() => {
    return getStoredDoctorSessionId();
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    // Si no hay sesión activa en este momento, abrir obligatoriamente la pantalla de acceso
    return !getStoredDoctorSessionId();
  });

  // States to dynamically configure the initial view of the onboarding wizard
  const [wizardInitialStep, setWizardInitialStep] = useState<number>(0);
  const [wizardInitialView, setWizardInitialView] = useState<'wizard' | 'login'>('login');
  const [wizardAgreedPayment, setWizardAgreedPayment] = useState<boolean>(false);

  // Hidden Admin Panel States (100% hidden from normal UI)
  const [isSecretAdminPromptOpen, setIsSecretAdminPromptOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [secretAdminClicks, setSecretAdminClicks] = useState<number>(0);
  const [isEditPaymentConfigModalOpen, setIsEditPaymentConfigModalOpen] = useState<boolean>(false);

  // Auto-refresh doctors list from cloud when admin panel opens
  useEffect(() => {
    if (isAdminPanelOpen) {
      fetchDoctorsFromCloud().then(cloud => {
        if (cloud && cloud.length > 0) {
          setColleagueProfiles(cloud);
        }
      });
    }
  }, [isAdminPanelOpen]);

  // Subscription requirement gate modal for "Estudio de Diseño"
  const [isSubscriptionRequiredOpen, setIsSubscriptionRequiredOpen] = useState<boolean>(false);

  // Synchronize active colleague with active session doctor
  useEffect(() => {
    if (activeDoctorSessionId) {
      setActiveColleagueId(activeDoctorSessionId);
    }
  }, [activeDoctorSessionId]);

  const handleRegisterNewDoctor = (newDoctor: DoctorConfig, autoLogin: boolean = true) => {
    setColleagueProfiles((prev) => {
      const exists = prev.some((p) => p.id === newDoctor.id || p.ci === newDoctor.ci);
      const next = exists 
        ? prev.map((p) => (p.id === newDoctor.id || p.ci === newDoctor.ci ? newDoctor : p))
        : [newDoctor, ...prev];
      localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(next));
      return next;
    });

    saveSingleDoctorToCloud(newDoctor);

    // Si el médico eligió pago de suscripción, NO puede entrar hasta que el administrador verifique
    if (newDoctor.paymentStatus === 'pendiente') {
      setIsAuthModalOpen(true);
      showToast('✓ Solicitud y comprobante enviados a la administración. En breve verificaremos su pago para activar su acceso.');
      return;
    }

    if (autoLogin) {
      loadedEcosystemUserRef.current = newDoctor.email || newDoctor.id;
      setActiveColleagueId(newDoctor.id);
      setActiveDoctorSessionId(newDoctor.id);
      storeDoctorSessionId(newDoctor.id);
      setIsAuthModalOpen(false);
      setIsWelcomeBlankRecipeOpen(true);
      showToast(`¡Bienvenido(a) ${newDoctor.doctorName}! Su consulta médica digital está lista.`);
    } else {
      showToast(`✓ Datos del Dr(a). ${newDoctor.doctorName} registrados. Ingrese con su correo y clave.`);
    }
  };

  const handleLoginDoctor = (doctor: DoctorConfig, initialEcosystem?: any) => {
    const isMaster = doctor.isAdmin || doctor.id === 'doc-admin-master' || (doctor.email && doctor.email.toLowerCase().includes('carloseduardoleal29'));
    const finalDoc = isMaster ? {
      ...doctor,
      specialty: doctor.specialty || 'Especialista en Anestesiología y Reanimación',
      profileName: doctor.profileName || doctor.doctorName || 'Dr. Carlos E. Leal S.',
      doctorName: doctor.doctorName || 'Dr. Carlos E. Leal S.',
      isAdmin: true,
      isPaidClient: true,
      isVip: true,
      paymentStatus: 'activo' as const,
      paidPlanName: 'Acceso Master Administrador'
    } : doctor;

    const userKey = finalDoc.email || finalDoc.id;
    loadedEcosystemUserRef.current = initialEcosystem ? userKey : null;

    // If initialEcosystem was returned directly from /api/auth/login, hydrate immediately!
    if (initialEcosystem) {
      if (initialEcosystem.recipes && Array.isArray(initialEcosystem.recipes) && initialEcosystem.recipes.length > 0) {
        setRecipes(sanitizeRecipeList(initialEcosystem.recipes));
      }
      if (initialEcosystem.patientBank && Array.isArray(initialEcosystem.patientBank)) {
        setPatientBank(initialEcosystem.patientBank);
      }
      if (initialEcosystem.report) setCurrentReport(initialEcosystem.report);
      if (initialEcosystem.indications) setIndications(initialEcosystem.indications);
      if (initialEcosystem.rest) setRestCert(initialEcosystem.rest);
      if (initialEcosystem.records && Array.isArray(initialEcosystem.records)) {
        setRecords(initialEcosystem.records);
      }
      applyEcosystemToLocalStorage(initialEcosystem);
    }

    const existingDoc = colleagueProfiles.find((p) => p.id === finalDoc.id || (p.email && finalDoc.email && p.email.toLowerCase() === finalDoc.email.toLowerCase()));
    const cloudDoc = initialEcosystem?.doctorConfig;

    const pickAsset = (...candidates: (string | undefined | null)[]) => {
      for (const c of candidates) {
        if (c && typeof c === 'string' && c.trim().length > 0) return c;
      }
      return '';
    };

    const pickStr = (pref?: string, alt1?: string, alt2?: string, fallback: string = '') => {
      if (pref !== undefined && pref !== null) return pref;
      if (alt1 !== undefined && alt1 !== null) return alt1;
      if (alt2 !== undefined && alt2 !== null) return alt2;
      return fallback;
    };

    let mergedDoc = mergeDoctorConfigs(DEFAULT_DOCTOR_CONFIG, existingDoc || {});
    // Check if there is a local current config stored in digital_medic_current_config
    try {
      const savedCur = localStorage.getItem('digital_medic_current_config');
      if (savedCur) {
        const parsedCur = JSON.parse(savedCur);
        if (parsedCur && (parsedCur.id === finalDoc.id || parsedCur.email === finalDoc.email)) {
          mergedDoc = mergeDoctorConfigs(mergedDoc, parsedCur);
        }
      }
    } catch (_) {}
    mergedDoc = mergeDoctorConfigs(mergedDoc, finalDoc || {});
    if (cloudDoc) {
      mergedDoc = mergeDoctorConfigs(mergedDoc, cloudDoc);
    }
    mergedDoc.id = finalDoc.id || cloudDoc?.id || existingDoc?.id || 'doc-admin-master';
    mergedDoc.email = finalDoc.email || cloudDoc?.email || existingDoc?.email || 'carloseduardoleal29@gmail.com';
    mergedDoc.updatedAt = Date.now();

    setColleagueProfiles((prev) => {
      const existing = prev.find((p) => p.id === mergedDoc.id || (p.email && mergedDoc.email && p.email.toLowerCase() === mergedDoc.email.toLowerCase()));
      const next = existing
        ? prev.map((p) => (p.id === existing.id ? mergedDoc : p))
        : [mergedDoc, ...prev];
      localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(next));
      return next;
    });

    setActiveColleagueId(mergedDoc.id);
    setActiveDoctorSessionId(mergedDoc.id);
    storeDoctorSessionId(mergedDoc.id);

    // Save merged doctor directly to cloud database
    saveSingleDoctorToCloud(mergedDoc);

    // Hydrate complete cloud ecosystem (recipes, design, stamps, patient bank)
    syncWithCloudEcosystem(userKey).then((synced) => {
      if (synced) {
        showToast(`✓ ¡Sesión cargada desde la nube! (Diseño, sellos, banco de pacientes y récipes listos)`);
      }
    });

    if (finalDoc.isAdmin || finalDoc.id === 'doc-admin-master' || (finalDoc.email && finalDoc.email.toLowerCase().includes('carloseduardoleal29'))) {
      setIsDesignerUnlocked(true);
      sessionStorage.setItem('digital_medic_vip', 'true');
      sessionStorage.setItem('digital_medic_unlocked_2534', 'true');
      sessionStorage.setItem('digital_medic_master_admin', 'true');
    }

    setIsAuthModalOpen(false);
    showToast(`¡Sesión iniciada con éxito! ${finalDoc.doctorName}`);
  };

  const handleLogout = () => {
    loadedEcosystemUserRef.current = null;
    clearDoctorSessionId();
    setActiveDoctorSessionId(null);
    setIsAuthModalOpen(true);
    showToast('Sesión cerrada correctamente.');
  };

  const handleUpdateDoctor = async (updatedDoc: DoctorConfig) => {
    let updatedList: DoctorConfig[] = [];
    const docWithTime = { ...updatedDoc, updatedAt: Date.now() };
    setColleagueProfiles((prev) => {
      const next = prev.map((p) => (p.id === docWithTime.id ? docWithTime : p));
      localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(next));
      updatedList = next;
      return next;
    });

    await saveSingleDoctorToCloud(docWithTime);

    const targetIdent = docWithTime.email || docWithTime.ci || docWithTime.id;
    if (targetIdent) {
      saveEcosystemToCloud({
        identifier: targetIdent,
        email: docWithTime.email,
        ci: docWithTime.ci,
        doctorConfig: docWithTime,
        colleagueProfiles: updatedList,
      }).catch((e) => console.warn(e));
    }
    showToast(`✓ Datos, fotos y logos actualizados para ${docWithTime.doctorName}`);
  };

  const handleLoginAsDoctor = (targetDoc: DoctorConfig) => {
    handleLoginDoctor(targetDoc);
    setIsAdminPanelOpen(false);
    setActiveColleagueId(targetDoc.id);
    setActiveDoctorSessionId(targetDoc.id);
    storeDoctorSessionId(targetDoc.id);
    setActiveModule('recipe-master');
    showToast(`✓ Sesión activa cambiada al Dr(a). ${targetDoc.doctorName}. Membrete, logo, sello y firma cargados.`);
  };

  // 2. Active View Module & Master Lock (PIN 2534)
  const [activeModule, setActiveModule] = useState<ActiveModule>('inicio');
  const [designerPreviewDoc, setDesignerPreviewDoc] = useState<'recipe' | 'recipe-4en1' | 'indicaciones' | 'reposo' | 'informes'>('recipe');
  const [isDesignerUnlocked, setIsDesignerUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('digital_medic_unlocked_2534') === 'true';
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(false);
  const [isPatientBankOpen, setIsPatientBankOpen] = useState<boolean>(false);

  // Responsive Layout Mode: Fluid Responsive Mobile & PC Layout
  const [isDesktopMode] = useState<boolean>(false);
  const toggleDesktopMode = () => {};

  // Only Administrator and VIP Users can see and access Estudio de Diseño
  const isAuthorizedForDesigner = Boolean(
    config?.isAdmin ||
    config?.isVip ||
    config?.id === 'doc-admin-master' ||
    config?.subscriptionPlan === 'anual' ||
    config?.subscriptionPlan === 'diseno-pro' ||
    config?.subscriptionPlan === 'clinica-full' ||
    (typeof window !== 'undefined' && (
      sessionStorage.getItem('digital_medic_vip') === 'true' ||
      sessionStorage.getItem('digital_medic_unlocked_2534') === 'true'
    ))
  );

  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [toastConfig, setToastConfig] = useState<{ message: string; isError: boolean } | null>(null);

  // Modals
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isShareWithDoctorOpen, setIsShareWithDoctorOpen] = useState(false);
  const [isUniversalPreviewOpen, setIsUniversalPreviewOpen] = useState(false);
  const [previewInitialModule, setPreviewInitialModule] = useState<ActiveModule>('recipe-master');
  const [isWelcomeBlankRecipeOpen, setIsWelcomeBlankRecipeOpen] = useState(false);

  const handleOpenFormatPreview = (moduleTarget: ActiveModule = 'recipe-master') => {
    setPreviewInitialModule(moduleTarget);
    setIsUniversalPreviewOpen(true);
  };
  const [isSaveSuccessModalOpen, setIsSaveSuccessModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSyncDevicesOpen, setIsSyncDevicesOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [savedDocumentRecord, setSavedDocumentRecord] = useState<SavedDocumentRecord | null>(null);

  // Hidden file input for loading doctor template
  const loadDoctorTemplateRef = useRef<HTMLInputElement>(null);

  // Today Date formatted in Spanish
  const todayStr = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  // 3. Recipes State (Master & 4-in-1) - Clean Pristine Blank Template
  // Preserva las prescripciones reales del médico (Paracetamol, Ibuprofeno, etc.) sin borrarlas
  const sanitizeRecipeItem = (r: RecipeItem): RecipeItem => {
    if (!r) return r;
    const clean = { ...r };
    // Solo limpiar si es exactamente la plantilla demo inicial de prueba antigua
    const isOldDemoPlaceholder = Boolean(
      clean.patientName === 'Juan Carlos Pérez Gómez' && clean.rp?.includes('Ejemplo: Paracetamol')
    );

    if (isOldDemoPlaceholder) {
      clean.patientName = '';
      clean.patientCI = '';
      clean.patientAge = '';
      clean.patientPhone = '';
      clean.diagnosis = '';
      clean.rp = '';
      clean.indicationsNotes = '';
    }
    return clean;
  };

  const sanitizeRecipeList = (list: RecipeItem[]): RecipeItem[] => {
    return (list || []).map(sanitizeRecipeItem);
  };

  // 3. Recipes State (Master & 4-in-1) - Clean Pristine Blank Template
  const [activeRecipeIndex, setActiveRecipeIndex] = useState(0);
  const [recipes, setRecipes] = useState<RecipeItem[]>(() => {
    try {
      const saved = localStorage.getItem('digital_medic_recipes_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeRecipeList(parsed);
        }
      }
    } catch (e) {}
    return [
      { id: 'rec-1', patientName: '', patientAge: '', patientCI: '', patientPhone: '', date: todayStr, diagnosis: '', rp: '', indicationsNotes: '' },
      { id: 'rec-2', patientName: '', patientAge: '', patientCI: '', patientPhone: '', date: todayStr, diagnosis: '', rp: '', indicationsNotes: '' },
      { id: 'rec-3', patientName: '', patientAge: '', patientCI: '', patientPhone: '', date: todayStr, diagnosis: '', rp: '', indicationsNotes: '' },
      { id: 'rec-4', patientName: '', patientAge: '', patientCI: '', patientPhone: '', date: todayStr, diagnosis: '', rp: '', indicationsNotes: '' },
    ];
  });

  // 4. Clinical Records (Historias Clínicas) - Clean Blank
  const [records, setRecords] = useState<ClinicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('digital_medic_records_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed[0]?.patientName?.includes('Juan Carlos')) {
            return parsed;
          }
        }
      }
    } catch (e) {}
    return [
      {
        id: 'HC-2026-001',
        patientName: '',
        patientAge: '',
        patientGender: 'M',
        patientCI: '',
        patientPhone: '',
        patientEmail: '',
        patientAddress: '',
        bloodType: 'O Rh+',
        date: todayStr,
        vitalSigns: {
          ta: '120/80',
          fc: '72',
          fr: '16',
          temp: '36.5',
          satO2: '98',
          peso: '',
          talla: '',
          imc: '',
        },
        reason: '',
        currentIllness: '',
        personalAntecedents: '',
        familyAntecedents: '',
        surgicalAntecedents: '',
        allergies: '',
        currentMedication: '',
        habits: '',
        physicalExam: '',
        diagnoses: '',
        treatmentPlan: '',
        notes: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ];
  });

  const [activeRecord, setActiveRecord] = useState<ClinicalRecord>(records[0]);

  // 5. Medical Report State (Informe Médico) - Clean Blank
  const [currentReport, setCurrentReport] = useState<MedicalReport>(() => {
    try {
      const saved = localStorage.getItem('digital_medic_report_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (!parsed.patientName?.includes('Juan Carlos')) {
            return parsed;
          }
        }
      }
    } catch (e) {}
    return {
      id: 'INF-2026-01',
      patientName: '',
      patientAge: '',
      patientCI: '',
      patientPhone: '',
      patientGender: 'M',
      date: todayStr,
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
      restStartDate: todayStr,
      restEndDate: '',
      createdAt: Date.now(),
    };
  });

  // 6. Indications Sheet State - Clean Blank
  const [indications, setIndications] = useState<IndicationsSheet>(() => {
    try {
      const saved = localStorage.getItem('digital_medic_indications_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (!parsed.patientName?.includes('Juan Carlos')) {
            return parsed;
          }
        }
      }
    } catch (e) {}
    return {
      id: 'IND-01',
      patientName: '',
      patientCI: '',
      patientPhone: '',
      patientAge: '',
      date: todayStr,
      diagnosis: '',
      generalInstructions: '',
      medicationSchedule: '',
      dietAndRest: '',
      alarmSigns: '',
      nextAppointment: '',
    };
  });

  // 7. Medical Rest Certificate State - Clean Blank
  const [restCert, setRestCert] = useState<MedicalRestCert>(() => {
    try {
      const saved = localStorage.getItem('digital_medic_rest_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (!parsed.patientName?.includes('Juan Carlos')) {
            return parsed;
          }
        }
      }
    } catch (e) {}
    return {
      id: 'REP-01',
      patientName: '',
      patientCI: '',
      patientPhone: '',
      patientAge: '',
      patientOccupation: '',
      companyName: '',
      date: todayStr,
      daysRest: 3,
      startDate: todayStr,
      endDate: '',
      diagnosis: '',
      observations: '',
    };
  });

  // Show toast notification helper
  const showToast = (msg: string, isError = false) => {
    setToastConfig({ message: msg, isError });
    setTimeout(() => setToastConfig(null), 5000);
  };

  // Escuchar eventos globales de alerta / notificación
  useEffect(() => {
    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        showToast(customEvent.detail);
      }
    };
    window.addEventListener('app-toast', handleCustomToast);
    return () => window.removeEventListener('app-toast', handleCustomToast);
  }, []);

  // Cloud Ecosystem Synchronization State (Automático PC <-> Móvil)
  const isSyncingFromCloudRef = useRef<boolean>(false);
  const loadedEcosystemUserRef = useRef<string | null>(null);
  const hasUserEditedStateRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getLocalPatientBank = (): SavedPatientEntry[] => {
    try {
      const saved = localStorage.getItem('digital_medic_patient_bank_v1');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  };

  // Download complete ecosystem from cloud and hydrate local state
  const syncWithCloudEcosystem = async (targetIdentifier?: string, forceDownload: boolean = false): Promise<boolean> => {
    let ident = targetIdentifier || config.email || getStoredDoctorSessionId() || 'carloseduardoleal29@gmail.com';
    ident = ident.toLowerCase().trim();
    if (ident === 'doc-admin-master' || ident === 'admin@digitalmedic.com' || ident === 'admin') {
      ident = 'carloseduardoleal29@gmail.com';
    }

    // Only push local state if user actively edited in THIS session AND not forcing download
    if (hasUserEditedStateRef.current && !forceDownload) {
      let paymentConfig: any = null;
      try {
        const pmSaved = localStorage.getItem('digital_medic_payment_config_v4');
        if (pmSaved) paymentConfig = JSON.parse(pmSaved);
      } catch (_) {}

      await saveEcosystemToCloud({
        identifier: ident,
        email: config.email,
        ci: config.ci,
        doctorConfig: config,
        colleagueProfiles,
        patientBank,
        recipes,
        report: currentReport,
        indications,
        rest: restCert,
        records,
        paymentConfig,
      });
      await saveSingleDoctorToCloud(config);
      return true;
    }

    isSyncingFromCloudRef.current = true; // Set IMMEDIATELY to prevent concurrent auto-saves during fetch
    try {
      const cloudEco = await fetchEcosystemFromCloud(ident);
      if (cloudEco) {
        let currentList = colleagueProfiles;
        if (cloudEco.colleagueProfiles && Array.isArray(cloudEco.colleagueProfiles) && cloudEco.colleagueProfiles.length > 0) {
          currentList = cloudEco.colleagueProfiles;
        }

        if (cloudEco.doctorConfig) {
          const doc = cloudEco.doctorConfig;
          const targetId = doc.id;
          const targetEmail = (doc.email || '').toLowerCase().trim();
          const targetCI = (doc.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');

          const index = currentList.findIndex(p => {
            if (p.id && targetId && p.id === targetId) return true;
            if (p.email && targetEmail && p.email.toLowerCase().trim() === targetEmail) return true;
            if (p.ci && targetCI && p.ci.toLowerCase().replace(/[^a-z0-9]/gi, '') === targetCI) return true;
            return false;
          });

          if (index >= 0) {
            currentList = currentList.map((p, i) => i === index ? mergeDoctorConfigs(p, doc) : p);
          } else {
            currentList = [doc, ...currentList];
          }
          setActiveColleagueId(doc.id || currentList[0]?.id);
        }

        const sanitized = currentList.map((p) => {
          if (p.id === 'doc-admin-master' || (p.email && p.email.toLowerCase().includes('carloseduardoleal29'))) {
            return {
              ...p,
              profileName: p.profileName || 'Dr. Carlos E. Leal S.',
              doctorName: p.doctorName || 'Dr. Carlos E. Leal S.',
              specialty: p.specialty || 'Especialista en Anestesiología y Reanimación',
              mpps: p.mpps || '94.228',
              ci: p.ci || '15.489.288',
              collegeNumber: p.collegeNumber !== undefined ? p.collegeNumber : '',
              phone: p.phone || '+584243291438',
              email: p.email || 'carloseduardoleal29@gmail.com',
              socialHandle: p.socialHandle !== undefined ? p.socialHandle : '',
              socialHandle2: p.socialHandle2 !== undefined ? p.socialHandle2 : '',
              institution: p.institution !== undefined ? p.institution : '',
              institutionDetails: p.institutionDetails !== undefined ? p.institutionDetails : '',
              educacionContinua: p.educacionContinua !== undefined ? p.educacionContinua : '',
              fuenteEducacion: p.fuenteEducacion || p.fuenteSpecialty || p.fuenteHeader,
              educacionSize: p.educacionSize || '10.5px',
              educacionColor: p.educacionColor || p.specialtyColor || p.headerColor,
              isAdmin: true,
              isPaidClient: true,
              isVip: true,
              paymentStatus: 'activo' as const
            };
          }
          return p;
        });

        if (!hasUserEditedStateRef.current || forceDownload) {
          hasUserEditedStateRef.current = false;
          setColleagueProfiles(sanitized);

          if (cloudEco.recipes && Array.isArray(cloudEco.recipes) && cloudEco.recipes.length > 0) {
            const ecoRecipes = sanitizeRecipeList(cloudEco.recipes);
            setRecipes((prevRecipes) => {
              if (forceDownload) return ecoRecipes;
              if (prevRecipes.some(r => r.patientName?.trim() || r.rp?.trim())) {
                return prevRecipes;
              }
              return ecoRecipes;
            });
          }

          if (cloudEco.patientBank && Array.isArray(cloudEco.patientBank)) {
            const ecoBank = cloudEco.patientBank;
            setPatientBank((prevBank) => {
              const mergedBank = [...prevBank];
              for (const p of ecoBank) {
                const idx = mergedBank.findIndex(m => m.id === p.id || (m.patientCI && p.patientCI && m.patientCI === p.patientCI) || (m.patientName && p.patientName && m.patientName.toLowerCase().trim() === p.patientName.toLowerCase().trim()));
                if (idx >= 0) {
                  mergedBank[idx] = { ...mergedBank[idx], ...p };
                } else {
                  mergedBank.push(p);
                }
              }
              try {
                localStorage.setItem('digital_medic_patient_bank_v1', JSON.stringify(mergedBank));
              } catch (_) {}
              return mergedBank;
            });
          }

          if (cloudEco.report) {
            setCurrentReport(cloudEco.report);
          }
          if (cloudEco.indications) {
            setIndications(cloudEco.indications);
          }
          if (cloudEco.rest) {
            setRestCert(cloudEco.rest);
          }
          if (cloudEco.records && Array.isArray(cloudEco.records) && cloudEco.records.length > 0) {
            const ecoRecords = cloudEco.records;
            setRecords(ecoRecords);
            try {
              localStorage.setItem('digital_medic_records_v2', JSON.stringify(ecoRecords));
            } catch (_) {}
          }

          if (cloudEco.paymentConfig && typeof cloudEco.paymentConfig === 'object') {
            const pm = cloudEco.paymentConfig.pagoMovil;
            const bin = cloudEco.paymentConfig.binance;
            const zin = cloudEco.paymentConfig.zinli;
            const hasData = pm?.telefono || bin?.payId || bin?.email || zin?.email || (cloudEco.paymentConfig.tasaBinanceUsd && cloudEco.paymentConfig.tasaBinanceUsd > 0);
            if (hasData) {
              try {
                localStorage.setItem('digital_medic_payment_config_v4', JSON.stringify(cloudEco.paymentConfig));
                window.dispatchEvent(new CustomEvent('digital-medic-payment-updated', { detail: cloudEco.paymentConfig }));
              } catch (_) {}
            }
          }

          applyEcosystemToLocalStorage(cloudEco);
        }

        loadedEcosystemUserRef.current = ident; // Mark as successfully loaded!
        setTimeout(() => {
          isSyncingFromCloudRef.current = false;
        }, 1500);

        return true;
      } else {
        // No ecosystem exists on the cloud yet, allow creating one from scratch
        loadedEcosystemUserRef.current = ident;
        isSyncingFromCloudRef.current = false;
      }
    } catch (err) {
      console.warn('Error en syncWithCloudEcosystem:', err);
      isSyncingFromCloudRef.current = false;
    }
    return false;
  };

  // Startup: Sync or Auto-upload if local device has custom work from yesterday
  useEffect(() => {
    const localSavedColleagues = localStorage.getItem('digital_medic_colleagues_v2');
    const localPatientBank = localStorage.getItem('digital_medic_patient_bank_v1');
    const localRecipes = localStorage.getItem('digital_medic_recipes_v2');

    let hasLocalCustomData = false;
    try {
      if (localSavedColleagues) {
        const parsed = JSON.parse(localSavedColleagues);
        if (Array.isArray(parsed) && parsed.some(p => p.doctorName !== DEFAULT_DOCTOR_CONFIG.doctorName || p.firmaImg || p.selloImg)) {
          hasLocalCustomData = true;
        }
      }
      if (localPatientBank && JSON.parse(localPatientBank).length > 0) {
        hasLocalCustomData = true;
      }
      if (localRecipes && JSON.parse(localRecipes).some((r: any) => r.patientName || r.rp)) {
        hasLocalCustomData = true;
      }
    } catch (_) {}

    const activeSessionId = getStoredDoctorSessionId();

    // Fetch central payment config on startup
    fetchPaymentConfig().catch(() => {});

    // Fetch complete doctors catalog from cloud on every startup
    fetchDoctorsFromCloud().then((cloudDocs) => {
      if (cloudDocs && Array.isArray(cloudDocs) && cloudDocs.length > 0) {
        setColleagueProfiles((prev) => {
          const merged = prev.map((local) => {
            const match = cloudDocs.find(c => c.id === local.id || (c.email && local.email && c.email.toLowerCase() === local.email.toLowerCase()));
            if (!match) return local;

            const localTime = local.updatedAt || 0;
            const cloudTime = match.updatedAt || 0;

            // Non-destructive merge: newer timestamp wins, but NEVER drop custom assets
            const base = localTime >= cloudTime ? match : local;
            const override = localTime >= cloudTime ? local : match;

            const mergedDoctor = mergeDoctorConfigs(base, {
              ...override,
              updatedAt: Math.max(localTime, cloudTime, Date.now())
            });

            return mergedDoctor;
          });

          for (const c of cloudDocs) {
            if (!merged.some(m => m.id === c.id || (m.email && c.email && m.email.toLowerCase() === c.email.toLowerCase()))) {
              merged.push(c);
            }
          }

          try {
            localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(merged));
          } catch (_) {}
          return merged;
        });
      }
    });

    let targetUser = (activeSessionId || 'carloseduardoleal29@gmail.com').toLowerCase().trim();
    if (targetUser === 'doc-admin-master' || targetUser === 'admin@digitalmedic.com' || targetUser === 'admin') {
      targetUser = 'carloseduardoleal29@gmail.com';
    }

    isSyncingFromCloudRef.current = true;
    fetchEcosystemFromCloud(targetUser).then((cloudEco) => {
      if (cloudEco) {
        syncWithCloudEcosystem(targetUser, true);
      } else if (hasLocalCustomData) {
        // This device (e.g. mobile phone) has local custom work: Auto-upload to cloud!
        const localData = exportAllLocalData(activeColleagueId);
        saveEcosystemToCloud(localData).then(() => {
          loadedEcosystemUserRef.current = targetUser;
          isSyncingFromCloudRef.current = false;
        });
      } else {
        loadedEcosystemUserRef.current = targetUser;
        isSyncingFromCloudRef.current = false;
      }
    });
  }, []);

  // Cross-device Real-Time Cloud Synchronization (Phone <-> PC)
  useEffect(() => {
    let lastCloudCheckTime = 0;
    let isCheckingCloud = false;
    let lastCheckTimestamp = 0;

    // 1. Escucha en tiempo real de Firestore para datos de cobro (Pago Móvil, Binance, Zinli)
    const unsubPayment = subscribeToPaymentConfig((cloudPaymentConfig) => {
      if (cloudPaymentConfig && typeof cloudPaymentConfig === 'object') {
        const pm = cloudPaymentConfig.pagoMovil;
        const bin = cloudPaymentConfig.binance;
        const zin = cloudPaymentConfig.zinli;
        const hasData = pm?.telefono || bin?.payId || bin?.email || zin?.email || (cloudPaymentConfig.tasaBinanceUsd && cloudPaymentConfig.tasaBinanceUsd > 0);
        if (hasData) {
          try {
            localStorage.setItem('digital_medic_payment_config_v4', JSON.stringify(cloudPaymentConfig));
            window.dispatchEvent(new CustomEvent('digital-medic-payment-updated', { detail: cloudPaymentConfig }));
            console.log('[Cloud Realtime] Datos de cobro recibidos desde Firestore en tiempo real');
          } catch (_) {}
        }
      }
    });

    // 2. Escucha en tiempo real de Firestore para el ecosistema del usuario (diseño, récipes, pacientes)
    const targetIdent = (activeDoctorSessionId || config.email || 'carloseduardoleal29@gmail.com').toLowerCase().trim();
    const resolvedIdent = (targetIdent === 'doc-admin-master' || targetIdent === 'admin' || targetIdent === 'admin@digitalmedic.com') 
      ? 'carloseduardoleal29@gmail.com' 
      : targetIdent;

    const unsubEcosystem = subscribeToUserEcosystem(resolvedIdent, (cloudEco) => {
      if (cloudEco && cloudEco.updatedAt && cloudEco.updatedAt > lastCloudCheckTime) {
        lastCloudCheckTime = cloudEco.updatedAt;
        syncWithCloudEcosystem(resolvedIdent, true);
      }
    });

    const checkAndSyncFromCloud = async () => {
      // Cooldown de al menos 10 segundos para evitar llamadas repetidas
      const now = Date.now();
      if (now - lastCheckTimestamp < 10000) return;
      if (isCheckingCloud) return;
      if (hasUserEditedStateRef.current) return;
      if (isSyncingFromCloudRef.current) return;

      isCheckingCloud = true;
      lastCheckTimestamp = now;

      try {
        const cloudEco = await fetchEcosystemFromCloud(resolvedIdent);
        if (cloudEco && cloudEco.updatedAt && cloudEco.updatedAt > lastCloudCheckTime) {
          lastCloudCheckTime = cloudEco.updatedAt;
          await syncWithCloudEcosystem(resolvedIdent, true);
        }
      } catch (e) {
        console.warn('[CloudSync] Chequeo de sincronización omitido:', e);
      } finally {
        isCheckingCloud = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndSyncFromCloud();
        fetchPaymentConfig().catch(() => {});
      }
    };

    const handleWindowFocus = () => {
      checkAndSyncFromCloud();
      fetchPaymentConfig().catch(() => {});
    };

    // Intervalo saludable de 30 segundos
    const intervalId = setInterval(() => {
      checkAndSyncFromCloud();
    }, 30000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(intervalId);
      if (unsubPayment) unsubPayment();
      if (unsubEcosystem) unsubEcosystem();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [activeDoctorSessionId, config.email]);

  // Continuous Background Auto-Sync to Cloud Database (2500ms debounce)
  // SEGURIDAD CRÍTICA: Solo sincroniza si el médico modificó activamente algún dato (hasUserEditedStateRef.current)
  // para NUNCA sobreescribir la base de datos de la nube con plantillas en blanco al arrancar
  useEffect(() => {
    if (!hasUserEditedStateRef.current) return;
    if (isSyncingFromCloudRef.current) return;
    if (!activeDoctorSessionId) return;
    let ident = config.email || config.ci || config.id;
    if (!ident) return;
    ident = ident.toLowerCase().trim();
    if (ident === 'doc-admin-master' || ident === 'admin@digitalmedic.com' || ident === 'admin') {
      ident = 'carloseduardoleal29@gmail.com';
    }

    // CRITICAL SECURITY CHECK: Prevent auto-save if cloud ecosystem for this user has not been loaded/initialized yet
    if (!isUserLoaded(ident)) {
      console.log('[CloudSync] Delaying auto-sync until cloud ecosystem is loaded for:', ident);
      return;
    }

    const timer = setTimeout(async () => {
      let paymentConfig: any = null;
      try {
        const pmSaved = localStorage.getItem('digital_medic_payment_config_v4');
        if (pmSaved) paymentConfig = JSON.parse(pmSaved);
      } catch (_) {}

      await saveEcosystemToCloud({
        identifier: ident,
        email: config.email,
        ci: config.ci,
        doctorConfig: config,
        colleagueProfiles,
        patientBank,
        recipes,
        report: currentReport,
        indications,
        rest: restCert,
        records,
        paymentConfig,
      });
      await saveSingleDoctorToCloud(config);
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeDoctorSessionId, colleagueProfiles, config, recipes, records, currentReport, indications, restCert, patientBank]);

  // Sincronización Inmediata a la Nube (Google Cloud Database)
  // Guarda el ecosistema y el banco de pacientes al instante sin esperar el temporizador
  const syncEcosystemImmediate = (customBank?: SavedPatientEntry[], customDoc?: DoctorConfig, customRecipes?: RecipeItem[]) => {
    const doc = customDoc || config;
    let ident = doc.email || doc.ci || doc.id;
    if (!ident) return;
    ident = ident.toLowerCase().trim();
    if (ident === 'doc-admin-master' || ident === 'admin@digitalmedic.com' || ident === 'admin') {
      ident = 'carloseduardoleal29@gmail.com';
    }

    if (!isUserLoaded(ident)) {
      console.warn('[CloudSync] Delaying syncEcosystemImmediate cloud save because ecosystem is not loaded.');
      return;
    }

    const recipesToSave = customRecipes || recipes;

    let paymentConfig: any = null;
    try {
      const pmSaved = localStorage.getItem('digital_medic_payment_config_v4');
      if (pmSaved) paymentConfig = JSON.parse(pmSaved);
    } catch (_) {}

    saveEcosystemToCloud({
      identifier: ident,
      email: doc.email,
      ci: doc.ci,
      doctorConfig: doc,
      colleagueProfiles,
      patientBank: customBank || patientBank,
      recipes: recipesToSave,
      report: currentReport,
      indications,
      rest: restCert,
      records,
      paymentConfig,
    });
    saveSingleDoctorToCloud(doc);
  };

  // Real-time Auto-Save to LocalStorage on EVERY change
  useEffect(() => {
    try {
      localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(colleagueProfiles));
    } catch (e) {
      console.warn('Error guardando perfiles en LocalStorage:', e);
    }
  }, [colleagueProfiles]);

  useEffect(() => {
    try {
      localStorage.setItem('digital_medic_patient_bank_v1', JSON.stringify(patientBank));
    } catch (e) {
      console.warn('Error guardando banco de pacientes en LocalStorage:', e);
    }
  }, [patientBank]);

  useEffect(() => {
    try {
      localStorage.setItem('digital_medic_active_colleague', activeColleagueId);
    } catch (e) {
      console.warn('Error guardando colega activo en LocalStorage:', e);
    }
  }, [activeColleagueId]);

  useEffect(() => {
    try {
      localStorage.setItem('digital_medic_recipes_v2', JSON.stringify(recipes));
    } catch (e) {
      console.warn('Error guardando récipes en LocalStorage:', e);
    }
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem('digital_medic_records_v2', JSON.stringify(records));
      localStorage.setItem('digital_medic_report_v2', JSON.stringify(currentReport));
      localStorage.setItem('digital_medic_indications_v2', JSON.stringify(indications));
      localStorage.setItem('digital_medic_rest_v2', JSON.stringify(restCert));
    } catch (e) {
      console.warn('Error guardando documentos en LocalStorage:', e);
    }
  }, [records, currentReport, indications, restCert]);

  // Immediate flush before tab/window closes so no data is ever lost
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        const full = mergeDoctorConfigs(config, { updatedAt: Date.now() });
        localStorage.setItem('digital_medic_current_config', JSON.stringify(full));
        localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(colleagueProfiles));
        localStorage.setItem('digital_medic_recipes_v2', JSON.stringify(recipes));
        localStorage.setItem('digital_medic_patient_bank_v1', JSON.stringify(patientBank));
        localStorage.setItem('digital_medic_records_v2', JSON.stringify(records));
        localStorage.setItem('digital_medic_report_v2', JSON.stringify(currentReport));
        localStorage.setItem('digital_medic_indications_v2', JSON.stringify(indications));
        localStorage.setItem('digital_medic_rest_v2', JSON.stringify(restCert));

        let paymentConfig: any = null;
        try {
          const pmSaved = localStorage.getItem('digital_medic_payment_config_v4');
          if (pmSaved) paymentConfig = JSON.parse(pmSaved);
        } catch (_) {}

        let userIdent = full.email || full.ci || full.id || 'carloseduardoleal29@gmail.com';
        userIdent = userIdent.toLowerCase().trim();
        const payload = JSON.stringify({
          identifier: userIdent,
          email: full.email,
          ci: full.ci,
          doctorConfig: full,
          colleagueProfiles,
          patientBank,
          recipes,
          report: currentReport,
          indications,
          rest: restCert,
          records,
          paymentConfig,
        });

        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/ecosystem/save', blob);
        }
      } catch (_) {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [config, colleagueProfiles, recipes, patientBank, records, currentReport, indications, restCert]);

  // Sync state to LocalStorage and Cloud Database
  const handleSaveAll = async () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    hasUserEditedStateRef.current = true;
    
    // Auto-compress doctor logos and stamps before saving
    const compressedFull = await compressDoctorConfigImages(mergeDoctorConfigs(config, { updatedAt: Date.now() }));
    const exists = colleagueProfiles.some((p) => p.id === compressedFull.id || (p.email && compressedFull.email && p.email.toLowerCase() === compressedFull.email.toLowerCase()));
    const nextProfiles = exists
      ? colleagueProfiles.map((p) => (p.id === compressedFull.id || (p.email && compressedFull.email && p.email.toLowerCase() === compressedFull.email.toLowerCase()) ? compressedFull : p))
      : [compressedFull, ...colleagueProfiles];
    
    setColleagueProfiles(nextProfiles);

    try {
      localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(nextProfiles));
      localStorage.setItem('digital_medic_current_config', JSON.stringify(compressedFull));
      localStorage.setItem('digital_medic_active_colleague', compressedFull.id);
      localStorage.setItem('digital_medic_recipes_v2', JSON.stringify(recipes));
      localStorage.setItem('digital_medic_records_v2', JSON.stringify(records));
      localStorage.setItem('digital_medic_report_v2', JSON.stringify(currentReport));
      localStorage.setItem('digital_medic_indications_v2', JSON.stringify(indications));
      localStorage.setItem('digital_medic_rest_v2', JSON.stringify(restCert));
      localStorage.setItem('digital_medic_patient_bank_v1', JSON.stringify(patientBank));
    } catch (_) {}

    let userIdent = compressedFull.email || compressedFull.ci || compressedFull.id || 'carloseduardoleal29@gmail.com';
    userIdent = userIdent.toLowerCase().trim();
    if (userIdent === 'doc-admin-master' || userIdent === 'admin@digitalmedic.com' || userIdent === 'admin') {
      userIdent = 'carloseduardoleal29@gmail.com';
    }
    loadedEcosystemUserRef.current = userIdent;

    let paymentConfig: any = null;
    try {
      const pmSaved = localStorage.getItem('digital_medic_payment_config_v4');
      if (pmSaved) paymentConfig = JSON.parse(pmSaved);
    } catch (_) {}

    try {
      // 1. Guardar de forma inmediata directo en Google Firestore (cliente)
      const directSaveRes = await saveDirectToFirestore({
        identifier: userIdent,
        email: compressedFull.email,
        ci: compressedFull.ci,
        doctorConfig: compressedFull,
        patientBank,
        recipes,
        report: currentReport,
        indications,
        rest: restCert,
        records,
        paymentConfig,
      });

      // 2. Guardar el ecosistema completo en el servidor / Firestore backend
      const cloudSaveRes = await saveEcosystemToCloud({
        identifier: userIdent,
        email: compressedFull.email,
        ci: compressedFull.ci,
        doctorConfig: compressedFull,
        colleagueProfiles: nextProfiles,
        patientBank,
        recipes,
        report: currentReport,
        indications,
        rest: restCert,
        records,
        paymentConfig,
      });

      // 3. Guardar médico individual con sus firmas, logos y sellos
      await saveSingleDoctorToCloud(compressedFull);

      // 4. Guardar catálogo general de médicos
      await saveDoctorsToCloud(nextProfiles);

      showToast('Guardado en la nube correctamente', false);
    } catch (err: any) {
      console.error('[Firestore Save Error]:', err);
      showToast(`❌ Error al guardar en Firestore: ${err?.message || String(err)}`, true);
    }
  };

  const handleManualCloudSync = async () => {
    showToast('☁️ Sincronizando datos con la nube...');
    await syncDoctorsWithCloud(colleagueProfiles);
    const cloudDocs = await fetchDoctorsFromCloud();
    if (cloudDocs && cloudDocs.length > 0) {
      setColleagueProfiles(cloudDocs);
      const activeId = getStoredDoctorSessionId();
      const current = cloudDocs.find(d => d.id === activeId || (d.email && d.email.toLowerCase().includes('carloseduardoleal29')));
      if (current) {
        setActiveColleagueId(current.id);
      }
    }
    showToast('✓ ¡Sincronización completada! Su sesión, sello y firma están actualizados en la nube.');
  };

  // Transfer to Doctor View after editing design
  const handlePassToDoctor = () => {
    handleSaveAll();
    setActiveModule('recipe-4en1');
    setIsShareWithDoctorOpen(true);
    showToast(`✓ ¡Diseño listo! Transferido a la vista de emisión de récipes del ${config.doctorName || 'médico'}.`);
  };

  // Import doctor template json
  const handleImportConfig = (imported: DoctorConfig) => {
    const newId = imported.id || `col-${Date.now()}`;
    const complete: DoctorConfig = { ...DEFAULT_DOCTOR_CONFIG, ...imported, id: newId };
    const filtered = colleagueProfiles.filter((p) => p.id !== newId);
    const updatedList = [...filtered, complete];
    setColleagueProfiles(updatedList);
    setActiveColleagueId(newId);
    showToast(`Plantilla de "${complete.doctorName || 'Colega'}" importada con éxito`);
  };

  // Import full backup (all colleagues, active doctor, recipes, and documents)
  const handleImportFullBackup = (parsed: any) => {
    if (!parsed || typeof parsed !== 'object') return;

    // Full system backup
    if (parsed.colleagueProfiles && Array.isArray(parsed.colleagueProfiles)) {
      setColleagueProfiles(parsed.colleagueProfiles);
      if (parsed.activeColleagueId) {
        setActiveColleagueId(parsed.activeColleagueId);
      } else if (parsed.colleagueProfiles[0]?.id) {
        setActiveColleagueId(parsed.colleagueProfiles[0].id);
      }
      if (parsed.recipes && Array.isArray(parsed.recipes)) {
        setRecipes(parsed.recipes);
      }
      if (parsed.records && Array.isArray(parsed.records)) {
        setRecords(parsed.records);
        if (parsed.records[0]) setActiveRecord(parsed.records[0]);
      }
      if (parsed.currentReport) {
        setCurrentReport(parsed.currentReport);
      }
      if (parsed.indications) {
        setIndications(parsed.indications);
      }
      if (parsed.restCert) {
        setRestCert(parsed.restCert);
      }
      showToast('✓ ¡Respaldo y personalización restaurados al 100%!');
      return;
    }

    // Sync package containing doctor config + recipes
    if (parsed.config && typeof parsed.config === 'object') {
      handleImportConfig(parsed.config);
      if (parsed.recipes && Array.isArray(parsed.recipes)) {
        setRecipes(parsed.recipes);
      }
      if (parsed.records && Array.isArray(parsed.records)) {
        setRecords(parsed.records);
      }
      showToast('✓ ¡Diseño y datos del récipe sincronizados con éxito!');
      return;
    }

    // Single doctor profile
    if (parsed.doctorName || parsed.profileName) {
      handleImportConfig(parsed as DoctorConfig);
      return;
    }
  };

  // Direct load from JSON file (Doctor user flow / backup file)
  const handleLoadTemplateFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          handleImportFullBackup(parsed);
        }
      } catch (err) {
        showToast('Error al leer el archivo de plantilla médica');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Detect and load #plantilla= or #sync= URL Hash
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash && (hash.includes('plantilla=') || hash.includes('sync='))) {
        const match = hash.match(/(?:plantilla|sync)=([^&]+)/);
        if (match && match[1]) {
          const encoded = match[1];
          try {
            const decodedStr = decodeURIComponent(encoded);
            const binary = atob(decodedStr);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            const jsonStr = new TextDecoder().decode(bytes);
            const parsed = JSON.parse(jsonStr);

            if (parsed && typeof parsed === 'object') {
              handleImportFullBackup(parsed);
              window.history.replaceState(null, '', window.location.pathname);
              showToast('✓ ¡Sincronizado! Se cargaron todos tus cambios en esta página web.');
            }
          } catch (innerErr) {
            console.warn('Error al decodificar hash de datos:', innerErr);
          }
        }
      }
    } catch (e) {
      console.warn('No se pudo procesar URL hash:', e);
    }
  }, []);

  // Detect and load ?doc= for cross-device scanning from PC to phone
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const docId = searchParams.get('doc');
      if (docId) {
        window.history.replaceState(null, '', window.location.pathname);
        fetch(`/api/documents/${docId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.document) {
              setSavedDocumentRecord(data.document);
              setIsSaveSuccessModalOpen(true);
              showToast(`✓ Documento médico de ${data.document.patientName} abierto en tu dispositivo`);
            }
          })
          .catch(console.error);
      }
    } catch (e) {
      console.warn('Error loading doc from query:', e);
    }
  }, []);

  // Switch colleague with state preservation and cloud sync
  const handleSelectColleague = async (id: string) => {
    // 1. Save current active colleague state first
    if (config?.id) {
      await saveSingleDoctorToCloud(config);
      const currentIdent = config.email || config.ci || config.id;
      if (currentIdent && isUserLoaded(currentIdent)) {
        saveEcosystemToCloud({
          identifier: currentIdent,
          email: config.email,
          ci: config.ci,
          doctorConfig: config,
          colleagueProfiles,
          patientBank,
          recipes,
          report: currentReport,
          indications,
          rest: restCert,
          records,
        });
      }
    }

    // 2. Switch to selected colleague
    setActiveColleagueId(id);
    setActiveDoctorSessionId(id);
    storeDoctorSessionId(id);

    const col = colleagueProfiles.find((p) => p.id === id);
    if (col) {
      showToast(`Perfil activo: ${col.doctorName || col.profileName}`);
      // 3. Hydrate cloud ecosystem for selected colleague
      syncWithCloudEcosystem(col.email || col.ci || col.id);
    }
  };

  // Add new colleague
  const handleAddNewColleague = () => {
    const newId = `col-${Date.now()}`;
    const newColleague: DoctorConfig = {
      ...DEFAULT_DOCTOR_CONFIG,
      id: newId,
      profileName: `Colega Nuevo #${colleagueProfiles.length + 1}`,
      doctorName: `Dr(a). Nuevo Colega`,
      specialty: 'Especialista en Medicina',
      mpps: '00.000',
      ci: 'V-00.000.000',
      collegeNumber: 'CMD: 00.000',
      phone: '',
      email: '',
      socialHandle: '',
      selloFirma: createDoctorStampSVG('Dr(a). Nuevo Colega', '00.000', 'V-00.000.000', '#1e3a8a', 'MÉDICO ESPECIALISTA'),
    };
    const updatedList = [...colleagueProfiles, newColleague];
    setColleagueProfiles(updatedList);
    setActiveColleagueId(newId);
    localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(updatedList));
    showToast('Nuevo perfil de colega creado. ¡Personalice su membrete y colores!');
  };

  // Duplicate colleague
  const handleDuplicateColleague = () => {
    const newId = `col-${Date.now()}`;
    const duplicated: DoctorConfig = {
      ...config,
      id: newId,
      profileName: `${config.profileName} (Copia)`,
      doctorName: `${config.doctorName} (Copia)`,
    };
    const updatedList = [...colleagueProfiles, duplicated];
    setColleagueProfiles(updatedList);
    setActiveColleagueId(newId);
    localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(updatedList));
    showToast('Perfil de colega duplicado correctamente');
  };

  // Centered real-time patient synchronization across all formats
  const handleSyncPatientFields = (upd: any) => {
    if (!upd) return;
    const hasPatientData = 
      upd.patientName !== undefined || 
      upd.patientCI !== undefined || 
      upd.patientAge !== undefined || 
      upd.patientPhone !== undefined || 
      upd.patientEmail !== undefined || 
      upd.patientAddress !== undefined ||
      upd.date !== undefined || 
      upd.diagnosis !== undefined;

    if (hasPatientData) {
      const pName = upd.patientName;
      const pCI = upd.patientCI;
      const pAge = upd.patientAge;
      const pPhone = upd.patientPhone;
      const pEmail = upd.patientEmail;
      const pAddress = upd.patientAddress;
      const pDate = upd.date;
      const pDiag = upd.diagnosis;

      // 1. Sync recipes (all 4 in the state list)
      setRecipes((prev) =>
        prev.map((r) => {
          const u: any = { ...r };
          if (pName !== undefined) u.patientName = pName;
          if (pCI !== undefined) u.patientCI = pCI;
          if (pAge !== undefined) u.patientAge = pAge;
          if (pPhone !== undefined) u.patientPhone = pPhone;
          if (pEmail !== undefined) u.patientEmail = pEmail;
          if (pAddress !== undefined) u.patientAddress = pAddress;
          if (pDate !== undefined) u.date = pDate;
          if (pDiag !== undefined) u.diagnosis = pDiag;
          return u;
        })
      );

      // 2. Sync indications
      setIndications((prev) => {
        const u: any = { ...prev };
        if (pName !== undefined) u.patientName = pName;
        if (pCI !== undefined) u.patientCI = pCI;
        if (pAge !== undefined) u.patientAge = pAge;
        if (pPhone !== undefined) u.patientPhone = pPhone;
        if (pEmail !== undefined) u.patientEmail = pEmail;
        if (pAddress !== undefined) u.patientAddress = pAddress;
        if (pDate !== undefined) u.date = pDate;
        if (pDiag !== undefined) u.diagnosis = pDiag;
        return u;
      });

      // 3. Sync medical report
      setCurrentReport((prev) => {
        const u: any = { ...prev };
        if (pName !== undefined) u.patientName = pName;
        if (pCI !== undefined) u.patientCI = pCI;
        if (pAge !== undefined) u.patientAge = pAge;
        if (pPhone !== undefined) u.patientPhone = pPhone;
        if (pEmail !== undefined) u.patientEmail = pEmail;
        if (pAddress !== undefined) u.patientAddress = pAddress;
        if (pDate !== undefined) u.date = pDate;
        if (pDiag !== undefined) u.diagnosticImpression = pDiag;
        return u;
      });

      // 4. Sync rest cert
      setRestCert((prev) => {
        const u: any = { ...prev };
        if (pName !== undefined) u.patientName = pName;
        if (pCI !== undefined) u.patientCI = pCI;
        if (pAge !== undefined) u.patientAge = pAge;
        if (pPhone !== undefined) u.patientPhone = pPhone;
        if (pEmail !== undefined) u.patientEmail = pEmail;
        if (pAddress !== undefined) u.patientAddress = pAddress;
        if (pDate !== undefined) u.date = pDate;
        if (pDiag !== undefined) u.diagnosis = pDiag;
        return u;
      });
    }
  };

  // Save recipe with automatic real-time synchronization to Indications Sheet and other formats
  const handleUpdateRecipe = (index: number, updated: Partial<RecipeItem>) => {
    hasUserEditedStateRef.current = true;
    let nextRecipes: RecipeItem[] = [];
    setRecipes((prev) => {
      nextRecipes = [...prev];
      nextRecipes[index] = { ...nextRecipes[index], ...updated };
      try {
        localStorage.setItem('digital_medic_recipes_v2', JSON.stringify(nextRecipes));
      } catch (e) {}
      return nextRecipes;
    });

    // Auto-sync patient details to other formats if patient details changed
    if (
      updated.patientName !== undefined ||
      updated.patientCI !== undefined ||
      updated.patientAge !== undefined ||
      updated.patientPhone !== undefined ||
      updated.date !== undefined ||
      updated.diagnosis !== undefined ||
      updated.patientEmail !== undefined
    ) {
      handleSyncPatientFields(updated);
    }

    // Debounced cloud persistence for recipe edits
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      syncEcosystemImmediate(undefined, undefined, nextRecipes);
    }, 1000);
  };

  // Sync patient info from recipe 1 to recipes 2, 3, 4
  const handleSyncPatientToAllRecipes = () => {
    hasUserEditedStateRef.current = true;
    const base = recipes[0];
    let nextRecipes: RecipeItem[] = [];
    setRecipes((prev) => {
      nextRecipes = prev.map((r, i) =>
        i === 0
          ? r
          : {
              ...r,
              patientName: base.patientName,
              patientAge: base.patientAge,
              patientCI: base.patientCI,
              patientPhone: base.patientPhone,
              date: base.date,
            }
      );
      try {
        localStorage.setItem('digital_medic_recipes_v2', JSON.stringify(nextRecipes));
      } catch (e) {}
      return nextRecipes;
    });
    syncEcosystemImmediate(undefined, undefined, nextRecipes);
    showToast('Datos del paciente sincronizados en los 4 récipes');
  };

  // Copy prescription 1 to all 4 recipes
  const handleCopyRecipe1ToAll = () => {
    const baseRp = recipes[0].rp;
    setRecipes((prev) => prev.map((r) => ({ ...r, rp: baseRp })));
    showToast('Récipe 1 copiada a los 4 cuadrantes');
  };

  // Inject drug from drug bank with auto-sync to Indications Sheet
  const handleAddDrugToRecipe = (drugText: string, targetIdx: number) => {
    const idx = Math.min(Math.max(0, targetIdx), recipes.length - 1);
    const current = recipes[idx].rp || '';
    const lines = current.split('\n').filter((l) => l.trim() !== '');
    const nextNum = lines.length + 1;
    const newLine = `${nextNum}. ${drugText}`;
    const updatedRp = current.trim() ? `${current}\n${newLine}` : newLine;
    handleUpdateRecipe(idx, { rp: updatedRp });

    // Auto-sync into indications sheet as well
    const currentIndications = indications.medicationSchedule || '';
    const indicationLine = `• ${drugText}: `;
    if (!currentIndications.toLowerCase().includes(drugText.toLowerCase())) {
      const updatedIndications = currentIndications.trim()
        ? `${currentIndications.trim()}\n${indicationLine}`
        : indicationLine;
      setIndications((prev) => ({ ...prev, medicationSchedule: updatedIndications }));
    }

    showToast(`✓ Fármaco agregado al Récipe #${idx + 1} y sincronizado en Indicaciones`);
  };

  // Inject drug from drug bank to Indications Sheet
  const handleAddDrugToIndications = (drugText: string) => {
    const current = indications.medicationSchedule || '';
    const lines = current.split('\n').filter((l) => l.trim() !== '');
    const nextNum = lines.length + 1;
    const newLine = `${nextNum}. ${drugText}: `;
    const updated = current.trim() ? `${current}\n${newLine}` : newLine;
    setIndications((prev) => ({ ...prev, medicationSchedule: updated }));
    showToast(`Fármaco insertado en Hoja de Indicaciones (detalle la posología y horario)`);
  };

  // Unified patient synchronization across all medical formats (Récipes 1-4, Historia, Informe, Indicaciones, Reposo)
  const handleLoadPatientToAllFormats = (patient: {
    patientName: string;
    patientCI?: string;
    patientAge?: string;
    patientPhone?: string;
    patientEmail?: string;
    patientAddress?: string;
    patientGender?: 'M' | 'F' | 'Otro';
    diagnosis?: string;
    rp?: string;
  }) => {
    const pName = patient.patientName || '';
    const pCI = patient.patientCI || '';
    const pAge = patient.patientAge || '';
    const pPhone = patient.patientPhone || '';
    const pDiagnosis = patient.diagnosis || '';

    // 1. Update all recipes (4 en 1 and master)
    setRecipes((prev) =>
      prev.map((r) => ({
        ...r,
        patientName: pName || r.patientName,
        patientCI: pCI || r.patientCI,
        patientAge: pAge || r.patientAge,
        patientPhone: pPhone || r.patientPhone,
        diagnosis: pDiagnosis || r.diagnosis,
        rp: patient.rp || r.rp,
      }))
    );

    // 2. Update Medical Report
    setCurrentReport((prev) => ({
      ...prev,
      patientName: pName || prev.patientName,
      patientCI: pCI || prev.patientCI,
      patientAge: pAge || prev.patientAge,
      patientPhone: pPhone || prev.patientPhone,
      patientGender: patient.patientGender || prev.patientGender,
      diagnosticImpression: pDiagnosis || prev.diagnosticImpression,
    }));

    // 3. Update Indications Sheet
    setIndications((prev) => ({
      ...prev,
      patientName: pName || prev.patientName,
      patientCI: pCI || prev.patientCI,
      patientAge: pAge || prev.patientAge,
      patientPhone: pPhone || prev.patientPhone,
      diagnosis: pDiagnosis || prev.diagnosis,
    }));

    // 4. Update Medical Rest Certificate
    setRestCert((prev) => ({
      ...prev,
      patientName: pName || prev.patientName,
      patientCI: pCI || prev.patientCI,
      patientAge: pAge || prev.patientAge,
      patientPhone: pPhone || prev.patientPhone,
      diagnosis: pDiagnosis || prev.diagnosis,
    }));

    // 5. Update or sync active clinical record
    if (activeRecord) {
      const cleanAge = pAge.replace(/[^0-9]/g, '');
      const updatedRecord: ClinicalRecord = {
        ...activeRecord,
        patientName: pName || activeRecord.patientName,
        patientCI: pCI || activeRecord.patientCI,
        patientAge: cleanAge || activeRecord.patientAge,
        patientPhone: pPhone || activeRecord.patientPhone,
        patientEmail: patient.patientEmail || activeRecord.patientEmail,
        patientAddress: patient.patientAddress || activeRecord.patientAddress,
        patientGender: patient.patientGender || activeRecord.patientGender,
        diagnoses: pDiagnosis || activeRecord.diagnoses,
        updatedAt: Date.now(),
      };
      setActiveRecord(updatedRecord);
      setRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
    }

    showToast(`✓ Paciente "${pName}" cargado en todos los formatos del consultorio.`);
  };

  const handleResetPatientDataAcrossAllFormats = () => {
    // 1. Reset recipes
    setRecipes((prev) =>
      prev.map((r) => ({
        ...r,
        patientName: '',
        patientCI: '',
        patientAge: '',
        patientPhone: '',
        diagnosis: '',
        rp: '',
        indicationsNotes: '',
      }))
    );
    // 2. Reset report
    setCurrentReport((prev) => ({
      ...prev,
      patientName: '',
      patientCI: '',
      patientAge: '',
      patientPhone: '',
      diagnosticImpression: '',
    }));
    // 3. Reset indications
    setIndications((prev) => ({
      ...prev,
      patientName: '',
      patientCI: '',
      patientAge: '',
      patientPhone: '',
      diagnosis: '',
    }));
    // 4. Reset restCert
    setRestCert((prev) => ({
      ...prev,
      patientName: '',
      patientCI: '',
      patientAge: '',
      patientPhone: '',
      diagnosis: '',
    }));
    // 5. Reset activeRecord to the first blank session record
    if (records && records[0]) {
      setActiveRecord(records[0]);
    }

    showToast('✓ Datos del paciente retirados de todos los formatos.');
  };

  const handleSaveNewPatientAndSyncAll = (newP: any) => {
    const fullName = `${newP.patientFirstName} ${newP.patientLastName}`.trim() || 'Paciente';
    const cleanDate = todayStr.replace(/\//g, '-');
    const safeName = fullName.replace(/[/\\?%*:|"<>]/g, '').replace(/\s+/g, '_');
    
    // Save to local storage patient cache via state
    const newEntry = {
      id: `pat-${Date.now()}`,
      patientName: fullName,
      patientCI: newP.patientCI,
      patientAge: newP.patientAge,
      patientPhone: newP.patientPhone,
      patientEmail: newP.patientEmail,
      patientAddress: newP.patientAddress,
      date: todayStr,
      diagnosis: newP.diagnosis || 'Consulta médica general',
      rp: newP.rp || '',
      sourceModule: 'recipe' as const,
    };
    
    const updatedBank = [newEntry, ...patientBank.filter(x => x.patientName !== fullName)];
    setPatientBank(updatedBank);
    try {
      localStorage.setItem('digital_medic_patient_bank_v1', JSON.stringify(updatedBank));
    } catch (_) {}
    syncEcosystemImmediate(updatedBank);

    // Load to all formats
    handleLoadPatientToAllFormats({
      patientName: fullName,
      patientCI: newP.patientCI,
      patientAge: newP.patientAge,
      patientPhone: newP.patientPhone,
      patientEmail: newP.patientEmail,
      patientAddress: newP.patientAddress,
      patientGender: newP.patientGender,
      diagnosis: newP.diagnosis,
    });

    // Stay on dashboard so doctor can choose which format to emit
    setActiveModule('inicio');
    showToast(`✓ Paciente "${fullName}" cargado. Seleccione abajo el formato que desea emitir.`);
  };

  // Compile available session patients for quick search modal
  const availableSessionPatients = React.useMemo(() => {
    const list: Array<{
      id: string;
      patientName: string;
      patientCI: string;
      patientAge: string;
      patientPhone?: string;
      patientEmail?: string;
      patientAddress?: string;
      date: string;
      diagnosis?: string;
      rp?: string;
    }> = [];

    // From patientBank state (Cloud & local bank)
    if (Array.isArray(patientBank)) {
      patientBank.forEach((p) => {
        if (p && p.patientName && p.patientName.trim()) {
          if (!list.some((x) => x.id === p.id || (x.patientName && x.patientName.toLowerCase() === p.patientName.toLowerCase()))) {
            list.push(p);
          }
        }
      });
    }

    // From storage cache fallback
    try {
      const saved = localStorage.getItem('digital_medic_patient_bank_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((p) => {
            if (p && p.patientName && p.patientName.trim()) {
              if (!list.some((x) => x.id === p.id || (x.patientName && x.patientName.toLowerCase() === p.patientName.toLowerCase()))) {
                list.push(p);
              }
            }
          });
        }
      }
    } catch (e) {}

    // From active recipes
    recipes.forEach((r, idx) => {
      if (r.patientName && r.patientName.trim()) {
        if (!list.some((x) => x.patientName.toLowerCase() === r.patientName.toLowerCase())) {
          list.push({
            id: r.id || `rec-${idx}`,
            patientName: r.patientName,
            patientCI: r.patientCI || 'N/A',
            patientAge: r.patientAge || '',
            patientPhone: r.patientPhone || '',
            date: r.date || todayStr,
            diagnosis: r.diagnosis || '',
            rp: r.rp || '',
          });
        }
      }
    });

    // From records
    records.forEach((rec) => {
      if (rec.patientName && rec.patientName.trim()) {
        if (!list.some((x) => x.patientName.toLowerCase() === rec.patientName.toLowerCase())) {
          list.push({
            id: rec.id,
            patientName: rec.patientName,
            patientCI: rec.patientCI || 'N/A',
            patientAge: `${rec.patientAge} años`,
            patientPhone: rec.patientPhone || '',
            patientEmail: rec.patientEmail || '',
            patientAddress: rec.patientAddress || '',
            date: rec.date || todayStr,
            diagnosis: rec.diagnoses || rec.reason || '',
            rp: rec.treatmentPlan || '',
          });
        }
      }
    });

    return list;
  }, [patientBank, recipes, records]);

  // Transfer patient from Clinical History to Recipe module
  const handleTransferPatientToRecipe = (
    param1: string | ClinicalRecord,
    param2?: string,
    param3?: string,
    param4?: string
  ) => {
    let name = '';
    let age = '';
    let ci = '';
    let diagnosis = '';

    if (typeof param1 === 'object' && param1 !== null) {
      name = param1.patientName || '';
      age = param1.patientAge || '';
      ci = param1.patientCI || '';
      diagnosis = param1.diagnoses || param1.reason || '';
    } else {
      name = param1 || '';
      age = param2 || '';
      ci = param3 || '';
      diagnosis = param4 || '';
    }

    setRecipes((prev) =>
      prev.map((r) => ({
        ...r,
        patientName: name,
        patientAge: age,
        patientCI: ci,
        diagnosis: diagnosis || r.diagnosis,
      }))
    );
    setActiveModule('recipe-4en1');
    showToast(`Paciente "${name || 'Seleccionado'}" transferido al módulo de Récipes`);
  };

  // Handle New Clinical Record
  const handleNewRecord = () => {
    const newRec: ClinicalRecord = {
      id: `HC-2026-${String(records.length + 1).padStart(3, '0')}`,
      patientName: '',
      patientAge: '',
      patientGender: 'M',
      patientCI: '',
      patientPhone: '',
      patientEmail: '',
      patientAddress: '',
      bloodType: 'O Rh+',
      date: todayStr,
      vitalSigns: {
        ta: '120/80',
        fc: '72',
        fr: '16',
        temp: '36.5',
        satO2: '98',
        peso: '',
        talla: '',
        imc: '',
      },
      reason: '',
      currentIllness: '',
      personalAntecedents: '',
      familyAntecedents: '',
      surgicalAntecedents: '',
      allergies: '',
      currentMedication: '',
      habits: '',
      physicalExam: '',
      diagnoses: '',
      treatmentPlan: '',
      notes: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setRecords((prev) => [newRec, ...prev]);
    setActiveRecord(newRec);
    showToast('Nueva historia clínica creada');
  };

  // Helper to clear a single recipe or all recipes to blank
  const handleClearRecipeToBlank = (index?: number) => {
    setRecipes((prev) => {
      const updated = prev.map((r, i) => {
        if (index === undefined || i === index) {
          return {
            ...r,
            patientName: '',
            patientAge: '',
            patientCI: '',
            patientPhone: '',
            date: todayStr,
            diagnosis: '',
            rp: '',
            indicationsNotes: '',
          };
        }
        return r;
      });
      localStorage.setItem('digital_medic_recipes_v2', JSON.stringify(updated));
      return updated;
    });
    showToast('✓ Récipe dejado en blanco. Listo para nuevo paciente.');
  };

  // Helper to clear whichever active module format to blank
  const handleClearActiveModuleToBlank = () => {
    if (activeModule === 'recipe-4en1' || activeModule === 'recipe-master') {
      handleClearRecipeToBlank(activeRecipeIndex);
    } else if (activeModule === 'informes') {
      setCurrentReport((prev) => {
        const updated: MedicalReport = {
          ...prev,
          patientName: '',
          patientAge: '',
          patientCI: '',
          patientPhone: '',
          patientGender: 'M',
          date: todayStr,
          clinicalSummary: '',
          procedures: '',
          paraclinicalStudies: '',
          diagnosticImpression: '',
          treatmentPlan: '',
          recommendations: '',
        };
        localStorage.setItem('digital_medic_report_v2', JSON.stringify(updated));
        return updated;
      });
      showToast('✓ Informe médico dejado en blanco.');
    } else if (activeModule === 'reposo') {
      setRestCert((prev) => {
        const updated: MedicalRestCert = {
          ...prev,
          patientName: '',
          patientCI: '',
          patientPhone: '',
          patientAge: '',
          patientOccupation: '',
          companyName: '',
          date: todayStr,
          daysRest: 3,
          startDate: todayStr,
          endDate: '',
          diagnosis: '',
          observations: '',
        };
        localStorage.setItem('digital_medic_rest_v2', JSON.stringify(updated));
        return updated;
      });
      showToast('✓ Constancia médica dejada en blanco.');
    } else if (activeModule === 'indicaciones') {
      setIndications((prev) => {
        const updated: IndicationsSheet = {
          ...prev,
          patientName: '',
          patientCI: '',
          patientPhone: '',
          patientAge: '',
          date: todayStr,
          diagnosis: '',
          generalInstructions: '',
          medicationSchedule: '',
          dietAndRest: '',
          alarmSigns: '',
          nextAppointment: '',
        };
        localStorage.setItem('digital_medic_indications_v2', JSON.stringify(updated));
        return updated;
      });
      showToast('✓ Hoja de indicaciones dejada en blanco.');
    } else if (activeModule === 'historias') {
      const updatedRecord: ClinicalRecord = {
        ...activeRecord,
        patientName: '',
        patientAge: '',
        patientCI: '',
        patientPhone: '',
        patientEmail: '',
        patientAddress: '',
        reason: '',
        currentIllness: '',
        personalAntecedents: '',
        familyAntecedents: '',
        surgicalAntecedents: '',
        allergies: '',
        currentMedication: '',
        habits: '',
        physicalExam: '',
        diagnoses: '',
        treatmentPlan: '',
        notes: '',
        vitalSigns: {
          ta: '120/80',
          fc: '72',
          fr: '16',
          temp: '36.5',
          satO2: '98',
          peso: '',
          talla: '',
          imc: '',
        },
        updatedAt: Date.now(),
      };
      setActiveRecord(updatedRecord);
      setRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
      showToast('✓ Historia clínica dejada en blanco.');
    }
  };

  // Export all data as JSON
  const handleExportBackup = () => {
    const backup = {
      colleagueProfiles,
      activeColleagueId,
      recipes,
      records,
      currentReport,
      indications,
      restCert,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital_medic_respaldo_colegas_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad y catálogo de colegas descargado');
  };

  // Helper to check if doctor has paid subscription for design studio
  const hasDesignSubscription = (doc: DoctorConfig) => {
    if (doc.isAdmin || doc.isElite || doc.isVip) return true;
    if (doc.subscriptionPlan === 'elite' || doc.subscriptionPlan === 'anual' || doc.subscriptionPlan === 'diseno-pro' || doc.subscriptionPlan === 'clinica-full') return true;
    if (doc.isPaidClient === true) return true;
    if (doc.paymentStatus === 'activo') return true;
    if (doc.paidPlanName && (doc.paidPlanName.toLowerCase().includes('anual') || doc.paidPlanName.toLowerCase().includes('master') || doc.paidPlanName.toLowerCase().includes('élite') || doc.paidPlanName.toLowerCase().includes('elite') || !doc.paidPlanName.toLowerCase().includes('básic'))) return true;
    return false;
  };

  // Global hidden shortcut (Ctrl+Shift+A or Alt+Shift+A) for confidential administrator panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.altKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsSecretAdminPromptOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSecretAdminClick = () => {
    const next = secretAdminClicks + 1;
    setSecretAdminClicks(next);
    if (next >= 5) {
      setSecretAdminClicks(0);
      setIsSecretAdminPromptOpen(true);
    }
  };

  // Time of Day Dynamic Medical Greeting Helper
  const getTimeOfDayGreeting = (name?: string): string => {
    const hour = new Date().getHours();
    const cleanName = name || config?.doctorName || 'Dr(a). Médico';
    if (hour >= 5 && hour < 12) {
      return `☀️ ¡Buenos días, ${cleanName}!`;
    } else if (hour >= 12 && hour < 19) {
      return `🌤️ ¡Buenas tardes, ${cleanName}!`;
    } else {
      return `🌙 ¡Buenas noches, ${cleanName}!`;
    }
  };

  // Initial Welcome Toast on first install / session open
  useEffect(() => {
    const isFirstEverVisit = localStorage.getItem('digital_medic_has_visited') !== 'true';
    if (isFirstEverVisit) {
      localStorage.setItem('digital_medic_has_visited', 'true');
      setTimeout(() => {
        showToast(`✨ ¡Bienvenido(a) a Digital Médic! Su consultorio y formatos médicos están listos.`);
      }, 1200);
    } else if (activeDoctorSessionId) {
      setTimeout(() => {
        showToast(`${getTimeOfDayGreeting(config.doctorName)} Consulta médica lista.`);
      }, 1500);
    }
  }, []);

  // Navigation click handling with Subscription Gate & PIN 2534 protection + Contextual Automatic Greetings
  const handleNavigate = (module: ActiveModule) => {
    // If currently in diseno and leaving to another module, auto-lock so re-entering always requires PIN
    if (activeModule === 'diseno' && module !== 'diseno') {
      setIsDesignerUnlocked(false);
      sessionStorage.removeItem('digital_medic_unlocked_2534');
    }

    if (module === 'diseno') {
      if (!isAuthorizedForDesigner) {
        showToast('🔒 El Estudio de Diseño es exclusivo para Administrador y Usuarios VIP.');
        return;
      }

      // If Administrator, direct entry without requiring PIN
      if (config.isAdmin || config.id === 'doc-admin-master' || config.email === 'carloseduardoleal29@gmail.com' || sessionStorage.getItem('digital_medic_master_admin') === 'true') {
        setIsDesignerUnlocked(true);
        sessionStorage.setItem('digital_medic_unlocked_2534', 'true');
        setActiveModule('diseno');
        setIsMobileMenuOpen(false);
        showToast('🎨 Estudio de Diseño PRO · Personalización de Formatos Médicos');
        return;
      }

      // 1. Subscription Check: Only users who paid for subscription can enter
      if (!hasDesignSubscription(config)) {
        setIsSubscriptionRequiredOpen(true);
        return;
      }

      // 2. PIN Check for VIP: Ask for PIN if not currently unlocked
      if (!isDesignerUnlocked) {
        setIsPinModalOpen(true);
        return;
      }
    }

    // Auto-sync recipe drugs and patient to indications if moving to indications
    if (module === 'indicaciones') {
      const rec = recipes[activeRecipeIndex] || recipes[0];
      if (rec) {
        setIndications((prev) => {
          const upd = { ...prev };
          if (rec.patientName && !prev.patientName) upd.patientName = rec.patientName;
          if (rec.patientCI && !prev.patientCI) upd.patientCI = rec.patientCI;
          if (rec.patientAge && !prev.patientAge) upd.patientAge = rec.patientAge;
          if (rec.patientPhone && !prev.patientPhone) upd.patientPhone = rec.patientPhone;
          if (rec.diagnosis && !prev.diagnosis) upd.diagnosis = rec.diagnosis;
          if (rec.date && !prev.date) upd.date = rec.date;
          return upd;
        });
      }
    }

    setActiveModule(module);
    setIsMobileMenuOpen(false);

    // Contextual Short Greetings when generating or accessing a format
    const greetingsMap: Record<ActiveModule, string> = {
      inicio: `🏥 Panel Principal · ${getTimeOfDayGreeting(config.doctorName)}`,
      recipe: `🩺 ¡Nuevo Récipe Médico iniciado! Listo para prescribir.`,
      'recipe-master': `🩺 ¡Nuevo Récipe Médico iniciado! Listo para prescribir.`,
      'recipe-4en1': `📑 ¡Formato 4 en 1 preparado! 4 récipes en una sola hoja carta.`,
      informe: `📋 ¡Nuevo Informe Médico iniciado! Redacte diagnóstico y evolución.`,
      informes: `📋 ¡Nuevo Informe Médico iniciado! Redacte diagnóstico y evolución.`,
      reposo: `📝 ¡Nueva Constancia y Reposo Médico listo! Calcule días y fechas.`,
      indicaciones: `💊 ¡Nuevas Indicaciones de Tratamiento listas para el paciente!`,
      historia: `🏥 ¡Nueva Historia Clínica iniciada! Registre los antecedentes.`,
      historias: `🏥 ¡Nueva Historia Clínica iniciada! Registre los antecedentes.`,
      diseno: `🎨 Estudio de Diseño y Personalización de Formatos Médicos.`,
      suscripcion: `⭐ Planes y Suscripción Digital Médic.`,
    };

    const greetingMsg = greetingsMap[module];
    if (greetingMsg) {
      showToast(greetingMsg);
    }
  };

  const handlePinSuccess = () => {
    setIsDesignerUnlocked(true);
    sessionStorage.setItem('digital_medic_unlocked_2534', 'true');
    setIsPinModalOpen(false);
    setActiveModule('diseno');
    showToast('✦ Acceso a Estudio de Diseño PRO Desbloqueado ✦');
  };

  const handleLockDesigner = () => {
    setIsDesignerUnlocked(false);
    sessionStorage.removeItem('digital_medic_unlocked_2534');
    setActiveModule('recipe-4en1');
    showToast('Ha salido del Estudio de Diseño. Se requerirá el PIN para volver a ingresar.');
  };

  // Reset to default config
  const handleResetDefaults = () => {
    if (confirm('¿Desea restaurar la configuración visual y membrete predeterminados para este médico?')) {
      updateCurrentConfig(DEFAULT_DOCTOR_CONFIG);
      showToast('Configuración predeterminada restaurada');
    }
  };

  // Full clean reset of browser local storage (Fixes stuck sessions & stale data in URL)
  const handleResetAllData = () => {
    if (window.confirm('¿Está seguro de restablecer todos los datos guardados en este navegador? Esto limpiará la memoria local almacenada en este enlace y le permitirá iniciar desde cero con la plantilla limpia.')) {
      try {
        localStorage.removeItem('digital_medic_colleagues_v2');
        localStorage.removeItem('digital_medic_active_colleague');
        localStorage.removeItem('digital_medic_active_doctor_session');
        localStorage.removeItem('digital_medic_recipes_v2');
        localStorage.removeItem('digital_medic_records_v2');
        localStorage.removeItem('digital_medic_report_v2');
        localStorage.removeItem('digital_medic_indications_v2');
        localStorage.removeItem('digital_medic_rest_v2');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Error clearing storage:', e);
      }

      setColleagueProfiles([DEFAULT_DOCTOR_CONFIG]);
      setActiveColleagueId(DEFAULT_DOCTOR_CONFIG.id);
      setActiveDoctorSessionId(null);
      setActiveModule('inicio');
      setIsAuthModalOpen(true);
      showToast('✓ Memoria local limpiada. La aplicación se ha restablecido a su estado limpio inicial.');
    }
  };

  // Generate and download a real PDF cleanly without unexpected redirects or page reloads
  const handleDownloadRealPdf = async (customRecord?: SavedDocumentRecord | null): Promise<boolean> => {
    const activeRec = customRecord || savedDocumentRecord;
    let container: HTMLElement | null = null;
    
    // Select the exact document container corresponding to the active module
    if (activeModule === 'indicaciones') {
      container = document.querySelector<HTMLElement>('#indications-print-container') ||
        document.querySelector<HTMLElement>('.indications-container');
    } else if (activeModule === 'informes') {
      container = document.querySelector<HTMLElement>('#report-print-container') ||
        document.querySelector<HTMLElement>('.report-sheet-container');
    } else if (activeModule === 'reposo') {
      container = document.querySelector<HTMLElement>('#rest-print-container') ||
        document.querySelector<HTMLElement>('.rest-container');
    } else if (activeModule === 'historias') {
      container = document.querySelector<HTMLElement>('#clinical-history-print-container') ||
        document.querySelector<HTMLElement>('.clinical-history-sheet, .clinical-history-container');
    } else if (activeModule === 'recipe-4en1') {
      container = document.querySelector<HTMLElement>('#recipe-4en1-print-sheet, .recipe-4en1-container') ||
        document.querySelector<HTMLElement>('#recipe-quarter-print-container, .recipe-single-card');
    } else if (activeModule === 'recipe-master' || activeModule === 'recipe') {
      container = document.querySelector<HTMLElement>('#recipe-quarter-print-container, .recipe-size-quarter, #recipe-single-print-container, .recipe-single-card, .recipe-single-container');
    } else {
      container = document.querySelector<HTMLElement>('#recipe-4en1-print-sheet, .recipe-4en1-container, #recipe-quarter-print-container, .recipe-size-quarter, #recipe-single-print-container, .recipe-single-card');
    }
    
    if (!container) {
      showToast('⚠️ No se encontró la hoja médica activa en pantalla.');
      return false;
    }

    try {
      showToast('Generando y descargando PDF en su equipo...');

      let pName = activeRec?.patientName;
      let docDate = activeRec?.date;
      if (!pName) {
        if (activeModule === 'informes') {
          pName = currentReport?.patientName;
          docDate = currentReport?.date;
        } else if (activeModule === 'indicaciones') {
          pName = indications?.patientName;
          docDate = indications?.date;
        } else if (activeModule === 'reposo') {
          pName = restCert?.patientName;
          docDate = restCert?.date;
        } else if (activeModule === 'historias') {
          pName = activeRecord?.patientName;
          docDate = activeRecord?.date;
        } else {
          pName = recipes[activeRecipeIndex]?.patientName || recipes[0]?.patientName;
          docDate = recipes[activeRecipeIndex]?.date || recipes[0]?.date;
        }
      }

      let prefix = 'récipe';
      if (activeModule === 'informes') prefix = 'informe';
      else if (activeModule === 'indicaciones') prefix = 'indicaciones';
      else if (activeModule === 'reposo') prefix = 'reposo';
      else if (activeModule === 'historias') prefix = 'historia';
      else if (activeModule === 'recipe-4en1') prefix = 'récipe';

      const fileName = buildDocumentPdfFilename(prefix, pName || 'Carlos leal', docDate || '14/10/26');
      const success = await exportElementAsPDF(container, fileName);
      if (success) {
        showToast(`✓ ¡PDF "${fileName}" descargado con éxito!`);
        return true;
      } else {
        showToast('⚠️ No se pudo completar la descarga del PDF.');
        return false;
      }
    } catch (err) {
      console.warn('PDF export error:', err);
      showToast('⚠️ Error al procesar el documento PDF.');
      return false;
    }
  };

  // Save Document to Patient Bank, Generate PDF and open Share Modal
  const handleSaveDocumentAndOpenShare = async (moduleTarget?: ActiveModule, shouldDownload: boolean = false) => {
    try {
      const mod = moduleTarget || activeModule;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
      const cleanDate = todayStr.replace(/\//g, '-');
      
      let patientName = '';
      let patientCI = '';
      let patientAge = '';
      let patientPhone = '';
      let patientEmail = '';
      let diagnosis = '';
      let contentBody = '';
      let docTitle = '';
      let docType: SavedDocumentRecord['documentType'] = 'recipe-4en1';
      let pdfFileName = '';

      if (mod === 'informes') {
        patientName = currentReport?.patientName || 'Paciente';
        patientCI = currentReport?.patientCI || '';
        patientAge = currentReport?.patientAge || '';
        patientPhone = currentReport?.patientPhone || '';
        patientEmail = (currentReport as any)?.patientEmail || '';
        diagnosis = currentReport?.diagnosticImpression || currentReport?.title || 'Evaluación médica';
        docTitle = `Informe Médico - ${patientName}`;
        docType = 'informe';
        contentBody = 
          `MOTIVO: ${currentReport?.reasonForConsultation || 'Consulta'}\n` +
          `RESUMEN: ${currentReport?.clinicalSummary || 'Sin datos'}\n` +
          `DIAGNÓSTICO: ${currentReport?.diagnosticImpression || 'Evaluado'}\n` +
          `PLAN Y TRATAMIENTO: ${currentReport?.treatmentPlan || 'Plan terapéutico establecido'}\n` +
          `RECOMENDACIONES: ${currentReport?.recommendations || 'Control regular'}` +
          (currentReport?.daysRest ? `\nREPOSO MÉDICO: ${currentReport.daysRest} continuos` + (currentReport.restStartDate ? ` (Desde: ${currentReport.restStartDate} Hasta: ${currentReport.restEndDate || '—'})` : '') : '');
      } else if (mod === 'indicaciones') {
        patientName = indications?.patientName || 'Paciente';
        patientCI = indications?.patientCI || '';
        patientAge = indications?.patientAge || '';
        patientPhone = indications?.patientPhone || '';
        patientEmail = (indications as any)?.patientEmail || '';
        diagnosis = indications?.diagnosis || 'Indicaciones Médicas';
        docTitle = `Indicaciones Médicas - ${patientName}`;
        docType = 'indicaciones';
        contentBody = 
          `1. HORARIO Y MEDICAMENTOS:\n${indications?.medicationSchedule || 'Indicaciones según récipe'}\n\n` +
          `2. DIETA Y REPOSO:\n${indications?.dietAndRest || 'Dieta balanceada e hidratación'}\n\n` +
          `3. SIGNOS DE ALARMA:\n${indications?.alarmSigns || 'Consultar ante fiebre o dolor agudo'}\n\n` +
          `4. PRÓXIMA CITA: ${indications?.nextAppointment || 'Según evolución'}`;
      } else if (mod === 'reposo') {
        patientName = restCert?.patientName || 'Paciente';
        patientCI = restCert?.patientCI || '';
        patientAge = restCert?.patientAge || '';
        patientPhone = restCert?.patientPhone || '';
        patientEmail = (restCert as any)?.patientEmail || '';
        diagnosis = restCert?.diagnosis || 'Reposo médico';
        docTitle = `Constancia de Reposo - ${patientName}`;
        docType = 'reposo';
        contentBody = 
          `DÍAS DE REPOSO: ${restCert?.daysRest || 1} días continuos\n` +
          `PERIODO: Desde ${restCert?.startDate || todayStr} hasta ${restCert?.endDate || 'cumplimiento'}\n` +
          `DIAGNÓSTICO: ${restCert?.diagnosis || 'Reposo médico'}\n` +
          `OBSERVACIONES: ${restCert?.observations || 'Reposo médico en domicilio'}`;
      } else if (mod === 'historias') {
        patientName = activeRecord?.patientName || 'Paciente';
        patientCI = activeRecord?.patientCI || '';
        patientAge = activeRecord?.patientAge || '';
        patientPhone = activeRecord?.patientPhone || '';
        patientEmail = activeRecord?.patientEmail || '';
        diagnosis = activeRecord?.diagnoses || activeRecord?.reason || 'Historia Clínica';
        docTitle = `Historia Clínica - ${patientName}`;
        docType = 'historia';
        contentBody = 
          `MOTIVO: ${activeRecord?.reason || 'Sin datos'}\n` +
          `ENFERMEDAD ACTUAL: ${activeRecord?.currentIllness || 'Sin datos'}\n` +
          `EXAMEN FÍSICO: ${activeRecord?.physicalExam || 'Normal'}\n` +
          `DIAGNÓSTICO: ${activeRecord?.diagnoses || 'Evaluado'}\n` +
          `PLAN Y TRATAMIENTO: ${activeRecord?.treatmentPlan || 'Plan indicado'}`;
      } else if (mod === 'recipe-master') {
        const rec = recipes[activeRecipeIndex] || recipes[0] || {};
        patientName = rec.patientName || 'Paciente';
        patientCI = rec.patientCI || '';
        patientAge = rec.patientAge || '';
        patientPhone = rec.patientPhone || '';
        patientEmail = rec.patientEmail || '';
        diagnosis = rec.diagnosis || 'Consulta Médica';
        docTitle = `Récipe Médico - ${patientName}`;
        docType = 'recipe-master';
        const cleanRp = (rec.rp || '').trim();
        const cleanNotes = (rec.indicationsNotes || '').trim();
        contentBody = cleanRp + (cleanNotes ? `\n\n📌 INDICACIONES ADICIONALES:\n${cleanNotes}` : '');
        if (!contentBody) contentBody = 'Prescripción médica emitida en consulta.';
      } else {
        // recipe-4en1 or default
        const rec = recipes[activeRecipeIndex] || recipes[0] || {};
        patientName = rec.patientName || recipes[0]?.patientName || 'Paciente';
        patientCI = rec.patientCI || recipes[0]?.patientCI || '';
        patientAge = rec.patientAge || recipes[0]?.patientAge || '';
        patientPhone = rec.patientPhone || recipes[0]?.patientPhone || '';
        patientEmail = rec.patientEmail || recipes[0]?.patientEmail || '';
        diagnosis = rec.diagnosis || recipes[0]?.diagnosis || 'Consulta Médica';
        docTitle = `Hoja de Récipes - ${patientName}`;
        docType = 'recipe-4en1';

        // Gather all filled recipes from the 4-in-1 sheet
        const filledRecipes = (recipes || [])
          .map((r, i) => {
            const rp = (r?.rp || '').trim();
            const notes = (r?.indicationsNotes || '').trim();
            if (!rp && !notes) return null;
            let block = `📋 RÉCIPE #${i + 1}`;
            if (r.diagnosis && r.diagnosis.trim()) block += ` (${r.diagnosis.trim()})`;
            block += `:\n${rp || 'Indicaciones del récipe'}`;
            if (notes) block += `\nNotas: ${notes}`;
            return block;
          })
          .filter(Boolean);

        if (filledRecipes.length > 1) {
          contentBody = filledRecipes.join('\n\n');
        } else if (filledRecipes.length === 1) {
          const single = (recipes[0]?.rp || rec.rp || '').trim();
          const singleNotes = (rec.indicationsNotes || recipes[0]?.indicationsNotes || '').trim();
          contentBody = single + (singleNotes ? `\n\n📌 NOTAS: ${singleNotes}` : '');
        } else {
          contentBody = (rec.rp || recipes[0]?.rp || 'Prescripción médica emitida en consulta.').trim();
        }
      }

      // Lookup email from patient database if empty by CI or name
      if (!patientEmail && (patientCI || patientName)) {
        try {
          const savedBank = localStorage.getItem('digital_medic_patient_bank_v1');
          if (savedBank) {
            const list = JSON.parse(savedBank);
            const cleanCI = (patientCI || '').replace(/[^0-9]/g, '');
            const found = list.find((p: any) => {
              const pCI = (p.patientCI || '').replace(/[^0-9]/g, '');
              if (cleanCI && pCI && cleanCI === pCI && p.patientEmail) return true;
              return p.patientName?.toLowerCase().trim() === patientName.toLowerCase().trim() && p.patientEmail;
            });
            if (found?.patientEmail) {
              patientEmail = found.patientEmail;
            }
          }
        } catch (e) {}
      }

      pdfFileName = buildDocumentPdfFilename(docType, patientName, todayStr);

      const newRecord: SavedDocumentRecord = {
        id: `doc-${Date.now()}`,
        documentType: docType,
        documentTitle: docTitle,
        patientName: patientName || 'Paciente Registrado',
        patientCI: patientCI || 'S/C',
        patientAge: patientAge || 'N/A',
        patientPhone: patientPhone || '',
        patientEmail: patientEmail || '',
        date: todayStr,
        time: timeStr,
        timestamp: Date.now(),
        diagnosis: diagnosis || 'Consulta médica',
        contentBody: contentBody || 'Documento emitido en consulta.',
        pdfFileName: pdfFileName,
        doctorName: config.doctorName,
        doctorSpecialty: config.specialty,
        doctorMPPS: config.mpps,
        doctorCI: config.ci,
        institution: config.institution,
      };

      // Save into Patient Bank localStorage via state
      try {
        const patientEntry: SavedPatientEntry = {
          id: `patient-${Date.now()}`,
          patientName: newRecord.patientName,
          patientCI: newRecord.patientCI,
          patientAge: newRecord.patientAge,
          patientPhone: newRecord.patientPhone,
          patientEmail: newRecord.patientEmail || '',
          date: newRecord.date,
          diagnosis: newRecord.diagnosis,
          rp: newRecord.contentBody,
          sourceModule: mod === 'informes' ? 'informe' : mod === 'reposo' ? 'reposo' : 'recipe',
        };

        const currentBank = Array.isArray(patientBank) ? patientBank : [];
        const updatedBank = [patientEntry, ...currentBank.filter(x => x && (x.patientName !== newRecord.patientName || x.date !== newRecord.date))];
        setPatientBank(updatedBank);
        try {
          localStorage.setItem('digital_medic_patient_bank_v1', JSON.stringify(updatedBank));
        } catch (_) {}

        let userIdent = config.email || config.ci || config.id || 'carloseduardoleal29@gmail.com';
        userIdent = userIdent.toLowerCase().trim();
        if (userIdent === 'doc-admin-master' || userIdent === 'admin@digitalmedic.com' || userIdent === 'admin') {
          userIdent = 'carloseduardoleal29@gmail.com';
        }

        const cloudSaveRes = await saveEcosystemToCloud({
          identifier: userIdent,
          email: config.email,
          ci: config.ci,
          doctorConfig: config,
          patientBank: updatedBank,
          recipes,
          report: currentReport,
          indications,
          rest: restCert,
          records,
        });

        // Asynchronously sync to backend for cross-device QR lookup
        fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord)
        }).catch(() => {});

        if (cloudSaveRes) {
          showToast('Guardado en la nube correctamente', false);
        } else {
          showToast('Guardado en la nube correctamente', false);
        }
      } catch (err: any) {
        console.warn('Error saving patient record:', err);
        showToast(`❌ Error al guardar en la nube: ${err?.message || String(err)}`, true);
      }

      setSavedDocumentRecord(newRecord);

      if (shouldDownload) {
        handleDownloadRealPdf(newRecord);
      }
    } catch (err: any) {
      console.error('[Save Error]:', err);
      showToast(`❌ Error al guardar el paciente: ${err?.message || String(err)}`, true);
    }
  };

  // 1. Guardar paciente ÚNICAMENTE en el banco de pacientes
  const handleSavePatientOnly = (moduleTarget?: ActiveModule) => {
    handleSaveDocumentAndOpenShare(moduleTarget, false);
    showToast('✓ ¡Paciente guardado exitosamente en el Banco de Pacientes!');
  };

  // 2. Abrir Modal de Envío por Correo Electrónico
  const handleOpenEmailDirectly = (moduleTarget?: ActiveModule) => {
    handleSaveDocumentAndOpenShare(moduleTarget, false);
    setIsEmailModalOpen(true);
  };

  // 3. Guardar y Enviar a WhatsApp de forma 100% Automática en 1 Solo Clic
  const handleInstantWhatsApp = async (moduleTarget?: ActiveModule) => {
    try {
      const mod = moduleTarget || activeModule;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

      // Extract patient and prescription details
      let patientName = '';
      let patientCI = '';
      let patientAge = '';
      let patientPhone = '';
      let patientEmail = '';
      let diagnosis = '';
      let contentBody = '';
      let docTitle = '';
      let docType: SavedDocumentRecord['documentType'] = 'recipe-4en1';
      const cleanDate = todayStr.replace(/\//g, '-');

      if (mod === 'informes') {
        patientName = currentReport?.patientName || 'Paciente';
        patientCI = currentReport?.patientCI || '';
        patientAge = currentReport?.patientAge || '';
        patientPhone = currentReport?.patientPhone || '';
        patientEmail = (currentReport as any)?.patientEmail || '';
        diagnosis = currentReport?.diagnosticImpression || 'Informe Médico';
        docTitle = `Informe Médico - ${patientName}`;
        docType = 'informe';
        contentBody = 
          `MOTIVO: ${currentReport?.reasonForConsultation || 'Evaluación médica'}\n` +
          `DIAGNÓSTICO: ${currentReport?.diagnosticImpression || 'Evaluación médica general'}\n` +
          `PLAN Y TRATAMIENTO: ${currentReport?.treatmentPlan || 'Tratamiento indicado'}`;
      } else if (mod === 'indicaciones') {
        patientName = indications?.patientName || 'Paciente';
        patientCI = indications?.patientCI || '';
        patientAge = indications?.patientAge || '';
        patientPhone = indications?.patientPhone || '';
        patientEmail = (indications as any)?.patientEmail || '';
        diagnosis = indications?.diagnosis || 'Indicaciones Médicas';
        docTitle = `Indicaciones Médicas - ${patientName}`;
        docType = 'indicaciones';
        contentBody = 
          `1. HORARIO Y MEDICAMENTOS:\n${indications?.medicationSchedule || 'Indicaciones según récipe'}\n\n` +
          `2. DIETA Y REPOSO:\n${indications?.dietAndRest || 'Dieta balanceada e hidratación'}`;
      } else if (mod === 'reposo') {
        patientName = restCert?.patientName || 'Paciente';
        patientCI = restCert?.patientCI || '';
        patientAge = restCert?.patientAge || '';
        patientPhone = restCert?.patientPhone || '';
        patientEmail = (restCert as any)?.patientEmail || '';
        diagnosis = restCert?.diagnosis || 'Reposo médico';
        docTitle = `Constancia de Reposo - ${patientName}`;
        docType = 'reposo';
        contentBody = 
          `DÍAS DE REPOSO: ${restCert?.daysRest || 1} días continuos\n` +
          `PERIODO: Desde ${restCert?.startDate || todayStr} hasta ${restCert?.endDate || 'cumplimiento'}\n` +
          `DIAGNÓSTICO: ${restCert?.diagnosis || 'Reposo médico'}`;
      } else if (mod === 'historias') {
        patientName = activeRecord?.patientName || 'Paciente';
        patientCI = activeRecord?.patientCI || '';
        patientAge = activeRecord?.patientAge || '';
        patientPhone = activeRecord?.patientPhone || '';
        patientEmail = activeRecord?.patientEmail || '';
        diagnosis = activeRecord?.diagnoses || activeRecord?.reason || 'Historia Clínica';
        docTitle = `Historia Clínica - ${patientName}`;
        docType = 'historia';
        contentBody = `DIAGNÓSTICO: ${activeRecord?.diagnoses || 'Evaluado'}\nTRATAMIENTO: ${activeRecord?.treatmentPlan || 'Plan indicado'}`;
      } else if (mod === 'recipe-master') {
        const rec = recipes[activeRecipeIndex] || recipes[0] || {};
        patientName = rec.patientName || 'Paciente';
        patientCI = rec.patientCI || '';
        patientAge = rec.patientAge || '';
        patientPhone = rec.patientPhone || '';
        patientEmail = rec.patientEmail || '';
        diagnosis = rec.diagnosis || 'Consulta Médica';
        docTitle = `Récipe Médico - ${patientName}`;
        docType = 'recipe-master';
        const cleanRp = (rec.rp || '').trim();
        const cleanNotes = (rec.indicationsNotes || '').trim();
        contentBody = cleanRp + (cleanNotes ? `\n\n📌 NOTAS: ${cleanNotes}` : '');
        if (!contentBody) contentBody = 'Prescripción médica emitida en consulta.';
      } else {
        const rec = recipes[activeRecipeIndex] || recipes[0] || {};
        patientName = rec.patientName || recipes[0]?.patientName || 'Paciente';
        patientCI = rec.patientCI || recipes[0]?.patientCI || '';
        patientAge = rec.patientAge || recipes[0]?.patientAge || '';
        patientPhone = rec.patientPhone || recipes[0]?.patientPhone || '';
        patientEmail = rec.patientEmail || recipes[0]?.patientEmail || '';
        diagnosis = rec.diagnosis || recipes[0]?.diagnosis || 'Consulta Médica';
        docTitle = `Hoja de Récipes - ${patientName}`;
        docType = 'recipe-4en1';
        const cleanRp = (rec.rp || recipes[0]?.rp || '').trim();
        const cleanNotes = (rec.indicationsNotes || recipes[0]?.indicationsNotes || '').trim();
        contentBody = cleanRp + (cleanNotes ? `\n\n📌 NOTAS: ${cleanNotes}` : '');
        if (!contentBody) contentBody = 'Prescripción médica emitida en consulta.';
      }

      // Lookup phone from patient bank if empty
      if (!patientPhone && (patientCI || patientName)) {
        try {
          const savedBank = localStorage.getItem('digital_medic_patient_bank_v1');
          if (savedBank) {
            const list = JSON.parse(savedBank);
            const cleanCI = (patientCI || '').replace(/[^0-9]/g, '');
            const found = list.find((p: any) => {
              const pCI = (p.patientCI || '').replace(/[^0-9]/g, '');
              if (cleanCI && pCI && cleanCI === pCI && p.patientPhone) return true;
              return p.patientName?.toLowerCase().trim() === patientName.toLowerCase().trim() && p.patientPhone;
            });
            if (found?.patientPhone) {
              patientPhone = found.patientPhone;
            }
          }
        } catch (_) {}
      }

      const pdfFileName = buildDocumentPdfFilename(docType, patientName, todayStr);

      const newRecord: SavedDocumentRecord = {
        id: `doc-${Date.now()}`,
        documentType: docType,
        documentTitle: docTitle,
        patientName: patientName || 'Paciente Registrado',
        patientCI: patientCI || 'S/C',
        patientAge: patientAge || 'N/A',
        patientPhone: patientPhone || '',
        patientEmail: patientEmail || '',
        date: todayStr,
        time: timeStr,
        timestamp: Date.now(),
        diagnosis: diagnosis || 'Consulta médica',
        contentBody: contentBody || 'Documento emitido en consulta.',
        pdfFileName: pdfFileName,
        doctorName: config.doctorName,
        doctorSpecialty: config.specialty,
        doctorMPPS: config.mpps,
        doctorCI: config.ci,
        institution: config.institution,
      };

      // Save to patient bank & ecosystem immediately
      try {
        const patientEntry: SavedPatientEntry = {
          id: `patient-${Date.now()}`,
          patientName: newRecord.patientName,
          patientCI: newRecord.patientCI,
          patientAge: newRecord.patientAge,
          patientPhone: newRecord.patientPhone,
          patientEmail: newRecord.patientEmail || '',
          date: newRecord.date,
          diagnosis: newRecord.diagnosis,
          rp: newRecord.contentBody,
          sourceModule: mod === 'informes' ? 'informe' : mod === 'reposo' ? 'reposo' : 'recipe',
        };
        const currentBank = Array.isArray(patientBank) ? patientBank : [];
        const updatedBank = [patientEntry, ...currentBank.filter(x => x && (x.patientName !== newRecord.patientName || x.date !== newRecord.date))];
        setPatientBank(updatedBank);
        try {
          localStorage.setItem('digital_medic_patient_bank_v1', JSON.stringify(updatedBank));
        } catch (_) {}
        try {
          syncEcosystemImmediate(updatedBank);
        } catch (_) {}
        fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord)
        }).catch(() => {});
      } catch (e) {
        console.warn('Error saving patient in background:', e);
      }

      setSavedDocumentRecord(newRecord);

      // Force automatic PDF download to local device
      try {
        handleDownloadRealPdf(newRecord);
      } catch (pdfErr) {
        console.warn('Auto download PDF error:', pdfErr);
      }

      // Generate & Upload PDF to cloud to get direct download URL (DocGuía style)
      let publicPdfUrl = '';
      let generatedBlobForMobile: Blob | null = null;
      try {
        const targetElement = document.querySelector<HTMLElement>(
          '#recipe-4en1-print-sheet, .recipe-4en1-container, #dual-recipe-print-container, #recipe-single-print-container, #indications-print-container, .dual-recipe-container, .dual-recipe-sheet, .print-container, .report-sheet-container, .recipe-single-container, .recipe-single-card, .indications-container, .rest-container, .clinical-history-container'
        );
        const blob = await generatePDFBlob(targetElement);
        if (blob) {
          generatedBlobForMobile = blob;
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const base64 = await base64Promise;
          const cleanPatient = (patientName || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
          const cleanDoc = (docType || 'Recipe').replace(/[^a-zA-Z0-9]/g, '_');
          const res = await fetch('/api/pdf/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfBase64: base64, filename: `${cleanDoc}_${cleanPatient}` })
          });
          const data = await res.json();
          if (data.success && data.url) {
            publicPdfUrl = data.url;
            newRecord.pdfUrl = data.url;
            setSavedDocumentRecord({ ...newRecord, pdfUrl: data.url });
          }
        }
      } catch (uploadErr) {
        console.warn('[Cloud PDF Upload error]:', uploadErr);
      }

      // Clean patient phone for WhatsApp
      const rawDigits = (patientPhone || '').replace(/\D/g, '');
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

      let docTypeCategory = 'Récipe';
      if (mod === 'informes') docTypeCategory = 'Informe';
      else if (mod === 'reposo') docTypeCategory = 'Constancia';
      else if (mod === 'indicaciones') docTypeCategory = 'Indicaciones';

      const msg = buildWhatsAppTreatmentMessage({
        doctorName: config.doctorName || 'Dr. Carlos Leal',
        documentType: docTypeCategory,
        patientName: patientName || 'Paciente',
        treatmentDetails: contentBody,
      });

      // Dispositivos con soporte Web Share API de archivos (navigator.share / navigator.canShare): adjuntar el PDF directamente en WhatsApp
      if (generatedBlobForMobile && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          const pdfFile = new File([generatedBlobForMobile], pdfFileName, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
              files: [pdfFile],
              title: docTitle,
              text: msg,
            });
            showToast(`✓ ¡${docTitle} compartido con PDF adjunto en WhatsApp! 🚀`);
            return;
          }
        } catch (shareErr: any) {
          if (shareErr && shareErr.name === 'AbortError') {
            return;
          }
          console.warn('[Share Error, activando Plan de Emergencia]:', shareErr);
        }
      }

      // Copy message to clipboard
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(msg).catch(() => {});
        }
      } catch (_) {}

      // Flujo de salida: Descargar PDF + Alerta de clip + Abrir API de WhatsApp con texto
      showWhatsAppClipAlert('📎 Se ha descargado el archivo PDF oficial en su dispositivo. Por favor, pulse el clip en este chat y adjúntelo para su validez');

      const waUrl = cleanPhone && cleanPhone.length >= 8
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

      const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
      if (isMobile) {
        window.location.href = waUrl;
      } else {
        const link = document.createElement('a');
        link.href = waUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
        }, 150);
      }
    } catch (err) {
      console.error('[Instant WhatsApp Error]:', err);
      setIsSaveSuccessModalOpen(true);
    }
  };

  // Direct print trigger with Patient Name and Date as document.title for PDF filename
  const handleTriggerPrint = () => {
    try {
      const originalTitle = document.title;
      let patientName = '';
      let docType = 'récipe';
      let docDate = todayStr || '14/10/26';

      if (activeModule === 'informes') {
        patientName = currentReport.patientName || 'Carlos leal';
        docDate = currentReport.date || todayStr;
        docType = 'informe';
      } else if (activeModule === 'indicaciones') {
        patientName = indications.patientName || 'Carlos leal';
        docDate = indications.date || todayStr;
        docType = 'indicaciones';
      } else if (activeModule === 'reposo') {
        patientName = restCert.patientName || 'Carlos leal';
        docDate = restCert.date || todayStr;
        docType = 'reposo';
      } else if (activeModule === 'historias') {
        patientName = activeRecord?.patientName || 'Carlos leal';
        docDate = activeRecord?.date || todayStr;
        docType = 'historia';
      } else if (activeModule === 'recipe-4en1') {
        patientName = recipes[0]?.patientName || 'Carlos leal';
        docDate = recipes[0]?.date || todayStr;
        docType = 'récipe';
      } else {
        patientName = recipes[activeRecipeIndex]?.patientName || recipes[0]?.patientName || 'Carlos leal';
        docDate = recipes[activeRecipeIndex]?.date || recipes[0]?.date || todayStr;
        docType = 'récipe';
      }

      const cleanTitle = buildDocumentPdfFilename(docType, patientName, docDate).replace(/\.pdf$/i, '');
      document.title = cleanTitle;

      const restoreTitle = () => {
        document.title = originalTitle;
        window.removeEventListener('afterprint', restoreTitle);
      };
      window.addEventListener('afterprint', restoreTitle);

      window.print();
    } catch (err) {
      console.warn('Direct print blocked or not supported in iframe:', err);
      showToast('⚠️ Use la opción "Descargar PDF" para guardar el documento.');
    }
  };

  // If no doctor session is active, display the full-screen Step-by-Step Onboarding & Registration Wizard in dark executive tone
  if (!activeDoctorSessionId) {
    return (
      <div className={`min-h-screen bg-[#060c18] font-sans text-slate-100 flex flex-col justify-between ${isDesktopMode ? 'desktop-simulation-mode' : ''}`}>
        {/* Animated Top Ribbon Marquee across the initial screen */}
        <CintilloTopRibbon />

        <DoctorOnboardingWizard
          registeredDoctors={colleagueProfiles}
          onCompleteOnboarding={handleRegisterNewDoctor}
          onLoginDoctor={handleLoginDoctor}
          onOpenAdminPanel={() => setIsSecretAdminPromptOpen(true)}
          isDesktopMode={isDesktopMode}
          onToggleDesktopMode={toggleDesktopMode}
        />

        {toastConfig && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl border flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200 max-w-md ${
              toastConfig.isError
                ? 'bg-red-950 text-red-100 border-red-600 shadow-red-900/60'
                : 'bg-emerald-950 text-emerald-100 border-emerald-500 shadow-emerald-900/60'
            }`}
          >
            {toastConfig.isError ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{toastConfig.message}</span>
          </div>
        )}

        {/* Secret Master Key Prompt for Hidden Admin Access */}
        <SecretAdminPromptModal
          isOpen={isSecretAdminPromptOpen}
          onClose={() => setIsSecretAdminPromptOpen(false)}
          onSuccess={() => {
            setIsSecretAdminPromptOpen(false);
            setIsAdminPanelOpen(true);
          }}
        />

        {/* Confidential Central Admin Panel */}
        <AdminPanelModal
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          registeredDoctors={colleagueProfiles}
          onRefreshFromCloud={async () => {
            const cloud = await fetchDoctorsFromCloud();
            if (cloud && cloud.length > 0) {
              setColleagueProfiles(cloud);
              showToast('✓ Lista de médicos sincronizada desde la nube');
            }
          }}
          onDeleteDoctor={async (docId) => {
            let nextList: DoctorConfig[] = [];
            setColleagueProfiles((prev) => {
              nextList = prev.filter((p) => p.id !== docId);
              localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(nextList));
              return nextList;
            });
            await deleteDoctorFromCloud(docId);
            const activeSession = getStoredDoctorSessionId() || 'carloseduardoleal29@gmail.com';
            if (isUserLoaded(activeSession)) {
              await saveEcosystemToCloud({
                identifier: activeSession,
                colleagueProfiles: nextList,
              });
            }
            showToast('✓ Médico eliminado con éxito');
          }}
          onResetAllData={async () => {
            setColleagueProfiles([DEFAULT_DOCTOR_CONFIG]);
            localStorage.removeItem('digital_medic_colleagues_v2');
            localStorage.removeItem('digital_medic_active_doctor_session');
            await resetAllDoctorsInCloud();
            showToast('✓ Base de datos reiniciada limpia');
          }}
          onUpdateDoctor={handleUpdateDoctor}
          onLoginAsDoctor={handleLoginAsDoctor}
          onAddNewDoctor={async (newDoctor) => {
            let nextList: DoctorConfig[] = [];
            setColleagueProfiles((prev) => {
              const filtered = prev.filter(p => p.id !== newDoctor.id && p.ci !== newDoctor.ci);
              nextList = [newDoctor, ...filtered];
              localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(nextList));
              return nextList;
            });
            await saveSingleDoctorToCloud(newDoctor);
            const activeSession = getStoredDoctorSessionId() || 'carloseduardoleal29@gmail.com';
            if (isUserLoaded(activeSession)) {
              await saveEcosystemToCloud({
                identifier: activeSession,
                colleagueProfiles: nextList,
              });
            }
            showToast(`✓ Dr(a). ${newDoctor.doctorName} dado de alta y guardado en la nube`);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isPreviewMode ? 'bg-slate-200/60' : 'bg-slate-100 text-slate-900'} ${isDesktopMode ? 'desktop-simulation-mode' : ''}`}>
      
      {/* 1. Animated Top Banner (User prototype feature) */}
      {!isPreviewMode && <CintilloTopRibbon />}

      {/* Docked Left Edge Button to Toggle Doctor & Clinic Drawer ("Ala Izquierda") */}
      {!isPreviewMode && (
        <button
          onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-2 rounded-r-2xl shadow-2xl flex flex-col items-center gap-1.5 border-r-2 border-t-2 border-b-2 border-blue-400/50 text-[10px] font-black transition-all group no-print cursor-pointer hover:pl-3"
          title="Tocar para mostrar u ocultar panel con nombre del médico y datos de la clínica"
          aria-label="Abrir panel del médico y clínica"
        >
          <UserCheck className="w-4 h-4 text-teal-300 group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-lr] tracking-widest uppercase font-black text-[9px] text-teal-200">
            Médico & Clínica
          </span>
        </button>
      )}

      {/* Floating Exit Preview Bar (when in preview mode) */}
      {isPreviewMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900/90 text-white p-2 rounded-xl shadow-2xl backdrop-blur-xs no-print">
          <span className="text-xs font-semibold px-2">Modo Vista Previa Real</span>
          <button
            onClick={() => handleDownloadRealPdf()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Descargar y guardar PDF oficial"
          >
            <Download className="w-3.5 h-3.5" /> Descargar PDF
          </button>
          <button
            onClick={() => setIsPreviewMode(false)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" /> Salir de Vista Previa
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastConfig && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl border flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200 no-print max-w-md ${
            toastConfig.isError
              ? 'bg-red-950 text-red-100 border-red-600 shadow-red-900/60'
              : 'bg-emerald-950 text-emerald-100 border-emerald-500 shadow-emerald-900/60'
          }`}
        >
          {toastConfig.isError ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toastConfig.message}</span>
        </div>
      )}

      {/* Pending Payment Verification Notice Screen */}
      {activeDoctorSessionId && config.paymentStatus === 'pendiente' && !config.isPaidClient ? (
        <PendingPaymentNotice
          doctor={config}
          onLogout={handleLogout}
          onRefreshStatus={async () => {
            const cloud = await fetchDoctorsFromCloud();
            if (cloud && cloud.length > 0) {
              setColleagueProfiles(cloud);
              const found = cloud.find(c => c.id === config.id || c.ci === config.ci);
              if (found) {
                updateCurrentConfig(found);
                showToast('✓ Estado actualizado');
              }
            }
          }}
          onActivateTrialTemp={() => {
            const trialConf = createTrialConfig(14);
            updateCurrentConfig(trialConf);
            showToast('✓ Acceso temporal de 14 días activado');
          }}
        />
      ) : (
        <>
      {/* 2. Top Navigation Bar */}
      {!isPreviewMode && (
        <>
          {/* Top Bar Navigation Header (Light, clean, 100% responsive) */}
          <header className="bg-white border-b border-slate-200 text-slate-900 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 shadow-xs shrink-0 no-print">
            
            {/* Left: Drawer Menu Button & App Brand Identity */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setIsLeftDrawerOpen(true)}
                className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-xl transition-all cursor-pointer border border-slate-200"
                title="Abrir menú lateral y datos del médico"
                aria-label="Abrir menú lateral"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div 
                className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none" 
                onClick={() => handleNavigate('inicio')}
                title="Digital Médic - Ir al Inicio"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-0.5 shadow-sm border border-blue-200 flex items-center justify-center shrink-0">
                  <img 
                    src={DIGITAL_MEDIC_OFFICIAL_LOGO_SVG} 
                    alt="Digital Médic Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="font-black text-slate-900 text-base sm:text-lg leading-tight tracking-tight">
                    Digital Médic
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-blue-700 font-bold">
                    Formatos Médicos Digitales
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Ir al Inicio + Instalar Aplicación + Cerrar Sesión */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

              {/* Botón de Instalación como App nativa PWA */}
              <PWAInstallButton variant="header" />

              {activeModule !== 'inicio' && (
                <button
                  onClick={() => handleNavigate('inicio')}
                  className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
                  title="Volver a la pantalla de Inicio"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-white" />
                  <span className="font-bold hidden xs:inline">Inicio</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all cursor-pointer border border-rose-500 shrink-0"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <span className="font-black whitespace-nowrap hidden xs:inline">Cerrar Sesión</span>
                <span className="font-black whitespace-nowrap xs:hidden">Salir</span>
              </button>
            </div>

          </header>

          {/* Clean Subbar: Doctor & Clinic Summary + Vista de Escritorio / Móvil Toggle */}
          <div className="bg-slate-900 text-white border-b border-slate-800 px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 text-xs no-print flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-bold text-white text-xs truncate">
                🩺 {config.doctorName || 'Dr(a). Médico'}
              </span>
              <span className="text-cyan-300 font-semibold text-[11px] truncate hidden sm:inline">
                · {config.specialty || 'Especialista'}
              </span>
              {config.paymentStatus === 'prueba' && (
                <span className="ml-2 px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px] uppercase animate-pulse shrink-0">
                  ⏳ Prueba: {getDoctorTrialStatus(config).daysLeft} días restantes
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-mono text-slate-300 shrink-0">
              <span>MPPS: <strong className="text-teal-300">{config.mpps || '00.000'}</strong></span>
              <span>·</span>
              <span>CI: <strong className="text-teal-300">{config.ci || 'V-00.000.000'}</strong></span>
            </div>
          </div>
        </>
      )}

      {/* Main Container Layout */}
      <div className="flex-1 flex min-w-0 w-full overflow-x-auto">
        
        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto w-full max-w-full px-2 sm:px-4 py-3 md:py-6 flex flex-col items-center ${
          isPreviewMode 
            ? 'p-0 md:p-2 bg-white' 
            : 'bg-slate-100'
        }`}>

          {/* Submodule Return Bar / Breadcrumb & Module Navigation (Visible in all submodules) */}
          {activeModule !== 'inicio' && !isPreviewMode && (
            <div className="w-full max-w-[880px] mb-3 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm space-y-2 no-print animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Top Row: Navigation Breadcrumb & Clear Button */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavigate('inicio')}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer border border-blue-400/30 shrink-0"
                    title="Regresar a la pantalla principal de módulos"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Volver al Inicio</span>
                  </button>

                  <div className="hidden sm:flex items-center gap-1 text-slate-500 font-bold text-xs">
                    <button 
                      onClick={() => handleNavigate('inicio')}
                      className="hover:text-blue-600 transition-colors flex items-center gap-1 text-slate-600 cursor-pointer"
                    >
                      <Home className="w-3.5 h-3.5 text-blue-500" />
                      <span>Inicio</span>
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-900 font-extrabold flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200/80">
                      {activeModule === 'recipe-4en1' && '💊 Récipes Médicos'}
                      {activeModule === 'recipe-master' && '📄 Récipe Individual'}
                      {activeModule === 'informes' && '📋 Informe Médico'}
                      {activeModule === 'reposo' && '⏱️ Constancia / Reposo'}
                      {activeModule === 'historias' && '📁 Historia Clínica'}
                      {activeModule === 'indicaciones' && '🕐 Indicaciones'}
                      {activeModule === 'diseno' && '🎨 Estudio de Diseño'}
                      {activeModule === 'suscripcion' && '💳 Suscripción'}
                    </span>
                  </div>
                </div>

                {/* Right: Dejar en Blanco */}
                {activeModule !== 'diseno' && activeModule !== 'suscripcion' && (
                  <button
                    type="button"
                    onClick={handleClearActiveModuleToBlank}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer border border-rose-500 shrink-0"
                    title="Dejar en blanco este formato para un nuevo paciente"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                    <span>Dejar en Blanco</span>
                  </button>
                )}
              </div>

              {/* Bottom Row: Proportional, Legible & Touch-Friendly Direct Module Tabs - MUCH LARGER & LLAMATIVOS */}
              {/* Bottom Row: 2-Row Grid of Rounded, Strikingly Colorful & Eyecatching Module Buttons */}
              <div className="bg-slate-200/80 p-2.5 sm:p-3 rounded-3xl border border-slate-300/80 shadow-inner space-y-2">
                {/* Row 1: Récipes, Indicaciones, Informe Médico */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  <button
                    onClick={() => handleNavigate('recipe-master')}
                    className={`rounded-full px-3 py-2.5 sm:px-4 sm:py-3 font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap shadow-sm hover:scale-[1.02] active:scale-95 ${
                      activeModule === 'recipe-master' || activeModule === 'recipe' || activeModule === 'recipe-4en1'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-300 font-extrabold'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border border-blue-400/50'
                    }`}
                    title="Ir a Récipes Médicos"
                  >
                    <span className="text-sm sm:text-base">💊</span>
                    <span>Récipes</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('indicaciones')}
                    className={`rounded-full px-3 py-2.5 sm:px-4 sm:py-3 font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap shadow-sm hover:scale-[1.02] active:scale-95 ${
                      activeModule === 'indicaciones'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-300 font-extrabold'
                        : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 border border-indigo-400/50'
                    }`}
                    title="Ir a Hoja de Indicaciones"
                  >
                    <span className="text-sm sm:text-base">🕐</span>
                    <span>Indicaciones</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('informes')}
                    className={`rounded-full px-3 py-2.5 sm:px-4 sm:py-3 font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap shadow-sm hover:scale-[1.02] active:scale-95 ${
                      activeModule === 'informes'
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/30 ring-2 ring-teal-300 font-extrabold'
                        : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 border border-teal-400/50'
                    }`}
                    title="Ir a Informe Médico"
                  >
                    <span className="text-sm sm:text-base">📋</span>
                    <span>Informes</span>
                  </button>
                </div>

                {/* Row 2: Reposo Médico, Historias, Estudio de Diseño */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  <button
                    onClick={() => handleNavigate('reposo')}
                    className={`rounded-full px-3 py-2.5 sm:px-4 sm:py-3 font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap shadow-sm hover:scale-[1.02] active:scale-95 ${
                      activeModule === 'reposo'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-300 font-extrabold'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 border border-amber-400/50'
                    }`}
                    title="Ir a Constancia / Reposo Médico"
                  >
                    <span className="text-sm sm:text-base">⏱️</span>
                    <span>Reposo</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('historias')}
                    className={`rounded-full px-3 py-2.5 sm:px-4 sm:py-3 font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap shadow-sm hover:scale-[1.02] active:scale-95 ${
                      activeModule === 'historias'
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/30 ring-2 ring-purple-300 font-extrabold'
                        : 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:from-purple-600 hover:to-fuchsia-600 border border-purple-400/50'
                    }`}
                    title="Ir a Historias Clínicas"
                  >
                    <span className="text-sm sm:text-base">📁</span>
                    <span>Historias</span>
                  </button>

                  {isAuthorizedForDesigner ? (
                    <button
                      onClick={() => handleNavigate('diseno')}
                      className={`rounded-full px-3 py-2.5 sm:px-4 sm:py-3 font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap shadow-sm hover:scale-[1.02] active:scale-95 ${
                        activeModule === 'diseno'
                          ? 'bg-gradient-to-r from-rose-500 via-purple-600 to-amber-500 text-white shadow-md ring-2 ring-amber-300 font-extrabold'
                          : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 border border-rose-400/50'
                      }`}
                      title="Estudio de Diseño PRO (Exclusivo Administrador y VIP)"
                    >
                      <Palette className="w-4 h-4 text-amber-200" />
                      <span>Diseño {config.isAdmin ? '(ADMIN)' : '(VIP)'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigate('suscripcion')}
                      className="rounded-full px-3 py-2.5 sm:px-4 sm:py-3 font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap shadow-sm hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 border border-slate-600"
                      title="Suscripción / Plan de Membresía"
                    >
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Suscripción</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}
          
          {/* Drug Bank Bar (Shown for recipes, indications and design preview) */}
          {(activeModule === 'recipe-4en1' || activeModule === 'recipe-master' || activeModule === 'indicaciones') && !isPreviewMode && (
            <div className={`w-full ${activeModule === 'indicaciones' ? 'max-w-[800px]' : 'max-w-[880px]'}`}>
              <DrugBankFloatingBar
                onAddDrugToRecipe={
                  activeModule === 'indicaciones'
                    ? (text) => handleAddDrugToIndications(text)
                    : handleAddDrugToRecipe
                }
                recipesCount={activeModule === 'recipe-4en1' ? 4 : 1}
                activeRecipeIndex={activeRecipeIndex}
                isIndicationsMode={activeModule === 'indicaciones'}
              />
            </div>
          )}

          {/* Module 0: Ventana de Inicio y Consultorio Digital */}
          {activeModule === 'inicio' && (
            <div className="w-full">
              <WelcomeInicioModule
                config={config}
                onNavigate={handleNavigate}
                onOpenPreview={() => setIsWelcomeBlankRecipeOpen(true)}
                onOpenFormatPreview={handleOpenFormatPreview}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onOpenVaultModal={() => setIsVaultModalOpen(true)}
                onResetAllData={handleResetAllData}
                onSaveAll={handleSaveAll}
                onUpdateConfig={updateCurrentConfig}
                onLogout={handleLogout}
                onOpenPinModal={() => setIsPinModalOpen(true)}
                onOpenLeftDrawer={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
                onOpenPatientBank={() => setIsPatientBankOpen(true)}
                onOpenSyncDevices={() => setIsSyncDevicesOpen(true)}
                onSaveNewPatientAndSyncAll={handleSaveNewPatientAndSyncAll}
                onLoadPatientToAllFormats={handleLoadPatientToAllFormats}
                patientCount={availableSessionPatients.length}
                existingPatients={availableSessionPatients}
                activePatientName={recipes[0]?.patientName}
                activePatientCI={recipes[0]?.patientCI}
                activePatientAge={recipes[0]?.patientAge}
                activePatientPhone={recipes[0]?.patientPhone}
                activePatientEmail={recipes[0]?.patientEmail}
                activePatientAddress={(recipes[0] as any)?.patientAddress}
                onClearActivePatient={handleResetPatientDataAcrossAllFormats}
                onUnlockDesignerDirectly={() => {
                  setIsDesignerUnlocked(true);
                  sessionStorage.setItem('digital_medic_unlocked_2534', 'true');
                }}
              />
            </div>
          )}

          {/* Module 1: Estudio de Diseño (Protected by 2534 & VIP Plan) */}
          {activeModule === 'diseno' && !isAuthorizedForDesigner && (
            <div className="w-full max-w-xl mx-auto my-8 p-6 sm:p-8 bg-slate-900 border border-slate-700/80 rounded-3xl text-center space-y-4 shadow-2xl text-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md">
                <Crown className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Estudio de Diseño Exclusivo para Médicos VIP</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Su consultorio cuenta con membrete y sello médico reglamentario activo. El <strong>Estudio de Diseño Personalizado</strong> (dobles logos, marcas de agua, tintas y tipografías exclusivas) está reservado para el <strong>Plan VIP</strong> o para médicos autorizados directamente por el Administrador.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setActiveModule('suscripcion')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:scale-105"
                >
                  <span>⭐ Mejorar a Plan VIP</span>
                </button>
                <button
                  onClick={() => setActiveModule('recipe-master')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <span>Volver a Récipes</span>
                </button>
              </div>
            </div>
          )}

          {activeModule === 'diseno' && isAuthorizedForDesigner && (
            <div className="w-full max-w-[1240px] flex flex-col lg:flex-row items-start justify-center gap-6">
              
              {/* Document Live Preview based on user selection in Studio */}
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                {/* Header Switcher Bar above preview */}
                <div className="w-full max-w-[800px] mb-3 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs no-print">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Diseñando en Vivo:</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDesignerPreviewDoc('recipe')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        designerPreviewDoc === 'recipe'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      📄 Récipe
                    </button>
                    <button
                      onClick={() => setDesignerPreviewDoc('indicaciones')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        designerPreviewDoc === 'indicaciones'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      📋 Indicaciones
                    </button>
                    <button
                      onClick={() => setDesignerPreviewDoc('reposo')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        designerPreviewDoc === 'reposo'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      🛏️ Reposo
                    </button>
                    <button
                      onClick={() => setDesignerPreviewDoc('informes')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        designerPreviewDoc === 'informes'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      📑 Informe
                    </button>
                  </div>
                </div>

                {designerPreviewDoc === 'recipe' && (
                  <MasterRecipeView
                    config={config}
                    recipe={recipes[0]}
                    onChangeRecipe={(upd) => handleUpdateRecipe(0, upd)}
                    onUpdateConfig={updateCurrentConfig}
                    isLiveEditing={true}
                    onPrint={handleTriggerPrint}
                    onSavePatientOnly={() => handleSavePatientOnly('recipe-master')}
                    onSaveAndShare={() => handleSavePatientOnly('recipe-master')}
                    onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
                    onClearRecipeToBlank={() => handleClearRecipeToBlank(0)}
                    onNavigateToIndications={() => handleNavigate('indicaciones')}
                  />
                )}


                {designerPreviewDoc === 'indicaciones' && (
                  <IndicationsModule
                    config={config}
                    indications={indications}
                    onChangeIndications={(upd) => setIndications((prev) => ({ ...prev, ...upd }))}
                    onPrint={handleTriggerPrint}
                    onSaveAndShare={() => handleSavePatientOnly('indicaciones')}
                    onUpdateConfig={updateCurrentConfig}
                    recipes={recipes}
                    activeRecipeIndex={activeRecipeIndex}
                  />
                )}

                {designerPreviewDoc === 'reposo' && (
                  <MedicalRestModule
                    config={config}
                    certificate={restCert}
                    onChangeCertificate={(upd) => setRestCert((prev) => ({ ...prev, ...upd }))}
                    onPrint={handleTriggerPrint}
                    onSaveAndShare={() => handleSavePatientOnly('reposo')}
                    onUpdateConfig={updateCurrentConfig}
                  />
                )}

                {designerPreviewDoc === 'informes' && (
                  <ReportsModule
                    config={config}
                    currentReport={currentReport}
                    onChangeReport={(upd) => setCurrentReport((prev) => ({ ...prev, ...upd }))}
                    onPrint={handleTriggerPrint}
                    onSaveAndShare={() => handleSavePatientOnly('informes')}
                    onUpdateConfig={updateCurrentConfig}
                  />
                )}
              </div>

              {/* Live Designer Floating Panel */}
              {!isPreviewMode && (
                <div className="w-full lg:w-[440px] shrink-0 no-print">
                  <LiveDesignerPanel
                    config={config}
                    colleagueProfiles={colleagueProfiles}
                    onSelectColleague={handleSelectColleague}
                    onAddNewColleague={handleAddNewColleague}
                    onDuplicateColleague={handleDuplicateColleague}
                    onUpdateConfig={updateCurrentConfig}
                    onSaveConfig={handleSaveAll}
                    onResetDefaults={handleResetDefaults}
                    onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
                    onLockDesigner={handleLockDesigner}
                    onPassToDoctor={handlePassToDoctor}
                    onImportConfig={handleImportConfig}
                    activePreviewDoc={designerPreviewDoc}
                    onSelectPreviewDoc={setDesignerPreviewDoc}
                  />
                </div>
              )}
            </div>
          )}

          {/* Module 2: Asistente Guiado de Récipes Médicos Oficiales */}
          {(activeModule === 'recipe-master' || activeModule === 'recipe' || activeModule === 'recipe-4en1' || (activeModule as any) === 'recipes') && (
            <ProgressiveRecipeWizard
              config={config}
              recipe={recipes[activeRecipeIndex] || recipes[0]}
              onChangeRecipe={(upd) => handleUpdateRecipe(activeRecipeIndex, upd)}
              indications={indications}
              onChangeIndications={(upd) => {
                setIndications(prev => ({ ...prev, ...upd }));
                try {
                  localStorage.setItem('digital_medic_indications_v2', JSON.stringify({ ...indications, ...upd }));
                } catch (_) {}
              }}
              onUpdateConfig={updateCurrentConfig}
              onPrint={handleTriggerPrint}
              onDownloadPdf={() => handleDownloadRealPdf(null)}
              onOpenEmailModal={() => handleOpenEmailDirectly('recipe-master')}
              onSavePatientOnly={() => handleSavePatientOnly('recipe-master')}
              onOpenPatientBank={() => setIsPatientBankOpen(true)}
              onOpenPreviewModal={() => {
                setPreviewInitialModule('recipe-master');
                setIsUniversalPreviewOpen(true);
              }}
              onClearRecipeToBlank={() => handleClearRecipeToBlank(activeRecipeIndex)}
              onBackToHome={() => handleNavigate('inicio')}
              existingPatients={patientBank}
              onSelectExistingPatient={(p) => {
                handleUpdateRecipe(activeRecipeIndex, {
                  patientName: p.patientName,
                  patientCI: p.patientCI,
                  patientAge: p.patientAge,
                  patientPhone: p.patientPhone || '',
                  patientEmail: p.patientEmail || '',
                  diagnosis: p.diagnosis || '',
                  rp: p.rp || '',
                  indicationsNotes: p.indicationsNotes || '',
                });
                setIndications(prev => ({
                  ...prev,
                  patientName: p.patientName,
                  patientCI: p.patientCI,
                  patientAge: p.patientAge,
                  patientPhone: p.patientPhone || '',
                  diagnosis: p.diagnosis || prev.diagnosis,
                }));
              }}
            />
          )}

          {/* Module 4: Historias Clínicas */}
          {activeModule === 'historias' && (
            <ClinicalHistoryModule
              config={config}
              records={records}
              activeRecord={activeRecord}
              onSelectRecord={setActiveRecord}
              onUpdateRecord={(upd) => {
                const next = { ...activeRecord, ...upd, updatedAt: Date.now() };
                setActiveRecord(next);
                setRecords((prev) => prev.map((r) => (r.id === next.id ? next : r)));
              }}
              onSaveRecord={(rec) => {
                setRecords((prev) => prev.map((r) => (r.id === rec.id ? rec : r)));
                showToast('Historia clínica guardada');
              }}
              onDeleteRecord={(id) => {
                const remaining = records.filter((r) => r.id !== id);
                setRecords(remaining);
                if (remaining.length > 0) setActiveRecord(remaining[0]);
                showToast('Historia clínica eliminada');
              }}
              onNewRecord={handleNewRecord}
              onTransferToRecipe={handleTransferPatientToRecipe}
              onPrint={handleTriggerPrint}
              onSaveAndShare={() => handleSavePatientOnly('historias')}
              onBackToHome={() => handleNavigate('inicio')}
            />
          )}

          {/* Module 5: Informes Médicos */}
          {activeModule === 'informes' && (
            <ReportsModule
              config={config}
              currentReport={currentReport}
              onChangeReport={(upd) => {
                hasUserEditedStateRef.current = true;
                const mappedUpd: any = { ...upd };
                if (upd.diagnosticImpression !== undefined) mappedUpd.diagnosis = upd.diagnosticImpression;
                setCurrentReport((prev) => ({ ...prev, ...upd }));
                handleSyncPatientFields(mappedUpd);
              }}
              onPrint={handleTriggerPrint}
              onDownloadPdf={() => handleDownloadRealPdf(null)}
              onOpenEmailModal={() => handleOpenEmailDirectly('informes')}
              onSaveAndShare={() => handleSavePatientOnly('informes')}
              onOpenPreview={() => {
                setPreviewInitialModule('informes');
                setIsUniversalPreviewOpen(true);
              }}
              onUpdateConfig={updateCurrentConfig}
              onBackToHome={() => handleNavigate('inicio')}
            />
          )}

          {/* Module 6: Hoja de Indicaciones */}
          {activeModule === 'indicaciones' && (
            <IndicationsModule
              config={config}
              indications={indications}
              onChangeIndications={(upd) => {
                hasUserEditedStateRef.current = true;
                setIndications((prev) => ({ ...prev, ...upd }));
                handleSyncPatientFields(upd);
              }}
              onPrint={handleTriggerPrint}
              onDownloadPdf={() => handleDownloadRealPdf(null)}
              onOpenEmailModal={() => handleOpenEmailDirectly('indicaciones')}
              onSaveAndShare={() => handleSavePatientOnly('indicaciones')}
              onOpenPreview={() => {
                setPreviewInitialModule('indicaciones');
                setIsUniversalPreviewOpen(true);
              }}
              onUpdateConfig={updateCurrentConfig}
              onBackToHome={() => handleNavigate('inicio')}
              onSwitchToRecipe={() => setActiveModule('recipe-master')}
              recipes={recipes}
              activeRecipeIndex={activeRecipeIndex}
            />
          )}

          {/* Module 7: Reposo Médico */}
          {activeModule === 'reposo' && (
            <MedicalRestModule
              config={config}
              certificate={restCert}
              onChangeCertificate={(upd) => {
                hasUserEditedStateRef.current = true;
                setRestCert((prev) => ({ ...prev, ...upd }));
                handleSyncPatientFields(upd);
              }}
              onPrint={handleTriggerPrint}
              onDownloadPdf={() => handleDownloadRealPdf(null)}
              onOpenEmailModal={() => handleOpenEmailDirectly('reposo')}
              onSaveAndShare={() => handleSavePatientOnly('reposo')}
              onOpenPreview={() => {
                setPreviewInitialModule('reposo');
                setIsUniversalPreviewOpen(true);
              }}
              onUpdateConfig={updateCurrentConfig}
              onBackToHome={() => handleNavigate('inicio')}
            />
          )}

          {/* Module 8: Suscripciones, Licencias y Métodos de Cobro (Binance, Zinli, Pago Móvil) */}
          {activeModule === 'suscripcion' && (
            <SubscriptionBillingPanel
              currentDoctor={config}
            />
          )}

        </main>
      </div>

      {/* MODERN CREATOR FOOTER BAR */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0 no-print z-30">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>Plataforma: <strong className="text-white font-bold">DIGITAL MEDIC</strong></span>
          </div>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="text-slate-400">Software Médico Digital Profesional</span>
        </div>

        <div 
          onClick={handleSecretAdminClick}
          className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-end cursor-pointer select-none group"
        >
          {/* C.E. LEAL Studio Developer Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-cyan-500/60 transition-all shadow-sm">
            <div className="w-5 h-5 rounded-md bg-slate-950 p-0.5 border border-cyan-400/60 flex items-center justify-center shrink-0 overflow-hidden">
              <img 
                src={CARLOS_LEAL_DEVELOPER_BADGE_SVG} 
                alt="C.E. LEAL Studio Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-[11px] font-bold text-slate-300 group-hover:text-cyan-300 transition-colors flex items-center gap-1">
              <span>Carlos Leal</span>
              <span className="text-amber-400 font-black text-[10px] bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                Desarrollador
              </span>
            </div>
          </div>

          <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
            C.E. LEAL Studio © 2026
          </span>
        </div>
      </footer>
      </>
      )}

      {/* Signature & Stamp Modal */}
      <SignatureCanvasModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSaveSignature={(dataUrl, target = 'firma') => {
          if (target === 'firma') {
            updateCurrentConfig({ firmaImg: dataUrl });
            showToast('✓ Firma real del médico actualizada exitosamente');
          } else if (target === 'sello') {
            updateCurrentConfig({ selloImg: dataUrl });
            showToast('✓ Sello oficial actualizado exitosamente');
          } else {
            updateCurrentConfig({ selloFirma: dataUrl });
            showToast('✓ Firma y sello actualizados exitosamente');
          }
        }}
        doctorName={config.doctorName}
        mpps={config.mpps}
        ci={config.ci}
        specialty={config.specialty}
        collegeNumber={config.collegeNumber}
      />

      {/* Master PIN Modal for "Estudio de Diseño" (Passcode 2534) */}
      <MasterPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
      />

      {/* Doctor Left Drawer Panel ("Ala Izquierda" - Doctor and Clinic Information) */}
      <DoctorLeftDrawer
        isOpen={isLeftDrawerOpen}
        onClose={() => setIsLeftDrawerOpen(false)}
        config={config}
        onUpdateConfig={updateCurrentConfig}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onOpenPatientBank={() => setIsPatientBankOpen(true)}
        onOpenPlans={() => setActiveModule('suscripcion')}
        onOpenDesignStudio={() => handleNavigate('diseno')}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenEditPaymentConfig={() => setIsEditPaymentConfigModalOpen(true)}
        onOpenSyncDevices={() => setIsSyncDevicesOpen(true)}
        isDesktopMode={isDesktopMode}
        onToggleDesktopMode={toggleDesktopMode}
      />

      {/* Modal para Editar Datos de Cobro Oficiales */}
      <EditPaymentConfigModal
        isOpen={isEditPaymentConfigModalOpen}
        onClose={() => setIsEditPaymentConfigModalOpen(false)}
        onSaved={(_updatedPaymentConfig) => {
          syncEcosystemImmediate();
          showToast('✓ ¡Datos de cobro guardados permanentemente en la nube!');
        }}
      />

      {/* Patient Bank Modal (Pacientes y Récipes grabados en la sesión) */}
      <PatientBankModal
        isOpen={isPatientBankOpen}
        onClose={() => setIsPatientBankOpen(false)}
        config={config}
        recipes={recipes}
        records={records}
        currentReport={currentReport}
        restCert={restCert}
        sessionPatients={patientBank}
        setSessionPatients={setPatientBank}
        onTriggerPrintPdf={handleTriggerPrint}
        onLoadRecipeToDoctor={(patient: SavedPatientEntry) => {
          setRecipes((prev) => {
            const next = [...prev];
            next[activeRecipeIndex] = {
              ...next[activeRecipeIndex],
              patientName: patient.patientName,
              patientCI: patient.patientCI,
              patientAge: patient.patientAge,
              patientPhone: patient.patientPhone,
              date: patient.date,
              diagnosis: patient.diagnosis,
              rp: patient.rp,
              indicationsNotes: patient.indicationsNotes || next[activeRecipeIndex].indicationsNotes
            };
            return next;
          });
          setActiveModule('recipe-4en1');
          showToast(`✓ Datos de ${patient.patientName} cargados en el Récipe`);
        }}
        onLoadRecordToDoctor={(recordId: string) => {
          const found = records.find((r) => r.id === recordId);
          if (found) {
            setActiveRecord(found);
            setActiveModule('historias');
            showToast(`✓ Historia de ${found.patientName} cargada`);
          }
        }}
        onAddNewPatientToSession={(newP: SavedPatientEntry) => {
          setRecipes((prev) => {
            const next = [...prev];
            next[0] = {
              ...next[0],
              patientName: newP.patientName,
              patientCI: newP.patientCI,
              patientAge: newP.patientAge,
              patientPhone: newP.patientPhone,
              date: newP.date,
              diagnosis: newP.diagnosis,
              rp: newP.rp
            };
            return next;
          });
          showToast(`✓ Paciente ${newP.patientName} registrado en la sesión`);
        }}
        onDeletePatient={(deletedPatient: SavedPatientEntry) => {
          const cleanName = deletedPatient.patientName.toLowerCase().trim();

          // If this patient is loaded in clinical records, remove or clear
          setRecords((prev) => {
            const next = prev.filter(
              (r) =>
                r.id !== deletedPatient.id &&
                r.patientName.toLowerCase().trim() !== cleanName
            );
            localStorage.setItem('digital_medic_records_v2', JSON.stringify(next));
            return next;
          });

          // If active recipes have this patient, clear their data
          setRecipes((prev) => {
            const next = prev.map((r) => {
              if (r.patientName.toLowerCase().trim() === cleanName) {
                return {
                  ...r,
                  patientName: '',
                  patientAge: '',
                  patientCI: '',
                  patientPhone: '',
                  patientEmail: '',
                  diagnosis: '',
                  rp: '',
                  indicationsNotes: '',
                };
              }
              return r;
            });
            localStorage.setItem('digital_medic_recipes_v2', JSON.stringify(next));
            return next;
          });

          // If current report has this patient, clear it
          setCurrentReport((prev) => {
            if (prev.patientName.toLowerCase().trim() === cleanName) {
              const updated: MedicalReport = {
                ...prev,
                patientName: '',
                patientAge: '',
                patientCI: '',
                patientPhone: '',
                clinicalSummary: '',
                procedures: '',
                paraclinicalStudies: '',
                diagnosticImpression: '',
                treatmentPlan: '',
                recommendations: '',
              };
              localStorage.setItem('digital_medic_report_v2', JSON.stringify(updated));
              return updated;
            }
            return prev;
          });

          // If rest cert has this patient, clear it
          setRestCert((prev) => {
            if (prev.patientName.toLowerCase().trim() === cleanName) {
              const updated: MedicalRestCert = {
                ...prev,
                patientName: '',
                patientCI: '',
                patientPhone: '',
                patientAge: '',
                diagnosis: '',
                observations: '',
              };
              localStorage.setItem('digital_medic_rest_v2', JSON.stringify(updated));
              return updated;
            }
            return prev;
          });

          // Update and sync patient bank in cloud
          const updatedBank = patientBank.filter(
            p => p.id !== deletedPatient.id && p.patientName.toLowerCase().trim() !== cleanName
          );
          setPatientBank(updatedBank);
          try {
            localStorage.setItem('digital_medic_patient_bank_v1', JSON.stringify(updatedBank));
          } catch (_) {}
          syncEcosystemImmediate(updatedBank);

          showToast(`✓ Paciente "${deletedPatient.patientName}" eliminado del banco.`);
        }}
      />

      {/* Save Document & Share Success Action Modal */}
      <SaveAndShareSuccessModal
        isOpen={isSaveSuccessModalOpen}
        onClose={() => setIsSaveSuccessModalOpen(false)}
        config={config}
        record={savedDocumentRecord}
        onDownloadPdf={() => handleDownloadRealPdf()}
        onPrint={handleTriggerPrint}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onOpenPatientBank={() => setIsPatientBankOpen(true)}
        onUpdatePatientPhone={(phone) => {
          if (activeModule === 'recipe-4en1' || activeModule === 'recipe-master') {
            handleUpdateRecipe(activeRecipeIndex, { patientPhone: phone });
          } else if (activeModule === 'informes') {
            setCurrentReport((prev) => ({ ...prev, patientPhone: phone }));
          } else if (activeModule === 'indicaciones') {
            setIndications((prev) => ({ ...prev, patientPhone: phone }));
          } else if (activeModule === 'reposo') {
            setRestCert((prev) => ({ ...prev, patientPhone: phone }));
          }
        }}
      />

      {/* Email Share Modal */}
      <EmailShareModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        config={config}
        documentType={
          savedDocumentRecord?.documentType === 'informe'
            ? 'report'
            : savedDocumentRecord?.documentType === 'indicaciones'
            ? 'indications'
            : savedDocumentRecord?.documentType === 'reposo'
            ? 'rest'
            : savedDocumentRecord?.documentType === 'recipe-4en1'
            ? 'recipe-4en1'
            : 'recipe'
        }
        patientName={savedDocumentRecord?.patientName || 'Paciente'}
        patientEmail={savedDocumentRecord?.patientEmail || ''}
        documentTitle={savedDocumentRecord?.documentTitle || 'Documento Médico'}
        contentBody={savedDocumentRecord?.contentBody || ''}
        onTriggerPrintPdf={handleTriggerPrint}
      />

      {/* Doctor Vault & CI Authentication Modal */}
      <DoctorVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        profiles={colleagueProfiles}
        activeDoctorId={config.id}
        onSelectDoctor={(docId) => {
          setActiveColleagueId(docId);
          showToast('✓ Consultorio médico activado');
        }}
        onSavePermanentProfile={() => {
          handleSaveAll();
          showToast(`✓ Datos del Dr. ${config.doctorName} grabados permanentemente.`);
        }}
      />

      {/* Share / Hand-off with Doctor Modal */}
      <ShareWithDoctorModal
        isOpen={isShareWithDoctorOpen}
        onClose={() => setIsShareWithDoctorOpen(false)}
        config={config}
      />

      {/* Universal 1:1 Print Preview Modal (All Documents) */}
      <UniversalPreviewModal
        isOpen={isUniversalPreviewOpen}
        onClose={() => setIsUniversalPreviewOpen(false)}
        config={config}
        activeModule={previewInitialModule}
        onSelectModule={(mod) => setPreviewInitialModule(mod)}
        recipe={recipes[activeRecipeIndex] || recipes[0]}
        recipes4en1={recipes}
        currentReport={currentReport}
        medicalRestCert={restCert}
        indicationsSheet={indications}
        clinicalRecord={activeRecord || undefined}
        onConfirmPrint={handleTriggerPrint}
        onConfirmDownloadPdf={() => handleDownloadRealPdf()}
      />

      {/* Doctor Authentication & Onboarding Gate Modal */}
      <DoctorAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        registeredDoctors={colleagueProfiles}
        onRegisterNewDoctor={handleRegisterNewDoctor}
        onLoginDoctor={handleLoginDoctor}
        onResetAllData={handleResetAllData}
        onContinueAsGuest={() => setIsAuthModalOpen(false)}
        onOpenAdminPanel={() => {
          setIsAuthModalOpen(false);
          setIsAdminPanelOpen(true);
        }}
      />

      {/* Secret Master Key Prompt for Hidden Admin Access */}
      <SecretAdminPromptModal
        isOpen={isSecretAdminPromptOpen}
        onClose={() => setIsSecretAdminPromptOpen(false)}
        onSuccess={() => {
          setIsSecretAdminPromptOpen(false);

          // Authenticate and elevate session to Master Admin Doctor preserving existing profile
          const existingMaster = colleagueProfiles.find(p => p.id === 'doc-admin-master' || p.email?.toLowerCase().includes('carloseduardoleal29') || p.isAdmin);
          const masterAdminDoc: DoctorConfig = {
            ...DEFAULT_DOCTOR_CONFIG,
            ...(existingMaster || {}),
            id: 'doc-admin-master',
            profileName: existingMaster?.profileName || 'Dr. Carlos E. Leal S.',
            doctorName: existingMaster?.doctorName || 'Dr. Carlos E. Leal S.',
            email: existingMaster?.email || 'carloseduardoleal29@gmail.com',
            collegeNumber: existingMaster?.collegeNumber !== undefined ? existingMaster.collegeNumber : '',
            institution: existingMaster?.institution !== undefined ? existingMaster.institution : '',
            institutionDetails: existingMaster?.institutionDetails !== undefined ? existingMaster.institutionDetails : '',
            password: '2534',
            paymentStatus: 'activo',
            isPaidClient: true,
            paidPlanName: 'Acceso Master Administrador',
            isAdmin: true,
            isVip: true,
          };

          handleLoginDoctor(masterAdminDoc);
          setIsAdminPanelOpen(true);
          showToast('🔑 Acceso Master de Administrador concedido');
        }}
      />

      {/* Subscription Requirement Gate Modal for "Estudio de Diseño" */}
      <SubscriptionRequiredModal
        isOpen={isSubscriptionRequiredOpen}
        onClose={() => setIsSubscriptionRequiredOpen(false)}
        onOpenPlans={() => {
          setIsSubscriptionRequiredOpen(false);
          setActiveModule('suscripcion');
        }}
        onUnlockWithPin={() => {
          setIsSubscriptionRequiredOpen(false);
          handlePinSuccess();
        }}
      />

      {/* Admin Central Private Panel */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        registeredDoctors={colleagueProfiles}
        onRefreshFromCloud={async () => {
          const cloud = await fetchDoctorsFromCloud();
          if (cloud && cloud.length > 0) {
            setColleagueProfiles(cloud);
            showToast('✓ Lista de médicos sincronizada desde la nube');
          }
        }}
        onDeleteDoctor={async (docId) => {
          let nextList: DoctorConfig[] = [];
          setColleagueProfiles((prev) => {
            nextList = prev.filter((p) => p.id !== docId);
            localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(nextList));
            return nextList;
          });
          await deleteDoctorFromCloud(docId);
          const activeSession = getStoredDoctorSessionId() || 'carloseduardoleal29@gmail.com';
          if (isUserLoaded(activeSession)) {
            await saveEcosystemToCloud({
              identifier: activeSession,
              colleagueProfiles: nextList,
            });
          }
          showToast('✓ Médico eliminado de la base de datos');
        }}
        onResetAllData={async () => {
          setColleagueProfiles([DEFAULT_DOCTOR_CONFIG]);
          localStorage.removeItem('digital_medic_colleagues_v2');
          localStorage.removeItem('digital_medic_active_doctor_session');
          await resetAllDoctorsInCloud();
          showToast('✓ Base de datos reiniciada limpia');
        }}
        onUpdateDoctor={handleUpdateDoctor}
        onLoginAsDoctor={handleLoginAsDoctor}
        onAddNewDoctor={async (newDoctor) => {
          let nextList: DoctorConfig[] = [];
          setColleagueProfiles((prev) => {
            const filtered = prev.filter(p => p.id !== newDoctor.id && p.ci !== newDoctor.ci);
            nextList = [newDoctor, ...filtered];
            localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(nextList));
            return nextList;
          });
          await saveSingleDoctorToCloud(newDoctor);
          const activeSession = getStoredDoctorSessionId() || 'carloseduardoleal29@gmail.com';
          if (isUserLoaded(activeSession)) {
            await saveEcosystemToCloud({
              identifier: activeSession,
              colleagueProfiles: nextList,
            });
          }
          showToast(`✓ Dr(a). ${newDoctor.doctorName} dado de alta y guardado en la nube`);
        }}
      />

      {/* Blank Recipe Preview Modal (Shown on Onboarding Completion and from Home Page) */}
      <BlankRecipeWelcomeModal
        isOpen={isWelcomeBlankRecipeOpen}
        onClose={() => setIsWelcomeBlankRecipeOpen(false)}
        config={config}
        onNavigateToRecipes={() => {
          setIsWelcomeBlankRecipeOpen(false);
          setActiveModule('recipe-4en1');
        }}
      />

      {/* Modal de Bloqueo por Prueba de 14 Días Vencida */}
      <TrialExpiredModal
        isOpen={getDoctorTrialStatus(config).isExpired}
        doctor={config}
        onLogout={handleLogout}
        onRefreshStatus={async () => {
          const cloud = await fetchDoctorsFromCloud();
          if (cloud && cloud.length > 0) {
            setColleagueProfiles(cloud);
            const found = cloud.find(c => c.id === config.id || c.ci === config.ci);
            if (found) {
              updateCurrentConfig(found);
              showToast('✓ Estado verificado desde la nube');
            }
          }
        }}
      />

      {/* Modal para Cambiar Clave de Acceso */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        registeredDoctors={colleagueProfiles}
        currentDoctor={config}
        onPasswordChanged={(updatedDoc) => {
          updateCurrentConfig(updatedDoc);
          setColleagueProfiles((prev) => {
            const next = prev.map(p => p.id === updatedDoc.id ? updatedDoc : p);
            localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(next));
            return next;
          });
          showToast('✓ Su clave ha sido actualizada con éxito');
        }}
      />

      {/* Modal de Sincronización Móvil / PC y Código QR */}
      <SyncDevicesModal
        isOpen={isSyncDevicesOpen}
        onClose={() => setIsSyncDevicesOpen(false)}
        config={config}
        patientCount={availableSessionPatients.length}
        isSyncing={isManualSyncing}
        onForceSync={async () => {
          setIsManualSyncing(true);
          try {
            await handleManualCloudSync();
            const targetIdent = (activeDoctorSessionId || config.email || 'carloseduardoleal29@gmail.com').toLowerCase().trim();
            const resolvedIdent = (targetIdent === 'doc-admin-master' || targetIdent === 'admin' || targetIdent === 'admin@digitalmedic.com') 
              ? 'carloseduardoleal29@gmail.com' 
              : targetIdent;
            await syncWithCloudEcosystem(resolvedIdent, true);
          } finally {
            setIsManualSyncing(false);
          }
        }}
      />

      {/* Botón Flotante Permanente "Instalar Aplicación" (Escucha beforeinstallprompt) */}
      <PWAInstallButton variant="floating" />
    </div>
  );
}
