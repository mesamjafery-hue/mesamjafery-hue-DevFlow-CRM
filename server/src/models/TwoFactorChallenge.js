const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('TwoFactorChallenge', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  codeHash: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  consumedAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'two_factor_challenges', timestamps: true });
