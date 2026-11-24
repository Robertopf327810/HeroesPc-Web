const { Model, DataTypes } = require('sequelize');

const PROVEEDOR_TABLE = 'proveedores';

const ProveedorSchema = {
  id_proveedor: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nombre_empresa: {
    allowNull: false,
    type: DataTypes.STRING(120),
  },
  contacto_nombre: {
    allowNull: true,
    type: DataTypes.STRING(100),
  },
  telefono: {
    allowNull: true,
    type: DataTypes.STRING(20),
  },
  email: {
    allowNull: true,
    type: DataTypes.STRING(150),
  },
  direccion: {
    allowNull: true,
    type: DataTypes.TEXT,
  },
};

class Proveedor extends Model {
  static associate(models) {
    this.hasMany(models.Producto, {
      as: 'productos',
      foreignKey: 'id_proveedor',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PROVEEDOR_TABLE,
      modelName: 'Proveedor',
      timestamps: false,
    };
  }
}

module.exports = { PROVEEDOR_TABLE, ProveedorSchema, Proveedor };