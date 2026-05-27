export type AppError = {
  message: string;
  code?: string;
  details?: unknown;
};

export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export type ResourceStatus = 'idle' | 'loading' | 'refreshing' | 'ready' | 'empty' | 'error';
