import type { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda';
import { logError } from '../shared/logger';

export const processBatch = async (
  event: SQSEvent,
  processRecord: (record: SQSRecord) => Promise<void>,
): Promise<SQSBatchResponse> => {
  const results = await Promise.allSettled(event.Records.map((record) => processRecord(record)));

  const batchItemFailures = results.flatMap((result, index) => {
    if (result.status === 'fulfilled') return [];
    const { messageId } = event.Records[index];
    logError('Falló el procesamiento de un mensaje SQS', result.reason, { messageId });
    return [{ itemIdentifier: messageId }];
  });

  return { batchItemFailures };
};
