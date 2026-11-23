
export const pgErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
};

export const isPgError = (error: unknown, code: string): boolean =>
  pgErrorCode(error) === code;
