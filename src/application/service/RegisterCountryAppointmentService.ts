import { Appointment, AppointmentPrimitives } from '../../domain/model/Appointment';
import { AppointmentConfirmationPublisher } from '../../domain/port/AppointmentConfirmationPublisher';
import { CountryAppointmentRepository } from '../../domain/port/CountryAppointmentRepository';

export class RegisterCountryAppointmentService {
  constructor(
    private readonly repository: CountryAppointmentRepository,
    private readonly confirmationPublisher: AppointmentConfirmationPublisher,
  ) {}

  async execute(input: AppointmentPrimitives): Promise<void> {
    const appointment = Appointment.fromPrimitives(input);

    await this.repository.save(appointment);
    await this.confirmationPublisher.publishConfirmed(appointment);
  }
}
