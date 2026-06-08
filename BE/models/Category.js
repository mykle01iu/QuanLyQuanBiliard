const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Package'
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'text-slate-600'
  },
  bg: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'bg-slate-50'
  },
  ring: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'ring-slate-100'
  }
}, {
  timestamps: true
});

module.exports = Category;
