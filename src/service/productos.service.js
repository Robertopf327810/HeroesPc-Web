const sequelize = require('../libs/sequelize');

const getProductoModel = () => {
  return (
    sequelize.models.Producto ||
    sequelize.models.Productos ||
    Object.values(sequelize.models).find((m) => m.tableName === 'productos')
  );
};

class ProductosService {
  constructor() {}

  async findAll() {
    const Model = getProductoModel();
    return Model.findAll();
  }

  async findOne(id) {
    const Model = getProductoModel();
    return Model.findByPk(id);
  }

  async create(data) {
    const Model = getProductoModel();
    const res = await Model.create(data);
    return res;
  }

  async update(id, data) {
    const producto = await this.findOne(id);
    if (!producto) return null;

    return producto.update(data);
  }

  async delete(id) {
    const producto = await this.findOne(id);
    if (!producto) return null;

    await producto.destroy();
    return producto;
  }
}

module.exports = ProductosService;