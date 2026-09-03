const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Subtask', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  taskId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('todo', 'in_progress', 'done'), defaultValue: 'todo' },
  assigneeId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'subtasks', timestamps: true });
