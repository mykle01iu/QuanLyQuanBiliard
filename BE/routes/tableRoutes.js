const express = require('express');
const { getTables, createTable, updateTable, deleteTable } = require('../controllers/tableController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Nhân viên và Admin đều xem được bàn
router.get('/', authMiddleware, getTables);

// Chỉ Admin mới được thêm/sửa/xóa bàn
router.post('/', authMiddleware, adminMiddleware, createTable);
router.put('/:id', authMiddleware, adminMiddleware, updateTable);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTable);

module.exports = router;
