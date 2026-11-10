import { z } from 'zod';
import { COUNTRIES } from '../../../../domain/model/Appointment';

const insuredIdSchema = z.string().regex(/^\d{5}$/, 'debe tener 5 dígitos');

export const createAppointmentBodySchema = z.object({
  insuredId: insuredIdSchema,
  scheduleId: z.number().int().positive(),
  countryISO: z.enum(COUNTRIES),
});

export const insuredPathSchema = z.object({
  insuredId: insuredIdSchema,
});
