import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  getDocFromServer,
  Firestore,
  Unsubscribe 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserEcosystem } from './ecosystemSync';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const currentAuth = auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid,
      email: currentAuth?.currentUser?.email,
      emailVerified: currentAuth?.currentUser?.emailVerified,
      isAnonymous: currentAuth?.currentUser?.isAnonymous,
      tenantId: currentAuth?.currentUser?.tenantId,
      providerInfo: currentAuth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

let clientQuotaExceeded = false;
let lastClientQuotaTime = 0;
const CLIENT_QUOTA_COOLDOWN_MS = 15 * 60 * 1000;

export function isClientFirestoreReady(): boolean {
  if (!db) return false;
  if (clientQuotaExceeded) {
    if (Date.now() - lastClientQuotaTime > CLIENT_QUOTA_COOLDOWN_MS) {
      clientQuotaExceeded = false;
      return true;
    }
    return false;
  }
  return true;
}

function handleClientFirestoreError(err: any, context: string, path: string = 'ecosystems') {
  handleFirestoreError(err, OperationType.WRITE, path);
  const errMsg = String(err?.message || err?.code || err || '');
  if (
    errMsg.includes('resource-exhausted') || 
    errMsg.includes('Quota limit exceeded') || 
    errMsg.includes('Quota exceeded') ||
    errMsg.includes('free tier database')
  ) {
    if (!clientQuotaExceeded) {
      clientQuotaExceeded = true;
      lastClientQuotaTime = Date.now();
      console.warn(`[Firebase Client] Se excedió la cuota diaria gratuita en '${context}'. Usando respaldo del servidor local.`);
    }
  } else {
    console.warn(`[Firebase Client] ${context} warning:`, errMsg);
  }
}

try {
  app = !getApps().length
    ? initializeApp({
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId,
      })
    : getApps()[0];

  const dbId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
  db = getFirestore(app, dbId);
  console.log('[Firebase Client] Firestore cliente inicializado en base de datos:', dbId);
} catch (err) {
  console.warn('[Firebase Client] No se pudo inicializar Firestore directamente en navegador:', err);
}

export const auth = getAuth(app!);

// Validate Connection to Firestore at Boot
async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'settings', 'payment_config'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase Client] Client is offline or connection pending.');
    }
  }
}
testConnection();

export function getEcosystemKey(identifier: string): string {
  let resolved = (identifier || '').toLowerCase().trim();
  if (resolved === 'doc-admin-master' || resolved === 'admin' || resolved === 'admin@digitalmedic.com') {
    resolved = 'carloseduardoleal29@gmail.com';
  }
  return resolved.replace(/[^a-z0-9]/gi, '_');
}

/**
 * Guarda el ecosistema directamente en la nube de Google Firebase Firestore.
 */
export async function saveDirectToFirestore(ecosystem: Partial<UserEcosystem>): Promise<boolean> {
  if (!isClientFirestoreReady() || !ecosystem) return false;
  try {
    const ident = ecosystem.identifier || ecosystem.email || ecosystem.doctorConfig?.email || 'carloseduardoleal29@gmail.com';
    const docKey = getEcosystemKey(ident);

    const payload: any = {
      ...ecosystem,
      identifier: ident,
      updatedAt: Date.now(),
    };

    // Preserve full doctor profiles with stamps, signatures, and design assets
    if (payload.colleagueProfiles && Array.isArray(payload.colleagueProfiles)) {
      payload.colleagueProfiles = payload.colleagueProfiles.map((p: any) => ({ ...p }));
    }

    const docRef = doc(db!, 'ecosystems', docKey);
    await setDoc(docRef, payload, { merge: true });
    console.log('[Firebase Client] Guardado con éxito directo en Firestore:', docKey);

    if (payload.paymentConfig && typeof payload.paymentConfig === 'object') {
      const pm = payload.paymentConfig.pagoMovil;
      const bin = payload.paymentConfig.binance;
      const zin = payload.paymentConfig.zinli;
      if (pm?.telefono || bin?.payId || bin?.email || zin?.email) {
        await savePaymentConfigDirectToFirestore(payload.paymentConfig);
      }
    }

    return true;
  } catch (err) {
    handleClientFirestoreError(err, 'saveDirectToFirestore', 'ecosystems');
    return false;
  }
}

/**
 * Carga el ecosistema directamente desde Google Firebase Firestore.
 */
export async function fetchDirectFromFirestore(identifier: string): Promise<UserEcosystem | null> {
  if (!isClientFirestoreReady() || !identifier) return null;
  try {
    const docKey = getEcosystemKey(identifier);
    const docRef = doc(db!, 'ecosystems', docKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      console.log('[Firebase Client] Ecosistema cargado directo desde Firestore:', docKey);
      return snap.data() as UserEcosystem;
    }
  } catch (err) {
    handleClientFirestoreError(err, 'fetchDirectFromFirestore', `ecosystems/${identifier}`);
  }
  return null;
}

/**
 * Guarda los datos de cobro (Pago Móvil, Binance, Zinli) directamente en Firestore en settings/payment_config.
 */
export async function savePaymentConfigDirectToFirestore(config: any): Promise<boolean> {
  if (!isClientFirestoreReady() || !config) return false;
  try {
    const docRef = doc(db!, 'settings', 'payment_config');
    await setDoc(docRef, { ...config, updatedAt: Date.now() }, { merge: true });
    console.log('[Firebase Client] Datos de cobro guardados con éxito directo en Firestore settings/payment_config');
    return true;
  } catch (err) {
    handleClientFirestoreError(err, 'savePaymentConfigDirectToFirestore', 'settings/payment_config');
    return false;
  }
}

/**
 * Carga los datos de cobro directamente desde Firestore settings/payment_config.
 */
export async function fetchPaymentConfigDirectFromFirestore(): Promise<any | null> {
  if (!isClientFirestoreReady()) return null;
  try {
    const docRef = doc(db!, 'settings', 'payment_config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && (data.pagoMovil?.telefono || data.binance?.payId || data.binance?.email || data.zinli?.email || data.tasaBinanceUsd > 0)) {
        console.log('[Firebase Client] Datos de cobro cargados directo desde Firestore settings/payment_config');
        return data;
      }
    }
  } catch (err) {
    handleClientFirestoreError(err, 'fetchPaymentConfigDirectFromFirestore', 'settings/payment_config');
  }
  return null;
}

/**
 * Escucha en tiempo real cualquier cambio en los datos de cobro en la nube (Firestore)
 */
export function subscribeToPaymentConfig(onUpdate: (config: any) => void): Unsubscribe | null {
  if (!isClientFirestoreReady()) return null;
  try {
    const docRef = doc(db!, 'settings', 'payment_config');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data) {
          onUpdate(data);
        }
      }
    }, (err) => {
      handleClientFirestoreError(err, 'subscribeToPaymentConfig', 'settings/payment_config');
    });
  } catch (err) {
    handleClientFirestoreError(err, 'subscribeToPaymentConfig setup', 'settings/payment_config');
    return null;
  }
}

/**
 * Escucha en tiempo real cualquier cambio en el ecosistema del usuario en la nube (Firestore)
 */
export function subscribeToUserEcosystem(identifier: string, onUpdate: (eco: UserEcosystem) => void): Unsubscribe | null {
  if (!isClientFirestoreReady() || !identifier) return null;
  try {
    const docKey = getEcosystemKey(identifier);
    const docRef = doc(db!, 'ecosystems', docKey);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserEcosystem;
        if (data) {
          onUpdate(data);
        }
      }
    }, (err) => {
      handleClientFirestoreError(err, 'subscribeToUserEcosystem', `ecosystems/${docKey}`);
    });
  } catch (err) {
    handleClientFirestoreError(err, 'subscribeToUserEcosystem setup', `ecosystems/${identifier}`);
    return null;
  }
}

export { db as firestoreClientDb };
