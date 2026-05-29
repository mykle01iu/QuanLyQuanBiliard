const express = require('express');
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Tất cả nhân viên đều có thể xem danh sách dịch vụ
router.get('/', authMiddleware, getServices);

// Quản lý dịch vụ chỉ Admin
router.post('/', authMiddleware, adminMiddleware, createService);
router.put('/:id', authMiddleware, adminMiddleware, updateService);
router.delete('/:id', authMiddleware, adminMiddleware, deleteService);

module.exports = router;
