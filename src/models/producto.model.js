const { Model, DataTypes } = require('sequelize');
const { CATEGORIA_TABLE } = require('./categoria.model');
const { PROVEEDOR_TABLE } = require('./proveedor.model');

const PRODUCTO_TABLE = 'productos';

const ProductoSchema = {
  id_producto: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  id_categoria: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CATEGORIA_TABLE,
      key: 'id_categoria',
    },
  },
  id_proveedor: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: PROVEEDOR_TABLE,
      key: 'id_proveedor',
    },
  },
  sku: {
    allowNull: false,
    type: DataTypes.STRING(50),
    unique: true,
  },
  nombre: {
    allowNull: false,
    type: DataTypes.STRING(150),
  },
  descripcion: {
    allowNull: true,
    type: DataTypes.TEXT,
  },
  precio: {
    allowNull: false,
    type: DataTypes.DECIMAL(10, 2),
  },
  stock: {
    allowNull: false,
    defaultValue: 0,
    type: DataTypes.INTEGER,
  },
  imagen_url: {
    allowNull: true,
    type: DataTypes.STRING(255),
  },
  activo: {
    allowNull: false,
    defaultValue: true,
    type: DataTypes.BOOLEAN,
  },
};

class Producto extends Model {
  static associate(models) {
    this.belongsTo(models.Categoria, {
      as: 'categoria',
      foreignKey: 'id_categoria',
    });
    this.belongsTo(models.Proveedor, {
      as: 'proveedor',
      foreignKey: 'id_proveedor',
    });
    this.hasMany(models.DetallePedido, {
      as: 'detalles',
      foreignKey: 'id_producto',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PRODUCTO_TABLE,
      modelName: 'Producto',
      timestamps: false,
    };
  }
}

module.exports = { PRODUCTO_TABLE, ProductoSchema, Producto };