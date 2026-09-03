const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Quotation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  number: { type: DataTypes.STRING, allowNull: false, unique: true },
  clientId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  status: { type: DataTypes.ENUM('draft', 'sent', 'accepted', 'rejected', 'expired'), defaultValue: 'draft' },
  validUntil: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'quotations', timestamps: true });
