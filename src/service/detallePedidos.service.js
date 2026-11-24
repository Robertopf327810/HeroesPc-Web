const { models } = require('../libs/sequelize');

class detallePedidosService {
    constructor(){}

    async findAll() {
        return models.DetallePedidos.findAll();
    }

    async findOne(id) {
        return models.DetallePedidos.findByPk(id);
    }

    async create(data) {
        const res = await models.DetallePedidos.create(data);
        return res;
    }

    async update(id, data) {
        const detallePedido = await this.findOne(id);
        if (!detallePedido) return null;

        return detallePedido.update(data);
    }

    async delete(id) {
        const detallePedido = await this.findOne(id);
        if (!detallePedido) return null;

        await detallePedido.destroy();
        return detallePedido;
    }
}

module.exports = detallePedidosService;