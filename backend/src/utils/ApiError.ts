export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message: string = 'Bad Request', details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }
  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }
  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }
  static notFound(message: string = 'Not Found'): ApiError {
    return new ApiError(404, message);
  }
  static conflict(message: string = 'Conflict'): ApiError {
    return new ApiError(409, message);
  }
  static internal(message: string = 'Internal Server Error'): ApiError {
    return new ApiError(500, message);
  }
}
