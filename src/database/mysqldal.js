const dbConnection = require('../config/dbConnection');

connection = dbConnection();


exports.getTournies = function (callback) {
    connection.query("SELECT * FROM torneos WHERE fechaTermino >= CURDATE()", function(err, res){
        if(!err){
            console.log("no err");
        }
        callback(err, res);
    });
};

exports.getStandings = function (tournyId, callback) {
    connection.query(
       "select * from tablas_view where torneos_id=? order by puntos desc;", [tournyId], callback);
};

exports.getMatches = function (tournyId, callback) {
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

exports.getTeams = function(callback){
    connection.query('SELECT * FROM equipos;', callback);
};

exports.getGameData = function(callback){
    connection.query
}

exports.getGoalScorers = function(tournyId, callback){
    connection.query(
        "select jugadores_matricula, nombre, carrera, equipos_nombre,\
        goles from jugadores_torneo_view where jugadores_torneo_view.torneos_id = ?\
        and goles > 0 order by goles desc;", [tournyId], callback);
};

exports.addTeam = function (nombre, facultad, callback) {
    connection.query('INSERT INTO equipos values(?,?);',[nombre, facultad], callback);

};

exports.getTeamPlayersInTourny = function(tournyId, equipo, callback) {
    connection.query('select * from jugadores_torneo_view where torneos_id=? and equipos_nombre=?;', [tournyId, equipo], callback);
};