const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Prospect', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  contactId: { type: DataTypes.INTEGER, allowNull: true },
  requirementSummary: { type: DataTypes.TEXT, allowNull: true },
  value: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  probability: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('new', 'qualified', 'follow_up', 'converted', 'lost'), defaultValue: 'new' },
  nextFollowUp: { type: DataTypes.DATE, allowNull: true },
  ownerId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'prospects', timestamps: true });
