const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BilliardTable = sequelize.define('BilliardTable', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Trống', 'Đang sử dụng'),
    defaultValue: 'Trống'
  },
  price_per_hour: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = BilliardTable;
