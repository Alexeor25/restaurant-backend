import { Request, Response } from 'express';
import { db } from '../../../config/db';
import type { UpdateReservationInput } from '../../../schemas/reservation';

// Columnas explícitas: nunca `SELECT *` en una API (evita exponer columnas
// nuevas por accidente y deja claro el contrato de la respuesta).
const RESERVATION_COLUMNS =
  'id, name, email, phone, date, persons, special, status, created_at';

export const getReservations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT ${RESERVATION_COLUMNS} FROM reservations ORDER BY date DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener las reservaciones:', error);
    res.status(500).json({ message: 'Error al obtener las reservaciones' });
  }
};


export const getReservationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT ${RESERVATION_COLUMNS} FROM reservations WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Reservación no encontrada' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener la reservación:', error);
    res.status(500).json({ message: 'Error al obtener la reservación' });
  }
};


export const updateReservation = async (
  req: Request<Record<string, string>, unknown, UpdateReservationInput>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    // El body ya viene validado por `updateReservationSchema`: solo `status`
    // es obligatorio de conocer el estado actual, y los campos ausentes se
    // conservan con COALESCE.
    const { name, email, phone, date, persons, special, status } = req.body;

    const result = await db.query(
      `UPDATE reservations
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           date = COALESCE($4, date),
           persons = COALESCE($5, persons),
           special = COALESCE($6, special),
           status = COALESCE($7, status)
       WHERE id = $8
       RETURNING ${RESERVATION_COLUMNS}`,
      [
        name ?? null,
        email ?? null,
        phone ?? null,
        date ?? null,
        persons ?? null,
        special ?? null,
        status ?? null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Reservación no encontrada' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar la reservación:', error);
    res.status(500).json({ message: 'Error al actualizar la reservación' });
  }
};

// Eliminar una reservación
export const deleteReservation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM reservations WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Reservación no encontrada' });
      return;
    }

    res.status(200).json({ message: 'Reservación eliminada' });
  } catch (error) {
    console.error('Error al eliminar la reservación:', error);
    res.status(500).json({ message: 'Error al eliminar la reservación' });
  }
};
