import { Request, Response } from 'express';
import { db } from '../../config/db';

// ==================== PRODUCTOS (MENÚ) ====================

// Obtener todo el menú
export const getMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      'SELECT id, category_id, nombre, precio FROM products ORDER BY nombre'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el menú' });
  }
};

// Crear un producto
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category_id, nombre, precio } = req.body;

    if (!category_id || !nombre || precio === undefined) {
      res.status(400).json({ message: 'category_id, nombre y precio son requeridos' });
      return;
    }

    const result = await db.query(
      'INSERT INTO products (category_id, nombre, precio) VALUES ($1, $2, $3) RETURNING *',
      [category_id, nombre, precio]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto' });
  }
};

// Actualizar un producto
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category_id, nombre, precio } = req.body;

    const result = await db.query(
      'UPDATE products SET category_id = $1, nombre = $2, precio = $3 WHERE id = $4 RETURNING *',
      [category_id, nombre, precio, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto' });
  }
};

// Eliminar un producto
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.status(200).json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
};

// ==================== CATEGORÍAS ====================

// Obtener todas las categorías
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      'SELECT id, nombre, orden FROM categories ORDER BY orden'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las categorías' });
  }
};

// Crear una categoría
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      res.status(400).json({ message: 'El nombre es requerido' });
      return;
    }

    const result = await db.query(
      'INSERT INTO categories (nombre, orden) VALUES ($1, 0) RETURNING *',
      [nombre]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
};

// Actualizar una categoría
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, orden } = req.body;

    const result = await db.query(
      'UPDATE categories SET nombre = $1, orden = $2 WHERE id = $3 RETURNING *',
      [nombre, orden, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Categoría no encontrada' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la categoría' });
  }
};

// Eliminar una categoría
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Categoría no encontrada' });
      return;
    }

    res.status(200).json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
};