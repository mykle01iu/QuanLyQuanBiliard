const express = require('express');
const { getUsers, createUser, deleteUser, updateUser } = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Tất cả route quản lý user đều cần đăng nhập và quyền Admin
router.use(authMiddleware, adminMiddleware);

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
