import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, connectStorageEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { firebaseConfig } from "./firebase.config.js";

// Inicializa o app
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Habilitar Cache Offline Nativo do Firestore
import { enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Múltiplas abas abertas. Persistência offline habilitada apenas na primeira.');
    } else if (err.code == 'unimplemented') {
        console.warn('O navegador atual não suporta persistência offline do Firestore.');
    }
});

// Configuração para uso do Emulator Suite localmente
// Para usar o ambiente de produção, comente este bloco ou envolva em uma condicional de ambiente
const USE_EMULATOR = false; // Mude para true para testar localmente

if (USE_EMULATOR) {
    console.log("Conectando aos emuladores locais do Firebase...");
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
}

export { auth, db, storage };
