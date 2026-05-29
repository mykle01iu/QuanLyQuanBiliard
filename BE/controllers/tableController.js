const { BilliardTable, Invoice } = require('../models');

// Lấy danh sách bàn kèm trạng thái
const getTables = async (req, res) => {
  try {
    const tables = await BilliardTable.findAll({
      order: [['id', 'ASC']]
    });

    // Optionally attach active invoice info here if needed
    // We will just return the tables as they have 'status' column updated

    res.status(200).json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Thêm bàn mới
const createTable = async (req, res) => {
  try {
    const { name, price_per_hour } = req.body;
    const newTable = await BilliardTable.create({
      name,
      price_per_hour
    });
    res.status(201).json(newTable);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Cập nhật bàn (Đổi tên, giá)
const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price_per_hour } = req.body;

    const table = await BilliardTable.findByPk(id);
    if (!table) return res.status(404).json({ message: 'Không tìm thấy bàn' });

    table.name = name || table.name;
    table.price_per_hour = price_per_hour || table.price_per_hour;
    await table.save();

    res.status(200).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Xóa bàn
const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    const table = await BilliardTable.findByPk(id);
    if (!table) return res.status(404).json({ message: 'Không tìm thấy bàn' });

    if (table.status === 'Đang sử dụng') {
      return res.status(400).json({ message: 'Không thể xóa bàn đang được sử dụng' });
    }

    await table.destroy();
    res.status(200).json({ message: 'Xóa bàn thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getTables,
  createTable,
  updateTable,
  deleteTable
};
