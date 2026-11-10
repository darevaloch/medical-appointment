import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SNSClient } from '@aws-sdk/client-sns';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { CompleteAppointmentService } from '../../application/service/CompleteAppointmentService';
import { CreateAppointmentService } from '../../application/service/CreateAppointmentService';
import { ListAppointmentsByInsuredService } from '../../application/service/ListAppointmentsByInsuredService';
import { makeAppointmentHttpHandler } from '../adapter/in/http/appointmentHttpHandler';
import { makeCompleteAppointmentSqsHandler } from '../adapter/in/sqs/completeAppointmentSqsHandler';
import { DynamoAppointmentRepository } from '../adapter/out/DynamoAppointmentRepository';
import { SnsAppointmentEventPublisher } from '../adapter/out/SnsAppointmentEventPublisher';
import { requireEnv } from './env';

export interface AppointmentHandlers {
  http: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
  completion: (event: SQSEvent) => Promise<SQSBatchResponse>;
}

export const buildAppointmentHandlers = (): AppointmentHandlers => {
  const repository = new DynamoAppointmentRepository(
    DynamoDBDocumentClient.from(new DynamoDBClient({})),
    requireEnv('APPOINTMENTS_TABLE'),
  );
  const publisher = new SnsAppointmentEventPublisher(new SNSClient({}), requireEnv('APPOINTMENTS_TOPIC_ARN'));

  return {
    http: makeAppointmentHttpHandler({
      create: new CreateAppointmentService(repository, publisher),
      list: new ListAppointmentsByInsuredService(repository),
    }),
    completion: makeCompleteAppointmentSqsHandler(new CompleteAppointmentService(repository)),
  };
};
