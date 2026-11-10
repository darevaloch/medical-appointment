import { Appointment } from '../model/Appointment';

export interface AppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  findById(insuredId: string, id: string): Promise<Appointment | null>;
  findByInsuredId(insuredId: string): Promise<Appointment[]>;
}
