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
        "SELECT * FROM partidos_view where torneos_id=? order by fecha asc", [tournyId], callback);
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

exports.getGameInfo = function (partido, callback) {
    connection.query("select * from( " +
        "select partidos_id, nombre, jugadores_matricula, equipos_nombre, minuto, 'gol' as evento " +
        "from goles_jugador_view as T1 " +
        "union select " +
        "partidos_id, nombre, jugadores_matricula, equipos_nombre, minuto, IF(tarjetas_id = 1, 'amarilla', 'roja') as evento " +
        "from sanciones_jugador_view as T2) as T3 " +
        "where partidos_id=? order by minuto;", [partido], callback);
};

exports.agregarPartido = function(torneo, partido, callback){
    connection.beginTransaction(transactionErr => {
        connection.query('INSERT into partidos values(default, ?, ?)', [torneo, partido.fecha], function (err, result) {
            if (err) {
                connection.rollback(function(){});
                log.error("fallo al insertar partido", JSON.stringify(partido), "error:", err)
                callback(err);
                return;
            }
            let partidoId = result.insertId;
            connection.query('insert into equipos_partidos values(?, ?, 1), (?, ?, 2)',
                [partido.local, partidoId, partido.visita, partidoId], (err1, result1) =>{
                if(err1){
                    log.error("fallo al insertar localias de partido error:", err1);
                    connection.rollback(function(){});
                    callback(err);
                    return;
                }
                connection.commit(function(err2) {
                    if(err2){
                        log.error("fallo al hacer commit en insercion de partidos error:", err1);
                        connection.rollback(function(){});
                        callback(err2);
                        return;
                    }
                    callback("ok");
                });
            });
        });
    });
}