const { models } = require('../libs/sequelize');

class usuariosService {
    constructor(){}

    async findAll() {
        return models.Usuarios.findAll();
    }

    async findOne(id) {
        return models.Usuarios.findByPk(id);
    }

    async create(data) {
        const res = await models.Usuarios.create(data);
        return res;
    }

    async update(id, data) {
        const usuario = await this.findOne(id);
        if (!usuario) return null;

        return usuario.update(data);
    }

    async delete(id) {
        const usuario = await this.findOne(id);
        if (!usuario) return null;
        
        await usuario.destroy();
        return usuario;
    }
}

module.exports = usuariosService;