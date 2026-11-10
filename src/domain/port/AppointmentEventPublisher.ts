import { Appointment } from '../model/Appointment';

export interface AppointmentEventPublisher {
  publishRequested(appointment: Appointment): Promise<void>;
}
