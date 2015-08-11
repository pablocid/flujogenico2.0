//CREO QUE ESTOS MODELOS DEBERÍAN ESTAR EN UNA BASES DE DATOS
module.exports = {
    id: 'cult_nati',
    name: 'Modelo básico cultivo a nativa',
    descripcion: 'Modelo general de flujo génico propuesto para un cultivo donador hacia una especie receptora nativa de Chile',
    restriccion: {
        //properties.id presentes en las especies
        donador: ['cult'],
        receptor: ['nati']
    },
    tipos: [
        {
            id: 'NcEc',
            name: 'Estatus de conservación',
            ponderacion: 1,
            descripcion: '',
            properties: [
                {
                    id: 'ex',
                    name: 'Extinta',
                    pondCientifico: 1,
                    pondGrupo: 1
                },
                {
                    id: 'ep',
                    name: 'En peligro',
                    pondCientifico: 5,
                    pondGrupo: 1
                },
                {
                    id: 'vl',
                    name: 'Vulnerable',
                    pondCientifico: 4,
                    pondGrupo: 1
                },
                {
                    id: 'rr',
                    name: 'Rara',
                    pondCientifico: 3,
                    pondGrupo: 1
                }
            ]
        },
        {
            id: 'Nen',
            name: 'Endemismo',
            ponderacion: 1,
            descripcion: '',
            properties: [
                {
                    id: 'en',
                    name: 'Endemica',
                    pondCientifico: 2,
                    pondGrupo: 1
                }
            ]
        }
    ]
}