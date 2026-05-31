const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const tableRoutes = require('./tableRoutes');
const serviceRoutes = require('./serviceRoutes');
const playRoutes = require('./playRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const categoryRoutes = require('./categoryRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tables', tableRoutes);
router.use('/services', serviceRoutes);
router.use('/play', playRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
