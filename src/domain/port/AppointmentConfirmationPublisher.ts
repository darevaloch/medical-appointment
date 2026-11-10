import { Appointment } from '../model/Appointment';

export interface AppointmentConfirmationPublisher {
  publishConfirmed(appointment: Appointment): Promise<void>;
}
