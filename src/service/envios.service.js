const { models } = require('../libs/sequelize');

class enviosService {
    constructor(){}

    async findAll() {
        return models.Envios.findAll();
    }

    async findOne(id) {
        return models.Envios.findByPk(id);
    }

    async create(data) {
        const res = await models.Envios.create(data);
        return res;
    }

    async update(id, data) {
        const envio = await this.findOne(id);
        if (!envio) return null;

        return envio.update(data);
    }

    async delete(id) {
        const envio = await this.findOne(id);
        if (!envio) return null;

        await envio.destroy();
        return envio;
    }
}

module.exports = enviosService;