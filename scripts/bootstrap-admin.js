import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Você precisará do firebase-adminsdk service account JSON localmente para este script funcionar contra prod
// Se não tiver, ele tentará usar o default credentials (funciona se logado via gcloud ou no emulador)
try {
    initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'barcl-6e65e'
    });
} catch (e) {
    console.log("Erro inicializando o admin app. Você está rodando o Firebase Emulators ou tem ADC configurado?");
    console.error(e);
    process.exit(1);
}

const auth = getAuth();
const db = getFirestore();

async function bootstrapAdmin() {
    const email = process.argv[2];
    if (!email) {
        console.error("ERRO: Forneça um e-mail. Ex: npm run bootstrap-admin admin@barcl.com");
        process.exit(1);
    }

    try {
        console.log(`Buscando usuário por e-mail: ${email}...`);
        const userRecord = await auth.getUserByEmail(email);
        
        console.log(`Aplicando Custom Claim de Admin ao UID: ${userRecord.uid}`);
        await auth.setCustomUserClaims(userRecord.uid, { admin: true });
        
        console.log(`Atualizando documento no Firestore...`);
        await db.collection('users').doc(userRecord.uid).set({
            role: 'admin',
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log("=== SUCESSO ===");
        console.log(`O usuário ${email} agora é um administrador do BARCL.`);
        console.log("Force o usuário a fazer logout e login novamente para atualizar o token JWT no navegador.");
    } catch (error) {
        console.error("Erro durante o bootstrap:", error);
    }
}

bootstrapAdmin();
