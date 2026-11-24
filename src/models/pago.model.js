const { Model, DataTypes } = require('sequelize');
const { PEDIDO_TABLE } = require('./pedido.model');

const PAGO_TABLE = 'pagos';

const PagoSchema = {
  id_pago: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  id_pedido: {
    allowNull: false,
    type: DataTypes.INTEGER,
    unique: true,
    references: {
      model: PEDIDO_TABLE,
      key: 'id_pedido',
    },
  },
  metodo_pago: {
    allowNull: false,
    type: DataTypes.STRING(30),
  },
  monto: {
    allowNull: false,
    type: DataTypes.DECIMAL(10, 2),
  },
  referencia_transaccion: {
    allowNull: true,
    type: DataTypes.STRING(100),
    unique: true,
  },
  estado_pago: {
    allowNull: false,
    defaultValue: 'pendiente',
    type: DataTypes.STRING(20),
  },
  fecha_pago: {
    allowNull: true,
    defaultValue: DataTypes.NOW,
    type: DataTypes.DATE,
  },
};

class Pago extends Model {
  static associate(models) {
    this.belongsTo(models.Pedido, {
      as: 'pedido',
      foreignKey: 'id_pedido',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PAGO_TABLE,
      modelName: 'Pago',
      timestamps: false,
    };
  }
}

module.exports = { PAGO_TABLE, PagoSchema, Pago };