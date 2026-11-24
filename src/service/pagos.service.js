const { models } = require('../libs/sequelize');

class pagosService {
    constructor(){}

    async findAll() {
        return models.Pagos.findAll();
    }

    async findOne(id) {
        return models.Pagos.findByPk(id);
    }

    async create(data) {
        const res = await models.Pagos.create(data);
        return res;
    }

    async update(id, data) {
        const pago = await this.findOne(id);
        if (!pago) return null;

        return pago.update(data);
    }

    async delete(id) {
        const pago = await this.findOne(id);
        if (!pago) return null;

        await pago.destroy();
        return pago;
    }
}

module.exports = pagosService;