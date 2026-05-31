const express = require('express');
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Tất cả nhân viên đều có thể xem danh sách dịch vụ
router.get('/', authMiddleware, getServices);

// Quản lý dịch vụ
router.post('/', authMiddleware, createService);
router.put('/:id', authMiddleware, updateService);
router.delete('/:id', authMiddleware, deleteService);

module.exports = router;
