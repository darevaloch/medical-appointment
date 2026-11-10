import { Appointment, AppointmentPrimitives, NewAppointment } from '../../domain/model/Appointment';
import { AppointmentEventPublisher } from '../../domain/port/AppointmentEventPublisher';
import { AppointmentRepository } from '../../domain/port/AppointmentRepository';

export class CreateAppointmentService {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly publisher: AppointmentEventPublisher,
  ) {}

  async execute(input: NewAppointment): Promise<AppointmentPrimitives> {
    const appointment = Appointment.create(input);

    await this.repository.save(appointment);
    await this.publisher.publishRequested(appointment);

    return appointment.toPrimitives();
  }
}
