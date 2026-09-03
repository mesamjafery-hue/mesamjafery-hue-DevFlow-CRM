const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('RolePermission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roleId: { type: DataTypes.INTEGER, allowNull: false },
  permission: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'role_permissions', timestamps: true, indexes: [{ unique: true, fields: ['roleId', 'permission'] }] });
