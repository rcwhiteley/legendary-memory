const dbConnection = require('../config/dbConnection');
const log = require('../config/logger');
connection = dbConnection();


exports.getTournies = function (callback) {
    connection.query("SELECT * FROM torneos;", callback);
};

exports.getStandings = function (tournyId, callback) {
    connection.query(
        "select * from tablas_view where torneos_id=? order by puntos desc;", [tournyId], callback);
};

exports.getGames = function (tournyId, callback) {
    connection.query(
        "SELECT * FROM partidos_view where torneos_id=? order by fecha desc", [tournyId], callback);
};

exports.getTeamsInTourny = function (tournyId, callback) {
    connection.query(
        "select " +
        "equipos_torneos.equipos_nombre " +
        " from equipos_torneos" +
        " where equipos_torneos.torneos_id = ?;", [tournyId], callback);
};

exports.getTeams = function (callback) {
    connection.query('SELECT * FROM equipos;', callback);
};

exports.getGoalScorers = function (tournyId, callback) {
    connection.query(
        "select * from goles_view where torneos_id = ? and goles > 0 order by goles asc;", [tournyId], callback);
};

exports.addTeam = function (nombre, facultad, callback) {
    connection.query('INSERT INTO equipos values(?,?);', [nombre, facultad], callback);

};

exports.getTeamPlayersInTourny = function (tournyId, equipo, callback) {
    connection.query('select * from plantel_detalles_view where torneos_id=? and equipos_nombre=?;', [tournyId, equipo], callback);
};

exports.getSeasons = function(callback){
    connection.query("select * from temporada", callback);
}

exports.getSeasonTournaments = function(seasonId, callback){
    connection.query("select * from torneos where temporada_id=?", [seasonId], callback);
}

exports.getGameInfo = function (partido, callback) {
    connection.query("select * from( " +
        "select partidos_id, nombre, jugadores_matricula, equipos_nombre, minuto, 'gol' as evento " +
        "from goles_jugador_view as T1 " +
        "union select " +
        "partidos_id, nombre, jugadores_matricula, equipos_nombre, minuto, IF(tarjetas_id = 1, 'amarilla', 'roja') as evento " +
        "from sanciones_jugador_view as T2) as T3 " +
        "where partidos_id=? order by minuto;", [partido], callback);
};

exports.getGame = function(partido, callback){
    connection.query("select * from partidos_view where partidos_id=?", [partido], callback);
}

exports.getGameTeams = function(partido, callback){
    connection.query("select * from plantel_partido_view where partidos_id=?", [partido], callback);
}

exports.getGameSantions = function(partido, callback){
    connection.query("select * from sanciones_jugador_view where partidos_id=?", [partido], callback);
}

exports.getGameGoals = function(partido, callback){
    connection.query("select * from goles_jugador_view where partidos_id=? order by minuto asc", [partido], callback);
}

exports.getGameSubs = function(partido, callback){
    connection.query("select * from sustituciones_view where partidos_id=?", [partido], callback);
}

exports.agregarPartido = function(torneo, partido, callback){
    connection.beginTransaction(transactionErr => {
        connection.query('INSERT into partidos values(default, ?, ?)', [torneo, new Date(partido.fecha)], function (err, result) {
            if (err) {
                connection.rollback(function(){});
                log.error("fallo al insertar partido", JSON.stringify(partido), "error:", err)
                callback(-1 ,err);
                return;
            }

            let partidoId = result.insertId;
            log.debug("partidoId:", result.insertId);
            connection.query('insert into equipos_partidos values(?, ?, 1), (?, ?, 2)',
                [partido.local, partidoId, partido.visita, partidoId], (err1, result1) =>{
                if(err1){
                    log.error("fallo al insertar localias de partido error:", err1);
                    connection.rollback(function(){});
                    callback(-1, err);
                    return;
                }
                connection.commit(function(err2) {
                    if(err2){
                        log.error("fallo al hacer commit en insercion de partidos error:", err1);
                        connection.rollback(function(){});
                        callback(-1, err2);
                        return;
                    }
                    callback(partidoId, "");
                });
            });
        });
    });
}

exports.addOrUpdatePlayerInGame = function(partido, jugador, callback){
    exports.getPlayerInGame(partido, jugador.jugadores_matricula, function(error, result){
        if(error){
            callback(error, result);
        }
        else if(result.length > 0){
            log.debug("update jugador_partido set titularidad_tipo=? where partidos_id=? and jugadores_matricula=?",jugador.titularidad, partido, jugador.jugadores_matricula );
            connection.query("update jugador_partido set titularidad_tipo=? where partidos_id=? and jugadores_matricula=?", [jugador.titularidad, partido, jugador.jugadores_matricula], callback);
        }
        else{
            log.debug("insert into jugador_partido values (default, ?, ?, ?)", jugador.jugadores_matricula, partido, jugador.titularidad);
            connection.query("insert into jugador_partido values (default, ?, ?, ?)", [jugador.jugadores_matricula, partido, jugador.titularidad], callback);
        }
    });
};

exports.getPlayerInGame = function(partido, jugador, callback){
    log.debug("getPlayerInGame", "select * from jugador_partido where partidos_id=? and jugadores_matricula=?",partido, jugador);
    connection.query("select * from jugador_partido where partidos_id=? and jugadores_matricula=?", [partido, jugador], callback);
}

exports.addGoal = function (partido, gol, callback) {
    exports.getPlayerInGame(partido, gol.jugadores_matricula, function(error, result){
        if(error || result.length <= 0){
            log.debug("no se agregara el gol");
            callback(error, result);
        }
        else{
            let jugador_partido_id = result[0].jugador_partido_id;
            connection.query("insert into goles values (default, ?, ?, default)", [jugador_partido_id, gol.minuto], callback);
        }
    });
};

exports.addCard = function (partido, tarjeta, callback) {
    exports.getPlayerInGame(partido, tarjeta.jugadores_matricula, function(error, result){
        if(error || result.length <= 0){
            callback(error, result);
        }
        else{
            let jugador_partido_id = result[0].jugador_partido_id;
            log.debug("insert into sanciones values (default, ?, ?, ?, ?, default)", tarjeta.tipo, jugador_partido_id, tarjeta.minuto, tarjeta.duracion);
            connection.query("insert into sanciones values (default, ?, ?, ?, ?, default)", [tarjeta.tipo, jugador_partido_id, tarjeta.minuto, tarjeta.duracion], callback);
        }
    });
};

exports.getCard = function(tarjeta, callback){
    connection.query("select * from sanciones_jugador_view where sanciones_id=?", [tarjeta], callback);
};

exports.addSubstitution = function(partido, sustitucion, callback){
    exports.getPlayerInGame(partido, sustitucion.entra_matricula, function(error, result) {
        if(error || result.length <= 0){
            callback(error, result);
        }
        else{
            exports.getPlayerInGame(partido, sustitucion.sale_matricula, function(error1, result1) {
                if(error1 || result1.length <= 0){
                    callback(error1, result1);
                }
                else{
                    let entra = result[0].jugador_partido_id;
                    let sale = result1[0].jugador_partido_id;
                    connection.query("insert into sustituciones values (default, ?, ?, ?)", [entra, sale, sustitucion.minuto], callback);
                }
            });

        }
    });
};

exports.removeCard = function(partido, tarjeta, callback){
    connection.query("delete from sanciones where sanciones_id=?", [tarjeta], callback);
};

exports.removeSubstitution = function(partido, sustitucion, callback){
    connection.query("delete from sustituciones where sustituciones_id=?", [sustitucion], callback);
};

exports.removeGoal = function(partido, gol, callback){
    connection.query("delete from goles where goles_id=?", [gol], callback);
};

exports.getGoal = function(gol, callback){
    connection.query("select * from goles_jugador_view where goles_id=?", [gol], callback);
};

exports.getTeamPlayersInGame = function(equipo, partido, callback){
    connection.query("select * from plantel_partido_view where partidos_id=? and equipos_nombre=?", [partido, equipo], callback);
};