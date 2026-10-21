const knex = require('../connection')

const queryBuscarUsuarioPeloId = async (usuarioId) => {
    return await knex('usuarios')
    .select('id', 'nome', 'email', 'created_at')
    .where({ id: usuarioId})
    .first()
}

const queryBuscarUsuarioPeloEmail = async (emailFormatado) => {
    return await knex('usuarios')
    .select('id', 'nome', 'email', 'created_at', 'senha_hash')
    .where({ email: emailFormatado})
    .first()
}

const queryCadastrarUsuario = async (nome, emailFormatado, senha_hash) => {
    return await knex('usuarios')
    .insert({nome, email: emailFormatado, senha_hash})
    .returning(['id', 'nome', 'email'])
}


module.exports = {
    queryBuscarUsuarioPeloId,
    queryBuscarUsuarioPeloEmail,
    queryCadastrarUsuario
}