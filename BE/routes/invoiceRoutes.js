const express = require('express');
const { getInvoices, getInvoiceById } = require('../controllers/invoiceController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Yêu cầu đăng nhập để xem danh sách hóa đơn
router.use(authMiddleware);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);

module.exports = router;
