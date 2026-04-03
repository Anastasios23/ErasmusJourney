export class ErasmusExperienceHttpError extends Error {
  statusCode: number;
  body: Record<string, unknown>;

  constructor(
    statusCode: number,
    body: Record<string, unknown>,
    message?: string,
  ) {
    super(
      message ||
        (typeof body.error === "string"
          ? body.error
          : "Erasmus experience request failed"),
    );
    this.name = "ErasmusExperienceHttpError";
    this.statusCode = statusCode;
    this.body = body;
  }
}

export function isErasmusExperienceHttpError(
  error: unknown,
): error is ErasmusExperienceHttpError {
  return error instanceof ErasmusExperienceHttpError;
}

export class Step1ValidationError extends ErasmusExperienceHttpError {
  validationCode:
    | "MISSING_HOME_UNIVERSITY_CODE"
    | "INVALID_HOME_UNIVERSITY_CODE";

  constructor(
    statusCode: number,
    validationCode:
      | "MISSING_HOME_UNIVERSITY_CODE"
      | "INVALID_HOME_UNIVERSITY_CODE",
    message: string,
  ) {
    super(
      statusCode,
      {
        error: "Basic information validation failed",
        code: validationCode,
        message,
      },
      message,
    );
    this.name = "Step1ValidationError";
    this.validationCode = validationCode;
  }
}
