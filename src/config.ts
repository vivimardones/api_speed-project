import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env antes que cualquier otra cosa
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const loadEnv = () => {
  return {
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    port: parseInt(process.env.PORT || '3000', 10),
  };
};
