//CREO QUE ESTOS MODELOS DEBERÍAN ESTAR EN UNA BASES DE DATOS
module.exports = {
    id: 'cult_intro',
    name: 'Modelo básico cultivo a introducida',
    descripcion: 'Modelo general de flujo génico propuesto para un cultivo donador hacia una especie receptora introducida en Chile',
    restriccion: {
        //properties.id presentes en las especies
        donador: ['cult'],
        receptor: ['int']
    },
    tipos: [
        {
            id: 'Itipoc',
            name: 'Tipo de especie',
            ponderacion: 1,
            descripcion: '',
            properties: [
                {
                    id: 'ag',
                    name: 'Agrícola',
                    pondCientifico: 2,
                    pondGrupo: 1
                },
                {
                    id: 'or',
                    name: 'Ornamental',
                    pondCientifico: 1,
                    pondGrupo: 1
                },
                {
                    id: 'fo',
                    name: 'Forestal',
                    pondCientifico: 1,
                    pondGrupo: 1
                },
                {
                    id: 'me',
                    name: 'Medicinal',
                    pondCientifico: 2,
                    pondGrupo: 1
                },
                {
                    id: 'ma',
                    name: 'Maleza',
                    pondCientifico: 5,
                    pondGrupo: 1
                }
            ]
        },
        {
            id: 'Inatu',
            name: 'Tipo Naturalizada',
            ponderacion: 1,
            descripcion: '',
            properties: [
                {
                    id: 'natu',
                    name: 'Naturalizada',
                    pondCientifico: 4,
                    pondGrupo: 1
                }
            ]
        }
    ]
}