import { Request, Response } from 'express';
import { db } from '../../../config/db';

// Interface del producto
export interface products {
  id: string;
  category_id: string;
  nombre: string;
  precio: number;
}

// Interface de categoría
export interface category {
  nombre: string;
  orden: number;
}

// Controlador para obtener el menú
export const getMenuP = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = 'SELECT id, category_id, nombre, precio FROM products ORDER BY nombre';
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

// Controlador para obtener las categorías
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = 'SELECT nombre, orden FROM categories ORDER BY orden';
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