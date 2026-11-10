export const logError = (message: string, error: unknown, context: Record<string, unknown> = {}): void => {
  console.error(
    JSON.stringify({
      level: 'ERROR',
      message,
      ...context,
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
    }),
  );
};
