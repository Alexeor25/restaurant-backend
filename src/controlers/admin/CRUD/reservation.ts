import { Request, Response } from 'express';
import { db } from '../../../config/db';


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


export const updateReservation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, date, persons, special, status } = req.body;

    // Actualización parcial: si un campo no viene (null), se conserva el valor actual.
    //VERIFICAR*********************
    // Así el frontend puede mandar solo { status } para confirmar/cancelar.
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
       RETURNING *`,
      [name ?? null, email ?? null, phone ?? null, date ?? null, persons ?? null, special ?? null, status ?? null, id]
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
