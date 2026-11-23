import { z } from 'zod';
import { numberInRange, requiredText } from './common';


export const createProductSchema = z.object({
  category_id: numberInRange('La categoría', 1, Number.MAX_SAFE_INTEGER),
  nombre: requiredText('El nombre', 200),
  precio: z.coerce
    .number({ error: 'El precio debe ser un número' })
    .pipe(
      z
        .number()
        .int('El precio debe ser un número entero (la columna es INTEGER)')
        .min(0, 'El precio no puede ser negativo')
    ),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

/** PUT /api/admin/v1/menu/:id  */
export const updateProductSchema = createProductSchema
  .partial()
  .refine(
    (data) =>
      Object.values(data).some((value) => value !== undefined && value !== null),
    { message: 'Envía al menos un campo para actualizar' }
  );

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
