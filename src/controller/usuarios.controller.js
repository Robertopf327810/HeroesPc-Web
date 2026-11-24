const UsuariosService = require('../service/usuarios.service');
const service = new UsuariosService();

const create = async (req, res) => {
  try {
    //verifica que el nombre, apellido, correo y contraseña no esten vacios y sean string
    if (!req.body.nombre || typeof req.body.nombre !== 'string') {
      return res.status(400).send({ success: false, message: 'El nombre es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.apellido || typeof req.body.apellido !== 'string') {
      return res.status(400).send({ success: false, message: 'El apellido es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.correo || typeof req.body.correo !== 'string') {
      return res.status(400).send({ success: false, message: 'El correo es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.contraseña || typeof req.body.contraseña !== 'string') {
      return res.status(400).send({ success: false, message: 'La contraseña es requerida y debe ser una cadena de texto' });
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
    //verifica que el nombre, apellido, correo y contraseña no esten vacios y sean string
    if (!req.body.nombre || typeof req.body.nombre !== 'string') {
      return res.status(400).send({ success: false, message: 'El nombre es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.apellido || typeof req.body.apellido !== 'string') {
      return res.status(400).send({ success: false, message: 'El apellido es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.correo || typeof req.body.correo !== 'string') {
      return res.status(400).send({ success: false, message: 'El correo es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.contraseña || typeof req.body.contraseña !== 'string') {
      return res.status(400).send({ success: false, message: 'La contraseña es requerida y debe ser una cadena de texto' });
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