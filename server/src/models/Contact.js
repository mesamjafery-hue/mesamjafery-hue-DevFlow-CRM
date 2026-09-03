const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Contact', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: true },
  clientId: { type: DataTypes.INTEGER, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING, allowNull: true },
  isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'contacts', timestamps: true });
