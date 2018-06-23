const dbConnection = require('../config/dbConnection');

connection = dbConnection();


exports.getTournies = function (callback) {
    connection.query("SELECT * FROM torneos;", function (err, res) {
        if (!err) {
            console.log("no err");
        }
        callback(err, res);
    });
};

exports.getStandings = function (tournyId, callback) {
    connection.query(
        "select * from tablas_view where torneos_id=? order by puntos desc;", [tournyId], callback);
};

exports.getGames = function (tournyId, callback) {
    connection.query(
        "SELECT * FROM partidos_view where torneos_id=?", [tournyId], callback);
};

exports.getTeamsInTourny = function (tournyId, callback) {
    connection.query(
        "select " +
        "equipos_torneos.equipos_nombre" +
        "from equipos_torneos" +
        "where equipos_torneos.torneos_id = ?;", [tournyId], callback);
};

exports.getTeams = function (callback) {
    connection.query('SELECT * FROM equipos;', callback);
};

exports.getGoalScorers = function (tournyId, callback) {
    connection.query(
        "select * from goles_view where torneos_id = ? and goles > 0 order by goles desc;", [tournyId], callback);
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