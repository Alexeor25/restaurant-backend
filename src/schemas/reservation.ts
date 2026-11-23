import { z } from 'zod';
import {
  dateStringSchema,
  futureDateStringSchema,
  numberInRange,
  optionalEmailSchema,
  optionalText,
  requiredText,
} from './common';


export const reservationStatusSchema = z.enum(
  ['pending', 'confirmed', 'cancelled'],
  { error: 'El estado debe ser pending, confirmed o cancelled' }
);

export type ReservationStatus = z.infer<typeof reservationStatusSchema>;

export const createReservationSchema = z.object({
  name: requiredText('El nombre', 200),
  email: optionalEmailSchema,
  phone: requiredText('El teléfono', 30).min(5, 'El teléfono no es válido'),
  date: futureDateStringSchema('La fecha'),
  persons: numberInRange('El número de comensales', 1, 50),
  special: optionalText('La nota especial', 500).default(''),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const updateReservationSchema = z
  .object({
    name: requiredText('El nombre', 200).optional(),
    email: optionalEmailSchema,
    phone: requiredText('El teléfono', 30).min(5, 'El teléfono no es válido').optional(),
    date: dateStringSchema('La fecha').optional(),
    persons: numberInRange('El número de comensales', 1, 50).optional(),
    special: optionalText('La nota especial', 500),
    status: reservationStatusSchema.optional(),
  })
  .refine(
    (data) =>
      Object.values(data).some(
        (value) => value !== undefined && value !== null && value !== ''
      ),
    { message: 'Envía al menos un campo para actualizar' }
  );

export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
