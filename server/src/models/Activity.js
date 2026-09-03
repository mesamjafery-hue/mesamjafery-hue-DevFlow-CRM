const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Activity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.ENUM('call', 'email', 'meeting', 'note', 'follow_up'), allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  activityDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  ownerId: { type: DataTypes.INTEGER, allowNull: false },
  relatedType: { type: DataTypes.STRING, allowNull: true },
  relatedId: { type: DataTypes.INTEGER, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'activities', timestamps: true });
