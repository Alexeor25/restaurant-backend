import { Request, Response } from 'express';
import { db } from '../../../config/db';

export interface products {
  id: number;
  category_id: number;
  nombre: string;
  precio: number;
  categoria: string;
}

export interface category {
  nombre: string;
  orden: number;
}


export const getMenuP = async (req: Request, res: Response): Promise<void> => {
  try {
    // `precio::float8` convierte el DECIMAL de PostgreSQL a número,
    // si no, pg lo devuelve como string ("17.00" en vez de 17).
    // El JOIN con `category` nos da el NOMBRE de la categoría para que el
    // frontend pueda agrupar los productos sin tener que cruzar ids.
    const query =
      `SELECT p.id, p.category_id, p.nombre, p.precio::float8 AS precio, c.nombre AS categoria
       FROM products p
       JOIN category c ON c.id = p.category_id
       ORDER BY c.orden, p.nombre`;
    const result = await db.query(query);

    const menu: products[] = result.rows;

    res.status(200).json(menu);
    
  } catch (error) {
    console.error('Error al obtener el menú:', error);
    res.status(500).json({ 
      message: 'Error al obtener el menú',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = 'SELECT nombre, orden FROM category ORDER BY orden';
    const result = await db.query(query);
    
    const categories: category[] = result.rows;

    res.status(200).json(categories);
    
  } catch (error) {
    console.error('Error al obtener las categorías:', error);
    res.status(500).json({ 
      message: 'Error al obtener las categorías',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};