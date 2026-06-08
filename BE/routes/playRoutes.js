const express = require('express');
const { startPlay, getActiveInvoice, addServiceToInvoice, checkout } = require('../controllers/playController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Yêu cầu đăng nhập (Admin hoặc Nhân viên đều được)
router.use(authMiddleware);

router.post('/start', startPlay);
router.get('/active-invoice/:table_id', getActiveInvoice);
router.post('/add-service', addServiceToInvoice);
router.post('/checkout', checkout);

module.exports = router;
