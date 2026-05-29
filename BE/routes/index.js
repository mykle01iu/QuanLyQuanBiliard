const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const tableRoutes = require('./tableRoutes');
const serviceRoutes = require('./serviceRoutes');
const playRoutes = require('./playRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tables', tableRoutes);
router.use('/services', serviceRoutes);
router.use('/play', playRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
