import { makeCompleteAppointmentSqsHandler } from '../../../../src/infrastructure/adapter/in/sqs/completeAppointmentSqsHandler';
import { makeCountryAppointmentSqsHandler } from '../../../../src/infrastructure/adapter/in/sqs/countryAppointmentSqsHandler';
import { processBatch } from '../../../../src/infrastructure/adapter/in/sqs/processBatch';
import { buildPrimitives } from '../../../helpers/fakes';
import { sqsEvent } from '../../../helpers/events';

beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => undefined));

describe('processBatch', () => {
  it('reporta solo los mensajes que fallaron', async () => {
    const event = sqsEvent('ok', 'falla', 'ok');

    const result = await processBatch(event, async (record) => {
      if (record.body === 'falla') throw new Error('boom');
    });

    expect(result).toEqual({ batchItemFailures: [{ itemIdentifier: 'msg-2' }] });
  });

  it('registra también rechazos que no son Error', async () => {
    const result = await processBatch(sqsEvent('x'), () => Promise.reject('texto'));

    expect(result.batchItemFailures).toHaveLength(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('"error":"texto"'));
  });

  it('devuelve lista vacía si todo salió bien', async () => {
    await expect(processBatch(sqsEvent('a', 'b'), async () => undefined)).resolves.toEqual({ batchItemFailures: [] });
  });
});

describe('country SQS handler (appointment_pe / appointment_cl)', () => {
  it('parsea el mensaje de SNS y ejecuta el caso de uso', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue(undefined) };
    const handler = makeCountryAppointmentSqsHandler(useCase);

    const result = await handler(sqsEvent(JSON.stringify(buildPrimitives({ countryISO: 'CL' }))));

    expect(useCase.execute).toHaveBeenCalledWith(buildPrimitives({ countryISO: 'CL' }));
    expect(result.batchItemFailures).toEqual([]);
  });

  it('marca como fallido un mensaje mal formado sin llamar al caso de uso', async () => {
    const useCase = { execute: jest.fn() };
    const handler = makeCountryAppointmentSqsHandler(useCase);

    const result = await handler(sqsEvent(JSON.stringify({ id: 'x', status: 'otro' })));

    expect(useCase.execute).not.toHaveBeenCalled();
    expect(result.batchItemFailures).toEqual([{ itemIdentifier: 'msg-1' }]);
  });
});

describe('completion SQS handler (appointment, paso 6)', () => {
  it('extrae insuredId e id del "detail" del evento de EventBridge', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue(undefined) };
    const handler = makeCompleteAppointmentSqsHandler(useCase);
    const eventBridgeEnvelope = {
      version: '0',
      source: 'rimac.appointment',
      'detail-type': 'AppointmentConfirmed',
      detail: buildPrimitives(),
    };

    const result = await handler(sqsEvent(JSON.stringify(eventBridgeEnvelope)));

    expect(useCase.execute).toHaveBeenCalledWith('00123', buildPrimitives().id);
    expect(result.batchItemFailures).toEqual([]);
  });

  it('marca como fallido un evento sin detail', async () => {
    const useCase = { execute: jest.fn() };
    const handler = makeCompleteAppointmentSqsHandler(useCase);

    const result = await handler(sqsEvent(JSON.stringify({ source: 'otro' })));

    expect(result.batchItemFailures).toEqual([{ itemIdentifier: 'msg-1' }]);
  });
});
