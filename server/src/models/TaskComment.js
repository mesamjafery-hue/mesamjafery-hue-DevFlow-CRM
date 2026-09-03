const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('TaskComment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  taskId: { type: DataTypes.INTEGER, allowNull: false },
  authorId: { type: DataTypes.INTEGER, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
}, { tableName: 'task_comments', timestamps: true });
