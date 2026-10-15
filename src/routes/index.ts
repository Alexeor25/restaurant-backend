import { Router } from 'express';
import { createReservation } from '../controlers/principal/v1/reservation';
import { 
  getMenu, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, updateCategory, deleteCategory
} from '../controlers/admin/menu';
import {
  getReservations, getReservationById, updateReservation, deleteReservation
} from '../controlers/admin/reservation';
import {getMenuP} from '../controlers/principal/v1/menu'

const router = Router();

// ==================== PRINCIPAL ====================
router.post('/api/principal/v1/reservation', createReservation);
router.get('/api/principal/v1/menu', getMenuP);

// ==================== PUBLIC ====================
router.get('/api/products', getMenuP);
router.post('/api/products', createProduct);

// ==================== ADMIN ====================

// Products
router.get('/api/admin/v1/menu', getMenu);
router.post('/api/admin/v1/menu', createProduct);
router.put('/api/admin/v1/menu/:id', updateProduct);
router.delete('/api/admin/v1/menu/:id', deleteProduct);

// Categories
router.get('/api/admin/v1/categories', getCategories);
router.post('/api/admin/v1/categories', createCategory);
router.put('/api/admin/v1/categories/:id', updateCategory);
router.delete('/api/admin/v1/categories/:id', deleteCategory);

// Reservations
router.get('/api/admin/v1/reservations', getReservations);
router.get('/api/admin/v1/reservations/:id', getReservationById);
router.put('/api/admin/v1/reservations/:id', updateReservation);
router.delete('/api/admin/v1/reservations/:id', deleteReservation);

export default router;
