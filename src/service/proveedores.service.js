const { models } = require('../libs/sequelize');

class proveedoresService {
    constructor(){}

    async findAll() {
        return models.Proveedores.findAll();
    }

    async findOne(id) {
        return models.Proveedores.findByPk(id);
    }

    async create(data) {
        const res = await models.Proveedores.create(data);
        return res;
    }

    async update(id, data) {
        const proveedor = await this.findOne(id);
        if (!proveedor) return null;

        return proveedor.update(data);
    }

    async delete(id) {
        const proveedor = await this.findOne(id);
        if (!proveedor) return null;

        await proveedor.destroy();
        return proveedor;
    }
}

module.exports = proveedoresService;