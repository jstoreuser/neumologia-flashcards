// Como não usamos um bundler (Vite/Webpack) por padrão no ambiente puro,
// As chaves precisam ser injetadas aqui. 
// Em produção, isso pode ser substituído dinamicamente no pipeline de deploy,
// ou você pode manter as chaves públicas aqui (chaves do Firebase Client são públicas, 
// a segurança real está no firestore.rules e storage.rules).

export const firebaseConfig = {
    apiKey: window.__BARCL_ENV__.FIREBASE_API_KEY,
    authDomain: window.__BARCL_ENV__.FIREBASE_AUTH_DOMAIN,
    projectId: window.__BARCL_ENV__.FIREBASE_PROJECT_ID,
    storageBucket: window.__BARCL_ENV__.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: window.__BARCL_ENV__.FIREBASE_MESSAGING_SENDER_ID,
    appId: window.__BARCL_ENV__.FIREBASE_APP_ID
};
