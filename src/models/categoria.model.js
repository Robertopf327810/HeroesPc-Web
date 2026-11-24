const { Model, DataTypes } = require('sequelize');

const CATEGORIA_TABLE = 'categorias';

const CategoriaSchema = {
  id_categoria: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nombre_categoria: {
    allowNull: false,
    type: DataTypes.STRING(80),
    unique: true,
  },
  descripcion: {
    allowNull: true,
    type: DataTypes.TEXT,
  },
};

class Categoria extends Model {
  static associate(models) {
    this.hasMany(models.Producto, {
      as: 'productos',
      foreignKey: 'id_categoria',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CATEGORIA_TABLE,
      modelName: 'Categoria',
      timestamps: false,
    };
  }
}

module.exports = { CATEGORIA_TABLE, CategoriaSchema, Categoria };