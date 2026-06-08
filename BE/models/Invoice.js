const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const BilliardTable = require('./BilliardTable');
const User = require('./User');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  total_time: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
    defaultValue: 0
  },
  table_fee: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  service_fee: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  total_amount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('Đang chơi', 'Đã thanh toán'),
    defaultValue: 'Đang chơi'
  }
}, {
  timestamps: true
});

module.exports = Invoice;
