const enviosService = require('../service/envios.service');
const service = new enviosService();

const create = async (req, res) => {
  try {
    //verifica que el id_pedido, empresa_paqueteria, direccion_entrega y estado_envio no esten vacios y sean string
    if (!req.body.id_pedido || typeof req.body.id_pedido !== 'number') {
      return res.status(400).send({ success: false, message: 'El id del pedido es requerido y debe ser un número' });
    }
    if (!req.body.empresa_paqueteria || typeof req.body.empresa_paqueteria !== 'string') {
      return res.status(400).send({ success: false, message: 'La empresa de paquetería es requerida y debe ser una cadena de texto' });
    }
    if (!req.body.direccion_entrega || typeof req.body.direccion_entrega !== 'string') {
      return res.status(400).send({ success: false, message: 'La dirección de entrega es requerida y debe ser una cadena de texto' });
    }
    if (!req.body.estado_envio || typeof req.body.estado_envio !== 'string') {
      return res.status(400).send({ success: false, message: 'El estado del envío es requerido y debe ser una cadena de texto' });
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
    //verifica que el id_pedido, empresa_paqueteria, direccion_entrega y estado_envio no esten vacios y sean string
    if (!req.body.id_pedido || typeof req.body.id_pedido !== 'number') {
      return res.status(400).send({ success: false, message: 'El id del pedido es requerido y debe ser un número' });
    }
    if (!req.body.empresa_paqueteria || typeof req.body.empresa_paqueteria !== 'string') {
      return res.status(400).send({ success: false, message: 'La empresa de paquetería es requerida y debe ser una cadena de texto' });
    }
    if (!req.body.direccion_entrega || typeof req.body.direccion_entrega !== 'string') {
      return res.status(400).send({ success: false, message: 'La dirección de entrega es requerida y debe ser una cadena de texto' });
    }
    if (!req.body.estado_envio || typeof req.body.estado_envio !== 'string') {
      return res.status(400).send({ success: false, message: 'El estado del envío es requerido y debe ser una cadena de texto' });
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