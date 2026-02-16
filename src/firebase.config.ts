// Ruta: src/firebase.config.ts

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as admin from 'firebase-admin';

// ==========================================
// CONFIGURACIÓN DE FIREBASE CLIENT SDK
// (Para autenticación de usuarios y Firestore)
// ==========================================
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
};

// Inicializar Firebase Client
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const clientAuth = getAuth(app); // Renombrado para evitar confusión

// ==========================================
// CONFIGURACIÓN DE FIREBASE ADMIN SDK
// (Para verificación de tokens en el backend)
// ==========================================
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(
        /\\n/g,
        '\n',
      ),
    }),
  });
  console.log('✅ Firebase Admin SDK inicializado');
} else {
  console.log('ℹ️ Firebase Admin SDK ya estaba inicializado');
}

// Exportar Firebase Admin Auth (para verificar tokens)
export const auth = admin.auth();

// Exportar admin por si se necesita en otros lugares
export { admin };

// Enable offline persistence
try {
  console.log('✅ Firebase Firestore inicializado con Web SDK');
} catch {
  console.log('ℹ️ Offline persistence no soportado en este entorno');
}
