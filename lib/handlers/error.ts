import { NextResponse } from "next/server";
import { RequestError, ValidationError } from "@/lib/http-errors";
import { ZodError } from "zod";

export type ResponseType = "api" | "server";

const formatResponse = (
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined
) => {
  const responseContent = {
    success: false,
    errors: {
      message,
      details: errors,
    },
  };

  return responseType === "api" ? NextResponse.json(responseContent, { status }) : { status, ...responseContent };
};

/**
 * Centralized error handler for API and server errors.
 *
 * Determines the type of error thrown (custom RequestError, ZodError, native Error,
 * or unknown) and returns a standardized formatted response.
 *
 * @param error - Any thrown error (unknown type)
 * @param responseType - Whether the response should be returned as "api" (NextResponse.json)
 *                       or "server" (plain object for internal logic)
 * @returns A formatted response object depending on the error type
 */
const handleError = (error: unknown, responseType: ResponseType = "server") => {
  // Custom app-defined error (RequestError or classes extending it)
  // These errors already contain a statusCode, message, and optional field errors.
  if (error instanceof RequestError) {
    return formatResponse(responseType, error.statusCode, error.message, error.errors);
  }

  // Zod validation error (schema validation failed)
  // Convert ZodError → ValidationError to unify formatting across the app.
  if (error instanceof ZodError) {
    const validationError = new ValidationError(error.flatten().fieldErrors as Record<string, string[]>);
    return formatResponse(responseType, validationError.statusCode, validationError.message, validationError.errors);
  }

  // Standard JavaScript Error (e.g., new Error("Something broke"))
  // Treated as an internal server error → HTTP 500.
  if (error instanceof Error) {
    return formatResponse(responseType, 500, error.message);
  }

  // Unknown thrown value (e.g., throw "oops", throw 123, throw {})
  // Very defensive fallback → treat as unexpected error.
  return formatResponse(responseType, 500, "An unexpected error occurred.");
};

export default handleError;
