const { queryBuscarUsuarioPeloEmail, queryCadastrarUsuario } = require("../database/queryUsuarios")
const { validarEmail } = require('../utils/validations')
const bcrypt = require('bcrypt')

const controllerRegister = async (req, res) => {
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Preencha todos os campos'})
    }

    if (senha.length < 8) {
        return res.status(400).json({ error: 'A senha deve conter no mínimo 8 caracteres'})
    }

    if (!validarEmail(email)) {
        return res.status(400).json({ error: 'Formato de email inválido'})
    }

    try {
        const emailFormatado = email.toLowerCase().trim()
        const emailInformado = await queryBuscarUsuarioPeloEmail(emailFormatado)

        if (emailInformado) {
            return res.status(400).json({ error: 'Email já cadastrado'})
        }

        const senha_hash = await bcrypt.hash(senha, 10)
        const usuarioRegistrado = await queryCadastrarUsuario(nome, emailFormatado, senha_hash)

        return res.status(201).json({ mensagem: 'Registro confirmado', usuarioRegistrado})
    } catch (error) {
        console.error("Ocorreu um erro ao se registrar:", error)
        return res.status(500).json({ error: `Erro ao se registrar: ${error.message}`})
    }
}

module.exports = {
    controllerRegister
}