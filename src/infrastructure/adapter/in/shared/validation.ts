import { ZodType } from 'zod';

export class InvalidRequestError extends Error {
  readonly code = 'INVALID_REQUEST';

  constructor(
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = 'InvalidRequestError';
  }
}

export const parseJson = (raw: string | null | undefined): unknown => {
  try {
    return JSON.parse(raw ?? '');
  } catch {
    throw new InvalidRequestError('El body no es un JSON válido');
  }
};

export const parseWith = <T>(schema: ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new InvalidRequestError(
      'El request no tiene el formato esperado',
      result.error.issues.map((issue) => `${issue.path.join('.') || '(raíz)'}: ${issue.message}`),
    );
  }
  return result.data;
};
