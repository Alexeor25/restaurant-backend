import { Request, Response } from 'express';
import { db } from '../../../config/db';

// Obtener todas las reservaciones
export const getReservations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      'SELECT * FROM reservations ORDER BY date DESC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener las reservaciones:', error);
    res.status(500).json({ message: 'Error al obtener las reservaciones' });
  }
};

// Obtener una reservación por ID
export const getReservationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query('SELECT * FROM reservations WHERE id = $1', [
      id,
    ]);

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

// Actualizar una reservación
export const updateReservation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, date, persons, special } = req.body;

    const result = await db.query(
      `UPDATE reservations
       SET name = $1, email = $2, phone = $3, date = $4, persons = $5, special = $6
       WHERE id = $7
       RETURNING *`,
      [name, email, phone, date, persons, special, id]
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
      'DELETE FROM reservations WHERE id = $1 RETURNING *',
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
