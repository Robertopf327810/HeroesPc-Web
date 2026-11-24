const { Model, DataTypes } = require('sequelize');
const { PEDIDO_TABLE } = require('./pedido.model');

const ENVIO_TABLE = 'envios';

const EnvioSchema = {
  id_envio: {
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
  empresa_paqueteria: {
    allowNull: false,
    type: DataTypes.STRING(80),
  },
  numero_guia: {
    allowNull: true,
    type: DataTypes.STRING(100),
    unique: true,
  },
  direccion_entrega: {
    allowNull: false,
    type: DataTypes.TEXT,
  },
  estado_envio: {
    allowNull: false,
    defaultValue: 'preparando',
    type: DataTypes.STRING(20),
  },
  fecha_envio: {
    allowNull: true,
    type: DataTypes.DATE,
  },
  fecha_entrega_estimada: {
    allowNull: true,
    type: DataTypes.DATEONLY,
  },
};

class Envio extends Model {
  static associate(models) {
    this.belongsTo(models.Pedido, {
      as: 'pedido',
      foreignKey: 'id_pedido',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ENVIO_TABLE,
      modelName: 'Envio',
      timestamps: false,
    };
  }
}

module.exports = { ENVIO_TABLE, EnvioSchema, Envio };