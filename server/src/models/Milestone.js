const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Milestone', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  dueDate: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'blocked'), defaultValue: 'planned' },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'milestones', timestamps: true });
