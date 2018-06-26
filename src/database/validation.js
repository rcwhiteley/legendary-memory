const log = require('../config/logger');
const db = require('./mysqldal');

/**
 *
 * @param partido datos de partido que se validara
 * @param callback funcion que recibira un booleano indicando si el partido
 * es valido para insertar
 */
exports.validarPartido = function validarPartido(partido, callback){
    log.debug("validando partido", JSON.stringify(partido));
    db.getTeamsInTourny(1, (err, res)=>{
        let existeLocal = false;
        let existeVisita = false;
        for(let i = 0; i < res.length; i++){
            if(res[i].equipos_nombre === partido.local){
                existeLocal = true;
            }
            if(res[i].equipos_nombre !== partido.visita){
                existeVisita = true;
            }
        }
        if(!existeLocal){
            log.debug("no existe local");
        }

        if(!existeVisita){
            log.debug("no existe visita");
        }
        if(partido.local === partido.visita){
            log.debug("los equipos son iguales");
        }
        callback(existeLocal === true && existeVisita === true && partido.local !== partido.visita);

    });

}