function Modelo (config){
	this.config = config;
}

//Receptor Risk Index
Modelo.prototype.RRI = function RRI (Receptor){
	//fitro de las propiedades presentes
	var propiedades = this.tiposReceptorFilter(Receptor);
	//calculo con las propiedades presentes
	var resultado = this.calculoRRI(propiedades);

  if(!resultado){ return 0;}
  if(resultado ==='noProp'){ return 'noProp';}

	return resultado.toFixed(2);
};

/*
Modelo.prototype.DRI = function(donor){
  function filterPropDonor(p){return p.id==='fg';}
  var flujo = donor.properties.filter(filterPropDonor);
  var ScaleMaxValue = 5;
  if(flujo.length===0){return 1/ScaleMaxValue;}

  return flujo[0].weight/ScaleMaxValue;
};

Modelo.prototype.RI = function(){

};
*/
Modelo.prototype.tiposReceptorFilter = function tiposReceptorFilter(Receptor){
	var tipos = this.config.tipos;
	var propiedades = Receptor.properties;

	function fitroProp (tipo){

		function presencia(c){
			//hace coincidir los id de las propiedades con el modelo
			// funcion auxiliar
			return isInArrayObjById(propiedades,c.id);
		}

		//
		var properties = tipo.properties.filter(presencia);

		//si el tipo presenta caracteristicas
		if(properties.length){
			tipo.properties = properties;
			return tipo;
		}
	}

	return tipos.map(fitroProp).filter(function(t){ return t});
};

Modelo.prototype.calculoRRI = function calculoRRI (propiedades){
	//formula
	// sum / sumPond
  if(propiedades.length===0){return 'noProp';}

	function sumar (a,b){
		return a+b;
	}

	function typeMap (type){
		//formula | typePond: ponderacion del tipo | sPn: suma de los ponderadores de properties |
		//( suma/(sPn*5) )*typePond

		//array de pondCientifico*pondGrupo
		function caractMap (caract){
			return caract.pondCientifico*caract.pondGrupo;
		}
		//array de ponderadores
		function caractPondMap (caract){
			return caract.pondGrupo;
		}

		//número de características del tipo
		var num = type.properties.length;

		//sumatoria ponderada de caracteristicas
		var sum = type.properties.map(caractMap).reduce(sumar);

		//suma de ponderadores
		var sPn = type.properties.map(caractPondMap).reduce(sumar);

		return ( sum/(sPn*5) )*type.ponderacion;
	}

	//array de ponderadores
	function typePondMap (type){
		return type.ponderacion;
	}

	//suma de caracteristicas * ponderacion tipo
	var sum = propiedades.map(typeMap).reduce(sumar);
	//suma de ponderadores del tipo
	var sumPond = propiedades.map(typePondMap).reduce(sumar);

	return sum/sumPond;
};

// funcion auxiliar
function isInArrayObjById(array,value){
	for (var i = array.length - 1; i >= 0; i--) {
		if(array[i].id===value){
			return true
		}
	}
	return false
}

module.exports = Modelo;
