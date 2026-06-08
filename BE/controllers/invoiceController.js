const { Invoice, BilliardTable, User, InvoiceDetail, Service } = require('../models');

// Lấy danh sách toàn bộ hóa đơn
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      order: [['id', 'DESC']],
      include: [
        { model: BilliardTable },
        { model: User, attributes: ['id', 'username', 'fullname', 'role'] },
        {
          model: InvoiceDetail,
          include: [{ model: Service }]
        }
      ]
    });
    res.status(200).json(invoices);
  } catch (error) {
    console.error('getInvoices error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách hóa đơn' });
  }
};

// Lấy chi tiết một hóa đơn
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: BilliardTable },
        { model: User, attributes: ['id', 'username', 'fullname', 'role'] },
        {
          model: InvoiceDetail,
          include: [{ model: Service }]
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error('getInvoiceById error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết hóa đơn' });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById
};
