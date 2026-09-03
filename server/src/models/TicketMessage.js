const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('TicketMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticketId: { type: DataTypes.INTEGER, allowNull: false },
  authorId: { type: DataTypes.INTEGER, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  isInternal: { type: DataTypes.BOOLEAN, defaultValue: false },
  slaDueAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'ticket_messages', timestamps: true });
