import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const PROJECT_ID = 'barcl-6e65e';
const APP_NAME = 'barcl-web';

console.log("=== INICIANDO PROVISIONAMENTO FIREBASE ===");

try {
    // 1. Configura o projeto ativo
    console.log(`[1/3] Vinculando ao projeto ${PROJECT_ID}...`);
    execSync(`npx firebase use ${PROJECT_ID}`, { stdio: 'inherit' });

    // 2. Extraindo a configuração do SDK WEB
    console.log(`[2/3] Baixando a configuração do App Web...`);
    
    let sdkConfigStr;
    try {
        // Tenta pegar a configuração do app existente
        const configOutput = execSync('npx firebase apps:sdkconfig WEB --json', { encoding: 'utf8' });
        sdkConfigStr = configOutput;
    } catch (e) {
        console.log(`Aviso: App não encontrado. O Administrador precisa rodar: npx firebase apps:create WEB ${APP_NAME}`);
        console.log(`Por favor, acesse o painel ou rode o comando de criação e tente npm run provision novamente.`);
        process.exit(1);
    }

    // 3. Parse da configuração e geração do .env.local
    console.log(`[3/3] Gerando .env.local...`);
    const sdkData = JSON.parse(sdkConfigStr);
    const config = sdkData.result.sdkConfig;

    const envContent = `FIREBASE_API_KEY=${config.apiKey}
FIREBASE_AUTH_DOMAIN=${config.authDomain}
FIREBASE_PROJECT_ID=${config.projectId}
FIREBASE_STORAGE_BUCKET=${config.storageBucket}
FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}
FIREBASE_APP_ID=${config.appId}
`;

    fs.writeFileSync(path.join(rootDir, '.env.local'), envContent);
    console.log("[Sucesso] .env.local criado e populado automaticamente!");
    
    // Roda a geração do runtime environment automaticamente
    console.log("-> Executando generate-env...");
    execSync('npm run generate-env', { stdio: 'inherit' });
    
    console.log("=== PROVISIONAMENTO CONCLUÍDO ===");
} catch (error) {
    console.error("Erro durante o provisionamento:", error.message);
    process.exit(1);
}
