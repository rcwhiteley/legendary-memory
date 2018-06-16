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
        "SELECT partidos.id, partidos.equipoLocal_nombre, partidos.equipoVisita_nombre, partidos.fecha, partidos.marcadorLocal, \
            partidos.marcadorVisita \
            FROM partidos INNER JOIN torneos \
            ON torneos.id=partidos.torneos_id \
            WHERE torneos.id = ?;", [tournyId], callback);
};

exports.getTeamsInTourny = function (tournyId, callback) {
    connection.query(
        "select torneo_equipo.equipos_nombre\
            from torneo_equipo\
            INNER JOIN torneos\
            ON torneos.id=torneo_equipo.torneos_id\
            WHERE torneos.id=?;", [tournyId], callback);
};

exports.getTeams = function (callback) {
    connection.query('SELECT * FROM equipos;', callback);
};

exports.getGoalScorers = function (tournyId, callback) {
    connection.query(
        "select jugadores_matricula, nombre, carrera, equipos_nombre,\
        goles from jugadores_torneo_view where jugadores_torneo_view.torneos_id = ?\
        and goles > 0 order by goles desc;", [tournyId], callback);
};

exports.addTeam = function (nombre, facultad, callback) {
    connection.query('INSERT INTO equipos values(?,?);', [nombre, facultad], callback);

};

exports.getTeamPlayersInTourny = function (tournyId, equipo, callback) {
    connection.query('select * from jugadores_torneo_view where torneos_id=? and equipos_nombre=?;', [tournyId, equipo], callback);
};

exports.getGameInfo = function (partido, callback) {
    connection.query("select * from(\
select partidos_id, nombre, matricula, equipos_nombre, torneos_id, minuto, 'gol' as evento\
from goles_view as T1\
union select \
partidos_id, jugadores_nombre, matricula, equipos_nombre, torneos_id, minuto, IF(tarjetas_id = 1, 'amarilla', 'roja') as evento\
from sanciones_view as T2) as T3\
where partidos_id = ? order by minuto;", [partido], callback);
};