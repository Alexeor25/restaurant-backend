import { Request, Response } from 'express';
import { db } from '../../../config/db';
import { isPgError } from '../../../lib/pgErrors';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../../../schemas/category';
import type {
  CreateProductInput,
  UpdateProductInput,
} from '../../../schemas/product';

const PRODUCT_COLUMNS = 'id, category_id, nombre, precio::float8 AS precio';

export const getMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY nombre`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener el menú:', error);
    res.status(500).json({ message: 'Error al obtener el menú' });
  }
};

/**
 * POST /api/admin/v1/menu
 * El body llega validado y convertido por `createProductSchema`:
 * `category_id` y `precio` son números enteros.
 */
export const createProduct = async (
  req: Request<Record<string, string>, unknown, CreateProductInput>,
  res: Response
): Promise<void> => {
  try {
    const { category_id, nombre, precio } = req.body;

    const result = await db.query(
      `INSERT INTO products (category_id, nombre, precio)
       VALUES ($1, $2, $3)
       RETURNING ${PRODUCT_COLUMNS}`,
      [category_id, nombre, precio]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    // 23503 = la categoría no existe (violación de llave foránea).
    if (isPgError(error, '23503')) {
      res.status(400).json({ message: 'La categoría indicada no existe' });
      return;
    }
    console.error('Error al crear el producto:', error);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
};


/**
 * PUT /api/admin/v1/menu/:id
 * Actualización parcial: los campos ausentes se conservan con COALESCE.
 */
export const updateProduct = async (
  req: Request<Record<string, string>, unknown, UpdateProductInput>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { category_id, nombre, precio } = req.body;

    const result = await db.query(
      `UPDATE products
       SET category_id = COALESCE($1, category_id),
           nombre = COALESCE($2, nombre),
           precio = COALESCE($3, precio)
       WHERE id = $4
       RETURNING ${PRODUCT_COLUMNS}`,
      [category_id ?? null, nombre ?? null, precio ?? null, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    if (isPgError(error, '23503')) {
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
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.status(200).json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
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
    console.error('Error al obtener las categorías:', error);
    res.status(500).json({ message: 'Error al obtener las categorías' });
  }
};

/**
 * POST /api/admin/v1/categories
 * El body llega validado por `createCategorySchema` (nombre recortado).
 */
export const createCategory = async (
  req: Request<Record<string, string>, unknown, CreateCategoryInput>,
  res: Response
): Promise<void> => {
  try {
    const { nombre } = req.body;

    // Comprobación explícita (sin depender del índice UNIQUE): así el error
    // es un 409 claro incluso si la tabla se creó sin la restricción.
    const existing = await db.query(
      'SELECT id FROM category WHERE lower(nombre) = lower($1)',
      [nombre]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ message: 'Ya existe una categoría con ese nombre' });
      return;
    }

    const result = await db.query(
      'INSERT INTO category (nombre, orden) VALUES ($1, 0) RETURNING id, nombre, orden',
      [nombre]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    // 23505 = ya existe una categoría con ese nombre (la columna es UNIQUE).
    if (isPgError(error, '23505')) {
      res.status(409).json({ message: 'Ya existe una categoría con ese nombre' });
      return;
    }
    console.error('Error al crear la categoría:', error);
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
};

/**
 * PUT /api/admin/v1/categories/:id
 * Actualización parcial: puedes mandar solo `nombre` o solo `orden`.
 */
export const updateCategory = async (
  req: Request<Record<string, string>, unknown, UpdateCategoryInput>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, orden } = req.body;

    if (nombre) {
      const existing = await db.query(
        'SELECT id FROM category WHERE lower(nombre) = lower($1) AND id <> $2',
        [nombre, id]
      );
      if (existing.rows.length > 0) {
        res.status(409).json({ message: 'Ya existe una categoría con ese nombre' });
        return;
      }
    }

    const result = await db.query(
      `UPDATE category
       SET nombre = COALESCE($1, nombre),
           orden = COALESCE($2, orden)
       WHERE id = $3
       RETURNING id, nombre, orden`,
      [nombre ?? null, orden ?? null, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Categoría no encontrada' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    if (isPgError(error, '23505')) {
      res.status(409).json({ message: 'Ya existe una categoría con ese nombre' });
      return;
    }
    console.error('Error al actualizar la categoría:', error);
    res.status(500).json({ message: 'Error al actualizar la categoría' });
  }
};

// Eliminar una categoría
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM category WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Categoría no encontrada' });
      return;
    }

    res.status(200).json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
};
