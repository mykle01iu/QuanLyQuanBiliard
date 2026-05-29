const { Service } = require('../models');

// Lấy danh sách dịch vụ
const getServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['id', 'DESC']]
    });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Thêm dịch vụ
const createService = async (req, res) => {
  try {
    const { name, category, price, image_url } = req.body;
    const newService = await Service.create({
      name, category, price, image_url
    });
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Sửa dịch vụ
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, image_url } = req.body;

    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });

    service.name = name || service.name;
    service.category = category || service.category;
    service.price = price !== undefined ? price : service.price;
    service.image_url = image_url || service.image_url;

    await service.save();
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Xóa dịch vụ
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });

    await service.destroy();
    res.status(200).json({ message: 'Xóa dịch vụ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService
};
