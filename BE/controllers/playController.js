const { BilliardTable, Invoice, InvoiceDetail, Service } = require('../models');
const { emitEvent } = require('../socket');

// Bắt đầu chơi
const startPlay = async (req, res) => {
  try {
    const { table_id } = req.body;
    const user_id = req.user.id;

    const table = await BilliardTable.findByPk(table_id);
    if (!table) return res.status(404).json({ message: 'Không tìm thấy bàn' });

    if (table.status === 'Đang sử dụng') {
      return res.status(400).json({ message: 'Bàn đang có người chơi' });
    }

    // Cập nhật trạng thái bàn
    table.status = 'Đang sử dụng';
    await table.save();

    // Tạo hóa đơn mới
    const newInvoice = await Invoice.create({
      start_time: new Date(),
      status: 'Đang chơi',
      user_id,
      table_id
    });

    // Phát sự kiện cập nhật trạng thái bàn cho tất cả các máy
    emitEvent('tableStatusChanged', {
      table_id: table.id,
      status: table.status,
      invoice_id: newInvoice.id
    });

    res.status(200).json({ message: 'Bắt đầu chơi thành công', invoice: newInvoice, table });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy thông tin hóa đơn hiện tại của bàn (dùng khi click vào bàn đang chơi)
const getActiveInvoice = async (req, res) => {
  try {
    const { table_id } = req.params;
    const invoice = await Invoice.findOne({
      where: { table_id, status: 'Đang chơi' },
      include: [
        {
          model: InvoiceDetail,
          include: [Service]
        }
      ]
    });

    if (!invoice) return res.status(404).json({ message: 'Không có hóa đơn đang hoạt động cho bàn này' });

    // Tính toán thời gian đã chơi hiện tại (tạm tính)
    const now = new Date();
    const start = new Date(invoice.start_time);
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000); // Đổi ra phút

    // Lấy giá bàn
    const table = await BilliardTable.findByPk(table_id);
    const tableFee = Math.floor((diffMins / 60) * table.price_per_hour);

    res.status(200).json({
      invoice,
      current_play_time_minutes: diffMins,
      current_table_fee: tableFee
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thêm dịch vụ vào hóa đơn đang chơi
const addServiceToInvoice = async (req, res) => {
  try {
    const { invoice_id, service_id, quantity } = req.body;

    const invoice = await Invoice.findByPk(invoice_id);
    if (!invoice || invoice.status !== 'Đang chơi') {
      return res.status(400).json({ message: 'Hóa đơn không hợp lệ hoặc đã thanh toán' });
    }

    const service = await Service.findByPk(service_id);
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });

    // Kiểm tra xem dịch vụ này đã có trong hóa đơn chưa
    let detail = await InvoiceDetail.findOne({
      where: { invoice_id, service_id }
    });

    if (detail) {
      // Tăng số lượng và tính lại tổng
      detail.quantity += quantity;
      detail.total = detail.quantity * detail.price;
      await detail.save();
    } else {
      // Tạo mới chi tiết hóa đơn
      detail = await InvoiceDetail.create({
        invoice_id,
        service_id,
        quantity,
        price: service.price,
        total: service.price * quantity
      });
    }

    // Phát sự kiện để cập nhật UI nếu có máy khác đang mở bill này
    emitEvent('invoiceUpdated', { invoice_id });

    res.status(200).json({ message: 'Thêm dịch vụ thành công', detail });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thanh toán kết thúc giờ chơi
const checkout = async (req, res) => {
  try {
    const { invoice_id } = req.body;

    const invoice = await Invoice.findByPk(invoice_id, {
      include: [InvoiceDetail]
    });

    if (!invoice || invoice.status !== 'Đang chơi') {
      return res.status(400).json({ message: 'Hóa đơn không hợp lệ' });
    }

    const table = await BilliardTable.findByPk(invoice.table_id);

    // 1. Tính tiền giờ
    const end_time = new Date();
    const start = new Date(invoice.start_time);
    const total_time = Math.floor((end_time - start) / 60000); // tổng số phút
    const table_fee = Math.floor((total_time / 60) * table.price_per_hour);

    // 2. Tính tiền dịch vụ
    let service_fee = 0;
    if (invoice.InvoiceDetails && invoice.InvoiceDetails.length > 0) {
      service_fee = invoice.InvoiceDetails.reduce((sum, item) => sum + item.total, 0);
    }

    // 3. Cập nhật hóa đơn
    invoice.end_time = end_time;
    invoice.total_time = total_time;
    invoice.table_fee = table_fee;
    invoice.service_fee = service_fee;
    invoice.total_amount = table_fee + service_fee;
    invoice.status = 'Đã thanh toán';
    await invoice.save();

    // 4. Cập nhật trạng thái bàn
    table.status = 'Trống';
    await table.save();

    // Phát sự kiện bàn trống
    emitEvent('tableStatusChanged', {
      table_id: table.id,
      status: table.status,
      invoice_id: null
    });

    res.status(200).json({ message: 'Thanh toán thành công', invoice });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  startPlay,
  getActiveInvoice,
  addServiceToInvoice,
  checkout
};
