const sequelize = require('../libs/sequelize');

const getCategoriaModel = () => {
  return (
    sequelize.models.Categoria ||
    sequelize.models.Categorias ||
    Object.values(sequelize.models).find((m) => m.tableName === 'categorias')
  );
};

class categoriasService {
  constructor() {}

  async findAll() {
    const Model = getCategoriaModel();
    return Model.findAll({ order: [['id_categoria', 'ASC']] });
  }

  async findOne(id) {
    const Model = getCategoriaModel();
    return Model.findByPk(id);
  }

  async create(data) {
    const Model = getCategoriaModel();
    const res = await Model.create(data);
    return res;
  }

  async update(id, data) {
    const categoria = await this.findOne(id);
    if (!categoria) return null;

    return categoria.update(data);
  }

  async delete(id) {
    const categoria = await this.findOne(id);
    if (!categoria) return null;

    await categoria.destroy();
    return categoria;
  }
}

module.exports = categoriasService;