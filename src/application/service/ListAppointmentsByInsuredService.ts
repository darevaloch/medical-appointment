import { AppointmentPrimitives } from '../../domain/model/Appointment';
import { AppointmentRepository } from '../../domain/port/AppointmentRepository';

export class ListAppointmentsByInsuredService {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(insuredId: string): Promise<AppointmentPrimitives[]> {
    const appointments = await this.repository.findByInsuredId(insuredId);
    return appointments.map((appointment) => appointment.toPrimitives());
  }
}
