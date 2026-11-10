import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { CompleteAppointmentService } from '../../../../application/service/CompleteAppointmentService';
import { parseJson, parseWith } from '../shared/validation';
import { confirmationEventSchema } from './messageSchemas';
import { processBatch } from './processBatch';

export const makeCompleteAppointmentSqsHandler =
  (useCase: Pick<CompleteAppointmentService, 'execute'>) =>
  (event: SQSEvent): Promise<SQSBatchResponse> =>
    processBatch(event, async (record) => {
      const { detail } = parseWith(confirmationEventSchema, parseJson(record.body));
      await useCase.execute(detail.insuredId, detail.id);
    });
