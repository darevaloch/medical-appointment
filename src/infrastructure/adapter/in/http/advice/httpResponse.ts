import type { APIGatewayProxyResult } from 'aws-lambda';
import { logError } from '../../shared/logger';
import { InvalidRequestError } from '../../shared/validation';

export const jsonResponse = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(body),
});

export const errorResponse = (error: unknown): APIGatewayProxyResult => {
  if (error instanceof InvalidRequestError) {
    return jsonResponse(400, { code: error.code, message: error.message, details: error.details });
  }

  logError('Error no controlado en HTTP', error);
  return jsonResponse(500, { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado' });
};
