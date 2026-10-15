import { Request, Response } from 'express';
import { db } from '../../config/db';

// Obtener todas las reservaciones
export const getReservations = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      'SELECT * FROM reservations ORDER BY fecha DESC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las reservaciones' });
  }
};

// Obtener una reservación por ID
export const getReservationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT * FROM reservations WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Reservación no encontrada' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la reservación' });
  }
};

// Crear una reservación
export const createReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, fecha, personas, peticion } = req.body;

    if (!name || !email || !phone || !fecha || !personas) {
      res.status(400).json({ message: 'Todos los campos son requeridos excepto petición' });
      return;
    }

    const result = await db.query(
      `INSERT INTO reservations (name, email, phone, fecha, personas, peticion) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [name, email, phone, fecha, personas, peticion || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la reservación' });
  }
};

// Actualizar una reservación
export const updateReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, fecha, personas, peticion } = req.body;

    const result = await db.query(
      `UPDATE reservations 
       SET name = $1, email = $2, phone = $3, fecha = $4, personas = $5, peticion = $6 
       WHERE id = $7 
       RETURNING *`,
      [name, email, phone, fecha, personas, peticion, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Reservación no encontrada' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la reservación' });
  }
};

// Eliminar una reservación
export const deleteReservation = async (req: Request, res: Response): Promise<void> => {
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
    res.status(500).json({ message: 'Error al eliminar la reservación' });
  }
};
