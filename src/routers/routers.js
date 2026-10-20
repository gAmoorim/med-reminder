const express = require('express')
const { controllerRegister } = require('../controllers/controllerUsuarios')

const routers = express()

routers.post('/register', controllerRegister)

module.exports = routers