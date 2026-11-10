import { Appointment } from '../../src/domain/model/Appointment';
import { AppointmentStatus } from '../../src/domain/model/AppointmentStatus';

jest.mock('ulid', () => ({ ulid: () => '01JC0000000000000000000000' }));

const CREATED_AT = new Date('2026-11-09T10:00:00.000Z');
const COMPLETED_AT = new Date('2026-11-09T10:05:00.000Z');

const buildPending = () => {
  jest.setSystemTime(CREATED_AT);
  return Appointment.create({ insuredId: '00123', scheduleId: 100, countryISO: 'PE' });
};

describe('Appointment', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('nace en pending con un id ULID y createdAt = updatedAt', () => {
    const appointment = buildPending();

    expect(appointment.id).toBe('01JC0000000000000000000000');
    expect(appointment.status).toBe(AppointmentStatus.PENDING);
    expect(appointment.createdAt).toEqual(CREATED_AT);
    expect(appointment.updatedAt).toEqual(CREATED_AT);
  });

  it('complete() pasa a completed y actualiza updatedAt', () => {
    const appointment = buildPending();
    jest.setSystemTime(COMPLETED_AT);

    appointment.complete();

    expect(appointment.status).toBe(AppointmentStatus.COMPLETED);
    expect(appointment.updatedAt).toEqual(COMPLETED_AT);
    expect(appointment.createdAt).toEqual(CREATED_AT);
  });

  it('complete() es idempotente: un segundo llamado no cambia updatedAt', () => {
    const appointment = buildPending();
    jest.setSystemTime(COMPLETED_AT);
    appointment.complete();

    jest.setSystemTime(new Date('2026-11-09T11:00:00.000Z'));
    appointment.complete();

    expect(appointment.status).toBe(AppointmentStatus.COMPLETED);
    expect(appointment.updatedAt).toEqual(COMPLETED_AT);
  });

  it('toPrimitives / fromPrimitives son simétricos', () => {
    const appointment = buildPending();
    jest.setSystemTime(COMPLETED_AT);
    appointment.complete();

    const primitives = appointment.toPrimitives();

    expect(primitives).toEqual({
      id: '01JC0000000000000000000000',
      insuredId: '00123',
      scheduleId: 100,
      countryISO: 'PE',
      status: 'completed',
      createdAt: '2026-11-09T10:00:00.000Z',
      updatedAt: '2026-11-09T10:05:00.000Z',
    });
    expect(Appointment.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
  });
});
