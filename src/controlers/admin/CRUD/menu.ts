import { Request, Response } from 'express';
import { db } from '../../../config/db';



export const getMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      'SELECT id, category_id, nombre, precio::float8 AS precio FROM products ORDER BY nombre'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el menú' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category_id, nombre, precio } = req.body;

    if (!category_id || !nombre || precio === undefined) {
      res.status(400).json({ message: 'category_id, nombre y precio son requeridos' });
      return;
    }

    // `category_id` y `precio` son INTEGER en la base de datos: validamos
    // antes de llegar a PostgreSQL para devolver un 400 claro.
    const categoryIdNumber = Number(category_id);
    const precioNumber = Number(precio);

    if (!Number.isInteger(categoryIdNumber) || categoryIdNumber <= 0) {
      res.status(400).json({
        message: 'category_id debe ser el ID numérico de una categoría existente',
      });
      return;
    }

    if (!Number.isInteger(precioNumber) || precioNumber < 0) {
      res.status(400).json({
        message: 'precio debe ser un entero mayor o igual a 0 (la columna es INTEGER)',
      });
      return;
    }

    const result = await db.query(
      'INSERT INTO products (category_id, nombre, precio) VALUES ($1, $2, $3) RETURNING *',
      [categoryIdNumber, nombre, precioNumber]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    // 23503 = la categoría no existe (violación de llave foránea).
    if ((error as { code?: string })?.code === '23503') {
      res.status(400).json({ message: 'La categoría indicada no existe' });
      return;
    }
    console.error('Error al crear el producto:', error);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
};


export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category_id, nombre, precio } = req.body;

    // Actualización parcial: solo validamos los campos que vienen.
    const categoryIdNumber = category_id === undefined ? null : Number(category_id);
    const precioNumber = precio === undefined ? null : Number(precio);

    if (categoryIdNumber !== null && (!Number.isInteger(categoryIdNumber) || categoryIdNumber <= 0)) {
      res.status(400).json({
        message: 'category_id debe ser el ID numérico de una categoría existente',
      });
      return;
    }

    if (precioNumber !== null && (!Number.isInteger(precioNumber) || precioNumber < 0)) {
      res.status(400).json({
        message: 'precio debe ser un entero mayor o igual a 0 (la columna es INTEGER)',
      });
      return;
    }

    const result = await db.query(
      `UPDATE products
       SET category_id = COALESCE($1, category_id),
           nombre = COALESCE($2, nombre),
           precio = COALESCE($3, precio)
       WHERE id = $4
       RETURNING *`,
      [categoryIdNumber, nombre ?? null, precioNumber, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    if ((error as { code?: string })?.code === '23503') {
      res.status(400).json({ message: 'La categoría indicada no existe' });
      return;
    }
    console.error('Error al actualizar el producto:', error);
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
      'SELECT id, nombre, orden FROM category ORDER BY orden'
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
      'INSERT INTO category (nombre, orden) VALUES ($1, 0) RETURNING *',
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
      'UPDATE category SET nombre = $1, orden = $2 WHERE id = $3 RETURNING *',
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
      'DELETE FROM category WHERE id = $1 RETURNING *',
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