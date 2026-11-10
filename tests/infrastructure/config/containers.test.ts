import { buildAppointmentHandlers } from '../../../src/infrastructure/config/appointmentContainer';
import { buildCountryHandler } from '../../../src/infrastructure/config/countryContainer';
import { requireEnv } from '../../../src/infrastructure/config/env';

const ORIGINAL_ENV = process.env;

describe('composition roots', () => {
  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      AWS_REGION: 'us-east-1',
      APPOINTMENTS_TABLE: 'appointments',
      APPOINTMENTS_TOPIC_ARN: 'arn:aws:sns:us-east-1:000000000000:appointments',
      DB_HOST: 'localhost',
      DB_USER: 'user',
      DB_PASSWORD: 'secret',
      DB_NAME: 'appointments_pe',
      EVENT_BUS_NAME: 'bus',
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('requireEnv falla con un mensaje claro si falta la variable', () => {
    delete process.env.APPOINTMENTS_TABLE;

    expect(() => requireEnv('APPOINTMENTS_TABLE')).toThrow('Falta la variable de entorno APPOINTMENTS_TABLE');
    expect(() => buildAppointmentHandlers()).toThrow('APPOINTMENTS_TABLE');
  });

  it('buildAppointmentHandlers arma los handlers HTTP y de confirmación', () => {
    const handlers = buildAppointmentHandlers();

    expect(typeof handlers.http).toBe('function');
    expect(typeof handlers.completion).toBe('function');
  });

  it('buildCountryHandler arma el handler de país (el pool no conecta hasta la primera query)', () => {
    process.env.DB_PORT = '3307';

    expect(typeof buildCountryHandler()).toBe('function');
  });

  it('buildCountryHandler usa el puerto 3306 por defecto y falla si falta la conexión', () => {
    delete process.env.DB_PORT;
    expect(typeof buildCountryHandler()).toBe('function');

    delete process.env.DB_HOST;
    expect(() => buildCountryHandler()).toThrow('DB_HOST');
  });
});
