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

// ==================== PÚBLICO ====================
// El menú y las reservaciones del cliente no necesitan token.
router.get('/api/principal/v1/menu', getMenuP);
router.post('/api/principal/v1/reservation', createReservation);

// ==================== AUTH (público) ====================
// El login es público: es justamente la ruta que permite obtener el token.
// No lleva middleware de auth.
router.post('/api/admin/v1/login', createToken);
router.post('/api/admin/v1/logout', logout);
router.post('/api/refresh', refreshToken);

// A partir de acá, TODO /api/admin/v1 exige token.
// El orden importa: las rutas de login/logout quedaron definidas antes.
router.use('/api/admin/v1', authenticateToken);

// ==================== ADMIN ====================

// Menú / productos
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
