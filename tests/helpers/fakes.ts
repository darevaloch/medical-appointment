import { AppointmentConfirmationPublisher } from '../../src/domain/port/AppointmentConfirmationPublisher';
import { AppointmentEventPublisher } from '../../src/domain/port/AppointmentEventPublisher';
import { AppointmentRepository } from '../../src/domain/port/AppointmentRepository';
import { CountryAppointmentRepository } from '../../src/domain/port/CountryAppointmentRepository';
import { Appointment, AppointmentPrimitives } from '../../src/domain/model/Appointment';
import { AppointmentStatus } from '../../src/domain/model/AppointmentStatus';

export const FIXED_NOW = new Date('2026-11-09T10:00:00.000Z');
export const FIXED_ID = '01JC0000000000000000000000';

export const buildPrimitives = (overrides: Partial<AppointmentPrimitives> = {}): AppointmentPrimitives => ({
  id: FIXED_ID,
  insuredId: '00123',
  scheduleId: 100,
  countryISO: 'PE',
  status: AppointmentStatus.PENDING,
  createdAt: FIXED_NOW.toISOString(),
  updatedAt: FIXED_NOW.toISOString(),
  ...overrides,
});

export const buildAppointment = (overrides: Partial<AppointmentPrimitives> = {}): Appointment =>
  Appointment.fromPrimitives(buildPrimitives(overrides));

export const mockAppointmentRepository = (): jest.Mocked<AppointmentRepository> => ({
  save: jest.fn().mockResolvedValue(undefined),
  findById: jest.fn().mockResolvedValue(null),
  findByInsuredId: jest.fn().mockResolvedValue([]),
});

export const mockEventPublisher = (): jest.Mocked<AppointmentEventPublisher> => ({
  publishRequested: jest.fn().mockResolvedValue(undefined),
});

export const mockConfirmationPublisher = (): jest.Mocked<AppointmentConfirmationPublisher> => ({
  publishConfirmed: jest.fn().mockResolvedValue(undefined),
});

export const mockCountryRepository = (): jest.Mocked<CountryAppointmentRepository> => ({
  save: jest.fn().mockResolvedValue(undefined),
});
