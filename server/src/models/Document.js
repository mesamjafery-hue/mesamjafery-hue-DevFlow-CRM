const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Document', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  originalName: { type: DataTypes.STRING, allowNull: false },
  storedName: { type: DataTypes.STRING, allowNull: false, unique: true },
  mimeType: { type: DataTypes.STRING, allowNull: false },
  size: { type: DataTypes.INTEGER, allowNull: false },
  path: { type: DataTypes.STRING, allowNull: false },
  uploadedBy: { type: DataTypes.INTEGER, allowNull: false },
  relatedType: { type: DataTypes.STRING, allowNull: true },
  relatedId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'documents', timestamps: true });
