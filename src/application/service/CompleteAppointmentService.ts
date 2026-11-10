import { AppointmentRepository } from '../../domain/port/AppointmentRepository';

export class CompleteAppointmentService {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(insuredId: string, appointmentId: string): Promise<void> {
    const appointment = await this.repository.findById(insuredId, appointmentId);
    if (!appointment) {
      throw new Error(`No existe la cita ${appointmentId}`);
    }

    appointment.complete();
    await this.repository.save(appointment);
  }
}
