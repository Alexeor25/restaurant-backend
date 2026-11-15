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

const router = Router();


router.get('/api/principal/v1/menu', getMenuP);
router.post('/api/principal/v1/reservation', createReservation);


router.post('/api/admin/v1/login', createToken);
router.post('/api/admin/v1/logout', logout);
router.post('/api/refresh', refreshToken);



router.use('/api/admin/v1', authenticateToken);

// ADMIN 

router.get('/api/admin/v1/menu', getMenu);
router.post('/api/admin/v1/menu', createProduct);
router.put('/api/admin/v1/menu/:id', updateProduct);
router.delete('/api/admin/v1/menu/:id', deleteProduct);

// Categorías
router.get('/api/admin/v1/categories', getCategories);
router.post('/api/admin/v1/categories', createCategory);
router.put('/api/admin/v1/categories/:id', updateCategory);
router.delete('/api/admin/v1/categories/:id', deleteCategory);

// Reservaciones
router.get('/api/admin/v1/reservations', getReservations);
router.get('/api/admin/v1/reservations/:id', getReservationById);
router.put('/api/admin/v1/reservations/:id', updateReservation);
router.delete('/api/admin/v1/reservations/:id', deleteReservation);

export default router;
