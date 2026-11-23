import { Router } from 'express';
import { createReservation } from '../controlers/principal/v1/reservation';
import { getMenuP } from '../controlers/principal/v1/menu';
import {
  getMenu,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controlers/admin/CRUD/menu';
import {
  getReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} from '../controlers/admin/CRUD/reservation';
import { createToken, logout } from '../controlers/admin/auth/createToken';
import { refreshToken } from '../controlers/admin/auth/refreshToken';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema } from '../schemas/auth';
import { idParamSchema } from '../schemas/common';
import { createReservationSchema, updateReservationSchema } from '../schemas/reservation';
import { createProductSchema, updateProductSchema } from '../schemas/product';
import { createCategorySchema, updateCategorySchema } from '../schemas/category';

const router = Router();

router.get('/api/principal/v1/menu', getMenuP);
router.post(
  '/api/principal/v1/reservation',
  validate({ body: createReservationSchema }),
  createReservation
);

router.post('/api/admin/v1/login', validate({ body: loginSchema }), createToken);
router.post('/api/admin/v1/logout', logout);
router.post('/api/refresh', refreshToken);



router.use('/api/admin/v1', authenticateToken);

// ADMIN 

router.get('/api/admin/v1/menu', getMenu);
router.post(
  '/api/admin/v1/menu',
  validate({ body: createProductSchema }),
  createProduct
);
router.put(
  '/api/admin/v1/menu/:id',
  validate({ params: idParamSchema, body: updateProductSchema }),
  updateProduct
);
router.delete(
  '/api/admin/v1/menu/:id',
  validate({ params: idParamSchema }),
  deleteProduct
);

// Categorías
router.get('/api/admin/v1/categories', getCategories);
router.post(
  '/api/admin/v1/categories',
  validate({ body: createCategorySchema }),
  createCategory
);
router.put(
  '/api/admin/v1/categories/:id',
  validate({ params: idParamSchema, body: updateCategorySchema }),
  updateCategory
);
router.delete(
  '/api/admin/v1/categories/:id',
  validate({ params: idParamSchema }),
  deleteCategory
);

// Reservaciones
router.get('/api/admin/v1/reservations', getReservations);
router.get(
  '/api/admin/v1/reservations/:id',
  validate({ params: idParamSchema }),
  getReservationById
);
router.put(
  '/api/admin/v1/reservations/:id',
  validate({ params: idParamSchema, body: updateReservationSchema }),
  updateReservation
);
router.delete(
  '/api/admin/v1/reservations/:id',
  validate({ params: idParamSchema }),
  deleteReservation
);

export default router;
