//CREO QUE ESTOS MODELOS DEBERÍAN ESTAR EN UNA BASES DE DATOS
module.exports = {
    id: 'cult_cult',
    name: 'Modelo básico cultivo a cultivo',
    descripcion: 'Modelo general de flujo génico propuesto para un cultivo donador hacia un cultivo receptor presente en Chile',
    restriccion: {
        //properties.id presentes en las especies
        donador: ['cult'],
        receptor: ['cultc']
    },
    tipos: [
        {
            id: 'CtipO',
            name: 'Tipo de Origen',
            ponderacion: 1,
            descripcion: '',
            properties: [
                {
                    id: 'en',
                    name: 'Endémica',
                    pondCientifico: 5,
                    pondGrupo: 1
                },
                {
                    id: 'nati',
                    name: 'Nativa',
                    pondCientifico: 4,
                    pondGrupo: 1
                },
                {
                    id: 'in',
                    name: 'Introducida',
                    pondCientifico: 1,
                    pondGrupo: 1
                },
                {
                    id: 'natu',
                    name: 'Naturalizada',
                    pondCientifico: 3,
                    pondGrupo: 1
                }
            ]
        },
        {
            id: 'CtipR',
            name: 'Tipo de reproducción',
            ponderacion: 1,
            descripcion: '',
            properties: [
                {
                    id: 'se',
                    name: 'Sexual',
                    pondCientifico: 3,
                    pondGrupo: 1
                },
                {
                    id: 've',
                    name: 'Vegetativa',
                    pondCientifico: 4,
                    pondGrupo: 1
                }
            ]
        },
        {
            id: 'Ccv',
            name: 'Ciclo de vida',
            ponderacion: 1,
            descripcion: '',
            properties: [
                {
                    id: 'an',
                    name: 'Anual',
                    pondCientifico: 3,
                    pondGrupo: 1
                },
                {
                    id: 'bi',
                    name: 'Bianual',
                    pondCientifico: 3,
                    pondGrupo: 1
                },
                {
                    id: 'pe',
                    name: 'Perenne',
                    pondCientifico: 2,
                    pondGrupo: 1
                },
                {
                    id: 'bu',
                    name: 'Bulbosa',
                    pondCientifico: 2,
                    pondGrupo: 1
                }
            ]
        },
        {
            id: 'CtipP',
            name: 'Tipo de polinización',
            ponderacion: 1,
            descripcion: '',
            properties: [
                {
                    id: 'ang',
                    name: 'Autógama',
                    pondCientifico: 1,
                    pondGrupo: 1
                },
                {
                    id: 'alg',
                    name: 'Alógama',
                    pondCientifico: 4,
                    pondGrupo: 1
                }
            ]
        },
        {
            id: 'CagP',
            name: 'Agente polinizante',
            ponderacion: 1,
            descripcion: '',
            properties: [
                {
                    id: 'ent',
                    name: 'Entomófila',
                    pondCientifico: 3,
                    pondGrupo: 1
                },
                {
                    id: 'ane',
                    name: 'Anemófila',
                    pondCientifico: 2,
                    pondGrupo: 1
                },
                {
                    id: 'art',
                    name: 'Artificial',
                    pondCientifico: 1,
                    pondGrupo: 1
                }
            ]
        },
        {
            id: 'Cland',
            name: 'Landrace',
            ponderacion: 1,
            descripcion: '',
            properties: [
                {
                    id: 'lan',
                    name: 'Landrace',
                    pondCientifico: 4,
                    pondGrupo: 1
                }
            ]
        },
        {
            id: 'CtipC',
            name: 'Tipo de cultivo',
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
                    id: 'ma',
                    name: 'Maleza',
                    pondCientifico: 5,
                    pondGrupo: 1
                },
            ]
        }
    ]
}