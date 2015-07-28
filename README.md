# Flujo Genico 2.0
Proyecto de Investigación "Internet para el desarrollo agrícola de Chile"

En Chile, como en otros países, el cultivo y manejo de especies genéticamente modificadas (GM) debe realizarse respetando lo establecido por el Protocolo de Cartagena sobre Bioseguridad y otros acuerdos o reglamentos nacionales e internacionales. La incorporación de los cultivos vegetales GM ha obligado a la reformulación de los sistemas de evaluación y análisis de riesgos relacionados con el efecto de este tipo de agricultura sobre la biodiversidad.

Internet para el desarrollo agrícola de Chile es una iniciativa desarrollada por investigadores del Instituto de Investigaciones Agropecuarias donde se recopila el resultado de diversos trabajos, desarrollados en colaboración con otras instituciones chilenas del sector público, para proporcionar información local, metodologías y herramientas científicas que, de manera transparente, faciliten la toma de decisiones en dos áreas de interés: la evaluación de riesgo ambiental de las especies vegetales GM sobre la biodiversidad y la co-existencia entre distintos sistema agrícolas.

## Tecnologías utilizadas

###Instalacion con Yeoman
* ui-router
* socket.io

### UI Framework 
Angular Material 
> installation : bower install angular-material --save

### Documentation tool
ngDocs
> installation : npm install grunt-ngdocs --save-dev
Configuration Gruntfile.js
```
    grunt.initConfig({
      ...},
      ngdocs: {
            all: ['client/app/**/*.js']
      },
    })
 
    grunt.registerTask( 'ngDocs', ['ngdocs:all']);
```
### Test framework
KarmaJS
