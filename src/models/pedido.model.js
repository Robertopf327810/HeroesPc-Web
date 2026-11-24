const { Model, DataTypes } = require('sequelize');
const { USUARIO_TABLE } = require('./usuario.model');

const PEDIDO_TABLE = 'pedidos';

const PedidoSchema = {
  id_pedido: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  id_usuario: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: USUARIO_TABLE,
      key: 'id_usuario',
    },
  },
  fecha_pedido: {
    allowNull: true,
    defaultValue: DataTypes.NOW,
    type: DataTypes.DATE,
  },
  total: {
    allowNull: false,
    type: DataTypes.DECIMAL(10, 2),
  },
  estado: {
    allowNull: false,
    defaultValue: 'pendiente',
    type: DataTypes.STRING(20),
  },
};

class Pedido extends Model {
  static associate(models) {
    this.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: 'id_usuario',
    });
    this.hasMany(models.DetallePedido, {
      as: 'detalles',
      foreignKey: 'id_pedido',
    });
    this.hasOne(models.Pago, {
      as: 'pago',
      foreignKey: 'id_pedido',
    });
    this.hasOne(models.Envio, {
      as: 'envio',
      foreignKey: 'id_pedido',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PEDIDO_TABLE,
      modelName: 'Pedido',
      timestamps: false,
    };
  }
}

module.exports = { PEDIDO_TABLE, PedidoSchema, Pedido };