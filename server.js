const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./src/libs/sequelize');
const routerApi = require('./src/router');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

routerApi(app);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Servidor HeroesPC_Web activo');
});

routerApi(app);

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Conexión a la base de datos establecida correctamente');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error de conexión:', error.message);
    process.exit(1); 
  }
}

startServer();