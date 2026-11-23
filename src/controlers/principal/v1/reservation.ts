import type { Request, Response } from 'express';
import { db } from '../../../config/db';
import type { CreateReservationInput } from '../../../schemas/reservation';

/**
 * POST /api/principal/v1/reservation
 *
 * Los datos ya llegan validados y normalizados por `createReservationSchema`
 * (middleware `validate`): nombre recortado, email en minúsculas o null,
 * comensales como número entero y fecha en formato AAAA-MM-DD.
 */
export const createReservation = async (
  req: Request<Record<string, string>, unknown, CreateReservationInput>,
  res: Response
) => {
  try {
    const { name, email, phone, date, persons, special } = req.body;

    const result = await db.query(
      `INSERT INTO reservations (name, email, phone, date, persons, special)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, email, phone, date, persons, special]
    );

    res.status(201).json({
      message: 'Reservación creada exitosamente',
      reservation: result.rows[0],
    });
  } catch (error) {
    console.error('Error al crear reservación:', error);
    res.status(500).json({ error: 'Error al crear reservación' });
  }
};
