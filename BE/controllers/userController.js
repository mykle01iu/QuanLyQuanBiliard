const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { emitEvent } = require('../socket');

// [Admin] Lấy danh sách nhân viên
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Thêm nhân viên
const createUser = async (req, res) => {
  try {
    const { username, password, fullname, role, phone } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username đã tồn tại' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      fullname,
      phone,
      role: role || 'employee'
    });

    emitEvent('dataChange');
    res.status(201).json({ message: 'Tạo tài khoản thành công', user: { id: newUser.id, username: newUser.username } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Xóa nhân viên
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Không thể tự xóa tài khoản của mình' });
    }

    await user.destroy();
    emitEvent('dataChange');
    res.status(200).json({ message: 'Xóa tài khoản thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Cập nhật nhân viên
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, fullname, role, phone } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username đã tồn tại' });
      }
      user.username = username;
    }

    user.fullname = fullname || user.fullname;
    user.phone = phone !== undefined ? phone : user.phone;
    user.role = role || user.role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    emitEvent('dataChange');
    res.status(200).json({
      message: 'Cập nhật tài khoản thành công',
      user: { id: user.id, username: user.username, fullname: user.fullname, role: user.role, phone: user.phone }
    });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getUsers,
  createUser,
  deleteUser,
  updateUser
};
