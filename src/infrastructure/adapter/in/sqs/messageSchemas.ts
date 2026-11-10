import { z } from 'zod';
import { COUNTRIES } from '../../../../domain/model/Appointment';
import { AppointmentStatus } from '../../../../domain/model/AppointmentStatus';

export const appointmentMessageSchema = z.object({
  id: z.string(),
  insuredId: z.string(),
  scheduleId: z.number(),
  countryISO: z.enum(COUNTRIES),
  status: z.nativeEnum(AppointmentStatus),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const confirmationEventSchema = z.object({
  detail: appointmentMessageSchema,
});
