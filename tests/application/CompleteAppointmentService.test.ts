import { CompleteAppointmentService } from '../../src/application/service/CompleteAppointmentService';
import { AppointmentStatus } from '../../src/domain/model/AppointmentStatus';
import { FIXED_ID, buildAppointment, mockAppointmentRepository } from '../helpers/fakes';

const COMPLETED_AT = new Date('2026-11-09T10:05:00.000Z');

describe('CompleteAppointmentService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(COMPLETED_AT);
  });
  afterEach(() => jest.useRealTimers());

  it('marca la cita como completed y la guarda', async () => {
    const repository = mockAppointmentRepository();
    repository.findById.mockResolvedValue(buildAppointment());
    const useCase = new CompleteAppointmentService(repository);

    await useCase.execute('00123', FIXED_ID);

    expect(repository.findById).toHaveBeenCalledWith('00123', FIXED_ID);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.status).toBe(AppointmentStatus.COMPLETED);
    expect(saved.updatedAt).toEqual(COMPLETED_AT);
  });

  it('es idempotente ante un mensaje duplicado: no cambia updatedAt', async () => {
    const repository = mockAppointmentRepository();
    const firstCompletion = '2026-11-09T10:01:00.000Z';
    repository.findById.mockResolvedValue(
      buildAppointment({ status: AppointmentStatus.COMPLETED, updatedAt: firstCompletion }),
    );
    const useCase = new CompleteAppointmentService(repository);

    await useCase.execute('00123', FIXED_ID);

    expect(repository.save.mock.calls[0][0].updatedAt.toISOString()).toBe(firstCompletion);
  });

  it('falla si la cita no existe, para que SQS reintente', async () => {
    const repository = mockAppointmentRepository();
    const useCase = new CompleteAppointmentService(repository);

    await expect(useCase.execute('00123', 'no-existe')).rejects.toThrow('No existe la cita no-existe');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
