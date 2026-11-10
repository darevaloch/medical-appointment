import { CreateAppointmentService } from '../../src/application/service/CreateAppointmentService';
import { AppointmentStatus } from '../../src/domain/model/AppointmentStatus';
import { FIXED_ID, FIXED_NOW, mockAppointmentRepository, mockEventPublisher } from '../helpers/fakes';

jest.mock('ulid', () => ({ ulid: () => '01JC0000000000000000000000' }));

describe('CreateAppointmentService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });
  afterEach(() => jest.useRealTimers());

  const setup = () => {
    const repository = mockAppointmentRepository();
    const publisher = mockEventPublisher();
    const useCase = new CreateAppointmentService(repository, publisher);
    return { repository, publisher, useCase };
  };

  it('crea la cita en pending, la guarda y la publica', async () => {
    const { repository, publisher, useCase } = setup();

    const result = await useCase.execute({ insuredId: '00123', scheduleId: 100, countryISO: 'PE' });

    expect(result).toEqual({
      id: FIXED_ID,
      insuredId: '00123',
      scheduleId: 100,
      countryISO: 'PE',
      status: AppointmentStatus.PENDING,
      createdAt: FIXED_NOW.toISOString(),
      updatedAt: FIXED_NOW.toISOString(),
    });
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publishRequested).toHaveBeenCalledWith(repository.save.mock.calls[0][0]);
  });

  it('guarda antes de publicar', async () => {
    const { repository, publisher, useCase } = setup();

    await useCase.execute({ insuredId: '00123', scheduleId: 100, countryISO: 'CL' });

    expect(repository.save.mock.invocationCallOrder[0]).toBeLessThan(
      publisher.publishRequested.mock.invocationCallOrder[0],
    );
  });

  it('no publica si falla el guardado', async () => {
    const { repository, publisher, useCase } = setup();
    repository.save.mockRejectedValueOnce(new Error('dynamo down'));

    await expect(useCase.execute({ insuredId: '00123', scheduleId: 100, countryISO: 'PE' })).rejects.toThrow(
      'dynamo down',
    );
    expect(publisher.publishRequested).not.toHaveBeenCalled();
  });
});
