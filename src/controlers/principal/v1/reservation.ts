import type { Request, Response } from 'express';
import {db} from '../../../config/db';

export const createReservation = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, date, persons, special } = req.body;

    console.log('Datos recibidos:', { name, email, phone, date, persons, special });

    if (!name || !phone || !date || !persons) {
      res.status(400).json({ 
        error: 'Faltan campos requeridos: name, phone, date, persons' 
      });
      return;
    }

    const result = await db.query(
      'INSERT INTO reservations(name, email, phone, date, persons, special) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, phone, date, persons, special]
    );
    
    res.status(201).json({ 
      message: 'Reservación creada exitosamente',
      reservation: result.rows[0] 
    });

  } catch (error) {
    console.error('Error al crear reservación:', error);
    res.status(500).json({ error: 'Error al crear reservación' });
  }
};

export const getReservations = async (req: Request, res: Response) => {
  try {
    
    const result = await db.query('SELECT * FROM reservations ORDER BY id DESC');
    
   
    const reservations = result.rows;
    
   
    res.status(200).json({
      message: 'Reservaciones obtenidas exitosamente',
      reservations: reservations  // ← Aquí se llama "reservations" (con s)
    });
    
  } catch (error) {
    console.log("Ocurrió este error: " + error);
    res.status(500).json({
      message: 'Error al obtener reservaciones',
      error: error
    });
  }
};
