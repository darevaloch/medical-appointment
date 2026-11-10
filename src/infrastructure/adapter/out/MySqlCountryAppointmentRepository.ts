import type { Pool } from 'mysql2/promise';
import { CountryAppointmentRepository } from '../../../domain/port/CountryAppointmentRepository';
import { Appointment } from '../../../domain/model/Appointment';

const INSERT_APPOINTMENT = `
  INSERT INTO appointments (appointment_id, insured_id, schedule_id, country_iso, requested_at)
  VALUES (?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE appointment_id = appointment_id`;

export class MySqlCountryAppointmentRepository implements CountryAppointmentRepository {
  constructor(private readonly pool: Pick<Pool, 'execute'>) {}

  async save(appointment: Appointment): Promise<void> {
    await this.pool.execute(INSERT_APPOINTMENT, [
      appointment.id,
      appointment.insuredId,
      appointment.scheduleId,
      appointment.countryISO,
      appointment.createdAt,
    ]);
  }
}
