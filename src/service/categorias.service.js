const { models } = require('../libs/sequelize');

class categoriasService {
    constructor(){}

    async findAll() {
        return models.Categorias.findAll();
    }

    async findOne(id) {
        return models.Categorias.findByPk(id);
    }

    async create(data) {
        const res = await models.Categorias.create(data);
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