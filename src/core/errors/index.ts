/**
 * Base class for all domain errors.
 */
export class AppError extends Error {
  override message: string;

  constructor(
    message: string,
    public readonly code: string,
    public readonly isOperational: boolean = true,
  ) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    const captureStackTrace = (Error as unknown as Record<string, unknown>)['captureStackTrace'];
    if (typeof captureStackTrace === 'function') {
      captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'validation_error');
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'auth_error');
  }
}

export class PermissionError extends AppError {
  constructor(message: string = 'No tienes permiso para realizar esta acción.') {
    super(message, 'permission_error');
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Error de conexión. Verifica tu internet.') {
    super(message, 'network_error');
  }
}

export class RepositoryError extends AppError {
  constructor(message: string) {
    super(message, 'repository_error');
  }
}

export class DomainError extends AppError {
  constructor(message: string) {
    super(message, 'domain_error');
  }
}
