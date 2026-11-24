const { models } = require('../libs/sequelize');

class pedidosService {
    constructor(){}

    async findAll() {
        return models.Pedidos.findAll();
    }

    async findOne(id) {
        return models.Pedidos.findByPk(id);
    }

    async create(data) {
        const res = await models.Pedidos.create(data);
        return res;
    }

    async update(id, data) {
        const pedidos = await this.findOne(id);
        if (!pedidos) return null;

        return pedidos.update(data);
    }

    async delete(id) {
        const pedidos = await this.findOne(id);
        if (!pedidos) return null;

        await pedidos.destroy();
        return pedidos;
    }
}

module.exports = pedidosService;