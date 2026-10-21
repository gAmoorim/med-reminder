const { queryCriarMedicamentoComEsquema, queryListarMedicamentosDoUsuario, queryObterMedicamento } = require("../database/querys/queryMedicamentos");

const controllerCreateMedicamento = async (req, res) => {
    const { nome, forma, quantidade_por_dose, esquema } = req.body //"tipo_recorrencia" so pode ser fixo ou intervalo

    const {
        tipo_recorrencia, intervalo_horas, horarios_fixos,
        timezone, data_inicio, data_fim
    } = esquema || {};
    
    if (!nome || !forma || !quantidade_por_dose || !esquema) {
        return res.status(400).json({ erro: 'Campos obrigatórios faltando'})
    }

    if (!['comprimido', 'gota'].includes(forma)) {
        return res.status(400).json({ error: 'forma inválida'})
    }

    if (!['intervalo', 'horarios_fixos'].includes(tipo_recorrencia)) {
        return res.status(400).json({ erro: 'tipo_recorrencia inválido'})
    }

    if (tipo_recorrencia === 'intervalo' && !intervalo_horas) {
        return res.status(400).json({ erro: 'intervalo_horas é obrigatório para tipo_recorrencia = intervalo' });
    }
        
    if (tipo_recorrencia === 'horarios_fixos' && (!horarios_fixos || !horarios_fixos.length)) {
        return res.status(400).json({ erro: 'horarios_fixos é obrigatório para tipo_recorrencia = horarios_fixos' });
    }

    if (!timezone || !data_inicio) {
        return res.status(400).json({ erro: 'timezone e data_inicio são obrigatórios' });
    }

    try {
        const usuarioId = req.usuario.id
        const resultado = await queryCriarMedicamentoComEsquema(usuarioId, {nome, forma, quantidade_por_dose}, esquema)

        if (!resultado) {
            return res.status(404).json({ error: 'Nenhum medicamento encontrado'})
        }

        return res.status(201).json({ mensagem: 'Medicamento criado', resultado})
    } catch (error) {
        console.error("Ocorreu um erro ao criar o medicamento:", error)
        return res.status(500).json({ error: `Erro ao criar o medicamento: ${error.message}`})
    }
}

const controllerListarMedicamentos = async (req, res) => {
    try {
        const usuarioId = req.usuario.id

        const medicamentos = await queryListarMedicamentosDoUsuario(usuarioId)

        if (!medicamentos) {
            return res.status(404).json({error: 'Nenhum medicamento encontrado'})
        }

        return res.status(200).json({ mensagem: 'Medicamentos encontrados', medicamentos})
    } catch (error) {
        console.error("Ocorreu um erro ao listar os medicamentos:", error)
        return res.status(500).json({ error: `Erro ao listar os medicamentos: ${error.message}`})
    }
}

const controllerObterMedicamento = async (req, res) => {
    const {medicamentoId} = req.params
    const usuarioId = req.usuario.id

    if (!medicamentoId) {
        return res.status(400).json({ error: 'Informe o id do medicamento'})
    }

    try {
        const medicamento = await queryObterMedicamento(usuarioId, medicamentoId)

        if (!medicamento) {
            return res.status(404).json({ erro: 'Medicamento não encontrado' })
        }

        return res.status(200).json({ mensagem: 'Medicamento encontrado', medicamento})
    } catch (error) {
        console.error("Ocorreu um erro ao obter o medicamento:", error)
        return res.status(500).json({ error: `Erro ao obter o medicamento: ${error.message}`})
    }
}

const controllerAtualizarMedicamento = async (req, res) => {
    const { nome, forma, quantidade_por_dose } = req.body
}

module.exports = {
    controllerCreateMedicamento,
    controllerListarMedicamentos,
    controllerObterMedicamento
}