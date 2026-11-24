const categoriasService = require('../service/categorias.service');
const service = new categoriasService();

const create = async (req, res) => {
  try {
    //verifica que el nombre_categoria y descripcion no esten vacios y sean string
    if (!req.body.nombre_categoria || typeof req.body.nombre_categoria !== 'string') {
      return res.status(400).send({ success: false, message: 'El nombre de la categoría es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.descripcion || typeof req.body.descripcion !== 'string') {
      return res.status(400).send({ success: false, message: 'La descripción de la categoría es requerida y debe ser una cadena de texto' });
    }

    const response = await service.create(req.body);
    res.json({ success: true, data: response });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const get = async (req, res) => {
  try {
    const response = await service.findAll();
    res.json(response);
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const response = await service.findOne(req.params.id);
    res.json(response);
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    //verifica que el nombre_categoria y descripcion no esten vacios y sean string
    if (!req.body.nombre_categoria || typeof req.body.nombre_categoria !== 'string') {
      return res.status(400).send({ success: false, message: 'El nombre de la categoría es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.descripcion || typeof req.body.descripcion !== 'string') {
      return res.status(400).send({ success: false, message: 'La descripción de la categoría es requerida y debe ser una cadena de texto' });
    }
    const response = await service.update(req.params.id, req.body);
    res.json(response);
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const _delete = async (req, res) => {
  try {
    const response = await service.delete(req.params.id);
    res.json(response);
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

module.exports = {
  create,
  get,
  getById,
  update,
  _delete,
};