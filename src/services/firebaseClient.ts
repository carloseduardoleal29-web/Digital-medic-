import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  Firestore 
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

function getEcosystemKey(identifier: string): string {
  let resolved = (identifier || '').toLowerCase().trim();
  // Removed alias mapping for admin/master to prevent data contamination across users.
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

export { db as firestoreClientDb };
