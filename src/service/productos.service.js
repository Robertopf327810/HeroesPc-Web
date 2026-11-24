const { models } = require('../libs/sequelize');

class productosService {
    constructor(){}

    async findAll() {
        return models.Productos.findAll();
    }

    async findOne(id) {
        return models.Productos.findByPk(id);
    }

    async create(data) {
        const res = await models.Productos.create(data);
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

module.exports = productosService;