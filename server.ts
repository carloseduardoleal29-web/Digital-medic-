import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DOCTORS_FILE = path.join(DATA_DIR, 'doctors.json');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
const PAYMENT_CONFIG_FILE = path.join(DATA_DIR, 'payment_config.json');
const ECOSYSTEMS_DIR = path.join(DATA_DIR, 'ecosystems');
const PDFS_DIR = path.join(DATA_DIR, 'pdfs');

// Ensure data and ecosystem folders exist for local fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ECOSYSTEMS_DIR)) {
  fs.mkdirSync(ECOSYSTEMS_DIR, { recursive: true });
}
if (!fs.existsSync(PDFS_DIR)) {
  fs.mkdirSync(PDFS_DIR, { recursive: true });
}

// Serve PDFs statically
app.use('/pdf', express.static(PDFS_DIR));

// Initialize Firebase Firestore Admin SDK
let firestoreDb: any = null;
let firestoreAvailable = true;

try {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (!getApps().length) {
      initializeApp({
        projectId: config.projectId,
      });
    }
    const dbId = config.firestoreDatabaseId || '(default)';
    firestoreDb = getFirestore(getApps()[0], dbId);
    try {
      firestoreDb.settings({ ignoreUndefinedProperties: true });
    } catch (settingsErr) {
      console.warn('[Firestore] settings() call failed, might already be initialized:', settingsErr);
    }
    console.log(`[Firestore] Connected successfully to database: ${dbId} (project: ${config.projectId})`);
  }
} catch (err) {
  firestoreAvailable = false;
  console.warn('[Firestore] Failed to connect to Firestore, using fallback local storage:', err);
}

// Increase payload limit for medical logos, stamps, signatures
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Never cache HTML/applet in browser to prevent frozen or outdated versions
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// --- Local Disk Fallback Helpers ---
function readDoctorsLocal(): any[] {
  try {
    if (fs.existsSync(DOCTORS_FILE)) {
      const data = fs.readFileSync(DOCTORS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading doctors file:', err);
  }
  return [];
}

function readDocumentsLocal(): any[] {
  try {
    if (fs.existsSync(DOCUMENTS_FILE)) {
      const data = fs.readFileSync(DOCUMENTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading documents file:', err);
  }
  return [];
}

function getEcosystemKey(identifier: string) {
  return (identifier || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/gi, '_');
}

function readUserEcosystemLocal(identifier: string): any | null {
  try {
    if (!identifier) return null;
    const rawKey = getEcosystemKey(identifier);
    const primaryFile = path.join(ECOSYSTEMS_DIR, `${rawKey}.json`);
    if (fs.existsSync(primaryFile)) {
      const data = fs.readFileSync(primaryFile, 'utf-8');
      return JSON.parse(data);
    }

    if (fs.existsSync(ECOSYSTEMS_DIR)) {
      const files = fs.readdirSync(ECOSYSTEMS_DIR);
      const cleanIdent = (identifier || '').toLowerCase().trim();
      const cleanDigits = cleanIdent.replace(/[^a-z0-9]/gi, '');

      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        try {
          const filePath = path.join(ECOSYSTEMS_DIR, file);
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          const fileEmail = (content.email || content.doctorConfig?.email || '').toLowerCase().trim();
          const fileCI = (content.ci || content.doctorConfig?.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
          const fileId = (content.identifier || content.doctorConfig?.id || '').toLowerCase().trim();
          if (fileEmail === cleanIdent || fileId === cleanIdent || (cleanDigits && fileCI === cleanDigits)) {
            return content;
          }
        } catch (_) {}
      }
    }

    const doctors = readDoctorsLocal();
    const cleanIdent = (identifier || '').toLowerCase().trim();
    const cleanDigits = cleanIdent.replace(/[^a-z0-9]/gi, '');
    const foundDoc = doctors.find((d: any) => {
      const dEmail = (d.email || '').toLowerCase().trim();
      const dCI = (d.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
      const dId = (d.id || '').toLowerCase().trim();
      return dEmail === cleanIdent || dId === cleanIdent || (cleanDigits && dCI === cleanDigits);
    });

    if (foundDoc) {
      return {
        identifier: foundDoc.email || foundDoc.id,
        email: foundDoc.email,
        ci: foundDoc.ci,
        doctorConfig: foundDoc,
        colleagueProfiles: [foundDoc],
        patientBank: [],
        recipes: [],
        updatedAt: foundDoc.updatedAt || Date.now(),
      };
    }
  } catch (err) {
    console.error('Error reading user ecosystem local:', err);
  }
  return null;
}

// --- Firestore Sourced Async Operations ---

function handleFirestoreAdminError(err: any, opName: string) {
  const msg = err instanceof Error ? err.message : String(err);
  console.warn(`[Firestore] ${opName} warning/error:`, msg);
}

async function readDoctors(): Promise<any[]> {
  if (firestoreDb && firestoreAvailable) {
    try {
      const snap = await firestoreDb.collection('doctors').get();
      if (!snap.empty) {
        const list: any[] = [];
        snap.forEach((doc: any) => list.push(doc.data()));
        return list;
      }
    } catch (err) {
      handleFirestoreAdminError(err, 'readDoctors');
    }
  }
  return readDoctorsLocal();
}

async function writeDoctors(doctors: any[]): Promise<boolean> {
  try {
    fs.writeFileSync(DOCTORS_FILE, JSON.stringify(doctors, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing doctors file:', err);
  }

  if (firestoreDb && firestoreAvailable) {
    try {
      const batch = firestoreDb.batch();
      for (const doc of doctors) {
        if (!doc || !doc.id) continue;
        const ref = firestoreDb.collection('doctors').doc(doc.id);
        batch.set(ref, { ...doc, updatedAt: Date.now() }, { merge: true });
      }
      await batch.commit();
      return true;
    } catch (err) {
      handleFirestoreAdminError(err, 'writeDoctors');
    }
  }
  return true;
}

async function readDocuments(): Promise<any[]> {
  if (firestoreDb && firestoreAvailable) {
    try {
      const snap = await firestoreDb.collection('documents').get();
      if (!snap.empty) {
        const list: any[] = [];
        snap.forEach((doc: any) => list.push(doc.data()));
        return list;
      }
    } catch (err) {
      handleFirestoreAdminError(err, 'readDocuments');
    }
  }
  return readDocumentsLocal();
}

async function writeDocuments(docs: any[]): Promise<boolean> {
  try {
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(docs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing documents file:', err);
  }

  if (firestoreDb && firestoreAvailable) {
    try {
      const batch = firestoreDb.batch();
      for (const d of docs) {
        if (!d || !d.id) continue;
        const ref = firestoreDb.collection('documents').doc(d.id);
        batch.set(ref, { ...d, updatedAt: Date.now() }, { merge: true });
      }
      await batch.commit();
      return true;
    } catch (err) {
      handleFirestoreAdminError(err, 'writeDocuments');
    }
  }
  return true;
}

async function readUserEcosystem(identifier: string): Promise<any | null> {
  if (!identifier) return null;
  const rawKey = getEcosystemKey(identifier);

  if (firestoreDb && firestoreAvailable) {
    try {
      const docRef = firestoreDb.collection('ecosystems').doc(rawKey);
      const snap = await docRef.get();
      if (snap.exists) {
        return snap.data();
      }

      // Query by email, ci or identifier field
      const cleanIdent = identifier.toLowerCase().trim();
      const querySnap = await firestoreDb.collection('ecosystems')
        .where('email', '==', cleanIdent)
        .limit(1)
        .get();

      if (!querySnap.empty) {
        return querySnap.docs[0].data();
      }
    } catch (err) {
      handleFirestoreAdminError(err, 'readUserEcosystem');
    }
  }

  return readUserEcosystemLocal(identifier);
}

async function writeUserEcosystem(payload: any): Promise<any | null> {
  try {
    const ident = payload.email || payload.identifier || payload.doctorConfig?.email || payload.doctorConfig?.id || 'default_user';
    const rawKey = getEcosystemKey(ident);

    // Read existing local ecosystem to preserve non-empty assets
    const existingEco = readUserEcosystemLocal(ident);
    const existingDoc = existingEco?.doctorConfig;
    const incomingDoc = payload.doctorConfig;

    const mergedDoctorConfig = incomingDoc ? {
      ...(existingDoc || {}),
      ...incomingDoc,
      firmaImg: incomingDoc.firmaImg || existingDoc?.firmaImg || '',
      selloImg: incomingDoc.selloImg || existingDoc?.selloImg || '',
      selloFirma: incomingDoc.selloFirma || existingDoc?.selloFirma || '',
      logoIzq: incomingDoc.logoIzq || existingDoc?.logoIzq,
      logoDer: incomingDoc.logoDer || existingDoc?.logoDer,
      marcaAgua: incomingDoc.marcaAgua || existingDoc?.marcaAgua,
      specialty: incomingDoc.specialty || existingDoc?.specialty || 'Médico Cirujano',
      mpps: incomingDoc.mpps || existingDoc?.mpps || '',
      ci: incomingDoc.ci || existingDoc?.ci || '',
      collegeNumber: incomingDoc.collegeNumber || existingDoc?.collegeNumber || '',
      phone: incomingDoc.phone || existingDoc?.phone || '',
      institution: incomingDoc.institution || existingDoc?.institution || '',
      institutionDetails: incomingDoc.institutionDetails || existingDoc?.institutionDetails || '',
    } : existingDoc;

    const dataToSave = {
      ...(existingEco || {}),
      ...payload,
      ...(mergedDoctorConfig ? { doctorConfig: mergedDoctorConfig } : {}),
      identifier: ident,
      updatedAt: Date.now(),
    };

    // Save to local disk backup
    try {
      const targetFile = path.join(ECOSYSTEMS_DIR, `${rawKey}.json`);
      fs.writeFileSync(targetFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (_) {}

    // Save to Firestore if available
    if (firestoreDb && firestoreAvailable) {
      try {
        const docRef = firestoreDb.collection('ecosystems').doc(rawKey);
        await docRef.set(dataToSave, { merge: true });
      } catch (err) {
        handleFirestoreAdminError(err, 'writeUserEcosystem');
      }
    }

    // Keep doctors collection synchronized
    if (payload.doctorConfig && payload.doctorConfig.id) {
      const current = await readDoctors();
      const doc = payload.doctorConfig;
      const targetEmail = (doc.email || '').toLowerCase().trim();
      const targetCI = (doc.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
      const targetId = (doc.id || '').toLowerCase().trim();

      const idx = current.findIndex((d: any) => {
        const dId = (d.id || '').toLowerCase().trim();
        const dEmail = (d.email || '').toLowerCase().trim();
        const dCI = (d.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
        if (dId && targetId && dId === targetId) return true;
        if (dEmail && targetEmail && dEmail === targetEmail) return true;
        if (dCI && targetCI && dCI === targetCI) return true;
        return false;
      });

      if (idx >= 0) {
        current[idx] = { ...current[idx], ...doc, updatedAt: Date.now() };
      } else {
        current.push({ ...doc, updatedAt: Date.now() });
      }
      await writeDoctors(current);
    }

    return dataToSave;
  } catch (err) {
    console.error('Error writing user ecosystem:', err);
    return null;
  }
}

// --- REST API Endpoints ---

// Helper function to sanitize ascii filenames on the server
function sanitizeToAsciiFilenameOnServer(filename: string): string {
  if (!filename || typeof filename !== 'string') return 'Documento_Medico';
  const base = filename.replace(/\.pdf$/i, '');
  return base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove tildes/accents
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Safe chars only
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

app.post('/api/pdf/upload', async (req, res) => {
  try {
    const { pdfBase64, filename } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ success: false, message: 'Falta el archivo PDF en base64.' });
    }

    // Generate a secure unique ID for the PDF file to prevent sequential guessing
    const uniqueId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(3, 9);
    const safeFilename = filename ? sanitizeToAsciiFilenameOnServer(filename) : `documento_${uniqueId}`;
    const finalFilename = `${safeFilename}_${uniqueId}.pdf`;
    const targetPath = path.join(PDFS_DIR, finalFilename);

    // Convert Base64 back to binary buffer and write file
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    fs.writeFileSync(targetPath, buffer);

    // Build public URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host');
    const publicUrl = `${protocol}://${host}/pdf/${finalFilename}`;

    console.log(`[PDF Upload] PDF saved to ${targetPath}. Public URL: ${publicUrl}`);

    return res.json({
      success: true,
      message: 'PDF subido con éxito',
      url: publicUrl,
      filename: finalFilename
    });
  } catch (err) {
    console.error('[PDF Upload Error]:', err);
    return res.status(500).json({ success: false, message: 'Error interno al subir el PDF.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Debe ingresar correo/cédula y su clave de acceso' });
  }

  const cleanIdent = String(identifier).toLowerCase().trim();
  const cleanPass = String(password).trim();
  const cleanDigits = cleanIdent.replace(/[^a-z0-9]/gi, '');

  const adminEmails = [
    'carloseduardoleal29@gmail.com',
    'carloseduardoleal29',
    'admin@digitalmedic.com',
    'admin'
  ];
  const isMasterUser = adminEmails.includes(cleanIdent) || cleanIdent.includes('carloseduardoleal29');

  if (isMasterUser) {
    const masterPass = '2534';
    if (cleanPass !== masterPass && cleanPass.toUpperCase() !== 'ADMIN2026') {
      return res.status(401).json({ success: false, message: 'Clave de acceso incorrecta para el Administrador Master.' });
    }

    // Read saved admin ecosystem / doctor profile
    const ecosystem = await readUserEcosystem('carloseduardoleal29@gmail.com');
    const doctors = await readDoctors();
    let adminDoc = ecosystem?.doctorConfig || 
      ecosystem?.colleagueProfiles?.find((p: any) => p.email?.includes('carloseduardoleal29') || p.id === 'doc-admin-master' || p.isAdmin) ||
      doctors.find((d: any) => (d.email && d.email.toLowerCase().includes('carloseduardoleal29')) || d.id === 'doc-admin-master');

    const resolvedAdminDoc = {
      id: 'doc-admin-master',
      profileName: adminDoc?.profileName || 'Dr. Carlos E. Leal S.',
      doctorName: adminDoc?.doctorName || 'Dr. Carlos E. Leal S.',
      specialty: adminDoc?.specialty || 'Médico Cirujano',
      mpps: adminDoc?.mpps || '',
      ci: adminDoc?.ci || '',
      collegeNumber: adminDoc?.collegeNumber || '',
      phone: adminDoc?.phone || '',
      institution: adminDoc?.institution || '',
      institutionDetails: adminDoc?.institutionDetails || '',
      firmaImg: adminDoc?.firmaImg || '',
      selloImg: adminDoc?.selloImg || '',
      selloFirma: adminDoc?.selloFirma || '',
      logoIzq: adminDoc?.logoIzq,
      logoDer: adminDoc?.logoDer,
      marcaAgua: adminDoc?.marcaAgua,
      headerStyle: adminDoc?.headerStyle || 'clasico',
      headerLayout: adminDoc?.headerLayout || 'ambos-logos',
      primaryDocColor: adminDoc?.primaryDocColor || '#2563eb',
      headerColor: adminDoc?.headerColor || '#1e3a8a',
      fuenteHeader: adminDoc?.fuenteHeader,
      fuenteNombre: adminDoc?.fuenteNombre,
      nombreSize: adminDoc?.nombreSize,
      nombreColor: adminDoc?.nombreColor,
      tonePapel: adminDoc?.tonePapel,
      rxTitleColor: adminDoc?.rxTitleColor,
      borderStyle: adminDoc?.borderStyle,
      docCornerRadius: adminDoc?.docCornerRadius,
      ...(adminDoc || {}),
      email: 'carloseduardoleal29@gmail.com',
      password: masterPass,
      isAdmin: true,
      isPaidClient: true,
      isVip: true,
      paidPlanName: 'Acceso Master Administrador',
      paymentStatus: 'activo',
    };

    return res.json({
      success: true,
      doctor: resolvedAdminDoc,
      ecosystem: ecosystem || {
        identifier: 'carloseduardoleal29@gmail.com',
        doctorConfig: resolvedAdminDoc,
        colleagueProfiles: [resolvedAdminDoc]
      }
    });
  }

  // Regular doctor login
  const doctors = await readDoctors();
  const found = doctors.find((d: any) => {
    const dEmail = (d.email || '').toLowerCase().trim();
    const dCI = (d.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
    const dId = (d.id || '').toLowerCase().trim();
    return dEmail === cleanIdent || dId === cleanIdent || (cleanDigits && dCI === cleanDigits);
  });

  if (!found) {
    return res.status(404).json({
      success: false,
      message: 'No encontramos un médico registrado con ese Correo o Cédula. Solo entran usuarios registrados con correo y clave.'
    });
  }

  const expectedPass = (found.password || found.ci || '').trim();
  const cleanPassLower = cleanPass.toLowerCase().replace(/[^a-z0-9]/gi, '');
  const expectedPassLower = expectedPass.toLowerCase().replace(/[^a-z0-9]/gi, '');
  const expectedCiLower = (found.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');

  if (cleanPass !== expectedPass && cleanPassLower !== expectedPassLower && cleanPassLower !== expectedCiLower) {
    return res.status(401).json({
      success: false,
      message: 'Clave de acceso incorrecta. Verifique su clave o use Cambiar Clave.'
    });
  }

  if (found.paymentStatus === 'pendiente') {
    return res.status(403).json({
      success: false,
      message: 'Su cuenta está en proceso de verificación por la administración.'
    });
  }

  const userEco = await readUserEcosystem(found.email || found.ci || found.id);

  return res.json({
    success: true,
    doctor: found,
    ecosystem: userEco
  });
});

app.get('/api/ecosystem/:identifier', async (req, res) => {
  const { identifier } = req.params;
  const ecosystem = await readUserEcosystem(identifier);
  if (ecosystem) {
    res.json({ success: true, ecosystem });
  } else {
    res.status(404).json({ success: false, message: 'Ecosistema no encontrado para este usuario' });
  }
});

app.post('/api/ecosystem/save', async (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ success: false, message: 'Payload inválido' });
  }
  const saved = await writeUserEcosystem(payload);
  if (saved) {
    res.json({ success: true, message: 'Ecosistema guardado en la nube Firestore con éxito', ecosystem: saved });
  } else {
    res.status(500).json({ success: false, message: 'Error al guardar el ecosistema en la nube' });
  }
});

// --- Métodos de Cobro y Tasa Binance del Día (Solo Pago Móvil en Bs, Binance USDT y Zinli) ---
async function readPaymentConfig() {
  try {
    if (fs.existsSync(PAYMENT_CONFIG_FILE)) {
      const data = fs.readFileSync(PAYMENT_CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading payment_config.json:', err);
  }
  return {
    pagoMovil: {
      banco: '',
      telefono: '',
      cedula: '',
      titular: ''
    },
    binance: {
      payId: '',
      email: '',
      nickname: '',
      usdtAddress: '',
      network: 'USDT (TRC-20)'
    },
    zinli: {
      email: '',
      titular: ''
    },
    adminWhatsapp: '',
    tasaBinanceUsd: 0,
    tasaFuente: 'Binance P2P Venezuela',
    tasaUltimaActualizacion: ''
  };
}

async function writePaymentConfig(config: any) {
  try {
    fs.writeFileSync(PAYMENT_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing payment_config.json:', err);
    return false;
  }
}

app.get('/api/payment-config', async (_req, res) => {
  const config = await readPaymentConfig();
  res.json({ success: true, config });
});

app.post('/api/payment-config', async (req, res) => {
  const { config } = req.body;
  if (!config) {
    return res.status(400).json({ success: false, message: 'Missing config' });
  }
  const ok = await writePaymentConfig(config);
  if (ok) {
    res.json({ success: true, message: 'Datos de cobro actualizados con éxito', config });
  } else {
    res.status(500).json({ success: false, message: 'Error guardando datos de cobro' });
  }
});

app.get('/api/binance-rate', async (_req, res) => {
  // 1. Try Binance P2P API direct search for USDT/VES
  try {
    const binanceRes = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset: 'USDT',
        fiat: 'VES',
        merchantCheck: false,
        page: 1,
        payTypes: [],
        publisherType: null,
        rows: 5,
        tradeType: 'BUY'
      })
    });
    if (binanceRes.ok) {
      const data = await binanceRes.json();
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const prices = data.data
          .map((item: any) => parseFloat(item?.adv?.price))
          .filter((p: number) => !isNaN(p) && p > 0);
        if (prices.length > 0) {
          const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
          return res.json({
            success: true,
            rate: Math.round(avgPrice * 100) / 100,
            source: 'Binance P2P Venezuela (En Vivo)',
            samplePrices: prices.slice(0, 3),
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
  } catch (err) {
    console.warn('Binance P2P query failed, falling back:', err);
  }

  // 2. Fallback to DolarApi Paralelo (which tracks Binance/Paralelo rates in Venezuela)
  try {
    const fallbackRes = await fetch('https://ve.dolarapi.com/v1/dolares/paralelo');
    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      if (fbData?.promedio) {
        return res.json({
          success: true,
          rate: Math.round(Number(fbData.promedio) * 100) / 100,
          source: 'Mercado Paralelo / Binance Venezuela',
          updatedAt: fbData.fechaActualizacion || new Date().toISOString()
        });
      }
    }
  } catch (err2) {
    console.warn('Fallback rate fetch failed:', err2);
  }

  // 3. Constant fallback
  return res.json({
    success: true,
    rate: 956.00,
    source: 'Tasa Referencial Binance VES',
    updatedAt: new Date().toISOString()
  });
});

app.post('/api/pdf/upload', (req, res) => {
  try {
    const { pdfBase64, filename } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ success: false, message: 'Missing pdfBase64' });
    }
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    // Generate unique name to prevent collisions
    const uniqueFilename = `${Date.now()}_${filename || 'document.pdf'}`;
    const targetPath = path.join(PDFS_DIR, uniqueFilename);
    
    fs.writeFileSync(targetPath, buffer);
    const publicUrl = `${req.protocol}://${req.get('host')}/pdf/${uniqueFilename}`;
    
    res.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('Error uploading PDF:', err);
    res.status(500).json({ success: false, message: 'Internal server error uploading PDF' });
  }
});

app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, body, pdfBase64, filename, smtpHost, smtpPort, smtpUser, smtpPass, smtpSenderName } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ success: false, message: 'Missing required email fields (to, subject, body)' });
    }

    let transporter;
    if (smtpHost && smtpUser && smtpPass) {
      // Connect to the Doctor's custom SMTP server!
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort) || 587,
        secure: Number(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      console.log(`[Email] Using physician's custom SMTP server: ${smtpHost}`);
    } else {
      // Zero-config sandbox SMTP via Ethereal
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('[Email] Using zero-config sandbox SMTP (Ethereal)');
    }

    const mailOptions: any = {
      from: smtpSenderName ? `"${smtpSenderName}" <${smtpUser || 'no-reply@digitalmedic.com'}>` : `"Digital Medic" <no-reply@digitalmedic.com>`,
      to,
      subject,
      text: body
    };

    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      mailOptions.attachments = [
        {
          filename: filename || 'document.pdf',
          content: cleanBase64,
          encoding: 'base64'
        }
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Message sent successfully:', info.messageId);

    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.json({ 
      success: true, 
      message: 'Correo enviado con éxito', 
      messageId: info.messageId,
      previewUrl: previewUrl || null 
    });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ success: false, message: 'Error al enviar el correo desde el servidor', error: String(err) });
  }
});

app.get('/api/doctors', async (req, res) => {
  const doctors = await readDoctors();
  res.json({ success: true, doctors });
});

app.get('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const docs = await readDocuments();
  const found = docs.find((d: any) => d.id === id);
  if (found) {
    res.json({ success: true, document: found });
  } else {
    res.status(404).json({ success: false, message: 'Document not found' });
  }
});

app.post('/api/documents', async (req, res) => {
  const doc = req.body;
  if (!doc || !doc.id) {
    return res.status(400).json({ success: false, message: 'Invalid document payload' });
  }
  const current = await readDocuments();
  const index = current.findIndex((d: any) => d.id === doc.id);
  if (index >= 0) {
    current[index] = { ...current[index], ...doc };
  } else {
    current.unshift(doc);
    if (current.length > 500) current.pop();
  }
  await writeDocuments(current);
  res.json({ success: true, document: doc });
});

app.get('/api/doctors/:identifier', async (req, res) => {
  const { identifier } = req.params;
  const doctors = await readDoctors();
  const rawId = (identifier || '').toLowerCase().trim();
  const cleanId = rawId.replace(/[^a-z0-9]/gi, '');
  
  const found = doctors.find((d: any) => {
    const dId = (d.id || '').toLowerCase().trim();
    const dCI = (d.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
    const dMPPS = (d.mpps || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
    const dEmail = (d.email || '').toLowerCase().trim();
    return dId === rawId || dEmail === rawId || dCI === cleanId || dMPPS === cleanId || (dId && dId.includes(cleanId));
  });

  if (found) {
    res.json({ success: true, doctor: found });
  } else {
    res.status(404).json({ success: false, message: 'Doctor not found' });
  }
});

app.post('/api/doctors', async (req, res) => {
  const { doctors } = req.body;
  if (!Array.isArray(doctors)) {
    return res.status(400).json({ success: false, message: 'Invalid payload: doctors array required' });
  }
  const ok = await writeDoctors(doctors);
  if (ok) {
    res.json({ success: true, count: doctors.length });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write to database' });
  }
});

app.post('/api/doctors/save-one', async (req, res) => {
  const doctor = req.body;
  if (!doctor || !doctor.id) {
    return res.status(400).json({ success: false, message: 'Invalid doctor object' });
  }
  const current = await readDoctors();
  
  const targetEmail = (doctor.email || '').toLowerCase().trim();
  const targetCI = (doctor.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
  const targetId = (doctor.id || '').toLowerCase().trim();

  const index = current.findIndex((d: any) => {
    const dId = (d.id || '').toLowerCase().trim();
    const dEmail = (d.email || '').toLowerCase().trim();
    const dCI = (d.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');

    if (dId && targetId && dId === targetId) return true;
    if (dEmail && targetEmail && dEmail === targetEmail) return true;
    if (dCI && targetCI && dCI === targetCI) return true;
    return false;
  });

  if (index >= 0) {
    const existing = current[index];
    current[index] = {
      ...existing,
      ...doctor,
      firmaImg: doctor.firmaImg || existing.firmaImg,
      selloImg: doctor.selloImg || existing.selloImg,
      selloFirma: doctor.selloFirma || existing.selloFirma,
      logoIzq: doctor.logoIzq || existing.logoIzq,
      logoDer: doctor.logoDer || existing.logoDer,
      updatedAt: Date.now(),
    };
  } else {
    current.push({ ...doctor, updatedAt: Date.now() });
  }

  const ok = await writeDoctors(current);
  if (ok) {
    res.json({ success: true, doctor: current[index >= 0 ? index : current.length - 1] });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write doctor' });
  }
});

app.post('/api/doctors/sync', async (req, res) => {
  const { doctors } = req.body;
  if (!Array.isArray(doctors)) {
    return res.status(400).json({ success: false, message: 'Invalid payload: doctors array required' });
  }
  const current = await readDoctors();

  doctors.forEach((incoming: any) => {
    if (!incoming || !incoming.id) return;
    const targetEmail = (incoming.email || '').toLowerCase().trim();
    const targetCI = (incoming.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
    const targetId = (incoming.id || '').toLowerCase().trim();

    const idx = current.findIndex((d: any) => {
      const dId = (d.id || '').toLowerCase().trim();
      const dEmail = (d.email || '').toLowerCase().trim();
      const dCI = (d.ci || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
      if (dId && targetId && dId === targetId) return true;
      if (dEmail && targetEmail && dEmail === targetEmail) return true;
      if (dCI && targetCI && dCI === targetCI) return true;
      return false;
    });

    if (idx >= 0) {
      const existing = current[idx];
      current[idx] = {
        ...existing,
        ...incoming,
        firmaImg: incoming.firmaImg || existing.firmaImg,
        selloImg: incoming.selloImg || existing.selloImg,
        selloFirma: incoming.selloFirma || existing.selloFirma,
        logoIzq: incoming.logoIzq || existing.logoIzq,
        logoDer: incoming.logoDer || existing.logoDer,
      };
    } else {
      current.push(incoming);
    }
  });

  const ok = await writeDoctors(current);
  if (ok) {
    res.json({ success: true, doctors: current });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write doctors' });
  }
});

app.delete('/api/doctors/:id', async (req, res) => {
  const { id } = req.params;
  const current = await readDoctors();
  const filtered = current.filter((d: any) => d.id !== id);
  const ok = await writeDoctors(filtered);
  if (ok) {
    res.json({ success: true, count: filtered.length });
  } else {
    res.status(500).json({ success: false, message: 'Failed to delete doctor' });
  }
});

app.post('/api/doctors/reset-all', async (req, res) => {
  const ok = await writeDoctors([]);
  if (ok) {
    res.json({ success: true, message: 'All doctors cleared from database' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to reset doctors' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, port: 3000, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[DigitalMedic Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
