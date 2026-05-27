/**
 * Telemetry Service
 * Wraps Sentry/Firebase Analytics and implements strict PII scrubbing.
 */

interface ErrorEvent {
  message: string;
  extra?: Record<string, unknown>;
  userContext?: { email?: string; uid?: string };
}

/**
 * Scrubs Protected Health Information (PHI) and PII from telemetry events.
 */
function scrubPII(event: ErrorEvent): ErrorEvent {
  const scrubbedEvent = { ...event };
  
  // NUNCA enviar email de usuário
  if (scrubbedEvent.userContext?.email) {
    delete scrubbedEvent.userContext.email;
  }

  // Sanitizar payloads extras que podem conter histórico médico
  if (scrubbedEvent.extra) {
    const extra = scrubbedEvent.extra;
    // Omit sensitive flashcard answers or raw user inputs
    if (extra['answer'] !== undefined) extra['answer'] = '[REDACTED]';
    if (extra['rawHtml'] !== undefined) extra['rawHtml'] = '[REDACTED]';
  }

  return scrubbedEvent;
}

export const telemetry = {
  /**
   * Inicializa rastreadores de erro global
   */
  init() {
    window.addEventListener('error', (e) => {
      this.captureError(e.error || new Error(e.message));
    });
    window.addEventListener('unhandledrejection', (e) => {
      this.captureError(e.reason);
    });
  },

  captureError(error: Error | unknown, extraContext?: Record<string, unknown>) {
    const rawEvent: ErrorEvent = {
      message: error instanceof Error ? error.message : String(error),
      ...(extraContext !== undefined && { extra: extraContext }),
    };
    
    // Scrub before sending to external service
    const safeEvent = scrubPII(rawEvent);
    
    // Fake Sentry capture (Replace with Sentry.captureException in real impl)
    if (import.meta.env?.MODE !== 'test') {
      console.error('[TELEMETRY SENT]', safeEvent);
    }
  },
  
  trackMetric(name: string, value: number) {
    // Fake Performance Monitoring hook
    // Firebase Performance: trace(name).recordMetric('value', value)
    if (import.meta.env?.MODE !== 'test') {
      console.log(`[METRIC] ${name}: ${value}`);
    }
  }
};
