// Base class for all custom HTTP-related errors.
// Extends the native Error class and adds a statusCode and optional field-level errors.
export class RequestError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(statusCode: number, message: string, errors?: Record<string, string[]>) {
    super(message); // Pass the error message to the native Error constructor

    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "RequestError"; // Set a clear error name for debugging and logging
  }
}

// Error class specifically for validation failures.
// Automatically formats field errors into a readable message.
export class ValidationError extends RequestError {
  constructor(fieldErrors: Record<string, string[]>) {
    const message = ValidationError.formatfieldErrors(fieldErrors);
    super(400, message, fieldErrors); // Always HTTP 400 for validation issues
    this.name = "ValidationError";
    this.errors = fieldErrors;
  }

  // Converts fieldErrors into human-friendly strings (e.g., "Email is required").
  static formatfieldErrors(errors: Record<string, string[]>): string {
    const formattedMessages = Object.entries(errors)?.map(([field, messages]) => {
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1); // Capitalize field name

      if (messages[0] === "Required") {
        return `${fieldName} is required`;
      } else {
        return messages.join(" and ");
      }
    });

    return formattedMessages.join(",");
  }
}

// Error for when a requested resource does not exist (HTTP 404).
export class NotFoundError extends RequestError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

// Error for forbidden access attempts (HTTP 403).
export class ForbiddenError extends RequestError {
  constructor(message: string = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

// Error for missing or invalid authentication (HTTP 401).
export class UnauthorizedError extends RequestError {
  constructor(message: string = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}
