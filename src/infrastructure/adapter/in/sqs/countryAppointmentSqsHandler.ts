import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { RegisterCountryAppointmentService } from '../../../../application/service/RegisterCountryAppointmentService';
import { parseJson, parseWith } from '../shared/validation';
import { appointmentMessageSchema } from './messageSchemas';
import { processBatch } from './processBatch';

export const makeCountryAppointmentSqsHandler =
  (useCase: Pick<RegisterCountryAppointmentService, 'execute'>) =>
  (event: SQSEvent): Promise<SQSBatchResponse> =>
    processBatch(event, async (record) => {
      const appointment = parseWith(appointmentMessageSchema, parseJson(record.body));
      await useCase.execute(appointment);
    });
