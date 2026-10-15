const controllerTeste = async (req, res) => {
    const a = 'testado'

    return res.status(200).json(a)
}

module.exports = {
    controllerTeste
}