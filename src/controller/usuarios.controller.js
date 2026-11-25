const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const sequelize = require('../libs/sequelize');
const UsuariosService = require('../service/usuarios.service');

const service = new UsuariosService();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getUserModel = () => {
  return (
    sequelize.models.Usuario ||
    sequelize.models.Usuarios ||
    sequelize.models.usuario ||
    Object.values(sequelize.models).find((m) => m.tableName === 'usuarios')
  );
};

const setAuthCookie = (res, user) => {
  const userEmail = user.email || user.correo;
  const token = jwt.sign(
    {
      id_usuario: user.id_usuario,
      correo: userEmail,
      email: userEmail,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('heroespc_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const login = async (req, res) => {
  try {
    const { correo, email, contraseña, password } = req.body;
    const targetEmail = (correo || email || '').toLowerCase();
    const pass = contraseña || password;

    if (!targetEmail || !pass) {
      return res.status(400).json({ success: false, message: 'Correo y contraseña requeridos' });
    }

    const UserModel = getUserModel();
    const allUsers = await UserModel.findAll();
    const user = allUsers.find(
      (u) =>
        (u.email || u.correo)?.toLowerCase() === targetEmail &&
        (u.password_hash || u.contraseña) === pass
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    setAuthCookie(res, user);
    return res.json({
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.email || user.correo,
      rol: user.rol,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential, devEmail, devName } = req.body;
    let email = '';
    let given_name = 'Usuario';
    let family_name = 'Google';

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      given_name = payload.given_name || payload.name || 'Usuario';
      family_name = payload.family_name || 'Google';
    } else if (devEmail && process.env.NODE_ENV !== 'production') {
      email = devEmail;
      given_name = devName || 'Usuario';
      family_name = 'Google';
    } else {
      return res.status(400).json({ success: false, message: 'Token o correo de Google requerido' });
    }

    const UserModel = getUserModel();
    const allUsers = await UserModel.findAll();
    let user = allUsers.find(
      (u) => (u.email || u.correo)?.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      user = await UserModel.create({
        nombre: given_name,
        apellido: family_name,
        email: email,
        password_hash: `GOOGLE_OAUTH_${Date.now()}`,
        rol: 'cliente',
      });
    }

    setAuthCookie(res, user);
    return res.json({
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.email || user.correo,
      rol: user.rol,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Error de autenticación Google: ' + error.message });
  }
};

const logout = (req, res) => {
  res.clearCookie('heroespc_token');
  return res.json({ success: true, message: 'Sesión cerrada correctamente' });
};

const me = (req, res) => {
  return res.json(req.user);
};

const create = async (req, res) => {
  try {
    const email = req.body.email || req.body.correo;
    const password_hash = req.body.password_hash || req.body.contraseña || req.body.password;

    if (!req.body.nombre || typeof req.body.nombre !== 'string') {
      return res.status(400).send({ success: false, message: 'El nombre es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.apellido || typeof req.body.apellido !== 'string') {
      return res.status(400).send({ success: false, message: 'El apellido es requerido y debe ser una cadena de texto' });
    }
    if (!email || typeof email !== 'string') {
      return res.status(400).send({ success: false, message: 'El correo es requerido y debe ser una cadena de texto' });
    }
    if (!password_hash || typeof password_hash !== 'string') {
      return res.status(400).send({ success: false, message: 'La contraseña es requerida y debe ser una cadena de texto' });
    }

    const UserModel = getUserModel();
    const response = await UserModel.create({
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      email,
      password_hash,
      rol: req.body.rol || 'cliente',
    });
    res.json({ success: true, data: response });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const get = async (req, res) => {
  try {
    const UserModel = getUserModel();
    const response = await UserModel.findAll();
    res.json(response);
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const UserModel = getUserModel();
    const response = await UserModel.findByPk(req.params.id);
    res.json(response);
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const UserModel = getUserModel();
    const user = await UserModel.findByPk(req.params.id);
    if (!user) {
      return res.status(404).send({ success: false, message: 'Usuario no encontrado' });
    }
    const response = await user.update({
      nombre: req.body.nombre || user.nombre,
      apellido: req.body.apellido || user.apellido,
      email: req.body.email || req.body.correo || user.email,
      password_hash: req.body.password_hash || req.body.contraseña || user.password_hash,
      rol: req.body.rol || user.rol,
    });
    res.json(response);
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const _delete = async (req, res) => {
  try {
    const UserModel = getUserModel();
    const user = await UserModel.findByPk(req.params.id);
    if (!user) {
      return res.status(404).send({ success: false, message: 'Usuario no encontrado' });
    }
    await user.destroy();
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  googleLogin,
  logout,
  me,
  create,
  get,
  getById,
  update,
  _delete,
};