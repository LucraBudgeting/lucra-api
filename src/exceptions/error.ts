class BaseError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class NotFound extends BaseError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

export class Conflict extends BaseError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

export class Unauthorized extends BaseError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class BadRequest extends BaseError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class Forbidden extends BaseError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}
