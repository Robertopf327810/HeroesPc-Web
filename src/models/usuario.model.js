const { Model, DataTypes } = require('sequelize');

const USUARIO_TABLE = 'usuarios';

const UsuarioSchema = {
  id_usuario: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nombre: {
    allowNull: false,
    type: DataTypes.STRING(100),
  },
  email: {
    allowNull: false,
    type: DataTypes.STRING(150),
    unique: true,
  },
  password_hash: {
    allowNull: false,
    type: DataTypes.STRING(255),
  },
  telefono: {
    allowNull: true,
    type: DataTypes.STRING(20),
  },
  direccion: {
    allowNull: true,
    type: DataTypes.TEXT,
  },
  rol: {
    allowNull: false,
    defaultValue: 'cliente',
    type: DataTypes.STRING(20),
  },
  fecha_registro: {
    allowNull: true,
    defaultValue: DataTypes.NOW,
    type: DataTypes.DATE,
  },
};

class Usuario extends Model {
  static associate(models) {
    this.hasMany(models.Pedido, {
      as: 'pedidos',
      foreignKey: 'id_usuario',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: USUARIO_TABLE,
      modelName: 'Usuario',
      timestamps: false,
    };
  }
}

module.exports = { USUARIO_TABLE, UsuarioSchema, Usuario };