const { Model, DataTypes } = require('sequelize');
const { PEDIDO_TABLE } = require('./pedido.model');
const { PRODUCTO_TABLE } = require('./producto.model');

const DETALLE_PEDIDO_TABLE = 'detalle_pedidos';

const DetallePedidoSchema = {
  id_detalle: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  id_pedido: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: PEDIDO_TABLE,
      key: 'id_pedido',
    },
  },
  id_producto: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: PRODUCTO_TABLE,
      key: 'id_producto',
    },
  },
  cantidad: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  precio_unitario: {
    allowNull: false,
    type: DataTypes.DECIMAL(10, 2),
  },
};

class DetallePedido extends Model {
  static associate(models) {
    this.belongsTo(models.Pedido, {
      as: 'pedido',
      foreignKey: 'id_pedido',
    });
    this.belongsTo(models.Producto, {
      as: 'producto',
      foreignKey: 'id_producto',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: DETALLE_PEDIDO_TABLE,
      modelName: 'DetallePedido',
      timestamps: false,
    };
  }
}

module.exports = { DETALLE_PEDIDO_TABLE, DetallePedidoSchema, DetallePedido };