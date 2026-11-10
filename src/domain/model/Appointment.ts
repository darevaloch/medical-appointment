import { ulid } from 'ulid';
import { AppointmentStatus } from './AppointmentStatus';

export const COUNTRIES = ['PE', 'CL'] as const;
export type CountryISO = (typeof COUNTRIES)[number];

export interface NewAppointment {
  insuredId: string;
  scheduleId: number;
  countryISO: CountryISO;
}

export interface AppointmentPrimitives extends NewAppointment {
  id: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export class Appointment {
  private constructor(
    readonly id: string,
    readonly insuredId: string,
    readonly scheduleId: number,
    readonly countryISO: CountryISO,
    private _status: AppointmentStatus,
    readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create({ insuredId, scheduleId, countryISO }: NewAppointment): Appointment {
    const now = new Date();
    return new Appointment(ulid(), insuredId, scheduleId, countryISO, AppointmentStatus.PENDING, now, now);
  }

  static fromPrimitives(data: AppointmentPrimitives): Appointment {
    return new Appointment(
      data.id,
      data.insuredId,
      data.scheduleId,
      data.countryISO,
      data.status,
      new Date(data.createdAt),
      new Date(data.updatedAt),
    );
  }

  get status(): AppointmentStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  complete(): void {
    if (this._status === AppointmentStatus.COMPLETED) {
      return;
    }
    this._status = AppointmentStatus.COMPLETED;
    this._updatedAt = new Date();
  }

  toPrimitives(): AppointmentPrimitives {
    return {
      id: this.id,
      insuredId: this.insuredId,
      scheduleId: this.scheduleId,
      countryISO: this.countryISO,
      status: this._status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
