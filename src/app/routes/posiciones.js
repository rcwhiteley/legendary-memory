const dbConnection = require('../../config/dbConnection');
const db = require('../../database/mysqldal');
const log = require('../../config/logger');

function validarPartido(partido, callback){
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

module.exports = app => {

    /*app.get('/:pagina', (req,res)=> {

    });*/

    app.get('/agregarequipo',(req, res) => {
        db.getTeams((err, result) => {
            //console.log(result);
            res.render('dinamico/agregarequipo', {
                equipos: result
            });
        });
    });

    app.get('/tablaposiciones', (req,res) =>{
        db.getStandings(1, (err, result) => {
            //console.log(result);
            res.render('dinamico/tabladeposiciones', {
                tabla: result
            });
        });
    });
    app.post('/agregarequipo', (req, res) =>{
        db.addTeam(req.body.title, req.body.equipos, (err, result) => {
            res.redirect('/agregarequipo');
        });
    });

    app.get('/partidos', (req, res)=>{
       db.getGames(1, (err, result)=>{
           db.getTeamsInTourny(1, (err1, result1)=>{
                log.debug(result1);
                res.render('dinamico/partidos', {
                    partidos: result,
                    equipos : result1
                });
          });
       });
    });

    app.get('/editarpartido/:game', (req,res)=>{
        db.getGame(req.params.game, (err, result)=>{
            log.debug(JSON.stringify(result));
            db.getGameTeams(req.params.game, (err1, result1)=> {
                db.getGameSantions(req.params.game, (err2, result2)=> {
                    db.getGameGoals(req.params.game, (err3, result3)=>{
                        db.getGameSubs(req.params.game, (err4, result4)=>{
                            console.log("ahhhh", result[0]);
                            res.render('dinamico/editarpartido',
                                {
                                    partido: result[0],
                                    jugadores: result1,
                                    tarjetas: result2,
                                    goles: result3,
                                    sustituciones: result4
                                });
                        });
                    });
                });
            });
        });

    });
    app.post('/agregarpartido', (req, res)=>{
        console.log(req.body);
        validarPartido(req.body, (valid) => {
            //console.log(valid);
            if(valid === true){
                db.agregarPartido(1, req.body, result=>{
                    if(result === "ok") {
                        res.redirect("/partidos");
                    }
                    else{
                        res.send("no se pudo agregar el partido");
                    }
                });
            }
            else if(valid === false)
                res.send("los datos del partido no son validos");
            else
                res.send("ocurrio un error inesperado " + validado);
        });
    });

};