import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { createPool } from 'mysql2/promise';
import { RegisterCountryAppointmentService } from '../../application/service/RegisterCountryAppointmentService';
import { makeCountryAppointmentSqsHandler } from '../adapter/in/sqs/countryAppointmentSqsHandler';
import { EventBridgeConfirmationPublisher } from '../adapter/out/EventBridgeConfirmationPublisher';
import { MySqlCountryAppointmentRepository } from '../adapter/out/MySqlCountryAppointmentRepository';
import { requireEnv } from './env';

export const buildCountryHandler = (): ((event: SQSEvent) => Promise<SQSBatchResponse>) => {
  const pool = createPool({
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 3306),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),
    timezone: 'Z',
    connectionLimit: 2,
    enableKeepAlive: true,
  });

  const service = new RegisterCountryAppointmentService(
    new MySqlCountryAppointmentRepository(pool),
    new EventBridgeConfirmationPublisher(new EventBridgeClient({}), requireEnv('EVENT_BUS_NAME')),
  );

  return makeCountryAppointmentSqsHandler(service);
};
