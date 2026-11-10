import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { buildCountryHandler } from '../../../config/countryContainer';

let countryHandler: ((event: SQSEvent) => Promise<SQSBatchResponse>) | undefined;

export const handler = (event: SQSEvent): Promise<SQSBatchResponse> => (countryHandler ??= buildCountryHandler())(event);
