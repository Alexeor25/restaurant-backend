import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce
    .number({ error: 'El ID debe ser un número' })
    .pipe(
      z
        .number()
        .int('El ID debe ser un número entero')
        .positive('El ID debe ser mayor que 0')
    ),
});

export type IdParam = z.infer<typeof idParamSchema>;


export const requiredText = (label: string, max: number) =>
  z
    .string({ error: `${label} es obligatorio` })
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(max, `${label} no puede superar ${max} caracteres`);


export const optionalText = (label: string, max: number) =>
  z
    .string({ error: `${label} debe ser texto` })
    .trim()
    .max(max, `${label} no puede superar ${max} caracteres`)
    .optional();


export const numberInRange = (
  label: string,
  min: number,
  max: number
) =>
  z.coerce
    .number({ error: `${label} debe ser un número` })
    .pipe(
      z
        .number()
        .int(`${label} debe ser un número entero`)
        .min(min, `${label} debe ser mayor o igual a ${min}`)
        .max(max, `${label} debe ser menor o igual a ${max}`)
    );


export const emailSchema = z
  .string({ error: 'El email es obligatorio' })
  .trim()
  .toLowerCase()
  .pipe(z.email('El email no es válido'));


export const optionalEmailSchema = z
  .string({ error: 'El email debe ser texto' })
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value ? value.toLowerCase() : null))
  .refine((value) => value === null || z.email().safeParse(value).success, {
    message: 'El email no es válido',
  });


const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

const pad = (value: number) => String(value).padStart(2, '0');

const todayLocal = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};


const dateParts = (value: string) => {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = match[4] === undefined ? null : Number(match[4]);
  const minute = match[5] === undefined ? null : Number(match[5]);
  const second = match[6] === undefined ? null : Number(match[6]);

  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  if (hour !== null && (hour > 23 || (minute ?? 0) > 59 || (second ?? 0) > 59)) {
    return null;
  }

  return { year, month, day };
};


export const isPastDate = (value: string) => {
  const parts = dateParts(value);
  if (!parts) return false;
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}` < todayLocal();
};


export const dateStringSchema = (label = 'La fecha') =>
  z
    .string({ error: `${label} es obligatoria` })
    .trim()
    .min(1, `${label} es obligatoria`)
    .refine(
      (value) => dateParts(value) !== null,
      `${label} no es válida (formato esperado: AAAA-MM-DD)`
    );


export const futureDateStringSchema = (label = 'La fecha') =>
  dateStringSchema(label).refine(
    (value) => !isPastDate(value),
    `${label} no puede ser pasada`
  );
