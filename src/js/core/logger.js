// Global Logger (Production/Development)

const IS_DEV = true; // Poderia vir do window.__BARCL_ENV__

export const Logger = {
    info: (context, message, data = null) => {
        if (!IS_DEV) return;
        console.log(`[INFO] [${context}] ${message}`, data || '');
    },
    warn: (context, message, data = null) => {
        console.warn(`[WARN] [${context}] ${message}`, data || '');
    },
    error: (context, message, error = null) => {
        console.error(`[ERROR] [${context}] ${message}`, error || '');
        // Integração futura com Sentry ou Cloud Logging entraria aqui
    }
};
