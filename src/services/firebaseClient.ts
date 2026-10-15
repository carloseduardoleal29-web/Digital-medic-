import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  Firestore,
  Unsubscribe 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserEcosystem } from './ecosystemSync';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

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
  console.log('[Firebase Client] Firestore initialized successfully on database:', dbId);
} catch (err) {
  console.warn('[Firebase Client] Failed to initialize Firestore directly in browser:', err);
}

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
  if (!db || !ecosystem) return false;
  try {
    const ident = ecosystem.identifier || ecosystem.email || ecosystem.doctorConfig?.email || 'carloseduardoleal29@gmail.com';
    const docKey = getEcosystemKey(ident);

    // Sanitizar colleagueProfiles para no exceder 1MB si hay imágenes pesadas duplicadas
    const payload: any = {
      ...ecosystem,
      identifier: ident,
      updatedAt: Date.now(),
    };

    if (payload.colleagueProfiles && Array.isArray(payload.colleagueProfiles)) {
      payload.colleagueProfiles = payload.colleagueProfiles.map((p: any) => {
        const { selloImg, firmaImg, ...rest } = p;
        return rest;
      });
    }

    const docRef = doc(db, 'ecosystems', docKey);
    await setDoc(docRef, payload, { merge: true });
    console.log('[Firebase Client] Guardado con éxito directo en Firestore:', docKey);

    // Si incluye paymentConfig configurado, guardar también en settings/payment_config
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
    console.warn('[Firebase Client] Error guardando directo en Firestore:', err);
    return false;
  }
}

/**
 * Carga el ecosistema directamente desde Google Firebase Firestore.
 */
export async function fetchDirectFromFirestore(identifier: string): Promise<UserEcosystem | null> {
  if (!db || !identifier) return null;
  try {
    const docKey = getEcosystemKey(identifier);
    const docRef = doc(db, 'ecosystems', docKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      console.log('[Firebase Client] Ecosistema cargado directo desde Firestore:', docKey);
      return snap.data() as UserEcosystem;
    }
  } catch (err) {
    console.warn('[Firebase Client] Error cargando directo desde Firestore:', err);
  }
  return null;
}

/**
 * Guarda los datos de cobro (Pago Móvil, Binance, Zinli) directamente en Firestore en settings/payment_config.
 */
export async function savePaymentConfigDirectToFirestore(config: any): Promise<boolean> {
  if (!db || !config) return false;
  try {
    const docRef = doc(db, 'settings', 'payment_config');
    await setDoc(docRef, { ...config, updatedAt: Date.now() }, { merge: true });
    console.log('[Firebase Client] Datos de cobro guardados con éxito directo en Firestore settings/payment_config');
    return true;
  } catch (err) {
    console.warn('[Firebase Client] Error guardando datos de cobro directo en Firestore:', err);
    return false;
  }
}

/**
 * Carga los datos de cobro directamente desde Firestore settings/payment_config.
 */
export async function fetchPaymentConfigDirectFromFirestore(): Promise<any | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, 'settings', 'payment_config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && (data.pagoMovil?.telefono || data.binance?.payId || data.binance?.email || data.zinli?.email || data.tasaBinanceUsd > 0)) {
        console.log('[Firebase Client] Datos de cobro cargados directo desde Firestore settings/payment_config');
        return data;
      }
    }
  } catch (err) {
    console.warn('[Firebase Client] Error cargando datos de cobro de Firestore:', err);
  }
  return null;
}

/**
 * Escucha en tiempo real cualquier cambio en los datos de cobro en la nube (Firestore)
 * para que cuando el usuario edite en el teléfono, la PC se actualice INSTANTÁNEAMENTE.
 */
export function subscribeToPaymentConfig(onUpdate: (config: any) => void): Unsubscribe | null {
  if (!db) return null;
  try {
    const docRef = doc(db, 'settings', 'payment_config');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data) {
          onUpdate(data);
        }
      }
    }, (err) => {
      console.warn('[Firebase Client] Listener error on payment_config:', err);
    });
  } catch (err) {
    console.warn('[Firebase Client] Error setting up payment_config listener:', err);
    return null;
  }
}

/**
 * Escucha en tiempo real cualquier cambio en el ecosistema del usuario en la nube (Firestore)
 * para sincronización bidireccional inmediata PC <-> Teléfono.
 */
export function subscribeToUserEcosystem(identifier: string, onUpdate: (eco: UserEcosystem) => void): Unsubscribe | null {
  if (!db || !identifier) return null;
  try {
    const docKey = getEcosystemKey(identifier);
    const docRef = doc(db, 'ecosystems', docKey);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserEcosystem;
        if (data) {
          onUpdate(data);
        }
      }
    }, (err) => {
      console.warn('[Firebase Client] Listener error on ecosystem:', err);
    });
  } catch (err) {
    console.warn('[Firebase Client] Error setting up ecosystem listener:', err);
    return null;
  }
}

export { db as firestoreClientDb };
