const express = require('express')
const { controllerTeste } = require('../controllers/controllerTeste')


const routers = express()


routers.get('/teste', controllerTeste)

module.exports = routers