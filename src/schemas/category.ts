import { z } from 'zod';
import { numberInRange, requiredText } from './common';


export const createCategorySchema = z.object({
  nombre: requiredText('El nombre', 100),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z
  .object({
    nombre: requiredText('El nombre', 100).optional(),
    orden: numberInRange('El orden', 0, 9999).optional(),
  })
  .refine(
    (data) =>
      Object.values(data).some(
        (value) => value !== undefined && value !== null
      ),
    { message: 'Envía al menos un campo para actualizar' }
  );

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
