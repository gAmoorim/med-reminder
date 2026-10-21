const knex = require('../connection')

const queryCriarMedicamentoComEsquema = async (usuarioId, dadosMedicamento, dadosEsquema) => {
    return knex.transaction(async (trx) => {
        const [medicamento] = await trx('medicamentos')
            .insert({ ...dadosMedicamento, usuario_id: usuarioId })
            .returning(['id', 'nome', 'forma', 'quantidade_por_dose'])

        const [esquema] = await trx('esquemas')
            .insert({ ...dadosEsquema, medicamento_id: medicamento.id, ativo: true })
            .returning(['id', 'tipo_recorrencia', 'intervalo_horas', 'horarios_fixos', 'timezone', 'data_inicio', 'data_fim'])

        return { ...medicamento, esquema }
    })
}

const queryListarMedicamentosDoUsuario = async (usuarioId) => {
    const rows = await knex('medicamentos as m')
        .join('esquemas as e', 'e.medicamento_id', 'm.id')
        .where({ 'm.usuario_id': usuarioId, 'e.ativo': true })
        .select(
            'm.id',
            'm.nome',
            'm.forma',
            'm.quantidade_por_dose',
            'e.id as esquema_id',
            'e.tipo_recorrencia',
            'e.intervalo_horas',
            'e.horarios_fixos',
            'e.timezone',
            'e.data_inicio',
            'e.data_fim'
        )
        .orderBy('m.nome')

    return rows.map((r) => ({
        id: r.id,
        nome: r.nome,
        forma: r.forma,
        quantidade_por_dose: r.quantidade_por_dose,
        esquema: {
            id: r.esquema_id,
            tipo_recorrencia: r.tipo_recorrencia,
            intervalo_horas: r.intervalo_horas,
            horarios_fixos: r.horarios_fixos,
            timezone: r.timezone,
            data_inicio: r.data_inicio,
            data_fim: r.data_fim
        }
    }))
}

const queryObterMedicamento = async (usuarioId, medicamentoId) => {
    const medicamento = await knex('medicamentos')
        .where({ id: medicamentoId, usuario_id: usuarioId })
        .select('id', 'nome', 'forma', 'quantidade_por_dose')
        .first()

    if (!medicamento) return null

    const esquema = await knex('esquemas')
        .where({ medicamento_id: medicamento.id, ativo: true })
        .select('id', 'tipo_recorrencia', 'intervalo_horas', 'horarios_fixos', 'timezone', 'data_inicio', 'data_fim')
        .first()

    return { ...medicamento, esquema }
}

module.exports = { 
    queryCriarMedicamentoComEsquema,
    queryListarMedicamentosDoUsuario,
    queryObterMedicamento
}