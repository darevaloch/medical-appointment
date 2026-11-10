import type { Pool } from 'mysql2/promise';
import { MySqlCountryAppointmentRepository } from '../../../../src/infrastructure/adapter/out/MySqlCountryAppointmentRepository';
import { FIXED_ID, FIXED_NOW, buildAppointment } from '../../../helpers/fakes';

describe('MySqlCountryAppointmentRepository', () => {
  it('inserta la cita con parámetros (sin concatenar SQL) y de forma idempotente', async () => {
    const execute = jest.fn().mockResolvedValue([{}, []]);
    const repository = new MySqlCountryAppointmentRepository({ execute } as unknown as Pick<Pool, 'execute'>);

    await repository.save(buildAppointment({ countryISO: 'CL' }));

    const [sql, params] = execute.mock.calls[0];
    expect(sql).toContain('INSERT INTO appointments');
    expect(sql).toContain('ON DUPLICATE KEY UPDATE');
    expect(params).toEqual([FIXED_ID, '00123', 100, 'CL', FIXED_NOW]);
  });

  it('propaga el error de la base para que SQS reintente', async () => {
    const execute = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    const repository = new MySqlCountryAppointmentRepository({ execute } as unknown as Pick<Pool, 'execute'>);

    await expect(repository.save(buildAppointment())).rejects.toThrow('ECONNREFUSED');
  });
});
