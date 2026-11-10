import type { APIGatewayProxyEvent, APIGatewayProxyResult, SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { AppointmentHandlers, buildAppointmentHandlers } from '../../../config/appointmentContainer';

let handlers: AppointmentHandlers | undefined;
const getHandlers = (): AppointmentHandlers => (handlers ??= buildAppointmentHandlers());

const isSqsEvent = (event: APIGatewayProxyEvent | SQSEvent): event is SQSEvent =>
  Array.isArray((event as SQSEvent).Records);

export async function handler(event: SQSEvent): Promise<SQSBatchResponse>;
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
export async function handler(
  event: APIGatewayProxyEvent | SQSEvent,
): Promise<APIGatewayProxyResult | SQSBatchResponse> {
  const { http, completion } = getHandlers();
  return isSqsEvent(event) ? completion(event) : http(event);
}
