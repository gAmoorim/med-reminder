const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const senhaJWT = process.env.JWT_PWD
const { queryBuscarUsuarioPeloEmail } = require('../database/querys/queryUsuarios')

const controllerLoginUsuario = async (req, res) => {
    const { email, senha } = req.body

    if (!email || !senha) {
        return res.status(400).json({ error: 'Preencha os campos necessários'})
    }

    try {
        const usuario = await queryBuscarUsuarioPeloEmail(email.toLowerCase())

        if (!usuario) {
            return res.status(401).json({ error: 'email ou senha incorreto'})
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash)

        if (!senhaCorreta) {
            return res.status(401).json({ error: 'email ou senha incorreto'})
        }

        const dadosTokenUsuario = {
            id: usuario.id
        }

        const token = jwt.sign(dadosTokenUsuario, senhaJWT, { expiresIn: '2h' })
        const dadosUsuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }

        return res.status(300).json({
            usuario: dadosUsuario,
            token
        })
    } catch (error) {
        console.error("Erro interno do servidor:", error)
        return res.status(500).json({ error: 'Erro interno do servidor'})
    }
}

module.exports = {
    controllerLoginUsuario
}