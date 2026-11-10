import { httpEvent, sqsEvent } from '../../../helpers/events';

const mockHttp = jest.fn().mockResolvedValue({ statusCode: 200, body: '' });
const mockCompletion = jest.fn().mockResolvedValue({ batchItemFailures: [] });
const mockCountryHandler = jest.fn().mockResolvedValue({ batchItemFailures: [] });
const mockBuildAppointmentHandlers = jest.fn(() => ({ http: mockHttp, completion: mockCompletion }));
const mockBuildCountryHandler = jest.fn(() => mockCountryHandler);

jest.mock('../../../../src/infrastructure/config/appointmentContainer', () => ({ buildAppointmentHandlers: mockBuildAppointmentHandlers }));
jest.mock('../../../../src/infrastructure/config/countryContainer', () => ({ buildCountryHandler: mockBuildCountryHandler }));

import { handler as appointmentHandler } from '../../../../src/infrastructure/adapter/in/lambda/appointment';
import { handler as countryHandler } from '../../../../src/infrastructure/adapter/in/lambda/appointmentCountry';

describe('entrypoint appointment (router)', () => {
  it('rutea SQS → confirmación y API Gateway → HTTP, armando las dependencias una sola vez', async () => {
    const sqs = sqsEvent('{}');
    const http = httpEvent({ httpMethod: 'GET', resource: '/appointments/{insuredId}' });

    await appointmentHandler(sqs);
    await appointmentHandler(http);

    expect(mockCompletion).toHaveBeenCalledWith(sqs);
    expect(mockCompletion).toHaveBeenCalledTimes(1);
    expect(mockHttp).toHaveBeenCalledWith(http);
    expect(mockHttp).toHaveBeenCalledTimes(1);
    expect(mockBuildAppointmentHandlers).toHaveBeenCalledTimes(1);
  });
});

describe('entrypoint de país (appointment_pe / appointment_cl)', () => {
  it('arma su handler una sola vez y lo reutiliza', async () => {
    const event = sqsEvent('{}');

    await countryHandler(event);
    await countryHandler(event);

    expect(mockBuildCountryHandler).toHaveBeenCalledTimes(1);
    expect(mockCountryHandler).toHaveBeenCalledTimes(2);
    expect(mockCountryHandler).toHaveBeenCalledWith(event);
  });
});
