import type { Request, Response } from 'express';
import { db } from '../../../config/db';

/**
 * POST /api/principal/v1/reservation
 * Ruta pública: crea una reservación desde la web del restaurante.
 */
export const createReservation = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, date, persons, special } = req.body;

    if (!name || !phone || !date || !persons) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: name, phone, date, persons',
      });
    }

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
