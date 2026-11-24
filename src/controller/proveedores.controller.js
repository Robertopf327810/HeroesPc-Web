const proveedoresService = require('../service/proveedores.service');
const service = new proveedoresService();

const create = async (req, res) => {
  try {
    //verifica que el nombre_proveedor, direccion, telefono y email no esten vacios y sean string
    if (!req.body.nombre_proveedor || typeof req.body.nombre_proveedor !== 'string') {
      return res.status(400).send({ success: false, message: 'El nombre del proveedor es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.direccion || typeof req.body.direccion !== 'string') {
      return res.status(400).send({ success: false, message: 'La dirección es requerida y debe ser una cadena de texto' });
    }
    if (!req.body.telefono || typeof req.body.telefono !== 'string') {
      return res.status(400).send({ success: false, message: 'El teléfono es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.email || typeof req.body.email !== 'string') {
      return res.status(400).send({ success: false, message: 'El email es requerido y debe ser una cadena de texto' });
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
    //verifica que el nombre_proveedor, direccion, telefono y email no esten vacios y sean string
    if (!req.body.nombre_proveedor || typeof req.body.nombre_proveedor !== 'string') {
      return res.status(400).send({ success: false, message: 'El nombre del proveedor es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.direccion || typeof req.body.direccion !== 'string') {
      return res.status(400).send({ success: false, message: 'La dirección es requerida y debe ser una cadena de texto' });
    }
    if (!req.body.telefono || typeof req.body.telefono !== 'string') {
      return res.status(400).send({ success: false, message: 'El teléfono es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.email || typeof req.body.email !== 'string') {
      return res.status(400).send({ success: false, message: 'El email es requerido y debe ser una cadena de texto' });
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