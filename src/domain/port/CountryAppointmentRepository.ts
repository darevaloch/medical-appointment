import { Appointment } from '../model/Appointment';

export interface CountryAppointmentRepository {
  save(appointment: Appointment): Promise<void>;
}
