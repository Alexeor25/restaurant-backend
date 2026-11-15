import type { Request, Response } from 'express';
import { db } from '../../../config/db';

export const createReservation = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, date, persons, special } = req.body;

    if (!name || !phone || !date || !persons) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: name, phone, date, persons',
      });
    }

    // El frontend envía `persons` como string y la columna es INTEGER:
    // validamos aquí para devolver un 400 claro en vez de un 500 de PostgreSQL.
    const personsNumber = Number(persons);
    if (!Number.isInteger(personsNumber) || personsNumber <= 0) {
      return res.status(400).json({
        error: 'El número de comensales debe ser un entero mayor a 0',
      });
    }

    const result = await db.query(
      `INSERT INTO reservations (name, email, phone, date, persons, special)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, email, phone, date, personsNumber, special]
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
