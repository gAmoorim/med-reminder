const express = require('express')
const auth = require('../middlewares/auth')
const { controllerRegister } = require('../controllers/controllerUsuarios')
const { controllerCreateMedicamento, controllerListarMedicamentos } = require('../controllers/controllerMedicamentos')
const { controllerLoginUsuario } = require('../controllers/controllerLogin')

const routers = express()

routers.post('/login', controllerLoginUsuario)
routers.post('/register', controllerRegister)

//rotas direcionadas a medicamentos
routers.post('/medicamentos', auth, controllerCreateMedicamento)
routers.get('/medicamentos', auth, controllerListarMedicamentos)

module.exports = routers