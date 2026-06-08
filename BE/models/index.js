const User = require('./User');
const BilliardTable = require('./BilliardTable');
const Service = require('./Service');
const Category = require('./Category');
const Invoice = require('./Invoice');
const InvoiceDetail = require('./InvoiceDetail');

// User <-> Invoice
User.hasMany(Invoice, { foreignKey: 'user_id' });
Invoice.belongsTo(User, { foreignKey: 'user_id' });

// Table <-> Invoice
BilliardTable.hasMany(Invoice, { foreignKey: 'table_id' });
Invoice.belongsTo(BilliardTable, { foreignKey: 'table_id' });

// Invoice <-> InvoiceDetail
Invoice.hasMany(InvoiceDetail, { foreignKey: 'invoice_id' });
InvoiceDetail.belongsTo(Invoice, { foreignKey: 'invoice_id' });

// Service <-> InvoiceDetail
Service.hasMany(InvoiceDetail, { foreignKey: 'service_id' });
InvoiceDetail.belongsTo(Service, { foreignKey: 'service_id' });

module.exports = {
  User,
  BilliardTable,
  Category,
  Service,
  Invoice,
  InvoiceDetail
};
