const { BilliardTable, Invoice } = require('../models');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bắt đầu ngày hôm nay

    // 1. Số bàn đang chơi
    const activeTablesCount = await BilliardTable.count({
      where: { status: 'Đang sử dụng' }
    });

    // 2. Tổng hóa đơn trong ngày
    const invoicesToday = await Invoice.findAll({
      where: {
        createdAt: {
          [Op.gte]: today
        },
        status: 'Đã thanh toán'
      }
    });

    const totalInvoicesToday = invoicesToday.length;

    // 3. Doanh thu trong ngày
    const revenueToday = invoicesToday.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    res.status(200).json({
      active_tables: activeTablesCount,
      total_invoices_today: totalInvoicesToday,
      revenue_today: revenueToday
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getDashboardStats
};
