const productosService = require('../service/productos.service');
const service = new productosService();

const create = async (req, res) => {
  try {
    //verifica que el nombre_producto, descripcion, precio, stock y id_categoria no esten vacios y sean string
    if (!req.body.nombre_producto || typeof req.body.nombre_producto !== 'string') {
      return res.status(400).send({ success: false, message: 'El nombre del producto es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.descripcion || typeof req.body.descripcion !== 'string') {
      return res.status(400).send({ success: false, message: 'La descripción del producto es requerida y debe ser una cadena de texto' });
    }
    if (!req.body.precio || typeof req.body.precio !== 'number') {
      return res.status(400).send({ success: false, message: 'El precio del producto es requerido y debe ser un número' });
    }
    if (!req.body.stock || typeof req.body.stock !== 'number') {
      return res.status(400).send({ success: false, message: 'El stock del producto es requerido y debe ser un número' });
    }
    if (!req.body.id_categoria || typeof req.body.id_categoria !== 'number') {
      return res.status(400).send({ success: false, message: 'El id de la categoría es requerido y debe ser un número' });
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