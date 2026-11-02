export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Invalid request', details?: unknown) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Paste not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ExpiredError extends AppError {
  constructor(message = 'This paste has expired and is no longer accessible') {
    super(message, 410, 'PASTE_EXPIRED');
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = 'Content payload too large') {
    super(message, 413, 'PAYLOAD_TOO_LARGE');
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable due to capacity limits. Please try again later.') {
    super(message, 503, 'CAPACITY_EXHAUSTED');
  }
}

