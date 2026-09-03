const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Deal = sequelize.define('Deal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'leads',
        key: 'id',
      },
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    stage: {
      type: DataTypes.ENUM('new_lead', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'),
      defaultValue: 'new_lead',
    },
    value: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    probability: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    expectedClose: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'deals',
    timestamps: true,
  });

  return Deal;
};
