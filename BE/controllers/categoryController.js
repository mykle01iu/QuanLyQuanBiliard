const { Category, Service } = require('../models');
const { emitEvent } = require('../socket');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['id', 'DESC']]
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, icon, color, bg, ring } = req.body;
    const newCat = await Category.create({ name, icon, color, bg, ring });
    emitEvent('dataChange');
    res.status(201).json(newCat);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color, bg, ring } = req.body;

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });

    const oldName = category.name;

    category.name = name || category.name;
    category.icon = icon || category.icon;
    category.color = color || category.color;
    category.bg = bg || category.bg;
    category.ring = ring || category.ring;

    await category.save();

    if (oldName !== category.name) {
      await Service.update(
        { category: category.name },
        { where: { category: oldName } }
      );
    }

    emitEvent('dataChange');
    res.status(200).json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });

    await Service.update(
      { category: 'Khác' },
      { where: { category: category.name } }
    );

    await category.destroy();
    emitEvent('dataChange');
    res.status(200).json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
